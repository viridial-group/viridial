# Viridial - SaaS Immobilier Multi-tenant

Viridial est une plateforme SaaS multi-tenant pour la gestion et la recherche de propriétés immobilières avec architecture microservices.

## 🏗️ Architecture

**Architecture:** Microservices avec Kubernetes

**Services Backend:**
- `auth-service` - Authentification, JWT, SSO
- `property-service` - CRUD propriétés, géolocalisation
- `search-service` - Recherche Meilisearch
- `lead-service` - Gestion leads, scoring, CRM
- `billing-service` - Abonnements, facturation Stripe
- `admin-service` - Administration, users, roles

**Frontend:**
- `frontend/web` - Site public (Next.js)
- `frontend/agency` - Application agence (Next.js)
- `frontend/admin` - Application admin (Next.js)

**Infrastructure:**
- Kubernetes (Kubeadm) sur VPS
- PostgreSQL, Redis, Meilisearch, MinIO
- Observabilité: Prometheus, Grafana, Loki, Jaeger

## 🚀 Quick Start

### Développement Local

```bash
# Avec Docker Compose
docker-compose up -d

# Services disponibles:
# - Frontend: http://localhost:80
# - Identity Service: http://localhost:8080
# - PostgreSQL: localhost:5432
# - Meilisearch: http://localhost:7700
```

Voir `docs/deployment/QUICK-START.md` pour plus de détails.

### Déploiement Kubernetes

Voir `docs/deployment/VPS-KUBERNETES-DEPLOYMENT.md` pour le guide complet.

## 📚 Documentation

- **Architecture:** `docs/architecture/`
- **Stories:** `docs/stories/`
- **Roadmap:** `docs/roadmap/`
- **Deployment:** `docs/deployment/`
- **Contributing:** `CONTRIBUTING.md`

## 📋 Roadmap

Voir `docs/stories/EPICS.md` et `docs/roadmap/README.md` pour la roadmap complète.

**Prochaines étapes:**
1. ✅ US-000: Configuration GitHub
2. 🔄 US-INFRA-01: Kubernetes Cluster
3. ⏳ US-INFRA-02: Services de Base
4. ⏳ US-001: Création d'organisation

## 🛠️ Technologies

- **Backend:** NestJS, TypeScript, PostgreSQL
- **Frontend:** Next.js, React, TypeScript
- **Infrastructure:** Kubernetes, Docker, Ansible
- **Search:** Meilisearch
- **Storage:** MinIO (S3-compatible)
- **Cache:** Redis
- **Observability:** Prometheus, Grafana, Loki, Jaeger

## 🤝 Contribuer

Voir `CONTRIBUTING.md` pour le guide complet.

**Workflow:**
1. Créer Issue liée à une story (US-XXX)
2. Créer branche: `feature/US-XXX-description`
3. Développer avec tests
4. Créer PR avec template
5. Review et merge

## 📖 Stories

Toutes les user stories sont dans `docs/stories/`:
- [Index des Stories](docs/stories/INDEX.md)
- [Epics & Roadmap](docs/stories/EPICS.md)
- [Dependencies](docs/stories/DEPENDENCIES.md)

## 🔗 Liens Utiles

- **Repository:** https://github.com/viridial-group/viridial.git
- **GitHub Workflow:** `docs/contributing/github-workflow.md`
- **Repository Structure:** `docs/architecture/repository-structure.md`
- **Quick Start:** `docs/deployment/QUICK-START.md`
- **Getting Started:** `docs/GETTING-STARTED.md`

## 📝 License

[À définir]

