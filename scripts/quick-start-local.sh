#!/bin/bash

# Script simplifié pour démarrer rapidement tous les services en local
# Usage: ./scripts/quick-start-local.sh

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
echo -e "${BLUE}║  🚀 Démarrage rapide - Services Viridial (Local Mac)       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier Docker
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop.${NC}"
  exit 1
fi

# Créer le fichier .env avec des valeurs par défaut si inexistant
cd infrastructure/docker-compose
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}📝 Création du fichier .env avec des valeurs par défaut...${NC}"
  cat > .env <<EOF
# ========================================
# Docker Compose Environment Variables
# ========================================
# Valeurs par défaut pour développement local

# Database
POSTGRES_USER=viridial
POSTGRES_PASSWORD=viridial_dev_password_2024
POSTGRES_DB=viridial
DATABASE_URL=postgres://viridial:viridial_dev_password_2024@viridial-postgres:5432/viridial

# Redis
REDIS_URL=redis://viridial-redis:6379

# Meilisearch
MEILISEARCH_URL=http://meilisearch:7700
MEILI_MASTER_KEY=masterKey_dev_local_12345678901234567890

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123

# Frontend URLs (pour CORS)
FRONTEND_URL=http://localhost:3000

# JWT (doit être identique pour auth et property services)
JWT_SECRET=jwt_secret_dev_local_minimum_32_characters_long
JWT_REFRESH_SECRET=jwt_refresh_secret_dev_local_minimum_32_characters
JWT_ACCESS_SECRET=jwt_access_secret_dev_local_minimum_32_characters_long

# Auth Service
AUTH_TEST_EMAIL=test@viridial.com
AUTH_TEST_PASSWORD="    "
AUTH_TEST_ROLE=admin

# Geolocation Service
GEOCODING_PROVIDER=stub
GEOLOCATION_SERVICE_URL=http://geolocation-service:3002

# Property Service
PROPERTY_SERVICE_URL=http://property-service:3001
SEARCH_SERVICE_URL=http://search-service:3003
GEOLOCATION_SERVICE_URL=http://geolocation-service:3002

# SMTP (optionnel pour développement local)
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
FROM_NAME=
EOF
  echo -e "${GREEN}✅ Fichier .env créé${NC}"
fi

# Charger les variables
set -a
source .env
set +a

# Créer le réseau
echo -e "${BLUE}🔗 Création du réseau Docker...${NC}"
docker network create viridial-network 2>/dev/null || echo -e "${GREEN}✅ Réseau existe déjà${NC}"

# Étape 1: Services de base
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 1/5 : Services de base                              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
docker-compose -f docker-compose.yml up -d

echo -e "${YELLOW}⏳ Attente que les services de base soient prêts...${NC}"
sleep 8

# Attendre Postgres
echo -e "${BLUE}⏳ Attente de Postgres...${NC}"
for i in {1..15}; do
  if docker exec viridial-postgres pg_isready -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Postgres est prêt${NC}"
    break
  fi
  if [ $i -eq 15 ]; then
    echo -e "${RED}❌ Timeout: Postgres n'est pas prêt${NC}"
    exit 1
  fi
  sleep 2
done

# Attendre Redis
echo -e "${BLUE}⏳ Attente de Redis...${NC}"
for i in {1..15}; do
  if docker exec viridial-redis redis-cli ping >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis est prêt${NC}"
    break
  fi
  if [ $i -eq 15 ]; then
    echo -e "${YELLOW}⚠️  Redis prend plus de temps que prévu, continuons...${NC}"
    break
  fi
  sleep 2
done

# Attendre Meilisearch
echo -e "${BLUE}⏳ Attente de Meilisearch...${NC}"
for i in {1..15}; do
  if curl -s http://localhost:7700/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Meilisearch est prêt${NC}"
    break
  fi
  if [ $i -eq 15 ]; then
    echo -e "${YELLOW}⚠️  Meilisearch prend plus de temps que prévu, continuons...${NC}"
    break
  fi
  sleep 2
