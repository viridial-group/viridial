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

# Détecter l'utilisateur réel (même sous sudo)
REAL_USER="${SUDO_USER:-$USER}"
REAL_HOME=$(eval echo ~$REAL_USER)

# Déterminer la commande sudo à utiliser (vide si root, "sudo" sinon)
if [ "$EUID" -eq 0 ]; then
    SUDO_CMD=""
else
    # Vérifier si sudo est disponible
    if command -v sudo >/dev/null 2>&1; then
        SUDO_CMD="sudo"
    else
        SUDO_CMD=""
        echo -e "${YELLOW}⚠️  sudo n'est pas disponible. Certaines opérations (nginx, /opt) seront ignorées.${NC}"
    fi
fi

# Fonction pour trouver Node.js (gère nvm sous sudo)
find_node() {
    # Essayer command -v d'abord (dans le PATH actuel)
    if command -v node >/dev/null 2>&1; then
        echo "$(command -v node)"
        return 0
    fi
    
    # Si on est sous sudo, chercher dans le HOME de l'utilisateur réel
    if [ -n "$SUDO_USER" ] && [ "$SUDO_USER" != "root" ] && [ -d "$REAL_HOME/.nvm" ]; then
        # Chercher dans les versions nvm de l'utilisateur réel
        if [ -d "$REAL_HOME/.nvm/versions/node" ]; then
            # Chercher la version par défaut
            DEFAULT_VERSION=$(cat "$REAL_HOME/.nvm/alias/default" 2>/dev/null || echo "")
            if [ -n "$DEFAULT_VERSION" ] && [ -x "$REAL_HOME/.nvm/versions/node/$DEFAULT_VERSION/bin/node" ]; then
                echo "$REAL_HOME/.nvm/versions/node/$DEFAULT_VERSION/bin/node"
                return 0
            fi
            
            # Chercher v20.18.0 spécifiquement
            if [ -x "$REAL_HOME/.nvm/versions/node/v20.18.0/bin/node" ]; then
                echo "$REAL_HOME/.nvm/versions/node/v20.18.0/bin/node"
                return 0
            fi
            
            # Chercher la première version 20.x disponible
            NODE_PATH=$(find "$REAL_HOME/.nvm/versions/node" -name "v20.*" -type d -maxdepth 1 2>/dev/null | head -1)
            if [ -n "$NODE_PATH" ] && [ -x "$NODE_PATH/bin/node" ]; then
                echo "$NODE_PATH/bin/node"
                return 0
            fi
            
            # Si aucune version 20.x, chercher n'importe quelle version
            NODE_PATH=$(find "$REAL_HOME/.nvm/versions/node" -name "v*" -type d -maxdepth 1 2>/dev/null | sort -V | tail -1)
            if [ -n "$NODE_PATH" ] && [ -x "$NODE_PATH/bin/node" ]; then
                echo "$NODE_PATH/bin/node"
                return 0
            fi
        fi
        
        # Charger nvm de l'utilisateur réel via sudo pour obtenir le chemin
        if [ -s "$REAL_HOME/.nvm/nvm.sh" ]; then
            # Exécuter en tant qu'utilisateur réel pour charger nvm
            NODE_PATH=$(sudo -u "$SUDO_USER" bash -c "source '$REAL_HOME/.nvm/nvm.sh' && command -v node" 2>/dev/null)
            if [ -n "$NODE_PATH" ] && [ -x "$NODE_PATH" ]; then
                echo "$NODE_PATH"
                return 0
            fi
        fi
    fi
    
    # Chercher dans les chemins nvm communs (utilisateur actuel)
    NVM_PATHS=(
        "$HOME/.nvm/versions/node/v20.18.0/bin/node"
        "$HOME/.nvm/versions/node/$(cat "$HOME/.nvm/alias/default" 2>/dev/null)/bin/node"
        "/root/.nvm/versions/node/v20.18.0/bin/node"
        "/root/.nvm/versions/node/$(cat "/root/.nvm/alias/default" 2>/dev/null)/bin/node"
    )
    
    for path in "${NVM_PATHS[@]}"; do
        if [ -x "$path" ] 2>/dev/null; then
            echo "$path"
            return 0
        fi
    done
    
    # Si nvm est installé, essayer de charger nvm et trouver node
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        if command -v node >/dev/null 2>&1; then
            echo "$(command -v node)"
            return 0
        fi
    fi
    
    # Chercher dans les chemins système standards
    SYSTEM_PATHS=(
        "/usr/local/bin/node"
        "/usr/bin/node"
        "/opt/homebrew/bin/node"
    )
    
    for path in "${SYSTEM_PATHS[@]}"; do
        if [ -x "$path" ] 2>/dev/null; then
            echo "$path"
            return 0
        fi
    done
    
    return 1
}

