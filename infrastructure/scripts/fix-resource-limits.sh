#!/bin/bash
# Script pour corriger les limites de ressources et redéployer les services
# Résout le problème "Insufficient CPU" sur VPS avec ressources limitées

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

step() {
    echo -e "${BLUE}[ÉTAPE]${NC} $1"
    echo ""
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

echo "🔧 Correction des limites de ressources pour VPS"
echo ""

# Environnement fixé à production uniquement
ENV="production"
NAMESPACE="viridial-production"

echo "Correction pour le namespace: ${NAMESPACE}"
echo ""

# ============================================
# Vérifier les ressources actuelles du cluster
# ============================================
step "Vérification des ressources disponibles"

if command -v kubectl &> /dev/null; then
    NODE_CPU=$(kubectl top nodes 2>/dev/null | tail -n +2 | awk '{print $2}' | head -1 || echo "N/A")
    NODE_MEM=$(kubectl top nodes 2>/dev/null | tail -n +2 | awk '{print $4}' | head -1 || echo "N/A")
    
    if [ "$NODE_CPU" != "N/A" ]; then
        echo "CPU utilisé: $NODE_CPU"
        echo "Mémoire utilisée: $NODE_MEM"
    else
        warning "Metrics Server non disponible. Impossible de vérifier les ressources."
    fi
else
    error "kubectl non trouvé"
    exit 1
fi

# ============================================
# Appliquer les manifests mis à jour
# ============================================
step "Application des manifests avec ressources réduites"

echo "Les manifests ont été mis à jour avec des ressources adaptées au VPS:"
echo ""
echo "PostgreSQL:"
echo "  - CPU: 200m request, 1000m limit"
echo "  - Memory: 512Mi request, 1Gi limit"
echo ""
echo "Redis:"
echo "  - CPU: 200m request, 1000m limit"
echo "  - Memory: 512Mi request, 1Gi limit"
echo ""
echo "Meilisearch:"
echo "  - CPU: 100m request, 500m limit (réduit)"
echo "  - Memory: 256Mi request, 512Mi limit (réduit)"
echo ""
echo "MinIO:"
echo "  - CPU: 200m request, 1000m limit"
echo "  - Memory: 512Mi request, 1Gi limit"
echo "  - Commande: corrigée (args au lieu de command shell)"
echo ""

# Appliquer les StatefulSets et Deployments mis à jour
echo "Application des manifests mis à jour..."
kubectl apply -f infrastructure/kubernetes/manifests/services/postgres/postgres-statefulset.yaml -n "$NAMESPACE" || error "Échec application postgres-statefulset.yaml"
kubectl apply -f infrastructure/kubernetes/manifests/services/meilisearch/meilisearch-deployment.yaml -n "$NAMESPACE" || error "Échec application meilisearch-deployment.yaml"
kubectl apply -f infrastructure/kubernetes/manifests/services/minio/minio-statefulset.yaml -n "$NAMESPACE" || error "Échec application minio-statefulset.yaml"
kubectl apply -f infrastructure/kubernetes/manifests/services/redis/redis-deployment.yaml -n "$NAMESPACE" || error "Échec application redis-deployment.yaml"

success "Manifests appliqués"

# ============================================
# Attendre que les pods soient planifiés
# ============================================
step "Attente de la planification des pods"

echo "⏳ Attente que les pods soient planifiés (peut prendre quelques secondes)..."
sleep 10

# Vérifier l'état des pods
PENDING_COUNT=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Pending --no-headers 2>/dev/null | wc -l)
RUNNING_COUNT=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l)

echo ""
echo "Pods en Pending: $PENDING_COUNT"
echo "Pods en Running: $RUNNING_COUNT"
echo ""

if [ "$PENDING_COUNT" -gt 0 ]; then
    warning "Certains pods sont encore en Pending"
    echo ""
    echo "Vérification des événements récents:"
    kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' | tail -5
    echo ""
    
    # Vérifier si c'est toujours un problème de CPU
    CPU_ERROR=$(kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' | grep -i "insufficient cpu" | tail -1 || true)
    if [ -n "$CPU_ERROR" ]; then
        error "Problème de CPU toujours présent"
        warning "Le VPS n'a peut-être pas assez de CPU disponible"
        echo ""
        echo "Solutions possibles:"
        echo "  1. Vérifier les ressources du VPS: kubectl describe nodes"
        echo "  2. Arrêter d'autres pods qui consomment du CPU"
        echo "  3. Augmenter les ressources du VPS"
        echo "  4. Réduire encore plus les ressources (non recommandé)"
    fi
else
    success "Tous les pods sont planifiés"
fi

# ============================================
# Afficher l'état final
# ============================================
step "État final des pods"

kubectl get pods -n "$NAMESPACE"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Correction des ressources appliquée                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Si des pods sont encore en Pending, vérifiez:"
echo "  kubectl describe pod <pod-name> -n $NAMESPACE"
echo "  kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10"
echo ""

