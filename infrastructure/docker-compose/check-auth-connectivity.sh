#!/bin/bash

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔍 Diagnostic Connectivité auth-service → Postgres        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier que Postgres est démarré
echo "1️⃣  Vérification conteneur Postgres..."
if docker ps | grep -q viridial-postgres; then
  echo "   ✅ viridial-postgres est démarré"
else
  echo "   ❌ viridial-postgres n'est PAS démarré"
  echo "   → Lance: cd /opt/viridial/infrastructure/docker-compose && docker compose up -d postgres"
  exit 1
fi

# Vérifier que auth-service est démarré
echo ""
echo "2️⃣  Vérification conteneur auth-service..."
if docker ps | grep -q viridial-auth-service; then
  echo "   ✅ viridial-auth-service est démarré"
else
  echo "   ⚠️  viridial-auth-service n'est pas démarré (normal si pas encore lancé)"
fi

# Vérifier le réseau
echo ""
echo "3️⃣  Vérification réseau Docker..."
if docker network ls | grep -q viridial-network; then
  echo "   ✅ Réseau viridial-network existe"
else
  echo "   ❌ Réseau viridial-network n'existe pas"
  echo "   → Crée-le: docker network create viridial-network"
  exit 1
fi

# Vérifier que Postgres est sur le réseau
echo ""
echo "4️⃣  Vérification que Postgres est sur viridial-network..."
if docker inspect viridial-postgres | grep -q viridial-network; then
  echo "   ✅ viridial-postgres est sur viridial-network"
else
  echo "   ❌ viridial-postgres n'est PAS sur viridial-network"
  echo "   → Redémarre Postgres: docker compose restart postgres"
fi

# Test de résolution DNS depuis auth-service
echo ""
echo "5️⃣  Test résolution DNS depuis auth-service..."
if docker ps | grep -q viridial-auth-service; then
  if docker exec viridial-auth-service nslookup viridial-postgres 2>/dev/null | grep -q "Name:"; then
    echo "   ✅ DNS résout viridial-postgres"
  else
    echo "   ❌ DNS ne résout PAS viridial-postgres"
    echo "   → Vérifie que les deux conteneurs sont sur le même réseau"
  fi
else
  echo "   ⚠️  auth-service n'est pas démarré, test DNS ignoré"
fi

# Test de connexion Postgres depuis auth-service
echo ""
echo "6️⃣  Test connexion Postgres depuis auth-service..."
if docker ps | grep -q viridial-auth-service; then
  if docker exec viridial-auth-service sh -c "nc -zv viridial-postgres 5432" 2>&1 | grep -q "succeeded"; then
    echo "   ✅ Connexion TCP vers viridial-postgres:5432 réussie"
  else
    echo "   ❌ Connexion TCP vers viridial-postgres:5432 échouée"
    echo "   → Vérifie les logs: docker logs viridial-auth-service"
  fi
else
  echo "   ⚠️  auth-service n'est pas démarré, test connexion ignoré"
fi

# Afficher les logs récents de auth-service
echo ""
echo "7️⃣  Logs récents auth-service (dernières 20 lignes)..."
if docker ps | grep -q viridial-auth-service; then
  docker logs --tail 20 viridial-auth-service
else
  echo "   ⚠️  auth-service n'est pas démarré"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Diagnostic terminé                                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"

