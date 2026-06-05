# Serialise les annonces, leurs filtres et les champs exposes par l'API.
from rest_framework import serializers

from apps.properties.models import MarketListing, PropertyAsset


class PropertyAssetSerializer(serializers.ModelSerializer):
    # Serialise les actifs immobiliers pour les endpoints backend.
    # Le nom de l'organisation est expose en lecture seule pour le frontend.
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = PropertyAsset
        fields = [
            "id",
            "organization",
            "organization_name",
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
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class MarketListingSerializer(serializers.ModelSerializer):
    # Serialise les annonces de marche visibles dans l'API.
    # Plusieurs champs derives sont calcules pour faciliter l'affichage cote client.
    image_urls = serializers.SerializerMethodField()
    price_per_sqm = serializers.SerializerMethodField()
    primary_image_url = serializers.SerializerMethodField()

    class Meta:
        model = MarketListing
        fields = [
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
            "image_urls",
            "primary_image_url",
            "area_sqm",
            "price_per_sqm",
            "bedrooms",
            "bathrooms",
            "seller_name",
            "published_label",
            "scraped_at",
            "last_seen_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_price_per_sqm(self, obj):
        # Calcule le prix au metre carre quand prix et surface sont disponibles.
        # La methode renvoie None si le calcul n'est pas exploitable ou non pertinent.
        if not obj.price or not obj.area_sqm:
            return None
        if obj.area_sqm == 0:
            return None
        return round(obj.price / obj.area_sqm, 2)

    def get_image_urls(self, obj):
        # Retourne toutes les images associees a l'annonce.
        # Le serializer delegue ici la logique au modele pour rester simple.
        return obj.image_urls

    def get_primary_image_url(self, obj):
        # Retourne l'image principale exposee a l'API.
        # Cette valeur est derivee du tableau d'images stocke dans le modele.
        return obj.primary_image_url
