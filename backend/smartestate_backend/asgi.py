# Entree ASGI utilisee par les serveurs asynchrones et les departs runtime.
import os

from django.core.asgi import get_asgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartestate_backend.settings")

application = get_asgi_application()
