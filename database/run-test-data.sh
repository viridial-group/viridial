#!/bin/bash

# Script pour exécuter le script SQL de test avec données
# Usage: ./run-test-data.sh [--reset]

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/init-database-with-test-data.sql"
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
  if docker ps | grep -q "viridial-postgres\|postgres.*viridial"; then
    return 0
  fi
  return 1
}

# Exécuter via Docker
run_via_docker() {
  local container_name=$(docker ps --format "{{.Names}}" | grep -E "postgres|viridial.*postgres" | head -1)
  
  if [ -z "$container_name" ]; then
    print_error "Aucun conteneur PostgreSQL trouvé"
    return 1
  fi
  
  print_info "Conteneur trouvé: $container_name"
  
  # Copier le fichier SQL dans le conteneur
  docker cp "$SQL_FILE" "$container_name:/tmp/init-database.sql"
  
  # Exécuter le script
  if docker exec -i "$container_name" psql -U "$DB_USER" -d "$DB_NAME" -f /tmp/init-database.sql; then
    print_success "Script SQL exécuté avec succès via Docker"
    return 0
  else
    print_error "Erreur lors de l'exécution du script SQL"
    return 1
  fi
}

# Exécuter via psql direct
run_via_psql() {
  export PGPASSWORD="$DB_PASSWORD"
  
  if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"; then
    print_success "Script SQL exécuté avec succès via psql"
    return 0
  else
    print_error "Erreur lors de l'exécution du script SQL"
    return 1
  fi
}

# Réinitialiser la base de données
reset_database() {
  print_warning "Réinitialisation de la base de données..."
  
  local reset_sql="
  TRUNCATE TABLE 
    property_favorites, 
    reviews, 
    custom_field_values, 
    custom_field_definitions,
    property_details, 
    property_translations, 
    properties, 
    neighborhoods,
    email_verification_tokens, 
    password_reset_tokens, 
    users 
  CASCADE;
  "
  
  if check_docker; then
    local container_name=$(docker ps --format "{{.Names}}" | grep -E "postgres|viridial.*postgres" | head -1)
    echo "$reset_sql" | docker exec -i "$container_name" psql -U "$DB_USER" -d "$DB_NAME"
  else
    export PGPASSWORD="$DB_PASSWORD"
    echo "$reset_sql" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
  fi
  
  print_success "Base de données réinitialisée"
}

# Vérifier la connexion
check_connection() {
  if check_docker; then
    local container_name=$(docker ps --format "{{.Names}}" | grep -E "postgres|viridial.*postgres" | head -1)
    if docker exec "$container_name" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
      return 0
    fi
  else
    export PGPASSWORD="$DB_PASSWORD"
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
      return 0
    fi
  fi
  return 1
}

# Main
main() {
  print_header "🚀 Initialisation Base de Données Viridial avec Données de Test"
  
  # Vérifier que le fichier SQL existe
  if [ ! -f "$SQL_FILE" ]; then
    print_error "Fichier SQL non trouvé: $SQL_FILE"
    exit 1
  fi
  
  # Option --reset
  if [ "$1" == "--reset" ]; then
    if ! check_connection; then
      print_error "Impossible de se connecter à la base de données"
      exit 1
    fi
    reset_database
  fi
  
  # Vérifier la connexion
  if ! check_connection; then
    print_error "Impossible de se connecter à la base de données"
    print_info "Vérifiez que PostgreSQL est démarré et que les variables d'environnement sont correctes"
    print_info "Variables actuelles:"
    echo "  DB_HOST=$DB_HOST"
    echo "  DB_PORT=$DB_PORT"
    echo "  DB_NAME=$DB_NAME"
    echo "  DB_USER=$DB_USER"
    exit 1
  fi
  
  # Choisir la méthode d'exécution
  if check_docker; then
    print_info "Utilisation de Docker pour exécuter le script"
    run_via_docker
  else
    print_info "Utilisation de psql direct"
    print_info "Assurez-vous que psql est installé et que PostgreSQL est accessible"
    run_via_psql
  fi
  
  if [ $? -eq 0 ]; then
    print_success "✅ Initialisation terminée avec succès!"
    print_info "📊 Utilisez les requêtes de test dans database/README-SQL-TEST-DATA.md"
  else
    print_error "❌ Échec de l'initialisation"
    exit 1
  fi
}

# Aide
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  echo "Usage: $0 [--reset]"
  echo ""
  echo "Options:"
  echo "  --reset    Réinitialise la base de données avant d'insérer les données"
  echo "  --help     Affiche cette aide"
  echo ""
  echo "Variables d'environnement:"
  echo "  DB_HOST      Host PostgreSQL (défaut: localhost)"
  echo "  DB_PORT      Port PostgreSQL (défaut: 5432)"
  echo "  DB_NAME      Nom de la base (défaut: viridial)"
  echo "  DB_USER      Utilisateur (défaut: viridial)"
  echo "  DB_PASSWORD  Mot de passe (défaut: viridial_dev_password_2024)"
  echo ""
  echo "Exemples:"
  echo "  $0                    # Exécute le script normalement"
  echo "  $0 --reset            # Réinitialise puis exécute"
  echo "  DB_HOST=prod.example.com $0  # Utilise un host différent"
  exit 0
fi

main "$@"

