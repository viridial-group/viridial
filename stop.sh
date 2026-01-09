#!/bin/bash

# Script d'arrêt simplifié pour Viridial
# Usage: ./stop.sh [--production]
#
# Options:
#   --production : Arrêt pour serveur VPS en production
#   --local      : Arrêt pour développement local (par défaut)

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Déterminer le mode
MODE="local"
if [[ "$1" == "--production" ]]; then
  MODE="production"
elif [[ "$1" == "--local" ]]; then
  MODE="local"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
cd "$PROJECT_ROOT"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🛑 Arrêt Viridial - Mode: $MODE${NC}                        ║"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$MODE" == "local" ]; then
  # Mode local - Arrêter Docker et Next.js
  
  # Arrêter Next.js si en cours d'exécution
  if [ -f "/tmp/nextjs.pid" ]; then
    NEXTJS_PID=$(cat /tmp/nextjs.pid)
    if ps -p $NEXTJS_PID > /dev/null 2>&1; then
      echo -e "${BLUE}🛑 Arrêt du serveur Next.js...${NC}"
      kill $NEXTJS_PID 2>/dev/null || true
      rm /tmp/nextjs.pid
      echo -e "${GREEN}✅ Serveur Next.js arrêté${NC}"
    fi
  fi
  
  # Arrêter les services Docker
  cd infrastructure/docker-compose
  
  echo -e "${BLUE}🛑 Arrêt des services métier...${NC}"
  docker-compose -f app-auth.yml down 2>/dev/null || true
  docker-compose -f app-property.yml down 2>/dev/null || true
  docker-compose -f app-geolocation.yml down 2>/dev/null || true
  docker-compose -f app-search.yml down 2>/dev/null || true
  
  echo -e "${BLUE}🛑 Arrêt des services de base...${NC}"
  docker-compose -f docker-compose.yml down 2>/dev/null || true
  
  cd "$PROJECT_ROOT"
  
  echo ""
  echo -e "${GREEN}✅ Tous les services sont arrêtés${NC}"
  echo ""
  echo -e "${YELLOW}💡 Pour supprimer aussi les volumes (⚠️  supprime les données):${NC}"
  echo -e "   ${BLUE}cd infrastructure/docker-compose${NC}"
  echo -e "   ${BLUE}docker-compose -f docker-compose.yml down -v${NC}"
  echo ""
  
else
  # Mode production - Arrêter PM2
  
  if command -v pm2 &> /dev/null; then
    echo -e "${BLUE}🛑 Arrêt des services avec PM2...${NC}"
    
    pm2 stop all || true
    echo -e "${GREEN}✅ Services arrêtés${NC}"
    echo ""
    echo -e "${YELLOW}💡 Pour supprimer les processus PM2:${NC}"
    echo -e "   ${BLUE}pm2 delete all${NC}"
    echo ""
  else
    echo -e "${YELLOW}⚠️  PM2 n'est pas installé. Arrêt manuel requis.${NC}"
    echo ""
    echo -e "${BLUE}Arrêt manuel recommandé:${NC}"
    echo "1. Arrêter les services backend (systemd, supervisor, etc.)"
    echo "2. Arrêter le serveur web (Nginx/Apache)"
    echo "3. Arrêter le frontend (process manager)"
    echo ""
  fi
  
  echo -e "${GREEN}✅ Arrêt terminé${NC}"
fi

