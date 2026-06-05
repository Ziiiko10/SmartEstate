# API des annonces et points de synchronisation de l'ETL immobilier.
from decimal import Decimal, InvalidOperation

from django.db.models import Count, Q
from rest_framework.decorators import action
from rest_framework import permissions, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.accounts.permissions import IsAdministrateur, IsAgentOrAdmin
from smartestate_backend.access import visible_organizations
from apps.properties.etl.pipeline import run_market_scrape
from apps.properties.models import MarketListing, PropertyAsset
from apps.properties.serializers import MarketListingSerializer, PropertyAssetSerializer


class PropertyAssetViewSet(viewsets.ModelViewSet):
    # Expose le CRUD des actifs immobiliers visibles par l'utilisateur courant.
    # La vue applique ensuite quelques filtres simples transmis par query params.
    permission_classes = [IsAgentOrAdmin]
    serializer_class = PropertyAssetSerializer

    def get_queryset(self):
        # Retourne les actifs des organisations visibles avec prechargement minimal.
        # Des filtres facultatifs sur la ville, le type et le statut sont ensuite appliques.
        queryset = PropertyAsset.objects.filter(
            organization__in=visible_organizations(self.request.user)
        ).select_related("organization").only(
            "id",
            "organization",
            "organization__name",
            "name",
            "asset_type",
            "status",
            "city",
            "district",
            "address",
            "latitude",
            "longitude",
            "area_sqm",
            "bedrooms",
            "bathrooms",
            "acquisition_date",
            "acquisition_price",
            "current_value",
            "monthly_rent",
            "occupancy_rate",
            "annual_yield",
            "currency",
            "notes",
            "created_at",
            "updated_at",
        )

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
    # Expose les annonces de marche en lecture seule pour le frontend et l'analyse.
    # La vue gere aussi les filtres, les facettes et une pagination legere maison.
    serializer_class = MarketListingSerializer

    def _base_queryset(self):
        # Prepare le queryset de base des annonces avant filtrage.
        # Les champs charges sont limites a ceux vraiment utiles a l'API publique.
        return MarketListing.objects.only(
            "id",
            "source",
            "source_id",
            "external_url",
            "title",
            "asset_type",
            "transaction_type",
            "city",
            "district",
            "price",
            "currency",
            "price_period",
            "area_sqm",
            "bedrooms",
            "bathrooms",
            "seller_name",
            "published_label",
            "scraped_at",
            "last_seen_at",
            "raw_payload",
            "created_at",
            "updated_at",
        ).order_by("-last_seen_at", "-id")

    def _apply_filters(self, queryset, *, include_city=True, include_query=True):
        # Applique les filtres recuperees depuis les query params sur le queryset.
        # La methode couvre source, localisation, type, transaction et bornes de prix.
        source = self.request.query_params.get("source")
        city = self.request.query_params.get("city")
        asset_type = self.request.query_params.get("asset_type")
        transaction_type = self.request.query_params.get("transaction_type")
        q = self.request.query_params.get("q") if include_query else None

        if source:
            queryset = queryset.filter(source=source)
        if include_city and city:
            queryset = queryset.filter(city__icontains=city)
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

    def get_queryset(self):
        # Retourne le queryset final des annonces pour la requete courante.
        # Toute la logique de filtrage reutilise le helper central de la vue.
        return self._apply_filters(self._base_queryset())

    @action(detail=False, methods=["get"], url_path="filters")
    def filters(self, request, *args, **kwargs):
        # Construit les facettes de recherche utilisables par le frontend.
        # Les compteurs sont calcules apres application des filtres contextuels pertinents.
        queryset = self._apply_filters(self._base_queryset(), include_query=False)
        city_queryset = self._apply_filters(
            self._base_queryset(),
            include_city=False,
            include_query=False,
        )

        city_counts = (
            city_queryset.exclude(city="")
            .values("city")
            .annotate(count=Count("id"))
            .order_by("-count", "city")[:24]
        )
        district_counts = (
            queryset.exclude(district="")
            .values("district")
            .annotate(count=Count("id"))
            .order_by("-count", "district")[:12]
        )
        asset_type_counts = (
            queryset.values("asset_type")
            .annotate(count=Count("id"))
            .order_by("-count", "asset_type")
        )
        bedroom_counts = (
            queryset.exclude(bedrooms__isnull=True)
            .values("bedrooms")
            .annotate(count=Count("id"))
            .order_by("bedrooms")
        )
        bathroom_counts = (
            queryset.exclude(bathrooms__isnull=True)
            .values("bathrooms")
            .annotate(count=Count("id"))
            .order_by("bathrooms")
        )

        asset_type_choices = []
        for item in asset_type_counts:
            asset_type = item["asset_type"]
            if not asset_type:
                continue
            label = MarketListing.AssetType(asset_type).label
            asset_type_choices.append(
                {
                    "count": item["count"],
                    "label": f"Type • {label}",
                    "value": f"asset_type:{asset_type}",
                }
            )

        district_choices = [
            {
                "count": item["count"],
                "label": f"Quartier • {item['district']}",
                "value": f"q:{item['district']}",
            }
            for item in district_counts
        ]
        bedroom_choices = [
            {
                "count": item["count"],
                "label": f"{item['bedrooms']} chambre{'s' if item['bedrooms'] > 1 else ''}",
                "value": str(item["bedrooms"]),
            }
            for item in bedroom_counts
        ]
        bathroom_choices = [
            {
                "count": item["count"],
                "label": f"{item['bathrooms']} salle{'s' if item['bathrooms'] > 1 else ''} de bain",
                "value": str(item["bathrooms"]),
            }
            for item in bathroom_counts
        ]

        return Response(
            {
                "bathroom_choices": bathroom_choices,
                "bedroom_choices": bedroom_choices,
                "cities": [
                    {
                        "count": item["count"],
                        "label": item["city"],
                        "value": item["city"],
                    }
                    for item in city_counts
                ],
                "districts": [
                    {
                        "count": item["count"],
                        "label": item["district"],
                        "value": item["district"],
                    }
                    for item in district_counts
                ],
                "search_choices": asset_type_choices + district_choices,
            }
        )

    def list(self, request, *args, **kwargs):
        # Retourne les annonces avec prise en charge d'un mode page ou limit/offset.
        # La reponse garde un format simple pour rester compatible avec le frontend actuel.
        queryset = self.filter_queryset(self.get_queryset())

        page = self._int_query_param("page", minimum=1)
        page_size = self._int_query_param("page_size", minimum=1, maximum=100)
        limit = self._int_query_param("limit", minimum=1, maximum=200)
        offset = self._int_query_param("offset", minimum=0)

        if page is not None or page_size is not None:
            current_page = page or 1
            current_page_size = page_size or limit or 24
            start = (current_page - 1) * current_page_size
            end = start + current_page_size
            total = queryset.count()
            serializer = self.get_serializer(queryset[start:end], many=True)
            has_next = end < total
            has_previous = start > 0
            return Response(
                {
                    "count": total,
                    "next_page": current_page + 1 if has_next else None,
                    "page": current_page,
                    "page_size": current_page_size,
                    "previous_page": current_page - 1 if has_previous else None,
                    "results": serializer.data,
                }
            )

        if limit is not None or offset is not None:
            start = offset or 0
            end = start + (limit or 24)
            queryset = queryset[start:end]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def _decimal_query_param(self, name):
        # Convertit un parametre decimal de la requete en Decimal exploitable.
        # Une valeur vide ou invalide retombe silencieusement sur None.
        value = self.request.query_params.get(name)
        if not value:
            return None
        try:
            return Decimal(value)
        except (InvalidOperation, TypeError):
            return None

    def _int_query_param(self, name, *, minimum=None, maximum=None):
        # Convertit un parametre entier en respectant d'eventuelles bornes.
        # Cela securise la pagination et les limites d'affichage recues de l'API.
        value = self.request.query_params.get(name)
        if value in (None, ""):
            return None
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            return None

        if minimum is not None:
            parsed = max(minimum, parsed)
        if maximum is not None:
            parsed = min(maximum, parsed)
        return parsed


