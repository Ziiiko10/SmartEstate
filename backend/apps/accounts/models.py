from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models

from smartestate_backend.model_mixins import TimestampedModel


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMINISTRATEUR)
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser, TimestampedModel):
    class Role(models.TextChoices):
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
        return self.full_name or self.email
