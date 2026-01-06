#!/bin/bash
# Script pour synchroniser les stories markdown avec GitHub Issues
# Usage: ./scripts/sync-stories-to-github.sh [--dry-run]

set -e

DRY_RUN=${1:-""}
STORIES_DIR="docs/stories"
GITHUB_REPO=$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')

echo "Synchronisation des stories vers GitHub Issues..."
echo "Repository: $GITHUB_REPO"
echo ""

if [ "$DRY_RUN" = "--dry-run" ]; then
  echo "⚠️  Mode DRY-RUN - Aucune action ne sera effectuée"
  echo ""
fi

# Vérifier que gh CLI est installé
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) n'est pas installé."
  echo "Installez-le avec: brew install gh (macOS) ou voir https://cli.github.com/"
  exit 1
fi

# Vérifier authentification GitHub
if ! gh auth status &> /dev/null; then
  echo "❌ Non authentifié avec GitHub CLI."
  echo "Exécutez: gh auth login"
  exit 1
fi

echo "✅ GitHub CLI configuré"
echo "Pour créer les Issues, exécutez ce script sans --dry-run"
