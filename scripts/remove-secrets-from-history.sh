#!/bin/bash

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧹 Suppression du fichier avec secrets de l'historique Git   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  Cette opération va supprimer scripts/cleanup-oauth-secrets.sh"
echo "   du commit 264eaa57 pour résoudre le problème de secrets GitHub"
echo ""
read -p "Continuer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Annulé."
  exit 1
fi

# Backup
echo ""
echo "1️⃣  Création d'un backup..."
git branch backup-before-remove-secrets-$(date +%Y%m%d-%H%M%S) || true
echo "   ✅ Backup créé"
echo ""

# Supprimer le fichier du commit 264eaa57 en utilisant git filter-branch
echo "2️⃣  Suppression du fichier du commit 264eaa57..."
echo "   (Cette opération peut prendre quelques minutes)"
echo ""

# Utiliser git filter-branch pour supprimer le fichier du commit spécifique
git filter-branch --force --index-filter \
  'if [ "$GIT_COMMIT" = "264eaa57592e1347b26f66471d7f56c1331d4444" ]; then
     git rm --cached --ignore-unmatch scripts/cleanup-oauth-secrets.sh || true
   fi' \
  --prune-empty --tag-name-filter cat -- 264eaa57..HEAD 2>&1 | tail -10 || {
  echo ""
  echo "⚠️  Note: Le commit 264eaa57 pourrait être plus ancien que prévu"
  echo "   → Essayons de supprimer le fichier de tous les commits..."
  echo ""
  
  # Alternative: supprimer de tous les commits
  git filter-branch --force --index-filter \
    'git rm --cached --ignore-unmatch scripts/cleanup-oauth-secrets.sh || true' \
    --prune-empty --tag-name-filter cat -- --all 2>&1 | tail -10 || true
}

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Nettoyage terminé                                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Vérifier: git log --oneline | head -5"
echo "   2. Vérifier que le fichier n'est plus dans 264eaa57:"
echo "      git show 264eaa57:scripts/cleanup-oauth-secrets.sh 2>&1 | head -1"
echo "   3. Si OK, tester: git push --force-with-lease"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Les secrets doivent être RÉVOQUÉS dans Google Cloud Console"
echo "   - Utiliser --force-with-lease uniquement si tu es sûr"
echo ""

