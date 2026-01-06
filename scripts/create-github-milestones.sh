#!/bin/bash
# Script pour créer les milestones GitHub pour Viridial
# Usage: ./scripts/create-github-milestones.sh
# Prérequis: GitHub CLI (gh) installé et authentifié

set -e

GITHUB_REPO="viridial-group/viridial"

echo "🎯 Création des milestones GitHub pour $GITHUB_REPO"
echo ""

# Vérifier GitHub CLI
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) n'est pas installé"
  echo "Installez-le avec: brew install gh (macOS) ou voir https://cli.github.com/"
  exit 1
fi

# Vérifier authentification
if ! gh auth status &> /dev/null; then
  echo "❌ GitHub CLI n'est pas authentifié"
  echo "Exécutez: gh auth login"
  exit 1
fi

# Fonction pour créer un milestone (ignore si existe déjà)
create_milestone() {
  local title=$1
  local description=$2
  local due_date=$3

  if gh milestone list --repo "$GITHUB_REPO" | grep -q "$title"; then
    echo "⚠️  Milestone '$title' existe déjà"
  else
    echo "✅ Création milestone: $title"
    if [ -n "$due_date" ]; then
      gh milestone create "$title" --description "$description" --due-date "$due_date" --repo "$GITHUB_REPO" || true
    else
      gh milestone create "$title" --description "$description" --repo "$GITHUB_REPO" || true
    fi
  fi
}

# Calculer dates (exemple: Sprint 1-2 = maintenant + 4 semaines)
TODAY=$(date +%Y-%m-%d)
SPRINT1_END=$(date -v+4w +%Y-%m-%d 2>/dev/null || date -d "+4 weeks" +%Y-%m-%d)
SPRINT3_END=$(date -v+6w +%Y-%m-%d 2>/dev/null || date -d "+6 weeks" +%Y-%m-%d)
SPRINT5_END=$(date -v+10w +%Y-%m-%d 2>/dev/null || date -d "+10 weeks" +%Y-%m-%d)
SPRINT6_END=$(date -v+12w +%Y-%m-%d 2>/dev/null || date -d "+12 weeks" +%Y-%m-%d)
SPRINT7_END=$(date -v+14w +%Y-%m-%d 2>/dev/null || date -d "+14 weeks" +%Y-%m-%d)
SPRINT8_END=$(date -v+16w +%Y-%m-%d 2>/dev/null || date -d "+16 weeks" +%Y-%m-%d)

echo "📋 Création des milestones Sprint..."
create_milestone "Sprint 1-2: Foundation" "Foundation: Infrastructure, Auth, Multi-tenant Setup" "$SPRINT1_END"
create_milestone "Sprint 3: Multi-tenant Setup" "Multi-tenant: Organizations, RBAC, i18n" "$SPRINT3_END"
create_milestone "Sprint 4-5: Core Features" "Core: Properties CRUD, Search, Leads" "$SPRINT5_END"
create_milestone "Sprint 6: Agency Features" "Agency: Dashboard, Property Management" "$SPRINT6_END"
create_milestone "Sprint 7: Lead Management" "Leads: Scoring, CRM Sync, Contact Flow" "$SPRINT7_END"
create_milestone "Sprint 8: Operations" "Operations: Observability, Backups, Security" "$SPRINT8_END"
create_milestone "Sprint 9+: Advanced Features" "Advanced: Price Estimator, Virtual Tours, Promotions" ""

echo ""
echo "✅ Tous les milestones ont été créés!"
echo ""
echo "Vérification:"
gh milestone list --repo "$GITHUB_REPO"

