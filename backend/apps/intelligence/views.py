from django.db.models import Avg, Count, Sum
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from smartestate_backend.access import visible_organizations
from apps.intelligence.models import Recommendation, Report, Scenario, Valuation
from apps.intelligence.serializers import (
    RecommendationSerializer,
    ReportSerializer,
    ScenarioSerializer,
    ValuationSerializer,
)
from apps.portfolios.models import Portfolio
from apps.properties.models import PropertyAsset


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

        metrics = assets.aggregate(
            total_value=Sum("current_value"),
            avg_occupancy=Avg("occupancy_rate"),
            avg_yield=Avg("annual_yield"),
        )

        city_breakdown = list(
            assets.values("city").annotate(asset_count=Count("id")).order_by("-asset_count", "city")[:5]
        )

        payload = {
            "organizations": organizations.count(),
            "assets": assets.count(),
            "portfolios": portfolios.count(),
            "reports": reports.count(),
            "recommendations_open": recommendations.filter(status=Recommendation.Status.OPEN).count(),
            "scenarios": scenarios.count(),
            "total_asset_value": metrics["total_value"] or 0,
            "average_occupancy_rate": metrics["avg_occupancy"] or 0,
            "average_annual_yield": metrics["avg_yield"] or 0,
            "top_cities": city_breakdown,
        }
        return Response(payload)
