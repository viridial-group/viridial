#!/bin/bash
# Script pour déployer/mettre à jour frontend sur le VPS
# Usage: ./scripts/deploy-frontend-vps.sh

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🚀 Déploiement Frontend sur VPS                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier qu'on est sur le VPS ou avoir accès SSH
if [ ! -d "/opt/viridial" ] && [ -z "$SSH_CONNECTION" ]; then
  echo "⚠️  Ce script doit être exécuté sur le VPS ou via SSH"
  echo ""
  echo "Pour déployer depuis local:"
  echo "   ssh user@148.230.112.148 'cd /opt/viridial && git pull && cd infrastructure/docker-compose && docker compose -f app-frontend.yml up -d --build'"
  echo ""
  exit 1
fi

VPS_DIR="${VIRIDIAL_DIR:-/opt/viridial}"
cd "$VPS_DIR" || {
  echo "❌ Répertoire $VPS_DIR non trouvé"
  exit 1
}

echo "📂 Répertoire: ${VPS_DIR}"
echo ""

# 1. Mettre à jour le code
echo "1️⃣  Mise à jour du code..."
git pull origin main || git pull origin master || {
  echo "⚠️  Erreur lors du git pull, continuons quand même..."
}
echo "   ✅ Code mis à jour"
echo ""

# 2. Vérifier les variables d'environnement
echo "2️⃣  Vérification des variables d'environnement..."
cd infrastructure/docker-compose

if [ ! -f ".env" ]; then
  echo "   ⚠️  Fichier .env non trouvé"
  echo "   Création depuis .env.example..."
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "   ⚠️  IMPORTANT: Édite .env avec tes valeurs"
  else
    echo "   ❌ .env.example non trouvé non plus"
  fi
else
  echo "   ✅ Fichier .env trouvé"
  
  # Vérifier les variables frontend
  if ! grep -q "FRONTEND_AUTH_API_URL" .env; then
    echo "   ⚠️  Variable FRONTEND_AUTH_API_URL manquante dans .env"
    echo "   Ajoute:"
    echo "   FRONTEND_AUTH_API_URL=http://viridial.com/auth"
    echo "   # ou avec IP (temporaire):"
    echo "   FRONTEND_AUTH_API_URL=http://148.230.112.148/auth"
  else
    echo "   ✅ Variable FRONTEND_AUTH_API_URL configurée"
    grep "FRONTEND_AUTH_API_URL" .env | sed 's/^/      /'
  fi
fi
echo ""

# 3. Vérifier que le réseau Docker existe
echo "3️⃣  Vérification du réseau Docker..."
if ! docker network ls | grep -q viridial-network; then
  echo "   ⚠️  Réseau viridial-network non trouvé, création..."
  docker network create viridial-network
  echo "   ✅ Réseau créé"
else
  echo "   ✅ Réseau viridial-network existe"
fi
echo ""

# 3.5. Vérifier que auth-service est démarré
echo "3.5️⃣  Vérification que auth-service est démarré..."
if ! docker ps | grep -q viridial-auth-service; then
  echo "   ⚠️  Auth-service n'est pas démarré"
  echo "   Démarrage de auth-service..."
  if [ -f "app-auth.yml" ]; then
    docker compose -f app-auth.yml up -d auth-service
    echo "   ✅ Auth-service démarré"
  else
    echo "   ⚠️  Fichier app-auth.yml non trouvé, assurez-vous que auth-service est démarré"
  fi
else
  echo "   ✅ Auth-service est en cours d'exécution"
fi
echo ""

# 4. Rebuild et redémarrer les services
echo "4️⃣  Build et redémarrage du frontend..."
docker compose -f app-frontend.yml build --no-cache frontend
docker compose -f app-frontend.yml up -d frontend
echo "   ✅ Frontend redémarré"
echo ""

# 4.5. Démarrer nginx si configuré
echo "4.5️⃣  Démarrage de Nginx..."
docker compose -f app-frontend.yml up -d nginx 2>/dev/null || {
  echo "   ⚠️  Nginx non démarré ou déjà en cours d'exécution"
}
echo ""

# 5. Vérifier le statut
echo "5️⃣  Vérification du statut..."
sleep 3
docker compose -f app-frontend.yml ps
echo ""

# 6. Vérifier les logs
echo "6️⃣  Dernières lignes des logs frontend (10 dernières):"
docker compose -f app-frontend.yml logs --tail=10 frontend
echo ""

# 7. Test de santé
echo "7️⃣  Test de santé..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:3000" || echo -e "\n000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
  echo "   ✅ Frontend accessible (HTTP $HTTP_CODE)"
else
  echo "   ⚠️  Frontend ne répond pas correctement (HTTP $HTTP_CODE)"
  echo "   Vérifie les logs: docker compose -f app-frontend.yml logs frontend"
fi
echo ""

# 8. Test de nginx
echo "8️⃣  Test de Nginx..."
NGINX_RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost" || echo -e "\n000")
NGINX_CODE=$(echo "$NGINX_RESPONSE" | tail -n1)

if [ "$NGINX_CODE" = "200" ] || [ "$NGINX_CODE" = "304" ]; then
  echo "   ✅ Nginx accessible sur port 80 (HTTP $NGINX_CODE)"
else
  echo "   ⚠️  Nginx ne répond pas correctement (HTTP $NGINX_CODE)"
  echo "   Vérifie les logs: docker compose -f app-frontend.yml logs nginx"
fi
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Déploiement terminé                                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Accès:"
echo "   - Frontend direct (Next.js): http://148.230.112.148:3000"
echo "   - Frontend via Nginx (IP): http://148.230.112.148"
echo "   - Frontend via domaine: http://viridial.com ou http://www.viridial.com"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Configurer DNS pour pointer viridial.com et www.viridial.com vers 148.230.112.148"
echo "      A     @           148.230.112.148"
echo "      A     www         148.230.112.148"
echo "   2. Mettre à jour FRONTEND_AUTH_API_URL dans .env: http://viridial.com/auth"
echo "   3. Mettre à jour auth-service CORS pour inclure http://viridial.com et https://viridial.com"
echo "   4. Configurer SSL/TLS avec Let's Encrypt (recommandé pour production)"
echo "   5. Vérifier les logs: docker compose -f app-frontend.yml logs -f frontend"
echo ""

