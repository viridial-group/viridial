#!/bin/bash

# Script de vérification de version Node.js pour Viridial
# Usage: ./check-node-version.sh

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

REQUIRED_MAJOR=20
RECOMMENDED_VERSION="20.18.0"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Vérification de la version Node.js                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier si Node.js est installé
if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}❌ Node.js n'est pas installé${NC}"
  echo ""
  echo -e "${YELLOW}💡 Solutions pour installer Node.js:${NC}"
  
  OS_TYPE=$(uname -s 2>/dev/null || echo "Unknown")
  if [ "$OS_TYPE" = "Linux" ]; then
    if command -v apt-get >/dev/null 2>&1; then
      echo -e "   ${BLUE}Option 1 (Recommandé - nvm):${NC}"
      echo -e "      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
      echo -e "      source ~/.bashrc"
      echo -e "      nvm install $RECOMMENDED_VERSION"
      echo -e "      nvm use $RECOMMENDED_VERSION"
      echo ""
      echo -e "   ${BLUE}Option 2 (Via NodeSource):${NC}"
      echo -e "      curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
      echo -e "      sudo apt-get install -y nodejs"
    elif command -v yum >/dev/null 2>&1; then
      echo -e "   ${BLUE}Option 1 (Recommandé - nvm):${NC}"
      echo -e "      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
      echo -e "      source ~/.bashrc"
      echo -e "      nvm install $RECOMMENDED_VERSION"
      echo ""
      echo -e "   ${BLUE}Option 2 (Via NodeSource):${NC}"
      echo -e "      curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -"
      echo -e "      sudo yum install -y nodejs"
    fi
  else
    echo -e "   Visitez https://nodejs.org/ pour installer Node.js"
  fi
  exit 1
fi

# Obtenir la version actuelle
NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
NODE_MINOR=$(echo "$NODE_VERSION" | cut -d. -f2)
NODE_PATCH=$(echo "$NODE_VERSION" | cut -d. -f3)

echo -e "${BLUE}📋 Version Node.js détectée:${NC}"
echo -e "   Version complète: ${YELLOW}v$NODE_VERSION${NC}"
echo -e "   Majeure: $NODE_MAJOR"
echo -e "   Mineure: $NODE_MINOR"
echo -e "   Patch: $NODE_PATCH"
echo ""

# Vérifier la compatibilité
if [ "$NODE_MAJOR" -eq "$REQUIRED_MAJOR" ]; then
  echo -e "${GREEN}✅ Version compatible (Node.js 20.x)${NC}"
  
  # Vérifier si .nvmrc existe et comparer
  if [ -f ".nvmrc" ]; then
    RECOMMENDED_VERSION=$(cat .nvmrc | tr -d '[:space:]')
    echo -e "${BLUE}📋 Version recommandée selon .nvmrc: $RECOMMENDED_VERSION${NC}"
    
    # Comparer les versions (simplifié)
    CURRENT_MAJOR_MINOR="$NODE_MAJOR.$NODE_MINOR"
    RECOMMENDED_MAJOR_MINOR=$(echo "$RECOMMENDED_VERSION" | cut -d. -f1-2)
    
    if [ "$CURRENT_MAJOR_MINOR" != "$RECOMMENDED_MAJOR_MINOR" ]; then
      echo -e "${YELLOW}⚠️  Version mineure différente de celle recommandée${NC}"
      echo -e "   ${BLUE}Pour utiliser la version exacte:${NC}"
      echo -e "      nvm use"
    else
      echo -e "${GREEN}✅ Version correspond à .nvmrc${NC}"
    fi
  fi
  
  exit 0
elif [ "$NODE_MAJOR" -gt "$REQUIRED_MAJOR" ]; then
  echo -e "${YELLOW}⚠️  Version supérieure à 20.x (Node.js $NODE_MAJOR.x)${NC}"
  echo -e "${YELLOW}   Le projet est testé avec Node.js 20.x LTS${NC}"
  echo -e "${YELLOW}   Utilisation possible mais non garantie${NC}"
  echo ""
  echo -e "${BLUE}💡 Recommandation: Utiliser Node.js 20.x LTS${NC}"
  if [ -f ".nvmrc" ]; then
    REQUIRED_VERSION=$(cat .nvmrc)
    echo -e "   ${BLUE}nvm install $REQUIRED_VERSION && nvm use $REQUIRED_VERSION${NC}"
  fi
  exit 1
else
  echo -e "${RED}❌ Version incompatible (Node.js $NODE_MAJOR.x)${NC}"
  echo -e "${YELLOW}📋 Version requise: Node.js $REQUIRED_MAJOR.x LTS${NC}"
  echo ""
  echo -e "${BLUE}💡 Solutions:${NC}"
  if [ -f ".nvmrc" ]; then
    REQUIRED_VERSION=$(cat .nvmrc)
    echo -e "   ${BLUE}Option 1 (Recommandé):${NC}"
    echo -e "      nvm install $REQUIRED_VERSION"
    echo -e "      nvm use $REQUIRED_VERSION"
  else
    echo -e "   ${BLUE}Option 1 (Recommandé - nvm):${NC}"
    echo -e "      nvm install $RECOMMENDED_VERSION"
    echo -e "      nvm use $RECOMMENDED_VERSION"
  fi
  echo -e "   ${BLUE}Option 2:${NC} Visitez https://nodejs.org/ pour installer Node.js $REQUIRED_MAJOR LTS"
  echo ""
  echo -e "${YELLOW}📖 Voir docs/NODE-VERSION-REQUIREMENTS.md pour plus de détails${NC}"
  exit 1
fi

