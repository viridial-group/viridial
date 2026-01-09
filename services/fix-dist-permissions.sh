#!/bin/bash

# Script pour corriger les permissions des répertoires dist dans tous les services
# Usage: ./fix-dist-permissions.sh

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🛠️ Correction des permissions des répertoires dist         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Services à traiter
SERVICES=("auth-service" "property-service" "geolocation-service" "search-service" "marketing-service" "review-service")

NEEDS_SUDO=()

for service in "${SERVICES[@]}"; do
  if [ -d "$service/dist" ]; then
    echo -e "${BLUE}🔧 Correction des permissions pour $service/dist...${NC}"
    
    # Essayer de corriger les permissions sans sudo
    if chmod -R u+w "$service/dist" 2>/dev/null && rm -rf "$service/dist" 2>/dev/null; then
      echo -e "${GREEN}✅ Permissions corrigées et dist supprimé pour $service${NC}"
    else
      echo -e "${YELLOW}⚠️  Permissions insuffisantes pour $service/dist (nécessite sudo)${NC}"
      NEEDS_SUDO+=("$service")
    fi
  else
    echo -e "${GREEN}✅ Pas de répertoire dist pour $service (normal si jamais compilé)${NC}"
  fi
done

echo ""

# Si certains services nécessitent sudo
if [ ${#NEEDS_SUDO[@]} -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Les services suivants nécessitent sudo pour corriger les permissions:${NC}"
  for service in "${NEEDS_SUDO[@]}"; do
    echo -e "   ${RED}- $service${NC}"
  done
  echo ""
  echo -e "${YELLOW}💡 Exécutez les commandes suivantes avec sudo:${NC}"
  for service in "${NEEDS_SUDO[@]}"; do
    echo -e "   ${BLUE}sudo rm -rf $SCRIPT_DIR/$service/dist${NC}"
  done
  echo ""
  echo -e "${YELLOW}   Ou utilisez le script spécifique:${NC}"
  if [ -f "$SCRIPT_DIR/fix-property-dist.sh" ]; then
    echo -e "   ${BLUE}./services/fix-property-dist.sh${NC}"
  fi
else
  echo -e "${GREEN}✅ Toutes les permissions ont été corrigées sans sudo${NC}"
fi

echo ""

