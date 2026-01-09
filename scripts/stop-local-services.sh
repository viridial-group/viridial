#!/bin/bash

# Script pour arrêter tous les services Viridial
# Usage: ./scripts/stop-local-services.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT/infrastructure/docker-compose"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🛑 Arrêt de tous les services Viridial                     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Arrêter tous les services
echo -e "${YELLOW}🛑 Arrêt des services métier...${NC}"
docker-compose -f app-auth.yml down 2>/dev/null || true
docker-compose -f app-property.yml down 2>/dev/null || true
docker-compose -f app-geolocation.yml down 2>/dev/null || true
docker-compose -f app-search.yml down 2>/dev/null || true

echo -e "${YELLOW}🛑 Arrêt des services de base...${NC}"
docker-compose -f docker-compose.yml down 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Tous les services sont arrêtés${NC}"
echo ""
echo -e "${YELLOW}💡 Pour supprimer aussi les volumes (⚠️  supprime les données):${NC}"
echo -e "   ${BLUE}docker-compose -f docker-compose.yml down -v${NC}"
echo ""

