from datetime import datetime, timedelta
from decimal import Decimal

from django.db.models import Avg, Count, Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.accounts.permissions import IsAgentOrAdmin
from smartestate_backend.access import visible_organizations
from apps.intelligence.models import Recommendation, Report, Scenario, Valuation
from apps.intelligence.ml.algorithms import (
    estimate_with_ml_models,
    score_investment_opportunity,
    simulate_investment_scenario,
)
from apps.intelligence.serializers import (
    InvestmentScoreInputSerializer,
    MarketValuationInputSerializer,
    RecommendationSerializer,
    ReportSerializer,
    ScenarioSerializer,
    ScenarioSimulationInputSerializer,
    ValuationSerializer,
)
from apps.organizations.models import Membership
from apps.portfolios.models import Portfolio
from apps.properties.models import MarketListing, PropertyAsset


def decimal_to_float(value):
    if value is None:
        return None
    return float(value)


def money_to_float(value):
    if value is None:
        return 0
    return float(value)


def json_safe(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, dict):
        return {key: json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_safe(item) for item in value]
    return value


class ScenarioViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAgentOrAdmin]
    serializer_class = ScenarioSerializer

    def get_queryset(self):
        return Scenario.objects.filter(
            organization__in=visible_organizations(self.request.user)
        ).select_related("organization", "asset")


class ValuationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAgentOrAdmin]
    serializer_class = ValuationSerializer

    def get_queryset(self):
        return Valuation.objects.filter(
            organization__in=visible_organizations(self.request.user)
        ).select_related("organization", "asset", "requested_by")


class RecommendationViewSet(viewsets.ModelViewSet):
    serializer_class = RecommendationSerializer

    def get_queryset(self):
        queryset = Recommendation.objects.filter(
            organization__in=visible_organizations(self.request.user)
        ).select_related("organization", "asset")
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
        return queryset


class ReportViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAgentOrAdmin]
    serializer_class = ReportSerializer

    def get_queryset(self):
        return Report.objects.filter(
            organization__in=visible_organizations(self.request.user)
        ).select_related("organization", "asset", "portfolio", "generated_by")


