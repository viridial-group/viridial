# Frontend Deployment Guide - VPS

Guide pour déployer le frontend Next.js sur le VPS avec support IP et domaine (viridial.com).

## 📋 Prérequis

- Docker et Docker Compose installés sur le VPS
- Auth-service déployé et accessible
- Réseau Docker `viridial-network` créé
- Domaine configuré (optionnel)

## 🚀 Déploiement Rapide

### Option 1: Utiliser le script de déploiement

```bash
./scripts/deploy-frontend-vps.sh
```

### Option 2: Déploiement manuel

```bash
cd infrastructure/docker-compose

# 1. Mettre à jour le code
git pull

# 2. Configurer les variables d'environnement
# Éditer .env et ajouter:
FRONTEND_AUTH_API_URL=http://148.230.112.148/auth
# ou avec domaine:
FRONTEND_AUTH_API_URL=https://yourdomain.com/auth

# 3. Vérifier/créer le réseau Docker
docker network create viridial-network || true

# 4. Build et démarrage
docker compose -f app-frontend.yml build --no-cache frontend
docker compose -f app-frontend.yml up -d
```

## 🔧 Configuration

### Variables d'Environnement

Dans `infrastructure/docker-compose/.env`:

```env
# URL de l'API d'authentification
# Utiliser l'IP pour tests, ou le domaine pour production
# Utiliser le domaine pour production
FRONTEND_AUTH_API_URL=http://viridial.com/auth
# Ou avec HTTPS (après configuration SSL)
FRONTEND_AUTH_API_URL=https://viridial.com/auth
```

### Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌─────────────┐
│   Nginx     │─────▶│  Frontend   │
│  (Port 80)  │      │ (Next.js)   │
│             │      │ (Port 3000) │
└──────┬──────┘      └─────────────┘
       │
       ▼
┌─────────────┐
│ Auth Service│
│ (Port 8080) │
└─────────────┘
```

### Nginx Configuration

Le fichier `deploy/nginx/conf.d/default.conf` configure:

- **Frontend Next.js**: Proxied depuis `http://frontend:3000`
- **Auth API**: Proxied depuis `http://viridial-auth-service:3000/auth/`
- **Support multi-domaine**: IP `148.230.112.148` et domaine personnalisé

## 🌐 Configuration DNS (pour domaine)

Si vous avez un domaine (ex: `viridial.com`):

1. **Configurer les enregistrements DNS**:
   ```
   A     @           148.230.112.148
   A     www         148.230.112.148
   ```

2. **Nginx config est déjà configuré** pour `viridial.com` et `www.viridial.com`

3. **Mettre à jour `.env`**:
   ```env
   FRONTEND_AUTH_API_URL=http://viridial.com/auth
   # Ou avec HTTPS (après SSL):
   FRONTEND_AUTH_API_URL=https://viridial.com/auth
   ```
   
4. **Mettre à jour CORS dans auth-service** pour inclure le domaine:
   - Les origines `http://viridial.com`, `https://viridial.com`, `www.viridial.com` sont déjà configurées

4. **Redéployer**:
   ```bash
   docker compose -f app-frontend.yml up -d --build
   ```

## 🔒 Configuration SSL/TLS (Optionnel)

Pour activer HTTPS avec Let's Encrypt:

1. **Installer Certbot**:
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtenir le certificat**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Mettre à jour nginx config** pour écouter sur port 443

## ✅ Vérification

### Test de santé

```bash
# Frontend Next.js direct
curl http://localhost:3000

# Via Nginx
curl http://localhost

# Depuis l'extérieur
curl http://148.230.112.148
curl http://viridial.com
curl http://www.viridial.com
```

### Test des endpoints

```bash
# Health check auth service via nginx
curl http://148.230.112.148/auth/health

# Login test
curl -X POST http://148.230.112.148/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sass.hicham@gmail.com","password":"Test1234!"}'
```

### Vérifier les logs

```bash
# Logs frontend
docker compose -f app-frontend.yml logs -f frontend

# Logs nginx
docker compose -f app-frontend.yml logs -f nginx

# Logs auth-service (si déployé)
docker compose -f app-auth.yml logs -f auth-service
```

## 🔍 Dépannage

### Frontend ne démarre pas

```bash
# Vérifier les logs
docker compose -f app-frontend.yml logs frontend

# Vérifier les variables d'environnement
docker compose -f app-frontend.yml config

# Rebuild sans cache
docker compose -f app-frontend.yml build --no-cache frontend
```

### Erreurs CORS

Vérifier que l'IP/domaine est dans la liste des origines autorisées dans `auth-service/src/main.ts`.

### Nginx ne proxy pas correctement

```bash
# Vérifier la configuration nginx
docker exec viridial-nginx nginx -t

# Recharger nginx
docker exec viridial-nginx nginx -s reload
```

### Port déjà utilisé

```bash
# Vérifier les ports utilisés
sudo lsof -i :80
sudo lsof -i :3000

# Arrêter le service conflictuel ou changer les ports dans docker-compose.yml
```

## 📝 Accès

- **Frontend direct**: `http://148.230.112.148:3000`
- **Frontend via Nginx (IP)**: `http://148.230.112.148`
- **Frontend via domaine**: `http://viridial.com` ou `http://www.viridial.com`
- **HTTPS** (après config SSL): `https://viridial.com` ou `https://www.viridial.com`

## 🔄 Mise à jour

Pour mettre à jour le frontend après des modifications:

```bash
cd /opt/viridial
git pull
cd infrastructure/docker-compose
docker compose -f app-frontend.yml up -d --build frontend
```

## 📚 Références

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)

