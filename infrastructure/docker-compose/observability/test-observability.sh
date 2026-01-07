#!/bin/bash

# Script de test de la stack d'observabilité  

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_service() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Test $name... "
    
    if response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null); then
        if [ "$response" = "$expected_status" ] || [ "$response" = "200" ] || [ "$response" = "302" ]; then
            echo -e "${GREEN}✓ OK${NC}"
            return 0
        else
            echo -e "${RED}✗ FAIL (HTTP $response)${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ FAIL (Connection refused)${NC}"
        return 1
    fi
}

test_metrics() {
    local name=$1
    local url=$2
    
    echo -n "Test métriques $name... "
    
    if response=$(curl -s "$url" 2>/dev/null | grep -q "# HELP" && echo "ok" || echo "fail"); then
        if [ "$response" = "ok" ]; then
            echo -e "${GREEN}✓ OK${NC}"
            return 0
        else
            echo -e "${RED}✗ FAIL (Pas de métriques)${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ FAIL (Connection refused)${NC}"
        return 1
    fi
}

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧪 Tests de Connectivité - Stack Observabilité             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

FAILED=0

# Tests des services principaux
echo "📊 SERVICES PRINCIPAUX:"
echo ""

test_service "Prometheus" "http://localhost:9090/-/healthy" || FAILED=$((FAILED + 1))
test_service "Grafana" "http://localhost:3000/api/health" || FAILED=$((FAILED + 1))

# Test Loki avec tolérance pour 503 (initialisation)
echo -n "Test Loki... "
LOKI_READY=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3100/ready" 2>/dev/null)
LOKI_QUERY=$(curl -s "http://localhost:3100/loki/api/v1/labels" 2>/dev/null)
if [ "$LOKI_READY" = "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
elif [ "$LOKI_READY" = "503" ] && echo "$LOKI_QUERY" | grep -q "status.*success"; then
    echo -e "${GREEN}✓ OK (API fonctionnelle, initialisation en cours)${NC}"
else
    echo -e "${RED}✗ FAIL (HTTP $LOKI_READY)${NC}"
    FAILED=$((FAILED + 1))
fi

test_service "Jaeger UI" "http://localhost:16686/" || FAILED=$((FAILED + 1))
test_service "Alertmanager" "http://localhost:9093/-/healthy" || FAILED=$((FAILED + 1))

echo ""
echo "📈 EXPORTERS:"
echo ""

test_metrics "Node Exporter" "http://localhost:9100/metrics" || FAILED=$((FAILED + 1))
test_metrics "Postgres Exporter" "http://localhost:9187/metrics" || FAILED=$((FAILED + 1))
test_metrics "Redis Exporter" "http://localhost:9121/metrics" || FAILED=$((FAILED + 1))

echo ""
echo "🔍 TESTS AVANCÉS:"
echo ""

# Test Prometheus targets
echo -n "Test Prometheus targets... "
if targets=$(curl -s "http://localhost:9090/api/v1/targets" 2>/dev/null); then
    active_targets=$(echo "$targets" | grep -o '"activeTargets":\[.*\]' | grep -o '"health":"up"' | wc -l)
    if [ "$active_targets" -gt 0 ]; then
        echo -e "${GREEN}✓ OK ($active_targets targets actifs)${NC}"
    else
        echo -e "${YELLOW}⚠ WARNING (Aucun target actif)${NC}"
    fi
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# Test Loki query
echo -n "Test Loki query... "
if response=$(curl -s "http://localhost:3100/loki/api/v1/labels" 2>/dev/null); then
    if echo "$response" | grep -q "status.*success"; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${YELLOW}⚠ WARNING (Loki répond mais pas de labels)${NC}"
    fi
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Tous les tests sont passés!                            ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ $FAILED test(s) ont échoué                              ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "💡 Vérifiez les logs:"
    echo "   docker-compose -f docker-compose.observability.yml logs [service]"
    exit 1
fi