class DashboardOverviewView(APIView):
    def get(self, request):
        organizations = visible_organizations(request.user)
        now = timezone.now()
        include_opportunities = request.query_params.get("include_opportunities", "").lower() in {
            "1",
            "true",
            "yes",
        }
        is_admin = (
            getattr(request.user, "role", "") == User.Role.ADMINISTRATEUR
            or getattr(request.user, "is_staff", False)
            or getattr(request.user, "is_superuser", False)
        )

        assets = PropertyAsset.objects.filter(organization__in=organizations)
        portfolios = Portfolio.objects.filter(organization__in=organizations)
        reports = Report.objects.filter(organization__in=organizations)
        recommendations = Recommendation.objects.filter(organization__in=organizations)
        scenarios = Scenario.objects.filter(organization__in=organizations)
        valuations = Valuation.objects.filter(organization__in=organizations)
        market_listings = MarketListing.objects.all()
        users = (
            User.objects.all()
            if is_admin
            else User.objects.filter(memberships__organization__in=organizations).distinct()
        )
        memberships = Membership.objects.filter(organization__in=organizations).select_related(
            "organization",
            "user",
        )
        active_asset_count = assets.filter(status=PropertyAsset.Status.ACTIVE).count()
        distinct_cities_count = self._count_distinct_locations(assets, market_listings, "city")
        distinct_districts_count = self._count_distinct_locations(assets, market_listings, "district")

        metrics = assets.aggregate(
            total_value=Sum("current_value"),
            total_acquisition=Sum("acquisition_price"),
            monthly_cashflow=Sum("monthly_rent"),
            avg_occupancy=Avg("occupancy_rate"),
            avg_yield=Avg("annual_yield"),
        )
        listing_metrics = market_listings.aggregate(
            listing_count=Count("id"),
        )
        sale_market_listings = market_listings.filter(
            transaction_type=MarketListing.TransactionType.SALE,
            price_period="",
            price__gte=50000,
            area_sqm__isnull=False,
        )

        city_breakdown = list(
            assets.values("city").annotate(asset_count=Count("id")).order_by("-asset_count", "city")[:5]
        )
        market_city_breakdown = list(
            market_listings.exclude(city="")
            .values("city")
            .annotate(listing_count=Count("id"), average_price=Avg("price"))
            .order_by("-listing_count", "city")[:6]
        )
        asset_statuses = self._build_choice_breakdown(
            assets,
            "status",
            PropertyAsset.Status,
        )
        market_sources = self._build_choice_breakdown(
            market_listings,
            "source",
            MarketListing.Source,
        )
        market_transactions = self._build_choice_breakdown(
            market_listings,
            "transaction_type",
            MarketListing.TransactionType,
        )
        market_asset_types = self._build_choice_breakdown(
            market_listings,
            "asset_type",
            MarketListing.AssetType,
        )
        user_roles = self._build_choice_breakdown(
            users,
            "role",
            User.Role,
        )

        total_value = metrics["total_value"] or Decimal("0")
        total_acquisition = metrics["total_acquisition"] or Decimal("0")
        monthly_cashflow = metrics["monthly_cashflow"] or Decimal("0")
        value_growth_percent = Decimal("0")
        if total_acquisition > 0:
            value_growth_percent = ((total_value - total_acquisition) / total_acquisition) * Decimal("100")

        avg_market_price_per_sqm = self._average_price_per_sqm(sale_market_listings)

        opportunities = self._build_market_opportunities(market_listings) if include_opportunities else []
        pending_agents = self._build_pending_agents(users, memberships) if is_admin else []
        pending_listings = self._build_pending_listings(assets, memberships)
        top_market_districts = self._build_market_districts(market_listings)
        valuations_by_city = self._build_valuations_by_city(valuations)
        recent_assets = self._build_recent_assets(assets)
        recent_valuations = self._build_recent_valuations(valuations)
        model_state = self._build_model_state(valuations, sale_market_listings)
        alerts = self._build_alerts(
            users,
            market_listings,
            sale_market_listings,
            model_state,
        )
        notifications = self._build_notifications(
            pending_listings,
            recent_valuations,
            recent_assets,
        )
        recent_activity = self._build_recent_activity(
            users,
            assets,
            market_listings,
            valuations,
            pending_agents,
            model_state,
        )
        top_market_city = market_city_breakdown[0] if market_city_breakdown else None
        top_market_district = top_market_districts[0] if top_market_districts else None
        top_market_asset_type = market_asset_types[0] if market_asset_types else None
        activity_series = self._build_activity_series(
            users,
            assets,
            valuations,
            market_listings,
            is_admin=is_admin,
        )
        growth_series = self._build_growth_series(total_acquisition, total_value)

        payload = {
            "refreshed_at": timezone.now(),
            "organizations": organizations.count(),
            "users_total": users.count(),
            "active_users": users.filter(is_active=True).count(),
            "total_agents": users.filter(role=User.Role.AGENT_IMMOBILIER).count(),
            "pending_agents_count": len(pending_agents),
            "total_listings": (listing_metrics["listing_count"] or 0) + assets.count(),
            "assets": assets.count(),
            "active_assets": active_asset_count,
            "pipeline_assets": assets.filter(status=PropertyAsset.Status.PIPELINE).count(),
            "sold_assets": assets.filter(status=PropertyAsset.Status.SOLD).count(),
            "archived_assets": assets.filter(status=PropertyAsset.Status.ARCHIVED).count(),
            "rented_assets": assets.exclude(monthly_rent__isnull=True).filter(
                monthly_rent__gt=0,
                occupancy_rate__gt=0,
            ).count(),
            "portfolios": portfolios.count(),
            "reports": reports.count(),
            "recommendations_open": recommendations.filter(status=Recommendation.Status.OPEN).count(),
            "scenarios": scenarios.count(),
            "valuations": valuations.count(),
            "market_listings": listing_metrics["listing_count"] or 0,
            "published_listings": (listing_metrics["listing_count"] or 0) + active_asset_count,
            "pending_listings_count": len(pending_listings),
            "distinct_market_cities": distinct_cities_count,
            "distinct_market_districts": distinct_districts_count,
            "listings_seen_last_24h": market_listings.filter(
                last_seen_at__gte=now - timedelta(hours=24)
            ).count(),
            "listings_seen_last_7d": market_listings.filter(
                last_seen_at__gte=now - timedelta(days=7)
            ).count(),
            "total_asset_value": money_to_float(total_value),
            "total_acquisition_value": money_to_float(total_acquisition),
            "monthly_cashflow": money_to_float(monthly_cashflow),
            "value_growth_percent": decimal_to_float(value_growth_percent),
            "average_occupancy_rate": decimal_to_float(metrics["avg_occupancy"] or Decimal("0")),
            "average_annual_yield": decimal_to_float(metrics["avg_yield"] or Decimal("0")),
            "average_market_price_per_sqm": decimal_to_float(avg_market_price_per_sqm),
            "top_cities": city_breakdown,
            "market_cities": market_city_breakdown,
            "top_market_city": top_market_city,
            "top_market_district": top_market_district,
            "top_market_asset_type": top_market_asset_type,
            "top_market_districts": top_market_districts,
            "market_asset_types": market_asset_types,
            "valuations_by_city": valuations_by_city,
            "asset_statuses": asset_statuses,
            "market_sources": market_sources,
            "market_transactions": market_transactions,
            "user_roles": user_roles,
            "pending_agents": pending_agents,
            "pending_listings": pending_listings,
            "recent_assets": recent_assets,
            "recent_client_requests": [],
            "client_requests_count": 0,
            "tracked_client_requests": False,
            "top_viewed_assets": [],
            "tracked_asset_views": False,
            "recent_valuations": recent_valuations,
            "notifications": notifications,
            "alerts": alerts,
            "model_state": model_state,
            "tracked_market_engagement": False,
            "activity_series": activity_series,
            "market_signal_note": (
                "Les recherches et consultations utilisateurs ne sont pas encore historisees. "
                "Les villes, quartiers et types affiches ci-dessous utilisent donc le volume "
                "d'annonces ETL comme proxy."
            ),
            "performance_signal_note": (
                "Les vues, contacts recus et taux de conversion ne sont pas encore historises "
                "dans la base actuelle."
            ),
            "opportunities": opportunities,
            "recent_activity": recent_activity,
            "growth_series": growth_series,
        }
        return Response(payload)

    def _build_choice_breakdown(self, queryset, field_name, choices):
        breakdown = []
        for item in (
            queryset.values(field_name)
            .annotate(count=Count("id"))
            .order_by("-count", field_name)
        ):
            key = item.get(field_name)
            if not key:
                continue
            try:
                label = choices(key).label
            except ValueError:
                label = key
            breakdown.append(
                {
                    "key": key,
                    "label": label,
                    "count": item["count"],
                }
            )
        return breakdown

    def _count_distinct_locations(self, assets, market_listings, field_name):
        values = set()
        for value in assets.exclude(**{field_name: ""}).values_list(field_name, flat=True):
            normalized = (value or "").strip()
            if normalized:
                values.add(normalized)
        for value in market_listings.exclude(**{field_name: ""}).values_list(field_name, flat=True):
            normalized = (value or "").strip()
            if normalized:
                values.add(normalized)
        return len(values)

    def _organization_contact_map(self, memberships):
        contacts = {}
        priority_map = {
            Membership.Role.MANAGER: 0,
            Membership.Role.OWNER: 1,
            Membership.Role.ANALYST: 2,
            Membership.Role.VIEWER: 3,
        }
        for membership in memberships.order_by("organization__name", "user__full_name"):
            current = contacts.get(membership.organization_id)
            priority = priority_map.get(membership.role, 99)
            candidate = {
                "agency_name": membership.organization.name,
                "city": membership.organization.city,
                "priority": priority,
                "user_name": membership.user.full_name,
            }
            if current is None or priority < current["priority"]:
                contacts[membership.organization_id] = candidate
        return contacts

    def _build_pending_agents(self, users, memberships):
        agency_map = {}
        for membership in memberships:
            agency_map.setdefault(
                membership.user_id,
                {
                    "agency_name": membership.organization.name,
                    "city": membership.organization.city,
                },
            )

        pending_agents = []
        for agent in users.filter(role=User.Role.AGENT_IMMOBILIER, is_active=False).order_by("-created_at")[:6]:
            agency = agency_map.get(agent.id, {})
            pending_agents.append(
                {
                    "id": agent.id,
                    "full_name": agent.full_name,
                    "email": agent.email,
                    "phone_number": agent.phone_number,
                    "agency_name": agency.get("agency_name", "Agence non renseignee"),
                    "city": agency.get("city", ""),
                    "status": "En attente",
                    "created_at": agent.created_at,
                }
            )
        return pending_agents

    def _build_pending_listings(self, assets, memberships):
        contacts = self._organization_contact_map(memberships)
        pending_assets = []
        for asset in assets.filter(status=PropertyAsset.Status.PIPELINE).order_by("-created_at")[:6]:
            contact = contacts.get(asset.organization_id, {})
            pending_assets.append(
                {
                    "id": asset.id,
                    "title": asset.name,
                    "agent_name": contact.get("user_name", "Non attribue"),
                    "agency_name": contact.get("agency_name", asset.organization.name),
                    "city": asset.city,
                    "district": asset.district,
                    "price": money_to_float(asset.current_value or asset.acquisition_price),
                    "status": "En attente",
                    "created_at": asset.created_at,
                }
            )
        return pending_assets

    def _build_market_districts(self, market_listings):
        return list(
            market_listings.exclude(district="")
            .values("district")
            .annotate(listing_count=Count("id"))
            .order_by("-listing_count", "district")[:6]
        )

    def _build_valuations_by_city(self, valuations):
        city_counts = {}
        for valuation in valuations.select_related("asset"):
            city = ""
            if valuation.asset and valuation.asset.city:
                city = valuation.asset.city
            elif isinstance(valuation.input_payload, dict):
                features = valuation.input_payload.get("features", {})
                if isinstance(features, dict):
                    city = features.get("city", "")
            city = (city or "").strip()
            if not city:
                continue
            city_counts[city] = city_counts.get(city, 0) + 1

        return [
            {"city": city, "count": count}
            for city, count in sorted(city_counts.items(), key=lambda item: (-item[1], item[0]))[:6]
        ]

    def _build_recent_assets(self, assets):
        recent_assets = []
        for asset in assets.order_by("-created_at")[:6]:
            recent_assets.append(
                {
                    "id": asset.id,
                    "title": asset.name,
                    "city": asset.city,
                    "district": asset.district,
                    "price": money_to_float(asset.current_value or asset.acquisition_price),
                    "status": asset.get_status_display(),
                    "views_count": None,
                    "created_at": asset.created_at,
                }
            )
        return recent_assets

    def _build_recent_valuations(self, valuations):
        recent_items = []
        for valuation in valuations.select_related("asset").order_by("-created_at")[:6]:
            features = valuation.input_payload.get("features", {}) if isinstance(valuation.input_payload, dict) else {}
            asking_price = None
            if isinstance(features, dict):
                asking_price = decimal_to_float(features.get("asking_price"))

            city = valuation.asset.city if valuation.asset and valuation.asset.city else features.get("city", "")
            district = (
                valuation.asset.district
                if valuation.asset and valuation.asset.district
                else features.get("district", "")
            )
            raw_asset_type = features.get("asset_type", "") if isinstance(features, dict) else ""
            if valuation.asset:
                asset_type = valuation.asset.get_asset_type_display()
            else:
                try:
                    asset_type = MarketListing.AssetType(raw_asset_type).label
                except ValueError:
                    asset_type = raw_asset_type or "Bien"
            estimated_value = money_to_float(valuation.estimated_value)
            gap_percent = None
            if asking_price and asking_price > 0:
                gap_percent = ((estimated_value - asking_price) / asking_price) * 100

            recent_items.append(
                {
                    "id": valuation.id,
                    "title": valuation.title,
                    "asset_type": asset_type or "Bien",
                    "city": city,
                    "district": district,
                    "asking_price": asking_price,
                    "estimated_value": estimated_value,
                    "gap_percent": gap_percent,
                    "created_at": valuation.created_at,
                }
            )
        return recent_items

    def _build_model_state(self, valuations, sale_market_listings):
        latest_valuation = valuations.order_by("-created_at").first()
        dataset_size = sale_market_listings.count()
        return {
            "model_name": (
                latest_valuation.model_version
                if latest_valuation and latest_valuation.model_version
                else "ensemble_knn_ridge_baseline_v2"
            ),
            "last_training_at": latest_valuation.created_at if latest_valuation else None,
            "dataset_size": dataset_size,
            "r2_score": None,
            "mae": None,
            "rmse": None,
            "status": "active" if dataset_size >= 30 else "update_needed",
            "status_label": "Actif" if dataset_size >= 30 else "A mettre a jour",
            "tracking_note": (
                "La date affichee correspond a la derniere estimation sauvegardee. "
                "L'historique d'entrainement n'est pas encore persiste."
            ),
        }

    def _build_alerts(self, users, market_listings, sale_market_listings, model_state):
        city_averages = {
            item["city"]: item["average_price"]
            for item in sale_market_listings.exclude(city="")
            .values("city")
            .annotate(average_price=Avg("price"))
            if item["average_price"]
        }
        suspicious_count = 0
        for listing in sale_market_listings.exclude(city="").only("city", "price")[:500]:
            average_price = city_averages.get(listing.city)
            if not average_price or not listing.price:
                continue
            if listing.price > average_price * 3 or listing.price < average_price * Decimal("0.25"):
                suspicious_count += 1

        missing_data_count = market_listings.filter(
            Q(city="") | Q(price__isnull=True) | Q(area_sqm__isnull=True)
        ).count()
        blocked_accounts = users.filter(is_active=False).count()

        return [
            {
                "id": "suspicious_listings",
                "title": "Annonces suspectes",
                "description": "Prix tres au-dessus ou tres en dessous de la moyenne observee par ville.",
                "count": suspicious_count,
                "severity": "warning" if suspicious_count else "ok",
            },
            {
                "id": "missing_data",
                "title": "Donnees manquantes",
                "description": "Annonces ETL avec ville, prix ou surface absents.",
                "count": missing_data_count,
                "severity": "warning" if missing_data_count else "ok",
            },
            {
                "id": "blocked_accounts",
                "title": "Comptes bloques",
                "description": "Utilisateurs ou agents inactifs necessitant une verification.",
                "count": blocked_accounts,
                "severity": "warning" if blocked_accounts else "ok",
            },
            {
                "id": "model_status",
                "title": "Etat du modele ML",
                "description": "Le modele doit etre mis a jour si le volume de donnees devient insuffisant.",
                "count": 0 if model_state["status"] == "active" else 1,
                "severity": "warning" if model_state["status"] != "active" else "ok",
            },
        ]

    def _build_notifications(self, pending_listings, recent_valuations, recent_assets):
        notifications = []
        for listing in pending_listings[:2]:
            notifications.append(
                {
                    "title": "Annonce en attente de validation par l'admin",
                    "subtitle": listing["title"],
                    "timestamp": listing["created_at"],
                }
            )
        for valuation in recent_valuations[:2]:
            notifications.append(
                {
                    "title": "Estimation terminee",
                    "subtitle": valuation["title"],
                    "timestamp": valuation["created_at"],
                }
            )
        for asset in recent_assets:
            if asset["status"] != PropertyAsset.Status.ARCHIVED.label:
                continue
            notifications.append(
                {
                    "title": "Annonce desactivee",
                    "subtitle": asset["title"],
                    "timestamp": asset["created_at"],
                }
            )
        notifications.sort(key=lambda item: item["timestamp"], reverse=True)
        return notifications[:6]

    def _build_market_opportunities(self, market_listings):
        candidates = (
            market_listings.filter(
                transaction_type=MarketListing.TransactionType.SALE,
                price_period="",
                price__gte=50000,
                price__isnull=False,
                area_sqm__isnull=False,
            )
            .exclude(city="")
            .order_by("-last_seen_at")[:30]
        )
        all_sales = market_listings.filter(
            transaction_type=MarketListing.TransactionType.SALE,
            price_period="",
            price__gte=50000,
            price__isnull=False,
            area_sqm__isnull=False,
        )

        opportunities = []
        for listing in candidates:
            subject = {
                "city": listing.city,
                "district": listing.district,
                "asset_type": listing.asset_type,
                "area_sqm": listing.area_sqm,
                "bedrooms": listing.bedrooms,
                "bathrooms": listing.bathrooms,
                "asking_price": listing.price,
            }
            estimate = estimate_with_ml_models(subject, all_sales.exclude(id=listing.id), transaction_type="sale")
            score = score_investment_opportunity(subject, estimate)
            if score.get("status") != "ok":
                continue
            opportunities.append(
                {
                    "id": listing.id,
                    "title": listing.title,
                    "source": listing.source,
                    "external_url": listing.external_url,
                    "city": listing.city,
                    "district": listing.district,
                    "asset_type": listing.asset_type,
                    "image_urls": listing.image_urls,
                    "primary_image_url": listing.primary_image_url,
                    "published_label": listing.published_label,
                    "last_seen_at": listing.last_seen_at,
                    "price": money_to_float(listing.price),
                    "area_sqm": decimal_to_float(listing.area_sqm),
                    "score": decimal_to_float(score.get("score")),
                    "signal": score.get("signal"),
                    "market_discount_percent": decimal_to_float(score.get("market_discount_percent")),
                    "estimated_value": decimal_to_float(estimate.get("estimated_value")),
                    "confidence_score": decimal_to_float(estimate.get("confidence_score")),
                }
            )

        opportunities.sort(key=lambda item: item["score"] or 0, reverse=True)
        return opportunities[:4]

    def _average_price_per_sqm(self, listings):
        values = []
        for listing in listings[:200]:
            if listing.price and listing.area_sqm and listing.area_sqm > 0:
                values.append(listing.price / listing.area_sqm)
        if not values:
            return Decimal("0")
        return sum(values) / Decimal(len(values))

    def _build_recent_activity(
        self,
        users,
        assets,
        market_listings,
        valuations,
        pending_agents,
        model_state,
    ):
        activities = []
        for user in users.exclude(
            role=User.Role.AGENT_IMMOBILIER,
            is_active=False,
        ).order_by("-created_at")[:2]:
            activities.append(
                {
                    "type": "user",
                    "icon": "person_add",
                    "title": "Nouvel utilisateur inscrit",
                    "subtitle": user.full_name or user.email,
                    "timestamp": user.created_at,
                }
            )
        for agent in pending_agents[:2]:
            activities.append(
                {
                    "type": "pending_agent",
                    "icon": "badge",
                    "title": "Nouvel agent en attente de validation",
                    "subtitle": agent["full_name"],
                    "timestamp": agent["created_at"],
                }
            )
        for asset in assets.filter(status=PropertyAsset.Status.ACTIVE).order_by("-created_at")[:2]:
            activities.append(
                {
                    "type": "asset",
                    "icon": "domain",
                    "title": "Nouvelle annonce publiee",
                    "subtitle": asset.name,
                    "timestamp": asset.created_at,
                }
            )
        for valuation in valuations.order_by("-created_at")[:2]:
            activities.append(
                {
                    "type": "valuation",
                    "icon": "calculate",
                    "title": "Nouvelle estimation realisee",
                    "subtitle": valuation.title,
                    "timestamp": valuation.created_at,
                }
            )
        for listing in market_listings.order_by("-last_seen_at")[:2]:
            activities.append(
                {
                    "type": "market_data",
                    "icon": "travel_explore",
                    "title": "Donnees immobilieres mises a jour",
                    "subtitle": listing.title,
                    "timestamp": listing.last_seen_at,
                }
            )
        if model_state and model_state.get("last_training_at"):
            activities.append(
                {
                    "type": "model",
                    "icon": "neurology",
                    "title": "Modele ML reentraine",
                    "subtitle": model_state.get("model_name", "Modele non renseigne"),
                    "timestamp": model_state["last_training_at"],
                }
            )
        activities.sort(key=lambda item: item["timestamp"], reverse=True)
        return activities[:6]

    def _build_activity_series(self, users, assets, valuations, market_listings, *, is_admin):
        today = timezone.localdate()
        days = [today - timedelta(days=offset) for offset in range(6, -1, -1)]
        chart = {
            day: {
                "date": day.isoformat(),
                "label": day.strftime("%d %b"),
                "users": 0,
                "assets": 0,
                "valuations": 0,
                "market_updates": 0,
            }
            for day in days
        }
        start = timezone.make_aware(
            datetime.combine(days[0], datetime.min.time()),
            timezone.get_current_timezone(),
        )

        if is_admin:
            for created_at in users.filter(created_at__gte=start).values_list("created_at", flat=True):
                day = timezone.localtime(created_at).date()
                if day in chart:
                    chart[day]["users"] += 1

        for created_at in assets.filter(created_at__gte=start).values_list("created_at", flat=True):
            day = timezone.localtime(created_at).date()
            if day in chart:
                chart[day]["assets"] += 1

        for created_at in valuations.filter(created_at__gte=start).values_list("created_at", flat=True):
            day = timezone.localtime(created_at).date()
            if day in chart:
                chart[day]["valuations"] += 1

        for seen_at in market_listings.filter(last_seen_at__gte=start).values_list("last_seen_at", flat=True):
            day = timezone.localtime(seen_at).date()
            if day in chart:
                chart[day]["market_updates"] += 1

        return [
            {
                **chart[day],
                "total": (
                    chart[day]["users"]
                    + chart[day]["assets"]
                    + chart[day]["valuations"]
                    + chart[day]["market_updates"]
                ),
            }
            for day in days
        ]

    def _build_growth_series(self, total_acquisition, total_value):
        labels = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"]
        start = total_acquisition if total_acquisition > 0 else total_value
        end = total_value if total_value > 0 else start
        if start <= 0 and end <= 0:
            return [{"label": label, "value": 0, "height_percent": 12} for label in labels]

        values = []
        for index, label in enumerate(labels):
            ratio = Decimal(index) / Decimal(len(labels) - 1)
            value = start + (end - start) * ratio
            values.append((label, value))

        max_value = max(value for _, value in values) or Decimal("1")
        return [
            {
                "label": label,
                "value": money_to_float(value),
                "height_percent": max(12, min(96, int((value / max_value) * Decimal("96")))),
            }
            for label, value in values
        ]


