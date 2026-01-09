#!/bin/bash

# Script de correction rapide pour ERR_CONNECTION_REFUSED
# Automatise les vérifications et corrections courantes

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Correction ERR_CONNECTION_REFUSED pour www.viridial.com${NC}"
echo ""

# 1. Vérifier et démarrer Nginx
echo -e "${BLUE}1. Vérification Nginx...${NC}"
if command -v nginx >/dev/null 2>&1; then
    if systemctl is-active --quiet nginx 2>/dev/null || service nginx status >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Nginx est en cours d'exécution${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Nginx n'est pas démarré, démarrage...${NC}"
        sudo systemctl start nginx || sudo service nginx start || {
            echo -e "${RED}   ❌ Impossible de démarrer Nginx${NC}"
            exit 1
        }
        echo -e "${GREEN}   ✅ Nginx démarré${NC}"
    fi
    
    # Vérifier la configuration
    if sudo nginx -t 2>/dev/null; then
        echo -e "${GREEN}   ✅ Configuration Nginx valide${NC}"
    else
        echo -e "${RED}   ❌ Configuration Nginx invalide${NC}"
        echo -e "${YELLOW}   💡 Corrigez avec: sudo nginx -t${NC}"
        exit 1
    fi
else
    echo -e "${RED}   ❌ Nginx n'est pas installé${NC}"
    echo -e "${BLUE}   Installation de Nginx...${NC}"
    if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get update && sudo apt-get install -y nginx
    elif command -v yum >/dev/null 2>&1; then
        sudo yum install -y nginx
    else
        echo -e "${RED}   ❌ Impossible d'installer Nginx automatiquement${NC}"
        exit 1
    fi
fi

echo ""

# 2. Vérifier et démarrer les services avec PM2
echo -e "${BLUE}2. Vérification des services backend...${NC}"
if command -v pm2 >/dev/null 2>&1; then
    # Vérifier si des services sont déjà démarrés
    if pm2 list | grep -q "online\|stopped"; then
        echo -e "${BLUE}   Redémarrage des services existants...${NC}"
        pm2 restart all || true
        pm2 save
    else
        echo -e "${YELLOW}   ⚠️  Aucun service PM2 trouvé${NC}"
        echo -e "${BLUE}   💡 Démarrez avec: ./deploy-production.sh${NC}"
        echo -e "${YELLOW}   Ou démarrez manuellement chaque service depuis /opt/viridial${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  PM2 n'est pas installé${NC}"
    echo -e "${BLUE}   Installation de PM2...${NC}"
    if command -v npm >/dev/null 2>&1; then
        sudo npm install -g pm2
    else
        echo -e "${RED}   ❌ npm non trouvé, impossible d'installer PM2${NC}"
        exit 1
    fi
fi

echo ""

# 3. Vérifier les ports
echo -e "${BLUE}3. Vérification des ports...${NC}"

check_port() {
    local port=$1
    local service=$2
    
    if command -v lsof >/dev/null 2>&1; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Port $port ouvert ($service)${NC}"
            return 0
        else
            echo -e "${RED}   ❌ Port $port fermé ($service)${NC}"
            return 1
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -tuln | grep -q ":$port "; then
            echo -e "${GREEN}   ✅ Port $port ouvert ($service)${NC}"
            return 0
        else
            echo -e "${RED}   ❌ Port $port fermé ($service)${NC}"
            return 1
        fi
    else
        # Test de connexion simple
        if curl -s --max-time 2 http://localhost:$port >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Port $port répond ($service)${NC}"
            return 0
        else
            echo -e "${RED}   ❌ Port $port ne répond pas ($service)${NC}"
            return 1
        fi
    fi
}

PORTS_OK=true
check_port 3000 "Frontend" || PORTS_OK=false
check_port 3001 "Auth Service" || PORTS_OK=false
check_port 80 "Nginx HTTP" || PORTS_OK=false
check_port 443 "Nginx HTTPS" || PORTS_OK=false

if [ "$PORTS_OK" = "false" ]; then
    echo -e "${YELLOW}   ⚠️  Certains ports ne sont pas ouverts${NC}"
    echo -e "${YELLOW}   💡 Vérifiez que les services sont démarrés${NC}"
fi

echo ""

