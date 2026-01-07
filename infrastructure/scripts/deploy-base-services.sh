#!/bin/bash
# Script de déploiement des services de base (US-INFRA-02)
# À exécuter depuis le VPS ou localement avec kubectl configuré

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

step() {
    echo -e "${GREEN}[ÉTAPE]${NC} $1"
    echo ""
}

warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

error() {
    echo -e "${RED}[ERREUR]${NC} $1"
    exit 1
}

# Vérifier kubectl
if ! command -v kubectl &> /dev/null; then
    error "kubectl non trouvé. Assurez-vous que Kubernetes est installé."
fi

# Vérifier cluster
if ! kubectl cluster-info &> /dev/null; then
    error "Cluster Kubernetes non accessible."
fi

# Environnement fixé à production uniquement
ENV="production"
NAMESPACE="viridial-production"

# Vérifier namespace
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    error "Namespace $NAMESPACE n'existe pas. Créez-le d'abord."
fi

echo "🚀 Déploiement des services de base dans $NAMESPACE"
echo ""

# ============================================
# Générer les secrets
# ============================================
step "Génération des secrets"

# PostgreSQL
read -sp "Mot de passe PostgreSQL (appuyez sur Entrée pour générer automatiquement): " POSTGRES_PASSWORD
echo ""
if [ -z "$POSTGRES_PASSWORD" ]; then
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    echo "Mot de passe PostgreSQL généré: $POSTGRES_PASSWORD"
fi

# Meilisearch
read -sp "Clé maître Meilisearch (appuyez sur Entrée pour générer automatiquement): " MEILI_MASTER_KEY
echo ""
if [ -z "$MEILI_MASTER_KEY" ]; then
    MEILI_MASTER_KEY=$(openssl rand -hex 32)
    echo "Clé maître Meilisearch générée: $MEILI_MASTER_KEY"
fi

# MinIO
read -sp "Mot de passe MinIO (appuyez sur Entrée pour générer automatiquement): " MINIO_PASSWORD
echo ""
if [ -z "$MINIO_PASSWORD" ]; then
    MINIO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    echo "Mot de passe MinIO généré: $MINIO_PASSWORD"
fi

# Créer les secrets
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_USER=viridial \
  --from-literal=POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  --from-literal=POSTGRES_DB=viridial \
  -n "$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic meilisearch-secret \
  --from-literal=MEILI_MASTER_KEY="$MEILI_MASTER_KEY" \
  -n "$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic minio-secret \
  --from-literal=MINIO_ROOT_USER=minioadmin \
  --from-literal=MINIO_ROOT_PASSWORD="$MINIO_PASSWORD" \
  -n "$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✓ Secrets créés"

# ============================================
# Déployer PostgreSQL
# ============================================
step "Déploiement PostgreSQL"

# Appliquer les manifests pour production uniquement
kubectl apply -f infrastructure/kubernetes/manifests/services/postgres/postgres-secret.yaml
kubectl apply -f infrastructure/kubernetes/manifests/services/postgres/postgres-configmap.yaml
kubectl apply -f infrastructure/kubernetes/manifests/services/postgres/postgres-pvc.yaml
kubectl apply -f infrastructure/kubernetes/manifests/services/postgres/postgres-statefulset.yaml
kubectl apply -f infrastructure/kubernetes/manifests/services/postgres/postgres-service.yaml

echo "⏳ Attente que PostgreSQL soit prêt..."
kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout=300s || {
    warning "PostgreSQL n'est pas encore prêt. Vérifiez les logs:"
    kubectl logs -l app=postgres -n "$NAMESPACE" --tail=50
}
echo "✓ PostgreSQL déployé"

# ============================================
# Déployer Redis
# ============================================
step "Déploiement Redis"

kubectl apply -f infrastructure/kubernetes/manifests/services/redis/redis-configmap.yaml
kubectl apply -f infrastructure/kubernetes/manifests/services/redis/redis-deployment.yaml
kubectl apply -f infrastructure/kubernetes/manifests/services/redis/redis-service.yaml

