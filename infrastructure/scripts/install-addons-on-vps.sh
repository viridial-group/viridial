#!/bin/bash
# Script d'installation des addons Kubernetes - À exécuter sur VPS après install-on-vps.sh

set -e

K8S_VERSION="1.29"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

step() {
    echo -e "${GREEN}[ÉTAPE]${NC} $1"
    echo ""
}

# Vérifier kubectl
if ! command -v kubectl &> /dev/null; then
    echo "kubectl non trouvé. Exécutez d'abord install-on-vps.sh"
    exit 1
fi

# Vérifier cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "Cluster Kubernetes non accessible. Vérifiez l'installation."
    exit 1
fi

# ============================================
# Installer CoreDNS (si pas déjà installé)
# ============================================
step "Vérification CoreDNS"

if kubectl get pods -n kube-system | grep -q coredns; then
    echo "✓ CoreDNS déjà installé"
else
    echo "CoreDNS devrait être installé automatiquement avec kubeadm"
    kubectl get pods -n kube-system | grep coredns || echo "⚠ CoreDNS non trouvé"
fi

# ============================================
# Installer Metrics Server
# ============================================
step "Installation Metrics Server"

if kubectl get pods -n kube-system | grep -q metrics-server; then
    echo "✓ Metrics Server déjà installé"
else
    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
    
    # Patch pour permettre self-signed certificates (développement)
    kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
    
    echo "⏳ Attente de Metrics Server..."
    kubectl wait --for=condition=ready pod -l k8s-app=metrics-server -n kube-system --timeout=120s
    
    echo "✓ Metrics Server installé"
fi

# ============================================
# Créer Namespaces
# ============================================
step "Création des namespaces"

kubectl create namespace viridial-staging --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace viridial-production --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

echo "✓ Namespaces créés:"
kubectl get namespaces | grep viridial

# ============================================
# Installer Nginx Ingress Controller
# ============================================
step "Installation Nginx Ingress Controller"

if kubectl get pods -n ingress-nginx &> /dev/null; then
    echo "✓ Nginx Ingress déjà installé"
else
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml
    
    echo "⏳ Attente de Nginx Ingress (60 secondes)..."
    sleep 60
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=controller -n ingress-nginx --timeout=300s
    
    echo "✓ Nginx Ingress installé"
fi

# ============================================
# Installer Cert-manager
# ============================================
step "Installation Cert-manager"

if kubectl get pods -n cert-manager &> /dev/null; then
    echo "✓ Cert-manager déjà installé"
else
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml
    
    echo "⏳ Attente de Cert-manager (60 secondes)..."
    sleep 60
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s
    
    echo "✓ Cert-manager installé"
fi

# ============================================
# Configurer ClusterIssuer Let's Encrypt
# ============================================
step "Configuration ClusterIssuer Let's Encrypt"

read -p "Email pour Let's Encrypt (optionnel, appuyez sur Entrée pour ignorer): " EMAIL

if [ -n "$EMAIL" ]; then
    cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ${EMAIL}
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
    echo "✓ ClusterIssuer Let's Encrypt configuré"
else
    echo "⚠ ClusterIssuer non configuré (peut être fait plus tard)"
fi

# ============================================
# Vérification finale
# ============================================
step "Vérification finale"

echo "Nodes:"
kubectl get nodes

echo ""
echo "Pods système:"
kubectl get pods -n kube-system

echo ""
echo "Ingress Controller:"
kubectl get pods -n ingress-nginx

echo ""
echo "Cert-manager:"
kubectl get pods -n cert-manager

echo ""
echo "Namespaces:"
kubectl get namespaces | grep -E "viridial|monitoring"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Addons Kubernetes installés!                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo ""
echo "1. Créer les secrets Kubernetes:"
echo "   cd /root/viridial/infrastructure/secrets"
echo "   ./create-secrets.sh viridial-staging"
echo ""
echo "2. Déployer les services de base (US-INFRA-02):"
echo "   - PostgreSQL"
echo "   - Redis"
echo "   - Meilisearch"
echo "   - MinIO"
echo ""