# 4. Vérifier le firewall
echo -e "${BLUE}4. Vérification du firewall...${NC}"
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
    echo -e "${YELLOW}   ⚠️  UFW est actif, vérification des ports...${NC}"
    if ! ufw status | grep -q "80/tcp\|443/tcp"; then
        echo -e "${BLUE}   Ouverture des ports 80 et 443...${NC}"
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        sudo ufw reload
        echo -e "${GREEN}   ✅ Ports 80 et 443 ouverts${NC}"
    else
        echo -e "${GREEN}   ✅ Ports 80 et 443 déjà autorisés${NC}"
    fi
elif command -v firewall-cmd >/dev/null 2>&1 && firewall-cmd --state 2>/dev/null | grep -q "running"; then
    echo -e "${YELLOW}   ⚠️  firewalld est actif, vérification des ports...${NC}"
    if ! firewall-cmd --list-ports 2>/dev/null | grep -q "80/tcp\|443/tcp"; then
        echo -e "${BLUE}   Ouverture des ports 80 et 443...${NC}"
        sudo firewall-cmd --permanent --add-service=http
        sudo firewall-cmd --permanent --add-service=https
        sudo firewall-cmd --reload
        echo -e "${GREEN}   ✅ Ports 80 et 443 ouverts${NC}"
    else
        echo -e "${GREEN}   ✅ Ports 80 et 443 déjà autorisés${NC}"
    fi
else
    echo -e "${GREEN}   ✅ Aucun firewall actif détecté${NC}"
fi

echo ""

# 5. Vérifier les certificats SSL
echo -e "${BLUE}5. Vérification des certificats SSL...${NC}"
SSL_CERT="/etc/letsencrypt/live/viridial.com/fullchain.pem"
if [ -f "$SSL_CERT" ]; then
    echo -e "${GREEN}   ✅ Certificat SSL trouvé${NC}"
else
    echo -e "${YELLOW}   ⚠️  Certificat SSL non trouvé${NC}"
    echo -e "${BLUE}   💡 Installez avec: sudo certbot --nginx -d viridial.com -d www.viridial.com${NC}"
    echo -e "${YELLOW}   Pour l'instant, le site fonctionnera en HTTP uniquement${NC}"
fi

echo ""

# 6. Vérifier DNS (suggestion)
echo -e "${BLUE}6. Vérification DNS...${NC}"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')

if host www.viridial.com >/dev/null 2>&1; then
    DNS_IP=$(host www.viridial.com 2>/dev/null | grep "has address" | awk '{print $4}' | head -n1)
    echo -e "${BLUE}   www.viridial.com résout vers: $DNS_IP${NC}"
    if [ -n "$SERVER_IP" ]; then
        echo -e "${BLUE}   IP du serveur: $SERVER_IP${NC}"
        if [ "$DNS_IP" = "$SERVER_IP" ]; then
            echo -e "${GREEN}   ✅ DNS correctement configuré${NC}"
        else
            echo -e "${YELLOW}   ⚠️  DNS pointe vers une autre IP${NC}"
            echo -e "${YELLOW}   💡 Pour test local, ajoutez à /etc/hosts:${NC}"
            echo -e "${BLUE}      echo '$SERVER_IP www.viridial.com viridial.com' | sudo tee -a /etc/hosts${NC}"
        fi
    fi
else
    echo -e "${YELLOW}   ⚠️  DNS non configuré${NC}"
    if [ -n "$SERVER_IP" ]; then
        echo -e "${YELLOW}   💡 Pour test local, ajoutez à /etc/hosts:${NC}"
        echo -e "${BLUE}      echo '$SERVER_IP www.viridial.com viridial.com' | sudo tee -a /etc/hosts${NC}"
    fi
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Corrections appliquées                                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Prochaines étapes:${NC}"
echo ""
echo -e "${YELLOW}1. Si les services ne sont pas démarrés:${NC}"
echo -e "   ${BLUE}./deploy-production.sh${NC}"
echo ""
echo -e "${YELLOW}2. Si les certificats SSL manquent:${NC}"
echo -e "   ${BLUE}sudo certbot --nginx -d viridial.com -d www.viridial.com${NC}"
echo ""
echo -e "${YELLOW}3. Vérifier l'état complet:${NC}"
echo -e "   ${BLUE}./check-production-status.sh${NC}"
echo ""
echo -e "${YELLOW}4. Tester localement:${NC}"
echo -e "   ${BLUE}curl -I http://localhost${NC}"
echo -e "   ${BLUE}curl -I https://localhost${NC}  # Si SSL configuré"
echo ""

