#!/bin/bash
# Script pour déployer le Geolocation Service sur le VPS
# Usage: ./scripts/deploy-geolocation-service-vps.sh

set -e

echo "🚀 Déploiement du Geolocation Service sur le VPS..."
echo ""

# Configuration
COMPOSE_FILE="infrastructure/docker-compose/app-geolocation.yml"
NETWORK_NAME="viridial-network"

# Se placer dans le répertoire racine du projet
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# Vérifier que le réseau Docker existe
if ! docker network ls | grep -q "$NETWORK_NAME"; then
  echo "⚠️  Le réseau $NETWORK_NAME n'existe pas. Création..."
  docker network create "$NETWORK_NAME"
fi

# Arrêter les containers existants qui utilisent le port 3002
echo "🛑 Arrêt des containers existants sur le port 3002..."
docker ps -a --filter "publish=3002" --format "{{.ID}}" | xargs -r docker stop | xargs -r docker rm || true

# Charger les variables d'environnement depuis .env si disponible
ENV_FILE="infrastructure/docker-compose/.env"
if [ -f "$ENV_FILE" ]; then
  echo "📋 Chargement des variables d'environnement depuis $ENV_FILE..."
  set -a
  source "$ENV_FILE"
  set +a
elif [ -f .env ]; then
  echo "📋 Chargement des variables d'environnement depuis .env..."
  set -a
  source .env
  set +a
fi

# Vérifier que Redis est accessible (optionnel mais recommandé)
if [ -z "$REDIS_URL" ]; then
  echo "⚠️  REDIS_URL n'est pas définie. Le service utilisera le cache en mémoire."
  echo "   Pour un cache Redis, définissez REDIS_URL dans .env"
fi

# Build et démarrage des services
echo "🔨 Construction et démarrage des services..."

# Utiliser le fichier .env pour docker compose
if [ -f "$ENV_FILE" ]; then
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache geolocation-service
elif [ -f .env ]; then
  docker compose -f "$COMPOSE_FILE" --env-file .env build --no-cache geolocation-service
else
  docker compose -f "$COMPOSE_FILE" build --no-cache geolocation-service
fi

# Démarrer les services avec le bon fichier .env
if [ -f "$ENV_FILE" ]; then
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
elif [ -f .env ]; then
  docker compose -f "$COMPOSE_FILE" --env-file .env up -d
else
  docker compose -f "$COMPOSE_FILE" up -d
fi

# Attendre que le service soit prêt
echo "⏳ Attente du démarrage du service..."
sleep 5

# Vérifier le health check
echo "🏥 Vérification du health check..."
for i in {1..10}; do
  if curl -f http://localhost:3002/geolocation/health > /dev/null 2>&1; then
    echo "✅ Geolocation Service est prêt et répond!"
    break
  fi
  if [ $i -eq 10 ]; then
    echo "❌ Le service ne répond pas après 10 tentatives"
    docker logs viridial-geolocation-service --tail=50
    exit 1
  fi
  echo "   Tentative $i/10..."
  sleep 2
done

# Afficher les logs
echo ""
echo "📋 Derniers logs du Geolocation Service:"
docker logs viridial-geolocation-service --tail=20

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "🔗 Le service est accessible sur:"
echo "   - Local: http://localhost:3002/geolocation"
echo "   - Via Nginx: https://viridial.com/geolocation"
echo ""
echo "📝 Commandes utiles:"
echo "   - Voir les logs: docker logs -f viridial-geolocation-service"
echo "   - Arrêter: docker compose -f $COMPOSE_FILE down"
echo "   - Redémarrer: docker compose -f $COMPOSE_FILE restart geolocation-service"
echo ""
echo "🌍 Provider configuré: ${GEOCODING_PROVIDER:-stub}"
echo "   Pour utiliser Google Maps, configurez GOOGLE_MAPS_API_KEY dans .env"
echo "   Pour utiliser Nominatim, configurez GEOCODING_PROVIDER=nominatim"

