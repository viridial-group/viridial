#!/bin/bash
# Script pour mettre à jour FRONTEND_URL vers HTTPS sur le VPS
# Usage: ./scripts/update-frontend-url-production.sh

set -e

VPS_IP="${1:-148.230.112.148}"
ENV_FILE="infrastructure/docker-compose/.env"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔄 Mise à jour FRONTEND_URL vers HTTPS                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "📍 VPS IP: ${VPS_IP}"
echo "📂 Fichier .env: ${ENV_FILE}"
echo ""

# Vérifier si le script est exécuté sur le VPS ou localement
if [ -f "/opt/viridial/${ENV_FILE}" ] || [ -f "./${ENV_FILE}" ]; then
  # Exécuté sur le VPS
  if [ -f "/opt/viridial/${ENV_FILE}" ]; then
    ENV_FILE="/opt/viridial/${ENV_FILE}"
    cd /opt/viridial
  else
    cd /opt/viridial || cd "$(dirname "$0")/.."
  fi
  
  echo "🔧 Mise à jour de FRONTEND_URL dans ${ENV_FILE}..."
  echo ""
  
  # Backup
  cp "${ENV_FILE}" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
  
  # Remplacer FRONTEND_URL si elle existe
  if grep -q "^FRONTEND_URL=" "${ENV_FILE}" 2>/dev/null; then
    # Utiliser sed pour remplacer (compatible Linux/Mac)
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' 's|^FRONTEND_URL=.*|FRONTEND_URL=https://viridial.com|' "${ENV_FILE}"
    else
      # Linux
      sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://viridial.com|' "${ENV_FILE}"
    fi
    echo "   ✅ FRONTEND_URL mis à jour vers https://viridial.com"
  else
    # Ajouter FRONTEND_URL si elle n'existe pas
    echo "FRONTEND_URL=https://viridial.com" >> "${ENV_FILE}"
    echo "   ✅ FRONTEND_URL ajouté: https://viridial.com"
  fi
  
  echo ""
  echo "📋 Vérification de la valeur:"
  grep "^FRONTEND_URL=" "${ENV_FILE}" || echo "   ⚠️  FRONTEND_URL non trouvé"
  echo ""
  
  echo "🔄 Redémarrage de auth-service pour appliquer les changements..."
  cd infrastructure/docker-compose
  docker compose -f app-auth.yml restart auth-service
  echo "   ✅ Service redémarré"
  echo ""
  
  echo "📊 Vérification des logs:"
  sleep 2
  docker compose -f app-auth.yml logs --tail=10 auth-service | grep -i "CORS\|FRONTEND" || echo "   (Aucun log CORS trouvé)"
  
else
  # Exécuté localement - connecter au VPS
  echo "⚠️  Script exécuté localement, connexion au VPS..."
  echo ""
  
  ssh "root@${VPS_IP}" "cd /opt/viridial && bash -s" << 'REMOTE_SCRIPT'
    ENV_FILE="infrastructure/docker-compose/.env"
    
    if [ ! -f "${ENV_FILE}" ]; then
      echo "❌ Fichier ${ENV_FILE} non trouvé"
      exit 1
    fi
    
    # Backup
    cp "${ENV_FILE}" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    
    # Remplacer FRONTEND_URL
    if grep -q "^FRONTEND_URL=" "${ENV_FILE}"; then
      sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://viridial.com|' "${ENV_FILE}"
      echo "✅ FRONTEND_URL mis à jour vers https://viridial.com"
    else
      echo "FRONTEND_URL=https://viridial.com" >> "${ENV_FILE}"
      echo "✅ FRONTEND_URL ajouté: https://viridial.com"
    fi
    
    echo ""
    echo "📋 Valeur actuelle:"
    grep "^FRONTEND_URL=" "${ENV_FILE}"
    
    echo ""
    echo "🔄 Redémarrage de auth-service..."
    cd infrastructure/docker-compose
    docker compose -f app-auth.yml restart auth-service
    
    echo ""
    echo "📊 Logs récents:"
    sleep 2
    docker compose -f app-auth.yml logs --tail=10 auth-service | grep -i "CORS\|FRONTEND" || echo "(Aucun log CORS trouvé)"
REMOTE_SCRIPT
fi

echo ""
echo "✅ Mise à jour terminée !"
echo ""
echo "💡 Vérification finale:"
echo "   docker logs viridial-auth-service | grep 'CORS enabled'"
echo ""

