#!/bin/bash

# Script pour corriger la configuration MinIO dans .env
# Usage: ./fix-minio-env.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Correction de la configuration MinIO...${NC}"

# Vérifier si .env existe
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠️  Fichier .env n'existe pas. Création...${NC}"
  # Générer un mot de passe sécurisé
  MINIO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-24)
  
  cat > .env <<EOF
# Configuration générée automatiquement
POSTGRES_USER=viridial
POSTGRES_PASSWORD=viridial_dev_password_2024
POSTGRES_DB=viridial
DATABASE_URL=postgres://viridial:viridial_dev_password_2024@viridial-postgres:5432/viridial

REDIS_URL=redis://viridial-redis:6379

MEILISEARCH_URL=http://meilisearch:7700
MEILI_MASTER_KEY=masterKey_dev_local_12345678901234567890

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}

FRONTEND_URL=http://localhost:3000

JWT_SECRET=jwt_secret_dev_local_minimum_32_characters_long
JWT_REFRESH_SECRET=jwt_refresh_secret_dev_local_minimum_32_characters
JWT_ACCESS_SECRET=jwt_access_secret_dev_local_minimum_32_characters_long
EOF
  echo -e "${GREEN}✅ Fichier .env créé avec MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}${NC}"
else
  # Vérifier si MINIO_ROOT_PASSWORD est défini et non vide
  if ! grep -q "^MINIO_ROOT_PASSWORD=" .env || grep -q "^MINIO_ROOT_PASSWORD=$" .env || grep -q "^MINIO_ROOT_PASSWORD=\s*$" .env; then
    echo -e "${YELLOW}⚠️  MINIO_ROOT_PASSWORD manquant ou vide. Correction...${NC}"
    
    # Générer un mot de passe sécurisé
    MINIO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-24)
    
    # Si la ligne existe mais est vide, la remplacer
    if grep -q "^MINIO_ROOT_PASSWORD=" .env; then
      # Remplacer la ligne existante
      if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}/" .env
      else
        # Linux
        sed -i "s/^MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}/" .env
      fi
    else
      # Ajouter après MINIO_ROOT_USER si elle existe, sinon à la fin
      if grep -q "^MINIO_ROOT_USER=" .env; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
          # macOS
          sed -i '' "/^MINIO_ROOT_USER=/a\\
MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}" .env
        else
          # Linux
          sed -i "/^MINIO_ROOT_USER=/a MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}" .env
        fi
      else
        # Ajouter à la fin du fichier
        echo "" >> .env
        echo "MINIO_ROOT_USER=minioadmin" >> .env
        echo "MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}" >> .env
      fi
    fi
    
    echo -e "${GREEN}✅ MINIO_ROOT_PASSWORD défini: ${MINIO_PASSWORD}${NC}"
  else
    # Vérifier que la valeur n'est pas juste des espaces
    PASSWORD_VALUE=$(grep "^MINIO_ROOT_PASSWORD=" .env | cut -d'=' -f2- | tr -d '[:space:]')
    if [ -z "$PASSWORD_VALUE" ]; then
      echo -e "${YELLOW}⚠️  MINIO_ROOT_PASSWORD est vide. Correction...${NC}"
      MINIO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-24)
      if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/^MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}/" .env
      else
        sed -i "s/^MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}/" .env
      fi
      echo -e "${GREEN}✅ MINIO_ROOT_PASSWORD corrigé: ${MINIO_PASSWORD}${NC}"
    else
      echo -e "${GREEN}✅ MINIO_ROOT_PASSWORD est déjà défini${NC}"
    fi
  fi
  
  # S'assurer que MINIO_ROOT_USER existe aussi
  if ! grep -q "^MINIO_ROOT_USER=" .env; then
    echo -e "${YELLOW}⚠️  MINIO_ROOT_USER manquant. Ajout...${NC}"
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
    echo -e "${GREEN}✅ MINIO_ROOT_USER ajouté${NC}"
  fi
fi

# Vérifier que le mot de passe fait au moins 8 caractères (requis par MinIO)
CURRENT_PASSWORD=$(grep "^MINIO_ROOT_PASSWORD=" .env | cut -d'=' -f2- | tr -d '[:space:]')
if [ ${#CURRENT_PASSWORD} -lt 8 ]; then
  echo -e "${YELLOW}⚠️  Le mot de passe est trop court (< 8 caractères). Génération d'un nouveau...${NC}"
  MINIO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-24)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/^MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}/" .env
  else
    sed -i "s/^MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}/" .env
  fi
  echo -e "${GREEN}✅ Nouveau mot de passe généré (24 caractères)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Configuration MinIO corrigée${NC}"
echo ""
echo -e "${BLUE}📋 Valeurs actuelles:${NC}"
grep "^MINIO_ROOT" .env || echo -e "${RED}❌ Erreur: MINIO_ROOT_* non trouvé dans .env${NC}"

echo ""
echo -e "${YELLOW}💡 Pour appliquer les changements:${NC}"
echo -e "   ${BLUE}docker-compose down minio minio-init${NC}"
echo -e "   ${BLUE}docker-compose up -d minio${NC}"
echo ""

