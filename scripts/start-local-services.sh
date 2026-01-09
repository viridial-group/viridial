#!/bin/bash

# Script pour démarrer tous les services Viridial en local sur Mac
# Usage: ./scripts/start-local-services.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 Démarrage de tous les services Viridial (Local Mac)    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier que Docker est en cours d'exécution
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop.${NC}"
  exit 1
fi

# Vérifier que les fichiers .env existent
echo -e "${BLUE}📋 Vérification des fichiers .env...${NC}"
if [ ! -f "infrastructure/docker-compose/.env" ]; then
  echo -e "${YELLOW}⚠️  Fichier .env manquant. Exécution de setup-env.sh...${NC}"
  ./scripts/setup-env.sh
fi

# Charger les variables d'environnement
cd infrastructure/docker-compose
if [ -f ".env" ]; then
  set -a
  source .env
  set +a
fi

# Créer le réseau Docker s'il n'existe pas
echo -e "${BLUE}🔗 Création du réseau Docker...${NC}"
docker network create viridial-network 2>/dev/null || echo -e "${GREEN}✅ Réseau viridial-network existe déjà${NC}"

# Étape 1: Démarrer les services de base (Postgres, Redis, Meilisearch, MinIO)
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 1/5 : Services de base (Postgres, Redis, etc.)      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
docker-compose -f docker-compose.yml up -d

echo ""
echo -e "${YELLOW}⏳ Attente que les services de base soient prêts...${NC}"
sleep 5

# Attendre que Postgres soit prêt
echo -e "${BLUE}⏳ Attente de Postgres...${NC}"
timeout=30
counter=0
while ! docker exec viridial-postgres pg_isready -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" >/dev/null 2>&1; do
  if [ $counter -ge $timeout ]; then
    echo -e "${RED}❌ Timeout: Postgres n'est pas prêt après ${timeout}s${NC}"
    exit 1
  fi
  sleep 2
  counter=$((counter + 2))
done
echo -e "${GREEN}✅ Postgres est prêt${NC}"

# Attendre que Redis soit prêt
echo -e "${BLUE}⏳ Attente de Redis...${NC}"
counter=0
while ! docker exec viridial-redis redis-cli ping >/dev/null 2>&1; do
  if [ $counter -ge $timeout ]; then
    echo -e "${RED}❌ Timeout: Redis n'est pas prêt après ${timeout}s${NC}"
    exit 1
  fi
  sleep 2
  counter=$((counter + 2))
done
echo -e "${GREEN}✅ Redis est prêt${NC}"

# Attendre que Meilisearch soit prêt
echo -e "${BLUE}⏳ Attente de Meilisearch...${NC}"
counter=0
while ! curl -s http://localhost:7700/health >/dev/null 2>&1; do
  if [ $counter -ge $timeout ]; then
    echo -e "${RED}❌ Timeout: Meilisearch n'est pas prêt après ${timeout}s${NC}"
    exit 1
  fi
  sleep 2
  counter=$((counter + 2))
done
echo -e "${GREEN}✅ Meilisearch est prêt${NC}"

# Étape 2: Initialiser la base de données Auth
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 2/5 : Initialisation base de données Auth            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
if [ -f "init-auth-db.sql" ]; then
  docker exec -i viridial-postgres psql -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" < init-auth-db.sql 2>/dev/null || echo -e "${YELLOW}⚠️  Tables Auth peut-être déjà initialisées${NC}"
  echo -e "${GREEN}✅ Base de données Auth initialisée${NC}"
fi

# Étape 3: Démarrer Auth Service
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 3/5 : Service d'authentification                     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
docker-compose -f app-auth.yml up -d --build
echo -e "${YELLOW}⏳ Attente que Auth Service soit prêt...${NC}"
sleep 10

# Étape 4: Démarrer les autres services (Property, Geolocation, Search)
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 4/5 : Services métier (Property, Geolocation, Search)${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"

# Property Service
echo -e "${BLUE}📦 Démarrage Property Service...${NC}"
docker-compose -f app-property.yml up -d --build
echo -e "${GREEN}✅ Property Service démarré${NC}"

# Geolocation Service
echo -e "${BLUE}📍 Démarrage Geolocation Service...${NC}"
docker-compose -f app-geolocation.yml up -d --build
echo -e "${GREEN}✅ Geolocation Service démarré${NC}"

# Search Service
echo -e "${BLUE}🔍 Démarrage Search Service...${NC}"
docker-compose -f app-search.yml up -d --build
echo -e "${GREEN}✅ Search Service démarré${NC}"

# Étape 5: Créer utilisateur de test
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 5/5 : Création utilisateur de test                   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
if [ -f "create-test-user.sh" ]; then
  ./create-test-user.sh
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Tous les services sont démarrés                        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Services disponibles:${NC}"
echo -e "   🔐 Auth Service:        http://localhost:8080"
echo -e "   🏠 Property Service:    http://localhost:3001"
echo -e "   📍 Geolocation Service: http://localhost:3002"
echo -e "   🔍 Search Service:      http://localhost:3003"
echo -e "   🗄️  Postgres:            localhost:5432"
echo -e "   🔴 Redis:               localhost:6379"
echo -e "   🔎 Meilisearch:         http://localhost:7700"
echo -e "   📦 MinIO:               http://localhost:9000 (Console: 9001)"
echo ""
echo -e "${YELLOW}💡 Pour insérer les données de test, exécutez:${NC}"
echo -e "   ${BLUE}./scripts/insert-test-data.sh${NC}"
echo ""
echo -e "${YELLOW}💡 Pour voir les logs:${NC}"
echo -e "   ${BLUE}docker-compose logs -f [service-name]${NC}"
echo ""
echo -e "${YELLOW}💡 Pour arrêter tous les services:${NC}"
echo -e "   ${BLUE}./scripts/stop-local-services.sh${NC}"
echo ""

