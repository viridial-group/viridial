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

# Fonction pour créer/mettre à jour une Issue GitHub depuis une story
sync_story() {
  local story_file=$1
  local story_id=$(basename "$story_file" .story.md | sed 's/.*\(US-[A-Z0-9-]*\).*/\1/')
  local story_title=$(grep "^# " "$story_file" | head -1 | sed 's/^# //')
  local priority=$(grep "^\*\*Priority:\*\*" "$story_file" | sed 's/.*P\([0-9]\).*/P\1/')
  local estimation=$(grep "^\*\*Estimation:\*\*" "$story_file" | sed 's/.*\*\* \([0-9]*\).*/\1/')
  
  if [ -z "$story_id" ] || [ "$story_id" = "$(basename "$story_file" .story.md)" ]; then
    echo "⚠️  Impossible d'extraire l'ID de la story: $story_file"
    return
  fi
  
  # Vérifier si l'issue existe déjà
  local existing_issue=$(gh issue list --repo "$GITHUB_REPO" --search "$story_id" --json number --jq '.[0].number' 2>/dev/null || echo "")
  
  local issue_body=$(cat <<EOF
## Story: $story_id

**Fichier:** \`$story_file\`

**Priority:** $priority
**Estimation:** $estimation points

**Lien vers la story:** [Voir la story complète]($story_file)

---

$(cat "$story_file")
EOF
)
  
  if [ -n "$existing_issue" ]; then
    echo "📝 Mise à jour Issue #$existing_issue pour $story_id"
    if [ "$DRY_RUN" != "--dry-run" ]; then
      gh issue edit "$existing_issue" --repo "$GITHUB_REPO" --title "[STORY] $story_id: $story_title" --body "$issue_body" || echo "⚠️  Échec mise à jour"
    fi
  else
    echo "✨ Création Issue pour $story_id"
    if [ "$DRY_RUN" != "--dry-run" ]; then
      gh issue create --repo "$GITHUB_REPO" \
        --title "[STORY] $story_id: $story_title" \
        --body "$issue_body" \
        --label "type:feature,priority:$priority" || echo "⚠️  Échec création"
    fi
  fi
}

# Parcourir toutes les stories
for story_file in "$STORIES_DIR"/US-*.story.md "$STORIES_DIR"/US-INFRA-*.story.md; do
  if [ -f "$story_file" ]; then
    sync_story "$story_file"
  fi
done

echo ""
echo "✅ Synchronisation terminée"
echo ""
echo "Pour créer les labels manquants, exécutez:"
echo "  gh label create 'priority:p0' --repo $GITHUB_REPO"
echo "  gh label create 'priority:p1' --repo $GITHUB_REPO"
echo "  gh label create 'type:feature' --repo $GITHUB_REPO"
echo "  # etc."

