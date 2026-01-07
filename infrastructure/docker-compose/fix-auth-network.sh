#!/bin/bash

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔧 Fix Réseau auth-service → Postgres                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Arrêter auth-service
echo "1️⃣  Arrêt de auth-service..."
docker compose -f app-auth.yml down

# Vérifier que le réseau existe
echo ""
echo "2️⃣  Vérification réseau viridial-network..."
if ! docker network ls | grep -q viridial-network; then
  echo "   ⚠️  Réseau n'existe pas, création..."
  docker network create viridial-network
else
  echo "   ✅ Réseau existe"
fi

# Vérifier que Postgres est bien sur le réseau
echo ""
echo "3️⃣  Vérification que Postgres est sur le réseau..."
if docker inspect viridial-postgres | grep -q viridial-network; then
  echo "   ✅ Postgres est sur viridial-network"
else
  echo "   ⚠️  Postgres n'est pas sur viridial-network, reconnexion..."
  docker network connect viridial-network viridial-postgres || true
fi

# Redémarrer auth-service
echo ""
echo "4️⃣  Redémarrage de auth-service..."
docker compose -f app-auth.yml up -d --build

# Attendre un peu pour que le conteneur démarre
echo ""
echo "5️⃣  Attente du démarrage (5 secondes)..."
sleep 5

# Test de résolution DNS
echo ""
echo "6️⃣  Test résolution DNS..."
if docker exec viridial-auth-service nslookup viridial-postgres 2>/dev/null | grep -q "Name:"; then
  echo "   ✅ DNS résout viridial-postgres"
else
  echo "   ❌ DNS ne résout toujours pas viridial-postgres"
  echo "   → Vérifie les logs: docker logs viridial-auth-service"
fi

# Afficher les logs
echo ""
echo "7️⃣  Logs auth-service (dernières 10 lignes)..."
docker logs --tail 10 viridial-auth-service

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Fix terminé                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"

