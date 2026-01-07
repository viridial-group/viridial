#!/bin/bash
# Script pour déployer/mettre à jour auth-service sur le VPS
# Usage: ./scripts/deploy-auth-service-vps.sh

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🚀 Déploiement Auth-Service sur VPS                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier qu'on est sur le VPS ou avoir accès SSH
if [ ! -d "/opt/viridial" ] && [ -z "$SSH_CONNECTION" ]; then
  echo "⚠️  Ce script doit être exécuté sur le VPS ou via SSH"
  echo ""
  echo "Pour déployer depuis local:"
  echo "   ssh user@VPS_IP 'cd /opt/viridial && git pull && cd infrastructure/docker-compose && docker compose -f app-auth.yml up -d --build'"
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
    echo "   ⚠️  IMPORTANT: Édite .env avec tes valeurs (SMTP, DATABASE_URL, etc.)"
  else
    echo "   ❌ .env.example non trouvé non plus"
  fi
else
  echo "   ✅ Fichier .env trouvé"
  
  # Vérifier les variables SMTP critiques
  if ! grep -q "SMTP_HOST" .env || ! grep -q "SMTP_PASS" .env; then
    echo "   ⚠️  Variables SMTP manquantes dans .env"
    echo "   Ajoute:"
    echo "   SMTP_HOST=smtp.hostinger.com"
    echo "   SMTP_PORT=465"
    echo "   SMTP_SECURE=true"
    echo "   SMTP_USER=support@viridial.com"
    echo "   SMTP_PASS=..."
    echo "   EMAIL_FROM=support@viridial.com"
    echo "   FROM_NAME=Viridial Support"
    echo "   FRONTEND_URL=https://viridial.com"
  else
    echo "   ✅ Variables SMTP configurées"
  fi
fi
echo ""

# 3. Rebuild et redémarrer le service
echo "3️⃣  Rebuild et redémarrage du service..."
docker compose -f app-auth.yml build --no-cache auth-service
docker compose -f app-auth.yml up -d auth-service
echo "   ✅ Service redémarré"
echo ""

# 4. Vérifier le statut
echo "4️⃣  Vérification du statut..."
sleep 3
docker compose -f app-auth.yml ps auth-service
echo ""

# 5. Vérifier les logs
echo "5️⃣  Dernières lignes des logs (10 dernières):"
docker compose -f app-auth.yml logs --tail=10 auth-service
echo ""

# 6. Test de santé
echo "6️⃣  Test de santé..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:8080/auth/health" || echo -e "\n000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ Service en bonne santé (HTTP 200)"
  echo "   Response: $(echo "$HEALTH_RESPONSE" | sed '$d')"
else
  echo "   ⚠️  Service ne répond pas correctement (HTTP $HTTP_CODE)"
  echo "   Vérifie les logs: docker compose -f app-auth.yml logs auth-service"
fi
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Déploiement terminé                                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Tester les endpoints: ./scripts/test-auth-endpoints-vps.sh"
echo "   2. Vérifier les logs: docker compose -f app-auth.yml logs -f auth-service"
echo "   3. Vérifier la base de données: docker exec -it viridial-postgres psql -U viridial -d viridial -c '\\dt'"
echo ""

