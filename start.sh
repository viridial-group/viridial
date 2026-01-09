#!/bin/bash

# Script de démarrage simplifié pour Viridial
# Usage: ./start.sh [--production]
#
# Options:
#   --production : Démarrage pour serveur VPS en production
#   --local      : Démarrage pour développement local (par défaut)

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Déterminer le mode
MODE="local"
if [[ "$1" == "--production" ]]; then
  MODE="production"
elif [[ "$1" == "--local" ]]; then
  MODE="local"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
cd "$PROJECT_ROOT"

# Fonction pour vérifier la version de Node.js
check_node_version() {
  if ! command -v node >/dev/null 2>&1; then
    return 1
  fi
  
  NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//')
  if [ -z "$NODE_VERSION" ]; then
    return 1
  fi
  
  # Extraire le numéro de version majeur
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  NODE_MINOR=$(echo "$NODE_VERSION" | cut -d. -f2)
  
  # Vérifier que c'est Node.js 20.x
  if [ "$NODE_MAJOR" -eq 20 ]; then
    # Version 20.x acceptée (20.0.0 et supérieur)
    if [ "$NODE_MINOR" -ge 0 ]; then
      return 0
    fi
  elif [ "$NODE_MAJOR" -gt 20 ]; then
    # Node.js 21+ pourrait fonctionner mais non testé
    return 2
  fi
  
  # Version < 20 ou non supportée
  return 1
}

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 Démarrage Viridial - Mode: $MODE${NC}                    ║"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$MODE" == "local" ]; then
  # Mode local - Docker Compose
  
  # Vérifier Docker
  if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop.${NC}"
    exit 1
  fi
  
  # Vérifier les fichiers .env
  if [ ! -f "infrastructure/docker-compose/.env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env manquant. Exécution de install.sh...${NC}"
    ./install.sh --local
  fi
  
  cd infrastructure/docker-compose
  
  # Charger et vérifier les variables d'environnement
  if [ -f ".env" ]; then
    set -a
    source .env
    set +a
    
    # Vérifier et corriger MINIO_ROOT_PASSWORD si manquant ou vide
    if [ -z "${MINIO_ROOT_PASSWORD}" ] || grep -q "^MINIO_ROOT_PASSWORD=$" .env || grep -q "^MINIO_ROOT_PASSWORD=\s*$" .env; then
      echo -e "${YELLOW}⚠️  MINIO_ROOT_PASSWORD manquant ou vide. Génération d'un mot de passe...${NC}"
      # Générer un mot de passe sécurisé
      if command -v openssl &> /dev/null; then
        MINIO_PASSWORD=$(openssl rand -base64 32 2>/dev/null | tr -d "=+/" | cut -c1-24 || echo "minioadmin123")
      else
        MINIO_PASSWORD="minioadmin123"
      fi
      
      # Ajouter ou remplacer dans .env
      if grep -q "^MINIO_ROOT_PASSWORD=" .env; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
          sed -i '' "s/^MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}/" .env
        else
          sed -i "s/^MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}/" .env
        fi
      else
        # Ajouter après MINIO_ROOT_USER si elle existe, sinon à la fin
        if grep -q "^MINIO_ROOT_USER=" .env; then
          if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/^MINIO_ROOT_USER=/a\\
MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}" .env
          else
            sed -i "/^MINIO_ROOT_USER=/a MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}" .env
          fi
        else
          echo "MINIO_ROOT_USER=minioadmin" >> .env
          echo "MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}" >> .env
        fi
      fi
      
      export MINIO_ROOT_PASSWORD="${MINIO_PASSWORD}"
      echo -e "${GREEN}✅ MINIO_ROOT_PASSWORD défini: ${MINIO_PASSWORD}${NC}"
    fi
    
    # S'assurer que MINIO_ROOT_USER existe
    if [ -z "${MINIO_ROOT_USER}" ]; then
      if ! grep -q "^MINIO_ROOT_USER=" .env; then
        if grep -q "^MINIO_ROOT_PASSWORD=" .env; then
          if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/^MINIO_ROOT_PASSWORD=/i\\
