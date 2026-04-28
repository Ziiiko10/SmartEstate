from pathlib import Path
import os
from django.core.exceptions import ImproperlyConfigured


BASE_DIR = Path(__file__).resolve().parent.parent


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file(BASE_DIR / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-smartestate-dev-key")
DEBUG = env_bool("DJANGO_DEBUG", True)
MANAGED_SERVICES = env_bool("SMARTESTATE_USE_MANAGED_SERVICES", False)

allowed_hosts = os.getenv("DJANGO_ALLOWED_HOSTS", "127.0.0.1,localhost")
ALLOWED_HOSTS = [host.strip() for host in allowed_hosts.split(",") if host.strip()]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "apps.accounts",
    "apps.organizations",
    "apps.properties",
    "apps.portfolios",
    "apps.intelligence",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "smartestate_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "smartestate_backend.wsgi.application"
ASGI_APPLICATION = "smartestate_backend.asgi.application"

# Database configuration: prefer DATABASE_URL (Postgres), fallback to sqlite
DATABASE_URL = os.getenv("DATABASE_URL")
DATABASE_CONN_MAX_AGE = int(os.getenv("DATABASE_CONN_MAX_AGE", "600"))
DATABASE_SSL_REQUIRE = env_bool("DATABASE_SSL_REQUIRE", MANAGED_SERVICES)
DATABASE_FALLBACK_TO_SQLITE = env_bool(
    "DATABASE_FALLBACK_TO_SQLITE",
    DEBUG and not MANAGED_SERVICES,
)
if DATABASE_URL:
    try:
        import dj_database_url  # provided by dj-database-url

        DATABASES = {
            "default": dj_database_url.parse(
                DATABASE_URL,
                conn_max_age=DATABASE_CONN_MAX_AGE,
                ssl_require=DATABASE_SSL_REQUIRE,
            )
        }
    except Exception:
        # Minimal fallback parsing if dj_database_url is not available
        from urllib.parse import urlparse as _urlparse

        _parsed = _urlparse(DATABASE_URL)
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": _parsed.path[1:],
                "USER": _parsed.username,
                "PASSWORD": _parsed.password,
                "HOST": _parsed.hostname,
                "PORT": str(_parsed.port) if _parsed.port else "",
            }
        }
elif DATABASE_FALLBACK_TO_SQLITE:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    raise ImproperlyConfigured(
        "DATABASE_URL est requis quand les services manages sont actives ou quand le fallback SQLite est desactive."
    )

# Redis cache: prefer managed Redis, fallback to local memory cache when allowed
REDIS_URL = os.getenv("REDIS_URL")
if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
        }
    }
elif MANAGED_SERVICES:
    raise ImproperlyConfigured(
        "REDIS_URL est requis quand SMARTESTATE_USE_MANAGED_SERVICES=True."
    )
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "smartestate-local-cache",
        }
    }

SESSION_ENGINE = "django.contrib.sessions.backends.cached_db"
SESSION_CACHE_ALIAS = "default"

# Optional MongoDB client (expose as MONGO_CLIENT if provided)
MONGODB_URL = os.getenv("MONGODB_URL")
MONGODB_TIMEOUT_MS = int(os.getenv("MONGODB_TIMEOUT_MS", "5000"))
if MONGODB_URL:
    try:
        import pymongo

        MONGO_CLIENT = pymongo.MongoClient(
            MONGODB_URL,
            serverSelectionTimeoutMS=MONGODB_TIMEOUT_MS,
            connectTimeoutMS=MONGODB_TIMEOUT_MS,
        )
    except Exception:
        MONGO_CLIENT = None
else:
    MONGO_CLIENT = None

# Celery broker: default to managed Redis when available
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", REDIS_URL or "")

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
]

LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Africa/Casablanca"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "DJANGO_CORS_ALLOWED_ORIGINS",
        "http://127.0.0.1:5173,http://localhost:5173",
    ).split(",")
    if origin.strip()
]
