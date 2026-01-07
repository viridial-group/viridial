#!/bin/bash
# Script pour installer uniquement Nginx Ingress Controller

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}[INSTALLATION]${NC} Nginx Ingress Controller"
echo ""

# Vérifier kubectl
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl non trouvé"
    exit 1
fi

# Vérifier cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cluster Kubernetes non accessible"
    exit 1
fi

# Vérifier que le node est Ready
NODE_STATUS=$(kubectl get nodes -o jsonpath='{.items[0].status.conditions[?(@.type=="Ready")].status}')
if [ "$NODE_STATUS" != "True" ]; then
    echo "⚠ Le node n'est pas Ready. Installer Calico d'abord:"
    echo "  kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/tigera-operator.yaml"
    echo "  kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/custom-resources.yaml"
    exit 1
fi

# Vérifier et retirer le taint du control plane (nécessaire pour single-node)
TAINTS=$(kubectl describe node $(kubectl get nodes -o name | head -1) | grep Taints | awk '{print $2}')
if [ "$TAINTS" != "<none>" ] && [ -n "$TAINTS" ]; then
    echo "⚠ Control plane a des taints. Retrait pour permettre pods (single-node)..."
    kubectl taint nodes --all node-role.kubernetes.io/control-plane- --overwrite || true
    kubectl taint nodes --all node-role.kubernetes.io/master- --overwrite || true
    echo "✓ Taints retirés"
fi

# Créer namespace si nécessaire
if ! kubectl get namespace ingress-nginx &> /dev/null; then
    echo "Création du namespace ingress-nginx..."
    kubectl create namespace ingress-nginx
else
    echo "✓ Namespace ingress-nginx existe déjà"
fi

# Vérifier si déjà installé et fonctionnel
INGRESS_PODS=$(kubectl get pods -n ingress-nginx --no-headers 2>/dev/null | grep -v "admission-create" | grep -c Running || echo "0")
if [ "$INGRESS_PODS" -gt 0 ]; then
    echo "✓ Nginx Ingress Controller déjà installé et fonctionnel"
    kubectl get pods -n ingress-nginx
    kubectl get svc -n ingress-nginx
    exit 0
fi

# Nettoyer les pods Pending ou en erreur avant réinstallation
PENDING_PODS=$(kubectl get pods -n ingress-nginx --no-headers 2>/dev/null | grep -E "Pending|Error|CrashLoopBackOff" | awk '{print $1}' || true)
if [ -n "$PENDING_PODS" ]; then
    echo "Nettoyage des pods en erreur/Pending..."
    echo "$PENDING_PODS" | xargs -r kubectl delete pod -n ingress-nginx --force --grace-period=0 2>/dev/null || true
    sleep 5
fi

# Installer Nginx Ingress Controller
echo "Installation de Nginx Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml

echo "⏳ Attente de l'Ingress Controller (peut prendre 1-2 minutes)..."
sleep 30

# Attendre que les pods soient prêts
kubectl wait --namespace=ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s || {
    echo "⚠ Timeout lors de l'attente des pods"
    echo "Vérification de l'état:"
    kubectl get pods -n ingress-nginx
    kubectl describe pods -n ingress-nginx | tail -20
    exit 1
}

echo ""
echo "✅ Nginx Ingress Controller installé!"
echo ""
echo "Pods:"
kubectl get pods -n ingress-nginx
echo ""
echo "Services:"
kubectl get svc -n ingress-nginx
echo ""
echo "Pour exposer l'Ingress Controller en NodePort (pour test):"
echo "  kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{\"spec\":{\"type\":\"NodePort\"}}'"

