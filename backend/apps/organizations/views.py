# API de gestion des equipes et des organisations de la plateforme.
from django.db.models import Count
from rest_framework import viewsets

from apps.accounts.permissions import IsAdministrateur
from smartestate_backend.access import visible_organizations
from apps.organizations.models import Membership, Organization
from apps.organizations.serializers import MembershipSerializer, OrganizationSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    # Expose le CRUD des organisations visibles pour un administrateur.
    # Le queryset est annote pour renvoyer directement le nombre de membres.
    permission_classes = [IsAdministrateur]
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        # Retourne uniquement les organisations accessibles a l'utilisateur courant.
        # Les champs charges sont limites aux besoins de cette ressource API.
        return visible_organizations(self.request.user).annotate(member_count=Count("memberships")).only(
            "id",
            "name",
            "city",
            "country",
            "description",
        )


class MembershipViewSet(viewsets.ModelViewSet):
    # Expose la gestion des memberships d'equipe pour les administrateurs.
    # Les donnees utiles au frontend sont prechargees pour eviter les acces repetes.
    permission_classes = [IsAdministrateur]
    serializer_class = MembershipSerializer

    def get_queryset(self):
        # Retourne les memberships lies aux organisations visibles pour la requete.
        # Le select_related et le only reduisent ensuite le cout des listes admin.
        organizations = visible_organizations(self.request.user)
        return Membership.objects.filter(organization__in=organizations).select_related(
            "organization",
            "user",
        ).only(
            "id",
            "organization",
            "organization__name",
            "role",
            "title",
            "is_primary",
            "created_at",
            "updated_at",
            "user",
            "user__email",
            "user__full_name",
            "user__is_active",
            "user__role",
        )
