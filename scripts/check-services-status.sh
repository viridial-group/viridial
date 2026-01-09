#!/bin/bash

# Script pour vérifier l'état de tous les services Viridial
# Usage: ./scripts/check-services-status.sh

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  📊 État des services Viridial                             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier Docker
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}❌ Docker n'est pas démarré${NC}"
  exit 1
fi

echo -e "${BLUE}🐳 Conteneurs Docker:${NC}"
echo ""
docker ps --filter "name=viridial" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo -e "${YELLOW}Aucun conteneur Viridial trouvé${NC}"
echo ""

# Vérifier les services
echo -e "${BLUE}🔍 Vérification des services:${NC}"
echo ""

# Postgres
if docker ps --filter "name=viridial-postgres" --format "{{.Names}}" | grep -q viridial-postgres; then
  if docker exec viridial-postgres pg_isready -U viridial -d viridial >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Postgres: Actif${NC}"
  else
    echo -e "${YELLOW}⚠️  Postgres: En cours de démarrage...${NC}"
  fi
else
  echo -e "${RED}❌ Postgres: Non démarré${NC}"
fi

# Redis
if docker ps --filter "name=viridial-redis" --format "{{.Names}}" | grep -q viridial-redis; then
  if docker exec viridial-redis redis-cli ping >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis: Actif${NC}"
  else
    echo -e "${YELLOW}⚠️  Redis: En cours de démarrage...${NC}"
  fi
else
  echo -e "${RED}❌ Redis: Non démarré${NC}"
fi

# Meilisearch
if docker ps --filter "name=viridial-meilisearch" --format "{{.Names}}" | grep -q viridial-meilisearch; then
  if curl -s http://localhost:7700/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Meilisearch: Actif${NC}"
  else
    echo -e "${YELLOW}⚠️  Meilisearch: En cours de démarrage...${NC}"
  fi
else
  echo -e "${RED}❌ Meilisearch: Non démarré${NC}"
fi

# Auth Service
if docker ps --filter "name=viridial-auth-service" --format "{{.Names}}" | grep -q viridial-auth-service; then
  if curl -s http://localhost:8080/auth/health >/dev/null 2>&1 || curl -s http://localhost:8080/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Auth Service: Actif${NC}"
  else
    echo -e "${YELLOW}⚠️  Auth Service: En cours de démarrage...${NC}"
  fi
else
  echo -e "${RED}❌ Auth Service: Non démarré${NC}"
fi

# Property Service
if docker ps --filter "name=viridial-property-service" --format "{{.Names}}" | grep -q viridial-property-service; then
  if curl -s http://localhost:3001/properties/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Property Service: Actif${NC}"
  else
    echo -e "${YELLOW}⚠️  Property Service: En cours de démarrage...${NC}"
  fi
else
  echo -e "${RED}❌ Property Service: Non démarré${NC}"
fi

# Geolocation Service
if docker ps --filter "name=viridial-geolocation-service" --format "{{.Names}}" | grep -q viridial-geolocation-service; then
  if curl -s http://localhost:3002/geolocation/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Geolocation Service: Actif${NC}"
  else
    echo -e "${YELLOW}⚠️  Geolocation Service: En cours de démarrage...${NC}"
  fi
else
  echo -e "${RED}❌ Geolocation Service: Non démarré${NC}"
fi

# Search Service
if docker ps --filter "name=viridial-search-service" --format "{{.Names}}" | grep -q viridial-search-service; then
  if curl -s http://localhost:3003/search/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Search Service: Actif${NC}"
  else
    echo -e "${YELLOW}⚠️  Search Service: En cours de démarrage...${NC}"
  fi
else
  echo -e "${RED}❌ Search Service: Non démarré${NC}"
fi

echo ""
echo -e "${BLUE}📊 Résumé:${NC}"
RUNNING=$(docker ps --filter "name=viridial" --format "{{.Names}}" | wc -l | xargs)
echo -e "   Conteneurs actifs: ${GREEN}${RUNNING}${NC}"
echo ""

