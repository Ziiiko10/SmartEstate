from django.db import models

from smartestate_backend.model_mixins import TimestampedModel


class Scenario(TimestampedModel):
    class Strategy(models.TextChoices):
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
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class Valuation(TimestampedModel):
    class Status(models.TextChoices):
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
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class Recommendation(TimestampedModel):
    class Category(models.TextChoices):
        ACQUISITION = "acquisition", "Acquisition"
        DISPOSITION = "disposition", "Disposition"
        OPTIMIZATION = "optimization", "Optimization"
        RISK = "risk", "Risk"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    class Status(models.TextChoices):
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
        ordering = ["priority", "-created_at"]

    def __str__(self) -> str:
        return self.title


class Report(TimestampedModel):
    class ReportType(models.TextChoices):
        MARKET = "market", "Market"
        PORTFOLIO = "portfolio", "Portfolio"
        FINANCIAL = "financial", "Financial"
        RISK = "risk", "Risk"

    class Status(models.TextChoices):
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
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title
