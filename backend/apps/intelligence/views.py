from decimal import Decimal

from django.db.models import Avg, Count, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from smartestate_backend.access import visible_organizations
from apps.intelligence.models import Recommendation, Report, Scenario, Valuation
from apps.intelligence.ml.algorithms import (
    estimate_with_ml_models,
    score_investment_opportunity,
    simulate_investment_scenario,
)
from apps.intelligence.serializers import (
    InvestmentScoreInputSerializer,
    MarketValuationInputSerializer,
    RecommendationSerializer,
    ReportSerializer,
    ScenarioSerializer,
    ScenarioSimulationInputSerializer,
    ValuationSerializer,
)
from apps.portfolios.models import Portfolio
from apps.properties.models import MarketListing, PropertyAsset


def decimal_to_float(value):
    if value is None:
        return None
    return float(value)


def money_to_float(value):
    if value is None:
        return 0
    return float(value)


class ScenarioViewSet(viewsets.ModelViewSet):
    serializer_class = ScenarioSerializer

    def get_queryset(self):
        return Scenario.objects.filter(
            organization__in=visible_organizations(self.request.user)
        ).select_related("organization", "asset")


class ValuationViewSet(viewsets.ModelViewSet):
    serializer_class = ValuationSerializer

    def get_queryset(self):
        return Valuation.objects.filter(
            organization__in=visible_organizations(self.request.user)
        ).select_related("organization", "asset", "requested_by")


class RecommendationViewSet(viewsets.ModelViewSet):
    serializer_class = RecommendationSerializer

    def get_queryset(self):
        queryset = Recommendation.objects.filter(
            organization__in=visible_organizations(self.request.user)
        ).select_related("organization", "asset")
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
        return queryset


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer

    def get_queryset(self):
        return Report.objects.filter(
            organization__in=visible_organizations(self.request.user)
        ).select_related("organization", "asset", "portfolio", "generated_by")


