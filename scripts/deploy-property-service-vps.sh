#!/bin/bash
# Script pour déployer le Property Service sur le VPS
# Usage: ./scripts/deploy-property-service-vps.sh

set -e

echo "🚀 Déploiement du Property Service sur le VPS..."
echo ""

# Configuration
COMPOSE_FILE="infrastructure/docker-compose/app-property.yml"
NETWORK_NAME="viridial-network"

# Vérifier que le réseau Docker existe
if ! docker network ls | grep -q "$NETWORK_NAME"; then
  echo "⚠️  Le réseau $NETWORK_NAME n'existe pas. Création..."
  docker network create "$NETWORK_NAME"
fi

# Arrêter les containers existants qui utilisent le port 3001
echo "🛑 Arrêt des containers existants sur le port 3001..."
docker ps -a --filter "publish=3001" --format "{{.ID}}" | xargs -r docker stop | xargs -r docker rm

# Vérifier que la base de données est accessible
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL n'est pas définie dans l'environnement."
  echo "   Veuillez l'exporter ou créer un fichier .env avec DATABASE_URL"
  exit 1
fi

# Charger les variables d'environnement depuis .env si disponible
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Build et démarrage des services
echo "🔨 Construction et démarrage des services..."
cd "$(dirname "$0")/.."

docker compose -f "$COMPOSE_FILE" build --no-cache property-service

# Appliquer les migrations SQL si nécessaire
echo "📊 Vérification des migrations de base de données..."
echo "   Note: Les migrations doivent être appliquées manuellement ou via un script séparé"

docker compose -f "$COMPOSE_FILE" up -d

# Attendre que le service soit prêt
echo "⏳ Attente du démarrage du service..."
sleep 5

# Vérifier le health check
echo "🏥 Vérification du health check..."
for i in {1..10}; do
  if curl -f http://localhost:3001/properties/health > /dev/null 2>&1; then
    echo "✅ Property Service est prêt et répond!"
    break
  fi
  if [ $i -eq 10 ]; then
    echo "❌ Le service ne répond pas après 10 tentatives"
    docker logs viridial-property-service --tail=50
    exit 1
  fi
  echo "   Tentative $i/10..."
  sleep 2
done

# Afficher les logs
echo ""
echo "📋 Derniers logs du Property Service:"
docker logs viridial-property-service --tail=20

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "🔗 Le service est accessible sur:"
echo "   - Local: http://localhost:3001/properties"
echo "   - Via Nginx: https://viridial.com/properties"
echo ""
echo "📝 Commandes utiles:"
echo "   - Voir les logs: docker logs -f viridial-property-service"
echo "   - Arrêter: docker compose -f $COMPOSE_FILE down"
echo "   - Redémarrer: docker compose -f $COMPOSE_FILE restart property-service"

