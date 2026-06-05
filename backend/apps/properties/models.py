# Modele des annonces et des donnees de marche importees.
from django.db import models

from smartestate_backend.model_mixins import TimestampedModel


class PropertyAsset(TimestampedModel):
    # Represente un actif immobilier gere en interne par une organisation.
    # Le modele stocke ses caracteristiques physiques, financieres et son statut de vie.
    class AssetType(models.TextChoices):
        # Enumere les grandes familles d'actifs supportees par la plateforme.
        # Ces choix sont reutilises par les formulaires, filtres et algorithmes.
        APARTMENT = "apartment", "Appartement"
        VILLA = "villa", "Villa"
        OFFICE = "office", "Bureau"
        RETAIL = "retail", "Retail"
        LAND = "land", "Terrain"
        HOSPITALITY = "hospitality", "Hospitality"

    class Status(models.TextChoices):
        # Enumere les etats de suivi d'un actif dans le portefeuille.
        # Le statut pilote ensuite plusieurs vues dashboard et workflows de gestion.
        ACTIVE = "active", "Actif"
        PIPELINE = "pipeline", "Pipeline"
        SOLD = "sold", "Vendu"
        ARCHIVED = "archived", "Archive"

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="assets",
    )
    name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=32, choices=AssetType.choices)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.ACTIVE)
    city = models.CharField(max_length=120)
    district = models.CharField(max_length=120, blank=True)
    address = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    area_sqm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    bedrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    bathrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    acquisition_date = models.DateField(null=True, blank=True)
    acquisition_price = models.DecimalField(max_digits=14, decimal_places=2)
    current_value = models.DecimalField(max_digits=14, decimal_places=2)
    monthly_rent = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    occupancy_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    annual_yield = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default="MAD")
    notes = models.TextField(blank=True)

    class Meta:
        # Trie les actifs par nom pour garder des listes stables et lisibles.
        # Ce choix est pratique dans l'admin comme dans les selecteurs simples.
        ordering = ["name"]

    def __str__(self) -> str:
        # Retourne le nom metier de l'actif pour les interfaces d'administration.
        # Cette representation est suffisante dans les listes et journaux usuels.
        return self.name


class MarketListing(TimestampedModel):
    # Represente une annonce de marche importee depuis une source externe.
    # Le modele conserve la version normalisee ainsi que le payload brut utile au debug.
    class Source(models.TextChoices):
        # Enumere les plateformes de collecte actuellement supportees.
        # La source permet de suivre l'origine des donnees et d'adapter le scraping.
        AVITO = "avito", "Avito"
        MUBAWAB = "mubawab", "Mubawab"

    class AssetType(models.TextChoices):
        # Enumere les types de bien detectables dans les annonces de marche.
        # Une valeur unknown reste disponible quand la source est trop ambigue.
        APARTMENT = "apartment", "Appartement"
        VILLA = "villa", "Villa"
        OFFICE = "office", "Bureau"
        RETAIL = "retail", "Retail"
        LAND = "land", "Terrain"
        HOSPITALITY = "hospitality", "Hospitality"
        UNKNOWN = "unknown", "Inconnu"

    class TransactionType(models.TextChoices):
        # Enumere les modes de transaction identifies pendant le scraping.
        # Ces choix distinguent vente, location longue duree et location courte duree.
        SALE = "sale", "Vente"
        RENT = "rent", "Location"
        VACATION = "vacation", "Location courte duree"
        UNKNOWN = "unknown", "Inconnu"

    source = models.CharField(max_length=32, choices=Source.choices)
    source_id = models.CharField(max_length=120, blank=True)
    external_url = models.URLField(max_length=1000)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    asset_type = models.CharField(
        max_length=32,
        choices=AssetType.choices,
        default=AssetType.UNKNOWN,
    )
    transaction_type = models.CharField(
        max_length=32,
        choices=TransactionType.choices,
        default=TransactionType.UNKNOWN,
    )
    city = models.CharField(max_length=120, blank=True)
    district = models.CharField(max_length=120, blank=True)
    price = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=8, default="MAD")
    price_period = models.CharField(max_length=32, blank=True)
    area_sqm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    bedrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    bathrooms = models.PositiveSmallIntegerField(null=True, blank=True)
    seller_name = models.CharField(max_length=255, blank=True)
    published_label = models.CharField(max_length=120, blank=True)
    scraped_at = models.DateTimeField()
    last_seen_at = models.DateTimeField()
    raw_payload = models.JSONField(default=dict, blank=True)

    class Meta:
        # Defini le tri, l'unicite fonctionnelle et les index utiles aux recherches.
        # Les contraintes evitent surtout de dupliquer la meme URL dans une source donnee.
        ordering = ["-last_seen_at", "source", "title"]
        constraints = [
            models.UniqueConstraint(
                fields=["source", "external_url"],
                name="uniq_market_listing_source_url",
            )
        ]
        indexes = [
            models.Index(fields=["source", "last_seen_at"]),
            models.Index(fields=["city", "district"]),
            models.Index(fields=["asset_type", "transaction_type"]),
        ]

    def __str__(self) -> str:
        # Retourne un resume court combinant la source et le titre de l'annonce.
        # Ce libelle est pratique dans l'admin et pour les sorties de debug.
        return f"{self.get_source_display()} - {self.title}"

    @property
    def image_urls(self) -> list[str]:
        # Extrait la liste des images de l'annonce depuis le payload JSON brut.
        # Seules les URLs valides sont retournees pour simplifier la consommation API.
        images = self.raw_payload.get("images", [])
        if not isinstance(images, list):
            return []
        return [image for image in images if isinstance(image, str) and image]

    @property
    def primary_image_url(self) -> str:
        # Retourne l'image principale de l'annonce quand elle existe.
        # Cette propriete evite au frontend de refaire ce choix a chaque affichage.
        return self.image_urls[0] if self.image_urls else ""
