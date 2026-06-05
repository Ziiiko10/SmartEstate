# Modele des organisations, equipes et appartenances utilisateur.
from django.db import models
from django.utils.text import slugify

from smartestate_backend.model_mixins import TimestampedModel


class Organization(TimestampedModel):
    # Represente une agence ou organisation utilisee dans la plateforme.
    # Elle sert de racine de rattachement pour les actifs, equipes et portefeuilles.
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    city = models.CharField(max_length=120, default="Casablanca")
    country = models.CharField(max_length=120, default="Morocco")
    description = models.TextField(blank=True)

    class Meta:
        # Definit le tri par defaut des organisations.
        # L'ordre alphabetique simplifie la lecture dans les listes et l'admin.
        ordering = ["name"]

    def save(self, *args, **kwargs):
        # Genere automatiquement le slug si l'organisation n'en fournit pas.
        # Cela garantit un identifiant lisible sans forcer la saisie manuelle.
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        # Retourne le nom de l'organisation pour les interfaces d'administration.
        # Ce libelle court suffit dans les listes, selections et logs.
        return self.name


class Membership(TimestampedModel):
    # Lie un utilisateur a une organisation avec un role equipe specifique.
    # Ce modele porte aussi le titre affiche et le drapeau de contact principal.
    class Role(models.TextChoices):
        # Enumere les roles possibles au sein d'une organisation.
        # Ces choix servent a structurer l'equipe et ses responsabilites metier.
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
        # Impose une seule appartenance par couple organisation-utilisateur.
        # Le tri facilite la lecture par organisation puis par membre.
        unique_together = ("organization", "user")
        ordering = ["organization__name", "user__full_name"]

    def __str__(self) -> str:
        # Retourne un resume lisible de l'appartenance utilisateur-organisation.
        # Cette representation est utile dans l'administration et le debug.
        return f"{self.user} @ {self.organization}"