# Vérifier Node.js
NODE_CMD=$(find_node)
if [ -z "$NODE_CMD" ] || [ ! -x "$NODE_CMD" ]; then
    echo -e "${RED}❌ Node.js n'est pas installé ou non trouvé${NC}"
    echo ""
    
    # Si sous sudo, donner des instructions spécifiques
    if [ -n "$SUDO_USER" ] && [ "$SUDO_USER" != "root" ]; then
        echo -e "${YELLOW}💡 Vous êtes sous sudo. Node.js installé pour l'utilisateur '$SUDO_USER' n'est pas accessible.${NC}"
        echo ""
        echo -e "${BLUE}Option 1 (Recommandé): Exécuter sans sudo${NC}"
        echo -e "   ${YELLOW}sudo chown -R $SUDO_USER:$SUDO_USER $PROJECT_ROOT${NC}"
        echo -e "   ${YELLOW}exit  # Quitter sudo${NC}"
        echo -e "   ${YELLOW}cd $PROJECT_ROOT && ./deploy-production.sh${NC}"
        echo ""
        echo -e "${BLUE}Option 2: Installer nvm pour root${NC}"
        echo -e "   ${YELLOW}sudo bash -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash'${NC}"
        echo -e "   ${YELLOW}sudo bash -c 'source /root/.nvm/nvm.sh && nvm install 20.18.0 && nvm use 20.18.0'${NC}"
        echo ""
    else
        echo -e "${YELLOW}💡 Installez Node.js 20.x LTS avec nvm:${NC}"
        echo -e "   ${BLUE}curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash${NC}"
        echo -e "   ${BLUE}source ~/.bashrc${NC}"
        echo -e "   ${BLUE}nvm install 20.18.0${NC}"
        echo -e "   ${BLUE}nvm use 20.18.0${NC}"
    fi
    
    exit 1
fi

# Ajouter Node.js au PATH si nécessaire
if [[ "$NODE_CMD" == *"/nvm/"* ]]; then
    NODE_DIR="$(dirname "$NODE_CMD")"
    export PATH="$NODE_DIR:$PATH"
    
    # Charger nvm si disponible (depuis l'utilisateur réel si sous sudo)
    if [ -n "$SUDO_USER" ] && [ -d "$REAL_HOME/.nvm" ]; then
        export NVM_DIR="$REAL_HOME/.nvm"
    else
        # Extraire NVM_DIR depuis le chemin de node
        NVM_DIR="$(dirname "$(dirname "$(dirname "$NODE_CMD")")")"
        export NVM_DIR
    fi
    
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        # Mettre à jour NODE_CMD après chargement de nvm
        if command -v node >/dev/null 2>&1; then
            NODE_CMD="$(command -v node)"
        fi
    fi
fi

# Exporter npm aussi si disponible
NPM_CMD=""
if command -v npm >/dev/null 2>&1; then
    NPM_CMD="$(command -v npm)"
elif [ -n "$NODE_CMD" ] && [ -x "$(dirname "$NODE_CMD")/npm" ]; then
    NPM_CMD="$(dirname "$NODE_CMD")/npm"
fi

