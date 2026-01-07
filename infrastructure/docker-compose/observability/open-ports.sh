#!/bin/bash

# Script pour ouvrir les ports de la stack d'observabilité dans le firewall 

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
echo "║  🔓 Ouverture des Ports - Stack Observabilité                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier si UFW est installé
step "Vérification de UFW..."
if ! command -v ufw &> /dev/null; then
    warning "UFW n'est pas installé. Installation..."
    apt-get update
    apt-get install -y ufw
    success "UFW installé."
else
    success "UFW est installé."
fi

# Vérifier l'état de UFW
step "Vérification de l'état de UFW..."
if ufw status | grep -q "Status: active"; then
    info "UFW est actif."
elif ufw status | grep -q "Status: inactive"; then
    warning "UFW est inactif. Activation..."
    ufw --force enable
    success "UFW activé."
else
    warning "État de UFW inconnu. Activation..."
    ufw --force enable
    success "UFW activé."
fi

# Ports à ouvrir pour la stack d'observabilité
PORTS=(
    "9090/tcp:Prometheus"
    "3000/tcp:Grafana"
    "3100/tcp:Loki"
    "9080/tcp:Promtail"
    "16686/tcp:Jaeger UI"
    "14268/tcp:Jaeger HTTP Collector"
    "14250/tcp:Jaeger gRPC Collector"
    "9093/tcp:Alertmanager"
    "9100/tcp:Node Exporter"
    "9187/tcp:Postgres Exporter"
    "9121/tcp:Redis Exporter"
)

step "Ouverture des ports d'observabilité..."

for port_info in "${PORTS[@]}"; do
    IFS=':' read -r port service <<< "$port_info"
    info "Ouverture du port $port pour $service..."
    
    if ufw allow "$port" comment "$service"; then
        success "Port $port ouvert pour $service"
    else
        warning "Impossible d'ouvrir le port $port (peut-être déjà ouvert)"
    fi
done

# Vérifier les règles
step "Vérification des règles UFW..."
echo ""
info "Règles UFW pour les ports d'observabilité:"
ufw status | grep -E "(9090|3000|3100|9080|16686|14268|14250|9093|9100|9187|9121)" || warning "Aucune règle trouvée"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Ports ouverts avec succès!                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 PORTS OUVERTS:"
echo ""
echo "  ✓ Prometheus      → 9090"
echo "  ✓ Grafana         → 3000"
echo "  ✓ Loki            → 3100"
echo "  ✓ Promtail        → 9080"
echo "  ✓ Jaeger UI       → 16686"
echo "  ✓ Jaeger HTTP     → 14268"
echo "  ✓ Jaeger gRPC     → 14250"
echo "  ✓ Alertmanager    → 9093"
echo "  ✓ Node Exporter   → 9100"
echo "  ✓ Postgres Exporter → 9187"
echo "  ✓ Redis Exporter  → 9121"
echo ""
echo "🌐 ACCÈS EXTERNE:"
echo ""
echo "  - Grafana: http://148.230.112.148:3000"
echo "  - Prometheus: http://148.230.112.148:9090"
echo "  - Jaeger UI: http://148.230.112.148:16686"
echo "  - Alertmanager: http://148.230.112.148:9093"
echo ""
warning "⚠️  SÉCURITÉ: En production, utilisez un reverse proxy (Nginx) avec authentification!"
echo ""

