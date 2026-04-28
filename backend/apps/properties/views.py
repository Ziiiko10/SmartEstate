from rest_framework import viewsets

from smartestate_backend.access import visible_organizations
from apps.properties.models import PropertyAsset
from apps.properties.serializers import PropertyAssetSerializer


class PropertyAssetViewSet(viewsets.ModelViewSet):
    serializer_class = PropertyAssetSerializer

    def get_queryset(self):
        queryset = PropertyAsset.objects.filter(
            organization__in=visible_organizations(self.request.user)
        ).select_related("organization")

        city = self.request.query_params.get("city")
        asset_type = self.request.query_params.get("asset_type")
        status = self.request.query_params.get("status")

        if city:
            queryset = queryset.filter(city__iexact=city)
        if asset_type:
            queryset = queryset.filter(asset_type=asset_type)
        if status:
            queryset = queryset.filter(status=status)
        return queryset
