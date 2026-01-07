# Guide de Tests Production - Viridial

Ce guide fournit une checklist complète pour valider que tous les systèmes fonctionnent correctement en production.

## 🎯 Objectif

Valider que tous les flux utilisateur fonctionnent correctement après le déploiement en production.

## 📋 Checklist de Validation

### Phase 1: Infrastructure et Connexion

#### 1.1 Vérification HTTPS

```bash
# Test 1: Accès HTTPS au domaine
curl -I https://viridial.com
# Attendu: HTTP/2 200 ou 307

# Test 2: Redirection HTTP → HTTPS
curl -I http://viridial.com
# Attendu: HTTP/1.1 301 ou 307 Location: https://viridial.com

# Test 3: Certificat SSL valide
curl -vI https://viridial.com 2>&1 | grep -i "SSL\|certificate"
# Attendu: "SSL certificate verify ok" ou similaire
```

**✅ Validation:**
- [ ] Site accessible via HTTPS
- [ ] Redirection HTTP → HTTPS fonctionne
- [ ] Certificat SSL valide (pas d'avertissement)

#### 1.2 Services Docker

```bash
# Sur le VPS
ssh root@148.230.112.148

# Vérifier que tous les services sont en cours d'exécution
docker ps

# Vérifier la santé des services
docker logs viridial-frontend --tail=10
docker logs viridial-auth-service --tail=10
docker logs viridial-nginx --tail=10
```

**✅ Validation:**
- [ ] Frontend container: `Up`
- [ ] Auth-service container: `Up`
- [ ] Nginx container: `Up`
- [ ] Aucune erreur dans les logs

#### 1.3 Health Checks API

```bash
# Test auth-service health
curl https://viridial.com/auth/health
# Attendu: {"status":"ok","service":"auth-service"}

# Test depuis le serveur directement
curl http://localhost:8080/auth/health
```

**✅ Validation:**
- [ ] `/auth/health` retourne 200 OK
- [ ] Réponse JSON valide

---

### Phase 2: Flux Utilisateur - Inscription

#### 2.1 Test Inscription Complète

**Étapes manuelles:**

1. **Accéder à la page d'inscription:**
   ```
   Ouvrir: https://viridial.com/signup
   ```

2. **Remplir le formulaire:**
   - Email: `test-production@example.com` (utiliser une vraie adresse email)
   - Mot de passe: `Test1234!` (respecter les règles)
   - Confirmer mot de passe: `Test1234!`

3. **Soumettre le formulaire**

4. **Vérifications:**
   - [ ] Message de succès affiché
   - [ ] Message indiquant qu'un email a été envoyé
   - [ ] Redirection vers `/signup?success=true&email=...`

**Vérification Backend:**

```bash
# Vérifier que l'utilisateur est créé dans la base de données
psql $DATABASE_URL -c "SELECT id, email, email_verified, created_at FROM users WHERE email = 'test-production@example.com';"

# Vérifier qu'un token de vérification a été créé
psql $DATABASE_URL -c "SELECT et.*, u.email FROM email_verification_tokens et JOIN users u ON et.user_id = u.id WHERE u.email = 'test-production@example.com' AND et.used = false;"
```

**✅ Validation:**
- [ ] Utilisateur créé dans la base de données
- [ ] `email_verified = false`
- [ ] Token de vérification créé
- [ ] Token non expiré (expires_at > NOW())

#### 2.2 Vérification Email Reçu

**Vérifications:**

1. **Vérifier la boîte email:**
   - [ ] Email reçu dans les 1-2 minutes
   - [ ] Expéditeur: `support@viridial.com` (ou EMAIL_FROM configuré)
   - [ ] Sujet: "Vérifiez votre adresse email - Viridial"
   - [ ] Email contient un lien de vérification

2. **Vérifier le lien dans l'email:**
   - [ ] Lien pointe vers `https://viridial.com/verify-email?token=...`
   - [ ] Lien est cliquable et fonctionne

**Vérification Logs:**

```bash
# Vérifier les logs d'envoi d'email
docker logs viridial-auth-service | grep -i "verification\|email" | tail -20

# Chercher les erreurs SMTP
docker logs viridial-auth-service | grep -i "error\|smtp\|failed" | tail -10
```

**✅ Validation:**
- [ ] Email reçu
- [ ] Aucune erreur SMTP dans les logs
- [ ] Lien de vérification fonctionnel

---

### Phase 3: Flux Utilisateur - Vérification d'Email

#### 3.1 Test de Vérification

**Étapes manuelles:**

1. **Cliquer sur le lien dans l'email**
   - Redirection vers `https://viridial.com/verify-email?token=...`

2. **Vérifications visuelles:**
   - [ ] Page de vérification s'affiche
   - [ ] Animation de chargement visible
   - [ ] Message de succès après quelques secondes
   - [ ] Message: "✅ Email vérifié avec succès !"
   - [ ] Redirection vers `/login?verified=success`

**Vérification Backend:**

```bash
# Après vérification, vérifier dans la base de données
psql $DATABASE_URL -c "SELECT email, email_verified FROM users WHERE email = 'test-production@example.com';"
# Attendu: email_verified = true

# Vérifier que le token est marqué comme utilisé
psql $DATABASE_URL -c "SELECT et.* FROM email_verification_tokens et JOIN users u ON et.user_id = u.id WHERE u.email = 'test-production@example.com' ORDER BY et.created_at DESC LIMIT 1;"
# Attendu: used = true
```

**Test API Direct:**

```bash
# Extraire le token de l'email, puis:
TOKEN="token_from_email"
curl -X POST https://viridial.com/auth/verify-email \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}"

# Attendu: {"message":"Email vérifié avec succès", "user": {...}}
```

**✅ Validation:**
- [ ] Email vérifié avec succès
- [ ] `email_verified = true` dans la base de données
- [ ] Token marqué comme utilisé
- [ ] Redirection vers login fonctionne

#### 3.2 Test Renvoi d'Email de Vérification

```bash
# Tester le renvoi d'email
curl -X POST https://viridial.com/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test-production@example.com"}'

# Attendu: {"message":"Si cet email existe, un nouveau lien de vérification a été envoyé"}
```

**✅ Validation:**
- [ ] Nouvel email reçu
- [ ] Nouveau token créé dans la base de données
- [ ] Ancien token marqué comme utilisé

---

### Phase 4: Flux Utilisateur - Connexion

#### 4.1 Test Connexion avec Compte Vérifié

**Étapes manuelles:**

1. **Accéder à la page de connexion:**
   ```
   https://viridial.com/login
   ```

2. **Se connecter:**
   - Email: `test-production@example.com`
   - Mot de passe: `Test1234!`

3. **Vérifications:**
   - [ ] Connexion réussie
   - [ ] Redirection vers dashboard ou page d'accueil
   - [ ] Token JWT stocké (cookies ou localStorage)

**Test API Direct:**

```bash
# Test de connexion via API
curl -X POST https://viridial.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-production@example.com",
    "password": "Test1234!"
  }'

# Attendu: {"accessToken":"...", "refreshToken":"...", "user": {...}}
```

**Vérification Logs:**

```bash
# Vérifier les logs de connexion
docker logs viridial-auth-service | grep -i "login\|authenticated" | tail -10
```

**✅ Validation:**
- [ ] Connexion réussie
- [ ] Tokens JWT retournés
- [ ] Utilisateur correctement identifié
- [ ] Aucune erreur dans les logs

#### 4.2 Test Tentatives de Connexion Échouées (Rate Limiting)

```bash
# Tenter plusieurs connexions avec mauvais mot de passe
for i in {1..6}; do
  curl -X POST https://viridial.com/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test-production@example.com", "password": "wrong"}' \
    -w "\nHTTP Status: %{http_code}\n\n"
  sleep 1
done

# À partir de la 6ème tentative, devrait retourner 429 (Too Many Requests)
```

**✅ Validation:**
- [ ] 5 premières tentatives retournent 401 (Unauthorized)
- [ ] 6ème tentative retourne 429 (Too Many Requests)
- [ ] Rate limiting fonctionne correctement

---

### Phase 5: Flux Utilisateur - Réinitialisation de Mot de Passe

#### 5.1 Test Demande de Réinitialisation

**Étapes manuelles:**

1. **Accéder à la page "Mot de passe oublié":**
   ```
   https://viridial.com/forgot-password
   ```

2. **Entrer l'email:**
   - Email: `test-production@example.com`

3. **Vérifications:**
   - [ ] Message de confirmation affiché
   - [ ] Message indiquant qu'un email a été envoyé (même si l'email n'existe pas - sécurité)

**Test API Direct:**

```bash
curl -X POST https://viridial.com/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test-production@example.com"}'

# Attendu: {"message":"Si cet email existe, un lien de réinitialisation a été envoyé"}
```

**Vérification Backend:**

```bash
# Vérifier qu'un token de réinitialisation a été créé
psql $DATABASE_URL -c "SELECT prt.*, u.email FROM password_reset_tokens prt JOIN users u ON prt.user_id = u.id WHERE u.email = 'test-production@example.com' AND prt.used = false ORDER BY prt.created_at DESC LIMIT 1;"
```

**✅ Validation:**
- [ ] Token de réinitialisation créé
- [ ] Email reçu avec lien de réinitialisation
- [ ] Lien pointe vers `https://viridial.com/reset-password?token=...`

#### 5.2 Test Réinitialisation

1. **Cliquer sur le lien dans l'email**
   - Redirection vers `https://viridial.com/reset-password?token=...`

2. **Nouveau mot de passe:**
   - Nouveau mot de passe: `NewTest1234!`
   - Confirmer: `NewTest1234!`

3. **Vérifications:**
   - [ ] Mot de passe réinitialisé avec succès
   - [ ] Message de confirmation affiché
   - [ ] Redirection vers `/login?reset=success`

**Vérification Backend:**

```bash
# Vérifier que le token est marqué comme utilisé
psql $DATABASE_URL -c "SELECT used FROM password_reset_tokens WHERE token = 'TOKEN_FROM_EMAIL';"
# Attendu: used = true

# Vérifier qu'on peut se connecter avec le nouveau mot de passe
curl -X POST https://viridial.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-production@example.com",
    "password": "NewTest1234!"
  }'
# Attendu: Tokens JWT retournés
```

**✅ Validation:**
- [ ] Mot de passe mis à jour
- [ ] Token marqué comme utilisé
- [ ] Connexion avec nouveau mot de passe fonctionne
- [ ] Ancien mot de passe ne fonctionne plus

---

### Phase 6: CORS et Intégration Frontend/Backend

#### 6.1 Test CORS

```bash
# Test requête preflight OPTIONS
curl -X OPTIONS https://viridial.com/auth/login \
  -H "Origin: https://viridial.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Attendu: Headers CORS présents dans la réponse
```

**✅ Validation:**
- [ ] Headers `Access-Control-Allow-Origin` présents
- [ ] Headers `Access-Control-Allow-Methods` incluent POST, GET, etc.
- [ ] Headers `Access-Control-Allow-Credentials: true`

#### 6.2 Test Intégration Frontend → Backend

**Tests dans le navigateur (Console DevTools):**

```javascript
// Test depuis la console du navigateur sur https://viridial.com

// Test signup
fetch('https://viridial.com/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test-integration@example.com',
    password: 'Test1234!',
    confirmPassword: 'Test1234!'
  })
}).then(r => r.json()).then(console.log);

// Test login
fetch('https://viridial.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test-integration@example.com',
    password: 'Test1234!'
  })
}).then(r => r.json()).then(console.log);
```

**✅ Validation:**
- [ ] Aucune erreur CORS dans la console
- [ ] Requêtes réussissent
- [ ] Cookies/sessions fonctionnent correctement

---

### Phase 7: Performance et Stabilité

#### 7.1 Temps de Réponse

```bash
# Test temps de réponse des endpoints clés
for endpoint in "/auth/health" "/auth/login" "/auth/signup"; do
  echo "Testing: $endpoint"
  time curl -X GET "https://viridial.com${endpoint}" \
    -H "Content-Type: application/json" \
    -w "\nTime: %{time_total}s\nHTTP: %{http_code}\n\n" \
    -o /dev/null -s
done
```

**✅ Validation:**
- [ ] Temps de réponse < 500ms pour /health
- [ ] Temps de réponse < 2s pour /login et /signup
- [ ] Pas de timeouts

#### 7.2 Charge Basique

```bash
# Test avec 10 requêtes simultanées
ab -n 100 -c 10 https://viridial.com/auth/health
```

**✅ Validation:**
- [ ] Pas d'erreurs sous charge
- [ ] Temps de réponse acceptable
- [ ] Pas de déconnexions

---

### Phase 8: Sécurité

#### 8.1 Headers de Sécurité

```bash
# Vérifier les headers de sécurité
curl -I https://viridial.com | grep -iE "strict-transport-security|x-frame-options|x-content-type|content-security"

# Attendu:
# - Strict-Transport-Security (HSTS)
# - X-Frame-Options
# - X-Content-Type-Options
```

**✅ Validation:**
- [ ] Headers de sécurité présents
- [ ] HSTS configuré correctement

#### 8.2 Validation des Entrées

```bash
# Test injection SQL (devrait être bloqué)
curl -X POST https://viridial.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com'; DROP TABLE users;--", "password": "test"}'

# Test XSS (devrait être échappé)
curl -X POST https://viridial.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "<script>alert(1)</script>@example.com", "password": "Test1234!", "confirmPassword": "Test1234!"}'
```

**✅ Validation:**
- [ ] Validation des entrées fonctionne
- [ ] Pas de vulnérabilités évidentes

---

## 📊 Rapport de Test

Créer un rapport avec les résultats:

```markdown
# Rapport de Tests Production - Viridial

Date: [DATE]
Testeur: [NOM]

## Résultats par Phase

### Phase 1: Infrastructure ✅/❌
- [ ] HTTPS fonctionnel
- [ ] Services Docker en cours d'exécution
- [ ] Health checks OK

### Phase 2: Inscription ✅/❌
- [ ] Inscription fonctionne
- [ ] Email reçu
- [ ] Utilisateur créé en base

### Phase 3: Vérification Email ✅/❌
- [ ] Vérification fonctionne
- [ ] Email marqué comme vérifié

### Phase 4: Connexion ✅/❌
- [ ] Connexion fonctionne
- [ ] Rate limiting actif

### Phase 5: Réinitialisation ✅/❌
- [ ] Demande fonctionne
- [ ] Réinitialisation fonctionne

### Phase 6: CORS ✅/❌
- [ ] CORS configuré correctement
- [ ] Frontend/Backend intégration OK

### Phase 7: Performance ✅/❌
- [ ] Temps de réponse acceptables
- [ ] Stabilité sous charge

### Phase 8: Sécurité ✅/❌
- [ ] Headers de sécurité présents
- [ ] Validation des entrées OK

## Problèmes Identifiés

[Liste des problèmes trouvés]

## Actions Correctives

[Liste des actions à prendre]
```

## 🚀 Script de Test Automatique

Un script de test automatisé est disponible : `scripts/test-production.sh`

## ✅ Critères de Validation Production

Le système est prêt pour la production si:

- ✅ Tous les tests Phase 1-5 passent
- ✅ Aucune erreur critique dans les logs
- ✅ Performance acceptable (< 2s pour les requêtes)
- ✅ Sécurité de base en place
- ✅ Emails envoyés et reçus correctement

## 🔄 Actions Post-Test

Si des problèmes sont identifiés:

1. Documenter le problème
2. Prioriser par sévérité (Critical, High, Medium, Low)
3. Créer des tickets/bugs
4. Corriger et re-tester

---

**Dernière mise à jour:** [DATE]

