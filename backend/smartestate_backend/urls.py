# Routeur principal du backend: expose l'admin Django, l'API et les endpoints metier.
from django.contrib import admin
from django.urls import include, path
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView

from apps.accounts.views import CurrentUserView, LoginView, RegisterView, UserViewSet
from apps.intelligence.views import (
    DashboardOverviewView,
    InvestmentScoreView,
    MarketValuationView,
    RecommendationViewSet,
    ReportViewSet,
    ScenarioViewSet,
    ScenarioSimulationView,
    ValuationViewSet,
)
from apps.organizations.views import MembershipViewSet, OrganizationViewSet
from apps.portfolios.views import PortfolioHoldingViewSet, PortfolioViewSet
from apps.properties.views import MarketListingSyncView, MarketListingViewSet, PropertyAssetViewSet
from smartestate_backend.health import check_cache, check_database


class HealthcheckView(APIView):
    # Expose un endpoint public de verification de sante du backend.
    # Il consolide l'etat de la base et du cache dans une seule reponse simple.
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        # Construit la reponse de sante a partir des dependances critiques.
        # Le code HTTP passe en 503 des qu'un service obligatoire est en erreur.
        database = check_database()
        cache = check_cache()

        required_services = [database, cache]
        if any(service["status"] == "error" for service in required_services):
            overall_status = "error"
            response_status = status.HTTP_503_SERVICE_UNAVAILABLE
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
                },
            },
            status=response_status,
        )


router = DefaultRouter()
router.register("users", UserViewSet, basename="user")
router.register("organizations", OrganizationViewSet, basename="organization")
router.register("team-memberships", MembershipViewSet, basename="team-membership")
router.register("assets", PropertyAssetViewSet, basename="asset")
router.register("market-listings", MarketListingViewSet, basename="market-listing")
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
    path(
        "api/admin/market-listings/sync/",
        MarketListingSyncView.as_view(),
        name="admin-market-listings-sync",
    ),
    path("api/ml/valuation/", MarketValuationView.as_view(), name="ml-valuation"),
    path("api/ml/investment-score/", InvestmentScoreView.as_view(), name="ml-investment-score"),
    path("api/ml/scenario-simulation/", ScenarioSimulationView.as_view(), name="ml-scenario-simulation"),
    path("api/", include(router.urls)),
]
