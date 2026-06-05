# Tests du module biens: parsing ETL, scraping et exposition API.
from decimal import Decimal
from http.client import IncompleteRead

from django.test import SimpleTestCase, TestCase
from django.utils import timezone

from apps.properties.etl.scrapers import (
    AvitoScraper,
    BaseMarketScraper,
    MubawabScraper,
    ScrapedListing,
    parse_price,
)
from apps.properties.models import MarketListing


class MarketListingParserTests(SimpleTestCase):
    # Verifie les helpers de parsing et le comportement general des scrapers.
    # Cette suite couvre surtout les details critiques d'extraction de donnees.
    def test_sale_price_parser_ignores_credit_monthly_payment(self):
        price, _, period = parse_price("1 250 000 DH 6 947 DH / mois", "sale")

        self.assertEqual(price, Decimal("1250000.00"))
        self.assertEqual(period, "")

        price, _, period = parse_price("6 947 DH / mois", "sale")

        self.assertIsNone(price)
        self.assertEqual(period, "")

    def test_parse_mubawab_listing_detail(self):
        html = """
        <html>
          <head>
            <meta property="og:description" content="Appartement bien place de 77 m2." />
            <meta property="og:image" content="https://images.example.com/mubawab-main.jpg" />
          </head>
          <body>
            <h1>A vendre appartement de 77m2 Maarif Extension</h1>
            <div>850 000 DH</div>
            <div>Maarif Extension, Casablanca</div>
            <div>77 m2</div>
            <div>3 Pieces</div>
            <div>2 Chambres</div>
            <div>1 Salle de bain</div>
            <img src="https://images.example.com/mubawab-secondary.jpg" />
          </body>
        </html>
        """

        listing = MubawabScraper().parse_listing(
            html,
            "https://www.mubawab.ma/fr/a/123456/appartement-a-vendre",
        )

        self.assertEqual(listing.source, "mubawab")
        self.assertEqual(listing.source_id, "123456")
        self.assertEqual(listing.transaction_type, "sale")
        self.assertEqual(listing.asset_type, "apartment")
        self.assertEqual(listing.city, "Casablanca")
        self.assertEqual(listing.district, "Maarif Extension")
        self.assertEqual(listing.price, Decimal("850000.00"))
        self.assertEqual(listing.area_sqm, Decimal("77.00"))
        self.assertEqual(listing.bedrooms, 2)
        self.assertEqual(listing.bathrooms, 1)
        self.assertEqual(
            listing.raw_payload["images"][:2],
            [
                "https://images.example.com/mubawab-main.jpg",
                "https://images.example.com/mubawab-secondary.jpg",
            ],
        )

    def test_parse_avito_listing_detail(self):
        html = """
        <html>
          <body>
            <h1>Villa a louer a Souissi</h1>
            <div>Villas et Riads dans Rabat, Souissi</div>
            <div>4 chambres 3 sdbs 400 m2</div>
            <div>30 000 DH</div>
            <div>il y a 3 heures</div>
          </body>
        </html>
        """

        listing = AvitoScraper().parse_listing(
            html,
            "https://www.avito.ma/fr/rabat/villas_et_riads/Villa_a_louer_12345678.htm",
        )

        self.assertEqual(listing.source, "avito")
        self.assertEqual(listing.source_id, "12345678")
        self.assertEqual(listing.transaction_type, "rent")
        self.assertEqual(listing.asset_type, "villa")
        self.assertEqual(listing.city, "Rabat")
        self.assertEqual(listing.district, "Souissi")
        self.assertEqual(listing.price, Decimal("30000.00"))
        self.assertEqual(listing.price_period, "month")
        self.assertEqual(listing.area_sqm, Decimal("400.00"))
        self.assertEqual(listing.bedrooms, 4)
        self.assertEqual(listing.bathrooms, 3)

    def test_scrape_records_incomplete_read_without_crashing_cycle(self):
        def broken_fetcher(url, timeout, user_agent):
            raise IncompleteRead(b"partial")

        scraper = AvitoScraper(fetcher=broken_fetcher)

        listings = list(scraper.scrape(pages=1, limit=1, sleep_seconds=0))

        self.assertEqual(listings, [])
        self.assertEqual(len(scraper.errors), 1)
        self.assertIn("unable to fetch", scraper.errors[0])

    def test_incremental_scrape_skips_known_urls_before_fetching_detail(self):
        detail_fetches = []

        def fetcher(url, timeout, user_agent):
            if url == "https://example.com/index":
                return "<html></html>"
            detail_fetches.append(url)
            return "<h1>New listing</h1>"

        scraper = IncrementalTestScraper(fetcher=fetcher)

        listings = list(
            scraper.scrape(
                pages=1,
                known_urls={"https://example.com/known"},
                stop_after_known=3,
                sleep_seconds=0,
            )
        )

        self.assertEqual(len(listings), 1)
        self.assertEqual(listings[0].url, "https://example.com/new")
        self.assertEqual(detail_fetches, ["https://example.com/new"])
        self.assertEqual(scraper.skipped_known_urls, 1)


