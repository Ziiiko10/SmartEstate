# Administration Django des portefeuilles et des positions.
from django.contrib import admin

from apps.portfolios.models import Portfolio, PortfolioHolding


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    # Configure l'affichage des portefeuilles dans l'administration Django.
    # Les colonnes retenues mettent en avant la strategie et l'organisation.
    list_display = ("name", "organization", "strategy", "benchmark_return", "target_occupancy")
    list_filter = ("organization",)
    search_fields = ("name", "organization__name", "strategy")


@admin.register(PortfolioHolding)
class PortfolioHoldingAdmin(admin.ModelAdmin):
    # Configure l'ecran admin des positions contenues dans un portefeuille.
    # Les filtres simplifient le suivi des allocations par structure.
    list_display = ("portfolio", "asset", "allocation_share", "debt_amount")
    list_filter = ("portfolio__organization", "portfolio")
    search_fields = ("portfolio__name", "asset__name")
