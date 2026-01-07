#!/bin/bash

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔧 Correction du commit 264eaa57 - Suppression des secrets ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Backup
echo "1️⃣  Création d'un backup..."
git branch backup-before-fix-$(date +%Y%m%d-%H%M%S) || true
echo "   ✅ Backup créé"
echo ""

# Récupérer la version nettoyée du fichier
echo "2️⃣  Récupération de la version nettoyée..."
CLEAN_VERSION=$(git show HEAD:scripts/cleanup-oauth-secrets.sh 2>/dev/null || echo "")

if [ -z "$CLEAN_VERSION" ]; then
  echo "   ❌ Impossible de trouver la version nettoyée"
  echo "   → Assurez-vous que le commit actuel contient la version nettoyée"
  exit 1
fi

echo "   ✅ Version nettoyée trouvée"
echo ""

# Utiliser git filter-branch pour remplacer le fichier dans le commit 264eaa57
echo "3️⃣  Modification de l'historique avec git filter-branch..."
echo "   (Cette opération peut prendre quelques minutes)"
echo ""

# Créer un script temporaire pour le filter-branch
FILTER_SCRIPT=$(mktemp)
cat > "$FILTER_SCRIPT" << 'EOFSCRIPT'
if git rev-list --quiet --grep="add  front web" --all | grep -q "^264eaa57"; then
  # Si on est sur le commit 264eaa57, remplacer le fichier
  if [ "$GIT_COMMIT" = "264eaa57592e1347b26f66471d7f56c1331d4444" ]; then
    # Récupérer la version nettoyée depuis HEAD
    git show HEAD:scripts/cleanup-oauth-secrets.sh > scripts/cleanup-oauth-secrets.sh 2>/dev/null || true
    git add scripts/cleanup-oauth-secrets.sh 2>/dev/null || true
  fi
fi
EOFSCRIPT

# Alternative: utiliser git replace ou git rebase
echo "   Utilisation d'une approche plus simple..."
echo ""

# Méthode alternative: utiliser git commit --amend sur le commit spécifique
# Mais cela nécessite un rebase interactif

# Solution la plus simple: utiliser git filter-branch pour remplacer uniquement ce fichier
git filter-branch --force --index-filter \
  'if [ "$GIT_COMMIT" = "264eaa57592e1347b26f66471d7f56c1331d4444" ]; then
     git show HEAD:scripts/cleanup-oauth-secrets.sh > scripts/cleanup-oauth-secrets.sh 2>/dev/null || true
     git add scripts/cleanup-oauth-secrets.sh 2>/dev/null || true
   fi' \
  --prune-empty --tag-name-filter cat -- 264eaa57..HEAD 2>&1 | head -20 || {
  echo ""
  echo "⚠️  git filter-branch a échoué ou n'a rien modifié"
  echo "   → Essayons une autre approche..."
  echo ""
}

rm -f "$FILTER_SCRIPT"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Correction terminée                                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Vérifier: git log --oneline | grep 264eaa5"
echo "   2. Vérifier le contenu: git show 264eaa57:scripts/cleanup-oauth-secrets.sh | grep -i secret"
echo "   3. Si OK, tester: git push --force-with-lease"
echo ""

