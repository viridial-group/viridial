#!/bin/bash
# Script to setup SSL/TLS certificates with Let's Encrypt for viridial.com
# Usage: ./scripts/setup-ssl-certificates.sh

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔒 SSL Certificate Setup with Let's Encrypt                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if running on VPS
if [ ! -d "/opt/viridial" ] && [ -z "$SSH_CONNECTION" ]; then
  echo "⚠️  This script must be run on the VPS"
  echo ""
  echo "To run from local:"
  echo "   ssh root@148.230.112.148 'cd /opt/viridial && ./scripts/setup-ssl-certificates.sh'"
  echo ""
  exit 1
fi

VPS_DIR="${VIRIDIAL_DIR:-/opt/viridial}"
cd "$VPS_DIR" || {
  echo "❌ Directory $VPS_DIR not found"
  exit 1
}

echo "📂 Directory: ${VPS_DIR}"
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
  echo "📦 Installing certbot..."
  
  # Detect OS
  if [ -f /etc/debian_version ]; then
    # Debian/Ubuntu
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
  elif [ -f /etc/redhat-release ]; then
    # CentOS/RHEL
    yum install -y certbot python3-certbot-nginx
  else
    echo "❌ Unsupported OS. Please install certbot manually."
    exit 1
  fi
  echo "   ✅ Certbot installed"
else
  echo "✅ Certbot is already installed"
fi
echo ""

# Create directory for ACME challenge
echo "📁 Creating ACME challenge directory..."
mkdir -p /var/www/certbot
chmod 755 /var/www/certbot
echo "   ✅ Directory created"
echo ""

# Check if certificates already exist
if [ -d "/etc/letsencrypt/live/viridial.com" ]; then
  echo "⚠️  SSL certificates already exist for viridial.com"
  echo ""
  read -p "Do you want to renew them? (y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Renewing certificates..."
    certbot renew --dry-run
    echo "   ✅ Certificate renewal test successful"
    echo ""
    echo "To actually renew (when needed):"
    echo "   certbot renew"
    exit 0
  else
    echo "✅ Using existing certificates"
    exit 0
  fi
fi

# Check if nginx is running
if ! docker ps | grep -q viridial-nginx; then
  echo "⚠️  Nginx container is not running"
  echo "   Starting nginx temporarily for certificate validation..."
  cd infrastructure/docker-compose
  docker compose -f app-frontend.yml up -d nginx
  sleep 3
  cd "$VPS_DIR"
fi

# Request certificates
echo "🔐 Requesting SSL certificates from Let's Encrypt..."
echo ""
echo "This will use standalone mode (temporarily stops nginx on port 80)"
echo ""

# Stop nginx temporarily for standalone mode
docker stop viridial-nginx 2>/dev/null || true

# Request certificate
certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --email admin@viridial.com \
  -d viridial.com \
  -d www.viridial.com \
  --preferred-challenges http

# Restart nginx
echo ""
echo "🔄 Restarting nginx with SSL configuration..."
cd infrastructure/docker-compose
docker compose -f app-frontend.yml up -d nginx
cd "$VPS_DIR"

# Verify certificates
if [ -f "/etc/letsencrypt/live/viridial.com/fullchain.pem" ]; then
  echo ""
  echo "✅ SSL certificates successfully installed!"
  echo ""
  echo "📋 Certificate details:"
  echo "   Certificate: /etc/letsencrypt/live/viridial.com/fullchain.pem"
  echo "   Private Key: /etc/letsencrypt/live/viridial.com/privkey.pem"
  echo ""
  echo "🔍 Testing HTTPS..."
  sleep 2
  if curl -sI https://viridial.com | grep -q "HTTP"; then
    echo "   ✅ HTTPS is working!"
  else
    echo "   ⚠️  HTTPS test failed - check nginx logs"
  fi
  echo ""
  echo "📋 Next steps:"
  echo "   1. Verify HTTPS works: https://viridial.com"
  echo "   2. Check certificate auto-renewal is set up"
  echo "   3. Update all environment variables to use HTTPS"
  echo ""
  echo "🔄 Certificate auto-renewal:"
  echo "   Add to crontab (runs twice daily):"
  echo "   0 0,12 * * * certbot renew --quiet --deploy-hook 'cd /opt/viridial/infrastructure/docker-compose && docker compose -f app-frontend.yml restart nginx'"
  echo ""
else
  echo ""
  echo "❌ Certificate installation failed"
  echo "   Check the error messages above"
  exit 1
fi

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ SSL Setup Complete                                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

