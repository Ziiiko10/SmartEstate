# Aide a filtrer les organisations visibles selon le contexte et le role.
from django.conf import settings

from apps.organizations.models import Organization


def visible_organizations(user):
    # Retourne les organisations visibles pour l'utilisateur courant.
    # La regle gere le mode demo public, les administrateurs et les membres standards.
    if not getattr(user, "is_authenticated", False):
        if settings.PUBLIC_DEMO_ACCESS:
            return Organization.objects.all()
        return Organization.objects.none()
    if user.is_superuser or user.is_staff:
        return Organization.objects.all()
    return Organization.objects.filter(memberships__user=user).distinct()
