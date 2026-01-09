#!/bin/bash

# Script d'installation complète pour Viridial
# Usage: ./install.sh [--production]
#
# Options:
#   --production : Installation pour serveur VPS en production
#   --local      : Installation pour développement local (par défaut)

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Déterminer le mode d'installation
MODE="local"
if [[ "$1" == "--production" ]]; then
  MODE="production"
elif [[ "$1" == "--local" ]]; then
  MODE="local"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
cd "$PROJECT_ROOT"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  📦 Installation Viridial - Mode: $MODE${NC}                ║"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier les prérequis
echo -e "${BLUE}🔍 Vérification des prérequis...${NC}"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js n'est pas installé. Veuillez installer Node.js 18+${NC}"
  exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}❌ Node.js 18+ est requis. Version actuelle: $(node -v)${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Vérifier npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm n'est pas installé${NC}"
  exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Vérifier Docker (pour le mode local)
if [ "$MODE" == "local" ]; then
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé. Veuillez installer Docker Desktop${NC}"
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1)${NC}"
fi

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 1/5 : Configuration de l'environnement               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"

# Créer les fichiers .env si nécessaire
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    echo -e "${YELLOW}📝 Création du fichier .env depuis .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Éditez .env avec vos vraies valeurs${NC}"
  else
    echo -e "${YELLOW}⚠️  Aucun fichier .env.example trouvé${NC}"
  fi
else
  echo -e "${GREEN}✅ Fichier .env existe déjà${NC}"
fi

# Configurer les variables d'environnement pour docker-compose
if [ "$MODE" == "local" ] && [ -f ".env" ]; then
  mkdir -p infrastructure/docker-compose
  if [ ! -f "infrastructure/docker-compose/.env" ]; then
    echo -e "${YELLOW}📝 Configuration docker-compose/.env...${NC}"
    # Charger les variables depuis .env principal
    set -a
    source .env 2>/dev/null || true
    set +a
    
    # Générer le fichier .env pour docker-compose
    cat > infrastructure/docker-compose/.env <<EOF
# Généré automatiquement par install.sh
# Date: $(date)

