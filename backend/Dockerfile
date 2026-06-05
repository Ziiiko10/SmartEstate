# Image backend Django minimale basee sur Python 3.12.
FROM python:3.12-slim

# Desactive les fichiers pyc et force des logs immediats dans Docker.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Tous les chemins suivants sont resolves depuis le repertoire applicatif.
WORKDIR /app

# Installe d'abord les dependances pour profiter du cache de build.
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /tmp/requirements.txt

# Copie ensuite le code backend complet dans l'image.
COPY . /app

# Documente le port HTTP expose par le serveur Django.
EXPOSE 8000
