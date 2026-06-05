# Image frontend Vite/Node basee sur Alpine pour limiter la taille.
FROM node:22-alpine

# Repertoire de travail commun a toutes les commandes npm.
WORKDIR /app

# Copie les manifests en premier pour reutiliser le cache npm quand le code change.
COPY package.json package-lock.json ./
RUN npm ci

# Ajoute ensuite l'ensemble du code source frontend.
COPY . /app

# Documente le port de developpement expose par Vite.
EXPOSE 5173
