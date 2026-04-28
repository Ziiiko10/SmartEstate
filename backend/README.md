# SmartEstate Backend

Backend Django REST pour l'application SmartEstate.

## Stack

- Django
- Django REST Framework
- Token Authentication
- PostgreSQL via `DATABASE_URL`
- Redis pour le cache et les sessions
- MongoDB optionnel pour les besoins documentaires et analytics

## Mode recommande

Le mode recommande pour ce projet est maintenant l'usage de bases de donnees managees en ligne:

- PostgreSQL distant pour la base principale
- Redis distant pour le cache, les sessions et Celery
- MongoDB distant uniquement si vous avez un vrai besoin documentaire / analytics

## Installation

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py seed_smartestate_demo
python manage.py runserver
```

Sous Windows, le plus fiable pour ce projet est:

```powershell
cd backend
.\runserver.ps1
```

ou:

```powershell
cd backend
.\.venv\Scripts\python.exe manage.py runserver
```

Le dossier `backend\venv` est un ancien environnement a ignorer. L'environnement valide pour ce projet est `backend\.venv`.

Le frontend utilise son propre fichier [frontend/.env](D:\ENSMR\S4\Projet Fédérateur\App\frontend\.env).

Par defaut, [backend/.env.example](D:\ENSMR\S4\Projet Fédérateur\App\backend\.env.example) est maintenant prepare pour des services manages.

Vous avez aussi:

- [backend/.env.managed.example](D:\ENSMR\S4\Projet Fédérateur\App\backend\.env.managed.example) pour les bases en ligne
- [backend/.env.local.example](D:\ENSMR\S4\Projet Fédérateur\App\backend\.env.local.example) si vous voulez encore un mode local

## Configuration cloud

Pour passer en bases en ligne:

1. Copiez `backend/.env.managed.example` vers `backend/.env`
2. Remplacez `DATABASE_URL` par votre PostgreSQL distant
3. Remplacez `REDIS_URL` et `CELERY_BROKER_URL` par votre Redis distant
4. Renseignez `MONGODB_URL` seulement si vous utilisez MongoDB
5. Lancez `python manage.py migrate`
6. Lancez `python manage.py seed_smartestate_demo` si vous voulez les donnees de demo

Quand `SMARTESTATE_USE_MANAGED_SERVICES=True`, Django attend des URLs distantes valides et n'utilise plus de fallback local.

## Lancement Docker

Le projet peut maintenant demarrer completement avec Docker:

```bash
cd ..
docker compose up --build
```

Services exposes:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:8000`
- PostgreSQL: `127.0.0.1:5432`
- Redis: `127.0.0.1:6379`
- MongoDB: `127.0.0.1:27017`

Par defaut, `docker compose up` utilise les services `postgres`, `redis` et `mongodb` du compose.

Si vous voulez garder Docker pour l'app mais utiliser des bases distantes, exportez vos variables cloud avant le lancement:

```powershell
$env:SMARTESTATE_USE_MANAGED_SERVICES="True"
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
$env:REDIS_URL="rediss://default:PASSWORD@HOST:PORT/0"
$env:CELERY_BROKER_URL=$env:REDIS_URL
$env:MONGODB_URL=""
docker compose up --build
```

## Variables d'environnement

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CORS_ALLOWED_ORIGINS`
- `SMARTESTATE_USE_MANAGED_SERVICES`
- `DATABASE_FALLBACK_TO_SQLITE`
- `DATABASE_SSL_REQUIRE`
- `DATABASE_CONN_MAX_AGE`
- `DATABASE_URL`
- `REDIS_URL`
- `MONGODB_URL`
- `MONGODB_TIMEOUT_MS`
- `CELERY_BROKER_URL`

## Health Check

`GET /api/health/` verifie maintenant:

- la base de donnees
- le cache Redis
- MongoDB si configure

Le endpoint retourne `200` si les services requis sont disponibles, `503` si PostgreSQL ou Redis sont indisponibles, et `200` avec statut `degraded` si MongoDB optionnel est configure mais injoignable.

## Endpoints principaux

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `GET /api/auth/me/`
- `GET /api/dashboard/overview/`
- `GET /api/organizations/`
- `GET /api/team-memberships/`
- `GET /api/assets/`
- `GET /api/portfolios/`
- `GET /api/holdings/`
- `GET /api/scenarios/`
- `GET /api/valuations/`
- `GET /api/recommendations/`
- `GET /api/reports/`

## Donnees de demo

La commande `python manage.py seed_smartestate_demo` cree:

- une organisation SmartEstate Morocco
- un administrateur principal
- des membres d'equipe
- plusieurs actifs immobiliers
- un portefeuille
- des scenarios, estimations, recommandations et rapports
