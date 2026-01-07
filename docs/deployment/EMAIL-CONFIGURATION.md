# Configuration Email (SMTP)

Ce guide explique comment configurer l'envoi d'emails pour le service d'authentification.

## Variables d'Environnement Requises

L'auth-service nécessite les variables d'environnement suivantes pour envoyer des emails :

```env
# Configuration SMTP
SMTP_HOST=smtp.hostinger.com          # Serveur SMTP
SMTP_PORT=465                          # Port SMTP (465 pour SSL, 587 pour TLS)
SMTP_USER=votre-email@viridial.com    # Email d'envoi (ou utiliser EMAIL_FROM)
SMTP_PASS=votre-mot-de-passe-smtp     # Mot de passe SMTP
SMTP_SECURE=true                       # true pour SSL (port 465), false pour TLS (port 587)

# Email d'expéditeur
EMAIL_FROM=support@viridial.com       # Email d'expéditeur (utilisé si SMTP_USER non défini)
FROM_NAME=Viridial Support            # Nom d'expéditeur

# URL du frontend (pour les liens dans les emails)
FRONTEND_URL=https://viridial.com     # URL de production
```

## Configuration dans Docker Compose

Mettre à jour le fichier `.env` dans `infrastructure/docker-compose/` :

```bash
cd /opt/viridial/infrastructure/docker-compose

# Ajouter les variables SMTP
cat >> .env << EOF

# Email Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=votre-email@viridial.com
SMTP_PASS=votre-mot-de-passe-smtp
SMTP_SECURE=true
EMAIL_FROM=support@viridial.com
FROM_NAME=Viridial Support
FRONTEND_URL=https://viridial.com
EOF
```

## Vérification de la Configuration

### 1. Tester la connexion SMTP

Sur le VPS, vérifier que les variables sont bien définies :

```bash
docker exec viridial-auth-service env | grep SMTP
```

### 2. Vérifier les logs

Les logs montrent un avertissement si les credentials SMTP manquent :

```bash
docker logs viridial-auth-service | grep -i "smtp\|email"
```

Attendu si configuré correctement :
- Pas d'avertissement SMTP
- Pas d'erreurs lors de l'envoi d'email

### 3. Tester l'envoi d'email

Lors de l'inscription, vérifier :
1. L'utilisateur est créé avec succès
2. Un email de vérification est envoyé
3. Les logs ne montrent pas d'erreur d'envoi

## Types d'Emails Envoyés

### 1. Email de Vérification (Inscription)

- **Déclencheur**: Lors de l'inscription d'un nouvel utilisateur
- **Contenu**: Lien de vérification d'email valable 24 heures
- **Endpoint**: Généré automatiquement lors du signup

### 2. Email de Réinitialisation de Mot de Passe

- **Déclencheur**: Lors de la demande de réinitialisation
- **Contenu**: Lien de réinitialisation valable 1 heure
- **Endpoint**: `POST /auth/forgot-password`

## Configuration SMTP par Fournisseur

### Hostinger

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
```

### Gmail (App Password requis)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-app-password  # Pas votre mot de passe normal !
```

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre-api-key-mailgun
```

## Dépannage

### Problème: "SMTP credentials manquants"

**Solution:**
1. Vérifier que `SMTP_USER` (ou `EMAIL_FROM`) est défini
2. Vérifier que `SMTP_PASS` est défini
3. Redémarrer le service après modification des variables :

```bash
docker compose -f app-auth.yml restart auth-service
```

### Problème: "EAUTH" ou "Invalid credentials"

**Solution:**
1. Vérifier que `SMTP_USER` et `SMTP_PASS` sont corrects
2. Pour Gmail, utiliser un "App Password" au lieu du mot de passe normal
3. Vérifier que le compte email autorise l'accès SMTP

### Problème: "Connection timeout"

**Solution:**
1. Vérifier que le port SMTP n'est pas bloqué par le firewall
2. Vérifier que `SMTP_HOST` et `SMTP_PORT` sont corrects
3. Essayer avec `SMTP_SECURE=false` si le port 465 ne fonctionne pas

### Problème: Les emails arrivent dans les spams

**Solution:**
1. Configurer SPF, DKIM et DMARC pour votre domaine
2. Utiliser une adresse d'expéditeur avec votre domaine (pas Gmail générique)
3. Éviter les mots-clés spam dans le sujet et le contenu

## Test Manuel

Pour tester l'envoi d'email manuellement :

```bash
# Via l'API
curl -X POST https://viridial.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "confirmPassword": "Test1234"
  }'

# Vérifier les logs
docker logs viridial-auth-service --tail=20 | grep -i email
```

## Sécurité

⚠️ **Important:**

1. **Ne jamais commiter les credentials SMTP** dans le code
2. Utiliser des variables d'environnement uniquement
3. Utiliser des "App Passwords" pour Gmail (pas le mot de passe principal)
4. Limiter les permissions du compte email SMTP
5. Surveiller les logs pour détecter les tentatives d'abus

## Après Configuration

1. **Redémarrer le service:**
   ```bash
   cd /opt/viridial/infrastructure/docker-compose
   docker compose -f app-auth.yml restart auth-service
   ```

2. **Vérifier les logs:**
   ```bash
   docker logs viridial-auth-service --tail=50
   ```

3. **Tester l'inscription:**
   - Créer un nouveau compte
   - Vérifier que l'email de vérification est reçu
   - Cliquer sur le lien pour vérifier l'email

