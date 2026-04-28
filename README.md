# SmartEstate

Application web immobiliere avec frontend React + TypeScript et backend Django REST.

## Stack

- Frontend: React, TypeScript, Vite
- Backend: Django, Django REST Framework
- Base principale: PostgreSQL
- Cache et sessions: Redis
- Base documentaire optionnelle: MongoDB
- Orchestration: Docker Compose

## Structure du projet

```text
.
├── frontend/          # Application React + TypeScript
├── backend/           # API Django REST
└── docker-compose.yml # Lancement complet de l'application
```

## Demarrage rapide avec Docker

Prerequis:

- Git
- Docker Desktop

### 1. Cloner le projet

```bash
git clone <URL_DU_REPO>
cd <nom-du-dossier-clone>
```

### 2. Lancer toute l'application

```bash
docker compose up --build -d
```

### 3. Ouvrir l'application

- Frontend: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- Backend API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Health check API: [http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)

### 4. Verifier les conteneurs

```bash
docker compose ps
```

### 5. Voir les logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

### 6. Arreter l'application

```bash
docker compose down
```

## Lancement avec bases de donnees en ligne

Par defaut, `docker compose` utilise les services `postgres`, `redis` et `mongodb` definis dans [`docker-compose.yml`](./docker-compose.yml).

Si vous voulez garder Docker pour lancer l'application, mais utiliser des bases distantes, definissez vos variables avant le lancement.

### PowerShell

```powershell
$env:SMARTESTATE_USE_MANAGED_SERVICES="True"
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
$env:REDIS_URL="rediss://default:PASSWORD@HOST:PORT/0"
$env:CELERY_BROKER_URL=$env:REDIS_URL
$env:MONGODB_URL=""
docker compose up --build -d
```

Variables importantes:

- `DATABASE_URL`: PostgreSQL distant
- `REDIS_URL`: Redis distant
- `CELERY_BROKER_URL`: broker Redis pour les taches async
- `MONGODB_URL`: MongoDB distant si necessaire

## Lancement en local sans Docker

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```powershell
cd backend
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```

Important:

- utilisez `backend/.venv`
- ignorez l'ancien dossier `backend/venv`

## Comptes et donnees de demo

Si les donnees de demo sont chargees, vous pouvez utiliser:

- Email: `yassine@smartestate.ma`
- Mot de passe: `demo12345`

Pour recharger les donnees de demo:

```powershell
cd backend
.\.venv\Scripts\python.exe manage.py seed_smartestate_demo
```

## Fichiers utiles

- Backend guide: [`backend/README.md`](./backend/README.md)
- Compose principal: [`docker-compose.yml`](./docker-compose.yml)
- Backend env example: [`backend/.env.example`](./backend/.env.example)
- Managed services env example: [`backend/.env.managed.example`](./backend/.env.managed.example)
- Frontend env: [`frontend/.env.example`](./frontend/.env.example)

## Commandes utiles

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
```
