#!/bin/bash

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔧 Fix Réseau - Tous les Conteneurs                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# S'assurer que le réseau existe
echo "1️⃣  Création/Vérification réseau viridial-network..."
if ! docker network ls | grep -q viridial-network; then
  docker network create viridial-network
  echo "   ✅ Réseau créé"
else
  echo "   ✅ Réseau existe déjà"
fi

# Liste des conteneurs à reconnecter
CONTAINERS=("viridial-postgres" "viridial-redis" "viridial-meilisearch" "viridial-minio" "viridial-auth-service")

echo ""
echo "2️⃣  Reconnexion des conteneurs au réseau viridial-network..."

for container in "${CONTAINERS[@]}"; do
  if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
    echo "   🔄 ${container}..."
    
    # Déconnecter de tous les réseaux (sauf celui par défaut)
    NETWORKS=$(docker inspect "${container}" --format '{{range $net, $conf := .NetworkSettings.Networks}}{{$net}} {{end}}' 2>/dev/null || echo "")
    for net in $NETWORKS; do
      if [ "$net" != "bridge" ] && [ "$net" != "host" ] && [ "$net" != "none" ]; then
        docker network disconnect "${net}" "${container}" 2>/dev/null || true
      fi
    done
    
    # Connecter au réseau viridial-network
    docker network connect viridial-network "${container}" 2>/dev/null || echo "      ⚠️  Déjà connecté ou erreur"
    echo "      ✅ Connecté"
  else
    echo "   ⚠️  ${container} n'existe pas (ignoré)"
  fi
done

echo ""
echo "3️⃣  Vérification finale..."
sleep 2

# Test DNS depuis auth-service
if docker ps --format '{{.Names}}' | grep -q viridial-auth-service; then
  echo "   Test DNS depuis auth-service..."
  if docker exec viridial-auth-service nslookup viridial-postgres 2>/dev/null | grep -q "Name:"; then
    echo "      ✅ DNS fonctionne"
  else
    echo "      ❌ DNS ne fonctionne toujours pas"
    echo "      → Solution alternative: utiliser l'IP du conteneur"
  fi
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Fix terminé                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"

