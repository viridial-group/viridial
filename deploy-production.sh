#!/bin/bash

# Script de déploiement en production pour Viridial
# Usage: ./deploy-production.sh
#
# Ce script:
# 1. Build tous les services backend et frontend
# 2. Déplace les builds dist vers les répertoires de production
# 3. Configure nginx pour www.viridial.com
# 4. Redémarre nginx
# 5. Démarre/redémarre les services avec PM2

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
cd "$PROJECT_ROOT"

# Répertoires de production
PROD_DIR="/opt/viridial"
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
NGINX_CONF_FILE="viridial.conf"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 Déploiement Production Viridial                         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier que nous sommes root ou avec sudo
if [ "$EUID" -ne 0 ] && ! sudo -n true 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Ce script nécessite des privilèges sudo pour:${NC}"
    echo -e "   - Copier la configuration nginx"
    echo -e "   - Redémarrer nginx"
    echo ""
    echo -e "${BLUE}💡 Exécutez avec: sudo ./deploy-production.sh${NC}"
    exit 1
fi

# Fonction pour exécuter avec sudo si nécessaire
SUDO_CMD=""
if [ "$EUID" -ne 0 ]; then
    SUDO_CMD="sudo"
fi

# Vérifier Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    echo -e "${YELLOW}💡 Installez Node.js 20.x LTS avant de continuer${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js détecté: $NODE_VERSION${NC}"
echo ""

# Vérifier .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Fichier .env manquant dans $PROJECT_ROOT${NC}"
    echo -e "${YELLOW}💡 Créez le fichier .env avec toutes les variables d'environnement nécessaires${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Étape 1/5: Build des services backend...${NC}"
echo ""

# Liste des services backend
BACKEND_SERVICES=(
    "auth-service"
    "property-service"
    "geolocation-service"
    "search-service"
    "marketing-service"
    "review-service"
)

# Build chaque service
for service in "${BACKEND_SERVICES[@]}"; do
    SERVICE_DIR="$PROJECT_ROOT/services/$service"
    
    if [ ! -d "$SERVICE_DIR" ]; then
        echo -e "${YELLOW}⚠️  Service $service non trouvé, ignoré${NC}"
        continue
    fi
    
    echo -e "${BLUE}📦 Build $service...${NC}"
    cd "$SERVICE_DIR"
    
    # Corriger les permissions si nécessaire
    if [ -d "dist" ] && [ ! -w "dist" ]; then
        echo -e "${YELLOW}   Correction des permissions...${NC}"
        $SUDO_CMD chown -R $(whoami):$(id -gn) dist 2>/dev/null || true
        $SUDO_CMD rm -rf dist 2>/dev/null || true
    fi
    
    # Build
    if npm run build 2>&1 | grep -q "error\|Error\|ERROR"; then
        echo -e "${RED}❌ Erreur lors du build de $service${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}   ✅ $service buildé avec succès${NC}"
done

cd "$PROJECT_ROOT"

echo ""
echo -e "${BLUE}📋 Étape 2/5: Build du frontend...${NC}"
echo ""

cd "$PROJECT_ROOT/frontend/web"

# Détecter pnpm ou npm
PNPM_CMD=""
if command -v pnpm >/dev/null 2>&1; then
    PNPM_CMD="pnpm"
elif [ -x "/usr/local/bin/pnpm" ]; then
    PNPM_CMD="/usr/local/bin/pnpm"
elif [ -x "/opt/homebrew/bin/pnpm" ]; then
    PNPM_CMD="/opt/homebrew/bin/pnpm"
fi

if [ -n "$PNPM_CMD" ]; then
    echo -e "${BLUE}📦 Build frontend avec pnpm...${NC}"
    $PNPM_CMD run build
else
    echo -e "${BLUE}📦 Build frontend avec npm...${NC}"
    npm run build
fi

echo -e "${GREEN}✅ Frontend buildé avec succès${NC}"

cd "$PROJECT_ROOT"

echo ""
echo -e "${BLUE}📋 Étape 3/5: Préparation du répertoire de production...${NC}"
echo ""

# Créer le répertoire de production si nécessaire
if [ ! -d "$PROD_DIR" ]; then
    echo -e "${BLUE}   Création de $PROD_DIR...${NC}"
    $SUDO_CMD mkdir -p "$PROD_DIR"
fi

# Copier les fichiers nécessaires
echo -e "${BLUE}   Copie des fichiers vers $PROD_DIR...${NC}"

