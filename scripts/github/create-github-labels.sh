#!/bin/bash
# Script pour créer les labels GitHub pour Viridial
# Usage: ./scripts/create-github-labels.sh
# Prérequis: GitHub CLI (gh) installé et authentifié

# Ne pas arrêter sur erreur - on veut continuer même si certains labels échouent
set +e

GITHUB_REPO="viridial-group/viridial"

echo "🏷️  Création des labels GitHub pour $GITHUB_REPO"
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

# Fonction pour créer un label (ignore si existe déjà)
create_label() {
  local name=$1
  local description=$2
  local color=$3

  # Vérifier si le label existe déjà
  if gh label list --repo "$GITHUB_REPO" 2>/dev/null | grep -q "^$name"; then
    echo "⚠️  Label '$name' existe déjà, mise à jour..."
    if gh label edit "$name" --description "$description" --color "$color" --repo "$GITHUB_REPO" 2>/dev/null; then
      echo "   ✅ Mis à jour"
    else
      echo "   ⚠️  Échec de la mise à jour (peut être normal)"
    fi
  else
    echo "✅ Création label: $name"
    if gh label create "$name" --description "$description" --color "$color" --repo "$GITHUB_REPO" 2>/dev/null; then
      echo "   ✅ Créé"
    else
      echo "   ❌ Échec de la création"
      return 1
    fi
  fi
}

echo "📋 Création des labels Priority..."
create_label "priority:p0" "Critique - Bloqueur" "d73a4a"
create_label "priority:p1" "Important" "e99695"
create_label "priority:p2" "Nice to have" "fbca04"

echo ""
echo "📋 Création des labels Type..."
create_label "type:bug" "Bug" "d73a4a"
create_label "type:feature" "Feature" "0e8a16"
create_label "type:infrastructure" "Infrastructure" "0052cc"
create_label "type:documentation" "Documentation" "5319e7"
create_label "type:refactoring" "Refactoring" "c5def5"

echo ""
echo "📋 Création des labels Service..."
create_label "service:auth" "Auth Service" "1d76db"
create_label "service:property" "Property Service" "1d76db"
create_label "service:search" "Search Service" "1d76db"
create_label "service:lead" "Lead Service" "1d76db"
create_label "service:billing" "Billing Service" "1d76db"
create_label "service:admin" "Admin Service" "1d76db"
create_label "service:frontend" "Frontend" "1d76db"
create_label "service:infra" "Infrastructure" "1d76db"
create_label "service:shared" "Shared Code" "1d76db"


echo ""
echo "📋 Création des labels Epic..."
create_label "epic:foundation" "Epic 1: Foundation" "b60205"
create_label "epic:multi-tenant" "Epic 2: Multi-tenant" "b60205"
create_label "epic:property-management" "Epic 3: Property Management" "b60205"
create_label "epic:search" "Epic 4: Search" "b60205"
create_label "epic:agency" "Epic 5: Agency" "b60205"
create_label "epic:lead-management" "Epic 6: Lead Management" "b60205"
create_label "epic:operations" "Epic 7: Operations" "b60205"
create_label "epic:intelligence" "Epic 8: Intelligence" "b60205"
create_label "epic:rich-media" "Epic 9: Rich Media" "b60205"
create_label "epic:monetization" "Epic 10: Monetization" "b60205"

echo ""
echo "📋 Création des labels Status..."
create_label "status:ready" "Ready" "0e8a16"
create_label "status:in-progress" "In Progress" "fbca04"
create_label "status:review" "In Review" "0052cc"
create_label "status:blocked" "Blocked" "d73a4a"
create_label "status:done" "Done" "0e8a16"

echo ""
echo "📋 Création des labels Infrastructure..."
create_label "infra:kubernetes" "Kubernetes" "0052cc"
create_label "infra:database" "Database" "0052cc"
create_label "infra:observability" "Observability" "0052cc"
create_label "infra:security" "Security" "0052cc"
create_label "infra:ci-cd" "CI/CD" "0052cc"

echo ""
echo "✅ Traitement des labels terminé!"
echo ""
echo "📊 Vérification des labels créés:"
echo "─────────────────────────────────"
gh label list --repo "$GITHUB_REPO" | grep -E "(priority:|type:|service:|epic:|status:|infra:)" | head -30 || echo "Aucun label personnalisé trouvé"
echo ""
echo "💡 Si certains labels n'ont pas été créés, vérifiez:"
echo "   - Vos permissions sur le repository"
echo "   - Que le repository a été poussé (git push -u origin main)"

