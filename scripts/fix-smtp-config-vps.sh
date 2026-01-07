#!/bin/bash
# Script pour vérifier et corriger la configuration SMTP sur le VPS
# Usage: ./scripts/fix-smtp-config-vps.sh [VPS_IP]

set -e

VPS_IP="${1:-148.230.112.148}"
ENV_FILE="infrastructure/docker-compose/.env"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔧 Vérification et Correction Configuration SMTP             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "📍 VPS IP: ${VPS_IP}"
echo "📂 Fichier .env: ${ENV_FILE}"
echo ""

# Vérifier les variables SMTP sur le VPS 
echo "1️⃣  Vérification des variables SMTP sur le VPS..."
echo ""

ssh "root@${VPS_IP}" "cd /opt/viridial && \
  if [ -f ${ENV_FILE} ]; then
    echo '✅ Fichier .env trouvé'
    echo ''
    echo 'Variables SMTP actuelles:'
    grep -E '^SMTP_|^EMAIL_FROM|^FROM_NAME|^FRONTEND_URL' ${ENV_FILE} || echo '⚠️  Aucune variable SMTP trouvée'
  else
    echo '❌ Fichier .env non trouvé'
    echo '   Création depuis .env.example...'
    if [ -f ${ENV_FILE}.example ]; then
      cp ${ENV_FILE}.example ${ENV_FILE}
      echo '   ✅ Fichier .env créé'
      echo '   ⚠️  IMPORTANT: Édite .env avec tes valeurs SMTP'
    else
      echo '   ❌ .env.example non trouvé non plus'
    fi
  fi
" || {
  echo "❌ Erreur lors de la connexion au VPS"
  exit 1
}

echo ""
echo "2️⃣  Variables SMTP requises:"
echo ""
echo "   SMTP_HOST=smtp.hostinger.com"
echo "   SMTP_PORT=465"
echo "   SMTP_SECURE=true"
echo "   SMTP_USER=support@viridial.com"
echo "   SMTP_PASS=S@upport!19823"
echo "   EMAIL_FROM=support@viridial.com"
echo "   FROM_NAME=Viridial Support"
echo "   FRONTEND_URL=https://viridial.com"
echo ""

echo "3️⃣  Pour ajouter/corriger les variables SMTP:"
echo ""
echo "   ssh root@${VPS_IP}"
echo "   cd /opt/viridial"
echo "   nano infrastructure/docker-compose/.env"
echo ""
echo "   Ou utiliser cette commande pour ajouter automatiquement:"
echo ""
echo "   ssh root@${VPS_IP} 'cd /opt/viridial/infrastructure/docker-compose && \\"
echo "     echo \"SMTP_HOST=smtp.hostinger.com\" >> .env && \\"
echo "     echo \"SMTP_PORT=465\" >> .env && \\"
echo "     echo \"SMTP_SECURE=true\" >> .env && \\"
echo "     echo \"SMTP_USER=support@viridial.com\" >> .env && \\"
echo "     echo \"SMTP_PASS=S@upport!19823\" >> .env && \\"
echo "     echo \"EMAIL_FROM=support@viridial.com\" >> .env && \\"
echo "     echo \"FROM_NAME=Viridial Support\" >> .env && \\"
echo "     echo \"FRONTEND_URL=https://viridial.com\" >> .env'"
echo ""

echo "4️⃣  Après avoir configuré les variables, redémarrer auth-service:"
echo ""
echo "   ssh root@${VPS_IP} 'cd /opt/viridial/infrastructure/docker-compose && \\"
echo "     docker compose -f app-auth.yml restart auth-service'"
echo ""

echo "5️⃣  Vérifier les logs pour confirmer:"
echo ""
echo "   ssh root@${VPS_IP} 'cd /opt/viridial/infrastructure/docker-compose && \\"
echo "     docker compose -f app-auth.yml logs --tail=20 auth-service'"
echo ""