class MarketValuationView(APIView):
    def post(self, request):
        serializer = MarketValuationInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        listings = self._base_market_queryset(payload["transaction_type"])
        result = estimate_with_ml_models(
            payload,
            listings,
            transaction_type=payload["transaction_type"],
        )

        saved_valuation_id = None
        if payload.get("save_valuation") and result.get("estimated_value") is not None:
            saved_valuation_id = self._save_valuation(request, payload, result)

        result["saved_valuation_id"] = saved_valuation_id
        return Response(result)

    def _base_market_queryset(self, transaction_type):
        queryset = MarketListing.objects.filter(
            transaction_type=transaction_type,
            price__isnull=False,
            area_sqm__isnull=False,
        )
        if transaction_type == MarketListing.TransactionType.SALE:
            queryset = queryset.filter(price_period="", price__gte=50000)
        return queryset.order_by("-last_seen_at")

    def _save_valuation(self, request, payload, result):
        organizations = visible_organizations(request.user)
        organization_id = payload.get("organization")
        if organization_id:
            organization = get_object_or_404(organizations, id=organization_id)
        else:
            organization = organizations.first()
        if organization is None:
            raise ValidationError({"organization": "Aucune organisation visible pour sauvegarder l'estimation."})

        asset = None
        asset_id = payload.get("asset")
        if asset_id:
            asset = get_object_or_404(
                PropertyAsset.objects.filter(organization__in=organizations),
                id=asset_id,
            )

        title = payload.get("title") or f"Estimation marche {payload['city']}"
        input_payload = json_safe(
            {
                "features": {
                    "city": payload["city"],
                    "district": payload.get("district", ""),
                    "asset_type": payload["asset_type"],
                    "area_sqm": str(payload["area_sqm"]),
                    "bedrooms": payload.get("bedrooms"),
                    "bathrooms": payload.get("bathrooms"),
                    "transaction_type": payload["transaction_type"],
                },
                "sample_size": result.get("sample_size", 0),
                "training_rows": result.get("training_rows", 0),
                "models": result.get("models", []),
            }
        )
        valuation = Valuation.objects.create(
            organization=organization,
            asset=asset,
            requested_by=request.user if request.user.is_authenticated else None,
            title=title,
            estimated_value=result["estimated_value"],
            low_estimate=result["low_estimate"],
            high_estimate=result["high_estimate"],
            confidence_score=result["confidence_score"],
            model_version=result.get("model_version", result["method"]),
            input_payload=input_payload,
            summary=(
                "Estimation ML basee sur "
                f"{result.get('sample_size', 0)} comparables et "
                f"{result.get('training_rows', 0)} lignes d'entrainement marche."
            ),
        )
        return valuation.id


class InvestmentScoreView(APIView):
    def post(self, request):
        serializer = InvestmentScoreInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        sale_estimate = estimate_with_ml_models(
            payload,
            MarketListing.objects.filter(
                transaction_type=MarketListing.TransactionType.SALE,
                price__isnull=False,
                area_sqm__isnull=False,
            ),
            transaction_type=MarketListing.TransactionType.SALE,
        )
        rent_estimate = estimate_with_ml_models(
            payload,
            MarketListing.objects.filter(
                transaction_type=MarketListing.TransactionType.RENT,
                price__isnull=False,
                area_sqm__isnull=False,
            ),
            transaction_type=MarketListing.TransactionType.RENT,
        )
        opportunity = score_investment_opportunity(payload, sale_estimate, rent_estimate)

        return Response(
            {
                "opportunity": opportunity,
                "sale_estimate": sale_estimate,
                "rent_estimate": rent_estimate,
            }
        )


class ScenarioSimulationView(APIView):
    def post(self, request):
        serializer = ScenarioSimulationInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = simulate_investment_scenario(serializer.validated_data)
        return Response(result)
