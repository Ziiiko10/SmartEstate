# Declaration de l'app `accounts` pour Django.
from django.apps import AppConfig


class AccountsConfig(AppConfig):
    # Declare l'application Django responsable des comptes et de l'authentification.
    # Cette configuration expose aussi son label interne et son nom d'affichage.
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"
    label = "accounts"
    verbose_name = "Accounts"
