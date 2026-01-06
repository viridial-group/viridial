# Quick Start - Viridial

Guide rapide pour démarrer avec Viridial.

## Repository GitHub

```bash
# Cloner le repository
git clone https://github.com/viridial-group/viridial.git
cd viridial
```

## Configuration Initiale

### 1. Secrets

```bash
cd infrastructure/secrets
cp .env.example .env
# Éditer .env avec vos credentials
```

### 2. Git Remote (si nécessaire)

```bash
git remote add origin https://github.com/viridial-group/viridial.git
git remote -v  # Vérifier
```

## Développement Local

### Docker Compose

```bash
# Lancer tous les services
docker-compose up -d

# Voir logs
docker-compose logs -f

# Arrêter
docker-compose down
```

## Déploiement VPS

### 1. Provisionner Cluster Kubernetes

```bash
cd infrastructure
./scripts/provision-cluster.sh
```

### 2. Récupérer kubeconfig

```bash
scp root@148.230.112.148:~/.kube/config ~/.kube/config
kubectl get nodes
```

### 3. Créer Secrets

```bash
./infrastructure/scripts/create-secrets.sh viridial-staging
```

## Documentation

- [Repository Structure](docs/architecture/repository-structure.md)
- [GitHub Workflow](docs/contributing/github-workflow.md)
- [Provisioning Guide](docs/deployment/PROVISIONING-GUIDE.md)
- [SMTP Configuration](docs/architecture/smtp-configuration.md)

## Ressources

- **Repository:** https://github.com/viridial-group/viridial.git
- **VPS:** 148.230.112.148
- **Documentation:** `docs/`

