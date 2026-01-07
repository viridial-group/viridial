#!/bin/bash
# Script de test de connectivité aux services

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

test_service() {
    local name=$1
    local test_cmd=$2
    
    echo -n "Test $name... "
    if eval "$test_cmd" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ ÉCHEC${NC}"
        return 1
    fi
}

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧪 Test de Connectivité aux Services                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

FAILED=0

# Test PostgreSQL
if test_service "PostgreSQL" "docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-viridial} -d ${POSTGRES_DB:-viridial}" || \
   docker compose exec -T postgres pg_isready -U ${POSTGRES_USER:-viridial} -d ${POSTGRES_DB:-viridial} > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL OK${NC}"
else
    echo -e "${RED}✗ PostgreSQL ÉCHEC${NC}"
    FAILED=$((FAILED + 1))
fi

# Test Redis
if test_service "Redis" "docker-compose exec -T redis redis-cli ping" || \
   docker compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis OK${NC}"
else
    echo -e "${RED}✗ Redis ÉCHEC${NC}"
    FAILED=$((FAILED + 1))
fi

# Test Meilisearch
if test_service "Meilisearch" "curl -s http://localhost:${MEILISEARCH_PORT:-7700}/health" || \
   curl -s http://localhost:${MEILISEARCH_PORT:-7700}/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Meilisearch OK${NC}"
else
    echo -e "${RED}✗ Meilisearch ÉCHEC${NC}"
    FAILED=$((FAILED + 1))
fi

# Test MinIO
if test_service "MinIO API" "curl -s http://localhost:${MINIO_API_PORT:-9000}/minio/health/live" || \
   curl -s http://localhost:${MINIO_API_PORT:-9000}/minio/health/live > /dev/null 2>&1; then
    echo -e "${GREEN}✓ MinIO API OK${NC}"
else
    echo -e "${RED}✗ MinIO API ÉCHEC${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Tous les services sont accessibles!                      ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ $FAILED service(s) non accessible(s)                      ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Vérifiez l'état des services:"
    echo "  docker-compose ps"
    echo "  docker-compose logs [service-name]"
    exit 1
fi

