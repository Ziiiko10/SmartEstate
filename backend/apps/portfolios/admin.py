from django.contrib import admin

from apps.portfolios.models import Portfolio, PortfolioHolding


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ("name", "organization", "strategy", "benchmark_return", "target_occupancy")
    list_filter = ("organization",)
    search_fields = ("name", "organization__name", "strategy")


@admin.register(PortfolioHolding)
class PortfolioHoldingAdmin(admin.ModelAdmin):
    list_display = ("portfolio", "asset", "allocation_share", "debt_amount")
    list_filter = ("portfolio__organization", "portfolio")
    search_fields = ("portfolio__name", "asset__name")
