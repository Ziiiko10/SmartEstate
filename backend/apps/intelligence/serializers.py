from rest_framework import serializers

from apps.intelligence.models import Recommendation, Report, Scenario, Valuation
from apps.properties.models import MarketListing


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


class MarketFeatureInputSerializer(serializers.Serializer):
    city = serializers.CharField(max_length=120)
    district = serializers.CharField(max_length=120, required=False, allow_blank=True)
    asset_type = serializers.ChoiceField(
        choices=MarketListing.AssetType.choices,
        default=MarketListing.AssetType.APARTMENT,
    )
    area_sqm = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1)
    bedrooms = serializers.IntegerField(required=False, min_value=0, allow_null=True)
    bathrooms = serializers.IntegerField(required=False, min_value=0, allow_null=True)


class MarketValuationInputSerializer(MarketFeatureInputSerializer):
    transaction_type = serializers.ChoiceField(
        choices=[
            MarketListing.TransactionType.SALE,
            MarketListing.TransactionType.RENT,
        ],
        default=MarketListing.TransactionType.SALE,
    )
    save_valuation = serializers.BooleanField(default=False)
    organization = serializers.IntegerField(required=False, min_value=1)
    asset = serializers.IntegerField(required=False, min_value=1, allow_null=True)
    title = serializers.CharField(max_length=255, required=False, allow_blank=True)


class InvestmentScoreInputSerializer(MarketFeatureInputSerializer):
    asking_price = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=1)
    monthly_rent = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        required=False,
        min_value=0,
        allow_null=True,
    )


class ScenarioSimulationInputSerializer(serializers.Serializer):
    purchase_price = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=1)
    down_payment = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=0)
    monthly_rent = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=0)
    loan_rate = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=0)
    loan_years = serializers.IntegerField(default=20, min_value=1, max_value=40)
    renovation_budget = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=0,
        default=0,
    )
    holding_period_years = serializers.IntegerField(default=10, min_value=1, max_value=40)
    annual_expense_rate = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=0,
        max_value=100,
        default=20,
    )
    appreciation_rate = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=-20,
        max_value=50,
        default=3,
    )
    exit_cost_rate = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=0,
        max_value=30,
        default=4,
    )
