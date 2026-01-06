# Deployment on VPS with Docker

This repo includes Dockerfiles and a `docker-compose.yml` for running the Java backend (Identity Service) and a shadcn-vue frontend behind Nginx.

Prerequisites on VPS:
- Docker
- Docker Compose v2
- Git

Quick start (on VPS):

```bash
git clone <repo> /opt/viridial
cd /opt/viridial
cp .env.example .env
# Edit .env to set secure passwords and DB settings
docker compose up --build -d
```

Access:
- Frontend: http://<VPS_IP>/
- Backend: http://<VPS_IP>:8080/ (health at /actuator/health)

Notes:
- Replace example secrets before going to production.
- For production use, install TLS (letsencrypt) and run services behind a reverse proxy.
- Consider using managed Postgres for persistence.
