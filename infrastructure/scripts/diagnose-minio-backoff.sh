#!/bin/bash
# Script de diagnostic pour MinIO en BackOff

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

NAMESPACE="viridial-production"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔍 Diagnostic MinIO BackOff                                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. État du pod MinIO
echo -e "${GREEN}[1] État du pod MinIO:${NC}"
kubectl get pods -n "$NAMESPACE" -l app=minio
echo ""

# 2. Détails du pod
echo -e "${GREEN}[2] Détails du pod MinIO:${NC}"
kubectl describe pod -n "$NAMESPACE" -l app=minio | tail -30
echo ""

# 3. Logs MinIO
echo -e "${GREEN}[3] Logs MinIO (dernières 50 lignes):${NC}"
kubectl logs -n "$NAMESPACE" -l app=minio --tail=50 || echo "Impossible de récupérer les logs"
echo ""

# 4. Événements récents
echo -e "${GREEN}[4] Événements récents pour MinIO:${NC}"
kubectl get events -n "$NAMESPACE" --field-selector involvedObject.name=minio-0 --sort-by='.lastTimestamp' | tail -10
echo ""

# 5. Vérifier le PVC
echo -e "${GREEN}[5] État du PVC MinIO:${NC}"
kubectl get pvc -n "$NAMESPACE" | grep minio
echo ""

# 6. Vérifier le secret
echo -e "${GREEN}[6] Vérification du secret MinIO:${NC}"
kubectl get secret minio-secret -n "$NAMESPACE" -o jsonpath='{.data.MINIO_ROOT_USER}' | base64 -d 2>/dev/null && echo "" || echo "Secret non trouvé ou problème de décodage"
kubectl get secret minio-secret -n "$NAMESPACE" -o jsonpath='{.data.MINIO_ROOT_PASSWORD}' | base64 -d 2>/dev/null | wc -c | xargs echo "Longueur du mot de passe:" || echo "Secret non trouvé"
echo ""

# 7. Ressources du nœud
echo -e "${GREEN}[7] Ressources disponibles sur le nœud:${NC}"
kubectl describe nodes | grep -A 5 "Allocated resources:" || kubectl top nodes 2>/dev/null || echo "Metrics Server non disponible"
echo ""


echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  💡 Solutions possibles:                                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Si MinIO crash au démarrage:"
echo "   - Vérifier les logs pour l'erreur exacte"
echo "   - Vérifier que le PVC est bien monté"
echo "   - Vérifier que les secrets sont corrects"
echo ""
echo "2. Si 'Insufficient cpu' pour Meilisearch:"
echo "   - Réduire encore les ressources CPU requests"
echo "   - Vérifier les ressources totales du nœud"
echo "   - Attendre que d'autres pods libèrent des ressources"
echo ""

