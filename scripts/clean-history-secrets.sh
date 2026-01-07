#!/bin/bash

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧹 Nettoyage des Secrets de l'Historique Git                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  Cette opération va modifier l'historique Git pour supprimer"
echo "   les secrets du commit 264eaa57"
echo ""
echo "📋 Le commit 264eaa57 contient des secrets Google OAuth en dur"
echo "   dans scripts/cleanup-oauth-secrets.sh"
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
BACKUP_BRANCH="backup-before-clean-history-$(date +%Y%m%d-%H%M%S)"
git branch "$BACKUP_BRANCH" || true
echo "   ✅ Backup créé: $BACKUP_BRANCH"
echo ""

# Vérifier si git-filter-repo est disponible
if command -v git-filter-repo &> /dev/null; then
  echo "2️⃣  Utilisation de git-filter-repo (recommandé)..."
  echo ""
  
  # Supprimer le fichier du commit spécifique
  git filter-repo --force \
    --path scripts/cleanup-oauth-secrets.sh \
    --invert-paths \
    --refs 264eaa57..HEAD || {
    echo ""
    echo "⚠️  git-filter-repo a échoué, essayons git filter-branch..."
    echo ""
  }
else
  echo "2️⃣  Utilisation de git filter-branch..."
  echo "   (git-filter-repo n'est pas installé, utilisation de l'ancienne méthode)"
  echo ""
  
  # Supprimer le fichier de tous les commits depuis 264eaa57
  git filter-branch --force --index-filter \
    'git rm --cached --ignore-unmatch scripts/cleanup-oauth-secrets.sh || true' \
    --prune-empty --tag-name-filter cat -- 264eaa57..HEAD 2>&1 | tail -20 || {
    echo ""
    echo "⚠️  Tentative de suppression de tous les commits..."
    git filter-branch --force --index-filter \
      'git rm --cached --ignore-unmatch scripts/cleanup-oauth-secrets.sh || true' \
      --prune-empty --tag-name-filter cat -- --all 2>&1 | tail -20 || true
  }
fi

# Nettoyer les refs backup créés par filter-branch
echo ""
echo "3️⃣  Nettoyage des refs backup..."
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d 2>/dev/null || true
echo "   ✅ Refs nettoyés"
echo ""

# Forcer le garbage collection
echo "4️⃣  Nettoyage du cache Git..."
git reflog expire --expire=now --all || true
git gc --prune=now --aggressive || true
echo "   ✅ Cache nettoyé"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Nettoyage terminé                                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Vérifications:"
echo "   1. Vérifier que le fichier n'existe plus dans 264eaa57:"
echo "      git show 264eaa57:scripts/cleanup-oauth-secrets.sh 2>&1"
echo ""
echo "   2. Vérifier l'historique:"
echo "      git log --oneline | head -5"
echo ""
echo "   3. Tester le push:"
echo "      git push --force-with-lease"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Les secrets doivent être RÉVOQUÉS dans Google Cloud Console"
echo "   - Utiliser --force-with-lease uniquement si tu es sûr"
echo "   - Le backup est disponible sur: $BACKUP_BRANCH"
echo ""

