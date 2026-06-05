from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase, override_settings
from django.utils import timezone

from apps.intelligence.ml.algorithms import (
    collect_training_rows,
    estimate_from_comparables,
    estimate_with_hedonic_regression,
    estimate_with_ml_models,
    score_investment_opportunity,
    simulate_investment_scenario,
)
from apps.intelligence.models import Valuation
from apps.intelligence.views import DashboardOverviewView
from apps.organizations.models import Organization
from apps.organizations.models import Membership
from apps.properties.models import MarketListing


class BaselineMLAlgorithmTests(SimpleTestCase):
    def test_estimate_from_comparables_uses_weighted_market_price(self):
        listings = [
            self._listing(1, "Casablanca", "Maarif", Decimal("900000"), Decimal("90")),
            self._listing(2, "Casablanca", "Maarif", Decimal("1000000"), Decimal("100")),
            self._listing(3, "Casablanca", "Gauthier", Decimal("1100000"), Decimal("100")),
            self._listing(4, "Rabat", "Agdal", Decimal("2000000"), Decimal("100")),
        ]
        subject = {
            "city": "Casablanca",
            "district": "Maarif",
            "asset_type": "apartment",
            "area_sqm": Decimal("100"),
            "bedrooms": 2,
            "bathrooms": 1,
        }

        result = estimate_from_comparables(subject, listings, transaction_type="sale")

        self.assertEqual(result["status"], "ok")
        self.assertGreater(result["estimated_value"], Decimal("950000"))
        self.assertLess(result["estimated_value"], Decimal("1100000"))
        self.assertEqual(result["sample_size"], 3)

    def test_score_investment_opportunity_returns_signal(self):
        subject = {
            "asking_price": Decimal("900000"),
            "monthly_rent": Decimal("6500"),
        }
        sale_estimate = {
            "estimated_value": Decimal("1000000"),
            "confidence_score": Decimal("80"),
        }

        result = score_investment_opportunity(subject, sale_estimate)

        self.assertEqual(result["status"], "ok")
        self.assertIn(result["signal"], ["strong_buy", "watchlist", "neutral", "avoid"])
        self.assertGreater(result["gross_yield_percent"], Decimal("8"))

    def test_ml_ensemble_combines_comparable_and_regression_models(self):
        listings = []
        for index in range(18):
            listings.append(
                self._listing(
                    index + 1,
                    "Casablanca",
                    "Maarif" if index < 12 else "Gauthier",
                    Decimal("900000") + Decimal(index * 35000),
                    Decimal("85") + Decimal(index % 6),
                )
            )
        subject = {
            "city": "Casablanca",
            "district": "Maarif",
            "asset_type": "apartment",
            "area_sqm": Decimal("92"),
            "bedrooms": 2,
            "bathrooms": 1,
        }

        result = estimate_with_ml_models(subject, listings, transaction_type="sale")

        self.assertEqual(result["method"], "ml_ensemble_v1")
        self.assertEqual(result["status"], "ok")
        self.assertGreater(result["estimated_value"], Decimal("0"))
        self.assertGreaterEqual(result["training_rows"], 8)
        self.assertEqual(len(result["models"]), 3)

    def test_hedonic_regression_prioritizes_local_training_rows(self):
        listings = []
        for index in range(14):
            listings.append(
                self._listing(
                    index + 1,
                    "Casablanca",
                    "Maarif",
                    Decimal("980000") + Decimal(index * 12000),
                    Decimal("100"),
                )
            )
        for index in range(24):
            listings.append(
                self._listing(
                    index + 100,
                    "Rabat",
                    "Agdal",
                    Decimal("2400000") + Decimal(index * 25000),
                    Decimal("100"),
                )
            )

        subject = {
            "city": "Casablanca",
            "district": "Maarif",
            "asset_type": "apartment",
            "area_sqm": Decimal("100"),
            "bedrooms": 2,
            "bathrooms": 1,
        }

        training_rows = collect_training_rows(listings, transaction_type="sale")
        result = estimate_with_hedonic_regression(subject, training_rows)

        self.assertEqual(result["status"], "ok")
        self.assertGreaterEqual(result["local_training_rows"], 10)
        self.assertLess(result["estimated_value"], Decimal("1250000"))
        self.assertGreater(result["estimated_value"], Decimal("900000"))

    def test_comparable_model_discards_far_area_and_type_candidates(self):
        listings = [
            self._listing(1, "Casablanca", "Maarif", Decimal("980000"), Decimal("98")),
            self._listing(2, "Casablanca", "Maarif", Decimal("1020000"), Decimal("102")),
            self._listing(3, "Casablanca", "Gauthier", Decimal("1100000"), Decimal("100")),
            self._listing(4, "Casablanca", "Maarif", Decimal("4000000"), Decimal("450"), asset_type="villa"),
            self._listing(5, "Casablanca", "Maarif", Decimal("3500000"), Decimal("420"), asset_type="apartment"),
        ]
        subject = {
            "city": "Casablanca",
            "district": "Maarif",
            "asset_type": "apartment",
            "area_sqm": Decimal("100"),
            "bedrooms": 2,
            "bathrooms": 1,
        }

        result = estimate_from_comparables(subject, listings, transaction_type="sale")

        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["sample_size"], 3)
        self.assertLess(result["estimated_value"], Decimal("1200000"))

    def test_simulate_investment_scenario_returns_core_metrics(self):
        result = simulate_investment_scenario(
            {
                "purchase_price": Decimal("1000000"),
                "down_payment": Decimal("250000"),
                "monthly_rent": Decimal("7000"),
                "loan_rate": Decimal("4"),
                "loan_years": 20,
                "renovation_budget": Decimal("50000"),
                "holding_period_years": 10,
            }
        )

        self.assertGreater(result["monthly_debt_service"], Decimal("0"))
        self.assertIn("projected_irr", result)
        self.assertIn("projected_exit_value", result)

    def _listing(self, pk, city, district, price, area, asset_type="apartment"):
        now = timezone.now()
        return SimpleNamespace(
            id=pk,
            title=f"Comparable {pk}",
            source="test",
            external_url=f"https://example.com/{pk}",
            asset_type=asset_type,
            transaction_type="sale",
            city=city,
            district=district,
            price=price,
            area_sqm=area,
            bedrooms=2,
            bathrooms=1,
            last_seen_at=now,
        )


