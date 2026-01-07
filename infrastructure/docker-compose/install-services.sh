#!/bin/bash
# Script d'installation des services de base avec Docker Compose

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

step() {
    echo -e "${GREEN}[ÉTAPE]${NC} $1"
    echo ""
}

warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

error() {
    echo -e "${RED}[ERREUR]${NC} $1"
    exit 1
}

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🚀 Installation des Services de Base (Docker Compose)      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé. Installez Docker d'abord."
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose n'est pas installé. Installez Docker Compose d'abord."
fi

# Détecter docker compose ou docker-compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

step "Vérification de Docker"
docker info > /dev/null 2>&1 || error "Docker n'est pas en cours d'exécution. Démarrez Docker d'abord."
echo "✓ Docker est prêt"
echo ""

# Vérifier/créer le fichier .env
step "Configuration des variables d'environnement"

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        warning "Fichier .env créé depuis .env.example"
        warning "⚠️  IMPORTANT: Modifiez .env avec des mots de passe sécurisés avant de continuer!"
        echo ""
        read -p "Voulez-vous générer automatiquement les mots de passe? (o/n) [o]: " GENERATE
        GENERATE=${GENERATE:-o}
        
        if [ "$GENERATE" = "o" ] || [ "$GENERATE" = "O" ]; then
            # Générer PostgreSQL password
            POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
            sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" .env
            
            # Générer Meilisearch master key
            MEILI_MASTER_KEY=$(openssl rand -hex 32)
            sed -i "s/MEILI_MASTER_KEY=.*/MEILI_MASTER_KEY=$MEILI_MASTER_KEY/" .env
            
            # Générer MinIO password
            MINIO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
            sed -i "s/MINIO_ROOT_PASSWORD=.*/MINIO_ROOT_PASSWORD=$MINIO_PASSWORD/" .env
            
            echo "✓ Mots de passe générés automatiquement"
            echo ""
            echo "📋 CREDENTIALS GÉNÉRÉS (sauvegardez-les!):"
            echo "PostgreSQL Password: $POSTGRES_PASSWORD"
            echo "Meilisearch Master Key: $MEILI_MASTER_KEY"
            echo "MinIO Root Password: $MINIO_PASSWORD"
            echo ""
            warning "Ces credentials sont dans le fichier .env"
        else
            error "Modifiez le fichier .env avec des mots de passe sécurisés, puis relancez ce script."
        fi
    else
        error "Fichier .env.example non trouvé. Créez un fichier .env manuellement."
    fi
else
    echo "✓ Fichier .env existe déjà"
fi
echo ""

# Créer le répertoire de configuration Redis si nécessaire
step "Préparation de la configuration"
mkdir -p config
if [ ! -f config/redis.conf ]; then
    error "Fichier config/redis.conf manquant. Vérifiez l'installation."
fi
echo "✓ Configuration prête"
echo ""

# Démarrer les services
step "Démarrage des services"
$DOCKER_COMPOSE up -d

echo "⏳ Attente que les services démarrent..."
sleep 10

# Vérifier l'état des services
step "Vérification de l'état des services"
$DOCKER_COMPOSE ps

echo ""
echo "⏳ Attente que tous les services soient healthy..."
for i in {1..30}; do
    HEALTHY_COUNT=$($DOCKER_COMPOSE ps | grep -c "healthy" || true)
    TOTAL_COUNT=$($DOCKER_COMPOSE ps | grep -c "Up" || true)
    
    if [ "$HEALTHY_COUNT" -ge 3 ] && [ "$TOTAL_COUNT" -ge 4 ]; then
        echo "✓ Tous les services sont démarrés"
        break
    fi
    
    if [ "$i" -eq 30 ]; then
        warning "Certains services ne sont pas encore healthy. Vérifiez les logs:"
        echo "  $DOCKER_COMPOSE logs"
    fi
    
    sleep 2
done
echo ""

# Initialiser MinIO buckets
step "Initialisation des buckets MinIO"
$DOCKER_COMPOSE run --rm minio-init || warning "L'initialisation des buckets MinIO a échoué. Vous pouvez le faire manuellement plus tard."
echo ""

# Afficher les informations de connexion
step "Informations de connexion"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Services installés et démarrés!                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 ENDPOINTS:"
echo ""
echo "PostgreSQL:"
echo "  Host: localhost"
echo "  Port: $(grep POSTGRES_PORT .env | cut -d= -f2 || echo '5432')"
echo "  Database: $(grep POSTGRES_DB .env | cut -d= -f2 || echo 'viridial')"
echo "  User: $(grep POSTGRES_USER .env | cut -d= -f2 || echo 'viridial')"
echo "  Password: (voir fichier .env)"
echo ""
echo "Redis:"
echo "  Host: localhost"
echo "  Port: $(grep REDIS_PORT .env | cut -d= -f2 || echo '6379')"
echo ""
echo "Meilisearch:"
echo "  URL: http://localhost:$(grep MEILISEARCH_PORT .env | cut -d= -f2 || echo '7700')"
echo "  Master Key: (voir fichier .env)"
echo ""
echo "MinIO:"
echo "  API: http://localhost:$(grep MINIO_API_PORT .env | cut -d= -f2 || echo '9000')"
echo "  Console: http://localhost:$(grep MINIO_CONSOLE_PORT .env | cut -d= -f2 || echo '9001')"
echo "  Root User: $(grep MINIO_ROOT_USER .env | cut -d= -f2 || echo 'minioadmin')"
echo "  Root Password: (voir fichier .env)"
echo ""
echo "💡 Commandes utiles:"
echo "  - Voir les logs: $DOCKER_COMPOSE logs -f [service]"
echo "  - Arrêter: $DOCKER_COMPOSE down"
echo "  - Redémarrer: $DOCKER_COMPOSE restart [service]"
echo "  - État: $DOCKER_COMPOSE ps"
echo ""

