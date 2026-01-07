# Intégration Frontend - Authentification

## ✅ Ce qui a été implémenté

### 1. Page de Login (`app/login/page.tsx`)
- ✅ Formulaire email/password avec validation
- ✅ Gestion des erreurs (affichage des messages)
- ✅ Loading states pendant la connexion
- ✅ Bouton "Continuer avec Google" pour SSO
- ✅ Design moderne avec shadcn/ui (Card, Input, Button, Label)

### 2. Contexte d'Authentification (`contexts/AuthContext.tsx`)
- ✅ Gestion de l'état d'authentification (isAuthenticated, isLoading)
- ✅ Fonction `login()` pour connexion email/password
- ✅ Fonction `logout()` pour déconnexion
- ✅ Fonction `refreshAccessToken()` pour renouveler les tokens
- ✅ Vérification automatique de l'expiration des tokens
- ✅ Refresh automatique si token expiré

### 3. Service API (`lib/api/auth.ts`)
- ✅ Client API pour communiquer avec `auth-service`
- ✅ Méthode `login()` - POST /auth/login
- ✅ Méthode `refresh()` - POST /auth/refresh
- ✅ Méthode `healthCheck()` - GET /auth/health
- ✅ Méthode `getGoogleAuthUrl()` - URL pour OAuth Google

### 4. Utilitaires JWT (`lib/auth.ts`)
- ✅ Stockage sécurisé dans localStorage
- ✅ Fonction `decodeJWT()` pour décoder les tokens
- ✅ Fonction `isTokenExpired()` pour vérifier l'expiration
- ✅ Interface `TokenStorage` pour abstraction

### 5. Page Dashboard (`app/dashboard/page.tsx`)
- ✅ Page protégée (redirige vers /login si non authentifié)
- ✅ Affichage de l'état de connexion
- ✅ Bouton de déconnexion
- ✅ Loading state pendant la vérification

### 6. Configuration
- ✅ Layout principal avec `AuthProvider` (`app/layout.tsx`)
- ✅ Redirection automatique depuis `/` vers `/login`
- ✅ Variables d'environnement configurées (`NEXT_PUBLIC_AUTH_API_URL`)

## 🧪 Comment tester

### 1. Démarrer auth-service

```bash
cd services/auth-service
npm install
npm run start:dev
# Service sur http://localhost:3000 (ou port configuré)
```

### 2. Créer un utilisateur de test

```bash
cd infrastructure/docker-compose
# S'assurer que Postgres est démarré
docker exec -i viridial-postgres psql -U viridial -d viridial < init-auth-db.sql
./create-test-user.sh
# Utilisateur par défaut: user@example.com / Passw0rd!
```

### 3. Démarrer le frontend

```bash
cd frontend/web
pnpm install
pnpm dev
# Application sur http://localhost:3000
```

### 4. Tester le flow

1. **Accéder à** `http://localhost:3000`
   - Redirection automatique vers `/login`

2. **Se connecter** avec:
   - Email: `user@example.com`
   - Password: `Passw0rd!`

3. **Vérifier**:
   - Redirection vers `/dashboard`
   - Tokens stockés dans localStorage
   - Affichage du message de bienvenue

4. **Tester la déconnexion**:
   - Cliquer sur "Déconnexion"
   - Redirection vers `/login`
   - Tokens supprimés de localStorage

5. **Tester Google SSO** (si configuré):
   - Cliquer sur "Continuer avec Google"
   - Redirection vers Google OAuth
   - Après authentification, retour avec tokens

## 🔧 Configuration

### Variables d'environnement

Créer `frontend/web/.env.local`:

```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080
```

**Note:** Pour le VPS, utiliser l'IP du serveur:
```env
NEXT_PUBLIC_AUTH_API_URL=http://VOTRE_IP:8080
```

### Vérifier la connectivité

```bash
# Tester que auth-service répond
curl http://localhost:8080/auth/health

# Devrait retourner:
# {"status":"ok","service":"auth-service"}
```

## 📋 Checklist de vérification

- [x] Page de login accessible sur `/login`
- [x] Formulaire email/password fonctionnel
- [x] Bouton Google SSO présent
- [x] Connexion réussie redirige vers `/dashboard`
- [x] Tokens stockés dans localStorage
- [x] Page dashboard protégée (redirige si non connecté)
- [x] Déconnexion fonctionne
- [x] Gestion des erreurs (mauvais identifiants, rate limit)
- [x] Loading states pendant les requêtes

## 🐛 Dépannage

### Erreur: "Failed to fetch"

**Cause:** `auth-service` n'est pas démarré ou URL incorrecte

**Solution:**
1. Vérifier que `auth-service` est démarré
2. Vérifier `NEXT_PUBLIC_AUTH_API_URL` dans `.env.local`
3. Tester avec `curl http://localhost:8080/auth/health`

### Erreur: "Invalid credentials"

**Cause:** Utilisateur n'existe pas dans la base de données

**Solution:**
1. Créer l'utilisateur avec `./create-test-user.sh`
2. Vérifier les identifiants (email/password)

### Erreur: "Too many login attempts"

**Cause:** Rate limiting activé (5 tentatives / 15 min)

**Solution:**
- Attendre 15 minutes
- Ou redémarrer `auth-service` pour réinitialiser le compteur

### Tokens non stockés

**Cause:** localStorage bloqué ou erreur JavaScript

**Solution:**
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs JavaScript
3. Vérifier que localStorage est accessible

## 📚 Prochaines améliorations

- [ ] Gestion des erreurs réseau améliorée (retry, timeout)
- [ ] Toast notifications pour feedback utilisateur
- [ ] Remember me (optionnel)
- [ ] Mot de passe oublié
- [ ] Inscription (signup)
- [ ] Protection CSRF
- [ ] Tests E2E avec Playwright/Cypress
- [ ] Refresh automatique en arrière-plan avant expiration

