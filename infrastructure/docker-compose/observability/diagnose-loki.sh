#!/bin/bash

# Script de diagnostic pour Loki

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔍 Diagnostic Loki                                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. État du conteneur
echo -e "${BLUE}📦 État du conteneur:${NC}"
docker compose -f docker-compose.observability.yml ps loki
echo ""

# 2. Logs récents
echo -e "${BLUE}📋 Logs récents (20 dernières lignes):${NC}"
docker compose -f docker-compose.observability.yml logs --tail=20 loki
echo ""

# 3. Test des endpoints
echo -e "${BLUE}🌐 Test des endpoints:${NC}"
echo ""

echo -n "  /ready: "
READY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3100/ready" 2>/dev/null)
if [ "$READY_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ OK (HTTP $READY_STATUS)${NC}"
elif [ "$READY_STATUS" = "503" ]; then
    echo -e "${YELLOW}⚠ Service Unavailable (HTTP $READY_STATUS) - Loki initialise${NC}"
else
    echo -e "${RED}✗ FAIL (HTTP $READY_STATUS)${NC}"
fi

echo -n "  /loki/api/v1/labels: "
if response=$(curl -s "http://localhost:3100/loki/api/v1/labels" 2>/dev/null); then
    if echo "$response" | grep -q "status.*success"; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${YELLOW}⚠ Réponse: ${response:0:100}...${NC}"
    fi
else
    echo -e "${RED}✗ FAIL (Connection refused)${NC}"
fi

echo -n "  /metrics: "
METRICS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3100/metrics" 2>/dev/null)
if [ "$METRICS_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ OK (HTTP $METRICS_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠ HTTP $METRICS_STATUS${NC}"
fi

echo ""

# 4. Vérification de la santé Docker
echo -e "${BLUE}🏥 Santé Docker:${NC}"
HEALTH=$(docker inspect viridial-loki --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
echo "  Health status: $HEALTH"
echo ""

# 5. Recommandation
if [ "$READY_STATUS" = "503" ] && [ "$HEALTH" != "healthy" ]; then
    echo -e "${YELLOW}💡 Recommandation:${NC}"
    echo "   Loki est en cours d'initialisation. Attendez 30-60 secondes et réessayez:"
    echo "   ./test-observability.sh"
    echo ""
    echo "   Si le problème persiste, vérifiez les logs:"
    echo "   docker compose -f docker-compose.observability.yml logs loki"
elif [ "$READY_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Loki est opérationnel!${NC}"
else
    echo -e "${RED}❌ Problème détecté. Vérifiez les logs ci-dessus.${NC}"
fi

