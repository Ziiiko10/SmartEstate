from apps.organizations.models import Organization


def visible_organizations(user):
    if not getattr(user, "is_authenticated", False):
        return Organization.objects.none()
    if user.is_superuser or user.is_staff:
        return Organization.objects.all()
    return Organization.objects.filter(memberships__user=user).distinct()
