#!/bin/bash
# Script pour configurer les fichiers .env dans tout le projet
# Usage: ./scripts/setup-env.sh [--force] [--interactive]
#
# Options:
#   --force        : Écrase les fichiers .env existants
#   --interactive  : Mode interactif pour définir les valeurs
#   --check        : Vérifie seulement si les fichiers .env existent

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
FORCE=false
INTERACTIVE=false
CHECK_ONLY=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --force)
      FORCE=true
      shift
      ;;
    --interactive)
      INTERACTIVE=true
      shift
      ;;
    --check)
      CHECK_ONLY=true
      shift
      ;;
    *)
      echo -e "${YELLOW}Option inconnue: $arg${NC}"
      shift
      ;;
  esac
done

# Se placer dans le répertoire racine
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Fichier source centralisé
ENV_EXAMPLE=".env.example"
ENV_ROOT=".env"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔧 Configuration des fichiers .env - Viridial              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier si .env.example existe
if [ ! -f "$ENV_EXAMPLE" ]; then
  echo -e "${RED}❌ Fichier $ENV_EXAMPLE non trouvé!${NC}"
  exit 1
fi

# Mode check seulement
if [ "$CHECK_ONLY" = true ]; then
  echo -e "${BLUE}🔍 Vérification des fichiers .env...${NC}"
  echo ""
  
      ENV_FILES=(
        ".env"
        "infrastructure/docker-compose/.env"
        "services/auth-service/.env"
        "services/property-service/.env"
        "services/geolocation-service/.env"
      )
  
  MISSING=0
  for file in "${ENV_FILES[@]}"; do
    if [ -f "$file" ]; then
      echo -e "${GREEN}✅ $file${NC}"
    else
      echo -e "${YELLOW}⚠️  $file (manquant)${NC}"
      MISSING=$((MISSING + 1))
    fi
  done
  
  echo ""
  if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les fichiers .env sont présents${NC}"
    exit 0
  else
    echo -e "${YELLOW}⚠️  $MISSING fichier(s) .env manquant(s)${NC}"
    echo "Exécutez: ./scripts/setup-env.sh pour créer les fichiers manquants"
    exit 1
  fi
fi

# Vérifier si .env existe déjà
if [ -f "$ENV_ROOT" ] && [ "$FORCE" != true ]; then
  echo -e "${YELLOW}⚠️  Le fichier $ENV_ROOT existe déjà${NC}"
  read -p "Voulez-vous l'écraser? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Annulé. Utilisez --force pour forcer l'écrasement."
    exit 0
  fi
  FORCE=true
fi

# Créer le fichier .env principal si nécessaires
if [ ! -f "$ENV_ROOT" ] || [ "$FORCE" = true ]; then
  echo -e "${BLUE}📝 Création du fichier .env principal...${NC}"
  cp "$ENV_EXAMPLE" "$ENV_ROOT"
  echo -e "${GREEN}✅ $ENV_ROOT créé${NC}"
  echo -e "${YELLOW}⚠️  IMPORTANT: Éditez $ENV_ROOT avec vos vraies valeurs avant d'utiliser les services${NC}"
  echo ""
else
  echo -e "${GREEN}✅ $ENV_ROOT existe déjà${NC}"
fi

# Charger les variables depuis .env principal
echo -e "${BLUE}📋 Chargement des variables depuis $ENV_ROOT...${NC}"
if [ ! -f "$ENV_ROOT" ]; then
  echo -e "${RED}❌ Fichier $ENV_ROOT non trouvé!${NC}"
  exit 1
fi

set -a
source "$ENV_ROOT" 2>/dev/null || {
  echo -e "${YELLOW}⚠️  Erreur lors du chargement de $ENV_ROOT${NC}"
  echo "Le fichier existe mais contient peut-être des erreurs de syntaxe."
  echo "Les fichiers dérivés seront créés avec des valeurs par défaut."
}
set +a
echo -e "${GREEN}✅ Variables chargées${NC}"

# Créer le fichier .env pour docker-compose
echo -e "${BLUE}📝 Création du fichier .env pour docker-compose...${NC}"
mkdir -p infrastructure/docker-compose

DOCKER_ENV="infrastructure/docker-compose/.env"
if [ -f "$DOCKER_ENV" ] && [ "$FORCE" != true ]; then
  echo -e "${YELLOW}⚠️  $DOCKER_ENV existe déjà (conservé)${NC}"
  read -p "Voulez-vous le régénérer depuis .env? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Conservé."
  else
    FORCE_DOCKER=true
  fi
