# US-014: Authn & JWT + SSO readiness

## Status: Draft

### Story
En tant qu'utilisateur, je veux me connecter de manière sécurisée (email/password) et avoir des options SSO afin d'assurer des sessions sécurisées et une intégration entreprise.

### Acceptance Criteria
- Auth via email/password avec hashing sécurisé (bcrypt/argon2).
- JWT access + refresh tokens implémentés et endpoints `/auth/login`, `/auth/refresh`.
- Lockout et rate limit sur tentatives de connexion.
- Documentation pour connecter un provider SSO (OIDC) en PoC.

**Priority:** P0
**Estimation:** 5

### Tasks
- [ ] Implement auth endpoints + JWT
- [ ] Rate limiting login attempts
- [ ] PoC OIDC config
- [ ] Tests sécurité (unit/integration)