done

# Étape 2: Initialiser la base de données
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 2/5 : Initialisation base de données                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"

# Initialiser Auth DB
if [ -f "init-auth-db.sql" ]; then
  docker exec -i viridial-postgres psql -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" < init-auth-db.sql 2>/dev/null || echo -e "${YELLOW}⚠️  Tables Auth peut-être déjà initialisées${NC}"
  echo -e "${GREEN}✅ Base de données Auth initialisée${NC}"
fi

# Initialiser Property tables
if [ -f "../../services/property-service/src/migrations/create-properties-tables.sql" ]; then
  docker exec -i viridial-postgres psql -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" < ../../services/property-service/src/migrations/create-properties-tables.sql 2>/dev/null || echo -e "${YELLOW}⚠️  Tables Property peut-être déjà initialisées${NC}"
  echo -e "${GREEN}✅ Tables Property initialisées${NC}"
fi

# Étape 3: Auth Service
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 3/5 : Service d'authentification                     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
docker-compose -f app-auth.yml up -d --build
echo -e "${YELLOW}⏳ Attente que Auth Service soit prêt...${NC}"
sleep 10

# Étape 4: Autres services
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 4/5 : Services métier                                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"

echo -e "${BLUE}📦 Démarrage Property Service...${NC}"
docker-compose -f app-property.yml up -d --build
echo -e "${GREEN}✅ Property Service démarré${NC}"

echo -e "${BLUE}📍 Démarrage Geolocation Service...${NC}"
docker-compose -f app-geolocation.yml up -d --build
echo -e "${GREEN}✅ Geolocation Service démarré${NC}"

echo -e "${BLUE}🔍 Démarrage Search Service...${NC}"
docker-compose -f app-search.yml up -d --build
echo -e "${GREEN}✅ Search Service démarré${NC}"

# Étape 5: Créer utilisateur et données de test
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 5/5 : Utilisateur et données de test                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"

# Créer utilisateur de test
if [ -f "create-test-user.sh" ]; then
  echo -e "${BLUE}👤 Création utilisateur de test...${NC}"
  AUTH_TEST_EMAIL="${AUTH_TEST_EMAIL:-test@viridial.com}" \
  AUTH_TEST_PASSWORD="${AUTH_TEST_PASSWORD:-    }" \
  AUTH_TEST_ROLE="${AUTH_TEST_ROLE:-admin}" \
  ./create-test-user.sh >/dev/null 2>&1 || echo -e "${YELLOW}⚠️  Utilisateur peut-être déjà créé${NC}"
  echo -e "${GREEN}✅ Utilisateur de test créé${NC}"
fi

# Insérer données de test
echo -e "${BLUE}📝 Insertion des données de test...${NC}"
cd ../..
if [ -f "scripts/insert-test-data.sh" ]; then
  ./scripts/insert-test-data.sh
fi

# Insérer données de quartiers
echo -e "${BLUE}🏘️  Insertion des quartiers...${NC}"
if [ -f "scripts/insert-neighborhoods-data.sh" ]; then
  ./scripts/insert-neighborhoods-data.sh
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Tous les services sont démarrés et configurés          ║${NC}"
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
echo -e "${BLUE}👤 Compte de test:${NC}"
echo -e "   Email: ${AUTH_TEST_EMAIL:-test@viridial.com}"
echo -e "   Password: '${AUTH_TEST_PASSWORD:-    }' (4 espaces)"
echo ""
echo -e "${YELLOW}💡 Voir les logs:${NC}"
echo -e "   ${BLUE}docker-compose logs -f [service-name]${NC}"
echo ""
echo -e "${YELLOW}💡 Arrêter les services:${NC}"
echo -e "   ${BLUE}./scripts/stop-local-services.sh${NC}"
echo ""

