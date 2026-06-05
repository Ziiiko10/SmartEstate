# Modele des portefeuilles et des actifs regroupes par organisation.
from django.db import models
from django.utils.text import slugify

from smartestate_backend.model_mixins import TimestampedModel


class Portfolio(TimestampedModel):
    # Represente un portefeuille d'actifs rattache a une organisation.
    # Il stocke aussi la strategie, les objectifs et quelques indicateurs cibles.
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
        # Trie les portefeuilles par nom et impose l'unicite du slug par organisation.
        # Cela autorise des noms similaires entre organisations differentes si besoin.
        ordering = ["name"]
        unique_together = ("organization", "slug")

    def save(self, *args, **kwargs):
        # Genere un slug lisible quand aucun slug n'a ete saisi.
        # Ce comportement garde des URLs et identifiants internes plus stables.
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        # Retourne le nom du portefeuille pour les listes et journaux d'administration.
        # Un libelle court suffit ici car le contexte apporte deja l'organisation.
        return self.name


class PortfolioHolding(TimestampedModel):
    # Represente la presence d'un actif dans un portefeuille donne.
    # Le modele conserve l'allocation, la dette associee et quelques notes de suivi.
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
        # Interdit d'ajouter deux fois le meme actif dans un portefeuille.
        # Le tri par portefeuille puis actif rend les ecrans de gestion plus lisibles.
        unique_together = ("portfolio", "asset")
        ordering = ["portfolio__name", "asset__name"]

    def __str__(self) -> str:
        # Retourne une representation concise de la position portefeuille-actif.
        # Elle facilite la lecture des relations dans les outils d'administration.
        return f"{self.asset} in {self.portfolio}"
