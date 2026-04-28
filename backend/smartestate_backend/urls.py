from django.contrib import admin
from django.urls import include, path
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView

from apps.accounts.views import CurrentUserView, LoginView, RegisterView
from apps.intelligence.views import (
    DashboardOverviewView,
    RecommendationViewSet,
    ReportViewSet,
    ScenarioViewSet,
    ValuationViewSet,
)
from apps.organizations.views import MembershipViewSet, OrganizationViewSet
from apps.portfolios.views import PortfolioHoldingViewSet, PortfolioViewSet
from apps.properties.views import PropertyAssetViewSet
from smartestate_backend.health import check_cache, check_database, check_mongodb


class HealthcheckView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        database = check_database()
        cache = check_cache()
        mongodb = check_mongodb()

        required_services = [database, cache]
        if any(service["status"] == "error" for service in required_services):
            overall_status = "error"
            response_status = status.HTTP_503_SERVICE_UNAVAILABLE
        elif mongodb["status"] == "error":
            overall_status = "degraded"
            response_status = status.HTTP_200_OK
        else:
            overall_status = "ok"
            response_status = status.HTTP_200_OK

        return Response(
            {
                "status": overall_status,
                "service": "smartestate-backend",
                "services": {
                    "database": database,
                    "cache": cache,
                    "mongodb": mongodb,
                },
            },
            status=response_status,
        )


router = DefaultRouter()
router.register("organizations", OrganizationViewSet, basename="organization")
router.register("team-memberships", MembershipViewSet, basename="team-membership")
router.register("assets", PropertyAssetViewSet, basename="asset")
router.register("portfolios", PortfolioViewSet, basename="portfolio")
router.register("holdings", PortfolioHoldingViewSet, basename="holding")
router.register("scenarios", ScenarioViewSet, basename="scenario")
router.register("valuations", ValuationViewSet, basename="valuation")
router.register("recommendations", RecommendationViewSet, basename="recommendation")
router.register("reports", ReportViewSet, basename="report")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthcheckView.as_view(), name="healthcheck"),
    path("api/auth/register/", RegisterView.as_view(), name="auth-register"),
    path("api/auth/login/", LoginView.as_view(), name="auth-login"),
    path("api/auth/me/", CurrentUserView.as_view(), name="auth-me"),
    path("api/dashboard/overview/", DashboardOverviewView.as_view(), name="dashboard-overview"),
    path("api/", include(router.urls)),
]
