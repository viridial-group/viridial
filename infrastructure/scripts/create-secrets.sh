#!/bin/bash
# Script pour créer les secrets Kubernetes depuis .env
# Usage: ./infrastructure/scripts/create-secrets.sh [namespace]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRETS_DIR="$SCRIPT_DIR/../secrets"
NAMESPACE="${1:-viridial-staging}"

if [ ! -f "$SECRETS_DIR/.env" ]; then
  echo "❌ Fichier .env non trouvé dans $SECRETS_DIR"
  echo "Copiez .env.example en .env et configurez les valeurs"
  exit 1
fi

echo "🔐 Création des secrets Kubernetes pour namespace: $NAMESPACE"
echo ""

# Vérifier que le namespace existe
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
  echo "⚠️  Namespace $NAMESPACE n'existe pas. Création..."
  kubectl create namespace "$NAMESPACE"
fi

# Créer secret SMTP
echo "📧 Création secret SMTP..."
kubectl create secret generic smtp-config \
  --from-env-file="$SECRETS_DIR/.env" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | \
  kubectl apply -f -

# Extraire seulement les variables SMTP pour un secret dédié
echo "📧 Création secret SMTP dédié..."
kubectl create secret generic smtp-config \
  --from-literal=FROM_NAME="support@viridial.com" \
  --from-literal=SMTP_HOST="smtp.hostinger.com" \
  --from-literal=SMTP_PORT="465" \
  --from-literal=SMTP_SECURE="true" \
  --from-literal=SMTP_USER="support@viridial.com" \
  --from-literal=SMTP_PASS="S@upport!19823" \
  --from-literal=EMAIL_FROM="support@viridial.com" \
  --namespace="$NAMESPACE" \
  --dry-run=client -o yaml | \
  kubectl apply -f -

echo ""
echo "✅ Secrets créés dans namespace: $NAMESPACE"
echo ""
echo "Vérification:"
kubectl get secrets -n "$NAMESPACE" | grep smtp

