#!/bin/bash

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔍 Diagnostic Réseau Approfondi                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Lister tous les réseaux
echo "1️⃣  Réseaux Docker disponibles:"
docker network ls
echo ""

# Vérifier sur quel réseau est Postgres
echo "2️⃣  Réseau de viridial-postgres:"
docker inspect viridial-postgres --format '{{range .NetworkSettings.Networks}}{{.NetworkID}} {{end}}' 2>/dev/null || echo "   ❌ Conteneur non trouvé"
docker inspect viridial-postgres --format '{{range $net, $conf := .NetworkSettings.Networks}}{{$net}} {{end}}' 2>/dev/null || echo ""
echo ""

# Vérifier sur quel réseau est auth-service
echo "3️⃣  Réseau de viridial-auth-service:"
docker inspect viridial-auth-service --format '{{range $net, $conf := .NetworkSettings.Networks}}{{$net}} {{end}}' 2>/dev/null || echo "   ❌ Conteneur non trouvé"
echo ""

# Vérifier l'ID du réseau viridial-network
echo "4️⃣  ID du réseau viridial-network:"
NETWORK_ID=$(docker network ls --filter name=viridial-network --format '{{.ID}}' | head -1)
if [ -z "$NETWORK_ID" ]; then
  echo "   ❌ Réseau viridial-network n'existe pas"
else
  echo "   ✅ ID: $NETWORK_ID"
  
  # Lister les conteneurs sur ce réseau
  echo ""
  echo "5️⃣  Conteneurs sur viridial-network:"
  docker network inspect viridial-network --format '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null || echo "   Aucun conteneur"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Diagnostic terminé                                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"

