#!/bin/bash
# Script de test de connectivité aux services de base
# À exécuter depuis le VPS ou localement avec kubectl configuré

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

step() {
    echo -e "${GREEN}[TEST]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Demander l'environnement
read -p "Environnement (staging/production) [staging]: " ENV
ENV=${ENV:-staging}
NAMESPACE="viridial-${ENV}"

if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
    echo "Environnement doit être 'staging' ou 'production'"
    exit 1
fi

echo "🧪 Tests de connectivité pour $NAMESPACE"
echo ""

# ============================================
# Test PostgreSQL
# ============================================
step "Test PostgreSQL"

if kubectl run postgres-test-$$ --image=postgres:14-alpine --restart=Never -n "$NAMESPACE" --rm -i -- \
   psql -h postgres -U viridial -d viridial -c "SELECT version();" &> /dev/null; then
    success "PostgreSQL accessible et fonctionnel"
else
    error "PostgreSQL non accessible"
    warning "Vérifiez: kubectl get pods -l app=postgres -n $NAMESPACE"
fi

# ============================================
# Test Redis
# ============================================
step "Test Redis"

if kubectl run redis-test-$$ --image=redis:7-alpine --restart=Never -n "$NAMESPACE" --rm -i -- \
   redis-cli -h redis ping | grep -q "PONG"; then
    success "Redis accessible et fonctionnel"
else
    error "Redis non accessible"
    warning "Vérifiez: kubectl get pods -l app=redis -n $NAMESPACE"
fi

# ============================================
# Test Meilisearch
# ============================================
step "Test Meilisearch"

if kubectl run meilisearch-test-$$ --image=curlimages/curl --restart=Never -n "$NAMESPACE" --rm -i -- \
   curl -s http://meilisearch:7700/health | grep -q "status"; then
    success "Meilisearch accessible et fonctionnel"
else
    error "Meilisearch non accessible"
    warning "Vérifiez: kubectl get pods -l app=meilisearch -n $NAMESPACE"
fi

# ============================================
# Test MinIO
# ============================================
step "Test MinIO"

if kubectl run minio-test-$$ --image=curlimages/curl --restart=Never -n "$NAMESPACE" --rm -i -- \
   curl -s http://minio:9000/minio/health/live | grep -q "OK"; then
    success "MinIO accessible et fonctionnel"
else
    error "MinIO non accessible"
    warning "Vérifiez: kubectl get pods -l app=minio -n $NAMESPACE"
fi

# ============================================
# Résumé
# ============================================
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  📊 Résumé des Tests                                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Pour plus de détails:"
echo "  kubectl get pods -n $NAMESPACE"
echo "  kubectl get svc -n $NAMESPACE"
echo "  kubectl get pvc -n $NAMESPACE"
echo ""