else
  FORCE_DOCKER=true
fi

if [ "$FORCE_DOCKER" = true ]; then
  # Générer avec les valeurs réelles
  cat > "$DOCKER_ENV" <<EOF
# ========================================
# Docker Compose Environment Variables
# ========================================
# Généré automatiquement par setup-env.sh depuis .env
# Date: $(date)

# Database
POSTGRES_USER=${POSTGRES_USER:-viridial}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=${POSTGRES_DB:-viridial}
DATABASE_URL=${DATABASE_URL}

# SMTP
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_SECURE=${SMTP_SECURE}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
EMAIL_FROM=${EMAIL_FROM}
FROM_NAME=${FROM_NAME}

# Frontend URLs
FRONTEND_URL=${FRONTEND_URL}
FRONTEND_AUTH_API_URL=${FRONTEND_AUTH_API_URL:-https://viridial.com}
FRONTEND_PROPERTY_API_URL=${FRONTEND_PROPERTY_API_URL:-https://viridial.com}
FRONTEND_SEARCH_API_URL=${FRONTEND_SEARCH_API_URL:-https://viridial.com}

# Redis
REDIS_URL=${REDIS_URL}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}

# Google OAuth
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL}

# Geolocation Service
GEOCODING_PROVIDER=${GEOCODING_PROVIDER:-stub}
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY:-}
NOMINATIM_BASE_URL=${NOMINATIM_BASE_URL:-https://nominatim.openstreetmap.org}
GEOCODING_CACHE_TTL=${GEOCODING_CACHE_TTL:-86400}
GEOLOCATION_SERVICE_URL=${GEOLOCATION_SERVICE_URL:-http://geolocation-service:3002}

# Property Service (for Geolocation Service integration)
PROPERTY_SERVICE_URL=${PROPERTY_SERVICE_URL:-http://property-service:3001}
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
NOMINATIM_BASE_URL=${NOMINATIM_BASE_URL:-https://nominatim.openstreetmap.org}
GEOCODING_CACHE_TTL=${GEOCODING_CACHE_TTL:-86400}

# Meilisearch
MEILISEARCH_URL=${MEILISEARCH_URL:-http://meilisearch:7700}
MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
EOF
  echo -e "${GREEN}✅ $DOCKER_ENV créé/synchronisé${NC}"
fi

# Créer les fichiers .env pour les services individuels
echo -e "${BLUE}📝 Création des fichiers .env pour les services...${NC}"

# Auth Service
AUTH_ENV="services/auth-service/.env"
if [ ! -f "$AUTH_ENV" ] || [ "$FORCE" = true ]; then
  cat > "$AUTH_ENV" <<EOF
# ========================================
# Auth Service Environment Variables
# ========================================
# Généré automatiquement par setup-env.sh depuis .env
# Date: $(date)

NODE_ENV=${NODE_ENV:-production}
PORT=3000

# Database
DATABASE_URL=${DATABASE_URL}

# Redis
REDIS_URL=${REDIS_URL}

# SMTP
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_SECURE=${SMTP_SECURE}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
EMAIL_FROM=${EMAIL_FROM}
FROM_NAME=${FROM_NAME}

# Frontend
FRONTEND_URL=${FRONTEND_URL}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-3600}
JWT_REFRESH_EXPIRES_IN=${JWT_REFRESH_EXPIRES_IN:-604800}
JWT_ACCESS_EXPIRES_IN=${JWT_ACCESS_EXPIRES_IN:-15m}

# Google OAuth
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL}
EOF
  echo -e "${GREEN}✅ $AUTH_ENV créé/synchronisé${NC}"
fi

# Property Service
PROPERTY_ENV="services/property-service/.env"
if [ ! -f "$PROPERTY_ENV" ] || [ "$FORCE" = true ]; then
  cat > "$PROPERTY_ENV" <<EOF
# ========================================
# Property Service Environment Variables
# ========================================
# Généré automatiquement par setup-env.sh depuis .env
# Date: $(date)

NODE_ENV=${NODE_ENV:-production}
PORT=3001

# Database
DATABASE_URL=${DATABASE_URL}

# Frontend (CORS)
FRONTEND_URL=${FRONTEND_URL}

# JWT Authentication (must match auth-service JWT_ACCESS_SECRET)
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}

# Geolocation Service (for auto-geocoding)
GEOLOCATION_SERVICE_URL=${GEOLOCATION_SERVICE_URL:-http://geolocation-service:3002}

# Search Service (for Meilisearch indexing)
SEARCH_SERVICE_URL=${SEARCH_SERVICE_URL:-http://search-service:3003}
EOF
  echo -e "${GREEN}✅ $PROPERTY_ENV créé/synchronisé${NC}"
fi

# Geolocation Service
GEOLOCATION_ENV="services/geolocation-service/.env"
if [ ! -f "$GEOLOCATION_ENV" ] || [ "$FORCE" = true ]; then
  cat > "$GEOLOCATION_ENV" <<EOF
# ========================================
# Geolocation Service Environment Variables
# ========================================
# Généré automatiquement par setup-env.sh depuis .env
# Date: $(date)

NODE_ENV=${NODE_ENV:-production}
PORT=3002

# Redis (for caching geocode results)
REDIS_URL=${REDIS_URL}

# Geocoding Provider: 'google', 'nominatim', or 'stub' (default: stub)
GEOCODING_PROVIDER=${GEOCODING_PROVIDER:-stub}

# Google Maps API Key (required if provider is 'google')
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}

# Nominatim base URL (optional, defaults to official service)
NOMINATIM_BASE_URL=${NOMINATIM_BASE_URL:-https://nominatim.openstreetmap.org}

# Cache TTL in seconds (default: 86400 = 24 hours)
GEOCODING_CACHE_TTL=${GEOCODING_CACHE_TTL:-86400}

# Frontend (CORS)
FRONTEND_URL=${FRONTEND_URL}

# Property Service (for nearby search integration)
PROPERTY_SERVICE_URL=${PROPERTY_SERVICE_URL:-http://property-service:3001}
EOF
  echo -e "${GREEN}✅ $GEOLOCATION_ENV créé/synchronisé${NC}"
fi

# Search Service
SEARCH_ENV="services/search-service/.env"
if [ ! -f "$SEARCH_ENV" ] || [ "$FORCE" = true ]; then
  cat > "$SEARCH_ENV" <<EOF
# ========================================
# Search Service Environment Variables
# ========================================
# Généré automatiquement par setup-env.sh depuis .env
# Date: $(date)

NODE_ENV=${NODE_ENV:-production}
PORT=3003

# Meilisearch
MEILISEARCH_URL=${MEILISEARCH_URL:-http://meilisearch:7700}
MEILI_MASTER_KEY=${MEILI_MASTER_KEY}

# Frontend (CORS)
FRONTEND_URL=${FRONTEND_URL}
EOF
  echo -e "${GREEN}✅ $SEARCH_ENV créé/synchronisé${NC}"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Configuration terminée!                                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Prochaines étapes:${NC}"
echo ""
echo "1. Variables critiques à configurer dans .env (si pas encore fait):"
echo "   - DATABASE_URL (base de données PostgreSQL)"
echo "   - POSTGRES_PASSWORD (mot de passe PostgreSQL)"
echo "   - SMTP_PASS (mot de passe SMTP)"
echo "   - JWT_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_SECRET"
echo "     (générer avec: ${YELLOW}openssl rand -base64 32${NC})"
echo "   - MEILI_MASTER_KEY (pour Meilisearch)"
echo ""
echo "2. Pour resynchroniser tous les fichiers .env depuis .env principal:"
echo -e "   ${YELLOW}./scripts/setup-env.sh --force${NC}"
echo ""
echo "3. Pour vérifier les fichiers .env:"
echo -e "   ${YELLOW}./scripts/setup-env.sh --check${NC}"
echo ""
echo -e "${GREEN}✅ Structure créée:${NC}"
echo "   📄 .env (fichier principal - source de vérité)"
echo "   📄 infrastructure/docker-compose/.env"
echo "   📄 services/auth-service/.env"
echo "   📄 services/property-service/.env"
echo "   📄 services/geolocation-service/.env"
echo "   📄 services/search-service/.env"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "   - Ne commitez JAMAIS les fichiers .env dans Git!"
echo "   - Les fichiers .env sont déjà dans .gitignore"
echo "   - Les fichiers .env des services sont synchronisés depuis .env principal"
echo ""

