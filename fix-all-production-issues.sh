#!/bin/bash

# Script de correction complète pour tous les problèmes de production
# Basé sur le diagnostic check-production-status.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Détecter le répertoire du projet (peut être /opt/viridial ou /Users/mac/viridial)
if [ -d "/opt/viridial" ]; then
    PROJECT_ROOT="/opt/viridial"
elif [ -d "/root/viridial" ]; then
    PROJECT_ROOT="/root/viridial"
else
    # Essayer de détecter depuis le répertoire courant
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -f "$SCRIPT_DIR/deploy/production-nginx.conf" ]; then
        PROJECT_ROOT="$SCRIPT_DIR"
    else
        PROJECT_ROOT="/opt/viridial"  # Par défaut
    fi
fi
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
NGINX_CONF_FILE="viridial-production.conf"

echo -e "${BLUE}🔧 Correction complète des problèmes de production${NC}"
echo ""

# 1. Fix Nginx - Vérifier et activer la configuration
echo -e "${BLUE}1. Correction Nginx (ports 80/443)...${NC}"

# Vérifier si le fichier de configuration existe
if [ ! -f "$PROJECT_ROOT/deploy/production-nginx.conf" ]; then
    echo -e "${RED}   ❌ Fichier de configuration non trouvé: $PROJECT_ROOT/deploy/production-nginx.conf${NC}"
    echo -e "${YELLOW}   💡 Le script doit être exécuté depuis /opt/viridial${NC}"
    exit 1
fi

# Vérifier si une autre configuration utilise déjà les ports 80/443
echo -e "${BLUE}   Vérification des configurations existantes...${NC}"
CONFIG_EXISTS=false
if [ -f "$NGINX_CONF_DIR/$NGINX_CONF_FILE" ]; then
    CONFIG_EXISTS=true
    echo -e "${GREEN}   ✅ Configuration trouvée dans sites-available${NC}"
else
    echo -e "${YELLOW}   ⚠️  Configuration non trouvée, copie depuis deploy/...${NC}"
    sudo cp "$PROJECT_ROOT/deploy/production-nginx.conf" "$NGINX_CONF_DIR/$NGINX_CONF_FILE"
    CONFIG_EXISTS=true
fi

# Vérifier si le lien symbolique existe
if [ -L "$NGINX_ENABLED_DIR/$NGINX_CONF_FILE" ]; then
    echo -e "${GREEN}   ✅ Configuration déjà activée${NC}"
else
    echo -e "${YELLOW}   ⚠️  Configuration non activée, création du lien...${NC}"
    
    # Désactiver la configuration par défaut si elle existe
    if [ -L "$NGINX_ENABLED_DIR/default" ]; then
        echo -e "${BLUE}   Désactivation de la configuration par défaut...${NC}"
        sudo rm -f "$NGINX_ENABLED_DIR/default"
    fi
    
    # Créer le lien symbolique
    sudo ln -s "$NGINX_CONF_DIR/$NGINX_CONF_FILE" "$NGINX_ENABLED_DIR/$NGINX_CONF_FILE"
    echo -e "${GREEN}   ✅ Configuration activée${NC}"
fi

# Vérifier s'il y a d'autres configurations qui pourraient bloquer
OTHER_CONFIGS=$(ls -1 "$NGINX_ENABLED_DIR" 2>/dev/null | grep -v "$NGINX_CONF_FILE" | grep -v "^$" || true)
if [ -n "$OTHER_CONFIGS" ]; then
    echo -e "${YELLOW}   ⚠️  Autres configurations trouvées:${NC}"
    echo "$OTHER_CONFIGS" | sed 's/^/      - /'
    echo -e "${YELLOW}   💡 Vérifiez qu'elles n'utilisent pas les ports 80/443${NC}"
fi

