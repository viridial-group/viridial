# Services - Architecture Microservices

Ce dossier contient tous les microservices backend de Viridial dans une architecture **monorepo**.

## Services

### auth-service
**Responsabilité:** Authentification, autorisation, gestion des tokens JWT, SSO

**APIs Principales:**
- `POST /auth/login` - Connexion utilisateur
- `POST /auth/register` - Inscription
- `POST /auth/refresh` - Rafraîchir token
- `GET /auth/me` - Profil utilisateur actuel

**Technologies:** NestJS, PostgreSQL, Redis (sessions)

### property-service
**Responsabilité:** CRUD propriétés, géolocalisation, gestion des médias

**APIs Principales:**
- `GET /properties` - Liste propriétés
- `POST /properties` - Créer propriété
- `GET /properties/:id` - Détails propriété
- `PUT /properties/:id` - Modifier propriété
- `DELETE /properties/:id` - Supprimer propriété

**Technologies:** NestJS, PostgreSQL, MinIO (storage)

### search-service
**Responsabilité:** Recherche full-text, filtres, facettes

**APIs Principales:**
- `GET /search` - Recherche propriétés
- `POST /search/filters` - Recherche avec filtres avancés
- `GET /search/facets` - Facettes disponibles

**Technologies:** NestJS, Meilisearch

### lead-service
**Responsabilité:** Gestion leads, scoring, synchronisation CRM

**APIs Principales:**
- `GET /leads` - Liste leads
- `POST /leads` - Créer lead
- `PUT /leads/:id` - Modifier lead
- `POST /leads/:id/score` - Calculer score lead

**Technologies:** NestJS, PostgreSQL, RabbitMQ (events)

### billing-service
**Responsabilité:** Abonnements, facturation, intégration Stripe

**APIs Principales:**
- `GET /subscriptions` - Liste abonnements
- `POST /subscriptions` - Créer abonnement
- `POST /subscriptions/:id/cancel` - Annuler abonnement
- `GET /invoices` - Liste factures

**Technologies:** NestJS, PostgreSQL, Stripe API

### admin-service
**Responsabilité:** Administration, gestion users/roles, configuration i18n

**APIs Principales:**
- `GET /admin/users` - Liste utilisateurs
- `POST /admin/users` - Créer utilisateur
- `GET /admin/organizations` - Liste organisations
- `GET /admin/config` - Configuration système

**Technologies:** NestJS, PostgreSQL

## Structure Commune d'un Service

Chaque service suit cette structure:

```
service-name/
├── src/
│   ├── main.ts              # Point d'entrée
│   ├── app.module.ts        # Module principal
│   ├── controllers/         # Controllers REST
│   ├── services/            # Business logic
│   ├── entities/            # Entités TypeORM
│   ├── dto/                 # Data Transfer Objects
│   ├── guards/              # Guards (auth, RBAC)
│   ├── interceptors/        # Interceptors
│   └── config/              # Configuration
├── test/                    # Tests
├── Dockerfile               # Image Docker
├── package.json             # Dépendances
├── tsconfig.json            # Config TypeScript
└── README.md                # Documentation service
```

## Communication Inter-Services

### Synchronous (REST)
- REST APIs avec OpenAPI/Swagger
- Service Discovery via Kubernetes DNS: `service-name.namespace.svc.cluster.local`
- Circuit Breaker pattern pour résilience

### Asynchronous (Events)
- RabbitMQ pour events découplés
- Events: `property.created`, `property.updated`, `lead.created`, etc.

## Développement Local

Voir `docker-compose.yml` pour lancer tous les services localement.

## Déploiement

Chaque service est déployé comme un Deployment Kubernetes séparé.
Voir `infrastructure/kubernetes/manifests/` pour les manifests.

## Ajouter un Nouveau Service

1. Créer dossier `services/new-service/`
2. Initialiser avec structure NestJS standard
3. Ajouter Dockerfile
4. Ajouter au `docker-compose.yml`
5. Créer manifests Kubernetes dans `infrastructure/kubernetes/manifests/`
6. Documenter dans ce README

