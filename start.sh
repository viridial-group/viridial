#!/bin/bash

# Script de démarrage simplifié pour Viridial
# Usage: ./start.sh [--production]
#
# Options:
#   --production : Démarrage pour serveur VPS en production
#   --local      : Démarrage pour développement local (par défaut)

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
echo -e "${BLUE}║  🚀 Démarrage Viridial - Mode: $MODE${NC}                    ║"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$MODE" == "local" ]; then
  # Mode local - Docker Compose
  
  # Vérifier Docker
  if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop.${NC}"
    exit 1
  fi
  
  # Vérifier les fichiers .env
  if [ ! -f "infrastructure/docker-compose/.env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env manquant. Exécution de install.sh...${NC}"
    ./install.sh --local
  fi
  
  cd infrastructure/docker-compose
  
  # Charger et vérifier les variables d'environnement
  if [ -f ".env" ]; then
    set -a
    source .env
    set +a
    
    # Vérifier et corriger MINIO_ROOT_PASSWORD si manquant ou vide
    if [ -z "${MINIO_ROOT_PASSWORD}" ] || grep -q "^MINIO_ROOT_PASSWORD=$" .env || grep -q "^MINIO_ROOT_PASSWORD=\s*$" .env; then
      echo -e "${YELLOW}⚠️  MINIO_ROOT_PASSWORD manquant ou vide. Génération d'un mot de passe...${NC}"
      # Générer un mot de passe sécurisé
      if command -v openssl &> /dev/null; then
        MINIO_PASSWORD=$(openssl rand -base64 32 2>/dev/null | tr -d "=+/" | cut -c1-24 || echo "minioadmin123")
      else
        MINIO_PASSWORD="minioadmin123"
      fi
      
      # Ajouter ou remplacer dans .env
      if grep -q "^MINIO_ROOT_PASSWORD=" .env; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
          sed -i '' "s/^MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}/" .env
        else
          sed -i "s/^MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}/" .env
        fi
      else
        # Ajouter après MINIO_ROOT_USER si elle existe, sinon à la fin
        if grep -q "^MINIO_ROOT_USER=" .env; then
          if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/^MINIO_ROOT_USER=/a\\
MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}" .env
          else
            sed -i "/^MINIO_ROOT_USER=/a MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}" .env
          fi
        else
          echo "MINIO_ROOT_USER=minioadmin" >> .env
          echo "MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}" >> .env
        fi
      fi
      
      export MINIO_ROOT_PASSWORD="${MINIO_PASSWORD}"
      echo -e "${GREEN}✅ MINIO_ROOT_PASSWORD défini: ${MINIO_PASSWORD}${NC}"
    fi
    
    # S'assurer que MINIO_ROOT_USER existe
    if [ -z "${MINIO_ROOT_USER}" ]; then
      if ! grep -q "^MINIO_ROOT_USER=" .env; then
        if grep -q "^MINIO_ROOT_PASSWORD=" .env; then
          if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/^MINIO_ROOT_PASSWORD=/i\\
