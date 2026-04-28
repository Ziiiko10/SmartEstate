from rest_framework import viewsets

from smartestate_backend.access import visible_organizations
from apps.portfolios.models import Portfolio, PortfolioHolding
from apps.portfolios.serializers import PortfolioHoldingSerializer, PortfolioSerializer


class PortfolioViewSet(viewsets.ModelViewSet):
    serializer_class = PortfolioSerializer

    def get_queryset(self):
        return Portfolio.objects.filter(
            organization__in=visible_organizations(self.request.user)
        ).select_related("organization")


class PortfolioHoldingViewSet(viewsets.ModelViewSet):
    serializer_class = PortfolioHoldingSerializer

    def get_queryset(self):
        organizations = visible_organizations(self.request.user)
        return PortfolioHolding.objects.filter(
            portfolio__organization__in=organizations
        ).select_related("portfolio", "asset")
