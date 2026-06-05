# Declaration de l'app `intelligence` pour Django.
from django.apps import AppConfig


class IntelligenceConfig(AppConfig):
    # Declare l'application Django du moteur d'intelligence immobiliere.
    # Cette configuration identifie l'app et son libelle dans l'ecosysteme Django.
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.intelligence"
    label = "intelligence"
    verbose_name = "Intelligence"
