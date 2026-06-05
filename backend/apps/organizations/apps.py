# Declaration de l'app `organizations` pour Django.
from django.apps import AppConfig


class OrganizationsConfig(AppConfig):
    # Declare l'application Django qui porte les organisations et memberships.
    # Cette configuration donne a Django son nom interne et son libelle d'affichage.
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.organizations"
    label = "organizations"
    verbose_name = "Organizations"