class IncrementalTestScraper(BaseMarketScraper):
    # Fournit un scraper minimaliste dedie aux tests du mode incremental.
    # Il permet de simuler des URLs connues et nouvelles sans dependre du reseau.
    source = "test"
    default_url = "https://example.com/index"

    def extract_listing_urls(self, html: str, base_url: str) -> list[tuple[str, str]]:
        # Retourne un jeu fixe d'URLs pour maitriser totalement le scenario de test.
        # Une URL est connue d'avance et l'autre doit etre effectivement traitee.
        return [
            ("https://example.com/known", "Known listing"),
            ("https://example.com/new", "New listing"),
        ]

    def parse_listing(self, html: str, url: str, title_hint: str = "") -> ScrapedListing:
        # Retourne une annonce minimale suffisante pour le test incremental.
        # Le parser est volontairement simple car le scenario cible le flux de controle.
        return ScrapedListing(source=self.source, url=url, title=title_hint)


class MarketListingApiTests(TestCase):
    # Verifie le format et les filtres exposes par l'API des annonces de marche.
    # Les tests protegent notamment la pagination et les champs derives image/prix.
    def setUp(self):
        # Prepare un jeu d'annonces en base pour les scenarios API de cette suite.
        # Les differents tests peuvent ensuite interroger l'endpoint sans doublonner les seeds.
        now = timezone.now()
        for index in range(3):
            MarketListing.objects.create(
                source=MarketListing.Source.AVITO,
                source_id=str(index + 1),
                external_url=f"https://example.com/listing-{index + 1}",
                title=f"Listing {index + 1}",
                description="Annonce de test",
                asset_type=MarketListing.AssetType.APARTMENT,
                transaction_type=MarketListing.TransactionType.SALE,
                city="Casablanca",
                district="Maarif",
                price=Decimal("1000000.00") + Decimal(index * 100000),
                area_sqm=Decimal("100.00"),
                bedrooms=3,
                bathrooms=2,
                scraped_at=now,
                last_seen_at=now,
                raw_payload={"images": [f"https://images.example.com/{index + 1}.jpg"]},
            )

    def test_market_listings_limit_keeps_array_shape(self):
        response = self.client.get("/api/market-listings/?limit=2")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIsInstance(payload, list)
        self.assertEqual(len(payload), 2)
        self.assertNotIn("raw_payload", payload[0])
        self.assertNotIn("description", payload[0])

    def test_market_listings_page_returns_paginated_payload(self):
        response = self.client.get("/api/market-listings/?page=2&page_size=1")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["count"], 3)
        self.assertEqual(payload["page"], 2)
        self.assertEqual(payload["page_size"], 1)
        self.assertEqual(payload["previous_page"], 1)
        self.assertEqual(payload["next_page"], 3)
        self.assertEqual(len(payload["results"]), 1)
        self.assertNotIn("raw_payload", payload["results"][0])
        self.assertNotIn("description", payload["results"][0])

    def test_market_listings_api_returns_all_stored_images(self):
        listing = MarketListing.objects.create(
            source=MarketListing.Source.MUBAWAB,
            source_id="images-88",
            external_url="https://example.com/listing-images-88",
            title="Annonce avec galerie complète",
            description="Annonce multi-images",
            asset_type=MarketListing.AssetType.APARTMENT,
            transaction_type=MarketListing.TransactionType.SALE,
            city="Rabat",
            district="Agdal",
            price=Decimal("2100000.00"),
            area_sqm=Decimal("145.00"),
            scraped_at=timezone.now(),
            last_seen_at=timezone.now(),
            raw_payload={
                "images": [
                    "https://images.example.com/gallery-1.jpg",
                    "https://images.example.com/gallery-2.jpg",
                    "https://images.example.com/gallery-3.jpg",
                ]
            },
        )

        response = self.client.get(f"/api/market-listings/?limit=10&source_id={listing.source_id}")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        created_listing = next(item for item in payload if item["source_id"] == listing.source_id)
        self.assertEqual(
            created_listing["image_urls"],
            [
                "https://images.example.com/gallery-1.jpg",
                "https://images.example.com/gallery-2.jpg",
                "https://images.example.com/gallery-3.jpg",
            ],
        )
        self.assertEqual(created_listing["primary_image_url"], "https://images.example.com/gallery-1.jpg")

    def test_market_listing_filters_endpoint_returns_choice_lists(self):
        now = timezone.now()
        MarketListing.objects.create(
            source=MarketListing.Source.MUBAWAB,
            source_id="44",
            external_url="https://example.com/listing-44",
            title="Villa Souissi",
            description="Annonce Rabat",
            asset_type=MarketListing.AssetType.VILLA,
            transaction_type=MarketListing.TransactionType.RENT,
            city="Rabat",
            district="Souissi",
            price=Decimal("30000.00"),
            area_sqm=Decimal("320.00"),
            scraped_at=now,
            last_seen_at=now,
            raw_payload={"images": ["https://images.example.com/44.jpg"]},
        )

        response = self.client.get("/api/market-listings/filters/?source=avito&transaction_type=sale")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["cities"], [{"count": 3, "label": "Casablanca", "value": "Casablanca"}])
        self.assertEqual(payload["districts"], [{"count": 3, "label": "Maarif", "value": "Maarif"}])
        self.assertEqual(
            payload["bedroom_choices"],
            [{"count": 3, "label": "3 chambres", "value": "3"}],
        )
        self.assertEqual(
            payload["bathroom_choices"],
            [{"count": 3, "label": "2 salles de bain", "value": "2"}],
        )
        self.assertIn(
            {"count": 3, "label": "Type • Appartement", "value": "asset_type:apartment"},
            payload["search_choices"],
        )
        self.assertIn(
            {"count": 3, "label": "Quartier • Maarif", "value": "q:Maarif"},
            payload["search_choices"],
        )
