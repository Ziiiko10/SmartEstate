from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings


@override_settings(PUBLIC_DEMO_ACCESS=False)
class AccountRoleTests(TestCase):
    def setUp(self):
        self.User = get_user_model()

    def test_public_registration_defaults_to_utilisateur_simple(self):
        response = self.client.post(
            "/api/auth/register/",
            data={
                "email": "simple@example.com",
                "full_name": "Utilisateur Simple",
                "phone_number": "+212600000001",
                "password": "motdepasse123",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertEqual(payload["user"]["role"], self.User.Role.UTILISATEUR_SIMPLE)

        created_user = self.User.objects.get(email="simple@example.com")
        self.assertEqual(created_user.role, self.User.Role.UTILISATEUR_SIMPLE)

    def test_public_registration_rejects_admin_role(self):
        response = self.client.post(
            "/api/auth/register/",
            data={
                "email": "admin-public@example.com",
                "full_name": "Admin Public",
                "phone_number": "+212600000002",
                "password": "motdepasse123",
                "role": self.User.Role.ADMINISTRATEUR,
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("role", response.json())
        self.assertFalse(self.User.objects.filter(email="admin-public@example.com").exists())

    def test_login_returns_user_role(self):
        user = self.User.objects.create_user(
            email="agent@example.com",
            full_name="Agent Demo",
            phone_number="+212600000003",
            password="motdepasse123",
            role=self.User.Role.AGENT_IMMOBILIER,
        )

        response = self.client.post(
            "/api/auth/login/",
            data={
                "email": user.email,
                "password": "motdepasse123",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user"]["role"], self.User.Role.AGENT_IMMOBILIER)


@override_settings(PUBLIC_DEMO_ACCESS=True)
class CurrentUserApiTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            email="profil@example.com",
            full_name="Profil Demo",
            phone_number="+212600000099",
            password="motdepasse123",
            role=self.User.Role.UTILISATEUR_SIMPLE,
        )

    def test_current_user_requires_authentication_even_in_public_demo_mode(self):
        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, 401)

    def test_authenticated_user_can_update_own_profile(self):
        self.client.force_login(self.user)

        response = self.client.patch(
            "/api/auth/me/",
            data={
                "email": "profil.maj@example.com",
                "full_name": "Profil Mis a Jour",
                "phone_number": "+212611223344",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["email"], "profil.maj@example.com")
        self.assertEqual(payload["full_name"], "Profil Mis a Jour")
        self.assertEqual(payload["phone_number"], "+212611223344")

        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "profil.maj@example.com")
        self.assertEqual(self.user.full_name, "Profil Mis a Jour")
        self.assertEqual(self.user.phone_number, "+212611223344")


@override_settings(PUBLIC_DEMO_ACCESS=False)
class DemoSeedCommandTests(TestCase):
    def test_seed_command_resyncs_existing_demo_user_roles(self):
        user_model = get_user_model()
        demo_user = user_model.objects.create_user(
            email="zakaria.bouguerfa@gmail.com",
            full_name="Ancien Role",
            phone_number="+212600009999",
            password="motdepasse123",
            role=user_model.Role.AGENT_IMMOBILIER,
        )

        call_command("seed_smartestate_demo")

        demo_user.refresh_from_db()
        self.assertEqual(demo_user.role, user_model.Role.UTILISATEUR_SIMPLE)


@override_settings(PUBLIC_DEMO_ACCESS=False)
class UserManagementApiTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.admin_user = self.User.objects.create_user(
            email="admin@example.com",
            full_name="Admin Demo",
            phone_number="+212600000004",
            password="motdepasse123",
            role=self.User.Role.ADMINISTRATEUR,
            is_staff=True,
        )
        self.agent_user = self.User.objects.create_user(
            email="agent@example.com",
            full_name="Agent Demo",
            phone_number="+212600000005",
            password="motdepasse123",
            role=self.User.Role.AGENT_IMMOBILIER,
        )

    def test_admin_can_list_users(self):
        self.client.force_login(self.admin_user)

        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload), 2)

    def test_non_admin_cannot_list_users(self):
        self.client.force_login(self.agent_user)

        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, 403)

    def test_admin_can_update_role_and_status(self):
        self.client.force_login(self.admin_user)

        response = self.client.patch(
            f"/api/users/{self.agent_user.id}/",
            data={
                "is_active": False,
                "role": self.User.Role.UTILISATEUR_SIMPLE,
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)

        self.agent_user.refresh_from_db()
        self.assertFalse(self.agent_user.is_active)
        self.assertEqual(self.agent_user.role, self.User.Role.UTILISATEUR_SIMPLE)
