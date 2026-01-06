# Structure du Repository Viridial

Ce document décrit la structure du repository monorepo pour l'architecture microservices de Viridial.

## Vue d'Ensemble

Viridial utilise une architecture **monorepo** pour faciliter le développement, le partage de code, et la gestion des dépendances entre microservices.

**✅ Stratégie confirmée:** Monorepo (structure créée)

## Structure des Dossiers

```
viridial/
├── .github/                    # Configuration GitHub
│   ├── workflows/             # GitHub Actions workflows
│   ├── ISSUE_TEMPLATE/        # Templates d'issues
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS            # Review automatique par équipe
│
├── services/                   # Microservices backend
│   ├── auth-service/          # Authentification, JWT, SSO
│   ├── property-service/     # CRUD propriétés, géolocalisation
│   ├── search-service/       # Recherche Meilisearch
│   ├── lead-service/         # Gestion leads, scoring, CRM
│   ├── billing-service/      # Abonnements, facturation, Stripe
│   └── admin-service/        # Administration, users, roles, i18n
│
├── frontend/                   # Applications frontend
│   ├── web/                  # Site public (Next.js/React)
│   ├── agency/               # Application agence (Next.js/React)
│   └── admin/                # Application admin (Next.js/React)
│
├── shared/                     # Code partagé entre services
│   ├── types/                # Types TypeScript partagés
│   ├── utils/                # Utilitaires partagés
│   └── contracts/            # Contrats API (OpenAPI/Swagger)
│
├── infrastructure/             # Infrastructure as Code
│   ├── ansible/              # Playbooks Ansible
│   ├── kubernetes/           # Manifests Kubernetes
│   │   ├── manifests/        # YAML manifests
│   │   └── helm/            # Charts Helm
│   └── scripts/              # Scripts d'automatisation
│
├── deploy/                     # Scripts de déploiement
│   ├── kubernetes/          # Scripts K8s
│   ├── meili-init/          # Initialisation Meilisearch
│   └── nginx/               # Configurations Nginx
│
├── docs/                       # Documentation
│   ├── stories/             # User stories
│   ├── prd/                 # Product Requirements
│   ├── architecture/        # Architecture docs
│   ├── deployment/          # Guides de déploiement
│   └── roadmap/             # Roadmap et planning
│
├── apis/                       # APIs et contrats (legacy, à migrer)
│
├── docker-compose.yml         # Développement local
├── README.md                  # Documentation principale
└── .github/                   # Configuration GitHub
```

## Microservices

### auth-service
**Responsabilité:** Authentification, autorisation, gestion des tokens JWT, SSO

**Technologies:** NestJS, PostgreSQL, Redis (sessions)

**APIs:**
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `GET /auth/me`

### property-service
**Responsabilité:** CRUD propriétés, géolocalisation, médias

**Technologies:** NestJS, PostgreSQL, MinIO (storage)

**APIs:**
- `GET /properties`
- `POST /properties`
- `GET /properties/:id`
- `PUT /properties/:id`
- `DELETE /properties/:id`

### search-service
**Responsabilité:** Recherche full-text, filtres, facettes

**Technologies:** NestJS, Meilisearch

**APIs:**
- `GET /search`
- `POST /search/filters`
- `GET /search/facets`

### lead-service
**Responsabilité:** Gestion leads, scoring, synchronisation CRM

**Technologies:** NestJS, PostgreSQL, RabbitMQ (events)

**APIs:**
- `GET /leads`
- `POST /leads`
- `PUT /leads/:id`
- `POST /leads/:id/score`

### billing-service
**Responsabilité:** Abonnements, facturation, intégration Stripe

**Technologies:** NestJS, PostgreSQL, Stripe API

**APIs:**
- `GET /subscriptions`
- `POST /subscriptions`
- `POST /subscriptions/:id/cancel`
- `GET /invoices`

### admin-service
**Responsabilité:** Administration, gestion users/roles, configuration i18n

**Technologies:** NestJS, PostgreSQL

**APIs:**
- `GET /admin/users`
- `POST /admin/users`
- `GET /admin/organizations`
- `GET /admin/config`

## Communication Inter-Services

### Synchronous (REST)
- REST APIs avec OpenAPI/Swagger
- Service Discovery via Kubernetes DNS
- Circuit Breaker pattern pour résilience

### Asynchronous (Events)
- RabbitMQ pour events découplés
- Events: `property.created`, `property.updated`, `lead.created`, etc.

## Frontend Applications

### web (Site Public)
- **Framework:** Next.js
- **Purpose:** Recherche publique, listings, pages SEO
- **Deployment:** Static + SSR

### agency (Application Agence)
- **Framework:** Next.js
- **Purpose:** Dashboard agence, gestion propriétés, leads
- **Deployment:** SSR avec authentification

### admin (Application Admin)
- **Framework:** Next.js
- **Purpose:** Administration système, users, organisations
- **Deployment:** SSR avec RBAC strict

## Code Partagé (shared/)

### types/
Types TypeScript partagés entre services et frontend:
- `Property.ts`
- `User.ts`
- `Organization.ts`
- `Lead.ts`
- etc.

### utils/
Utilitaires partagés:
- Validation
- Formatting
- Date helpers
- etc.

### contracts/
Contrats API OpenAPI/Swagger:
- `auth-service.yaml`
- `property-service.yaml`
- etc.

## Infrastructure

### Ansible
Playbooks pour provisioning VPS et installation Kubernetes.

### Kubernetes
Manifests et Helm charts pour déploiement en staging/production.

## Conventions

### Nommage
- Services: `kebab-case` (ex: `auth-service`)
- Branches: `feature/US-XXX-description`, `bugfix/US-XXX-description`
- Commits: `feat(service): description` ou `fix(service): description`

### Ajouter un Nouveau Service

1. Créer dossier `services/new-service/`
2. Initialiser avec structure NestJS standard
3. Ajouter Dockerfile
4. Ajouter au `docker-compose.yml`
5. Créer manifests Kubernetes
6. Documenter dans ce fichier

## Dependencies

Voir `docs/stories/DEPENDENCIES.md` pour les dépendances entre stories et services.

## Roadmap

Voir `docs/stories/EPICS.md` et `docs/roadmap/` pour la roadmap complète.

