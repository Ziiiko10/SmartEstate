from django.db import models
from django.utils.text import slugify

from smartestate_backend.model_mixins import TimestampedModel


class Portfolio(TimestampedModel):
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="portfolios",
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(blank=True)
    strategy = models.CharField(max_length=255, blank=True)
    benchmark_return = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    target_occupancy = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default="MAD")
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]
        unique_together = ("organization", "slug")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class PortfolioHolding(TimestampedModel):
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name="holdings",
    )
    asset = models.ForeignKey(
        "properties.PropertyAsset",
        on_delete=models.CASCADE,
        related_name="holdings",
    )
    allocation_share = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    debt_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    target_price = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ("portfolio", "asset")
        ordering = ["portfolio__name", "asset__name"]

    def __str__(self) -> str:
        return f"{self.asset} in {self.portfolio}"
