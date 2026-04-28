from rest_framework import serializers

from apps.properties.models import PropertyAsset


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
