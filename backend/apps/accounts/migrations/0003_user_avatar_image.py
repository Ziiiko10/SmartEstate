# Migration qui ajoute l'image de profil sur le modele utilisateur.
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_update_user_roles"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="avatar_image",
            field=models.TextField(blank=True),
        ),
    ]
