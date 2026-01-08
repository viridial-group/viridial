# Authentification JWT pour Property Service - Implémentation Complète

## ✅ Implémentation Terminée

L'authentification JWT a été intégrée avec succès dans le Property Service. Tous les endpoints critiques sont maintenant protégés.

## 📋 Fichiers Créés

### 1. JWT Strategy
**Fichier :** `services/property-service/src/strategies/jwt.strategy.ts`

- Valide les tokens JWT avec la clé secrète `JWT_ACCESS_SECRET`
- Extrait `userId` et `email` depuis le payload JWT
- Utilise Passport JWT strategy

### 2. JWT Guard
**Fichier :** `services/property-service/src/guards/jwt-auth.guard.ts`

- Protège les routes avec authentification JWT
- Gère les erreurs de validation (token expiré, invalide, etc.)
- Retourne `401 Unauthorized` si token invalide

### 3. User Decorator
**Fichier :** `services/property-service/src/decorators/user.decorator.ts`

- Decorator personnalisé `@User()` pour extraire l'utilisateur depuis `req.user`
- Permet d'accéder facilement à `userId` et `email` dans les controllers

### 4. Auth Module
**Fichier :** `services/property-service/src/auth/auth.module.ts`

- Configure Passport et JWT Module
- Exporte `JwtAuthGuard` pour utilisation dans les controllers

## 🔐 Endpoints Protégés

### Endpoints Require Authentication (JWT)

1. **POST /properties** - Créer une propriété
   - ✅ Protégé avec `@UseGuards(JwtAuthGuard)`
   - `userId` extrait depuis JWT token (sécurité)

2. **PUT /properties/:id** - Modifier une propriété
   - ✅ Protégé avec `@UseGuards(JwtAuthGuard)`
   - Vérifie que l'utilisateur est propriétaire

3. **DELETE /properties/:id** - Supprimer une propriété
   - ✅ Protégé avec `@UseGuards(JwtAuthGuard)`
   - Vérifie que l'utilisateur est propriétaire

4. **POST /properties/:id/publish** - Publier une propriété
   - ✅ Protégé avec `@UseGuards(JwtAuthGuard)`
   - Vérifie que l'utilisateur est propriétaire

### Endpoints Public (Pas de JWT requis)

1. **GET /properties/health** - Health check
   - ✅ Public (pas de guard)

2. **GET /properties** - Lister les propriétés
   - ✅ Public mais filtre automatique :
     - Utilisateurs authentifiés : voient leurs propres propriétés (tous statuts)
     - Utilisateurs non authentifiés : voient seulement propriétés `LISTED`

3. **GET /properties/:id** - Détail d'une propriété
   - ✅ Public pour propriétés `LISTED`
   - ✅ Requiert auth pour propriétés `DRAFT`/`REVIEW` (vérification propriétaire)

4. **GET /properties/search/nearby** - Recherche de proximité
   - ✅ Public (utilisé par Geolocation Service)

## 🔧 Configuration

### Variables d'Environnement Requises

Le Property Service nécessite maintenant `JWT_ACCESS_SECRET` pour valider les tokens :

```env
# Property Service .env
JWT_ACCESS_SECRET=<same-secret-as-auth-service>
```

**IMPORTANT :** `JWT_ACCESS_SECRET` doit être **identique** à celui de l'auth-service.

### Mise à Jour du Script setup-env.sh

Le script `scripts/setup-env.sh` a été mis à jour pour inclure automatiquement `JWT_ACCESS_SECRET` dans le `.env` du Property Service.

## 📦 Dépendances Ajoutées

Les packages suivants ont été ajoutés à `package.json` :

```json
{
  "dependencies": {
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1"
  },
  "devDependencies": {
    "@types/passport-jwt": "^3.0.9"
  }
}
```

## 🚀 Utilisation

### Pour les Clients API

Tous les endpoints protégés nécessitent un header `Authorization` :

```bash
curl -X POST https://viridial.com/properties \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "apartment",
    "price": 250000,
    "currency": "EUR",
    "translations": [...]
  }'
```

### Obtention du Token

1. **Login via Auth Service :**
   ```bash
   curl -X POST https://viridial.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password"}'
   ```

