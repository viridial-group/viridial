# Getting Started - Viridial

Guide complet pour démarrer avec le projet Viridial.

## Repository GitHub

**URL:** https://github.com/viridial-group/viridial.git

### Cloner le Repository

```bash
git clone https://github.com/viridial-group/viridial.git
cd viridial
```

### Initialiser Git (si repository local)

Si vous avez déjà le code localement:

```bash
# Initialiser Git
git init

# Ajouter remote
git remote add origin https://github.com/viridial-group/viridial.git

# Vérifier
git remote -v
```

## Configuration Initiale

### 1. Secrets SMTP

```bash
cd infrastructure/secrets
cp .env.example .env
# Éditer .env avec vos credentials SMTP
```

**Configuration SMTP (déjà fournie):**
```bash
FROM_NAME=support@viridial.com
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@viridial.com
SMTP_PASS=S@upport!19823
EMAIL_FROM=support@viridial.com
```

### 2. Autres Secrets (à configurer)

Éditer `infrastructure/secrets/.env` pour:
- Database passwords
- Redis password
- Meilisearch master key
- MinIO credentials
- JWT secrets
- Stripe keys

## Développement Local

### Option 1: Docker Compose

```bash
# Lancer tous les services
docker-compose up -d

# Services disponibles:
# - Frontend: http://localhost:80
# - Identity Service: http://localhost:8080
# - PostgreSQL: localhost:5432
# - Meilisearch: http://localhost:7700
# - Redis: localhost:6379
```

### Option 2: Services Individuels

```bash
# Lancer PostgreSQL
docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:14-alpine

# Lancer Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Lancer Meilisearch
docker run -d --name meilisearch -p 7700:7700 -e MEILI_MASTER_KEY=masterKey getmeili/meilisearch:v1.2
```

## Déploiement VPS

### Informations VPS

- **Fournisseur:** Hostinger
- **IP:** 148.230.112.148
- **Repository:** https://github.com/viridial-group/viridial.git

### 1. Provisionner Cluster Kubernetes

```bash
cd infrastructure
./scripts/provision-cluster.sh
```

### 2. Récupérer kubeconfig

```bash
mkdir -p ~/.kube
scp root@148.230.112.148:~/.kube/config ~/.kube/config
kubectl get nodes
```

### 3. Créer Secrets Kubernetes

```bash
# Créer fichier .env d'abord (voir Configuration Initiale)
./infrastructure/scripts/create-secrets.sh viridial-staging
./infrastructure/scripts/create-secrets.sh viridial-production
```

## Structure du Projet

```
viridial/
├── services/          # 6 microservices backend
│   ├── auth-service/
│   ├── property-service/
│   ├── search-service/
│   ├── lead-service/
│   ├── billing-service/
│   └── admin-service/
├── frontend/          # 3 applications frontend
│   ├── web/
│   ├── agency/
│   └── admin/
├── shared/            # Code partagé
│   ├── types/
│   ├── utils/
│   └── contracts/
├── infrastructure/    # IaC (Ansible, Kubernetes)
│   ├── ansible/
│   └── kubernetes/
└── docs/              # Documentation
```

Voir [Repository Structure](docs/architecture/repository-structure.md) pour détails.

## Workflow de Développement

### 1. Créer une Branche

```bash
git checkout develop
git pull origin develop
git checkout -b feature/US-XXX-description
```

### 2. Développer

```bash
# Faire vos modifications
# Tester localement
docker-compose up -d
npm test  # Dans chaque service
```

### 3. Créer Pull Request

```bash
git add .
git commit -m "feat(service): US-XXX description"
git push origin feature/US-XXX-description
# Créer PR sur GitHub
```

Voir [GitHub Workflow](docs/contributing/github-workflow.md) pour détails.

## Documentation

- **Architecture:** [docs/architecture/](docs/architecture/)
- **Stories:** [docs/stories/](docs/stories/)
- **Roadmap:** [docs/roadmap/](docs/roadmap/)
- **Deployment:** [docs/deployment/](docs/deployment/)
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)

## Prochaines Étapes

1. ✅ **US-000:** Configuration GitHub (fait)
2. 🔄 **US-INFRA-01:** Kubernetes Cluster (en cours)
3. ⏳ **US-INFRA-02:** Services de Base (PostgreSQL, Redis, Meilisearch, MinIO)
4. ⏳ **US-001:** Création d'organisation

Voir [Roadmap](docs/stories/EPICS.md) pour la roadmap complète.

## Ressources

- **Repository:** https://github.com/viridial-group/viridial.git
- **VPS:** Hostinger (148.230.112.148)
- **Documentation:** `docs/`
- **Quick Start:** [QUICK-START.md](docs/QUICK-START.md)
- **Hostinger Guide:** [HOSTINGER-VPS-GUIDE.md](docs/deployment/HOSTINGER-VPS-GUIDE.md)

