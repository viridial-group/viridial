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
    return 0
  fi
  
  echo "✅ Création milestone: $title"
  
  # Créer le milestone via API avec les bons paramètres
  local api_result
  local api_exit_code
  
  if [ -n "$due_date" ]; then
    api_result=$(gh api "repos/$GITHUB_REPO/milestones" \
      -X POST \
      -f title="$title" \
      -f description="$description" \
      -f due_on="${due_date}T23:59:59Z" \
      2>&1)
    api_exit_code=$?
  else
    api_result=$(gh api "repos/$GITHUB_REPO/milestones" \
      -X POST \
      -f title="$title" \
      -f description="$description" \
      2>&1)
    api_exit_code=$?
  fi
  
  # Vérifier le résultat
  if [ $api_exit_code -eq 0 ] && echo "$api_result" | grep -qE '"number"|"id"'; then
    # Succès - extraire le numéro du milestone
    local milestone_num=$(echo "$api_result" | grep -oE '"number":[0-9]+' | head -1 | cut -d: -f2 || echo "$api_result" | jq -r '.number' 2>/dev/null || echo "?")
    echo "   ✅ Créé (#$milestone_num)"
    return 0
  elif echo "$api_result" | grep -qiE "permission|forbidden|unauthorized|403"; then
    echo "   ❌ Échec: Permissions insuffisantes (403)"
    echo "   💡 Solution: Obtenir permissions Write ou créer manuellement"
    return 1
  elif echo "$api_result" | grep -qiE "not found|404"; then
    echo "   ❌ Échec: Repository non trouvé ou endpoint invalide (404)"
    echo "   💡 Vérifiez que le repository existe et est accessible"
    return 1
  elif echo "$api_result" | grep -qiE "bad request|422"; then
    echo "   ❌ Échec: Requête invalide (422)"
    echo "   💡 Détails: $api_result"
    return 1
  else
    echo "   ❌ Échec: $api_result"
    return 1
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