2. **Réponse :**
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refreshToken": "..."
   }
   ```

3. **Utiliser `accessToken` dans les requêtes Property Service**

## 🔒 Sécurité

### Ce qui est Protégé

- ✅ Seuls les utilisateurs authentifiés peuvent créer des propriétés
- ✅ Seuls les propriétaires peuvent modifier/supprimer leurs propriétés
- ✅ Seuls les propriétaires peuvent publier leurs propriétés
- ✅ Les tokens expirés sont rejetés automatiquement
- ✅ Les tokens invalides sont rejetés automatiquement

### Ce qui est Public

- ✅ Health check (pour monitoring)
- ✅ Liste des propriétés `LISTED` (recherche publique)
- ✅ Détail des propriétés `LISTED` (pages publiques)
- ✅ Recherche de proximité (utilisée par Geolocation Service)

### Gestion des Erreurs

Le guard retourne des erreurs HTTP appropriées :

- **401 Unauthorized** : Token manquant, invalide, ou expiré
- **403 Forbidden** : Tentative de modifier une propriété d'un autre utilisateur
- **500 Internal Server Error** : Erreur serveur (rare)

## 🧪 Tests

### Test Manuel

1. **Sans token (doit échouer) :**
   ```bash
   curl -X POST https://viridial.com/properties \
     -H "Content-Type: application/json" \
     -d '{"type": "apartment", "price": 100000}'
   # Réponse: 401 Unauthorized
   ```

2. **Avec token valide (doit réussir) :**
   ```bash
   # 1. Obtenir token
   TOKEN=$(curl -s -X POST https://viridial.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password"}' \
     | jq -r '.accessToken')

   # 2. Créer propriété avec token
   curl -X POST https://viridial.com/properties \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "type": "apartment",
       "price": 250000,
       "currency": "EUR",
       "city": "Paris",
       "country": "France",
       "translations": [{
         "language": "fr",
         "title": "Appartement test"
       }]
     }'
   ```

3. **Avec token expiré (doit échouer) :**
   - Utiliser un token expiré
   - Réponse: 401 Unauthorized avec message "Token expired"

## 📝 Notes Importantes

### Payload JWT

Le auth-service génère des tokens avec ce payload :
```json
{
  "sub": "user-uuid",
  "email": "user@example.com"
}
```

Le Property Service extrait `sub` comme `userId` dans `req.user.id`.

### userId dans DTO

- **CreatePropertyDto** : `userId` est maintenant **optionnel**
- Le `userId` est **toujours** extrait depuis le token JWT pour sécurité
- Si `userId` est fourni dans le DTO mais ne correspond pas au token, une erreur 403 est retournée

### Liste des Propriétés

- **Utilisateurs authentifiés** : Voient toutes leurs propriétés (tous statuts)
- **Utilisateurs non authentifiés** : Voient seulement propriétés `LISTED` (recherche publique)

## ✅ Checklist de Vérification

- [x] JWT Strategy créée et configurée
- [x] JWT Guard créé avec gestion d'erreurs
- [x] User Decorator créé
- [x] Auth Module configuré
- [x] AppModule mis à jour avec AuthModule
- [x] Tous les endpoints critiques protégés
- [x] Endpoints publics restent accessibles
- [x] Variables d'environnement ajoutées au script setup-env.sh
- [x] Dépendances npm ajoutées
- [x] Documentation créée

## 🔄 Prochaines Étapes

1. **Installer les dépendances :**
   ```bash
   cd services/property-service
   npm install
   # ou avec Docker: docker compose build property-service
   ```

2. **Vérifier la configuration :**
   - S'assurer que `JWT_ACCESS_SECRET` est configuré et identique à auth-service
   - Exécuter `./scripts/setup-env.sh` pour générer les `.env` mis à jour

3. **Tester l'authentification :**
   - Tester avec token valide
   - Tester sans token (doit échouer)
   - Tester avec token expiré (doit échouer)

4. **Déployer :**
   - Une fois testé localement, déployer sur VPS
   - Vérifier que les tokens de l'auth-service fonctionnent

## 🐛 Dépannage

### Erreur : "Invalid or expired token"

- Vérifier que `JWT_ACCESS_SECRET` est identique dans auth-service et property-service
- Vérifier que le token n'est pas expiré
- Vérifier le format du header : `Authorization: Bearer <token>`

### Erreur : "Cannot create property for another user"

- Le `userId` dans le DTO ne correspond pas au token JWT
- Solution : Ne pas fournir `userId` dans le DTO, il sera extrait du token

### Token accepté mais requête échoue

- Vérifier que l'utilisateur existe dans auth-service
- Vérifier que le payload JWT contient `sub` et `email`