class MarketListingSyncView(APIView):
    # Expose un endpoint admin pour lancer le scraping et la synchronisation ETL.
    # La vue traduit un payload HTTP en parametres exploitables par le pipeline.
    permission_classes = [IsAdministrateur]

    def post(self, request):
        # Lance un cycle de synchronisation ETL avec validation defensive des options.
        # La reponse retourne ensuite les statistiques utiles au pilotage de l'import.
        source = request.data.get("source", "all")
        pages = self._int_value(request.data.get("pages"), default=5, minimum=1, maximum=50)
        limit = self._optional_int_value(request.data.get("limit"), minimum=1, maximum=500)
        sleep_seconds = self._float_value(request.data.get("sleep"), default=0.5, minimum=0, maximum=5)
        timeout = self._int_value(request.data.get("timeout"), default=20, minimum=5, maximum=60)
        new_only = self._bool_value(request.data.get("new_only"), default=True)
        stop_after_existing = self._int_value(
            request.data.get("stop_after_existing"),
            default=30,
            minimum=1,
            maximum=500,
        )

        if source not in {"all", "avito", "mubawab"}:
            return Response(
                {"source": "Source invalide. Utilisez all, avito ou mubawab."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        stats = run_market_scrape(
            source=source,
            pages=pages,
            limit=limit,
            sleep_seconds=sleep_seconds,
            timeout=timeout,
            new_only=new_only,
            stop_after_existing=stop_after_existing,
        )

        return Response(
            {
                "stats": {
                    "created": stats.created,
                    "errors": stats.errors,
                    "existing": stats.existing,
                    "extracted": stats.extracted,
                    "skipped": stats.skipped,
                    "updated": stats.updated,
                },
                "total_market_listings": MarketListing.objects.count(),
            }
        )

    def _bool_value(self, value, *, default):
        # Convertit une valeur libre en booleen avec gestion des cas courants.
        # Le helper accepte aussi bien des bool natifs que des chaines textuelles.
        if value is None:
            return default
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.strip().lower() in {"1", "true", "yes", "on"}
        return bool(value)

    def _float_value(self, value, *, default, minimum, maximum):
        # Convertit une entree libre en float borne par un minimum et un maximum.
        # Les valeurs invalides retombent sur le defaut prevu par l'endpoint.
        if value in (None, ""):
            return default
        try:
            parsed = float(value)
        except (TypeError, ValueError):
            return default
        return max(minimum, min(maximum, parsed))

    def _int_value(self, value, *, default, minimum, maximum):
        # Convertit une entree libre en entier borne.
        # Ce helper est utilise pour proteger pages, timeouts et autres limites ETL.
        if value in (None, ""):
            return default
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            return default
        return max(minimum, min(maximum, parsed))

    def _optional_int_value(self, value, *, minimum, maximum):
        # Convertit une valeur optionnelle en entier borne si elle existe.
        # Le helper renvoie None quand l'appelant n'a rien fourni de valable.
        if value in (None, ""):
            return None
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            return None
        return max(minimum, min(maximum, parsed))
