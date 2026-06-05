# Declaration de l'app `properties` pour Django.
from django.apps import AppConfig


class PropertiesConfig(AppConfig):
    # Declare l'application Django des actifs et annonces immobilieres.
    # Elle donne a Django le nom logique et le libelle de cette brique metier.
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.properties"
    label = "properties"
    verbose_name = "Properties"