NODE_VERSION=$("$NODE_CMD" --version 2>/dev/null || echo "unknown")
echo -e "${GREEN}✅ Node.js détecté: $NODE_VERSION ($NODE_CMD)${NC}"

# Vérifier la version
NODE_MAJOR=$("$NODE_CMD" --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" != "20" ]; then
    echo -e "${YELLOW}⚠️  Node.js $NODE_VERSION détecté, version 20.x recommandée${NC}"
fi

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
    
    # Build avec npm détecté
    if [ -z "$NPM_CMD" ]; then
        echo -e "${RED}❌ npm non trouvé pour build $service${NC}"
        exit 1
    fi
    
    # Build et capturer la sortie
    BUILD_OUTPUT=$($NPM_CMD run build 2>&1)
    BUILD_EXIT_CODE=$?
    
    # Sauvegarder dans un fichier log
    echo "$BUILD_OUTPUT" > /tmp/${service}-build.log
    
    if [ $BUILD_EXIT_CODE -eq 0 ] && ! echo "$BUILD_OUTPUT" | grep -qi "error"; then
        echo -e "${GREEN}   ✅ $service buildé avec succès${NC}"
    else
        echo -e "${RED}   ❌ Erreur lors du build de $service${NC}"
        echo -e "${YELLOW}      Voir /tmp/${service}-build.log pour les détails${NC}"
        echo "$BUILD_OUTPUT" | tail -20  # Afficher les dernières lignes
        exit 1
    fi
    
    echo -e "${GREEN}   ✅ $service buildé avec succès${NC}"
done

cd "$PROJECT_ROOT"

echo ""
echo -e "${BLUE}📋 Étape 2/5: Build du frontend...${NC}"
echo ""

cd "$PROJECT_ROOT/frontend/web"

# Détecter pnpm (chercher aussi dans le même répertoire que node)
PNPM_CMD=""
if command -v pnpm >/dev/null 2>&1; then
    PNPM_CMD="pnpm"
elif [ -n "$NODE_CMD" ] && [ -x "$(dirname "$NODE_CMD")/pnpm" ]; then
    PNPM_CMD="$(dirname "$NODE_CMD")/pnpm"
elif [ -n "$REAL_HOME" ] && [ -x "$REAL_HOME/.local/share/pnpm/pnpm" ]; then
    PNPM_CMD="$REAL_HOME/.local/share/pnpm/pnpm"
elif [ -x "/usr/local/bin/pnpm" ]; then
    PNPM_CMD="/usr/local/bin/pnpm"
elif [ -x "/opt/homebrew/bin/pnpm" ]; then
    PNPM_CMD="/opt/homebrew/bin/pnpm"
fi

if [ -n "$PNPM_CMD" ]; then
    echo -e "${BLUE}📦 Build frontend avec pnpm...${NC}"
    $PNPM_CMD run build
elif [ -n "$NPM_CMD" ]; then
    echo -e "${BLUE}📦 Build frontend avec npm...${NC}"
    $NPM_CMD run build
else
    echo -e "${RED}❌ Ni pnpm ni npm trouvés pour build frontend${NC}"
    exit 1
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

# Vérifier que sudo est disponible pour les opérations nginx
if [ "$EUID" -ne 0 ] && ! command -v sudo >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  sudo n'est pas disponible. Les opérations nginx seront ignorées.${NC}"
    echo -e "${YELLOW}   Configurez nginx manuellement avec le fichier:${NC}"
    echo -e "   ${BLUE}$PROJECT_ROOT/deploy/production-nginx.conf${NC}"
    NGINX_SKIP=true
elif [ "$EUID" -ne 0 ] && ! sudo -n true 2>/dev/null; then
    echo -e "${YELLOW}⚠️  sudo nécessite un mot de passe. Les opérations nginx seront ignorées.${NC}"
    echo -e "${YELLOW}   Exécutez manuellement:${NC}"
    echo -e "   ${BLUE}sudo cp $PROJECT_ROOT/deploy/production-nginx.conf $NGINX_CONF_DIR/$NGINX_CONF_FILE${NC}"
    echo -e "   ${BLUE}sudo ln -s $NGINX_CONF_DIR/$NGINX_CONF_FILE $NGINX_ENABLED_DIR/$NGINX_CONF_FILE${NC}"
    echo -e "   ${BLUE}sudo nginx -t && sudo systemctl reload nginx${NC}"
    NGINX_SKIP=true
else
    NGINX_SKIP=false
    # Déterminer la commande sudo à utiliser
    if [ "$EUID" -eq 0 ]; then
        SUDO_CMD=""
    else
        SUDO_CMD="sudo"
    fi
fi

if [ "$NGINX_SKIP" = "false" ]; then
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
    else
        echo -e "${RED}   ❌ Fichier de configuration nginx non trouvé: $PROJECT_ROOT/deploy/production-nginx.conf${NC}"
        NGINX_SKIP=true
    fi
    
    # Tester et recharger nginx seulement si la config existe
    if [ "$NGINX_SKIP" = "false" ]; then
        # Tester la configuration nginx
        echo -e "${BLUE}   Test de la configuration nginx...${NC}"
        if $SUDO_CMD nginx -t; then
            echo -e "${GREEN}   ✅ Configuration nginx valide${NC}"
            
            # Recharger nginx
            echo -e "${BLUE}   Rechargement de nginx...${NC}"
            $SUDO_CMD systemctl reload nginx 2>/dev/null || $SUDO_CMD service nginx reload 2>/dev/null || $SUDO_CMD nginx -s reload 2>/dev/null
            
            echo -e "${GREEN}   ✅ Nginx rechargé${NC}"
        else
            echo -e "${RED}   ❌ Erreur dans la configuration nginx${NC}"
            echo -e "${YELLOW}   Corrigez les erreurs avant de continuer${NC}"
            echo -e "${YELLOW}   Testez avec: sudo nginx -t${NC}"
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Configuration nginx ignorée (opérations sudo nécessaires)${NC}"
    echo -e "${YELLOW}   Configurez nginx manuellement avec le fichier:${NC}"
    echo -e "   ${BLUE}$PROJECT_ROOT/deploy/production-nginx.conf${NC}"
fi

echo ""
echo -e "${BLUE}📋 Étape 5/5: Démarrage des services avec PM2...${NC}"
echo ""

# Vérifier PM2 (chercher aussi dans le même répertoire que node)
PM2_CMD=""
if command -v pm2 >/dev/null 2>&1; then
    PM2_CMD="pm2"
elif [ -n "$NODE_CMD" ] && [ -x "$(dirname "$NODE_CMD")/pm2" ]; then
    PM2_CMD="$(dirname "$NODE_CMD")/pm2"
elif [ -n "$REAL_HOME" ] && [ -x "$REAL_HOME/.npm-global/bin/pm2" ]; then
    PM2_CMD="$REAL_HOME/.npm-global/bin/pm2"
    export PATH="$REAL_HOME/.npm-global/bin:$PATH"
fi

if [ -z "$PM2_CMD" ]; then
    echo -e "${YELLOW}⚠️  PM2 n'est pas installé${NC}"
    echo -e "${BLUE}   Installation de PM2...${NC}"
    if [ -n "$NPM_CMD" ]; then
        $NPM_CMD install -g pm2
        PM2_CMD="pm2"
    else
        echo -e "${RED}❌ npm non trouvé, impossible d'installer PM2${NC}"
        exit 1
    fi
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
            if [ -z "$NPM_CMD" ]; then
                echo -e "${RED}      ❌ npm non trouvé${NC}"
                exit 1
            fi
            $NPM_CMD ci --only=production
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
        $PM2_CMD delete "$service" 2>/dev/null || true
        
        # S'assurer que npm est dans le PATH pour PM2
        if [ -n "$NPM_CMD" ] && [[ "$NPM_CMD" == *"/nvm/"* ]]; then
            NPM_DIR="$(dirname "$NPM_CMD")"
            export PATH="$NPM_DIR:$PATH"
        fi
        
        $PM2_CMD start npm --name "$service" -- start || $PM2_CMD restart "$service" --update-env
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

    # Réutiliser les commandes détectées au début
    # PNPM_CMD et NPM_CMD sont déjà définis plus haut

    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}      Installation des dépendances production...${NC}"
        if [ -n "$PNPM_CMD" ]; then
            $PNPM_CMD install --prod
        elif [ -n "$NPM_CMD" ]; then
            $NPM_CMD ci --only=production
        else
            echo -e "${RED}      ❌ pnpm et npm non trouvés${NC}"
            exit 1
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

    $PM2_CMD delete frontend 2>/dev/null || true
    
    # S'assurer que pnpm/npm est dans le PATH pour PM2
    if [ -n "$PNPM_CMD" ] && [[ "$PNPM_CMD" == *"/nvm/"* ]]; then
        PNPM_DIR="$(dirname "$PNPM_CMD")"
        export PATH="$PNPM_DIR:$PATH"
    elif [ -n "$NPM_CMD" ] && [[ "$NPM_CMD" == *"/nvm/"* ]]; then
        NPM_DIR="$(dirname "$NPM_CMD")"
        export PATH="$NPM_DIR:$PATH"
    fi
    
    if [ -n "$PNPM_CMD" ]; then
        $PM2_CMD start $PNPM_CMD --name "frontend" -- start || $PM2_CMD restart frontend --update-env
    elif [ -n "$NPM_CMD" ]; then
        $PM2_CMD start npm --name "frontend" -- start || $PM2_CMD restart frontend --update-env
    else
        echo -e "${RED}   ❌ Impossible de démarrer le frontend: ni pnpm ni npm trouvé${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}   ✅ Frontend démarré sur port 3000${NC}"
