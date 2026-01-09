#!/bin/bash

# Script pour corriger les valeurs NULL dans user_id de la table properties
# Usage: ./fix-user-id.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/fix-properties-user-id.sql"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Variables d'environnement (peuvent être surchargées)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-viridial}"
DB_USER="${DB_USER:-viridial}"
DB_PASSWORD="${DB_PASSWORD:-viridial_dev_password_2024}"

print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# Vérifier si Docker est utilisé
check_docker() {
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -qE '(postgres|viridial.*postgres)'; then
    DOCKER_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E '(postgres|viridial.*postgres)' | head -1)
    print_info "Docker container trouvé: $DOCKER_CONTAINER"
    return 0
  else
    return 1
  fi
}

# Exécuter via Docker
execute_via_docker() {
  local container=$1
  print_info "Exécution via Docker container: $container"
  
  # Copier le script SQL dans le container
  docker cp "$SQL_FILE" "$container:/tmp/fix-user-id.sql"
  
  # Exécuter le script
  if docker exec -e PGPASSWORD="$DB_PASSWORD" "$container" \
    psql -U "$DB_USER" -d "$DB_NAME" -f /tmp/fix-user-id.sql; then
    print_success "Correction effectuée avec succès via Docker!"
    return 0
  else
    print_error "Erreur lors de l'exécution via Docker"
    return 1
  fi
}

# Exécuter directement
execute_direct() {
  print_info "Exécution directe sur $DB_HOST:$DB_PORT"
  
  if command -v psql >/dev/null 2>&1; then
    export PGPASSWORD="$DB_PASSWORD"
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"; then
      print_success "Correction effectuée avec succès!"
      unset PGPASSWORD
      return 0
    else
      print_error "Erreur lors de l'exécution directe"
      unset PGPASSWORD
      return 1
    fi
  else
    print_error "psql n'est pas installé. Installez PostgreSQL client."
    return 1
  fi
}

# Exécuter SQL direct (fallback)
execute_sql_direct() {
  local container=$1
  print_info "Exécution SQL directe..."
  
  local sql_commands="
-- Quick fix for NULL user_id values
UPDATE properties
SET user_id = COALESCE(
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  '00000000-0000-0000-0000-000000000001'::uuid
)
WHERE user_id IS NULL;

-- Set column to NOT NULL
ALTER TABLE properties ALTER COLUMN user_id SET NOT NULL;
"
  
  if [ -n "$container" ]; then
    # Via Docker
    echo "$sql_commands" | docker exec -i -e PGPASSWORD="$DB_PASSWORD" "$container" \
      psql -U "$DB_USER" -d "$DB_NAME"
  else
    # Direct
    export PGPASSWORD="$DB_PASSWORD"
    echo "$sql_commands" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
    unset PGPASSWORD
  fi
}

# Main
main() {
  print_header "Correction des valeurs NULL dans user_id (properties)"
  
  if check_docker; then
    if execute_via_docker "$DOCKER_CONTAINER"; then
      print_success "Terminé!"
      exit 0
    else
      print_warning "Tentative avec SQL direct..."
      if execute_sql_direct "$DOCKER_CONTAINER"; then
        print_success "Terminé avec SQL direct!"
        exit 0
      fi
    fi
  else
    print_info "Aucun container Docker trouvé, tentative d'exécution directe..."
    if execute_direct; then
      print_success "Terminé!"
      exit 0
    else
      print_warning "Tentative avec SQL direct..."
      if execute_sql_direct; then
        print_success "Terminé avec SQL direct!"
        exit 0
      fi
    fi
  fi
  
  print_error "Impossible d'exécuter la correction. Vérifiez votre connexion à la base de données."
  exit 1
}

main "$@"

