# Administration Django des annonces et actifs immobiliers.
from django.contrib import admin

from apps.properties.models import MarketListing, PropertyAsset


@admin.register(PropertyAsset)
class PropertyAssetAdmin(admin.ModelAdmin):
    # Configure l'affichage des actifs immobiliers dans l'administration Django.
    # Les colonnes selectionnees privilegient la valeur, la localisation et le statut.
    list_display = ("name", "organization", "asset_type", "city", "current_value", "status")
    list_filter = ("asset_type", "status", "city", "organization")
    search_fields = ("name", "city", "district", "address")


@admin.register(MarketListing)
class MarketListingAdmin(admin.ModelAdmin):
    # Configure l'ecran admin des annonces importees depuis le marche.
    # Les filtres aident a explorer rapidement les listings par source et transaction.
    list_display = (
        "title",
        "source",
        "transaction_type",
        "asset_type",
        "city",
        "district",
        "price",
        "last_seen_at",
    )
    list_filter = ("source", "transaction_type", "asset_type", "city")
    search_fields = ("title", "description", "city", "district", "external_url", "source_id")
    readonly_fields = ("created_at", "updated_at", "scraped_at", "last_seen_at", "raw_payload")
