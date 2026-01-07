# Configuration des Variables d'Environnement - Viridial

Guide complet pour configurer les variables d'environnement dans tout le projet Viridial.

## 📋 Structure Centralisée

Toutes les variables d'environnement sont centralisées dans un seul fichier source :
- **Fichier source** : `.env` (à la racine du projet)
- **Fichier template** : `.env.example` (committé dans Git)

Les fichiers `.env` des services individuels sont générés automatiquement depuis le fichier principal.

## 🚀 Configuration Rapide

### 1. Installation Initiale

```bash
# Copier le template
cp .env.example .env

# Configurer les variables (éditer avec vos valeurs réelles)
vi .env

# Générer tous les fichiers .env nécessaires
./scripts/setup-env.sh
```

### 2. Synchronisation des Fichiers .env

Après avoir modifié le fichier `.env` principal :

```bash
# Resynchroniser tous les fichiers .env
./scripts/setup-env.sh --force
```

### 3. Vérification

```bash
# Vérifier si tous les fichiers .env existent
./scripts/setup-env.sh --check
```

## 📁 Structure des Fichiers .env

```
viridial/
├── .env                          # ⭐ Fichier principal (source de vérité)
├── .env.example                  # Template (committé dans Git)
│
├── infrastructure/
│   └── docker-compose/
│       └── .env                  # Pour docker compose
│
└── services/
    ├── auth-service/
    │   └── .env                  # Service d'authentification
    └── property-service/
        └── .env                  # Service de gestion des propriétés
```

## 🔧 Variables d'Environnement

### Variables Globales

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NODE_ENV` | Environnement d'exécution | `production`, `staging`, `development` |
| `FRONTEND_URL` | URL du frontend | `https://viridial.com` |
| `FRONTEND_AUTH_API_URL` | URL de l'API Auth | `https://viridial.com` |
| `DOMAIN` | Domaine principal | `viridial.com` |

### Base de Données

| Variable | Description | Format |
|----------|-------------|--------|
| `DATABASE_URL` | URL complète PostgreSQL | `postgresql://user:password@host:port/db` |
| `POSTGRES_HOST` | Host PostgreSQL | `localhost` |
| `POSTGRES_PORT` | Port PostgreSQL | `5432` |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `viridial` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `***` |
| `POSTGRES_DB` | Nom de la base | `viridial` |

### SMTP / Email

| Variable | Description | Exemple |
|----------|-------------|---------|
| `SMTP_HOST` | Serveur SMTP | `smtp.hostinger.com` |
| `SMTP_PORT` | Port SMTP | `465` |
| `SMTP_SECURE` | Utiliser SSL/TLS | `true` |
| `SMTP_USER` | Utilisateur SMTP | `support@viridial.com` |
| `SMTP_PASS` | Mot de passe SMTP | `***` |
| `EMAIL_FROM` | Email expéditeur | `support@viridial.com` |
| `FROM_NAME` | Nom expéditeur | `Viridial Support` |

### JWT / Authentification

| Variable | Description | Génération |
|----------|-------------|------------|
| `JWT_SECRET` | Secret JWT principal | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Secret pour refresh tokens | `openssl rand -base64 32` |
| `JWT_ACCESS_SECRET` | Secret pour access tokens | `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | Durée access token | `3600` (secondes) |
| `JWT_REFRESH_EXPIRES_IN` | Durée refresh token | `604800` (7 jours) |
| `JWT_ACCESS_EXPIRES_IN` | Durée access token (format) | `15m` |

### Services - Ports

| Variable | Description | Valeur |
|----------|-------------|--------|
| `AUTH_SERVICE_PORT` | Port auth-service | `3000` |
| `PROPERTY_SERVICE_PORT` | Port property-service | `3001` |
| `FRONTEND_PORT` | Port frontend | `3000` |
| `NGINX_PORT_HTTP` | Port Nginx HTTP | `80` |
| `NGINX_PORT_HTTPS` | Port Nginx HTTPS | `443` |

### Google OAuth (Optionnel)

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GOOGLE_CALLBACK_URL` | URL de callback OAuth |

### Meilisearch

