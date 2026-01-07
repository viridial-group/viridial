# Troubleshooting: Domain Connection Issues

## Problem: `viridial.com refused to connect`

### Quick Diagnostic Checklist

Run these commands on your VPS to diagnose the issue:

```bash
# 1. Check if DNS is pointing to your VPS IP
dig +short viridial.com
nslookup viridial.com

# Expected output: 148.230.112.148

# 2. Check if containers are running
cd /opt/viridial/infrastructure/docker-compose
docker compose -f app-frontend.yml ps

# Expected: frontend and nginx should be "Up"

# 3. Check if nginx is listening on port 80
sudo netstat -tlnp | grep :80
# OR
sudo ss -tlnp | grep :80

# Expected: nginx should be listening on 0.0.0.0:80

# 4. Check nginx logs
docker compose -f app-frontend.yml logs nginx

# 5. Check if firewall allows port 80
sudo ufw status
# OR for firewalld
sudo firewall-cmd --list-ports

# 6. Test local connection
curl -I http://localhost
curl -I http://148.230.112.148
```

## Common Issues and Fixes

### Issue 1: DNS Not Configured

**Symptoms:**
- `dig viridial.com` returns nothing or wrong IP
- Domain doesn't resolve to `148.230.112.148`

**Fix:**
1. Log into your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare)
2. Go to DNS settings
3. Add/update these DNS records:
   ```
   Type: A
   Name: @
   Value: 148.230.112.148
   TTL: 3600

   Type: A
   Name: www
   Value: 148.230.112.148
   TTL: 3600
   ```
4. Wait 5-30 minutes for DNS propagation
5. Verify with: `dig viridial.com` or `nslookup viridial.com`

### Issue 2: Nginx Container Not Running

**Symptoms:**
- `docker ps` shows nginx as stopped or not listed
- Port 80 not listening

**Fix:**
```bash
cd /opt/viridial/infrastructure/docker-compose

# Check nginx status
docker compose -f app-frontend.yml ps nginx

# If not running, start it
docker compose -f app-frontend.yml up -d nginx

# Check logs for errors
docker compose -f app-frontend.yml logs nginx
```

### Issue 3: Firewall Blocking Port 80

**Symptoms:**
- Containers running but can't access from outside
- `curl http://148.230.112.148` works locally but not remotely

**Fix (UFW - Ubuntu/Debian):**
```bash
# Check status
sudo ufw status

# Allow HTTP (port 80)
sudo ufw allow 80/tcp

# Allow HTTPS (port 443) if needed
sudo ufw allow 443/tcp

# Reload firewall
sudo ufw reload
```

**Fix (firewalld - CentOS/RHEL):**
```bash
# Allow HTTP
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

**Fix (iptables directly):**
```bash
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
# Save rules (Ubuntu/Debian)
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

### Issue 4: Port 80 Already Used by Another Service

**Symptoms:**
- Nginx can't bind to port 80
- Error: `port is already allocated` or `bind: address already in use`

**Fix:**
```bash
# Find what's using port 80
sudo lsof -i :80
# OR
sudo netstat -tlnp | grep :80

# Stop the conflicting service
# If it's apache2:
sudo systemctl stop apache2
sudo systemctl disable apache2

# If it's another nginx:
sudo systemctl stop nginx
sudo systemctl disable nginx

# Then restart docker nginx
cd /opt/viridial/infrastructure/docker-compose
docker compose -f app-frontend.yml restart nginx
```

### Issue 5: Docker Network Issue

**Symptoms:**
- Nginx logs show "upstream connection refused" or "502 Bad Gateway"
- Frontend container not accessible from nginx

**Fix:**
```bash
cd /opt/viridial/infrastructure/docker-compose

# Verify network exists
docker network ls | grep viridial-network

# If missing, create it
docker network create viridial-network

# Restart services
docker compose -f app-frontend.yml down
docker compose -f app-frontend.yml up -d
```

### Issue 6: Nginx Configuration Error

**Symptoms:**
- Nginx container keeps restarting
- Logs show configuration errors