@override_settings(PUBLIC_DEMO_ACCESS=True)
class MarketValuationApiTests(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name="SmartEstate Demo Org")
        now = timezone.now()

        for index in range(18):
            MarketListing.objects.create(
                source=MarketListing.Source.MUBAWAB if index % 2 else MarketListing.Source.AVITO,
                source_id=f"valuation-{index + 1}",
                external_url=f"https://example.com/valuation-{index + 1}",
                title=f"Comparable {index + 1}",
                description="Annonce comparable pour valuation",
                asset_type=MarketListing.AssetType.APARTMENT,
                transaction_type=MarketListing.TransactionType.SALE,
                city="Agadir" if index < 12 else "Casablanca",
                district="Centre Ville" if index < 12 else "Maarif",
                price=Decimal("1200000.00") + Decimal(index * 45000),
                area_sqm=Decimal("82.00") + Decimal(index % 4),
                bedrooms=2,
                bathrooms=1,
                scraped_at=now,
                last_seen_at=now,
                raw_payload={
                    "images": [
                        f"https://images.example.com/valuation-{index + 1}-1.jpg",
                        f"https://images.example.com/valuation-{index + 1}-2.jpg",
                    ]
                },
            )

    def test_save_valuation_serializes_models_payload(self):
        response = self.client.post(
            "/api/ml/valuation/",
            data={
                "area_sqm": "76",
                "asset_type": "apartment",
                "bathrooms": 1,
                "bedrooms": 2,
                "city": "Agadir",
                "district": "Centre Ville",
                "save_valuation": True,
                "title": "Estimation IA Agadir",
                "transaction_type": "sale",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIsNotNone(payload["saved_valuation_id"])

        valuation = Valuation.objects.get(id=payload["saved_valuation_id"])
        self.assertEqual(valuation.organization, self.organization)
        self.assertEqual(valuation.title, "Estimation IA Agadir")
        self.assertEqual(valuation.input_payload["features"]["city"], "Agadir")
        self.assertIsInstance(valuation.input_payload["models"], list)
        self.assertGreater(len(valuation.input_payload["models"]), 0)
        self.assertIsInstance(valuation.input_payload["models"][0]["estimated_value"], float)


@override_settings(PUBLIC_DEMO_ACCESS=False)
class DashboardOverviewApiTests(TestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.agent = self.user_model.objects.create_user(
            email="dashboard-agent@example.com",
            full_name="Dashboard Agent",
            phone_number="+212600009998",
            password="motdepasse123",
            role=self.user_model.Role.AGENT_IMMOBILIER,
        )
        self.organization = Organization.objects.create(name="Dashboard Agency", city="Casablanca")
        Membership.objects.create(
            organization=self.organization,
            user=self.agent,
            role=Membership.Role.MANAGER,
            is_primary=True,
        )
        self.client.force_login(self.agent)

    def test_dashboard_overview_skips_heavy_opportunities_by_default(self):
        with patch.object(DashboardOverviewView, "_build_market_opportunities") as mocked_builder:
            response = self.client.get("/api/dashboard/overview/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["opportunities"], [])
        mocked_builder.assert_not_called()

    def test_dashboard_overview_can_include_opportunities_on_demand(self):
        with patch.object(
            DashboardOverviewView,
            "_build_market_opportunities",
            return_value=[{"id": 1, "title": "Test Opportunity"}],
        ) as mocked_builder:
            response = self.client.get("/api/dashboard/overview/?include_opportunities=1")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["opportunities"], [{"id": 1, "title": "Test Opportunity"}])
        mocked_builder.assert_called_once()
