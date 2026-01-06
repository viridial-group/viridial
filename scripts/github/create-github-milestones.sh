#!/bin/bash
# Script pour créer les milestones GitHub pour Viridial
# Usage: ./scripts/create-github-milestones.sh
# Prérequis: GitHub CLI (gh) installé et authentifié

# Ne pas arrêter sur erreur - on veut continuer même si certains milestones échouent
set +e

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

# Vérifier que le repository est accessible
echo "🔍 Vérification de l'accès au repository..."
if ! gh repo view "$GITHUB_REPO" &> /dev/null; then
  echo "❌ Erreur: Impossible d'accéder au repository $GITHUB_REPO"
  echo "   Vérifiez que:"
  echo "   1. Le repository existe sur GitHub"
  echo "   2. Vous avez les permissions d'écriture"
  echo "   3. Le repository a été poussé (git push -u origin main)"
  exit 1
fi

# Vérifier les permissions d'écriture
echo "🔍 Vérification des permissions..."
if ! gh api "repos/$GITHUB_REPO" --jq '.permissions.push' 2>/dev/null | grep -q "true"; then
  echo "⚠️  Attention: Vous n'avez peut-être pas les permissions d'écriture"
  echo "   Le script continuera mais certaines opérations peuvent échouer"
fi
echo "✅ Repository accessible"
echo ""

# Fonction pour créer un milestone via API GitHub
create_milestone() {
  local title=$1
  local description=$2
  local due_date=$3

  # Vérifier si le milestone existe déjà
  local existing=$(gh api "repos/$GITHUB_REPO/milestones" --jq ".[] | select(.title == \"$title\") | .number" 2>/dev/null)
  
  if [ -n "$existing" ]; then
    echo "⚠️  Milestone '$title' existe déjà (#$existing)"
  else
    echo "✅ Création milestone: $title"
    
    # Construire le JSON pour la création
    local json_data="{\"title\":\"$title\",\"description\":\"$description\""
    if [ -n "$due_date" ]; then
      json_data="$json_data,\"due_on\":\"${due_date}T23:59:59Z\""
    fi
    json_data="$json_data}"
    
    # Créer le milestone via API
    if gh api "repos/$GITHUB_REPO/milestones" -X POST -f body="$json_data" 2>/dev/null > /dev/null; then
      echo "   ✅ Créé"
    else
      echo "   ❌ Échec de la création (vérifiez les permissions)"
      return 1
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
echo "✅ Traitement des milestones terminé!"
echo ""
echo "📊 Vérification des milestones créés:"
echo "─────────────────────────────────────"
gh api "repos/$GITHUB_REPO/milestones" --jq '.[] | "\(.number): \(.title) - \(.due_on // "Pas de date")"' 2>/dev/null | head -10 || echo "Aucun milestone trouvé"
echo ""
echo "💡 Si certains milestones n'ont pas été créés, vérifiez:"
echo "   - Vos permissions sur le repository (Write minimum)"
echo "   - Que le repository a été poussé (git push -u origin main)"

