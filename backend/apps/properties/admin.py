from django.contrib import admin

from apps.properties.models import MarketListing, PropertyAsset


@admin.register(PropertyAsset)
class PropertyAssetAdmin(admin.ModelAdmin):
    list_display = ("name", "organization", "asset_type", "city", "current_value", "status")
    list_filter = ("asset_type", "status", "city", "organization")
    search_fields = ("name", "city", "district", "address")


@admin.register(MarketListing)
class MarketListingAdmin(admin.ModelAdmin):
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
