# HTTPS Setup Guide

This guide explains how to configure HTTPS (SSL/TLS) for all services in production.

## Overview

All production services now use HTTPS:
- Frontend: `https://viridial.com`
- Auth API: `https://viridial.com/auth`
- All HTTP requests are automatically redirected to HTTPS

## Prerequisites

1. Domain name (`viridial.com`) must be pointing to your VPS IP (`148.230.112.148`)
2. DNS A records configured:
   - `@` → `148.230.112.148`
   - `www` → `148.230.112.148`
3. Port 80 must be accessible from internet (for Let's Encrypt validation)

## Step 1: Install SSL Certificates

Run the setup script on your VPS:

```bash
cd /opt/viridial
chmod +x scripts/setup-ssl-certificates.sh
./scripts/setup-ssl-certificates.sh
```

Or manually:

```bash
# Install certbot
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Request certificates (standalone mode)
docker stop viridial-nginx
certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --email your-email@example.com \
  -d viridial.com \
  -d www.viridial.com

# Restart nginx
docker start viridial-nginx
```

## Step 2: Update Docker Compose

The `app-frontend.yml` already includes:
- SSL certificate volumes mounted to nginx
- HTTPS URLs in environment variables

**Update environment variables:**

```bash
cd /opt/viridial/infrastructure/docker-compose

# Create/update .env file
cat >> .env << EOF
FRONTEND_AUTH_API_URL=https://viridial.com
EOF
```

## Step 3: Rebuild and Deploy

```bash
cd /opt/viridial/infrastructure/docker-compose

# Rebuild frontend with HTTPS URLs
docker compose -f app-frontend.yml build --no-cache frontend

# Restart services
docker compose -f app-frontend.yml up -d frontend nginx

# Verify HTTPS is working
curl -I https://viridial.com
```

## Step 4: Setup Certificate Auto-Renewal

Let's Encrypt certificates expire every 90 days. Setup auto-renewal:

```bash
# Test renewal
certbot renew --dry-run

# Add to crontab
crontab -e

# Add this line (runs twice daily at midnight and noon)
0 0,12 * * * certbot renew --quiet --deploy-hook 'cd /opt/viridial/infrastructure/docker-compose && docker compose -f app-frontend.yml restart nginx' >> /var/log/certbot-renew.log 2>&1
```

## Step 5: Update Auth Service CORS

The auth-service CORS already includes HTTPS origins. If needed, update:

```typescript
// services/auth-service/src/main.ts
const allowedOrigins = [
  'https://viridial.com',
  'https://www.viridial.com',
  // ... other origins
];
```

Then rebuild and redeploy auth-service:

```bash
cd /opt/viridial/infrastructure/docker-compose
docker compose -f app-auth.yml build --no-cache auth-service
docker compose -f app-auth.yml up -d auth-service
```

## Verification

Test HTTPS from different locations:

```bash
# Test HTTPS
curl -I https://viridial.com

# Test HTTP redirect
curl -I http://viridial.com
# Should return: HTTP/1.1 301 Moved Permanently

# Test API endpoint
curl -I https://viridial.com/auth/health

# Check SSL certificate
openssl s_client -connect viridial.com:443 -servername viridial.com < /dev/null
```

Expected responses:
- HTTPS requests: `HTTP/1.1 200 OK` or `HTTP/1.1 307 Temporary Redirect`
- HTTP requests: `HTTP/1.1 301 Moved Permanently` with `Location: https://viridial.com/...`

## Troubleshooting

### Certificate Installation Fails

**Error: "Could not bind to port 80"**
```bash
# Stop nginx temporarily
docker stop viridial-nginx

# Try certbot again
certbot certonly --standalone -d viridial.com -d www.viridial.com

# Restart nginx
docker start viridial-nginx
```

### HTTPS Not Working After Setup

1. **Check nginx is running:**
   ```bash
   docker ps | grep viridial-nginx
   ```

2. **Check nginx logs:**
   ```bash
   docker compose -f app-frontend.yml logs nginx
   ```

3. **Verify certificates are mounted:**
   ```bash
   docker exec viridial-nginx ls -la /etc/letsencrypt/live/viridial.com/
   ```

4. **Test nginx config:**
   ```bash
   docker exec viridial-nginx nginx -t
   ```

### Certificate Renewal Fails

If auto-renewal fails:

```bash
# Manual renewal
certbot renew --force-renewal

# Restart nginx after renewal
cd /opt/viridial/infrastructure/docker-compose
docker compose -f app-frontend.yml restart nginx
```

### Mixed Content Warnings

If you see "Mixed Content" warnings in browser:
- Ensure all API calls use HTTPS
- Check `NEXT_PUBLIC_AUTH_API_URL` is set to `https://viridial.com`
- Clear browser cache

## Security Headers

The nginx configuration includes these security headers:
- `Strict-Transport-Security`: Forces HTTPS for 1 year
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: XSS protection

## SSL Configuration

Using modern, secure SSL configuration:
- **Protocols**: TLSv1.2 and TLSv1.3 only
- **Ciphers**: Strong, modern cipher suites
- **HSTS**: Enabled with subdomains included
- **OCSP Stapling**: Enabled for better performance

## Environment Variables

Update all production environment variables to use HTTPS:

```bash
# Frontend
NEXT_PUBLIC_AUTH_API_URL=https://viridial.com

# Auth Service (if referencing frontend)
FRONTEND_URL=https://viridial.com
```

## Production Checklist

- [ ] DNS A records point to VPS IP
- [ ] SSL certificates installed via Let's Encrypt
- [ ] Nginx configured with SSL certificates
- [ ] HTTP to HTTPS redirect working
- [ ] Frontend rebuilt with HTTPS URLs
- [ ] Auth service CORS includes HTTPS origins
- [ ] Certificate auto-renewal configured
- [ ] All services tested and working over HTTPS
- [ ] Browser shows valid SSL certificate (green padlock)

## References

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot User Guide](https://eff-certbot.readthedocs.io/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/) - Test your SSL configuration

