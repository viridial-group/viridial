#!/bin/bash

# Script pour corriger les permissions du répertoire dist de property-service
# Ce script nécessite sudo pour corriger les fichiers créés par root

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔧 Correction des permissions - property-service          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/property-service"

if [ -d "dist" ]; then
  echo -e "${YELLOW}⚠️  Détection du répertoire dist avec permissions root${NC}"
  echo -e "${YELLOW}   Ce script nécessite votre mot de passe sudo pour corriger les permissions.${NC}"
  echo ""
  
  if sudo rm -rf dist 2>/dev/null; then
    echo -e "${GREEN}✅ Répertoire dist supprimé avec succès${NC}"
  else
    echo -e "${RED}❌ Erreur lors de la suppression (mot de passe incorrect?)${NC}"
    echo -e "${YELLOW}   Essayez manuellement: sudo rm -rf services/property-service/dist${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✅ Pas de répertoire dist (normal si jamais compilé)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Permissions corrigées. Vous pouvez maintenant builder:${NC}"
echo -e "   ${BLUE}cd services/property-service && npm run build${NC}"