echo "⏳ Attente que Redis soit prêt..."
kubectl wait --for=condition=ready pod -l app=redis -n "$NAMESPACE" --timeout=120s || {
    warning "Redis n'est pas encore prêt. Vérifiez les logs:"
    kubectl logs -l app=redis -n "$NAMESPACE" --tail=50
}
echo "✓ Redis déployé"

# ============================================
# Déployer Meilisearch
# ============================================
step "Déploiement Meilisearch"

kubectl apply -f infrastructure/kubernetes/manifests/services/meilisearch/meilisearch-secret.yaml
kubectl apply -f infrastructure/kubernetes/manifests/services/meilisearch/meilisearch-pvc.yaml
kubectl apply -f infrastructure/kubernetes/manifests/services/meilisearch/meilisearch-deployment.yaml
kubectl apply -f infrastructure/kubernetes/manifests/services/meilisearch/meilisearch-service.yaml

echo "⏳ Attente que Meilisearch soit prêt..."
kubectl wait --for=condition=ready pod -l app=meilisearch -n "$NAMESPACE" --timeout=120s || {
    warning "Meilisearch n'est pas encore prêt. Vérifiez les logs:"
    kubectl logs -l app=meilisearch -n "$NAMESPACE" --tail=50
}
echo "✓ Meilisearch déployé"

# ============================================
# Déployer MinIO
# ============================================
step "Déploiement MinIO"

kubectl apply -f infrastructure/kubernetes/manifests/services/minio/minio-secret.yaml
kubectl apply -f infrastructure/kubernetes/manifests/services/minio/minio-pvc.yaml
kubectl apply -f infrastructure/kubernetes/manifests/services/minio/minio-statefulset.yaml
kubectl apply -f infrastructure/kubernetes/manifests/services/minio/minio-service.yaml

echo "⏳ Attente que MinIO soit prêt..."
kubectl wait --for=condition=ready pod -l app=minio -n "$NAMESPACE" --timeout=120s || {
    warning "MinIO n'est pas encore prêt. Vérifiez les logs:"
    kubectl logs -l app=minio -n "$NAMESPACE" --tail=50
}
echo "✓ MinIO déployé"

# ============================================
# Initialiser les buckets MinIO
# ============================================
step "Initialisation des buckets MinIO"

kubectl apply -f infrastructure/kubernetes/manifests/services/minio/minio-init-job.yaml

echo "⏳ Attente de l'initialisation des buckets..."
kubectl wait --for=condition=complete job/minio-init-buckets -n "$NAMESPACE" --timeout=120s || true
echo "✓ Buckets MinIO initialisés"

# ============================================
# Vérification finale
# ============================================
step "Vérification finale"

echo "Pods dans $NAMESPACE:"
kubectl get pods -n "$NAMESPACE"

echo ""
echo "Services dans $NAMESPACE:"
kubectl get svc -n "$NAMESPACE"

echo ""
echo "PersistentVolumeClaims dans $NAMESPACE:"
kubectl get pvc -n "$NAMESPACE"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Services de base déployés!                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 ENDPOINTS:"
echo ""
echo "PostgreSQL:"
echo "  Host: postgres.$NAMESPACE.svc.cluster.local"
echo "  Port: 5432"
echo "  Database: viridial"
echo "  User: viridial"
echo "  Password: (voir secret postgres-secret)"
echo ""
echo "Redis:"
echo "  Host: redis.$NAMESPACE.svc.cluster.local"
echo "  Port: 6379"
echo ""
echo "Meilisearch:"
echo "  URL: http://meilisearch.$NAMESPACE.svc.cluster.local:7700"
echo "  Master Key: (voir secret meilisearch-secret)"
echo ""
echo "MinIO:"
echo "  API: http://minio.$NAMESPACE.svc.cluster.local:9000"
echo "  Console: http://minio.$NAMESPACE.svc.cluster.local:9001"
echo "  Root User: minioadmin"
echo "  Root Password: (voir secret minio-secret)"
echo ""
echo "💡 Pour exposer MinIO Console via Ingress, voir documentation."
echo ""

