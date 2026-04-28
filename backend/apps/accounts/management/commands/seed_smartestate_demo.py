from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from rest_framework.authtoken.models import Token

from apps.intelligence.models import Recommendation, Report, Scenario, Valuation
from apps.organizations.models import Membership, Organization
from apps.portfolios.models import Portfolio, PortfolioHolding
from apps.properties.models import PropertyAsset


class Command(BaseCommand):
    help = "Cree un jeu de donnees SmartEstate de demonstration."

    def handle(self, *args, **options):
        User = get_user_model()

        organization, _ = Organization.objects.get_or_create(
            slug="smartestate-morocco",
            defaults={
                "name": "SmartEstate Morocco",
                "city": "Casablanca",
                "country": "Morocco",
                "description": "Organisation demo pour la plateforme SmartEstate.",
            },
        )

        admin_user, _ = User.objects.get_or_create(
            email="yassine@smartestate.ma",
            defaults={
                "full_name": "Yassine Mansouri",
                "phone_number": "+212600000000",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("demo12345")
        admin_user.save()
        Token.objects.get_or_create(user=admin_user)

        analyst_user, _ = User.objects.get_or_create(
            email="salma@smartestate.ma",
            defaults={
                "full_name": "Salma Bennani",
                "phone_number": "+212611111111",
                "role": User.Role.ANALYST,
            },
        )
        analyst_user.set_password("demo12345")
        analyst_user.save()
        Token.objects.get_or_create(user=analyst_user)

        manager_user, _ = User.objects.get_or_create(
            email="mehdi@smartestate.ma",
            defaults={
                "full_name": "Mehdi Alaoui",
                "phone_number": "+212622222222",
                "role": User.Role.ASSET_MANAGER,
            },
        )
        manager_user.set_password("demo12345")
        manager_user.save()
        Token.objects.get_or_create(user=manager_user)

        Membership.objects.get_or_create(
            organization=organization,
            user=admin_user,
            defaults={"role": Membership.Role.OWNER, "title": "Directeur d'Investissement", "is_primary": True},
        )
        Membership.objects.get_or_create(
            organization=organization,
            user=analyst_user,
            defaults={"role": Membership.Role.ANALYST, "title": "Analyste Marche"},
        )
        Membership.objects.get_or_create(
            organization=organization,
            user=manager_user,
            defaults={"role": Membership.Role.MANAGER, "title": "Portfolio Manager"},
        )

        assets_data = [
            {
                "name": "Tour CFC Analytics",
                "asset_type": PropertyAsset.AssetType.OFFICE,
                "city": "Casablanca",
                "district": "Casablanca Finance City",
                "address": "CFC, Casablanca",
                "acquisition_price": Decimal("112000000.00"),
                "current_value": Decimal("125000000.00"),
                "monthly_rent": Decimal("780000.00"),
                "occupancy_rate": Decimal("100.00"),
                "annual_yield": Decimal("7.20"),
                "currency": "MAD",
            },
            {
                "name": "Villa Al-Majd",
                "asset_type": PropertyAsset.AssetType.VILLA,
                "city": "Marrakech",
                "district": "Hivernage",
                "address": "Hivernage, Marrakech",
                "acquisition_price": Decimal("38500000.00"),
                "current_value": Decimal("47200000.00"),
                "monthly_rent": Decimal("145000.00"),
                "occupancy_rate": Decimal("89.00"),
                "annual_yield": Decimal("6.40"),
                "currency": "MAD",
            },
            {
                "name": "Rabat Central Residences",
                "asset_type": PropertyAsset.AssetType.APARTMENT,
                "city": "Rabat",
                "district": "Agdal",
                "address": "Agdal, Rabat",
                "acquisition_price": Decimal("29800000.00"),
                "current_value": Decimal("33400000.00"),
                "monthly_rent": Decimal("92000.00"),
                "occupancy_rate": Decimal("98.00"),
                "annual_yield": Decimal("5.90"),
                "currency": "MAD",
            },
        ]

        created_assets = []
        for asset_data in assets_data:
            asset, _ = PropertyAsset.objects.get_or_create(
                organization=organization,
                name=asset_data["name"],
                defaults=asset_data,
            )
            created_assets.append(asset)

        portfolio, _ = Portfolio.objects.get_or_create(
            organization=organization,
            slug="portfolio-maroc-core",
            defaults={
                "name": "Portfolio Maroc Core",
                "strategy": "Core + Value Add",
                "benchmark_return": Decimal("6.80"),
                "target_occupancy": Decimal("94.00"),
                "currency": "MAD",
                "description": "Portefeuille principal immobilier Maroc.",
            },
        )

        holding_data = [
            (created_assets[0], Decimal("50.00"), Decimal("22000000.00")),
            (created_assets[1], Decimal("30.00"), Decimal("9000000.00")),
            (created_assets[2], Decimal("20.00"), Decimal("4500000.00")),
        ]
        for asset, allocation_share, debt_amount in holding_data:
            PortfolioHolding.objects.get_or_create(
                portfolio=portfolio,
                asset=asset,
                defaults={
                    "allocation_share": allocation_share,
                    "debt_amount": debt_amount,
                },
            )

        Scenario.objects.get_or_create(
            organization=organization,
            asset=created_assets[1],
            title="Scenario Saisonnier Marrakech",
            defaults={
                "strategy": Scenario.Strategy.SEASONAL,
                "down_payment": Decimal("1200000.00"),
                "loan_rate": Decimal("3.85"),
                "loan_years": 20,
                "renovation_budget": Decimal("450000.00"),
                "holding_period_years": 10,
                "projected_monthly_cashflow": Decimal("115000.00"),
                "projected_irr": Decimal("14.20"),
                "projected_exit_value": Decimal("56000000.00"),
                "assumptions": {"occupancy": 0.72, "adr": 2200},
            },
        )
        Scenario.objects.get_or_create(
            organization=organization,
            asset=created_assets[0],
            title="Scenario Longue Duree Casablanca",
            defaults={
                "strategy": Scenario.Strategy.LONG_TERM,
                "down_payment": Decimal("3000000.00"),
                "loan_rate": Decimal("3.10"),
                "loan_years": 18,
                "renovation_budget": Decimal("0.00"),
                "holding_period_years": 15,
                "projected_monthly_cashflow": Decimal("42000.00"),
                "projected_irr": Decimal("8.40"),
                "projected_exit_value": Decimal("138000000.00"),
                "assumptions": {"occupancy": 1.0, "rent_growth": 0.04},
            },
        )

        Valuation.objects.get_or_create(
            organization=organization,
            asset=created_assets[0],
            title="Estimation Tour CFC Analytics",
            defaults={
                "requested_by": analyst_user,
                "estimated_value": Decimal("125000000.00"),
                "low_estimate": Decimal("120000000.00"),
                "high_estimate": Decimal("129500000.00"),
                "confidence_score": Decimal("91.00"),
                "model_version": "smartestate-ml-v1",
                "input_payload": {"city": "Casablanca", "district": "CFC"},
                "summary": "Actif tertiaire prime avec occupation maximale.",
            },
        )

        Recommendation.objects.get_or_create(
            organization=organization,
            asset=created_assets[1],
            title="Optimiser la strategie saisonniere Marrakech",
            defaults={
                "description": "Repositionner l'actif sur une strategie premium courte duree pour capter un meilleur ADR.",
                "category": Recommendation.Category.OPTIMIZATION,
                "priority": Recommendation.Priority.HIGH,
                "status": Recommendation.Status.OPEN,
                "expected_roi": Decimal("14.20"),
                "confidence_score": Decimal("88.00"),
                "action_items": [
                    "Renforcer le canal direct",
                    "Automatiser la tarification haute saison",
                    "Refondre le parcours photo et annonce",
                ],
            },
        )

        Report.objects.get_or_create(
            organization=organization,
            portfolio=portfolio,
            title="Reporting Financier Q3 - Portfolio Maroc Core",
            defaults={
                "asset": created_assets[0],
                "generated_by": admin_user,
                "report_type": Report.ReportType.PORTFOLIO,
                "status": Report.Status.READY,
                "file_url": "https://example.com/reports/portfolio-maroc-core-q3.pdf",
                "summary": "Synthese trimestrielle du portefeuille avec KPIs, occupation et rendement.",
                "metadata": {"period": "Q3 2024", "currency": "MAD"},
            },
        )

        self.stdout.write(self.style.SUCCESS("Jeu de donnees SmartEstate cree avec succes."))
        self.stdout.write("Admin demo: yassine@smartestate.ma / demo12345")