# Copier les services avec leurs dist
for service in "${BACKEND_SERVICES[@]}"; do
    SERVICE_SRC="$PROJECT_ROOT/services/$service"
    SERVICE_DST="$PROD_DIR/services/$service"
    
    if [ -d "$SERVICE_SRC" ]; then
        $SUDO_CMD mkdir -p "$SERVICE_DST"
        echo -e "   Copie $service..."
        $SUDO_CMD cp -r "$SERVICE_SRC/dist" "$SERVICE_DST/" 2>/dev/null || true
        $SUDO_CMD cp "$SERVICE_SRC/package.json" "$SERVICE_DST/" 2>/dev/null || true
        $SUDO_CMD cp "$SERVICE_SRC/package-lock.json" "$SERVICE_DST/" 2>/dev/null || true
    fi
done

    # Copier le frontend
FRONTEND_DST="$PROD_DIR/frontend/web"
$SUDO_CMD mkdir -p "$FRONTEND_DST"
echo -e "   Copie frontend..."
$SUDO_CMD cp -r "$PROJECT_ROOT/frontend/web/.next" "$FRONTEND_DST/" 2>/dev/null || true
$SUDO_CMD cp -r "$PROJECT_ROOT/frontend/web/public" "$FRONTEND_DST/" 2>/dev/null || true
$SUDO_CMD cp "$PROJECT_ROOT/frontend/web/package.json" "$FRONTEND_DST/" 2>/dev/null || true
$SUDO_CMD cp "$PROJECT_ROOT/frontend/web/next.config.js" "$FRONTEND_DST/" 2>/dev/null || true
$SUDO_CMD cp "$PROJECT_ROOT/frontend/web/next.config.ts" "$FRONTEND_DST/" 2>/dev/null || true

# Copier .env et créer .env.local pour le frontend avec les bonnes URLs
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo -e "   Copie .env..."
    $SUDO_CMD cp "$PROJECT_ROOT/.env" "$PROD_DIR/" 2>/dev/null || true
    
    # Créer .env.local pour le frontend avec les URLs de production
    echo -e "   Création .env.local pour le frontend..."
    cat > /tmp/frontend-env.local <<EOF
# URLs API en production - via nginx reverse proxy
NEXT_PUBLIC_AUTH_API_URL=https://www.viridial.com
NEXT_PUBLIC_PROPERTY_API_URL=https://www.viridial.com
NEXT_PUBLIC_SEARCH_API_URL=https://www.viridial.com
NEXT_PUBLIC_MARKETING_API_URL=https://www.viridial.com
NEXT_PUBLIC_REVIEW_API_URL=https://www.viridial.com
NEXT_PUBLIC_GEOLOCATION_API_URL=https://www.viridial.com
EOF
    $SUDO_CMD mv /tmp/frontend-env.local "$FRONTEND_DST/.env.local"
    $SUDO_CMD chown $(whoami):$(id -gn) "$FRONTEND_DST/.env.local"
fi

echo -e "${GREEN}✅ Fichiers copiés vers $PROD_DIR${NC}"

echo ""
echo -e "${BLUE}📋 Étape 4/5: Configuration Nginx...${NC}"
echo ""

# Vérifier que nginx est installé
if ! command -v nginx >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Nginx n'est pas installé${NC}"
    echo -e "${BLUE}   Installation de nginx...${NC}"
    if command -v apt-get >/dev/null 2>&1; then
        $SUDO_CMD apt-get update
        $SUDO_CMD apt-get install -y nginx
    elif command -v yum >/dev/null 2>&1; then
        $SUDO_CMD yum install -y nginx
    else
        echo -e "${RED}❌ Impossible d'installer nginx automatiquement${NC}"
        exit 1
    fi
fi

