# Secrets Management - Viridial

Gestion sécurisée des secrets pour l'infrastructure Viridial.

## ⚠️  Sécurité

**NE JAMAIS COMMITTER** les fichiers `.env` dans Git!

Le fichier `.gitignore` est configuré pour ignorer automatiquement:
- `.env`
- `*.secret.yaml`
- `*.key`
- `*.pem`

## Configuration

### 1. Créer fichier .env

```bash
cd infrastructure/secrets
cp .env.example .env
# Éditer .env avec vos valeurs réelles
```

### 2. Variables SMTP (Configurées)

```bash
FROM_NAME=support@viridial.com
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@viridial.com
SMTP_PASS=S@upport!19823
EMAIL_FROM=support@viridial.com
```

### 3. Autres Variables (À configurer)

- **Database:** `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- **Redis:** `REDIS_PASSWORD`
- **Meilisearch:** `MEILI_MASTER_KEY`
- **MinIO:** `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`
- **JWT:** `JWT_SECRET`, `JWT_REFRESH_SECRET`
- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

## Utilisation

### Créer Secrets Kubernetes

```bash
# Automatique avec script
./infrastructure/scripts/create-secrets.sh viridial-staging
./infrastructure/scripts/create-secrets.sh viridial-production

# Ou manuellement
kubectl create secret generic smtp-config \
  --from-env-file=infrastructure/secrets/.env \
  -n viridial-staging
```

### Utiliser dans Pods

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
  - name: app
    image: my-app:latest
    envFrom:
    - secretRef:
        name: smtp-config
```

### Utiliser dans Deployments

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: identity-service
spec:
  template:
    spec:
      containers:
      - name: identity-service
        env:
        - name: SMTP_HOST
          valueFrom:
            secretKeyRef:
              name: smtp-config
              key: SMTP_HOST
        - name: SMTP_USER
          valueFrom:
            secretKeyRef:
              name: smtp-config
              key: SMTP_USER
        - name: SMTP_PASS
          valueFrom:
            secretKeyRef:
              name: smtp-config
              key: SMTP_PASS
```

## Ansible

Les secrets peuvent être créés via Ansible:

```bash
cd infrastructure/ansible
ansible-playbook playbooks/09-create-secrets.yml -i inventory.ini
```

## Rotation des Secrets

Pour changer un secret:

1. Modifier `.env`
2. Recréer le secret:
   ```bash
   kubectl delete secret smtp-config -n viridial-staging
   ./infrastructure/scripts/create-secrets.sh viridial-staging
   ```
3. Redémarrer les pods qui utilisent le secret:
   ```bash
   kubectl rollout restart deployment -n viridial-staging
   ```

## Vault (Future - US-INFRA-04)

Pour production, utiliser HashiCorp Vault pour gestion avancée des secrets:
- Rotation automatique
- Audit logs
- Accès granulaire
- Encryption at rest

## Vérification

```bash
# Lister secrets
kubectl get secrets -n viridial-staging

# Voir un secret (base64 encodé)
kubectl get secret smtp-config -n viridial-staging -o yaml

# Décoder un secret
kubectl get secret smtp-config -n viridial-staging -o jsonpath='{.data.SMTP_PASS}' | base64 -d
```

