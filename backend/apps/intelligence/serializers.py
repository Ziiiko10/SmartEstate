from rest_framework import serializers

from apps.intelligence.models import Recommendation, Report, Scenario, Valuation


class ScenarioSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    asset_name = serializers.CharField(source="asset.name", read_only=True)

    class Meta:
        model = Scenario
        fields = "__all__"


class ValuationSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    asset_name = serializers.CharField(source="asset.name", read_only=True)
    requested_by_name = serializers.CharField(source="requested_by.full_name", read_only=True)

    class Meta:
        model = Valuation
        fields = "__all__"


class RecommendationSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    asset_name = serializers.CharField(source="asset.name", read_only=True)

    class Meta:
        model = Recommendation
        fields = "__all__"


class ReportSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    asset_name = serializers.CharField(source="asset.name", read_only=True)
    portfolio_name = serializers.CharField(source="portfolio.name", read_only=True)
    generated_by_name = serializers.CharField(source="generated_by.full_name", read_only=True)

    class Meta:
        model = Report
        fields = "__all__"