class DashboardOverviewView(APIView):
    def get(self, request):
        organizations = visible_organizations(request.user)

        assets = PropertyAsset.objects.filter(organization__in=organizations)
        portfolios = Portfolio.objects.filter(organization__in=organizations)
        reports = Report.objects.filter(organization__in=organizations)
        recommendations = Recommendation.objects.filter(organization__in=organizations)
        scenarios = Scenario.objects.filter(organization__in=organizations)
        market_listings = MarketListing.objects.all()

        metrics = assets.aggregate(
            total_value=Sum("current_value"),
            total_acquisition=Sum("acquisition_price"),
            monthly_cashflow=Sum("monthly_rent"),
            avg_occupancy=Avg("occupancy_rate"),
            avg_yield=Avg("annual_yield"),
        )
        listing_metrics = market_listings.aggregate(
            listing_count=Count("id"),
        )
        sale_market_listings = market_listings.filter(
            transaction_type=MarketListing.TransactionType.SALE,
            price_period="",
            price__gte=50000,
            area_sqm__isnull=False,
        )

        city_breakdown = list(
            assets.values("city").annotate(asset_count=Count("id")).order_by("-asset_count", "city")[:5]
        )
        market_city_breakdown = list(
            market_listings.exclude(city="")
            .values("city")
            .annotate(listing_count=Count("id"), average_price=Avg("price"))
            .order_by("-listing_count", "city")[:6]
        )

        total_value = metrics["total_value"] or Decimal("0")
        total_acquisition = metrics["total_acquisition"] or Decimal("0")
        monthly_cashflow = metrics["monthly_cashflow"] or Decimal("0")
        value_growth_percent = Decimal("0")
        if total_acquisition > 0:
            value_growth_percent = ((total_value - total_acquisition) / total_acquisition) * Decimal("100")

        avg_market_price_per_sqm = self._average_price_per_sqm(sale_market_listings)

        opportunities = self._build_market_opportunities(market_listings)
        recent_activity = self._build_recent_activity(assets, reports, recommendations, market_listings)
        growth_series = self._build_growth_series(total_acquisition, total_value)

        payload = {
            "refreshed_at": timezone.now(),
            "organizations": organizations.count(),
            "assets": assets.count(),
            "portfolios": portfolios.count(),
            "reports": reports.count(),
            "recommendations_open": recommendations.filter(status=Recommendation.Status.OPEN).count(),
            "scenarios": scenarios.count(),
            "market_listings": listing_metrics["listing_count"] or 0,
            "total_asset_value": money_to_float(total_value),
            "total_acquisition_value": money_to_float(total_acquisition),
            "monthly_cashflow": money_to_float(monthly_cashflow),
            "value_growth_percent": decimal_to_float(value_growth_percent),
            "average_occupancy_rate": decimal_to_float(metrics["avg_occupancy"] or Decimal("0")),
            "average_annual_yield": decimal_to_float(metrics["avg_yield"] or Decimal("0")),
            "average_market_price_per_sqm": decimal_to_float(avg_market_price_per_sqm),
            "top_cities": city_breakdown,
            "market_cities": market_city_breakdown,
            "opportunities": opportunities,
            "recent_activity": recent_activity,
            "growth_series": growth_series,
        }
        return Response(payload)

    def _build_market_opportunities(self, market_listings):
        candidates = (
            market_listings.filter(
                transaction_type=MarketListing.TransactionType.SALE,
                price_period="",
                price__gte=50000,
                price__isnull=False,
                area_sqm__isnull=False,
            )
            .exclude(city="")
            .order_by("-last_seen_at")[:30]
        )
        all_sales = market_listings.filter(
            transaction_type=MarketListing.TransactionType.SALE,
            price_period="",
            price__gte=50000,
            price__isnull=False,
            area_sqm__isnull=False,
        )

        opportunities = []
        for listing in candidates:
            subject = {
                "city": listing.city,
                "district": listing.district,
                "asset_type": listing.asset_type,
                "area_sqm": listing.area_sqm,
                "bedrooms": listing.bedrooms,
                "bathrooms": listing.bathrooms,
                "asking_price": listing.price,
            }
            estimate = estimate_with_ml_models(subject, all_sales.exclude(id=listing.id), transaction_type="sale")
            score = score_investment_opportunity(subject, estimate)
            if score.get("status") != "ok":
                continue
            opportunities.append(
                {
                    "id": listing.id,
                    "title": listing.title,
                    "source": listing.source,
                    "external_url": listing.external_url,
                    "city": listing.city,
                    "district": listing.district,
                    "asset_type": listing.asset_type,
                    "image_urls": listing.image_urls,
                    "primary_image_url": listing.primary_image_url,
                    "published_label": listing.published_label,
                    "last_seen_at": listing.last_seen_at,
                    "price": money_to_float(listing.price),
                    "area_sqm": decimal_to_float(listing.area_sqm),
                    "score": decimal_to_float(score.get("score")),
                    "signal": score.get("signal"),
                    "market_discount_percent": decimal_to_float(score.get("market_discount_percent")),
                    "estimated_value": decimal_to_float(estimate.get("estimated_value")),
                    "confidence_score": decimal_to_float(estimate.get("confidence_score")),
                }
            )

        opportunities.sort(key=lambda item: item["score"] or 0, reverse=True)
        return opportunities[:4]

    def _average_price_per_sqm(self, listings):
        values = []
        for listing in listings[:200]:
            if listing.price and listing.area_sqm and listing.area_sqm > 0:
                values.append(listing.price / listing.area_sqm)
        if not values:
            return Decimal("0")
        return sum(values) / Decimal(len(values))

    def _build_recent_activity(self, assets, reports, recommendations, market_listings):
        activities = []
        for listing in market_listings.order_by("-last_seen_at")[:4]:
            activities.append(
                {
                    "type": "market_listing",
                    "icon": "travel_explore",
                    "title": f"Annonce {listing.source.title()} indexee",
                    "subtitle": listing.title,
                    "timestamp": listing.last_seen_at,
                }
            )
        for report in reports.order_by("-created_at")[:2]:
            activities.append(
                {
                    "type": "report",
                    "icon": "description",
                    "title": "Rapport genere",
                    "subtitle": report.title,
                    "timestamp": report.created_at,
                }
            )
        for recommendation in recommendations.order_by("-created_at")[:2]:
            activities.append(
                {
                    "type": "recommendation",
                    "icon": "auto_awesome",
                    "title": "Recommandation IA",
                    "subtitle": recommendation.title,
                    "timestamp": recommendation.created_at,
                }
            )
        for asset in assets.order_by("-created_at")[:2]:
            activities.append(
                {
                    "type": "asset",
                    "icon": "domain",
                    "title": "Actif en base",
                    "subtitle": asset.name,
                    "timestamp": asset.created_at,
                }
            )
        activities.sort(key=lambda item: item["timestamp"], reverse=True)
        return activities[:6]

    def _build_growth_series(self, total_acquisition, total_value):
        labels = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"]
        start = total_acquisition if total_acquisition > 0 else total_value
        end = total_value if total_value > 0 else start
        if start <= 0 and end <= 0:
            return [{"label": label, "value": 0, "height_percent": 12} for label in labels]

        values = []
        for index, label in enumerate(labels):
            ratio = Decimal(index) / Decimal(len(labels) - 1)
            value = start + (end - start) * ratio
            values.append((label, value))

        max_value = max(value for _, value in values) or Decimal("1")
        return [
            {
                "label": label,
                "value": money_to_float(value),
                "height_percent": max(12, min(96, int((value / max_value) * Decimal("96")))),
            }
            for label, value in values
        ]


