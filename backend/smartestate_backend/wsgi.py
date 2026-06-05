# Entree WSGI utilisee par les serveurs web classiques et le deploiement.
import os

from django.core.wsgi import get_wsgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartestate_backend.settings")

application = get_wsgi_application()
