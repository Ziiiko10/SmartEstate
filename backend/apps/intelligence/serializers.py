# Serialise les donnees IA pour l'estimation, les recommandations et les statistiques.
from rest_framework import serializers

from apps.intelligence.models import Recommendation, Report, Scenario, Valuation
from apps.properties.models import MarketListing


class ScenarioSerializer(serializers.ModelSerializer):
    # Serialise les scenarios exposes par l'API.
    # Le serializer ajoute des noms lisibles pour l'organisation et l'actif lies.
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    asset_name = serializers.CharField(source="asset.name", read_only=True)

    class Meta:
        model = Scenario
        fields = "__all__"


class ValuationSerializer(serializers.ModelSerializer):
    # Serialise les estimations sauvegardees et leurs relations utiles.
    # Les noms lisibles simplifies l'exploitation directe par le frontend.
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    asset_name = serializers.CharField(source="asset.name", read_only=True)
    requested_by_name = serializers.CharField(source="requested_by.full_name", read_only=True)

    class Meta:
        model = Valuation
        fields = "__all__"


class RecommendationSerializer(serializers.ModelSerializer):
    # Serialise les recommandations generees ou suivies par la plateforme.
    # Le frontend y retrouve aussi les libelles des objets rattaches.
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    asset_name = serializers.CharField(source="asset.name", read_only=True)

    class Meta:
        model = Recommendation
        fields = "__all__"


class ReportSerializer(serializers.ModelSerializer):
    # Serialise les rapports et leurs relations d'affichage.
    # Les informations denormalisees evite plusieurs appels supplementaires au frontend.
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    asset_name = serializers.CharField(source="asset.name", read_only=True)
    portfolio_name = serializers.CharField(source="portfolio.name", read_only=True)
    generated_by_name = serializers.CharField(source="generated_by.full_name", read_only=True)

    class Meta:
        model = Report
        fields = "__all__"


class MarketFeatureInputSerializer(serializers.Serializer):
    # Valide les caracteristiques minimales d'un bien a analyser cote marche.
    # Ce socle est ensuite reutilise par plusieurs endpoints IA differents.
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
    # Etend les features de marche avec les options utiles a une estimation.
    # Le payload peut aussi demander la sauvegarde du resultat dans la base.
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
    # Valide les entrees necessaires au calcul d'une opportunite d'investissement.
    # Le prix demande et le loyer mensuel servent a completer l'analyse de marche.
    asking_price = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=1)
    monthly_rent = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        required=False,
        min_value=0,
        allow_null=True,
    )


class ScenarioSimulationInputSerializer(serializers.Serializer):
    # Valide les hypotheses financieres d'une simulation d'investissement.
    # Les bornes protegent l'API contre des valeurs absurdes ou incoherentes.
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
