from urllib.parse import urlsplit, urlunsplit

from django.conf import settings
from django.core.cache import cache
from django.db import connection


def _redact_url(url: str | None) -> str | None:
    if not url:
        return None

    parts = urlsplit(url)
    if not parts.hostname:
        return url

    auth = ""
    if parts.username:
        auth = parts.username
        if parts.password:
            auth += ":***"
        auth += "@"

    netloc = auth + parts.hostname
    if parts.port:
        netloc += f":{parts.port}"

    return urlunsplit((parts.scheme, netloc, parts.path, parts.query, parts.fragment))


def check_database() -> dict[str, object]:
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return {
            "status": "ok",
            "engine": connection.settings_dict.get("ENGINE"),
            "name": connection.settings_dict.get("NAME"),
        }
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}


def check_cache() -> dict[str, object]:
    probe_key = "smartestate:healthcheck"
    try:
        cache.set(probe_key, "pong", timeout=30)
        value = cache.get(probe_key)
        if value != "pong":
            return {"status": "error", "detail": "Redis a repondu avec une valeur inattendue."}

        return {
            "status": "ok",
            "backend": settings.CACHES["default"]["BACKEND"],
            "location": _redact_url(settings.CACHES["default"].get("LOCATION")),
        }
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}


def check_mongodb() -> dict[str, object]:
    mongo_client = getattr(settings, "MONGO_CLIENT", None)
    mongodb_url = getattr(settings, "MONGODB_URL", None)

    if not mongodb_url:
        return {"status": "not_configured", "optional": True}

    if mongo_client is None:
        return {
            "status": "error",
            "optional": True,
            "detail": "Le client MongoDB n'a pas pu etre initialise.",
            "location": _redact_url(mongodb_url),
        }

    try:
        mongo_client.admin.command("ping")
        return {"status": "ok", "optional": True, "location": _redact_url(mongodb_url)}
    except Exception as exc:
        return {
            "status": "error",
            "optional": True,
            "detail": str(exc),
            "location": _redact_url(mongodb_url),
        }
