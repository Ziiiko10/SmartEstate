from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from apps.accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone_number",
            "avatar_image",
            "role",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "is_active", "created_at"]


class CurrentUserUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False)
    full_name = serializers.CharField(required=False, allow_blank=False)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=32)
    avatar_image = serializers.CharField(required=False, allow_blank=True, trim_whitespace=False)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone_number",
            "avatar_image",
            "role",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "role", "is_active", "created_at"]

    def validate_email(self, value):
        return User.objects.normalize_email(value)

    def validate_full_name(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Le nom complet est obligatoire.")
        return cleaned

    def validate_phone_number(self, value):
        return value.strip()

    def validate_avatar_image(self, value):
        cleaned = value.strip()

        if not cleaned:
            return ""

        if len(cleaned) > 3_000_000:
            raise serializers.ValidationError(
                "L'image de profil est trop volumineuse. Utilisez une image de 2 Mo maximum."
            )

        if not cleaned.startswith("data:image/") or ";base64," not in cleaned:
            raise serializers.ValidationError(
                "Le format de l'image de profil est invalide."
            )

        return cleaned


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.Role.choices, required=False)

    class Meta:
        model = User
        fields = ["email", "full_name", "phone_number", "role", "password"]

    def validate_role(self, value):
        if value != User.Role.UTILISATEUR_SIMPLE:
            raise serializers.ValidationError(
                "L'inscription publique est réservée au rôle utilisateur simple."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data["role"] = User.Role.UTILISATEUR_SIMPLE
        user = User.objects.create_user(password=password, **validated_data)
        Token.objects.get_or_create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        request = self.context.get("request")
        user = authenticate(request=request, email=attrs["email"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Identifiants invalides.")
        attrs["user"] = user
        return attrs


class UserManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone_number",
            "role",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "email", "created_at"]

    def update(self, instance, validated_data):
        role = validated_data.get("role")
        if role == User.Role.ADMINISTRATEUR:
            instance.is_staff = True
        elif role in {
            User.Role.UTILISATEUR_SIMPLE,
            User.Role.AGENT_IMMOBILIER,
        } and not instance.is_superuser:
            instance.is_staff = False
        return super().update(instance, validated_data)
