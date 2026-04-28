from django.db import models

from smartestate_backend.model_mixins import TimestampedModel


class PropertyAsset(TimestampedModel):
    class AssetType(models.TextChoices):
        APARTMENT = "apartment", "Appartement"
        VILLA = "villa", "Villa"
        OFFICE = "office", "Bureau"
        RETAIL = "retail", "Retail"
        LAND = "land", "Terrain"
        HOSPITALITY = "hospitality", "Hospitality"

    class Status(models.TextChoices):
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
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
