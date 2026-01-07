# Configuration Google SSO (OIDC) - PoC

Ce guide explique comment configurer l'authentification Google OAuth 2.0 pour `auth-service`.

## 📋 Prérequis

- Un compte Google (Gmail, Google Workspace, etc.)
- Accès à la [Google Cloud Console](https://console.cloud.google.com/)

## 🔧 Configuration Google Cloud Console

### 1. Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquer sur **"Sélectionner un projet"** → **"Nouveau projet"**
3. Nommer le projet (ex: `viridial-auth`)
4. Cliquer sur **"Créer"**

### 2. Activer l'API Google+ (OAuth 2.0)

1. Dans le menu latéral, aller dans **"APIs & Services"** → **"Library"**
2. Rechercher **"Google+ API"** ou **"Identity Platform"**
3. Cliquer sur **"Enable"**

### 3. Créer les identifiants OAuth 2.0

1. Aller dans **"APIs & Services"** → **"Credentials"**
2. Cliquer sur **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Si demandé, configurer l'écran de consentement OAuth :
   - **User Type**: External (ou Internal si Google Workspace)
   - **App name**: Viridial
   - **User support email**: ton email
   - **Developer contact**: ton email
   - Cliquer sur **"Save and Continue"**
   - Ajouter les scopes : `email`, `profile`, `openid`
   - Cliquer sur **"Save and Continue"**
   - Ajouter des test users si nécessaire
   - Cliquer sur **"Back to Dashboard"**

4. Créer l'OAuth Client ID :
   - **Application type**: Web application
   - **Name**: Viridial Auth Service
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     http://localhost:8080
     https://votre-domaine.com
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/auth/oidc/google/callback
     http://localhost:8080/auth/oidc/google/callback
     https://votre-domaine.com/auth/oidc/google/callback
     ```
   - Cliquer sur **"Create"**

5. **Copier les identifiants** :
   - **Client ID**: `xxxxx.apps.googleusercontent.com`
   - **Client Secret**: `xxxxx`

## 🔐 Configuration Variables d'Environnement

Ajouter ces variables dans ton `.env` (local) ou sur le VPS :

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=xx
GOOGLE_CLIENT_SECRET=x
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/oidc/google/callback
# Ou en production:
# GOOGLE_CALLBACK_URL=https://viridial.com/auth/oidc/google/callback
```

### Sur le VPS

```bash
cd /opt/viridial/infrastructure/docker-compose
nano .env
# Ajouter les variables GOOGLE_*
```

Puis redémarrer `auth-service` :

```bash
docker compose -f app-auth.yml restart
```

## 🧪 Tester le Flow OAuth

### 1. Test Local

1. Démarrer `auth-service` :
   ```bash
   cd services/auth-service
   npm run start:dev
   ```

2. Ouvrir dans le navigateur :
   ```
   http://localhost:3000/auth/oidc/google
   ```

3. Tu seras redirigé vers Google pour te connecter

4. Après connexion, Google redirige vers :
   ```
   http://localhost:3000/auth/oidc/google/callback
   ```

5. Tu obtiens une réponse JSON avec :
   ```json
   {
     "success": true,
     "message": "Google OAuth authentication successful",
     "user": {
       "id": "uuid",
       "email": "ton-email@gmail.com",
       "role": "user"
     },
     "accessToken": "eyJ...",
     "refreshToken": "eyJ..."
   }
   ```

### 2. Test sur VPS

1. Vérifier que les variables d'env sont bien configurées :
   ```bash
   docker exec viridial-auth-service env | grep GOOGLE
   ```

2. Accéder à :
   ```
   http://VOTRE_IP:8080/auth/oidc/google
   ```

3. Suivre le même flow que local

## 🔄 Intégration Frontend (Next Steps)

Pour une intégration complète frontend :

1. **Créer un bouton "Se connecter avec Google"** dans ton app Next.js
2. **Rediriger vers** : `http://VOTRE_IP:8080/auth/oidc/google`
3. **Après callback**, récupérer les tokens depuis la réponse JSON
4. **Stocker les tokens** dans localStorage/cookies
5. **Utiliser `accessToken`** pour les requêtes API authentifiées

### Exemple Frontend (React/Next.js)

```tsx
const handleGoogleLogin = () => {
  window.location.href = 'http://VOTRE_IP:8080/auth/oidc/google';
};

// Après redirection depuis Google, parser la réponse
// (dans un useEffect ou page de callback)
```

## ⚠️ Notes de Production

- **HTTPS requis** : Google exige HTTPS en production (sauf localhost)
- **Secrets sécurisés** : Ne jamais commiter `GOOGLE_CLIENT_SECRET` dans Git
- **Callback URL** : Doit correspondre exactement à celle configurée dans Google Console
- **Scopes** : Actuellement `email` et `profile` (ajouter `openid` si besoin)
- **User creation** : Les users Google sont créés automatiquement à la première connexion

## 🐛 Dépannage

### Erreur: "redirect_uri_mismatch"

- Vérifier que `GOOGLE_CALLBACK_URL` correspond exactement à l'URI dans Google Console
- Vérifier les URLs autorisées dans Google Console

### Erreur: "invalid_client"

- Vérifier que `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont corrects
- Vérifier que l'API OAuth 2.0 est activée dans Google Console

### Erreur: "access_denied"

- Vérifier que l'écran de consentement OAuth est configuré
- Vérifier que les scopes demandés sont autorisés

## 📚 Ressources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [NestJS Passport](https://docs.nestjs.com/security/authentication)

