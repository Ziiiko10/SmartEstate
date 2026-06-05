# Indicateurs de sante du backend: verifie la base et le cache avant de repondre.
from urllib.parse import urlsplit, urlunsplit

from django.conf import settings
from django.core.cache import cache
from django.db import connection


def _redact_url(url: str | None) -> str | None:
    # Masque le mot de passe eventuel d'une URL avant de l'exposer dans un diagnostic.
    # Cela permet de garder une information utile sans divulguer de secret sensible.
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
    # Verifie que la base de donnees repond a une requete minimale.
    # Le resultat est structure pour etre renvoye tel quel par le healthcheck.
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
    # Verifie que le cache accepte une ecriture puis une lecture de controle.
    # Le backend peut ainsi detecter rapidement une panne Redis ou un cache mal configure.
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
