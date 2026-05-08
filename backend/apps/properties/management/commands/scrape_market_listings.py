import time

from django.core.management.base import BaseCommand, CommandError

from apps.properties.etl.pipeline import run_market_scrape
from apps.properties.etl.scrapers import AVITO_DEFAULT_URL, MUBAWAB_DEFAULT_URL


class Command(BaseCommand):
    help = "Scrape les annonces immobilieres Avito et Mubawab puis les charge en base."

    def add_arguments(self, parser):
        parser.add_argument(
            "--source",
            choices=["all", "avito", "mubawab"],
            default="all",
            help="Source a scraper.",
        )
        parser.add_argument("--pages", type=int, default=1, help="Nombre de pages a parcourir par source.")
        parser.add_argument("--limit", type=int, default=None, help="Nombre maximum d'annonces detaillees.")
        parser.add_argument("--sleep", type=float, default=1.0, help="Pause en secondes entre deux annonces.")
        parser.add_argument("--timeout", type=int, default=20, help="Timeout HTTP en secondes.")
        parser.add_argument("--city", default="", help="Filtre post-scraping sur la ville.")
        parser.add_argument(
            "--transaction-type",
            choices=["all", "sale", "rent", "vacation"],
            default="all",
            help="Filtre post-scraping sur le type de transaction.",
        )
        parser.add_argument("--avito-url", default=AVITO_DEFAULT_URL, help="URL de depart Avito.")
        parser.add_argument("--mubawab-url", default=MUBAWAB_DEFAULT_URL, help="URL de depart Mubawab.")
        parser.add_argument("--dry-run", action="store_true", help="Extrait sans ecrire en base.")
        parser.add_argument(
            "--new-only",
            action="store_true",
            help="Importe uniquement les annonces dont l'URL n'existe pas encore en base.",
        )
        parser.add_argument(
            "--stop-after-existing",
            type=int,
            default=30,
            help="Arrete une source apres ce nombre d'annonces deja connues consecutives en mode --new-only.",
        )
        parser.add_argument("--loop", action="store_true", help="Relance l'ETL en continu.")
        parser.add_argument(
            "--interval",
            type=int,
            default=1800,
            help="Intervalle en secondes entre deux cycles quand --loop est actif.",
        )

    def handle(self, *args, **options):
        if options["pages"] < 1:
            raise CommandError("--pages doit etre superieur ou egal a 1.")
        if options["limit"] is not None and options["limit"] < 1:
            raise CommandError("--limit doit etre superieur ou egal a 1.")
        if options["sleep"] < 0:
            raise CommandError("--sleep doit etre positif.")
        if options["interval"] < 60:
            raise CommandError("--interval doit etre superieur ou egal a 60 secondes.")
        if options["stop_after_existing"] < 1:
            raise CommandError("--stop-after-existing doit etre superieur ou egal a 1.")

        while True:
            stats = run_market_scrape(
                source=options["source"],
                pages=options["pages"],
                limit=options["limit"],
                sleep_seconds=options["sleep"],
                timeout=options["timeout"],
                dry_run=options["dry_run"],
                city=options["city"],
                transaction_type=options["transaction_type"],
                new_only=options["new_only"],
                stop_after_existing=options["stop_after_existing"],
                avito_url=options["avito_url"],
                mubawab_url=options["mubawab_url"],
            )

            mode = "dry-run" if options["dry_run"] else "import"
            scope = "nouvelles annonces" if options["new_only"] else "toutes annonces scannees"
            self.stdout.write(
                self.style.SUCCESS(
                    f"ETL marche immobilier termine ({mode}, {scope}) : "
                    f"{stats.extracted} extraites, {stats.created} creees, "
                    f"{stats.updated} mises a jour, {stats.existing} deja connues, "
                    f"{stats.skipped} ignorees, "
                    f"{stats.errors} erreurs."
                )
            )

            if not options["loop"]:
                break

            self.stdout.write(f"Prochain cycle ETL dans {options['interval']} secondes.")
            time.sleep(options["interval"])
