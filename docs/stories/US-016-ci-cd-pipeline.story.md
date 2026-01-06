# US-016: CI/CD pipeline et déploiement en staging

## Status: Draft

### Story
En tant que développeur/DevOps, je veux disposer d'une pipeline CI/CD qui build, teste et déploie automatiquement les services en staging quand je pousse sur `main`, afin d'assurer des livraisons reproductibles et une validation continue.

### Acceptance Criteria
- GitHub Actions (ou pipeline) exécute : checkout → build Java services → run unit tests → linter frontend → build docker images.
- Artifacts (images) sont publiés dans un registry (simulé en local pour PoC) et un déploiement staging est déclenché (docker compose ou Helm PoC).
- Smoke tests éxécutés post‑déploiement (health endpoints OK).
- Notifications (Slack/email stub) en cas d’échec du pipeline.

**Priority:** P0
**Estimation:** 8

### Tasks
- [ ] Définir workflow GitHub Actions: build/test/docker
- [ ] Configurer secrets (REGISTRY, CREDENTIALS) en CI
- [ ] Déployer en staging via `docker compose` ou Helm chart PoC
- [ ] Ajouter smoke tests automatisés
- [ ] Documenter le workflow et commandes run