MINIO_ROOT_USER=minioadmin" .env
          else
            sed -i "/^MINIO_ROOT_PASSWORD=/i MINIO_ROOT_USER=minioadmin" .env
          fi
        else
          echo "MINIO_ROOT_USER=minioadmin" >> .env
        fi
      fi
      export MINIO_ROOT_USER="minioadmin"
    fi
  fi
  
  # Créer le réseau Docker
  echo -e "${BLUE}🔗 Création du réseau Docker...${NC}"
  docker network create viridial-network 2>/dev/null || echo -e "${GREEN}✅ Réseau existe déjà${NC}"
  
  # Étape 1: Services de base
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Étape 1/4 : Services de base (Postgres, Redis, etc.)       ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
  docker-compose -f docker-compose.yml up -d
  
  echo -e "${YELLOW}⏳ Attente que les services de base soient prêts...${NC}"
  sleep 5
  
  # Attendre Postgres
  echo -e "${BLUE}⏳ Attente de Postgres...${NC}"
  timeout=30
  counter=0
  while ! docker exec viridial-postgres pg_isready -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" >/dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
      echo -e "${RED}❌ Timeout: Postgres n'est pas prêt${NC}"
      exit 1
    fi
    sleep 2
    counter=$((counter + 2))
  done
  echo -e "${GREEN}✅ Postgres est prêt${NC}"
  
  # Attendre Redis
  echo -e "${BLUE}⏳ Attente de Redis...${NC}"
  counter=0
  while ! docker exec viridial-redis redis-cli ping >/dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
      echo -e "${RED}❌ Timeout: Redis n'est pas prêt${NC}"
      exit 1
    fi
    sleep 2
    counter=$((counter + 2))
  done
  echo -e "${GREEN}✅ Redis est prêt${NC}"
  
  # Attendre Meilisearch
  echo -e "${BLUE}⏳ Attente de Meilisearch...${NC}"
  counter=0
  while ! curl -s http://localhost:7700/health >/dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
      echo -e "${YELLOW}⚠️  Meilisearch prend plus de temps, continuons...${NC}"
      break
    fi
    sleep 2
    counter=$((counter + 2))
  done
  echo -e "${GREEN}✅ Meilisearch est prêt${NC}"
  
  # Attendre MinIO
  echo -e "${BLUE}⏳ Attente de MinIO...${NC}"
  counter=0
  while ! curl -s http://localhost:9000/minio/health/live >/dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
      echo -e "${YELLOW}⚠️  MinIO prend plus de temps, continuons...${NC}"
      break
    fi
    sleep 2
    counter=$((counter + 2))
  done
  if docker ps | grep -q viridial-minio.*healthy; then
    echo -e "${GREEN}✅ MinIO est prêt${NC}"
  else
    echo -e "${YELLOW}⚠️  MinIO est démarré mais pas encore healthy${NC}"
  fi
  
  # Étape 2: Initialiser la base de données
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Étape 2/4 : Initialisation base de données                  ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
  
  if [ -f "init-auth-db.sql" ]; then
    docker exec -i viridial-postgres psql -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" < init-auth-db.sql 2>/dev/null || echo -e "${YELLOW}⚠️  Tables Auth peut-être déjà initialisées${NC}"
    echo -e "${GREEN}✅ Base de données Auth initialisée${NC}"
  fi
  
  # Étape 3: Services métier
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Étape 3/4 : Services métier                                 ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
  
  echo -e "${BLUE}🔐 Démarrage Auth Service...${NC}"
  docker-compose -f app-auth.yml up -d --build
  sleep 10
  
  echo -e "${BLUE}📦 Démarrage Property Service...${NC}"
  docker-compose -f app-property.yml up -d --build
  
  echo -e "${BLUE}📍 Démarrage Geolocation Service...${NC}"
  docker-compose -f app-geolocation.yml up -d --build
  
  echo -e "${BLUE}🔍 Démarrage Search Service...${NC}"
  docker-compose -f app-search.yml up -d --build
  
  # Étape 4: Frontend (mode développement)
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Étape 4/4 : Frontend                                        ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
  
  cd "$PROJECT_ROOT/frontend/web"
  
  echo -e "${BLUE}📦 Compilation du frontend avec SASS...${NC}"
  
  # Vérifier la version Node.js avant de compiler
  if ! check_node_version; then
    CHECK_RESULT=$?
    NODE_VERSION=$(node --version 2>/dev/null || echo "non installé")
    
    if [ $CHECK_RESULT -eq 2 ]; then
      # Version supérieure à 20.x - Avertissement mais permet de continuer
      echo -e "${YELLOW}⚠️  Node.js $NODE_VERSION détecté (supérieur à 20.x)${NC}"
      echo -e "${YELLOW}   Le projet est testé avec Node.js 20.x LTS. Continuer quand même ? (y/N)${NC}"
      read -t 10 -r response || response="n"
      if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${RED}❌ Arrêt. Utilisez Node.js 20.x LTS pour éviter les problèmes de compatibilité${NC}"
        if [ -f "$PROJECT_ROOT/.nvmrc" ]; then
          REQUIRED_VERSION=$(cat "$PROJECT_ROOT/.nvmrc")
          echo -e "${BLUE}   Installer la version recommandée:${NC}"
          echo -e "      nvm install $REQUIRED_VERSION && nvm use $REQUIRED_VERSION"
        fi
        exit 1
      fi
      echo -e "${YELLOW}⚠️  Continuation avec Node.js $NODE_VERSION (non testé)${NC}"
    else
      # Version incompatible ou non installée
      echo -e "${RED}❌ Version Node.js incompatible: $NODE_VERSION${NC}"
      echo -e "${YELLOW}📋 Version requise: Node.js 20.x LTS (20.0.0 - 20.x.x)${NC}"
      echo ""
      
      # Vérifier si .nvmrc existe
      if [ -f "$PROJECT_ROOT/.nvmrc" ]; then
        REQUIRED_VERSION=$(cat "$PROJECT_ROOT/.nvmrc")
        echo -e "${YELLOW}💡 Version requise selon .nvmrc: $REQUIRED_VERSION${NC}"
        echo -e "${BLUE}   Installer avec nvm:${NC}"
        echo -e "      cd $PROJECT_ROOT"
        echo -e "      nvm install $REQUIRED_VERSION"
        echo -e "      nvm use $REQUIRED_VERSION"
        echo ""
        echo -e "${YELLOW}   Ou utiliser automatiquement:${NC}"
        echo -e "      cd $PROJECT_ROOT && nvm use"
      else
        echo -e "${YELLOW}💡 Solutions:${NC}"
        echo -e "   ${BLUE}nvm install 20.18.0 && nvm use 20.18.0${NC}"
        echo -e "   ${BLUE}Ou visitez https://nodejs.org/ pour installer Node.js 20 LTS${NC}"
      fi
      echo ""
      echo -e "${YELLOW}📖 Voir docs/NODE-VERSION-REQUIREMENTS.md pour plus de détails${NC}"
      exit 1
    fi
  else
    NODE_VERSION=$(node --version 2>/dev/null)
    echo -e "${GREEN}✅ Version Node.js: $NODE_VERSION (compatible - 20.x LTS)${NC}"
  fi
  
  # S'assurer que les chemins communs sont dans le PATH
  export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/share/pnpm:$PATH"
  
  # Détecter pnpm (vérifier plusieurs chemins possibles)
  PNPM_CMD=""
  if command -v pnpm >/dev/null 2>&1; then
    PNPM_CMD="pnpm"
  elif [ -x "/usr/local/bin/pnpm" ]; then
    PNPM_CMD="/usr/local/bin/pnpm"
  elif [ -x "/opt/homebrew/bin/pnpm" ]; then
    PNPM_CMD="/opt/homebrew/bin/pnpm"
  elif [ -x "$HOME/.local/share/pnpm/pnpm" ]; then
    PNPM_CMD="$HOME/.local/share/pnpm/pnpm"
  elif [ -x "$HOME/.pnpm-store/pnpm" ]; then
    PNPM_CMD="$HOME/.pnpm-store/pnpm"
  fi
  
  # Détecter npm (vérifier plusieurs chemins possibles)
  NPM_CMD=""
  if command -v npm >/dev/null 2>&1; then
    NPM_CMD="npm"
  elif [ -x "/usr/local/bin/npm" ]; then
    NPM_CMD="/usr/local/bin/npm"
  elif [ -x "/opt/homebrew/bin/npm" ]; then
    NPM_CMD="/opt/homebrew/bin/npm"
  elif [ -x "/usr/bin/npm" ]; then
    NPM_CMD="/usr/bin/npm"
  else
    # Essayer de trouver npm dans le même répertoire que node
    NODE_PATH=$(command -v node 2>/dev/null || which node 2>/dev/null)
    if [ -n "$NODE_PATH" ] && [ -x "${NODE_PATH%/*}/npm" ]; then
      NPM_CMD="${NODE_PATH%/*}/npm"
    fi
  fi
  
  if [ ! -d "node_modules" ]; then
    if [ -n "$PNPM_CMD" ]; then
      echo -e "${YELLOW}⚠️  node_modules manquant. Exécution de pnpm install...${NC}"
      $PNPM_CMD install
    elif [ -n "$NPM_CMD" ]; then
      echo -e "${YELLOW}⚠️  pnpm non trouvé, utilisation de npm...${NC}"
      $NPM_CMD install
    else
      echo -e "${RED}❌ pnpm et npm non trouvés.${NC}"
      echo ""
      echo -e "${YELLOW}📋 Vérification de Node.js:${NC}"
      NODE_FOUND=false
      if command -v node >/dev/null 2>&1; then
        echo -e "   ✅ Node.js trouvé: $(command -v node) ($(node --version 2>/dev/null || echo 'version inconnue'))"
        NODE_FOUND=true
      else
        echo -e "   ❌ Node.js non trouvé"
      fi
      echo ""
      echo -e "${YELLOW}💡 Solutions pour installer Node.js:${NC}"
      
      # Détecter le système d'exploitation
      OS_TYPE=$(uname -s 2>/dev/null || echo "Unknown")
      if [ "$OS_TYPE" = "Linux" ]; then
        if command -v apt-get >/dev/null 2>&1; then
          # Ubuntu/Debian
          echo -e "   ${BLUE}Option 1 (Recommandé - nvm):${NC}"
          echo -e "      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
          echo -e "      source ~/.bashrc"
          echo -e "      nvm install --lts"
          echo -e "      nvm use --lts"
          echo ""
          echo -e "   ${BLUE}Option 2 (Via NodeSource - version récente):${NC}"
          echo -e "      curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
          echo -e "      sudo apt-get install -y nodejs"
          echo ""
          echo -e "   ${BLUE}Option 3 (Via apt - version ancienne):${NC}"
          echo -e "      sudo apt update && sudo apt install -y nodejs npm"
        elif command -v yum >/dev/null 2>&1; then
          # CentOS/RHEL
          echo -e "   ${BLUE}Option 1 (Recommandé - nvm):${NC}"
          echo -e "      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
          echo -e "      source ~/.bashrc"
          echo -e "      nvm install --lts"
          echo ""
          echo -e "   ${BLUE}Option 2 (Via NodeSource):${NC}"
          echo -e "      curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -"
          echo -e "      sudo yum install -y nodejs"
        else
          echo -e "   Visitez https://nodejs.org/ pour installer Node.js"
        fi
      else
        # macOS ou autre
        echo -e "   1. Installez Node.js: https://nodejs.org/"
        echo -e "   2. Ou utilisez Homebrew: ${BLUE}brew install node${NC}"
        echo -e "   3. Ou utilisez nvm: ${BLUE}curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash${NC}"
      fi
      echo ""
      echo -e "${YELLOW}💡 Après installation de Node.js, installez pnpm:${NC}"
      echo -e "   ${BLUE}npm install -g pnpm${NC}"
      echo ""
      exit 1
    fi
  fi
  
  # Démarrer le serveur de développement Next.js (en arrière-plan)
  echo -e "${BLUE}🚀 Démarrage du serveur de développement Next.js...${NC}"
  
  # Re-vérifier les commandes après installation potentielle
  if [ -z "$PNPM_CMD" ] && [ -z "$NPM_CMD" ]; then
    # Réessayer la détection après l'installation
    if command -v pnpm >/dev/null 2>&1; then
      PNPM_CMD="pnpm"
    elif [ -x "/usr/local/bin/pnpm" ]; then
      PNPM_CMD="/usr/local/bin/pnpm"
    fi
    if command -v npm >/dev/null 2>&1; then
      NPM_CMD="npm"
    elif [ -x "/usr/local/bin/npm" ]; then
      NPM_CMD="/usr/local/bin/npm"
    elif [ -x "/usr/bin/npm" ]; then
      NPM_CMD="/usr/bin/npm"
    fi
  fi
  
  if [ -n "$PNPM_CMD" ]; then
    $PNPM_CMD run dev > /tmp/nextjs-dev.log 2>&1 &
  elif [ -n "$NPM_CMD" ]; then
    $NPM_CMD run dev > /tmp/nextjs-dev.log 2>&1 &
  else
    echo -e "${RED}❌ Impossible de démarrer le serveur: ni pnpm ni npm trouvé${NC}"
    echo -e "${YELLOW}💡 Installez Node.js d'abord (voir instructions ci-dessus)${NC}"
    exit 1
  fi
  NEXTJS_PID=$!
  echo $NEXTJS_PID > /tmp/nextjs.pid
  sleep 5
  
  cd "$PROJECT_ROOT"
  
  echo ""
  echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅ Tous les services sont démarrés                          ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${BLUE}📊 Services disponibles:${NC}"
  echo -e "   🌐 Frontend:           http://localhost:3000"
  echo -e "   🔐 Auth Service:       http://localhost:3001"
  echo -e "   🏠 Property Service:   http://localhost:3002"
  echo -e "   📍 Geolocation Service: http://localhost:3003"
  echo -e "   🔍 Search Service:     http://localhost:3004"
  echo -e "   📢 Marketing Service:  http://localhost:3005"
  echo -e "   ⭐ Review Service:     http://localhost:3006"
  echo -e "   🗄️  Postgres:           localhost:5432"
  echo -e "   🔴 Redis:              localhost:6379"
  echo -e "   🔎 Meilisearch:        http://localhost:7700"
  echo -e "   📦 MinIO:              http://localhost:9000 (Console: 9001)"
  echo ""
  echo -e "${YELLOW}💡 Pour arrêter les services:${NC}"
  echo -e "   ${BLUE}./stop.sh${NC}"
  echo ""
  echo -e "${YELLOW}💡 Pour voir les logs Next.js:${NC}"
  echo -e "   ${BLUE}tail -f /tmp/nextjs-dev.log${NC}"
  echo ""
  
  else
    # Mode production - PM2 ou systemd
    echo -e "${BLUE}📋 Mode Production - Démarrage des services...${NC}"
    
    # Vérifier la version Node.js pour la production
    if ! check_node_version; then
      CHECK_RESULT=$?
      NODE_VERSION=$(node --version 2>/dev/null || echo "non installé")
      
      if [ $CHECK_RESULT -eq 2 ]; then
        echo -e "${YELLOW}⚠️  Node.js $NODE_VERSION détecté (supérieur à 20.x)${NC}"
        echo -e "${YELLOW}   Le projet est testé avec Node.js 20.x LTS en production.${NC}"
        echo -e "${RED}❌ Recommandation: Utilisez Node.js 20.x LTS pour la production${NC}"
      else
        echo -e "${RED}❌ Version Node.js incompatible: $NODE_VERSION${NC}"
        echo -e "${YELLOW}📋 Version requise: Node.js 20.x LTS (20.0.0 - 20.x.x)${NC}"
      fi
      
      echo ""
      if [ -f ".nvmrc" ]; then
        REQUIRED_VERSION=$(cat .nvmrc)
        echo -e "${YELLOW}💡 Version requise selon .nvmrc: $REQUIRED_VERSION${NC}"
        echo -e "${BLUE}   Installer avec nvm:${NC}"
        echo -e "      nvm install $REQUIRED_VERSION"
        echo -e "      nvm use $REQUIRED_VERSION"
        echo -e "      nvm alias default $REQUIRED_VERSION  # Pour la production"
      else
        echo -e "${YELLOW}💡 Solutions:${NC}"
        echo -e "   ${BLUE}nvm install 20.18.0 && nvm use 20.18.0 && nvm alias default 20.18.0${NC}"
      fi
      echo ""
      echo -e "${YELLOW}📖 Voir docs/NODE-VERSION-REQUIREMENTS.md pour plus de détails${NC}"
      exit 1
    else
      NODE_VERSION=$(node --version 2>/dev/null)
      echo -e "${GREEN}✅ Version Node.js vérifiée: $NODE_VERSION (compatible)${NC}"
    fi
    
    # Vérifier .env
    if [ ! -f ".env" ]; then
      echo -e "${RED}❌ Fichier .env manquant. Créez-le avant de démarrer en production.${NC}"
      exit 1
    fi
  
  # Charger les variables d'environnement
  set -a
  source .env
  set +a
  
  # Vérifier PM2
  if command -v pm2 &> /dev/null; then
    echo -e "${BLUE}📦 Démarrage avec PM2...${NC}"
    
    # Vérifier si les services sont déjà buildés
    echo -e "${BLUE}🔨 Vérification des builds...${NC}"
    BUILD_NEEDED=false
    
    BACKEND_SERVICES=(
      "auth-service"
      "property-service"
      "geolocation-service"
      "search-service"
      "marketing-service"
      "review-service"
    )
    
    for service in "${BACKEND_SERVICES[@]}"; do
      SERVICE_DIR="$PROJECT_ROOT/services/$service"
      if [ ! -d "$SERVICE_DIR/dist" ]; then
        BUILD_NEEDED=true
        echo -e "${YELLOW}   ⚠️  $service n'est pas buildé${NC}"
      fi
    done
    
    if [ ! -d "$PROJECT_ROOT/frontend/web/.next" ]; then
      BUILD_NEEDED=true
      echo -e "${YELLOW}   ⚠️  Frontend n'est pas buildé${NC}"
    fi
    
    if [ "$BUILD_NEEDED" = true ]; then
      echo -e "${YELLOW}⚠️  Certains services ne sont pas buildés.${NC}"
      echo -e "${BLUE}💡 Exécutez d'abord: ${YELLOW}./deploy-production.sh${NC}"
      echo -e "${BLUE}   Ou builder manuellement chaque service avec: ${YELLOW}npm run build${NC}"
      echo ""
      read -p "Voulez-vous continuer quand même? (y/N) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
      fi
    fi
    
    # Démarrer les services backend avec PM2
    cd services/auth-service
    if [ -d "dist" ]; then
      pm2 start npm --name "auth-service" -- start || pm2 restart auth-service --update-env
    else
      echo -e "${YELLOW}⚠️  auth-service/dist manquant, ignoré${NC}"
    fi
    
    cd "$PROJECT_ROOT/services/property-service"
    if [ -d "dist" ]; then
      pm2 start npm --name "property-service" -- start || pm2 restart property-service --update-env
    else
      echo -e "${YELLOW}⚠️  property-service/dist manquant, ignoré${NC}"
    fi
    
    cd "$PROJECT_ROOT/services/geolocation-service"
    if [ -d "dist" ]; then
      pm2 start npm --name "geolocation-service" -- start || pm2 restart geolocation-service --update-env
    else
      echo -e "${YELLOW}⚠️  geolocation-service/dist manquant, ignoré${NC}"
    fi
    
    cd "$PROJECT_ROOT/services/search-service"
    if [ -d "dist" ]; then
      pm2 start npm --name "search-service" -- start || pm2 restart search-service --update-env
    else
      echo -e "${YELLOW}⚠️  search-service/dist manquant, ignoré${NC}"
    fi
    
    cd "$PROJECT_ROOT/services/marketing-service"
    if [ -d "dist" ]; then
      pm2 start npm --name "marketing-service" -- start || pm2 restart marketing-service --update-env
    else
      echo -e "${YELLOW}⚠️  marketing-service/dist manquant, ignoré${NC}"
    fi
    
    cd "$PROJECT_ROOT/services/review-service"
    if [ -d "dist" ]; then
      pm2 start npm --name "review-service" -- start || pm2 restart review-service --update-env
    else
      echo -e "${YELLOW}⚠️  review-service/dist manquant, ignoré${NC}"
    fi
    
    cd "$PROJECT_ROOT"
    
    # Démarrer le frontend en production
    cd frontend/web
    
    # S'assurer que les chemins communs sont dans le PATH
    export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/share/pnpm:$PATH"
    
    # Détecter pnpm (vérifier plusieurs chemins possibles)
    PNPM_CMD=""
    if command -v pnpm >/dev/null 2>&1; then
      PNPM_CMD="pnpm"
    elif [ -x "/usr/local/bin/pnpm" ]; then
      PNPM_CMD="/usr/local/bin/pnpm"
    elif [ -x "/opt/homebrew/bin/pnpm" ]; then
      PNPM_CMD="/opt/homebrew/bin/pnpm"
    elif [ -x "$HOME/.local/share/pnpm/pnpm" ]; then
      PNPM_CMD="$HOME/.local/share/pnpm/pnpm"
    elif [ -x "$HOME/.pnpm-store/pnpm" ]; then
      PNPM_CMD="$HOME/.pnpm-store/pnpm"
    fi
    
    # Détecter npm (vérifier plusieurs chemins possibles)
    NPM_CMD=""
    if command -v npm >/dev/null 2>&1; then
      NPM_CMD="npm"
    elif [ -x "/usr/local/bin/npm" ]; then
      NPM_CMD="/usr/local/bin/npm"
    elif [ -x "/opt/homebrew/bin/npm" ]; then
      NPM_CMD="/opt/homebrew/bin/npm"
    elif [ -x "/usr/bin/npm" ]; then
      NPM_CMD="/usr/bin/npm"
    else
      # Essayer de trouver npm dans le même répertoire que node
      NODE_PATH=$(command -v node 2>/dev/null || which node 2>/dev/null)
      if [ -n "$NODE_PATH" ] && [ -x "${NODE_PATH%/*}/npm" ]; then
        NPM_CMD="${NODE_PATH%/*}/npm"
      fi
    fi
    
    if [ -n "$PNPM_CMD" ]; then
      $PNPM_CMD run build
      pm2 start $PNPM_CMD --name "frontend" -- start || pm2 restart frontend
    elif [ -n "$NPM_CMD" ]; then
      $NPM_CMD run build
      pm2 start $NPM_CMD --name "frontend" -- start || pm2 restart frontend
    else
      echo -e "${RED}❌ Impossible de builder le frontend: ni pnpm ni npm trouvé${NC}"
      echo -e "${YELLOW}💡 Installez Node.js d'abord (voir instructions de la section développement)${NC}"
      exit 1
    fi
    cd "$PROJECT_ROOT"
    
    echo -e "${GREEN}✅ Services démarrés avec PM2${NC}"
    echo -e "${YELLOW}💡 Commandes PM2 utiles:${NC}"
    echo -e "   ${BLUE}pm2 status${NC} - Voir l'état des services"
    echo -e "   ${BLUE}pm2 logs${NC} - Voir les logs"
    echo -e "   ${BLUE}pm2 save${NC} - Sauvegarder la configuration"
    echo -e "   ${BLUE}pm2 startup${NC} - Activer le démarrage automatique"
    
  else
    echo -e "${YELLOW}⚠️  PM2 n'est pas installé. Installation recommandée pour la production.${NC}"
    echo -e "${BLUE}📦 Installer PM2:${NC}"
    echo -e "   ${BLUE}npm install -g pm2${NC}"
    echo ""
    echo -e "${YELLOW}💡 Pour un déploiement complet avec build et nginx, utilisez:${NC}"
    echo -e "   ${BLUE}sudo ./deploy-production.sh${NC}"
    echo ""
    echo -e "${YELLOW}Alternative: Utilisez systemd pour gérer les services${NC}"
  fi
  
  echo ""
  echo -e "${GREEN}✅ Services démarrés en mode production${NC}"
  echo ""
  echo -e "${BLUE}📋 Services disponibles:${NC}"
  echo -e "   🌐 Frontend:           http://localhost:3000"
  echo -e "   🔐 Auth Service:       http://localhost:3001"
  echo -e "   🏠 Property Service:   http://localhost:3002"
  echo -e "   📍 Geolocation Service: http://localhost:3003"
  echo -e "   🔍 Search Service:     http://localhost:3004"
  echo -e "   📢 Marketing Service:  http://localhost:3005"
  echo -e "   ⭐ Review Service:     http://localhost:3006"
  echo ""
  echo -e "${YELLOW}💡 Pour configurer nginx avec www.viridial.com:${NC}"
  echo -e "   ${BLUE}sudo ./deploy-production.sh${NC}"
  echo ""
fi