| Variable | Description | Génération |
|----------|-------------|------------|
| `MEILI_MASTER_KEY` | Clé maître Meilisearch | `openssl rand -base64 32` |
| `MEILI_HOST` | URL Meilisearch | `http://localhost:7700` |

## 🔐 Génération de Secrets

### Générer des Secrets JWT

```bash
# Générer un secret aléatoire (32 bytes)
openssl rand -base64 32

# Générer plusieurs secrets
for i in {1..3}; do
  echo "Secret $i: $(openssl rand -base64 32)"
done
```

### Générer une Clé Meilisearch

```bash
openssl rand -base64 32
```

## 📝 Configuration sur le VPS

### Sur le Serveur VPS

```bash
# SSH vers le VPS
ssh user@148.230.112.148

# Aller dans le répertoire du projet
cd /opt/viridial

# Créer/copier le fichier .env si nécessaire
cp .env.example .env

# Éditer avec vos valeurs
vi .env

# Générer tous les fichiers .env
./scripts/setup-env.sh --force
```

### Variables Critiques sur VPS

Assurez-vous que ces variables sont correctement configurées :

```bash
# URLs HTTPS
FRONTEND_URL=https://viridial.com
FRONTEND_AUTH_API_URL=https://viridial.com

# Base de données (remplacer avec les vraies valeurs)
DATABASE_URL=postgresql://viridial:PASSWORD@localhost:5432/viridial

# SMTP (remplacer avec les vraies valeurs)
SMTP_PASS=VOTRE_MOT_DE_PASSE_SMTP

# Secrets JWT (générer avec openssl rand -base64 32)
JWT_SECRET=GENERATED_SECRET_1
JWT_REFRESH_SECRET=GENERATED_SECRET_2
JWT_ACCESS_SECRET=GENERATED_SECRET_3
```

## 🔄 Synchronisation Automatique

### Avec Docker Compose

Les fichiers `.env` générés utilisent les références `${VAR}` qui sont résolues par Docker Compose depuis le fichier `.env` du répertoire `docker-compose`.

### Script de Synchronisation

Le script `setup-env.sh` remplace les variables par leurs valeurs réelles lors de la génération, donc les fichiers `.env` des services contiennent directement les valeurs (pas de références).

**Important** : Après modification du fichier `.env` principal, réexécutez :

```bash
./scripts/setup-env.sh --force
```

## ✅ Vérification

### Vérifier les Fichiers .env

```bash
# Lister tous les fichiers .env
find . -name ".env" -type f | grep -v node_modules

# Vérifier qu'ils existent
./scripts/setup-env.sh --check

# Vérifier une variable spécifique
grep "DATABASE_URL" .env
```

### Tester la Configuration

```bash
# Tester la connexion à la base de données
psql $DATABASE_URL -c "SELECT version();"

# Tester SMTP (depuis auth-service)
cd services/auth-service
npm run start:dev
# Vérifier les logs pour les erreurs SMTP
```

## 🛠️ Dépannage

### Problème : Variables non chargées

**Symptôme** : Les services ne trouvent pas les variables d'environnement.

**Solution** :
1. Vérifier que le fichier `.env` principal existe
2. Resynchroniser : `./scripts/setup-env.sh --force`
3. Vérifier que Docker Compose charge le bon `.env` : `docker compose --env-file infrastructure/docker-compose/.env config`

### Problème : Secrets non sécurisés

**Symptôme** : Les secrets sont encore `CHANGE_ME`.

**Solution** :
1. Éditer `.env` et remplacer tous les `CHANGE_ME`
2. Générer de nouveaux secrets : `openssl rand -base64 32`
3. Resynchroniser : `./scripts/setup-env.sh --force`

### Problème : Fichiers .env manquants

**Symptôme** : Erreur "Cannot find .env file".

**Solution** :
```bash
# Générer tous les fichiers manquants
./scripts/setup-env.sh --force

# Vérifier qu'ils sont créés
./scripts/setup-env.sh --check
```

## 📚 Références

- [Documentation Docker Compose - Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Next.js - Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [NestJS - Configuration](https://docs.nestjs.com/techniques/configuration)

