from __future__ import annotations

from dataclasses import dataclass

from django.utils import timezone

from apps.properties.etl.scrapers import (
    AVITO_DEFAULT_URL,
    MUBAWAB_DEFAULT_URL,
    AvitoScraper,
    MubawabScraper,
    ScrapedListing,
    normalize_for_match,
)
from apps.properties.models import MarketListing


@dataclass
class ImportStats:
    extracted: int = 0
    created: int = 0
    updated: int = 0
    existing: int = 0
    skipped: int = 0
    errors: int = 0


SCRAPER_CLASSES = {
    "avito": AvitoScraper,
    "mubawab": MubawabScraper,
}


def selected_sources(source: str) -> list[str]:
    if source == "all":
        return ["avito", "mubawab"]
    return [source]


def run_market_scrape(
    *,
    source: str = "all",
    pages: int = 1,
    limit: int | None = None,
    sleep_seconds: float = 1.0,
    timeout: int = 20,
    dry_run: bool = False,
    city: str = "",
    transaction_type: str = "",
    new_only: bool = False,
    stop_after_existing: int = 30,
    avito_url: str = AVITO_DEFAULT_URL,
    mubawab_url: str = MUBAWAB_DEFAULT_URL,
) -> ImportStats:
    stats = ImportStats()
    wanted_city = normalize_for_match(city)
    wanted_transaction = normalize_for_match(transaction_type)

    for source_name in selected_sources(source):
        if limit is not None and stats.extracted >= limit:
            break

        scraper_class = SCRAPER_CLASSES[source_name]
        start_url = avito_url if source_name == "avito" else mubawab_url
        scraper = scraper_class(start_url=start_url, timeout=timeout)
        remaining = None if limit is None else max(limit - stats.extracted, 0)
        before_errors = len(scraper.errors)
        before_existing = scraper.skipped_known_urls
        known_urls = set()
        if new_only:
            known_urls = set(
                MarketListing.objects.filter(source=source_name).values_list(
                    "external_url",
                    flat=True,
                )
            )

        for listing in scraper.scrape(
            pages=pages,
            limit=remaining,
            sleep_seconds=sleep_seconds,
            known_urls=known_urls,
            stop_after_known=stop_after_existing if new_only else None,
        ):
            if wanted_city and normalize_for_match(listing.city) != wanted_city:
                stats.skipped += 1
                continue
            if wanted_transaction and wanted_transaction != "all" and listing.transaction_type != wanted_transaction:
                stats.skipped += 1
                continue

            stats.extracted += 1
            if dry_run:
                continue

            created = upsert_market_listing(listing)
            if created:
                stats.created += 1
            else:
                stats.updated += 1

        stats.existing += scraper.skipped_known_urls - before_existing
        stats.errors += len(scraper.errors) - before_errors

    return stats


def upsert_market_listing(listing: ScrapedListing) -> bool:
    now = timezone.now()
    _, created = MarketListing.objects.update_or_create(
        source=listing.source,
        external_url=listing.url,
        defaults={
            "source_id": listing.source_id,
            "title": listing.title[:255],
            "description": listing.description,
            "asset_type": listing.asset_type,
            "transaction_type": listing.transaction_type,
            "city": listing.city[:120],
            "district": listing.district[:120],
            "price": listing.price,
            "currency": listing.currency or "MAD",
            "price_period": listing.price_period,
            "area_sqm": listing.area_sqm,
            "bedrooms": listing.bedrooms,
            "bathrooms": listing.bathrooms,
            "seller_name": listing.seller_name[:255],
            "published_label": listing.published_label[:120],
            "scraped_at": now,
            "last_seen_at": now,
            "raw_payload": listing.raw_payload,
        },
    )
    return created
