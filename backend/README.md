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
- `SMARTESTATE_PUBLIC_DEMO_ACCESS`: `True` permet d'utiliser l'application sans login
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
- `GET /api/market-listings/`
- `GET /api/portfolios/`
- `GET /api/holdings/`
- `GET /api/scenarios/`
- `GET /api/valuations/`
- `GET /api/recommendations/`
- `GET /api/reports/`

## ETL annonces Avito et Mubawab

La commande `scrape_market_listings` extrait les annonces immobilieres depuis Avito et Mubawab, normalise les champs principaux, puis fait un upsert dans `MarketListing`.

```powershell
cd backend
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py scrape_market_listings --source all --pages 1 --limit 20 --sleep 1
```

Mode continu:

```powershell
.\.venv\Scripts\python.exe manage.py scrape_market_listings --source all --pages 1 --limit 40 --sleep 1 --interval 1800 --loop
```

Avec Docker, le service `market-etl` tourne en continu et relance le scraping selon `MARKET_ETL_INTERVAL_SECONDS`.

Options utiles:

- `--source avito|mubawab|all`
- `--pages 2` pour parcourir plusieurs pages par source
- `--limit 50` pour limiter le nombre d'annonces detaillees
- `--city Casablanca` et `--transaction-type sale|rent|vacation` pour filtrer apres extraction
- `--dry-run` pour tester sans ecriture en base
- `--avito-url` et `--mubawab-url` pour remplacer les URLs de depart si les pages changent

Les annonces importees sont consultables via `GET /api/market-listings/` avec les filtres `source`, `city`, `asset_type`, `transaction_type`, `min_price`, `max_price` et `q`.

## Algorithmes ML baseline

La couche `apps.intelligence.ml` fournit les algorithmes necessaires a la partie machine learning:

- estimation par comparables ponderes (`weighted_comparable_knn`)
- regression hedonique regularisee (`hedonic_ridge_regression`) entrainee sur les annonces importees
- baseline par segment marche (`market_segment_baseline`)
- moteur d'ensemble (`ml_ensemble_v1`) qui combine les modeles selon leur confiance
- nettoyage robuste des valeurs extremes par IQR
- estimation prix/m² ou loyer/m²
- score d'opportunite investissement
- simulation de scenario financier avec cashflow, valeur de sortie et IRR

Endpoints:

- `POST /api/ml/valuation/` estime une valeur de marche depuis les annonces importees et renvoie les modeles, la confiance, les comparables et les lignes d'entrainement
- `POST /api/ml/investment-score/` calcule le score d'opportunite a partir du prix demande et des comparables
- `POST /api/ml/scenario-simulation/` simule cashflow, dette, sortie et IRR

Exemple:

```json
{
  "city": "Casablanca",
  "district": "Maarif",
  "asset_type": "apartment",
  "area_sqm": 100,
  "bedrooms": 2,
  "bathrooms": 1,
  "asking_price": 950000,
  "monthly_rent": 6500
}
```

## Donnees de demo

La commande `python manage.py seed_smartestate_demo` cree:

- une organisation SmartEstate Morocco
- un administrateur principal
- des membres d'equipe
- plusieurs actifs immobiliers
- un portefeuille
- des scenarios, estimations, recommandations et rapports
