#!/bin/bash
# Script pour vérifier les ressources disponibles sur le nœud

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  📊 Vérification des Ressources du Nœud                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. Capacité totale du nœud
echo -e "${GREEN}[1] Capacité totale du nœud:${NC}"
kubectl describe nodes | grep -A 10 "Capacity:" | head -5
echo ""

# 2. Ressources allouées
echo -e "${GREEN}[2] Ressources allouées:${NC}"
kubectl describe nodes | grep -A 10 "Allocated resources:" | head -8
echo ""

# 3. Utilisation actuelle (si Metrics Server disponible)
echo -e "${GREEN}[3] Utilisation actuelle (Metrics Server):${NC}"
if kubectl top nodes 2>/dev/null; then
    echo ""
    echo -e "${GREEN}[4] Utilisation par pod:${NC}"
    kubectl top pods -A --sort-by=cpu 2>/dev/null | head -10 || echo "Metrics Server non disponible"
else
    echo "Metrics Server non disponible"
fi
echo ""

# 4. Pods en Pending avec raisons
echo -e "${GREEN}[5] Pods en Pending et leurs raisons:${NC}"
kubectl get pods -A --field-selector=status.phase=Pending -o wide
echo ""
kubectl get events -A --field-selector reason=FailedScheduling --sort-by='.lastTimestamp' | tail -5
echo ""

# 5. Total des requests CPU demandées
echo -e "${GREEN}[6] Total des CPU requests demandées par namespace:${NC}"
for ns in $(kubectl get namespaces -o name | cut -d/ -f2); do
    echo "Namespace: $ns"
    kubectl get pods -n "$ns" -o json 2>/dev/null | \
        jq -r '.items[] | select(.spec.containers[0].resources.requests.cpu) | .spec.containers[0].resources.requests.cpu' 2>/dev/null | \
        awk '{sum+=$1} END {print "Total CPU requests: " sum "m"}' || echo "jq non disponible ou pas de pods"
done
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  💡 Recommandations:                                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Si 'Insufficient cpu' persiste:"
echo "  1. Vérifier que le VPS a au moins 1 CPU (1000m)"
echo "  2. Réduire encore les CPU requests si nécessaire"
echo "  3. Supprimer les pods inutiles ou en erreur"
echo "  4. Redémarrer les pods pour libérer des ressources"
echo ""

