from decimal import Decimal, InvalidOperation

from django.db.models import Q
from rest_framework import viewsets

from smartestate_backend.access import visible_organizations
from apps.properties.models import MarketListing, PropertyAsset
from apps.properties.serializers import MarketListingSerializer, PropertyAssetSerializer


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


class MarketListingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MarketListingSerializer

    def get_queryset(self):
        queryset = MarketListing.objects.all()

        source = self.request.query_params.get("source")
        city = self.request.query_params.get("city")
        asset_type = self.request.query_params.get("asset_type")
        transaction_type = self.request.query_params.get("transaction_type")
        q = self.request.query_params.get("q")

        if source:
            queryset = queryset.filter(source=source)
        if city:
            queryset = queryset.filter(city__iexact=city)
        if asset_type:
            queryset = queryset.filter(asset_type=asset_type)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        if q:
            queryset = queryset.filter(
                Q(title__icontains=q)
                | Q(description__icontains=q)
                | Q(city__icontains=q)
                | Q(district__icontains=q)
            )

        min_price = self._decimal_query_param("min_price")
        max_price = self._decimal_query_param("max_price")
        if min_price is not None:
            queryset = queryset.filter(price__gte=min_price)
        if max_price is not None:
            queryset = queryset.filter(price__lte=max_price)

        return queryset

    def _decimal_query_param(self, name):
        value = self.request.query_params.get(name)
        if not value:
            return None
        try:
            return Decimal(value)
        except (InvalidOperation, TypeError):
            return None