MINIO_ROOT_USER=minioadmin" .env
          else
            sed -i "/^MINIO_ROOT_PASSWORD=/i MINIO_ROOT_USER=minioadmin" .env
          fi
        else
          echo "MINIO_ROOT_USER=minioadmin" >> .env
        fi
      fi
      export MINIO_ROOT_USER="minioadmin"
    fi
  fi
  
  # Créer le réseau Docker
  echo -e "${BLUE}🔗 Création du réseau Docker...${NC}"
  docker network create viridial-network 2>/dev/null || echo -e "${GREEN}✅ Réseau existe déjà${NC}"
  
  # Étape 1: Services de base
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Étape 1/4 : Services de base (Postgres, Redis, etc.)       ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
  docker-compose -f docker-compose.yml up -d
  
  echo -e "${YELLOW}⏳ Attente que les services de base soient prêts...${NC}"
  sleep 5
  
  # Attendre Postgres
  echo -e "${BLUE}⏳ Attente de Postgres...${NC}"
  timeout=30
  counter=0
  while ! docker exec viridial-postgres pg_isready -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" >/dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
      echo -e "${RED}❌ Timeout: Postgres n'est pas prêt${NC}"
      exit 1
    fi
    sleep 2
    counter=$((counter + 2))
  done
  echo -e "${GREEN}✅ Postgres est prêt${NC}"
  
  # Attendre Redis
  echo -e "${BLUE}⏳ Attente de Redis...${NC}"
  counter=0
  while ! docker exec viridial-redis redis-cli ping >/dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
      echo -e "${RED}❌ Timeout: Redis n'est pas prêt${NC}"
      exit 1
    fi
    sleep 2
    counter=$((counter + 2))
  done
  echo -e "${GREEN}✅ Redis est prêt${NC}"
  
  # Attendre Meilisearch
  echo -e "${BLUE}⏳ Attente de Meilisearch...${NC}"
  counter=0
  while ! curl -s http://localhost:7700/health >/dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
      echo -e "${YELLOW}⚠️  Meilisearch prend plus de temps, continuons...${NC}"
      break
    fi
    sleep 2
    counter=$((counter + 2))
  done
  echo -e "${GREEN}✅ Meilisearch est prêt${NC}"
  
  # Attendre MinIO
  echo -e "${BLUE}⏳ Attente de MinIO...${NC}"
  counter=0
  while ! curl -s http://localhost:9000/minio/health/live >/dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
      echo -e "${YELLOW}⚠️  MinIO prend plus de temps, continuons...${NC}"
      break
    fi
    sleep 2
    counter=$((counter + 2))
  done
  if docker ps | grep -q viridial-minio.*healthy; then
    echo -e "${GREEN}✅ MinIO est prêt${NC}"
  else
    echo -e "${YELLOW}⚠️  MinIO est démarré mais pas encore healthy${NC}"
  fi
  
  # Étape 2: Initialiser la base de données
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Étape 2/4 : Initialisation base de données                  ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
  
  if [ -f "init-auth-db.sql" ]; then
    docker exec -i viridial-postgres psql -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" < init-auth-db.sql 2>/dev/null || echo -e "${YELLOW}⚠️  Tables Auth peut-être déjà initialisées${NC}"
    echo -e "${GREEN}✅ Base de données Auth initialisée${NC}"
  fi
  
  # Étape 3: Services métier
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Étape 3/4 : Services métier                                 ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
  
  echo -e "${BLUE}🔐 Démarrage Auth Service...${NC}"
  docker-compose -f app-auth.yml up -d --build
  sleep 10
  
  echo -e "${BLUE}📦 Démarrage Property Service...${NC}"
  docker-compose -f app-property.yml up -d --build
  
  echo -e "${BLUE}📍 Démarrage Geolocation Service...${NC}"
  docker-compose -f app-geolocation.yml up -d --build
  
  echo -e "${BLUE}🔍 Démarrage Search Service...${NC}"
  docker-compose -f app-search.yml up -d --build
  
  # Étape 4: Frontend (mode développement)
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Étape 4/4 : Frontend                                        ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
  
  cd "$PROJECT_ROOT/frontend/web"
  
  echo -e "${BLUE}📦 Compilation du frontend avec SASS...${NC}"
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules manquant. Exécution de npm install...${NC}"
    npm install
  fi
  
  # Démarrer le serveur de développement Next.js (en arrière-plan)
  echo -e "${BLUE}🚀 Démarrage du serveur de développement Next.js...${NC}"
  npm run dev > /tmp/nextjs-dev.log 2>&1 &
  NEXTJS_PID=$!
  echo $NEXTJS_PID > /tmp/nextjs.pid
  sleep 5
  
  cd "$PROJECT_ROOT"
  
  echo ""
  echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅ Tous les services sont démarrés                          ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${BLUE}📊 Services disponibles:${NC}"
  echo -e "   🌐 Frontend:           http://localhost:3000"
  echo -e "   🔐 Auth Service:       http://localhost:8080"
  echo -e "   🏠 Property Service:   http://localhost:3001"
  echo -e "   📍 Geolocation Service: http://localhost:3002"
  echo -e "   🔍 Search Service:     http://localhost:3003"
  echo -e "   🗄️  Postgres:           localhost:5432"
  echo -e "   🔴 Redis:              localhost:6379"
  echo -e "   🔎 Meilisearch:        http://localhost:7700"
  echo -e "   📦 MinIO:              http://localhost:9000 (Console: 9001)"
  echo ""
  echo -e "${YELLOW}💡 Pour arrêter les services:${NC}"
  echo -e "   ${BLUE}./stop.sh${NC}"
  echo ""
  echo -e "${YELLOW}💡 Pour voir les logs Next.js:${NC}"
  echo -e "   ${BLUE}tail -f /tmp/nextjs-dev.log${NC}"
  echo ""
  
else
  # Mode production - PM2 ou systemd
  echo -e "${BLUE}📋 Mode Production - Démarrage des services...${NC}"
  
  # Vérifier .env
  if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Fichier .env manquant. Créez-le avant de démarrer en production.${NC}"
    exit 1
  fi
  
  # Charger les variables d'environnement
  set -a
  source .env
  set +a
  
  # Vérifier PM2
  if command -v pm2 &> /dev/null; then
    echo -e "${BLUE}📦 Démarrage avec PM2...${NC}"
    
    # Démarrer les services backend avec PM2
    cd services/auth-service
    pm2 start npm --name "auth-service" -- start || pm2 restart auth-service
    cd "$PROJECT_ROOT/services/property-service"
    pm2 start npm --name "property-service" -- start || pm2 restart property-service
    cd "$PROJECT_ROOT/services/geolocation-service"
    pm2 start npm --name "geolocation-service" -- start || pm2 restart geolocation-service
    cd "$PROJECT_ROOT/services/search-service"
    pm2 start npm --name "search-service" -- start || pm2 restart search-service
    cd "$PROJECT_ROOT"
    
    # Démarrer le frontend en production
    cd frontend/web
    npm run build
    pm2 start npm --name "frontend" -- start || pm2 restart frontend
    cd "$PROJECT_ROOT"
    
    echo -e "${GREEN}✅ Services démarrés avec PM2${NC}"
    echo -e "${YELLOW}💡 Commandes PM2 utiles:${NC}"
    echo -e "   ${BLUE}pm2 status${NC} - Voir l'état des services"
    echo -e "   ${BLUE}pm2 logs${NC} - Voir les logs"
    echo -e "   ${BLUE}pm2 save${NC} - Sauvegarder la configuration"
    echo -e "   ${BLUE}pm2 startup${NC} - Activer le démarrage automatique"
    
  else
    echo -e "${YELLOW}⚠️  PM2 n'est pas installé. Installation recommandée pour la production.${NC}"
    echo -e "${BLUE}📦 Installer PM2:${NC}"
    echo -e "   ${BLUE}npm install -g pm2${NC}"
    echo ""
    echo -e "${YELLOW}Alternative: Utilisez systemd pour gérer les services${NC}"
  fi
  
  echo ""
  echo -e "${GREEN}✅ Services démarrés en mode production${NC}"
fi

