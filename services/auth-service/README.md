# Auth Service

Service d'authentification et d'autorisation pour Viridial.

## Responsabilités

- Authentification utilisateur (login, register)
- Gestion des tokens JWT
- Refresh tokens
- SSO readiness (préparation pour intégration SSO)
- Gestion des sessions (Redis)

## APIs

- `POST /auth/login` - Connexion
- `POST /auth/register` - Inscription
- `POST /auth/refresh` - Rafraîchir token
- `GET /auth/me` - Profil utilisateur actuel
- `POST /auth/logout` - Déconnexion

## Technologies

- **Framework:** NestJS
- **Database:** PostgreSQL
- **Cache/Sessions:** Redis
- **Auth:** JWT (jsonwebtoken)

## Story

- **US-014:** Authn & JWT + SSO readiness

## Développement

```bash
cd services/auth-service
npm install
npm run start:dev
```

## Tests

```bash
npm test
npm run test:e2e
```

