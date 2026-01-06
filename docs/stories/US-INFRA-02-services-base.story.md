# US-INFRA-02: Services de Base - Database, Cache, Search, Storage

## Status: Draft

### Story
En tant qu'équipe d'ingénierie, je souhaite déployer les services de base (PostgreSQL, Redis, Meilisearch, MinIO) sur Kubernetes avec persistence et haute disponibilité afin de supporter les microservices de l'application.

### Acceptance Criteria
- Given cluster Kubernetes, When je déploie PostgreSQL, Then la base de données est accessible avec persistence garantie.
- Given cluster Kubernetes, When je déploie Redis, Then le cache est accessible pour sessions et données temporaires.
- Given cluster Kubernetes, When je déploie Meilisearch, Then le moteur de recherche est accessible et indexé.
- Given cluster Kubernetes, When je déploie MinIO, Then le stockage objet est accessible (S3-compatible).
- Tous les services ont des health checks et sont monitorables.
- Persistence configurée avec PersistentVolumes.

**Priority:** P0
**Estimation:** 5

### Tasks

#### Phase 1: PostgreSQL Deployment
- [ ] StatefulSet PostgreSQL créé avec persistence
- [ ] Secret pour credentials PostgreSQL créé
- [ ] PersistentVolumeClaim configuré (20GB minimum)
- [ ] Service PostgreSQL exposé dans le cluster
- [ ] Health checks configurés (liveness/readiness probes)
- [ ] Connection pooling: PgBouncer déployé (optionnel pour MVP)
- [ ] Resource limits configurés (CPU, memory)

#### Phase 2: Redis Deployment
- [ ] Deployment Redis créé
- [ ] Service Redis exposé dans le cluster
- [ ] Health checks configurés
- [ ] Resource limits configurés
- [ ] Persistence optionnelle configurée (si nécessaire)

#### Phase 3: Meilisearch Deployment
- [ ] Deployment Meilisearch créé avec persistence
- [ ] Secret pour MEILI_MASTER_KEY créé
- [ ] PersistentVolumeClaim configuré (10GB minimum)
- [ ] Service Meilisearch exposé dans le cluster
- [ ] Health checks configurés
- [ ] Initialisation des index via init script (déployer init container ou job)

#### Phase 4: MinIO Deployment
- [ ] Deployment MinIO créé avec persistence
- [ ] Secret pour credentials MinIO créé
- [ ] PersistentVolumeClaim configuré (50GB minimum)
- [ ] Service MinIO exposé (API + Console)
- [ ] Health checks configurés
- [ ] Buckets initiaux créés: `property-images`, `documents`, `backups`

#### Phase 5: Configuration & Testing
- [ ] ConfigMaps créés pour configuration des services
- [ ] Services testés (connectivité, health checks)
- [ ] Persistence validée (redémarrer pods et vérifier données)
- [ ] Documentation des endpoints et credentials

### Technical Notes

**PostgreSQL:**
- **Image:** postgres:14-alpine
- **Storage:** PersistentVolume avec 20GB minimum
- **Replication:** Master-slave optionnel (pour production)
- **Connection Pooling:** PgBouncer ou HikariCP dans l'application
- **Multi-tenant:** Row-Level Security (RLS) activé (voir US-007)
- **Migrations:** Flyway pour versioning (voir US-007)

**Redis:**
- **Image:** redis:7-alpine
- **Usage:** Cache distribué, sessions, queues temporaires
- **Persistence:** Optionnelle (AOF ou RDB selon besoin)
- **Resource Limits:** 256Mi-512Mi memory, 100m-500m CPU

**Meilisearch:**
- **Image:** getmeili/meilisearch:v1.5
- **Storage:** PersistentVolume avec 10GB minimum
- **Initialisation:** Scripts dans `deploy/meili-init/` à exécuter après déploiement
- **Index:** `properties` avec configuration multi-langue

**MinIO:**
- **Image:** minio/minio:latest
- **Storage:** PersistentVolume avec 50GB minimum
- **Access:** S3-compatible API (port 9000) + Console (port 9001)
- **Buckets:** Créer buckets initiaux via mc (MinIO Client) ou API
- **Lifecycle:** Configurer policies de retention (optionnel pour MVP)

**Dependencies:**
- Nécessite US-INFRA-01 (Kubernetes cluster) complété
- Nécessite secrets management (Kubernetes Secrets ou Vault)

### Definition of Done
- [ ] PostgreSQL déployé et accessible via service `postgres`
- [ ] Redis déployé et accessible via service `redis`
- [ ] Meilisearch déployé et accessible via service `meilisearch`
- [ ] MinIO déployé et accessible via service `minio`
- [ ] Health checks passent pour tous les services
- [ ] Persistence validée (redémarrer pods et vérifier données conservées)
- [ ] Services testés depuis un pod de test (connectivité)
- [ ] Secrets créés et sécurisés (pas en plain text)
- [ ] Resource limits configurés et respectés
- [ ] Documentation des endpoints et configuration

