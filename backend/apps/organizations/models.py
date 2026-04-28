from django.db import models
from django.utils.text import slugify

from smartestate_backend.model_mixins import TimestampedModel


class Organization(TimestampedModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    city = models.CharField(max_length=120, default="Casablanca")
    country = models.CharField(max_length=120, default="Morocco")
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class Membership(TimestampedModel):
    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        MANAGER = "manager", "Manager"
        ANALYST = "analyst", "Analyst"
        VIEWER = "viewer", "Viewer"

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.VIEWER)
    title = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        unique_together = ("organization", "user")
        ordering = ["organization__name", "user__full_name"]

    def __str__(self) -> str:
        return f"{self.user} @ {self.organization}"
