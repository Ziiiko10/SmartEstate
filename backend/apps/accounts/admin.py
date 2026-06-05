# Configuration de l'administration Django pour les comptes utilisateurs.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.accounts.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Configure l'affichage des utilisateurs dans l'administration Django.
    # Les colonnes, recherches et fieldsets sont adaptes au modele de compte personnalise.
    ordering = ("email",)
    list_display = ("email", "full_name", "role", "is_staff", "is_active")
    search_fields = ("email", "full_name", "phone_number")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profil", {"fields": ("full_name", "phone_number", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login",)}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "full_name", "phone_number", "role", "password1", "password2"),
            },
        ),
    )