# Tester la configuration
echo -e "${BLUE}   Test de la configuration...${NC}"
if sudo nginx -t 2>/dev/null; then
    echo -e "${GREEN}   ✅ Configuration valide${NC}"
    
    # Redémarrer Nginx pour appliquer les changements
    echo -e "${BLUE}   Redémarrage de Nginx...${NC}"
    sudo systemctl restart nginx 2>/dev/null || sudo service nginx restart 2>/dev/null || {
        echo -e "${RED}   ❌ Impossible de redémarrer Nginx${NC}"
        exit 1
    }
    
    # Attendre un peu pour que Nginx démarre
    sleep 2
    
    # Vérifier que Nginx écoute maintenant sur les ports
    if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Nginx écoute sur le port 80${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Nginx ne semble pas écouter sur le port 80${NC}"
        echo -e "${BLUE}   Vérification des logs...${NC}"
        sudo tail -20 /var/log/nginx/error.log | head -10
    fi
    
    if lsof -Pi :443 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Nginx écoute sur le port 443${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Nginx ne semble pas écouter sur le port 443 (normal si SSL non configuré)${NC}"
    fi
else
    echo -e "${RED}   ❌ Configuration invalide${NC}"
    sudo nginx -t
    exit 1
fi

echo ""

# 2. Démarrer les services manquants (search, marketing, review, frontend)
echo -e "${BLUE}2. Démarrage des services manquants...${NC}"

# Fonction pour démarrer un service
start_service() {
    local service=$1
    local port=$2
    local service_dir="$PROD_DIR/services/$service"
    
    if [ ! -d "$service_dir" ] || [ ! -f "$service_dir/package.json" ]; then
        echo -e "${YELLOW}   ⚠️  $service non trouvé dans $service_dir${NC}"
        return 1
    fi
    
    if [ ! -d "$service_dir/dist" ]; then
        echo -e "${YELLOW}   ⚠️  $service n'est pas buildé (dist manquant)${NC}"
        return 1
    fi
    
    # Vérifier si le port est déjà utilisé
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ $service écoute déjà sur le port $port${NC}"
        return 0
    fi
    
    echo -e "${BLUE}   Démarrage de $service...${NC}"
    cd "$service_dir"
    
    # Créer .env.local si manquant
    if [ ! -f ".env.local" ]; then
        echo -e "${BLUE}      Création .env.local...${NC}"
        cat > ".env.local" <<EOF
DATABASE_URL=\${DATABASE_URL}
PORT=$port
NODE_ENV=production
EOF
        # Charger DATABASE_URL depuis le .env principal si disponible
        if [ -f "$PROD_DIR/.env" ]; then
            source "$PROD_DIR/.env" 2>/dev/null || true
            sed -i "s|\${DATABASE_URL}|$DATABASE_URL|g" ".env.local" 2>/dev/null || true
        fi
    fi
    
    # Démarrer avec npm directement (sans PM2 pour l'instant)
    nohup npm run start:local > "/tmp/${service}.log" 2>&1 &
    local pid=$!
    
    # Attendre un peu pour voir si le service démarre
    sleep 3
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ $service démarré sur le port $port (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}   ❌ $service n'a pas démarré${NC}"
        echo -e "${YELLOW}   💡 Vérifiez les logs: tail /tmp/${service}.log${NC}"
        return 1
    fi
}

# Vérifier PROD_DIR (même logique que PROJECT_ROOT)
PROD_DIR="$PROJECT_ROOT"
if [ ! -d "$PROD_DIR" ]; then
    echo -e "${YELLOW}   ⚠️  Répertoire de production non trouvé: $PROD_DIR${NC}"
    echo -e "${YELLOW}   💡 Exécutez d'abord: ./deploy-production.sh${NC}"
    PROD_DIR="/opt/viridial"  # Fallback
    if [ ! -d "$PROD_DIR" ]; then
        echo -e "${RED}   ❌ Impossible de trouver le répertoire de production${NC}"
        exit 1
    fi
fi

if [ -d "$PROD_DIR" ]; then
    # Services backend manquants
    start_service "search-service" "3004"
    start_service "marketing-service" "3005"
    start_service "review-service" "3006"
    
    # Frontend
    FRONTEND_DIR="$PROD_DIR/frontend/web"
    if [ -d "$FRONTEND_DIR" ]; then
        if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Frontend écoute déjà sur le port 3000${NC}"
        else
            echo -e "${BLUE}   Démarrage du frontend...${NC}"
            cd "$FRONTEND_DIR"
            
            # Vérifier si .next existe
            if [ ! -d ".next" ] && [ ! -f "server.js" ]; then
                echo -e "${YELLOW}   ⚠️  Frontend n'est pas buildé${NC}"
                echo -e "${YELLOW}   💡 Build avec: cd frontend/web && pnpm run build${NC}"
            else
                # Créer .env.local si manquant
                if [ ! -f ".env.local" ]; then
                    echo -e "${BLUE}      Création .env.local...${NC}"
                    cat > ".env.local" <<EOF
NEXT_PUBLIC_AUTH_API_URL=https://www.viridial.com
NEXT_PUBLIC_PROPERTY_API_URL=https://www.viridial.com
NEXT_PUBLIC_SEARCH_API_URL=https://www.viridial.com
NEXT_PUBLIC_MARKETING_API_URL=https://www.viridial.com
NEXT_PUBLIC_REVIEW_API_URL=https://www.viridial.com
NEXT_PUBLIC_GEOLOCATION_API_URL=https://www.viridial.com
PORT=3000
NODE_ENV=production
EOF
                fi
                
                # Démarrer selon le mode
                if [ -f "server.js" ] || [ -f ".next/standalone/server.js" ]; then
                    # Mode standalone
                    SERVER_JS="server.js"
                    [ ! -f "$SERVER_JS" ] && SERVER_JS=".next/standalone/server.js"
                    nohup node "$SERVER_JS" --port 3000 > "/tmp/frontend.log" 2>&1 &
                else
                    # Mode standard
                    if command -v pnpm >/dev/null 2>&1 && [ -f "pnpm-lock.yaml" ]; then
                        nohup pnpm start > "/tmp/frontend.log" 2>&1 &
                    elif command -v npm >/dev/null 2>&1; then
                        nohup npm start > "/tmp/frontend.log" 2>&1 &
                    else
                        echo -e "${RED}   ❌ pnpm et npm non trouvés${NC}"
                    fi
                fi
                
                sleep 3
                if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
                    echo -e "${GREEN}   ✅ Frontend démarré sur le port 3000${NC}"
                else
                    echo -e "${RED}   ❌ Frontend n'a pas démarré${NC}"
                    echo -e "${YELLOW}   💡 Vérifiez les logs: tail /tmp/frontend.log${NC}"
                fi
            fi
        fi
    else
        echo -e "${YELLOW}   ⚠️  Frontend non trouvé dans $FRONTEND_DIR${NC}"
    fi
fi

echo ""

# 3. Résumé final
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Corrections appliquées${NC}"
echo ""
echo -e "${BLUE}📋 Vérification finale:${NC}"
echo -e "   ${YELLOW}./check-production-status.sh${NC}"
echo ""
echo -e "${BLUE}🌐 Test d'accès:${NC}"
echo -e "   ${YELLOW}curl -I http://localhost${NC}"
echo -e "   ${YELLOW}curl -I https://localhost${NC}  # Si SSL configuré"
echo ""
echo -e "${BLUE}📊 Logs utiles:${NC}"
echo -e "   ${YELLOW}sudo tail -f /var/log/nginx/error.log${NC}  # Erreurs Nginx"
echo -e "   ${YELLOW}sudo tail -f /var/log/nginx/access.log${NC} # Accès Nginx"
echo -e "   ${YELLOW}tail /tmp/*.log${NC}  # Logs des services"
echo ""
echo -e "${YELLOW}💡 Note: Les services ont été démarrés en arrière-plan (nohup).${NC}"
echo -e "${YELLOW}   Pour une gestion permanente, installez PM2:${NC}"
echo -e "   ${BLUE}npm install -g pm2${NC}"
echo -e "   ${BLUE}./deploy-production.sh${NC}"
echo ""