POSTGRES_USER=\${POSTGRES_USER:-viridial}
POSTGRES_PASSWORD=\${POSTGRES_PASSWORD:-viridial_dev_password_2024}
POSTGRES_DB=\${POSTGRES_DB:-viridial}
DATABASE_URL=\${DATABASE_URL:-postgres://viridial:viridial_dev_password_2024@viridial-postgres:5432/viridial}

REDIS_URL=\${REDIS_URL:-redis://viridial-redis:6379}

MEILISEARCH_URL=\${MEILISEARCH_URL:-http://meilisearch:7700}
MEILI_MASTER_KEY=\${MEILI_MASTER_KEY:-masterKey_dev_local_12345678901234567890}

MINIO_ROOT_USER=\${MINIO_ROOT_USER:-minioadmin}
MINIO_ROOT_PASSWORD=\${MINIO_ROOT_PASSWORD:-minioadmin123}

FRONTEND_URL=\${FRONTEND_URL:-http://localhost:3000}

JWT_SECRET=\${JWT_SECRET:-jwt_secret_dev_local_minimum_32_characters_long}
JWT_REFRESH_SECRET=\${JWT_REFRESH_SECRET:-jwt_refresh_secret_dev_local_minimum_32_characters}
JWT_ACCESS_SECRET=\${JWT_ACCESS_SECRET:-jwt_access_secret_dev_local_minimum_32_characters_long}

SMTP_HOST=\${SMTP_HOST:-}
SMTP_PORT=\${SMTP_PORT:-}
SMTP_SECURE=\${SMTP_SECURE:-}
SMTP_USER=\${SMTP_USER:-}
SMTP_PASS=\${SMTP_PASS:-}
EMAIL_FROM=\${EMAIL_FROM:-}
FROM_NAME=\${FROM_NAME:-}

GOOGLE_CLIENT_ID=\${GOOGLE_CLIENT_ID:-}
GOOGLE_CLIENT_SECRET=\${GOOGLE_CLIENT_SECRET:-}
GOOGLE_CALLBACK_URL=\${GOOGLE_CALLBACK_URL:-}

GEOCODING_PROVIDER=\${GEOCODING_PROVIDER:-stub}
GOOGLE_MAPS_API_KEY=\${GOOGLE_MAPS_API_KEY:-}
NOMINATIM_BASE_URL=\${NOMINATIM_BASE_URL:-https://nominatim.openstreetmap.org}
GEOCODING_CACHE_TTL=\${GEOCODING_CACHE_TTL:-86400}
GEOLOCATION_SERVICE_URL=\${GEOLOCATION_SERVICE_URL:-http://geolocation-service:3002}
PROPERTY_SERVICE_URL=\${PROPERTY_SERVICE_URL:-http://property-service:3001}
SEARCH_SERVICE_URL=\${SEARCH_SERVICE_URL:-http://search-service:3003}
EOF
    echo -e "${GREEN}✅ Configuration docker-compose créée${NC}"
  fi
fi

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 2/5 : Installation des dépendances Frontend          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"

# Installer les dépendances frontend (avec SASS)
cd frontend/web

if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ package.json introuvable dans frontend/web${NC}"
  exit 1
fi

echo -e "${BLUE}📦 Installation des dépendances npm...${NC}"
npm install

echo -e "${BLUE}📦 Installation de SASS...${NC}"
npm install --save-dev sass

echo -e "${GREEN}✅ Dépendances frontend installées${NC}"

# Revenir à la racine
cd "$PROJECT_ROOT"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 3/5 : Installation des dépendances Backend           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"

# Installer les dépendances pour chaque service
SERVICES=("auth-service" "property-service" "geolocation-service" "search-service")

for service in "${SERVICES[@]}"; do
  if [ -d "services/$service" ] && [ -f "services/$service/package.json" ]; then
    echo -e "${BLUE}📦 Installation $service...${NC}"
    cd "services/$service"
    npm install
    cd "$PROJECT_ROOT"
    echo -e "${GREEN}✅ $service installé${NC}"
  fi
done

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Étape 4/5 : Configuration SASS                             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"

# Vérifier que SASS est configuré dans package.json
cd frontend/web
if grep -q "sass" package.json; then
  echo -e "${GREEN}✅ SASS est configuré dans package.json${NC}"
else
  echo -e "${YELLOW}⚠️  SASS n'est pas dans package.json, mais installé${NC}"
fi

# Vérifier postcss.config.js pour SASS
if [ -f "postcss.config.js" ]; then
  echo -e "${GREEN}✅ PostCSS configuré${NC}"
else
  echo -e "${YELLOW}⚠️  postcss.config.js manquant${NC}"
fi

cd "$PROJECT_ROOT"

echo ""
if [ "$MODE" == "local" ]; then
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Étape 5/5 : Configuration Docker (Local)                  ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
  
  # Créer le réseau Docker
  if ! docker network ls | grep -q viridial-network; then
    echo -e "${BLUE}🔗 Création du réseau Docker...${NC}"
    docker network create viridial-network
    echo -e "${GREEN}✅ Réseau viridial-network créé${NC}"
  else
    echo -e "${GREEN}✅ Réseau viridial-network existe déjà${NC}"
  fi
else
  echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Étape 5/5 : Configuration Production                      ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
  
  # Pour la production, vérifier que les variables d'environnement sont configurées
  if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Fichier .env présent pour production${NC}"
    echo -e "${YELLOW}⚠️  Assurez-vous que toutes les variables sont configurées correctement${NC}"
  fi
  
  # Installer SASS globalement si nécessaire (pour la compilation en production)
  if ! command -v sass &> /dev/null; then
    echo -e "${BLUE}📦 Installation de SASS globalement...${NC}"
    npm install -g sass
    echo -e "${GREEN}✅ SASS installé globalement${NC}"
  else
    echo -e "${GREEN}✅ SASS est déjà installé globalement${NC}"
  fi
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Installation terminée avec succès!                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$MODE" == "local" ]; then
  echo -e "${BLUE}📋 Prochaines étapes (développement local):${NC}"
  echo ""
  echo "1. Éditez .env avec vos valeurs si nécessaire"
  echo "2. Démarrez les services:"
  echo -e "   ${YELLOW}./start.sh${NC}"
  echo ""
  echo "3. Pour arrêter les services:"
  echo -e "   ${YELLOW}./stop.sh${NC}"
else
  echo -e "${BLUE}📋 Prochaines étapes (production VPS):${NC}"
  echo ""
  echo "1. Vérifiez que .env contient toutes les variables de production"
  echo "2. Configurez votre serveur web (Nginx/Apache) pour servir le frontend"
  echo "3. Configurez PM2 ou systemd pour les services backend"
  echo "4. Démarrez les services:"
  echo -e "   ${YELLOW}./start.sh --production${NC}"
  echo ""
  echo "5. Pour arrêter les services:"
  echo -e "   ${YELLOW}./stop.sh${NC}"
fi

echo ""
echo -e "${YELLOW}💡 SASS est maintenant disponible:${NC}"
echo "   - Fichiers .scss/.sass peuvent être importés directement dans Next.js"
echo "   - Compilation automatique en développement et production"
echo ""

