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
# Vérifier que les pods existent
# ============================================
step "Vérification des pods"

POSTGRES_PODS=$(kubectl get pods -l app=postgres -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)
REDIS_PODS=$(kubectl get pods -l app=redis -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)
MEILI_PODS=$(kubectl get pods -l app=meilisearch -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)
MINIO_PODS=$(kubectl get pods -l app=minio -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)

if [ "$POSTGRES_PODS" -eq 0 ]; then
    error "Aucun pod PostgreSQL trouvé. Les services ne sont peut-être pas déployés."
    warning "Exécutez: ./infrastructure/scripts/deploy-base-services.sh"
    exit 1
fi

echo "Pods trouvés: PostgreSQL=$POSTGRES_PODS, Redis=$REDIS_PODS, Meilisearch=$MEILI_PODS, MinIO=$MINIO_PODS"
echo ""

# ============================================
# Test PostgreSQL
# ============================================
step "Test PostgreSQL"

# Vérifier que le pod est Running
POSTGRES_STATUS=$(kubectl get pods -l app=postgres -n "$NAMESPACE" -o jsonpath='{.items[0].status.phase}' 2>/dev/null)
if [ "$POSTGRES_STATUS" != "Running" ]; then
    error "PostgreSQL pod n'est pas Running (status: $POSTGRES_STATUS)"
    warning "Vérifiez: kubectl describe pod -l app=postgres -n $NAMESPACE"
else
    # Récupérer le mot de passe depuis le secret
    POSTGRES_PASSWORD=$(kubectl get secret postgres-secret -n "$NAMESPACE" -o jsonpath='{.data.POSTGRES_PASSWORD}' 2>/dev/null | base64 -d)
    if [ -z "$POSTGRES_PASSWORD" ]; then
        warning "Secret postgres-secret non trouvé. Test ignoré."
    else
        if kubectl run postgres-test-$$ --image=postgres:14-alpine --restart=Never -n "$NAMESPACE" --rm -i --env="PGPASSWORD=$POSTGRES_PASSWORD" -- \
           psql -h postgres -U viridial -d viridial -c "SELECT version();" &> /dev/null; then
            success "PostgreSQL accessible et fonctionnel"
        else
            error "PostgreSQL non accessible"
            warning "Vérifiez: kubectl logs -l app=postgres -n $NAMESPACE"
        fi
    fi
fi

# ============================================
# Test Redis
# ============================================
step "Test Redis"

REDIS_STATUS=$(kubectl get pods -l app=redis -n "$NAMESPACE" -o jsonpath='{.items[0].status.phase}' 2>/dev/null)
if [ "$REDIS_STATUS" != "Running" ]; then
    error "Redis pod n'est pas Running (status: $REDIS_STATUS)"
    warning "Vérifiez: kubectl describe pod -l app=redis -n $NAMESPACE"
else
    if kubectl run redis-test-$$ --image=redis:7-alpine --restart=Never -n "$NAMESPACE" --rm -i -- \
       redis-cli -h redis ping 2>/dev/null | grep -q "PONG"; then
        success "Redis accessible et fonctionnel"
    else
        error "Redis non accessible"
        warning "Vérifiez: kubectl logs -l app=redis -n $NAMESPACE"
    fi
fi

# ============================================
# Test Meilisearch
# ============================================
step "Test Meilisearch"

MEILI_STATUS=$(kubectl get pods -l app=meilisearch -n "$NAMESPACE" -o jsonpath='{.items[0].status.phase}' 2>/dev/null)
if [ "$MEILI_STATUS" != "Running" ]; then
    error "Meilisearch pod n'est pas Running (status: $MEILI_STATUS)"
    warning "Vérifiez: kubectl describe pod -l app=meilisearch -n $NAMESPACE"
else
    if kubectl run meilisearch-test-$$ --image=curlimages/curl --restart=Never -n "$NAMESPACE" --rm -i -- \
       curl -s http://meilisearch:7700/health 2>/dev/null | grep -q "status"; then
        success "Meilisearch accessible et fonctionnel"
    else
        error "Meilisearch non accessible"
        warning "Vérifiez: kubectl logs -l app=meilisearch -n $NAMESPACE"
    fi
fi

# ============================================
# Test MinIO
# ============================================
step "Test MinIO"

MINIO_STATUS=$(kubectl get pods -l app=minio -n "$NAMESPACE" -o jsonpath='{.items[0].status.phase}' 2>/dev/null)
if [ "$MINIO_STATUS" != "Running" ]; then
    error "MinIO pod n'est pas Running (status: $MINIO_STATUS)"
    warning "Vérifiez: kubectl describe pod -l app=minio -n $NAMESPACE"
else
    if kubectl run minio-test-$$ --image=curlimages/curl --restart=Never -n "$NAMESPACE" --rm -i -- \
       curl -s http://minio:9000/minio/health/live 2>/dev/null | grep -q "OK"; then
        success "MinIO accessible et fonctionnel"
    else
        error "MinIO non accessible"
        warning "Vérifiez: kubectl logs -l app=minio -n $NAMESPACE"
    fi
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

