#!/bin/bash
# Script pour nettoyer l'ancien docker-compose.yml à la racine si nécessaire

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

error() {
    echo -e "${RED}[ERREUR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧹 Nettoyage de l'Ancien Docker Compose                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier si on est à la racine du projet
if [ ! -f "docker-compose.yml" ]; then
    warning "docker-compose.yml non trouvé à la racine. Rien à nettoyer."
    exit 0
fi

# Vérifier si des conteneurs sont en cours d'exécution
if docker-compose ps 2>/dev/null | grep -q "Up" || docker compose ps 2>/dev/null | grep -q "Up"; then
    warning "Des conteneurs sont en cours d'exécution avec l'ancien docker-compose.yml"
    echo ""
    echo "Voulez-vous les arrêter? (o/n)"
    read -r RESPONSE
    
    if [ "$RESPONSE" = "o" ] || [ "$RESPONSE" = "O" ]; then
        echo "Arrêt des conteneurs..."
        docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true
        success "Conteneurs arrêtés"
    else
        warning "Nettoyage annulé. Les conteneurs continuent de tourner."
        exit 0
    fi
fi

# Proposer de renommer l'ancien fichier
echo ""
echo "L'ancien docker-compose.yml sera renommé en docker-compose.yml.old"
echo "Voulez-vous continuer? (o/n)"
read -r RESPONSE

if [ "$RESPONSE" = "o" ] || [ "$RESPONSE" = "O" ]; then
    mv docker-compose.yml docker-compose.yml.old
    success "Fichier renommé en docker-compose.yml.old"
    echo ""
    echo "Vous pouvez maintenant utiliser la nouvelle solution dans:"
    echo "  infrastructure/docker-compose/"
    echo ""
    echo "Pour installer les services de base:"
    echo "  cd infrastructure/docker-compose"
    echo "  ./install-services.sh"
else
    warning "Nettoyage annulé."
    exit 0
fi

