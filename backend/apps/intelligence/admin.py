# Administration Django des objets relies au moteur IA.
from django.contrib import admin

from apps.intelligence.models import Recommendation, Report, Scenario, Valuation


@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    # Configure l'affichage des scenarios d'investissement dans l'administration.
    # Les colonnes mettent en avant la strategie et les indicateurs projetes.
    list_display = ("title", "organization", "strategy", "projected_irr", "projected_monthly_cashflow")
    list_filter = ("strategy", "organization")
    search_fields = ("title", "organization__name", "asset__name")


@admin.register(Valuation)
class ValuationAdmin(admin.ModelAdmin):
    # Configure l'ecran admin des estimations sauvegardees.
    # Les valeurs affichees aident a suivre la confiance et le statut du modele.
    list_display = ("title", "organization", "estimated_value", "confidence_score", "status")
    list_filter = ("status", "organization")
    search_fields = ("title", "organization__name", "asset__name")


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    # Configure la consultation des recommandations issues de l'analyse.
    # Les filtres privilegient la priorite, la categorie et l'etat de traitement.
    list_display = ("title", "organization", "category", "priority", "status")
    list_filter = ("category", "priority", "status", "organization")
    search_fields = ("title", "organization__name", "asset__name")


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    # Configure l'affichage des rapports generes dans l'administration.
    # Les recherches facilitent l'acces a un rapport par actif ou portefeuille.
    list_display = ("title", "organization", "report_type", "status", "created_at")
    list_filter = ("report_type", "status", "organization")
    search_fields = ("title", "organization__name", "asset__name", "portfolio__name")
