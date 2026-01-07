#!/bin/bash
# Script de diagnostic des services de base
# Aide à identifier les problèmes de déploiement

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

step() {
    echo -e "${BLUE}[DIAGNOSTIC]${NC} $1"
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

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Demander l'environnement
read -p "Environnement (staging/production) [staging]: " ENV
ENV=${ENV:-staging}
NAMESPACE="viridial-${ENV}"

if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
    echo "Environnement doit être 'staging' ou 'production'"
    exit 1
fi

echo "🔍 Diagnostic des services dans $NAMESPACE"
echo ""

# ============================================
# 1. Vérifier le namespace
# ============================================
step "1. Vérification du namespace"

if kubectl get namespace "$NAMESPACE" &> /dev/null; then
    success "Namespace $NAMESPACE existe"
else
    error "Namespace $NAMESPACE n'existe pas"
    info "Créer avec: kubectl create namespace $NAMESPACE"
    exit 1
fi

# ============================================
# 2. Vérifier les StatefulSets et Deployments
# ============================================
step "2. Vérification des StatefulSets et Deployments"

STATEFULSETS=$(kubectl get statefulset -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)
DEPLOYMENTS=$(kubectl get deployment -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)

if [ "$STATEFULSETS" -eq 0 ] && [ "$DEPLOYMENTS" -eq 0 ]; then
    error "Aucun StatefulSet ou Deployment trouvé"
    warning "Les services ne sont pas déployés. Exécutez: ./infrastructure/scripts/deploy-base-services.sh"
    exit 1
else
    success "StatefulSets: $STATEFULSETS, Deployments: $DEPLOYMENTS"
    echo ""
    kubectl get statefulset,deployment -n "$NAMESPACE"
fi

# ============================================
# 3. Vérifier les pods
# ============================================
step "3. État des pods"

PODS=$(kubectl get pods -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)
if [ "$PODS" -eq 0 ]; then
    error "Aucun pod trouvé"
    warning "Les pods ne sont pas créés. Vérifiez les StatefulSets/Deployments"
else
    success "$PODS pod(s) trouvé(s)"
    echo ""
    kubectl get pods -n "$NAMESPACE"
    echo ""
    
    # Vérifier les pods en erreur
    PENDING=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Pending --no-headers 2>/dev/null | wc -l)
    FAILED=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Failed --no-headers 2>/dev/null | wc -l)
    CRASHLOOP=$(kubectl get pods -n "$NAMESPACE" --no-headers 2>/dev/null | grep -c CrashLoopBackOff || true)
    
    if [ "$PENDING" -gt 0 ]; then
        warning "$PENDING pod(s) en Pending"
        info "Vérifiez les PVC et StorageClass"
    fi
    
    if [ "$FAILED" -gt 0 ]; then
        error "$FAILED pod(s) en Failed"
        info "Vérifiez les logs: kubectl logs <pod-name> -n $NAMESPACE"
    fi
    
    if [ "$CRASHLOOP" -gt 0 ]; then
        error "$CRASHLOOP pod(s) en CrashLoopBackOff"
        info "Vérifiez les logs et la configuration"
    fi
fi

# ============================================
# 4. Vérifier les PVC
# ============================================
step "4. Vérification des PersistentVolumeClaims"

PVC_COUNT=$(kubectl get pvc -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)
if [ "$PVC_COUNT" -eq 0 ]; then
    warning "Aucun PVC trouvé"
    info "Les PVC seront créés automatiquement par les StatefulSets"
else
    success "$PVC_COUNT PVC trouvé(s)"
    echo ""
    kubectl get pvc -n "$NAMESPACE"
    echo ""
    
    # Vérifier les PVC en Pending
    PENDING_PVC=$(kubectl get pvc -n "$NAMESPACE" --no-headers 2>/dev/null | grep -c Pending || true)
    if [ "$PENDING_PVC" -gt 0 ]; then
        error "$PENDING_PVC PVC en Pending"
        warning "Vérifiez que le StorageClass 'local-path' existe: kubectl get storageclass"
    fi
fi

# ============================================
# 5. Vérifier les Services
# ============================================
step "5. Vérification des Services"

SVC_COUNT=$(kubectl get svc -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)
if [ "$SVC_COUNT" -eq 0 ]; then
    warning "Aucun service trouvé"
else
    success "$SVC_COUNT service(s) trouvé(s)"
    echo ""
    kubectl get svc -n "$NAMESPACE"
fi

# ============================================
# 6. Vérifier les Secrets
# ============================================
step "6. Vérification des Secrets"

REQUIRED_SECRETS=("postgres-secret" "meilisearch-secret" "minio-secret")
MISSING_SECRETS=()

for secret in "${REQUIRED_SECRETS[@]}"; do
    if ! kubectl get secret "$secret" -n "$NAMESPACE" &> /dev/null; then
        MISSING_SECRETS+=("$secret")
    fi
done

if [ ${#MISSING_SECRETS[@]} -eq 0 ]; then
    success "Tous les secrets requis sont présents"
else
    error "Secrets manquants: ${MISSING_SECRETS[*]}"
    warning "Exécutez: ./infrastructure/scripts/deploy-base-services.sh pour les créer"
fi

# ============================================
# 7. Vérifier les événements récents
# ============================================
step "7. Événements récents (dernières 10 minutes)"

RECENT_EVENTS=$(kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' 2>/dev/null | tail -10)
if [ -n "$RECENT_EVENTS" ]; then
    echo "$RECENT_EVENTS"
    echo ""
    ERROR_EVENTS=$(echo "$RECENT_EVENTS" | grep -i "error\|failed" || true)
    if [ -n "$ERROR_EVENTS" ]; then
        warning "Événements d'erreur détectés ci-dessus"
    fi
else
    info "Aucun événement récent"
fi

# ============================================
# 8. Vérifier StorageClass
# ============================================
step "8. Vérification du StorageClass"

if kubectl get storageclass local-path &> /dev/null; then
    success "StorageClass 'local-path' existe"
else
    error "StorageClass 'local-path' n'existe pas"
    warning "Installer local-path-provisioner ou utiliser un autre StorageClass"
    info "Vérifier: kubectl get storageclass"
fi

# ============================================
# Résumé et recommandations
# ============================================
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  📊 Résumé du Diagnostic                                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Détails des pods par service
echo "📦 État détaillé des services:"
echo ""

for service in postgres redis meilisearch minio; do
    POD_STATUS=$(kubectl get pods -l app="$service" -n "$NAMESPACE" -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "N/A")
    if [ "$POD_STATUS" = "Running" ]; then
        success "$service: $POD_STATUS"
    elif [ "$POD_STATUS" = "N/A" ]; then
        error "$service: Pod non trouvé"
    else
        warning "$service: $POD_STATUS"
    fi
done

echo ""
echo "💡 Commandes utiles:"
echo ""
echo "  # Voir les logs d'un pod"
echo "  kubectl logs -l app=<service> -n $NAMESPACE --tail=50"
echo ""
echo "  # Décrire un pod pour voir les événements"
echo "  kubectl describe pod -l app=<service> -n $NAMESPACE"
echo ""
echo "  # Redémarrer un deployment"
echo "  kubectl rollout restart deployment/<service> -n $NAMESPACE"
echo ""
echo "  # Redémarrer un statefulset"
echo "  kubectl rollout restart statefulset/<service> -n $NAMESPACE"
echo ""

