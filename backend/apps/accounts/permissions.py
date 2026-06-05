# Regles d'acces basees sur le role et le contexte utilisateur.
from django.conf import settings
from rest_framework.permissions import BasePermission

from apps.accounts.models import User


def has_any_role(user, *roles: str) -> bool:
    # Indique si l'utilisateur authentifie possede l'un des roles attendus.
    # Ce helper evite de dupliquer la meme verification dans plusieurs permissions.
    return bool(
        getattr(user, "is_authenticated", False)
        and getattr(user, "role", "") in roles
    )


class RolePermission(BasePermission):
    # Defini une permission generique basee sur les roles applicatifs.
    # Les sous-classes n'ont plus qu'a declarer la liste des roles autorises.
    allowed_roles: tuple[str, ...] = ()
    message = "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource."

    def has_permission(self, request, view):
        # Autorise ou refuse la requete selon le mode demo et le role utilisateur.
        # La logique reste volontairement centralisee pour toutes les permissions de role.
        if settings.PUBLIC_DEMO_ACCESS and not getattr(request.user, "is_authenticated", False):
            return True
        return has_any_role(request.user, *self.allowed_roles)


class IsUtilisateurSimple(RolePermission):
    # Autorise uniquement les utilisateurs simples de la plateforme.
    # Cette permission sert aux vues reservees aux comptes particuliers.
    allowed_roles = (User.Role.UTILISATEUR_SIMPLE,)


class IsAgentImmobilier(RolePermission):
    # Autorise uniquement les comptes ayant le role d'agent immobilier.
    # Elle protege les endpoints necessitant un acces metier intermediaire.
    allowed_roles = (User.Role.AGENT_IMMOBILIER,)


class IsAdministrateur(RolePermission):
    # Autorise uniquement les administrateurs applicatifs.
    # Ce garde-fou est utilise sur les actions de gestion les plus sensibles.
    allowed_roles = (User.Role.ADMINISTRATEUR,)


class IsAgentOrAdmin(RolePermission):
    # Autorise les agents immobiliers ainsi que les administrateurs.
    # Elle couvre les espaces metier partages entre operationnel et supervision.
    allowed_roles = (
        User.Role.AGENT_IMMOBILIER,
        User.Role.ADMINISTRATEUR,
    )
