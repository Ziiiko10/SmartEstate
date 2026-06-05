# Modele utilisateur personnalise avec roles, avatar et gestionnaire de creation.
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models

from smartestate_backend.model_mixins import TimestampedModel


class UserManager(BaseUserManager):
    # Centralise les regles de creation des utilisateurs de la plateforme.
    # Le manager garantit notamment l'usage de l'email comme identifiant principal.
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        # Cree un utilisateur apres normalisation de l'email et hashage du mot de passe.
        # Cette routine commune est reutilisee par les creations standard et admin.
        if not email:
            raise ValueError("L'adresse email est obligatoire.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        # Cree un utilisateur standard avec les drapeaux d'administration desactives.
        # Cela fournit un point d'entree unique pour les inscriptions classiques.
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        # Cree un superutilisateur avec les droits critiques deja positionnes.
        # Le role administrateur applicatif est force pour rester coherent avec Django.
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMINISTRATEUR)
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser, TimestampedModel):
    # Represente un compte utilisateur SmartEstate base sur l'email.
    # Le modele ajoute les roles metier, les coordonnees et l'avatar du profil.
    class Role(models.TextChoices):
        # Enumere les roles applicatifs exposes par la plateforme.
        # Ces valeurs pilotent ensuite les permissions des endpoints backend.
        UTILISATEUR_SIMPLE = "UTILISATEUR_SIMPLE", "Utilisateur simple"
        AGENT_IMMOBILIER = "AGENT_IMMOBILIER", "Agent immobilier"
        ADMINISTRATEUR = "ADMINISTRATEUR", "Administrateur"

    username = None
    first_name = None
    last_name = None

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=32, blank=True)
    avatar_image = models.TextField(blank=True)
    role = models.CharField(
        max_length=32,
        choices=Role.choices,
        default=Role.UTILISATEUR_SIMPLE,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self) -> str:
        # Retourne un libelle court pour afficher l'utilisateur dans l'admin et les logs.
        # Le nom complet est privilegie, avec repli sur l'email si besoin.
        return self.full_name or self.email
