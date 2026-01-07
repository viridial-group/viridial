#!/bin/bash

# Script pour vérifier l'état des services d'observabilité

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

step() {
    echo -e "${GREEN}[ÉTAPE]${NC} $1"
    echo ""
}

warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔍 Vérification État Services Observabilité                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier si on est dans le bon répertoire
if [ ! -f "docker-compose.observability.yml" ]; then
    error "Fichier docker-compose.observability.yml non trouvé."
    error "Exécutez ce script depuis: /opt/viridial/infrastructure/docker-compose/observability"
    exit 1
fi

# Vérifier l'état des conteneurs
step "État des conteneurs Docker..."
docker-compose -f docker-compose.observability.yml ps

echo ""
step "Logs récents (dernières 20 lignes par service)..."

SERVICES=("prometheus" "grafana" "loki" "promtail" "jaeger" "alertmanager" "node-exporter" "postgres-exporter" "redis-exporter")

for service in "${SERVICES[@]}"; do
    echo ""
    info "=== Logs $service ==="
    docker-compose -f docker-compose.observability.yml logs --tail=20 "$service" 2>&1 | head -20 || warning "Aucun log pour $service"
done

echo ""
step "Vérification des ports en écoute..."
netstat -tlnp | grep -E "(9090|3000|3100|9080|16686|14268|14250|9093|9100|9187|9121)" || warning "Aucun port d'observabilité en écoute"

echo ""
step "Vérification du réseau Docker..."
if docker network ls | grep -q viridial-network; then
    success "Réseau viridial-network existe"
    info "Conteneurs connectés au réseau:"
    docker network inspect viridial-network --format '{{range .Containers}}{{.Name}} {{end}}' || warning "Aucun conteneur connecté"
else
    error "Réseau viridial-network n'existe pas!"
    error "Créez-le avec: docker network create viridial-network"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  💡 Commandes Utiles                                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "  # Redémarrer tous les services:"
echo "  docker-compose -f docker-compose.observability.yml restart"
echo ""
echo "  # Voir les logs en temps réel:"
echo "  docker-compose -f docker-compose.observability.yml logs -f [service]"
echo ""
echo "  # Redémarrer un service spécifique:"
echo "  docker-compose -f docker-compose.observability.yml restart [service]"
echo ""
echo "  # Vérifier les erreurs:"
echo "  docker-compose -f docker-compose.observability.yml ps"
echo ""