else
    echo -e "${YELLOW}   ⚠️  Frontend/.next manquant, frontend ignoré${NC}"
fi

# Sauvegarder la configuration PM2
$PM2_CMD save

# Configurer PM2 pour le démarrage automatique (utiliser l'utilisateur réel si sous sudo)
PM2_USER="$REAL_USER"
PM2_HOME="$REAL_HOME"
if [ -z "$PM2_USER" ] || [ "$PM2_USER" = "root" ]; then
    PM2_USER="$(whoami)"
    PM2_HOME="$HOME"
fi

$PM2_CMD startup systemd -u "$PM2_USER" --hp "$PM2_HOME" 2>/dev/null || true

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
if [ -n "$PM2_CMD" ]; then
    echo -e "   ${YELLOW}$PM2_CMD status${NC} - Voir l'état des services"
    echo -e "   ${YELLOW}$PM2_CMD logs${NC} - Voir les logs"
    echo -e "   ${YELLOW}$PM2_CMD monit${NC} - Monitoring en temps réel"
fi
echo -e "   ${YELLOW}sudo systemctl status nginx${NC} - Vérifier nginx"
echo -e "   ${YELLOW}sudo nginx -t${NC} - Tester la configuration nginx"
echo ""
echo -e "${BLUE}💡 Informations de détection:${NC}"
echo -e "   Node.js: $NODE_VERSION ($NODE_CMD)"
if [ -n "$NPM_CMD" ]; then
    echo -e "   npm: $NPM_CMD"
fi
if [ -n "$PNPM_CMD" ]; then
    echo -e "   pnpm: $PNPM_CMD"
fi
if [ -n "$PM2_CMD" ]; then
    echo -e "   PM2: $PM2_CMD"
fi
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo -e "   - Assurez-vous que le certificat SSL est configuré dans:"
echo -e "     /etc/letsencrypt/live/viridial.com/"
echo -e "   - Vérifiez que le DNS pointe vers ce serveur:"
echo -e "     www.viridial.com -> $(curl -s ifconfig.me 2>/dev/null || echo 'IP_DU_SERVEUR')"
echo ""

