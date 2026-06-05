from django.db import migrations, models


# Migration de normalisation des anciens roles utilisateurs.
def map_existing_roles(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    role_mapping = {
        "admin": "ADMINISTRATEUR",
        "executive": "ADMINISTRATEUR",
        "analyst": "AGENT_IMMOBILIER",
        "asset_manager": "AGENT_IMMOBILIER",
        "investor": "UTILISATEUR_SIMPLE",
    }

    for previous_role, next_role in role_mapping.items():
        User.objects.filter(role=previous_role).update(role=next_role)


def rollback_roles(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    role_mapping = {
        "ADMINISTRATEUR": "admin",
        "AGENT_IMMOBILIER": "asset_manager",
        "UTILISATEUR_SIMPLE": "investor",
    }

    for previous_role, next_role in role_mapping.items():
        User.objects.filter(role=previous_role).update(role=next_role)


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[
                    ("UTILISATEUR_SIMPLE", "Utilisateur simple"),
                    ("AGENT_IMMOBILIER", "Agent immobilier"),
                    ("ADMINISTRATEUR", "Administrateur"),
                ],
                default="UTILISATEUR_SIMPLE",
                max_length=32,
            ),
        ),
        migrations.RunPython(map_existing_roles, rollback_roles),
    ]
