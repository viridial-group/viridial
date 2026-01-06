# Setup Secrets - Instructions Rapides

## 1. Créer fichier .env

```bash
cd infrastructure/secrets
cp .env.example .env
```

## 2. Configurer SMTP (Déjà fait)

Le fichier `.env` doit contenir:

```bash
FROM_NAME=support@viridial.com
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@viridial.com
SMTP_PASS=S@upport!19823
EMAIL_FROM=support@viridial.com
```

## 3. Créer Secrets Kubernetes

```bash
# Après provisionnement du cluster
./infrastructure/scripts/create-secrets.sh viridial-staging
./infrastructure/scripts/create-secrets.sh viridial-production
```

## 4. Vérifier

```bash
kubectl get secrets -n viridial-staging | grep smtp
kubectl get secret smtp-config -n viridial-staging -o yaml
```

## ⚠️  Sécurité

- **NE JAMAIS COMMITTER** `.env` dans Git
- Le fichier est automatiquement ignoré par `.gitignore`
- Utiliser Vault (US-INFRA-04) pour production

