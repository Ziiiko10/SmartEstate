# API CRUD des portefeuilles et de leurs participations.
from rest_framework import viewsets

from apps.accounts.permissions import IsAgentOrAdmin
from smartestate_backend.access import visible_organizations
from apps.portfolios.models import Portfolio, PortfolioHolding
from apps.portfolios.serializers import PortfolioHoldingSerializer, PortfolioSerializer


class PortfolioViewSet(viewsets.ModelViewSet):
    # Expose le CRUD des portefeuilles visibles pour les agents et administrateurs.
    # Les relations utiles sont prechargees pour accelerer les listes et details.
    permission_classes = [IsAgentOrAdmin]
    serializer_class = PortfolioSerializer

    def get_queryset(self):
        # Retourne les portefeuilles rattaches aux organisations visibles.
        # Le queryset charge seulement les champs utiles a cette ressource API.
        return Portfolio.objects.filter(
            organization__in=visible_organizations(self.request.user)
        ).select_related("organization").only(
            "id",
            "organization",
            "organization__name",
            "name",
            "slug",
            "strategy",
            "benchmark_return",
            "target_occupancy",
            "currency",
            "description",
            "created_at",
            "updated_at",
        )


class PortfolioHoldingViewSet(viewsets.ModelViewSet):
    # Expose le CRUD des positions contenues dans les portefeuilles.
    # La vue limite l'acces aux organisations visibles pour l'utilisateur courant.
    permission_classes = [IsAgentOrAdmin]
    serializer_class = PortfolioHoldingSerializer

    def get_queryset(self):
        # Retourne les holdings lies aux portefeuilles visibles pour la requete.
        # Les relations portefeuille et actif sont resolues en une seule passe SQL.
        organizations = visible_organizations(self.request.user)
        return PortfolioHolding.objects.filter(
            portfolio__organization__in=organizations
        ).select_related("portfolio", "asset").only(
            "id",
            "portfolio",
            "portfolio__name",
            "asset",
            "asset__name",
            "asset__city",
            "allocation_share",
            "debt_amount",
            "target_price",
            "notes",
            "created_at",
            "updated_at",
        )
