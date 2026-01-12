#!/bin/bash

# Script de diagnostic pour le déploiement production Viridial
# Vérifie l'état de tous les services et composants

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Diagnostic du déploiement production Viridial${NC}"
echo ""

# 1. Vérifier PM2 et les services
echo -e "${BLUE}1. Vérification PM2 et services backend...${NC}"
if command -v pm2 >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ PM2 installé${NC}"
    pm2 list
else
    echo -e "${RED}   ❌ PM2 non installé${NC}"
fi

echo ""

# 2. Vérifier les services backend
echo -e "${BLUE}2. Vérification des services backend (ports 3001-3006)...${NC}"
BACKEND_SERVICES=("auth-service:3001" "property-service:3003" "geolocation-service:3003" "search-service:3004" "marketing-service:3005" "review-service:3006")

for service_port in "${BACKEND_SERVICES[@]}"; do
    IFS=':' read -r service port <<< "$service_port"
    if command -v lsof >/dev/null 2>&1; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            PID=$(lsof -Pi :$port -sTCP:LISTEN -t)
            echo -e "${GREEN}   ✅ $service écoute sur le port $port (PID: $PID)${NC}"
        else
            echo -e "${RED}   ❌ $service n'écoute PAS sur le port $port${NC}"
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -tuln | grep -q ":$port "; then
            echo -e "${GREEN}   ✅ $service écoute sur le port $port${NC}"
        else
            echo -e "${RED}   ❌ $service n'écoute PAS sur le port $port${NC}"
        fi
    elif command -v ss >/dev/null 2>&1; then
        if ss -tuln | grep -q ":$port "; then
            echo -e "${GREEN}   ✅ $service écoute sur le port $port${NC}"
        else
            echo -e "${RED}   ❌ $service n'écoute PAS sur le port $port${NC}"
        fi
    else
        # Test de connexion simple avec curl
        if curl -s http://localhost:$port/health >/dev/null 2>&1 || curl -s http://localhost:$port >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ $service répond sur le port $port${NC}"
        else
            echo -e "${RED}   ❌ $service ne répond PAS sur le port $port${NC}"
        fi
    fi
done

echo ""

# 3. Vérifier le frontend
echo -e "${BLUE}3. Vérification du frontend (port 3000)...${NC}"
if command -v lsof >/dev/null 2>&1; then
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -Pi :3000 -sTCP:LISTEN -t)
        echo -e "${GREEN}   ✅ Frontend écoute sur le port 3000 (PID: $PID)${NC}"
    else
        echo -e "${RED}   ❌ Frontend n'écoute PAS sur le port 3000${NC}"
    fi
elif command -v netstat >/dev/null 2>&1; then
    if netstat -tuln | grep -q ":3000 "; then
        echo -e "${GREEN}   ✅ Frontend écoute sur le port 3000${NC}"
    else
        echo -e "${RED}   ❌ Frontend n'écoute PAS sur le port 3000${NC}"
    fi
elif command -v ss >/dev/null 2>&1; then
    if ss -tuln | grep -q ":3000 "; then
        echo -e "${GREEN}   ✅ Frontend écoute sur le port 3000${NC}"
    else
        echo -e "${RED}   ❌ Frontend n'écoute PAS sur le port 3000${NC}"
    fi
else
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Frontend répond sur le port 3000${NC}"
    else
        echo -e "${RED}   ❌ Frontend ne répond PAS sur le port 3000${NC}"
    fi
fi

echo ""