class MarketValuationView(APIView):
    def post(self, request):
        serializer = MarketValuationInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        listings = self._base_market_queryset(payload["transaction_type"])
        result = estimate_with_ml_models(
            payload,
            listings,
            transaction_type=payload["transaction_type"],
        )

        saved_valuation_id = None
        if payload.get("save_valuation") and result.get("estimated_value") is not None:
            saved_valuation_id = self._save_valuation(request, payload, result)

        result["saved_valuation_id"] = saved_valuation_id
        return Response(result)

    def _base_market_queryset(self, transaction_type):
        queryset = MarketListing.objects.filter(
            transaction_type=transaction_type,
            price__isnull=False,
            area_sqm__isnull=False,
        )
        if transaction_type == MarketListing.TransactionType.SALE:
            queryset = queryset.filter(price_period="", price__gte=50000)
        return queryset.order_by("-last_seen_at")

    def _save_valuation(self, request, payload, result):
        organizations = visible_organizations(request.user)
        organization_id = payload.get("organization")
        if organization_id:
            organization = get_object_or_404(organizations, id=organization_id)
        else:
            organization = organizations.first()
        if organization is None:
            raise ValidationError({"organization": "Aucune organisation visible pour sauvegarder l'estimation."})

        asset = None
        asset_id = payload.get("asset")
        if asset_id:
            asset = get_object_or_404(
                PropertyAsset.objects.filter(organization__in=organizations),
                id=asset_id,
            )

        title = payload.get("title") or f"Estimation marche {payload['city']}"
        valuation = Valuation.objects.create(
            organization=organization,
            asset=asset,
            requested_by=request.user if request.user.is_authenticated else None,
            title=title,
            estimated_value=result["estimated_value"],
            low_estimate=result["low_estimate"],
            high_estimate=result["high_estimate"],
            confidence_score=result["confidence_score"],
            model_version=result.get("model_version", result["method"]),
            input_payload={
                "features": {
                    "city": payload["city"],
                    "district": payload.get("district", ""),
                    "asset_type": payload["asset_type"],
                    "area_sqm": str(payload["area_sqm"]),
                    "bedrooms": payload.get("bedrooms"),
                    "bathrooms": payload.get("bathrooms"),
                    "transaction_type": payload["transaction_type"],
                },
                "sample_size": result.get("sample_size", 0),
                "training_rows": result.get("training_rows", 0),
                "models": result.get("models", []),
            },
            summary=(
                "Estimation ML basee sur "
                f"{result.get('sample_size', 0)} comparables et "
                f"{result.get('training_rows', 0)} lignes d'entrainement marche."
            ),
        )
        return valuation.id


class InvestmentScoreView(APIView):
    def post(self, request):
        serializer = InvestmentScoreInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        sale_estimate = estimate_with_ml_models(
            payload,
            MarketListing.objects.filter(
                transaction_type=MarketListing.TransactionType.SALE,
                price__isnull=False,
                area_sqm__isnull=False,
            ),
            transaction_type=MarketListing.TransactionType.SALE,
        )
        rent_estimate = estimate_with_ml_models(
            payload,
            MarketListing.objects.filter(
                transaction_type=MarketListing.TransactionType.RENT,
                price__isnull=False,
                area_sqm__isnull=False,
            ),
            transaction_type=MarketListing.TransactionType.RENT,
        )
        opportunity = score_investment_opportunity(payload, sale_estimate, rent_estimate)

        return Response(
            {
                "opportunity": opportunity,
                "sale_estimate": sale_estimate,
                "rent_estimate": rent_estimate,
            }
        )


class ScenarioSimulationView(APIView):
    def post(self, request):
        serializer = ScenarioSimulationInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = simulate_investment_scenario(serializer.validated_data)
        return Response(result)
