# Configuration de la Vérification d'Email

## Résumé

La fonctionnalité de vérification d'email a été ajoutée au système d'authentification. Lors de l'inscription, un email de vérification est maintenant envoyé automatiquement à l'utilisateur.

## Fonctionnalités Ajoutées

1. **Email de vérification automatique** lors de l'inscription
2. **Endpoint de vérification** : `POST /auth/verify-email`
3. **Endpoint de renvoi** : `POST /auth/resend-verification`
4. **Page frontend** : `/verify-email?token=...`
5. **Champ `emailVerified`** dans la table `users`

## Base de Données

### Migration SQL

**En développement** (synchronize: true) :
- Les tables sont créées automatiquement au démarrage

**En production** :
- Exécuter le script SQL : `services/auth-service/src/migrations/add-email-verification.sql`

```bash
# Sur le VPS
cd /opt/viridial
psql $DATABASE_URL -f services/auth-service/src/migrations/add-email-verification.sql
```

### Nouvelles Tables

**Table: `email_verification_tokens`**
- Stocke les tokens de vérification avec expiration (24h)
- Un token par utilisateur, peut être réutilisé si pas expiré

**Colonne ajoutée: `users.email_verified`**
- Boolean, défaut: `false`
- Mis à `true` après vérification réussie

## Configuration SMTP Requise

**⚠️ IMPORTANT**: Les emails ne seront pas envoyés si SMTP n'est pas configuré !

Voir `docs/deployment/EMAIL-CONFIGURATION.md` pour la configuration complète.

Variables minimales requises :
```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=votre-email@viridial.com
SMTP_PASS=votre-mot-de-passe
EMAIL_FROM=support@viridial.com
FRONTEND_URL=https://viridial.com
```

## Déploiement

### 1. Configurer SMTP

```bash
cd /opt/viridial/infrastructure/docker-compose

# Ajouter dans .env
cat >> .env << EOF
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=votre-email@viridial.com
SMTP_PASS=votre-mot-de-passe
SMTP_SECURE=true
EMAIL_FROM=support@viridial.com
FROM_NAME=Viridial Support
FRONTEND_URL=https://viridial.com
EOF
```

### 2. Exécuter la Migration (Production)

```bash
# Si NODE_ENV=production, synchronize est désactivé
# Exécuter manuellement :
psql $DATABASE_URL -f /opt/viridial/services/auth-service/src/migrations/add-email-verification.sql
```

### 3. Rebuild et Redéployer

```bash
cd /opt/viridial/infrastructure/docker-compose

# Rebuild auth-service avec le nouveau code
docker compose -f app-auth.yml build --no-cache auth-service
docker compose -f app-auth.yml up -d auth-service

# Rebuild frontend avec la nouvelle page verify-email
docker compose -f app-frontend.yml build --no-cache frontend
docker compose -f app-frontend.yml up -d frontend
```

### 4. Vérifier

```bash
# Vérifier que le service démarre sans erreur
docker logs viridial-auth-service --tail=50

# Vérifier que les nouvelles routes sont disponibles
curl -X POST https://viridial.com/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Flux Utilisateur

### 1. Inscription

1. Utilisateur remplit le formulaire d'inscription
2. L'inscription est créée avec `emailVerified: false`
3. Un email de vérification est envoyé automatiquement
4. L'utilisateur voit un message de confirmation

### 2. Vérification

1. Utilisateur clique sur le lien dans l'email
2. Redirection vers `/verify-email?token=...`
3. Le frontend appelle `POST /auth/verify-email`
4. Si le token est valide, `emailVerified` est mis à `true`
5. Redirection vers `/login?verified=success`

### 3. Renvoi d'Email

Si l'email n'arrive pas, l'utilisateur peut demander un nouveau lien :

```bash
POST /auth/resend-verification
Body: { "email": "user@example.com" }
```

## Test

### Test Manuel

1. **S'inscrire :**
   ```bash
   curl -X POST https://viridial.com/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test1234",
       "confirmPassword": "Test1234"
     }'
   ```

2. **Vérifier l'email reçu** (dans la boîte mail)

3. **Cliquer sur le lien** ou extraire le token et appeler :
   ```bash
   curl -X POST https://viridial.com/auth/verify-email \
     -H "Content-Type: application/json" \
     -d '{"token": "TOKEN_FROM_EMAIL"}'
   ```

### Vérifier dans la Base de Données

```sql
-- Vérifier les utilisateurs non vérifiés
SELECT id, email, email_verified, created_at 
FROM users 
WHERE email_verified = false;

-- Vérifier les tokens de vérification actifs
SELECT et.*, u.email 
FROM email_verification_tokens et
JOIN users u ON et.user_id = u.id
WHERE et.used = false 
  AND et.expires_at > NOW();
```

## Dépannage

### Problème: L'email n'est pas envoyé

1. **Vérifier les logs :**
   ```bash
   docker logs viridial-auth-service | grep -i "email\|smtp"
   ```

2. **Vérifier les variables d'environnement :**
   ```bash
   docker exec viridial-auth-service env | grep SMTP
   ```

3. **Tester la connexion SMTP :**
   - Les logs doivent montrer : "⚠️ SMTP credentials manquants" si mal configuré

### Problème: "Token de vérification invalide"

1. Le token a peut-être expiré (24h)
2. Le token a peut-être déjà été utilisé
3. Demander un nouveau lien via `/auth/resend-verification`

### Problème: Migration SQL échoue

Si `synchronize: false` en production et migration non exécutée :

```sql
-- Vérifier si la colonne existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'email_verified';

-- Si elle n'existe pas, l'ajouter manuellement :
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;
```

## Notes Importantes

- ⚠️ **L'inscription fonctionne même si l'email échoue** (pas bloquant)
- ⚠️ **Les tokens expirent après 24 heures**
- ⚠️ **Un seul token actif par utilisateur** (les anciens sont invalidés)
- ✅ **L'utilisateur peut se connecter même si l'email n'est pas vérifié** (pour l'instant)

## Prochaines Étapes (Optionnel)

Pour rendre la vérification obligatoire :

1. Modifier `validateUser` dans `auth.service.ts` pour vérifier `emailVerified`
2. Ajouter un middleware pour bloquer l'accès aux fonctionnalités sensibles
3. Afficher un message dans le frontend si l'email n'est pas vérifié

