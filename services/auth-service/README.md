# Auth Service - Viridial

Service d'authentification pour Viridial avec support JWT et SSO (Google OAuth 2.0).

## 🚀 Fonctionnalités

- ✅ Authentification email/password avec bcrypt
- ✅ JWT access + refresh tokens
- ✅ Rate limiting sur les tentatives de connexion (5 tentatives / 15 min)
- ✅ SSO Google OAuth 2.0 (PoC)
- ✅ TypeORM + PostgreSQL

## 📋 Endpoints

### Health Check
```
GET /auth/health
```

### Authentification Email/Password
```
POST /auth/login
Body: { "email": "user@example.com", "password": "Passw0rd!" }
Response: { "accessToken": "...", "refreshToken": "..." }
```

### Refresh Token
```
POST /auth/refresh
Body: { "refreshToken": "..." }
Response: { "accessToken": "...", "refreshToken": "..." }
```

### Google SSO (OIDC)
```
GET /auth/oidc/google
→ Redirige vers Google pour l'authentification

GET /auth/oidc/google/callback
→ Callback après authentification Google réussie
→ Retourne: { "success": true, "user": {...}, "accessToken": "...", "refreshToken": "..." }
```

## 🔧 Configuration

### Variables d'Environnement

```env
# Database
DATABASE_URL=postgres://user:password@host:5432/database

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth (optionnel, pour SSO)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/oidc/google/callback
```

## 📚 Documentation

- [Configuration Google SSO](./docs/GOOGLE_SSO_SETUP.md) - Guide complet pour configurer Google OAuth 2.0

## 🧪 Tests

```bash
npm test
npm run test:e2e
```

## 🐳 Docker

```bash
# Build
docker build -t viridial/auth-service:latest .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL=postgres://... \
  -e JWT_ACCESS_SECRET=... \
  viridial/auth-service:latest
```

## 📦 Dépendances

- NestJS 10
- TypeORM + PostgreSQL
- Passport + Google OAuth 2.0
- JWT (access + refresh tokens)
- bcrypt pour le hashing des mots de passe
