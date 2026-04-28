from django.contrib import admin

from apps.organizations.models import Membership, Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "country", "created_at")
    search_fields = ("name", "city", "country")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "organization", "role", "title", "is_primary")
    list_filter = ("role", "is_primary", "organization")
    search_fields = ("user__full_name", "user__email", "organization__name")
