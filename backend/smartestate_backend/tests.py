# Tests globaux du projet backend quand ils ne ciblent pas une app specifique.
from django.contrib.auth.models import AnonymousUser
from django.test import TestCase, override_settings

from apps.organizations.models import Organization
from smartestate_backend.access import visible_organizations


class PublicDemoAccessTests(TestCase):
    # Verifie les regles de visibilite des organisations en mode demo public.
    # Ces tests protegent le comportement attendu pour les utilisateurs anonymes.
    def test_anonymous_user_can_see_organizations_in_public_demo_mode(self):
        organization = Organization.objects.create(name="SmartEstate Demo")

        with override_settings(PUBLIC_DEMO_ACCESS=True):
            queryset = visible_organizations(AnonymousUser())

        self.assertEqual(list(queryset), [organization])

    def test_anonymous_user_sees_no_organizations_when_public_demo_is_disabled(self):
        Organization.objects.create(name="SmartEstate Demo")

        with override_settings(PUBLIC_DEMO_ACCESS=False):
            queryset = visible_organizations(AnonymousUser())

        self.assertEqual(queryset.count(), 0)
