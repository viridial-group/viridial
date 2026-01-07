#!/bin/bash

# Script d'installation de la stack d'observabilité Viridial
# Prometheus, Grafana, Loki, Jaeger, Alertmanager

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
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  📊 Installation Stack Observabilité Viridial               ║"
echo "║  Prometheus, Grafana, Loki, Jaeger, Alertmanager            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier Docker
step "Vérification de Docker..."
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé. Veuillez installer Docker d'abord."
fi
if ! docker ps &> /dev/null; then
    error "Docker n'est pas en cours d'exécution. Démarrez Docker d'abord."
fi
success "Docker est installé et fonctionne."

# Vérifier Docker Compose
step "Vérification de Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
fi
success "Docker Compose est installé."

# Vérifier que le réseau viridial-network existe
step "Vérification du réseau Docker..."
if ! docker network ls | grep -q viridial-network; then
    warning "Le réseau viridial-network n'existe pas. Création..."
    docker network create viridial-network
    success "Réseau viridial-network créé."
else
    success "Réseau viridial-network existe déjà."
fi

# Vérifier que les services de base sont en cours d'exécution
step "Vérification des services de base..."
cd "$(dirname "$0")/.." || error "Impossible de naviguer vers le répertoire parent."
if ! docker-compose ps | grep -q "postgres.*Up"; then
    warning "Les services de base ne semblent pas être en cours d'exécution."
    warning "Assurez-vous que PostgreSQL, Redis, Meilisearch et MinIO sont démarrés."
    read -p "Continuer quand même? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Installation annulée. Démarrez d'abord les services de base."
    fi
else
    success "Services de base détectés."
fi

# Retourner au répertoire observability
cd "$(dirname "$0")" || error "Impossible de naviguer vers le répertoire observability."

# Créer le fichier .env si il n'existe pas
step "Configuration des variables d'environnement..."
if [ ! -f .env ]; then
    warning "Fichier .env non trouvé. Création depuis .env.example..."
    cp .env.example .env
    
    # Générer un mot de passe Grafana aléatoire
    GRAFANA_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    sed -i "s/your_grafana_admin_password/$GRAFANA_PASSWORD/" .env
    
    success "Fichier .env créé."
    warning "⚠️  IMPORTANT: Modifiez le fichier .env avec vos valeurs réelles!"
    warning "⚠️  Le mot de passe Grafana admin a été généré automatiquement."
    info "Grafana Admin Password: $GRAFANA_PASSWORD"
    echo ""
    read -p "Appuyez sur Entrée pour continuer..."
else
    success "Fichier .env existe déjà."
fi

# Charger les variables d'environnement depuis le fichier .env des services de base
if [ -f ../.env ]; then
    step "Chargement des variables d'environnement des services de base..."
    source ../.env
    export POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB
    success "Variables d'environnement chargées."
fi

# Démarrer les services
step "Démarrage de la stack d'observabilité..."
docker-compose -f docker-compose.observability.yml up -d
success "Services démarrés."

# Attendre que les services soient prêts
step "Attente du démarrage des services (30 secondes)..."
sleep 30

# Vérifier l'état des services
step "Vérification de l'état des services..."
docker-compose -f docker-compose.observability.yml ps

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Installation terminée!                                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 SERVICES D'OBSERVABILITÉ:"
echo ""
echo "  ✓ Prometheus      → http://localhost:9090"
echo "  ✓ Grafana         → http://localhost:3000"
echo "    - Username: admin"
echo "    - Password: (voir fichier .env)"
echo "  ✓ Loki            → http://localhost:3100"
echo "  ✓ Jaeger UI       → http://localhost:16686"
echo "  ✓ Alertmanager    → http://localhost:9093"
echo ""
echo "📈 EXPORTERS:"
echo ""
echo "  ✓ Node Exporter   → http://localhost:9100/metrics"
echo "  ✓ Postgres Exporter → http://localhost:9187/metrics"
echo "  ✓ Redis Exporter  → http://localhost:9121/metrics"
echo ""
echo "💡 PROCHAINES ÉTAPES:"
echo ""
echo "  1. Accéder à Grafana: http://localhost:3000"
echo "  2. Configurer les dashboards (voir README.md)"
echo "  3. Configurer les alertes (Slack/Email) dans alertmanager.yml"
echo "  4. Tester la collecte de métriques: ./test-observability.sh"
echo ""
echo "📚 DOCUMENTATION:"
echo ""
echo "  - README.md - Guide complet"
echo "  - INSTALL-VPS.md - Installation sur VPS"
echo ""

