# Serialise l'authentification, la mise a jour du profil et l'inscription publique.
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from apps.accounts.models import User

PUBLIC_REGISTRATION_ROLE_CHOICES = (
    (User.Role.UTILISATEUR_SIMPLE, "Utilisateur particulier"),
    (User.Role.AGENT_IMMOBILIER, "Agent immobilier"),
)


class UserSerializer(serializers.ModelSerializer):
    # Serialise les informations publiques d'un utilisateur pour les reponses API.
    # Les champs sensibles ou internes restent exclus de cette representation.
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
    # Gere la mise a jour du profil courant par l'utilisateur lui-meme.
    # Le serializer autorise seulement les champs modifiables depuis l'espace personnel.
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
        read_only_fields = ["id", "email", "role", "is_active", "created_at"]

    def validate_full_name(self, value):
        # Nettoie le nom complet et refuse une valeur reduite a des espaces.
        # Cela garantit un profil affichable et exploitable partout dans l'application.
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Le nom complet est obligatoire.")
        return cleaned

    def validate_phone_number(self, value):
        # Nettoie le numero de telephone sans imposer de format trop strict.
        # L'objectif est surtout d'eviter les espaces parasites en base.
        return value.strip()

    def validate_avatar_image(self, value):
        # Verifie que l'avatar transmis ressemble bien a une image inline en base64.
        # La taille est aussi limitee pour eviter des charges trop lourdes en base.
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
    # Gere l'inscription publique des nouveaux comptes SmartEstate.
    # Le serializer limite volontairement les roles pouvant etre choisis a l'entree.
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(
        choices=PUBLIC_REGISTRATION_ROLE_CHOICES,
        default=User.Role.UTILISATEUR_SIMPLE,
        required=False,
    )

    class Meta:
        model = User
        fields = ["email", "full_name", "phone_number", "role", "password"]

    def create(self, validated_data):
        # Cree l'utilisateur inscrit puis s'assure qu'un token d'authentification existe.
        # Le role retombe sur utilisateur simple si rien n'est precise.
        password = validated_data.pop("password")
        validated_data["role"] = validated_data.get("role", User.Role.UTILISATEUR_SIMPLE)
        user = User.objects.create_user(password=password, **validated_data)
        Token.objects.get_or_create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    # Valide les identifiants de connexion avant emission du token cote vue.
    # Cette couche concentre l'authentification et les messages d'erreur associes.
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        # Authentifie l'utilisateur a partir de l'email et du mot de passe recus.
        # En cas de succes, l'objet utilisateur est reinjecte dans les donnees validees.
        request = self.context.get("request")
        user = authenticate(request=request, email=attrs["email"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Identifiants invalides.")
        attrs["user"] = user
        return attrs


class UserManagementSerializer(serializers.ModelSerializer):
    # Expose les champs utilises par l'administration pour gerer les comptes.
    # Il ajuste aussi certains drapeaux Django quand le role change.
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
        # Maintient la coherence entre role applicatif et drapeaux d'administration.
        # Un simple utilisateur ou agent ne doit pas garder is_staff par inadvertance.
        role = validated_data.get("role")
        if role == User.Role.ADMINISTRATEUR:
            instance.is_staff = True
        elif role in {
            User.Role.UTILISATEUR_SIMPLE,
            User.Role.AGENT_IMMOBILIER,
        } and not instance.is_superuser:
            instance.is_staff = False
        return super().update(instance, validated_data)
