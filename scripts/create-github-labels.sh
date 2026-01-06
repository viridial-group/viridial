#!/bin/bash
# Script pour créer les labels GitHub pour Viridial
# Usage: ./scripts/create-github-labels.sh
# Prérequis: GitHub CLI (gh) installé et authentifié

set -e

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

# Fonction pour créer un label (ignore si existe déjà)
create_label() {
  local name=$1
  local description=$2
  local color=$3

  if gh label list --repo "$GITHUB_REPO" | grep -q "^$name"; then
    echo "⚠️  Label '$name' existe déjà, mise à jour..."
    gh label edit "$name" --description "$description" --color "$color" --repo "$GITHUB_REPO" || true
  else
    echo "✅ Création label: $name"
    gh label create "$name" --description "$description" --color "$color" --repo "$GITHUB_REPO" || true
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
echo "✅ Tous les labels ont été créés/mis à jour!"
echo ""
echo "Vérification:"
gh label list --repo "$GITHUB_REPO" | head -20

