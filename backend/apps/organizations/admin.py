# Administration Django des organisations et des membres.
from django.contrib import admin

from apps.organizations.models import Membership, Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    # Configure l'affichage des organisations dans l'administration Django.
    # Les recherches et champs auto-remplis facilitent la gestion quotidienne.
    list_display = ("name", "city", "country", "created_at")
    search_fields = ("name", "city", "country")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    # Configure la consultation des membres d'organisation dans l'admin.
    # Les filtres aident a retrouver rapidement un utilisateur ou une equipe.
    list_display = ("user", "organization", "role", "title", "is_primary")
    list_filter = ("role", "is_primary", "organization")
    search_fields = ("user__full_name", "user__email", "organization__name")