# Copier la configuration nginx
if [ -f "$PROJECT_ROOT/deploy/production-nginx.conf" ]; then
    echo -e "${BLUE}   Copie de la configuration nginx...${NC}"
    $SUDO_CMD cp "$PROJECT_ROOT/deploy/production-nginx.conf" "$NGINX_CONF_DIR/$NGINX_CONF_FILE"
    
    # Créer le lien symbolique si nécessaire
    if [ ! -L "$NGINX_ENABLED_DIR/$NGINX_CONF_FILE" ]; then
        echo -e "${BLUE}   Activation de la configuration...${NC}"
        $SUDO_CMD ln -s "$NGINX_CONF_DIR/$NGINX_CONF_FILE" "$NGINX_ENABLED_DIR/$NGINX_CONF_FILE"
    fi
    
    # Tester la configuration nginx
    echo -e "${BLUE}   Test de la configuration nginx...${NC}"
    if $SUDO_CMD nginx -t; then
        echo -e "${GREEN}   ✅ Configuration nginx valide${NC}"
    else
        echo -e "${RED}   ❌ Erreur dans la configuration nginx${NC}"
        exit 1
    fi
    
    # Recharger nginx
    echo -e "${BLUE}   Rechargement de nginx...${NC}"
    $SUDO_CMD systemctl reload nginx || $SUDO_CMD service nginx reload || $SUDO_CMD nginx -s reload
    echo -e "${GREEN}   ✅ Nginx rechargé${NC}"
else
    echo -e "${YELLOW}⚠️  Fichier de configuration nginx non trouvé: deploy/production-nginx.conf${NC}"
    echo -e "${YELLOW}   La configuration nginx n'a pas été mise à jour${NC}"
fi

echo ""
echo -e "${BLUE}📋 Étape 5/5: Démarrage des services avec PM2...${NC}"
echo ""

# Vérifier PM2
if ! command -v pm2 >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  PM2 n'est pas installé${NC}"
    echo -e "${BLUE}   Installation de PM2...${NC}"
    npm install -g pm2
fi

# Charger les variables d'environnement depuis .env de production
if [ -f "$PROD_DIR/.env" ]; then
    set -a
    source "$PROD_DIR/.env" 2>/dev/null || true
    set +a
elif [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env" 2>/dev/null || true
    set +a
fi

cd "$PROD_DIR"

# Arrêter les services existants s'ils sont en cours d'exécution
pm2 delete all 2>/dev/null || true

# Démarrer les services backend
for service in "${BACKEND_SERVICES[@]}"; do
    SERVICE_DIR="$PROD_DIR/services/$service"
    
    if [ -d "$SERVICE_DIR" ] && [ -d "$SERVICE_DIR/dist" ]; then
        echo -e "${BLUE}   Démarrage $service...${NC}"
        cd "$SERVICE_DIR"
        
        # Installer les dépendances production si nécessaire
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}      Installation des dépendances production...${NC}"
            npm ci --only=production
        fi
        
        # Créer .env.local dans le service avec DATABASE_URL et PORT depuis .env principal
        if [ -f "$PROD_DIR/.env" ]; then
            # Extraire DATABASE_URL et PORT depuis .env
            set -a
            source "$PROD_DIR/.env" 2>/dev/null || true
            set +a
            
            # Déterminer le port selon le service
            PORT=""
            case "$service" in
                auth-service) PORT="${AUTH_SERVICE_PORT:-3001}" ;;
                property-service) PORT="${PROPERTY_SERVICE_PORT:-3002}" ;;
                geolocation-service) PORT="${GEOLOCATION_SERVICE_PORT:-3003}" ;;
                search-service) PORT="${SEARCH_SERVICE_PORT:-3004}" ;;
                marketing-service) PORT="${MARKETING_SERVICE_PORT:-3005}" ;;
                review-service) PORT="${REVIEW_SERVICE_PORT:-3006}" ;;
            esac
            
            # Créer .env.local pour le service
            cat > "$SERVICE_DIR/.env.local" <<EOF
