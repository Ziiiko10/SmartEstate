from django.db.models import Count
from rest_framework import viewsets

from apps.accounts.permissions import IsAdministrateur
from smartestate_backend.access import visible_organizations
from apps.organizations.models import Membership, Organization
from apps.organizations.serializers import MembershipSerializer, OrganizationSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdministrateur]
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        return visible_organizations(self.request.user).annotate(member_count=Count("memberships")).only(
            "id",
            "name",
            "city",
            "country",
            "description",
        )


class MembershipViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdministrateur]
    serializer_class = MembershipSerializer

    def get_queryset(self):
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
