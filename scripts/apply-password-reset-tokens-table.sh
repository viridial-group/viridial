#!/bin/bash
# Script pour appliquer la table password_reset_tokens sur le VPS
# Usage: ./scripts/apply-password-reset-tokens-table.sh [VPS_IP]

set -e

VPS_IP="${1:-148.230.112.148}"
SQL_FILE="infrastructure/docker-compose/create-password-reset-tokens-table.sql"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  📊 Application de la table password_reset_tokens             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier que le fichier SQL existe
if [ ! -f "$SQL_FILE" ]; then
  echo "❌ Fichier SQL non trouvé: $SQL_FILE"
  exit 1
fi

echo "📂 Fichier SQL: $SQL_FILE"
echo ""

# Option 1: Exécuter localement (si PostgreSQL est accessible localement)
if command -v psql &> /dev/null; then
  echo "🔍 PostgreSQL trouvé localement"
  read -p "Exécuter localement? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📊 Exécution du script SQL localement..."
    psql -U viridial -d viridial -f "$SQL_FILE" || {
      echo "⚠️  Erreur lors de l'exécution locale"
      echo "   Vérifie que PostgreSQL est accessible et que la base existe"
    }
    exit 0
  fi
fi

# Option 2: Exécuter sur le VPS via Docker
echo "🚀 Exécution sur le VPS via Docker..."
echo ""

# Copier le fichier SQL sur le VPS temporairement
TMP_SQL="/tmp/create-password-reset-tokens-table.sql"

echo "1️⃣  Copie du fichier SQL sur le VPS..."
scp "$SQL_FILE" "root@${VPS_IP}:${TMP_SQL}" || {
  echo "❌ Erreur lors de la copie du fichier"
  echo "   Vérifie que tu as accès SSH au VPS"
  exit 1
}
echo "   ✅ Fichier copié"
echo ""

echo "2️⃣  Exécution du script SQL dans le conteneur PostgreSQL..."
ssh "root@${VPS_IP}" "docker exec -i viridial-postgres psql -U viridial -d viridial < ${TMP_SQL}" || {
  echo "❌ Erreur lors de l'exécution du script SQL"
  echo "   Vérifie que:"
  echo "   - Le conteneur viridial-postgres est démarré"
  echo "   - La base de données viridial existe"
  echo "   - L'utilisateur viridial a les permissions"
  exit 1
}
echo "   ✅ Script SQL exécuté"
echo ""

echo "3️⃣  Nettoyage du fichier temporaire..."
ssh "root@${VPS_IP}" "rm ${TMP_SQL}"
echo "   ✅ Fichier temporaire supprimé"
echo ""

echo "4️⃣  Vérification de la table créée..."
ssh "root@${VPS_IP}" "docker exec -i viridial-postgres psql -U viridial -d viridial -c '\d password_reset_tokens'" || {
  echo "⚠️  Impossible de vérifier la table (peut-être qu'elle existe déjà)"
}
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Table password_reset_tokens créée avec succès            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Pour vérifier manuellement:"
echo "   ssh root@${VPS_IP}"
echo "   docker exec -it viridial-postgres psql -U viridial -d viridial"
echo "   \\d password_reset_tokens"
echo "   SELECT COUNT(*) FROM password_reset_tokens;"
echo ""

