# Mixins partages pour les modeles Django utilises dans plusieurs apps.
from django.db import models


class TimestampedModel(models.Model):
    # Ajoute des dates de creation et de mise a jour a tous les modeles qui en heritent.
    # Ce mixin evite de redefinir les memes champs temporels dans chaque app.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
