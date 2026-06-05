# Endpoints d'authentification, profil courant et gestion des utilisateurs.
from django.db.models import Q
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.accounts.permissions import IsAdministrateur
from apps.accounts.serializers import (
    CurrentUserUpdateSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserManagementSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    # Expose l'endpoint public d'inscription utilisateur.
    # Cette vue retourne directement le token et le profil serialise apres creation.
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        # Cree le compte demande puis construit la reponse d'authentification initiale.
        # Le frontend recupere ainsi le token sans seconde requete de login.
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        payload = {"token": token.key, "user": UserSerializer(user).data}
        return Response(payload, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    # Expose l'endpoint de connexion a partir d'un email et d'un mot de passe.
    # La vue renvoie le token existant ou nouvellement cree avec les donnees utilisateur.
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Authentifie la requete puis retourne le token et le profil associe.
        # La validation des identifiants est deleguee au serializer de login.
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data})


class CurrentUserView(generics.RetrieveUpdateAPIView):
    # Permet de lire ou modifier le profil de l'utilisateur connecte.
    # La vue bascule de serializer selon qu'on est en lecture ou en mise a jour.
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        # Choisit le serializer de lecture ou d'edition selon la methode HTTP.
        # Cela permet d'exposer plus de donnees en lecture qu'en mise a jour.
        if self.request.method in {"PATCH", "PUT"}:
            return CurrentUserUpdateSerializer
        return UserSerializer

    def get_object(self):
        # Retourne simplement l'utilisateur authentifie courant.
        # Aucune recherche supplementaire n'est necessaire pour cet endpoint personnel.
        return self.request.user


class UserViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    # Expose la gestion administrative des utilisateurs.
    # Le viewset couvre la consultation et la mise a jour sans creation publique ici.
    permission_classes = [IsAdministrateur]
    serializer_class = UserManagementSerializer

    def get_queryset(self):
        # Construit la liste des utilisateurs en tenant compte des filtres admin.
        # La recherche combine role, statut d'activation et texte libre sur le profil.
        queryset = User.objects.order_by("-created_at")

        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)

        is_active = self.request.query_params.get("is_active")
        if is_active in {"true", "false"}:
            queryset = queryset.filter(is_active=is_active == "true")

        query = self.request.query_params.get("q", "").strip()
        if query:
            queryset = queryset.filter(
                Q(full_name__icontains=query) | Q(email__icontains=query)
            )

        return queryset.distinct()
