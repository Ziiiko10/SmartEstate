from decimal import Decimal

from django.test import SimpleTestCase

from apps.properties.etl.scrapers import AvitoScraper, MubawabScraper, parse_price


class MarketListingParserTests(SimpleTestCase):
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
          </head>
          <body>
            <h1>A vendre appartement de 77m2 Maarif Extension</h1>
            <div>850 000 DH</div>
            <div>Maarif Extension, Casablanca</div>
            <div>77 m2</div>
            <div>3 Pieces</div>
            <div>2 Chambres</div>
            <div>1 Salle de bain</div>
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
