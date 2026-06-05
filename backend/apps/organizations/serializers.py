# Serialise les organisations et les liens entre membres.
from rest_framework import serializers

from apps.organizations.models import Membership, Organization


class OrganizationSerializer(serializers.ModelSerializer):
    # Serialise les organisations exposees par l'API.
    # Il ajoute aussi le nombre de membres quand le queryset l'annote.
    member_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "slug",
            "city",
            "country",
            "description",
            "member_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "member_count", "created_at", "updated_at"]


class MembershipSerializer(serializers.ModelSerializer):
    # Serialise les memberships avec quelques informations denormalisees utiles au frontend.
    # Les champs utilisateur et organisation les plus consultes sont exposes en lecture seule.
    user_is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    user_role = serializers.CharField(source="user.role", read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = Membership
        fields = [
            "id",
            "organization",
            "organization_name",
            "user",
            "user_name",
            "user_email",
            "user_role",
            "user_is_active",
            "role",
            "title",
            "is_primary",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