# Variables d'environnement pour $service
# Généré automatiquement par deploy-production.sh
NODE_ENV=production
PORT=$PORT
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL:-redis://localhost:6379}
MEILISEARCH_URL=${MEILISEARCH_URL:-http://localhost:7700}
MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
MINIO_ROOT_USER=${MINIO_ROOT_USER:-minioadmin}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
FRONTEND_URL=${FRONTEND_URL:-https://www.viridial.com}
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
EOF
            chown $(whoami):$(id -gn) "$SERVICE_DIR/.env.local" 2>/dev/null || true
        fi
        
        # Démarrer avec PM2 (utilise .env.local créé ci-dessus)
        pm2 delete "$service" 2>/dev/null || true
        pm2 start npm --name "$service" -- start || pm2 restart "$service" --update-env
        echo -e "${GREEN}   ✅ $service démarré sur port $PORT${NC}"
    else
        echo -e "${YELLOW}   ⚠️  $service/dist manquant, service ignoré${NC}"
    fi
done

# Démarrer le frontend
FRONTEND_DST="$PROD_DIR/frontend/web"
if [ -d "$FRONTEND_DST" ] && [ -d "$FRONTEND_DST/.next" ]; then
    cd "$FRONTEND_DST"
    echo -e "${BLUE}   Démarrage frontend...${NC}"

    # Détecter pnpm/npm
    PNPM_CMD=""
    if command -v pnpm >/dev/null 2>&1; then
        PNPM_CMD="pnpm"
    elif [ -x "/usr/local/bin/pnpm" ]; then
        PNPM_CMD="/usr/local/bin/pnpm"
    fi
    
    NPM_CMD=""
    if command -v npm >/dev/null 2>&1; then
        NPM_CMD="npm"
    fi

    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}      Installation des dépendances production...${NC}"
        if [ -n "$PNPM_CMD" ]; then
            $PNPM_CMD install --prod
        elif [ -n "$NPM_CMD" ]; then
            $NPM_CMD ci --only=production
        else
            echo -e "${RED}      ❌ pnpm et npm non trouvés${NC}"
        fi
    fi

    # S'assurer que .env.local existe
    if [ ! -f ".env.local" ]; then
        echo -e "${YELLOW}      Création .env.local...${NC}"
        cat > ".env.local" <<EOF
# URLs API en production - via nginx reverse proxy
NEXT_PUBLIC_AUTH_API_URL=https://www.viridial.com
NEXT_PUBLIC_PROPERTY_API_URL=https://www.viridial.com
NEXT_PUBLIC_SEARCH_API_URL=https://www.viridial.com
NEXT_PUBLIC_MARKETING_API_URL=https://www.viridial.com
NEXT_PUBLIC_REVIEW_API_URL=https://www.viridial.com
NEXT_PUBLIC_GEOLOCATION_API_URL=https://www.viridial.com
EOF
        chown $(whoami):$(id -gn) ".env.local" 2>/dev/null || true
    fi

    pm2 delete frontend 2>/dev/null || true
    if [ -n "$PNPM_CMD" ]; then
        pm2 start $PNPM_CMD --name "frontend" -- start || pm2 restart frontend --update-env
    elif [ -n "$NPM_CMD" ]; then
        pm2 start npm --name "frontend" -- start || pm2 restart frontend --update-env
    else
        echo -e "${RED}   ❌ Impossible de démarrer le frontend: ni pnpm ni npm trouvé${NC}"
    fi
    
    echo -e "${GREEN}   ✅ Frontend démarré sur port 3000${NC}"
else
    echo -e "${YELLOW}   ⚠️  Frontend/.next manquant, frontend ignoré${NC}"
fi

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour le démarrage automatique
pm2 startup systemd -u $(whoami) --hp /home/$(whoami) 2>/dev/null || true

cd "$PROJECT_ROOT"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Déploiement terminé avec succès!                         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Résumé:${NC}"
echo -e "   ✅ Services backend buildés et déployés"
echo -e "   ✅ Frontend buildé et déployé"
echo -e "   ✅ Nginx configuré pour www.viridial.com"
echo -e "   ✅ Services démarrés avec PM2"
echo ""
echo -e "${BLUE}🌐 Accès:${NC}"
echo -e "   Frontend: https://www.viridial.com"
echo -e "   API Auth: https://www.viridial.com/auth/"
echo -e "   API Properties: https://www.viridial.com/properties/"
echo -e "   API Search: https://www.viridial.com/search/"
echo -e "   API Geolocation: https://www.viridial.com/geolocation/"
echo -e "   API Marketing: https://www.viridial.com/marketing/"
echo -e "   API Reviews: https://www.viridial.com/reviews/"
echo ""
echo -e "${BLUE}📊 Commandes utiles:${NC}"
echo -e "   ${YELLOW}pm2 status${NC} - Voir l'état des services"
echo -e "   ${YELLOW}pm2 logs${NC} - Voir les logs"
echo -e "   ${YELLOW}pm2 monit${NC} - Monitoring en temps réel"
echo -e "   ${YELLOW}sudo systemctl status nginx${NC} - Vérifier nginx"
echo -e "   ${YELLOW}sudo nginx -t${NC} - Tester la configuration nginx"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo -e "   - Assurez-vous que le certificat SSL est configuré dans:"
echo -e "     /etc/letsencrypt/live/viridial.com/"
echo -e "   - Vérifiez que le DNS pointe vers ce serveur:"
echo -e "     www.viridial.com -> $(curl -s ifconfig.me || echo 'IP_DU_SERVEUR')"
echo ""

