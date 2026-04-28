from django.db.models import Count
from rest_framework import viewsets

from smartestate_backend.access import visible_organizations
from apps.organizations.models import Membership, Organization
from apps.organizations.serializers import MembershipSerializer, OrganizationSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        return visible_organizations(self.request.user).annotate(member_count=Count("memberships"))


class MembershipViewSet(viewsets.ModelViewSet):
    serializer_class = MembershipSerializer

    def get_queryset(self):
        organizations = visible_organizations(self.request.user)
        return Membership.objects.filter(organization__in=organizations).select_related(
            "organization",
            "user",
        )