# 4. Vérifier Nginx
echo -e "${BLUE}4. Vérification Nginx...${NC}"
if command -v nginx >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Nginx installé${NC}"
    
    # Vérifier si Nginx est en cours d'exécution
    if systemctl is-active --quiet nginx 2>/dev/null || service nginx status >/dev/null 2>&1 || pgrep nginx >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Nginx est en cours d'exécution${NC}"
    else
        echo -e "${RED}   ❌ Nginx n'est PAS en cours d'exécution${NC}"
        echo -e "${YELLOW}   💡 Démarrez avec: sudo systemctl start nginx${NC}"
    fi
    
    # Vérifier les ports Nginx (80 et 443)
    if command -v lsof >/dev/null 2>&1; then
        if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Nginx écoute sur le port 80 (HTTP)${NC}"
        else
            echo -e "${RED}   ❌ Nginx n'écoute PAS sur le port 80${NC}"
        fi
        
        if lsof -Pi :443 -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Nginx écoute sur le port 443 (HTTPS)${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Nginx n'écoute PAS sur le port 443 (peut-être pas de SSL configuré)${NC}"
        fi
    fi
    
    # Tester la configuration
    if sudo nginx -t 2>/dev/null; then
        echo -e "${GREEN}   ✅ Configuration Nginx valide${NC}"
    else
        echo -e "${RED}   ❌ Configuration Nginx INVALIDE${NC}"
        echo -e "${YELLOW}   💡 Vérifiez avec: sudo nginx -t${NC}"
    fi
else
    echo -e "${RED}   ❌ Nginx n'est PAS installé${NC}"
    echo -e "${YELLOW}   💡 Installez avec: sudo apt-get install nginx (Debian/Ubuntu) ou sudo yum install nginx (RHEL/CentOS)${NC}"
fi

echo ""

# 5. Vérifier les certificats SSL
echo -e "${BLUE}5. Vérification des certificats SSL (Let's Encrypt)...${NC}"
SSL_CERT_PATH="/etc/letsencrypt/live/viridial.com/fullchain.pem"
SSL_KEY_PATH="/etc/letsencrypt/live/viridial.com/privkey.pem"

if [ -f "$SSL_CERT_PATH" ]; then
    echo -e "${GREEN}   ✅ Certificat SSL trouvé: $SSL_CERT_PATH${NC}"
    
    # Vérifier la date d'expiration
    if command -v openssl >/dev/null 2>&1; then
        EXPIRY=$(sudo openssl x509 -enddate -noout -in "$SSL_CERT_PATH" 2>/dev/null | cut -d= -f2)
        if [ -n "$EXPIRY" ]; then
            echo -e "${BLUE}      Expiration: $EXPIRY${NC}"
        fi
    fi
else
    echo -e "${RED}   ❌ Certificat SSL non trouvé: $SSL_CERT_PATH${NC}"
    echo -e "${YELLOW}   💡 Installez avec certbot: sudo certbot --nginx -d viridial.com -d www.viridial.com${NC}"
fi

if [ -f "$SSL_KEY_PATH" ]; then
    echo -e "${GREEN}   ✅ Clé privée SSL trouvée: $SSL_KEY_PATH${NC}"
else
    echo -e "${RED}   ❌ Clé privée SSL non trouvée: $SSL_KEY_PATH${NC}"
fi

echo ""

# 6. Vérifier la configuration DNS / /etc/hosts
echo -e "${BLUE}6. Vérification de la résolution DNS...${NC}"
if host www.viridial.com >/dev/null 2>&1 || nslookup www.viridial.com >/dev/null 2>&1; then
    IP=$(host www.viridial.com 2>/dev/null | grep "has address" | awk '{print $4}' | head -n1 || \
         nslookup www.viridial.com 2>/dev/null | grep "Address:" | tail -n1 | awk '{print $2}')
    
    if [ -n "$IP" ]; then
        SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')
        echo -e "${BLUE}   www.viridial.com résout vers: $IP${NC}"
        if [ -n "$SERVER_IP" ]; then
            echo -e "${BLUE}   IP du serveur: $SERVER_IP${NC}"
            if [ "$IP" = "$SERVER_IP" ] || echo "$SERVER_IP" | grep -q "$IP"; then
                echo -e "${GREEN}   ✅ DNS pointe vers ce serveur${NC}"
            else
                echo -e "${YELLOW}   ⚠️  DNS pointe vers une autre IP ($IP vs $SERVER_IP)${NC}"
                echo -e "${YELLOW}   💡 Pour test local, ajoutez à /etc/hosts: $SERVER_IP www.viridial.com viridial.com${NC}"
            fi
        fi
    fi
else
    echo -e "${YELLOW}   ⚠️  www.viridial.com ne résout pas (DNS non configuré ou serveur local)${NC}"
    
    # Vérifier /etc/hosts
    if [ -f "/etc/hosts" ] && grep -q "viridial.com" /etc/hosts; then
        echo -e "${BLUE}   Configuration trouvée dans /etc/hosts:${NC}"
        grep "viridial.com" /etc/hosts | sed 's/^/      /'
    else
        SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')
        if [ -n "$SERVER_IP" ]; then
            echo -e "${YELLOW}   💡 Pour test local, ajoutez à /etc/hosts:${NC}"
            echo -e "${BLUE}      echo '$SERVER_IP www.viridial.com viridial.com' | sudo tee -a /etc/hosts${NC}"
        fi
    fi
fi

echo ""

# 7. Vérifier le firewall
echo -e "${BLUE}7. Vérification du firewall...${NC}"
if command -v ufw >/dev/null 2>&1; then
    if ufw status | grep -q "Status: active"; then
        echo -e "${YELLOW}   ⚠️  UFW est actif${NC}"
        if ufw status | grep -q "80/tcp\|443/tcp"; then
            echo -e "${GREEN}   ✅ Ports 80 et 443 sont ouverts${NC}"
        else
            echo -e "${RED}   ❌ Ports 80 et 443 peuvent être bloqués${NC}"
            echo -e "${YELLOW}   💡 Ouvrez avec: sudo ufw allow 80/tcp && sudo ufw allow 443/tcp${NC}"
        fi
    else
        echo -e "${GREEN}   ✅ UFW est inactif${NC}"
    fi
elif command -v firewall-cmd >/dev/null 2>&1; then
    if firewall-cmd --state 2>/dev/null | grep -q "running"; then
        echo -e "${YELLOW}   ⚠️  firewalld est actif${NC}"
        if firewall-cmd --list-ports 2>/dev/null | grep -q "80/tcp\|443/tcp"; then
            echo -e "${GREEN}   ✅ Ports 80 et 443 sont ouverts${NC}"
        else
            echo -e "${RED}   ❌ Ports 80 et 443 peuvent être bloqués${NC}"
            echo -e "${YELLOW}   💡 Ouvrez avec: sudo firewall-cmd --permanent --add-service=http && sudo firewall-cmd --permanent --add-service=https && sudo firewall-cmd --reload${NC}"
        fi
    fi
else
    echo -e "${BLUE}   ℹ️  Aucun firewall détecté (ufw/firewalld)${NC}"
fi

echo ""

# 8. Vérifier les logs Nginx (dernières erreurs)
echo -e "${BLUE}8. Dernières erreurs Nginx (10 dernières lignes)...${NC}"
if [ -f "/var/log/nginx/error.log" ]; then
    echo -e "${BLUE}   Logs d'erreur:${NC}"
    sudo tail -n 10 /var/log/nginx/error.log 2>/dev/null | sed 's/^/      /' || echo -e "${YELLOW}      Impossible de lire les logs${NC}"
else
    echo -e "${YELLOW}   ⚠️  Fichier de log Nginx non trouvé${NC}"
fi

echo ""

# 9. Test de connexion local
echo -e "${BLUE}9. Test de connexion local...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200\|301\|302"; then
    echo -e "${GREEN}   ✅ Frontend répond sur localhost:3000${NC}"
else
    echo -e "${RED}   ❌ Frontend ne répond PAS sur localhost:3000${NC}"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null | grep -q "200\|301\|302\|400\|502\|503"; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null)
    echo -e "${BLUE}   Nginx répond sur localhost (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}   ❌ Nginx ne répond PAS sur localhost${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 Résumé des actions recommandées:${NC}"
echo ""
echo -e "${YELLOW}Si les services ne sont pas démarrés:${NC}"
echo -e "   ${BLUE}./deploy-production.sh${NC}"
echo ""
echo -e "${YELLOW}Si Nginx n'est pas démarré:${NC}"
echo -e "   ${BLUE}sudo systemctl start nginx${NC}"
echo ""
echo -e "${YELLOW}Si les certificats SSL manquent:${NC}"
echo -e "   ${BLUE}sudo certbot --nginx -d viridial.com -d www.viridial.com${NC}"
echo ""
echo -e "${YELLOW}Si DNS n'est pas configuré (test local):${NC}"
echo -e "   ${BLUE}echo '127.0.0.1 www.viridial.com viridial.com' | sudo tee -a /etc/hosts${NC}"
echo ""
echo -e "${YELLOW}Si le firewall bloque les ports:${NC}"
echo -e "   ${BLUE}sudo ufw allow 80/tcp && sudo ufw allow 443/tcp${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

