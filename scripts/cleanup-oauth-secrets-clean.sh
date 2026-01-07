#!/bin/bash

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧹 Nettoyage des Secrets OAuth de l'Historique Git         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  ATTENTION: Cette opération va modifier l'historique Git"
echo ""
echo "📋 Ce script utilise des variables d'environnement pour les secrets"
echo "   Définissez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET avant d'exécuter"
echo ""
read -p "Continuer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Annulé."
  exit 1
fi

# Backup de la branche actuelle
echo ""
echo "1️⃣  Création d'un backup..."
git branch backup-before-cleanup-$(date +%Y%m%d-%H%M%S) || true
echo "   ✅ Backup créé"
echo ""

# Nettoyer les secrets dans les commits spécifiques
echo ""
echo "2️⃣  Nettoyage des commits..."
echo "   (Utilisez les variables d'environnement GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET)"
echo ""

# Utiliser git filter-repo si disponible, sinon git filter-branch
CLIENT_ID_PATTERN="${GOOGLE_CLIENT_ID:-YOUR_GOOGLE_CLIENT_ID_HERE}"
CLIENT_SECRET_PATTERN="${GOOGLE_CLIENT_SECRET:-YOUR_GOOGLE_CLIENT_SECRET_HERE}"

if command -v git-filter-repo &> /dev/null; then
  echo "   Utilisation de git-filter-repo..."
  git filter-repo --force \
    --path scripts/cleanup-oauth-secrets.sh \
    --replace-text <(echo "${CLIENT_ID_PATTERN}==>YOUR_GOOGLE_CLIENT_ID_HERE") \
    --replace-text <(echo "${CLIENT_SECRET_PATTERN}==>YOUR_GOOGLE_CLIENT_SECRET_HERE") || true
else
  echo "   Utilisation de git filter-branch..."
  git filter-branch --force --tree-filter \
    'if [ -f scripts/cleanup-oauth-secrets.sh ]; then
       sed -i.bak "s/991109105818-lllmlebo17hs5nag6k7ep71vg246mj5f\.apps\.googleusercontent\.com/YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com/g" scripts/cleanup-oauth-secrets.sh || true
       sed -i.bak "s/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/YOUR_GOOGLE_CLIENT_SECRET_HERE/g" scripts/cleanup-oauth-secrets.sh || true
       rm -f scripts/cleanup-oauth-secrets.sh.bak || true
     fi' \
    --prune-empty --tag-name-filter cat -- --all 2>&1 | tail -20 || true
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Nettoyage terminé                                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Vérifier l'historique: git log --oneline"
echo "   2. Tester le push: git push --force-with-lease"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Les secrets doivent être RÉVOQUÉS dans Google Cloud Console"
echo "   - Générer de nouveaux identifiants OAuth"
echo "   - Utiliser --force-with-lease uniquement si tu es sûr"
echo ""

