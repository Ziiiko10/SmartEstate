from rest_framework import serializers

from apps.properties.models import MarketListing, PropertyAsset


class PropertyAssetSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = PropertyAsset
        fields = [
            "id",
            "organization",
            "organization_name",
            "name",
            "asset_type",
            "status",
            "city",
            "district",
            "address",
            "latitude",
            "longitude",
            "area_sqm",
            "bedrooms",
            "bathrooms",
            "acquisition_date",
            "acquisition_price",
            "current_value",
            "monthly_rent",
            "occupancy_rate",
            "annual_yield",
            "currency",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class MarketListingSerializer(serializers.ModelSerializer):
    price_per_sqm = serializers.SerializerMethodField()

    class Meta:
        model = MarketListing
        fields = [
            "id",
            "source",
            "source_id",
            "external_url",
            "title",
            "description",
            "asset_type",
            "transaction_type",
            "city",
            "district",
            "price",
            "currency",
            "price_period",
            "area_sqm",
            "price_per_sqm",
            "bedrooms",
            "bathrooms",
            "seller_name",
            "published_label",
            "scraped_at",
            "last_seen_at",
            "raw_payload",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_price_per_sqm(self, obj):
        if not obj.price or not obj.area_sqm:
            return None
        if obj.area_sqm == 0:
            return None
        return round(obj.price / obj.area_sqm, 2)
