from rest_framework import serializers

from apps.portfolios.models import Portfolio, PortfolioHolding


class PortfolioSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = Portfolio
        fields = [
            "id",
            "organization",
            "organization_name",
            "name",
            "slug",
            "strategy",
            "benchmark_return",
            "target_occupancy",
            "currency",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]


class PortfolioHoldingSerializer(serializers.ModelSerializer):
    portfolio_name = serializers.CharField(source="portfolio.name", read_only=True)
    asset_name = serializers.CharField(source="asset.name", read_only=True)
    asset_city = serializers.CharField(source="asset.city", read_only=True)

    class Meta:
        model = PortfolioHolding
        fields = [
            "id",
            "portfolio",
            "portfolio_name",
            "asset",
            "asset_name",
            "asset_city",
            "allocation_share",
            "debt_amount",
            "target_price",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
