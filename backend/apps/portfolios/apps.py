# Declaration de l'app `portfolios` pour Django.
from django.apps import AppConfig


class PortfoliosConfig(AppConfig):
    # Declare l'application Django qui gere les portefeuilles immobiliers.
    # Elle expose a Django le nom logique et le libelle d'interface de l'app.
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.portfolios"
    label = "portfolios"
    verbose_name = "Portfolios"
