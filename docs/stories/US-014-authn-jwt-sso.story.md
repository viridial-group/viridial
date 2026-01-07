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
- [x] Implement auth endpoints + JWT
- [x] Rate limiting login attempts
- [x] PoC OIDC config
- [x] Frontend login page avec shadcn/ui
- [x] Contexte React pour gestion des tokens
- [x] Intégration Google SSO dans le frontend
- [ ] Tests sécurité (unit/integration)

### Dev Notes

#### Backend (auth-service)
- ✅ Endpoints `/auth/login` et `/auth/refresh` implémentés
- ✅ Rate limiting: 5 tentatives max / 15 minutes
- ✅ TypeORM branché sur PostgreSQL avec table `users`
- ✅ PoC Google OAuth 2.0 avec Passport.js
- ✅ JWT access token (15min) + refresh token (7j)

#### Frontend (frontend/web)
- ✅ Page de login Next.js avec shadcn/ui
- ✅ Formulaire email/password
- ✅ Bouton "Continuer avec Google" pour SSO
- ✅ Contexte React `AuthContext` pour gestion d'état
- ✅ Stockage sécurisé des tokens dans localStorage
- ✅ Refresh automatique des tokens expirés
- ✅ Page dashboard protégée avec redirection si non authentifié
- ✅ Service API client pour communiquer avec auth-service

#### Fichiers créés/modifiés

**Backend:**
- `services/auth-service/src/controllers/auth.controller.ts` - Endpoints auth
- `services/auth-service/src/services/auth.service.ts` - Logique métier
- `services/auth-service/src/services/oidc.service.ts` - Service OIDC
- `services/auth-service/src/strategies/google.strategy.ts` - Passport Google Strategy
- `services/auth-service/src/entities/user.entity.ts` - Entity TypeORM

**Frontend:**
- `frontend/web/app/login/page.tsx` - Page de connexion
- `frontend/web/app/dashboard/page.tsx` - Page protégée
- `frontend/web/contexts/AuthContext.tsx` - Contexte d'authentification
- `frontend/web/lib/api/auth.ts` - Client API pour auth-service
- `frontend/web/lib/auth.ts` - Utilitaires JWT
- `frontend/web/components/ui/*` - Composants shadcn/ui

#### Configuration requise

**Backend (.env):**
```env
DATABASE_URL=postgres://user:pass@host:5432/db
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=...
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080
```

#### Tests manuels effectués
- ✅ Login avec email/password fonctionne
- ✅ Tokens stockés et récupérés correctement
- ✅ Redirection vers dashboard après login
- ✅ Déconnexion fonctionne
- ✅ Google SSO redirige vers l'endpoint OAuth

#### Prochaines étapes
- [ ] Tests unitaires et d'intégration pour auth-service
- [ ] Tests E2E pour le flow de login complet
- [ ] Gestion des erreurs réseau améliorée
- [ ] Loading states et feedback utilisateur
- [ ] Protection CSRF pour les formulaires
