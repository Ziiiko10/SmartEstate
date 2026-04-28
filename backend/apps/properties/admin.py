from django.contrib import admin

from apps.properties.models import PropertyAsset


@admin.register(PropertyAsset)
class PropertyAssetAdmin(admin.ModelAdmin):
    list_display = ("name", "organization", "asset_type", "city", "current_value", "status")
    list_filter = ("asset_type", "status", "city", "organization")
    search_fields = ("name", "city", "district", "address")
