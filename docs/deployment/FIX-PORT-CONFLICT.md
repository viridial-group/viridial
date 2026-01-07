# Fix Port Conflict - Port 3000 Already Allocated

## Quick Fix

If you see "port is already allocated" error, run these commands on the VPS:

```bash
# Find what's using port 3000
docker ps | grep 3000

# Stop the container using port 3000
docker ps --format '{{.ID}}\t{{.Names}}\t{{.Ports}}' | grep ':3000->' | awk '{print $1}' | xargs docker stop

# Or if you know the container name
docker stop <container-name>

# Then remove it
docker rm <container-name>

# Now redeploy
cd /opt/viridial/infrastructure/docker-compose
docker compose -f app-frontend.yml up -d --build frontend
```

## Alternative: Change Port Mapping

If you want to use a different port for the frontend:

Edit `infrastructure/docker-compose/app-frontend.yml`:

```yaml
ports:
  - "3001:3000"  # Change external port from 3000 to 3001
```

Then update nginx config if needed.

