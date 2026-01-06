# Guide de Contribution - Viridial

Merci de votre intérêt pour contribuer à Viridial ! Ce guide vous aidera à comprendre comment contribuer efficacement au projet.

## Table des Matières

- [Architecture](#architecture)
- [Workflow GitHub](#workflow-github)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Documentation](#documentation)
- [Microservices Guidelines](#microservices-guidelines)

## Architecture

Viridial est une application SaaS multi-tenant avec une **architecture microservices**.

### Structure du Repository

Voir `docs/architecture/repository-structure.md` pour la structure complète.

**Services Backend:**
- `auth-service` - Authentification, JWT, SSO
- `property-service` - CRUD propriétés, géolocalisation
- `search-service` - Recherche Meilisearch
- `lead-service` - Gestion leads, scoring, CRM
- `billing-service` - Abonnements, facturation
- `admin-service` - Administration, users, roles

**Frontend:**
- `frontend/web` - Site public
- `frontend/agency` - Application agence
- `frontend/admin` - Application admin

### Communication Inter-Services

- **Synchronous:** REST APIs avec OpenAPI/Swagger
- **Asynchronous:** RabbitMQ pour events découplés
- **Service Discovery:** Kubernetes DNS

## Workflow GitHub

Voir `docs/contributing/github-workflow.md` pour le workflow détaillé.

### Processus Rapide

1. **Créer une Issue** liée à une story (US-XXX)
2. **Créer une branche:** `feature/US-XXX-description`
3. **Développer** avec tests
4. **Créer une PR** avec template rempli
5. **Review** et approbation
6. **Merge** dans `develop`

### Branches

- `main` - Production (protégée, 2 approbations requises)
- `develop` - Staging (protégée, 1 approbation requise)
- `feature/US-XXX-*` - Features par story
- `bugfix/US-XXX-*` - Corrections de bugs
- `infra/US-INFRA-XX-*` - Infrastructure

## Standards de Code

### Format de Commit

```
type(service): description courte

Description détaillée si nécessaire

Closes #123
```

**Types:**
- `feat(service):` - Nouvelle feature
- `fix(service):` - Correction de bug
- `docs:` - Documentation
- `refactor(service):` - Refactoring
- `test(service):` - Tests
- `infra:` - Infrastructure

### Code Style

- **TypeScript:** ESLint + Prettier configurés
- **Format:** Auto-format avant commit
- **Linting:** Vérifié par CI/CD

## Tests

### Types de Tests

- **Unit Tests:** Par service, couverture minimum 80%
- **Integration Tests:** Communication inter-services
- **E2E Tests:** Scénarios utilisateur complets

### Exécuter les Tests

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e
```

## Documentation

### Mettre à Jour la Documentation

- **Stories:** `docs/stories/US-XXX-*.story.md`
- **Architecture:** `docs/architecture/`
- **API:** OpenAPI specs dans `shared/contracts/`
- **Deployment:** `docs/deployment/`

### Standards Documentation

- Markdown format
- Liens vers stories et épics
- Exemples de code
- Diagrammes (Mermaid) pour architecture

## Microservices Guidelines

### Créer un Nouveau Service

1. Créer dossier `services/new-service/`
2. Initialiser avec structure NestJS
3. Ajouter Dockerfile
4. Créer manifests Kubernetes
5. Documenter dans `docs/architecture/`

### Contrats API

- Définir OpenAPI spec dans `shared/contracts/`
- Versionner les APIs
- Documenter breaking changes

### Communication

- **REST:** Pour requêtes synchrones
- **Events:** Pour découplage asynchrone
- **Circuit Breaker:** Pour résilience

## Lien avec les Stories

### Référencer une Story

Dans chaque PR, référencer:
- Story ID: `US-XXX`
- Epic: Nom de l'epic
- Voir: `docs/stories/EPICS.md`

### Mettre à Jour le Status

Après merge d'une PR:
1. Mettre à jour `Status: Done` dans la story
2. Mettre à jour la roadmap si nécessaire

## Questions ?

- **Architecture:** Voir `docs/architecture/`
- **Roadmap:** Voir `docs/stories/EPICS.md`
- **Dependencies:** Voir `docs/stories/DEPENDENCIES.md`
- **Workflow:** Voir `docs/contributing/github-workflow.md`

## Ressources

- [Repository Structure](docs/architecture/repository-structure.md)
- [GitHub Workflow](docs/contributing/github-workflow.md)
- [Stories Index](docs/stories/INDEX.md)
- [Epics & Roadmap](docs/stories/EPICS.md)

