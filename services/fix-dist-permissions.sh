#!/bin/bash

# Script pour corriger les permissions des répertoires dist
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

for service in "${SERVICES[@]}"; do
  if [ -d "$service/dist" ]; then
    echo -e "${BLUE}🔧 Correction des permissions pour $service/dist...${NC}"
    
    # Essayer de corriger les permissions
    if chmod -R u+w "$service/dist" 2>/dev/null; then
      echo -e "${GREEN}✅ Permissions corrigées pour $service/dist${NC}"
      
      # Optionnel: Changer le propriétaire si nécessaire (sous macOS/Linux)
      if [ "$(uname)" == "Darwin" ] || [ "$(uname)" == "Linux" ]; then
        if [ "$EUID" -eq 0 ]; then
          chown -R "$(whoami)" "$service/dist" 2>/dev/null || true
        fi
      fi
    else
      echo -e "${YELLOW}⚠️  Impossible de corriger les permissions pour $service/dist (peut nécessiter sudo)${NC}"
      echo -e "${YELLOW}   Essayez: sudo chmod -R u+w $service/dist${NC}"
    fi
  else
    echo -e "${GREEN}✅ Pas de répertoire dist pour $service (normal si jamais compilé)${NC}"
  fi
done

echo ""
echo -e "${GREEN}✅ Correction des permissions terminée${NC}"
echo ""
echo -e "${YELLOW}💡 Si certains fichiers nécessitent encore sudo, exécutez:${NC}"
echo -e "   ${BLUE}sudo find . -name 'dist' -type d -exec chmod -R u+w {} \;${NC}"
echo ""

