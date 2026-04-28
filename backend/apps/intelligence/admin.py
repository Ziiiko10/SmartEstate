from django.contrib import admin

from apps.intelligence.models import Recommendation, Report, Scenario, Valuation


@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ("title", "organization", "strategy", "projected_irr", "projected_monthly_cashflow")
    list_filter = ("strategy", "organization")
    search_fields = ("title", "organization__name", "asset__name")


@admin.register(Valuation)
class ValuationAdmin(admin.ModelAdmin):
    list_display = ("title", "organization", "estimated_value", "confidence_score", "status")
    list_filter = ("status", "organization")
    search_fields = ("title", "organization__name", "asset__name")


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ("title", "organization", "category", "priority", "status")
    list_filter = ("category", "priority", "status", "organization")
    search_fields = ("title", "organization__name", "asset__name")


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("title", "organization", "report_type", "status", "created_at")
    list_filter = ("report_type", "status", "organization")
    search_fields = ("title", "organization__name", "asset__name", "portfolio__name")