**Fix:**
```bash
# Test nginx config
docker compose -f app-frontend.yml exec nginx nginx -t

# If errors, check the config file
cat /opt/viridial/deploy/nginx/conf.d/default.conf

# Restart nginx after fixing
docker compose -f app-frontend.yml restart nginx
```

## Complete Verification Script

Run this on your VPS to verify everything:

```bash
#!/bin/bash
echo "=== Domain Connection Diagnostic ==="
echo ""

echo "1. DNS Check:"
DNS_IP=$(dig +short viridial.com)
if [ "$DNS_IP" = "148.230.112.148" ]; then
  echo "   ✅ DNS correctly points to 148.230.112.148"
else
  echo "   ❌ DNS points to: $DNS_IP (expected: 148.230.112.148)"
  echo "   Fix: Update DNS A record for viridial.com"
fi
echo ""

echo "2. Docker Containers:"
if docker ps | grep -q viridial-nginx; then
  echo "   ✅ Nginx container is running"
else
  echo "   ❌ Nginx container is NOT running"
  echo "   Fix: docker compose -f app-frontend.yml up -d nginx"
fi

if docker ps | grep -q viridial-frontend; then
  echo "   ✅ Frontend container is running"
else
  echo "   ❌ Frontend container is NOT running"
  echo "   Fix: docker compose -f app-frontend.yml up -d frontend"
fi
echo ""

echo "3. Port 80 Listening:"
if sudo netstat -tlnp 2>/dev/null | grep -q ":80 " || sudo ss -tlnp 2>/dev/null | grep -q ":80 "; then
  echo "   ✅ Port 80 is listening"
else
  echo "   ❌ Port 80 is NOT listening"
  echo "   Fix: Start nginx container"
fi
echo ""

echo "4. Local HTTP Test:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
  echo "   ✅ Local HTTP responds (code: $HTTP_CODE)"
else
  echo "   ❌ Local HTTP failed (code: $HTTP_CODE)"
fi
echo ""

echo "5. Firewall Check:"
if command -v ufw >/dev/null 2>&1; then
  if sudo ufw status | grep -q "80/tcp.*ALLOW"; then
    echo "   ✅ UFW allows port 80"
  else
    echo "   ⚠️  UFW might block port 80"
    echo "   Fix: sudo ufw allow 80/tcp"
  fi
elif command -v firewall-cmd >/dev/null 2>&1; then
  if sudo firewall-cmd --list-ports 2>/dev/null | grep -q "80/tcp"; then
    echo "   ✅ Firewalld allows port 80"
  else
    echo "   ⚠️  Firewalld might block port 80"
    echo "   Fix: sudo firewall-cmd --permanent --add-service=http"
  fi
else
  echo "   ⚠️  Could not check firewall (check iptables manually)"
fi
echo ""

echo "=== Diagnostic Complete ==="
```

## Quick Fix Commands

If you just want to get it working quickly:

```bash
# On your VPS
cd /opt/viridial/infrastructure/docker-compose

# 1. Ensure network exists
docker network create viridial-network 2>/dev/null || true

# 2. Ensure auth-service is running (required for nginx upstream)
docker compose -f app-auth.yml up -d auth-service 2>/dev/null || true

# 3. Start frontend and nginx
docker compose -f app-frontend.yml up -d

# 4. Check status
docker compose -f app-frontend.yml ps

# 5. Allow firewall (if using UFW)
sudo ufw allow 80/tcp 2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true

# 6. Test
curl -I http://localhost
```

## Next Steps After Fixing

1. **Configure DNS** (if not done):
   - Add A records for `viridial.com` and `www.viridial.com` pointing to `148.230.112.148`

2. **Setup SSL/TLS** (recommended):
   ```bash
   # Install certbot
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx

   # Get SSL certificate (adjust for your setup)
   # Note: This works best if nginx is installed on host, not in Docker
   # For Docker, consider using nginx-proxy or traefik
   ```

3. **Update CORS** in auth-service to include `https://viridial.com`

4. **Test from external network**:
   ```bash
   curl -I http://viridial.com
   curl -I http://148.230.112.148
   ```

