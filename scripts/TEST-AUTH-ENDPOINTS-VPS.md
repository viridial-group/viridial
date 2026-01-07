# Guide de Test des Endpoints Auth-Service sur VPS

## 📋 Prérequis

1. **Code déployé sur le VPS** avec les nouvelles modifications (signup, forgot-password, reset-password)
2. **auth-service démarré** et accessible sur le port 8080
3. **Variables d'environnement SMTP configurées** dans `infrastructure/docker-compose/.env`

## 🚀 Étape 1: Déployer les modifications sur le VPS

### Option A: Depuis le VPS directement

```bash
# Se connecter au VPS
ssh user@148.230.112.148

# Aller dans le répertoire du projet
cd /opt/viridial

# Mettre à jour le code
git pull origin main

# Rebuild et redémarrer auth-service
cd infrastructure/docker-compose
docker compose -f app-auth.yml up -d --build auth-service

# Vérifier les logs
docker compose -f app-auth.yml logs -f auth-service
```

### Option B: Depuis local (une commande)

```bash
ssh user@148.230.112.148 'cd /opt/viridial && git pull && cd infrastructure/docker-compose && docker compose -f app-auth.yml up -d --build auth-service'
```

### Option C: Utiliser le script de déploiement

```bash
# Sur le VPS
cd /opt/viridial
./scripts/deploy-auth-service-vps.sh
```

## 🔧 Étape 2: Vérifier les variables d'environnement SMTP

Sur le VPS, vérifier que `infrastructure/docker-compose/.env` contient:

```bash
# SMTP Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@viridial.com
SMTP_PASS=S@upport!19823
EMAIL_FROM=support@viridial.com
FROM_NAME=Viridial Support
FRONTEND_URL=http://148.230.112.148:3000

# Database
POSTGRES_USER=viridial
POSTGRES_PASSWORD=your_password
POSTGRES_DB=viridial

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Si les variables SMTP manquent, les ajouter au fichier `.env`.

## 🧪 Étape 3: Tester les endpoints

### Option A: Utiliser le script de test automatique

```bash
# Depuis local
./scripts/test-auth-endpoints-vps.sh 148.230.112.148

# Ou depuis le VPS
cd /opt/viridial
./scripts/test-auth-endpoints-vps.sh localhost
```

### Option B: Tests manuels avec curl

#### 1. Health Check

```bash
curl http://148.230.112.148:8080/auth/health
```

**Réponse attendue:**
```json
{"status":"ok","service":"auth-service"}
```

#### 2. Test Signup (Créer un compte)

```bash
curl -X POST http://148.230.112.148:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "confirmPassword": "Test1234!"
  }'
```

**Réponse attendue (201):**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "role": "user"
  }
}
```

**Test avec email existant (devrait échouer avec 409):**
```bash
curl -X POST http://148.230.112.148:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "confirmPassword": "Test1234!"
  }'
```

**Test avec mots de passe différents (devrait échouer avec 400):**
```bash
curl -X POST http://148.230.112.148:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "Test1234!",
    "confirmPassword": "Different123!"
  }'
```

#### 3. Test Login

```bash
curl -X POST http://148.230.112.148:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

**Réponse attendue (200):**
```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### 4. Test Forgot Password

```bash
curl -X POST http://148.230.112.148:8080/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Réponse attendue (200):**
```json
{
  "message": "Si cet email existe, un lien de réinitialisation a été envoyé"
}
```

**⚠️ Important:** Vérifier l'email reçu pour obtenir le token de réinitialisation.

#### 5. Test Reset Password

```bash
# Remplacer TOKEN_FROM_EMAIL par le token reçu par email
curl -X POST http://148.230.112.148:8080/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL",
    "newPassword": "NewPass1234!",
    "confirmPassword": "NewPass1234!"
  }'
```

**Réponse attendue (200):**
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

**Test avec token invalide (devrait échouer avec 401):**
```bash
curl -X POST http://148.230.112.148:8080/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "invalid-token",
    "newPassword": "NewPass1234!",
    "confirmPassword": "NewPass1234!"
  }'
```

## 🔍 Vérification de la base de données

Pour vérifier que les données sont bien stockées:

```bash
# Se connecter à PostgreSQL
docker exec -it viridial-postgres psql -U viridial -d viridial

# Lister les utilisateurs
SELECT id, email, role, is_active, created_at FROM users;

# Lister les tokens de réinitialisation
SELECT id, user_id, token, expires_at, used, created_at FROM password_reset_tokens;
```

## 📧 Vérification des emails

Les emails de réinitialisation sont envoyés via SMTP. Pour vérifier:

1. **Vérifier les logs du service:**
   ```bash
   docker compose -f app-auth.yml logs auth-service | grep -i email
   ```

2. **Vérifier la boîte de réception** de l'email utilisé dans le test

3. **Si les emails ne sont pas reçus**, vérifier:
   - Les variables SMTP dans `.env`
   - Les logs du service pour les erreurs SMTP
   - Que le port 465 est ouvert (SMTP)

## 🐛 Dépannage

### Le service ne démarre pas

```bash
# Vérifier les logs
docker compose -f app-auth.yml logs auth-service

# Vérifier que PostgreSQL est accessible
docker exec -it viridial-postgres psql -U viridial -d viridial -c "SELECT 1;"

# Vérifier les variables d'environnement
docker compose -f app-auth.yml config
```

### Erreur de connexion à la base de données

Vérifier que:
- PostgreSQL est démarré: `docker compose ps viridial-postgres`
- La variable `DATABASE_URL` est correcte dans `.env`
- Le réseau Docker `viridial-network` existe: `docker network ls | grep viridial`

### Erreur SMTP

Vérifier que:
- Les variables SMTP sont correctes dans `.env`
- Le port 465 est accessible depuis le VPS
- Les credentials SMTP sont valides

### Endpoint retourne 500

```bash
# Vérifier les logs détaillés
docker compose -f app-auth.yml logs --tail=50 auth-service

# Vérifier que la table password_reset_tokens existe
docker exec -it viridial-postgres psql -U viridial -d viridial -c "\d password_reset_tokens"
```

## ✅ Checklist de validation

- [ ] Health check retourne 200
- [ ] Signup crée un utilisateur et retourne des tokens
- [ ] Signup avec email existant retourne 409
- [ ] Signup avec mots de passe différents retourne 400
- [ ] Login avec bonnes credentials retourne des tokens
- [ ] Login avec mauvaises credentials retourne 401
- [ ] Forgot password retourne 200 (même pour email inexistant)
- [ ] Email de réinitialisation est reçu
- [ ] Reset password avec token valide fonctionne
- [ ] Reset password avec token invalide retourne 401
- [ ] Reset password avec token expiré retourne 401

## 📚 Ressources

- **Script de test:** `scripts/test-auth-endpoints-vps.sh`
- **Script de déploiement:** `scripts/deploy-auth-service-vps.sh`
- **Documentation backend:** `scripts/BACKEND-SIGNUP-IMPLEMENTATION.md`
- **Story:** `docs/stories/US-FE-09-signup-password-reset.story.md`

