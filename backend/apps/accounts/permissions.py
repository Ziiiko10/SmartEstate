from django.conf import settings
from rest_framework.permissions import BasePermission

from apps.accounts.models import User


def has_any_role(user, *roles: str) -> bool:
    return bool(
        getattr(user, "is_authenticated", False)
        and getattr(user, "role", "") in roles
    )


class RolePermission(BasePermission):
    allowed_roles: tuple[str, ...] = ()
    message = "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource."

    def has_permission(self, request, view):
        if settings.PUBLIC_DEMO_ACCESS and not getattr(request.user, "is_authenticated", False):
            return True
        return has_any_role(request.user, *self.allowed_roles)


class IsUtilisateurSimple(RolePermission):
    allowed_roles = (User.Role.UTILISATEUR_SIMPLE,)


class IsAgentImmobilier(RolePermission):
    allowed_roles = (User.Role.AGENT_IMMOBILIER,)


class IsAdministrateur(RolePermission):
    allowed_roles = (User.Role.ADMINISTRATEUR,)


class IsAgentOrAdmin(RolePermission):
    allowed_roles = (
        User.Role.AGENT_IMMOBILIER,
        User.Role.ADMINISTRATEUR,
    )
