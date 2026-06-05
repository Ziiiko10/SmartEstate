# Donnees et objets metier relies a l'IA immobiliere.
from django.db import models

from smartestate_backend.model_mixins import TimestampedModel


class Scenario(TimestampedModel):
    # Represente un scenario d'investissement ou d'exploitation projete.
    # Le modele stocke les hypotheses principales et les indicateurs resultat.
    class Strategy(models.TextChoices):
        # Enumere les grandes strategies prises en charge par la simulation.
        # Ces valeurs facilitent les filtres, statistiques et parcours frontend.
        LONG_TERM = "long_term", "Longue duree"
        SEASONAL = "seasonal", "Saisonnier"
        FLIP = "flip", "Achat revente"

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="scenarios",
    )
    asset = models.ForeignKey(
        "properties.PropertyAsset",
        on_delete=models.SET_NULL,
        related_name="scenarios",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    strategy = models.CharField(max_length=32, choices=Strategy.choices)
    down_payment = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    loan_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    loan_years = models.PositiveIntegerField(default=20)
    renovation_budget = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    holding_period_years = models.PositiveIntegerField(default=10)
    projected_monthly_cashflow = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    projected_irr = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    projected_exit_value = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    assumptions = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        # Trie les scenarios du plus recent au plus ancien.
        # Ce choix colle au besoin de consulter d'abord les derniers calculs.
        ordering = ["-created_at"]

    def __str__(self) -> str:
        # Retourne le titre du scenario pour l'admin et les journaux applicatifs.
        # Ce libelle est suffisant pour reconnaitre rapidement une simulation.
        return self.title


class Valuation(TimestampedModel):
    # Represente une estimation immobiliere sauvegardee par le backend.
    # Le modele conserve la fourchette, la confiance et le payload d'entree.
    class Status(models.TextChoices):
        # Enumere les etats de vie d'une estimation enregistree.
        # La valeur completed couvre les valuations produites et finalisees.
        DRAFT = "draft", "Brouillon"
        COMPLETED = "completed", "Complete"

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="valuations",
    )
    asset = models.ForeignKey(
        "properties.PropertyAsset",
        on_delete=models.SET_NULL,
        related_name="valuations",
        null=True,
        blank=True,
    )
    requested_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="valuations",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.COMPLETED)
    estimated_value = models.DecimalField(max_digits=14, decimal_places=2)
    low_estimate = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    high_estimate = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    model_version = models.CharField(max_length=64, default="v1")
    input_payload = models.JSONField(default=dict, blank=True)
    summary = models.TextField(blank=True)

    class Meta:
        # Trie les estimations des plus recentes aux plus anciennes.
        # Cela met les dernieres analyses en tete des vues et de l'admin.
        ordering = ["-created_at"]

    def __str__(self) -> str:
        # Retourne le titre de l'estimation pour les interfaces d'administration.
        # Le titre suffit a resumer l'analyse dans les listes.
        return self.title


class Recommendation(TimestampedModel):
    # Represente une recommandation d'action produite pour un actif ou une organisation.
    # Le modele porte aussi sa priorite, son statut et le ROI attendu.
    class Category(models.TextChoices):
        # Enumere les familles de recommandations suivies par la plateforme.
        # Chaque categorie aide a regrouper les actions par objectif metier.
        ACQUISITION = "acquisition", "Acquisition"
        DISPOSITION = "disposition", "Disposition"
        OPTIMIZATION = "optimization", "Optimization"
        RISK = "risk", "Risk"

    class Priority(models.TextChoices):
        # Enumere les niveaux d'urgence associes a une recommandation.
        # Le tri du modele s'appuie ensuite sur cette priorite.
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    class Status(models.TextChoices):
        # Enumere les etats de traitement d'une recommandation.
        # Cela permet de suivre si l'action est ouverte, acceptee ou rejetee.
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In Progress"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="recommendations",
    )
    asset = models.ForeignKey(
        "properties.PropertyAsset",
        on_delete=models.SET_NULL,
        related_name="recommendations",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=32, choices=Category.choices)
    priority = models.CharField(max_length=16, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.OPEN)
    expected_roi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    action_items = models.JSONField(default=list, blank=True)

    class Meta:
        # Trie les recommandations par priorite puis par date recente.
        # Les actions les plus urgentes remontent ainsi naturellement en premier.
        ordering = ["priority", "-created_at"]

    def __str__(self) -> str:
        # Retourne le titre de la recommandation.
        # Ce texte est utilise comme resume rapide dans les listes et l'admin.
        return self.title


class Report(TimestampedModel):
    # Represente un rapport genere pour un actif, un portefeuille ou le marche.
    # Le modele suit son type, son statut, son fichier et ses metadonnees.
    class ReportType(models.TextChoices):
        # Enumere les types de rapports que la plateforme sait produire.
        # Cette categorisation facilite ensuite la navigation et les filtres.
        MARKET = "market", "Market"
        PORTFOLIO = "portfolio", "Portfolio"
        FINANCIAL = "financial", "Financial"
        RISK = "risk", "Risk"

    class Status(models.TextChoices):
        # Enumere les etats de production possibles pour un rapport.
        # Le frontend peut s'appuyer dessus pour informer l'utilisateur.
        GENERATING = "generating", "Generating"
        READY = "ready", "Ready"
        ARCHIVED = "archived", "Archived"

    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="reports",
    )
    portfolio = models.ForeignKey(
        "portfolios.Portfolio",
        on_delete=models.SET_NULL,
        related_name="reports",
        null=True,
        blank=True,
    )
    asset = models.ForeignKey(
        "properties.PropertyAsset",
        on_delete=models.SET_NULL,
        related_name="reports",
        null=True,
        blank=True,
    )
    generated_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="reports",
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=32, choices=ReportType.choices)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.READY)
    file_url = models.URLField(blank=True)
    summary = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        # Trie les rapports par ordre antichronologique.
        # Les derniers exports generes restent ainsi les plus visibles.
        ordering = ["-created_at"]

    def __str__(self) -> str:
        # Retourne le titre du rapport pour les listes et outils d'administration.
        # Cela suffit a reconnaitre le contenu sans ouvrir le detail.
        return self.title
