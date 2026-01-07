# US-INFRA-02: Services de Base - Database, Cache, Search, Storage

## Status: Ready for Review

### Story
En tant qu'équipe d'ingénierie, je souhaite déployer les services de base (PostgreSQL, Redis, Meilisearch, MinIO) avec Docker Compose sur le VPS avec persistence garantie afin de supporter les microservices de l'application.

### Acceptance Criteria
- Given Docker et Docker Compose installés, When je déploie PostgreSQL, Then la base de données est accessible avec persistence garantie via volumes Docker.
- Given Docker et Docker Compose installés, When je déploie Redis, Then le cache est accessible pour sessions et données temporaires avec persistence AOF.
- Given Docker et Docker Compose installés, When je déploie Meilisearch, Then le moteur de recherche est accessible et indexé avec persistence.
- Given Docker et Docker Compose installés, When je déploie MinIO, Then le stockage objet est accessible (S3-compatible) avec buckets initialisés.
- Tous les services ont des health checks et sont monitorables.
- Persistence configurée avec volumes Docker.

**Priority:** P0
**Estimation:** 5

### Tasks

#### Phase 1: Préparation Docker Compose
- [x] Docker Compose configuration créée (`infrastructure/docker-compose/docker-compose.yml`)
- [x] Script d'installation automatique créé (`install-services.sh`)
- [x] Script de test de connectivité créé (`test-services.sh`)
- [x] Template de configuration créé (`.env.example`)
- [x] Documentation complète créée (`README.md`, `INSTALL-VPS.md`, `NEXT-STEPS.md`)
- [x] Script de nettoyage créé (`cleanup-old-compose.sh`)
- [ ] Docker installé sur le VPS
- [ ] Docker Compose installé sur le VPS

#### Phase 2: PostgreSQL Deployment
- [x] Service PostgreSQL configuré dans docker-compose.yml
- [x] Volume Docker configuré pour persistence (postgres_data)
- [x] Variables d'environnement configurées (.env)
- [x] Health checks configurés (pg_isready)
- [x] Configuration PostgreSQL optimisée (max_connections, shared_buffers, etc.)
- [x] PostgreSQL déployé et accessible sur le VPS
- [x] Tests de connectivité PostgreSQL réussis

#### Phase 3: Redis Deployment
- [x] Service Redis configuré dans docker-compose.yml
- [x] Configuration Redis créée (`config/redis.conf`)
- [x] Volume Docker configuré pour persistence avec AOF (redis_data)
- [x] Health checks configurés (redis-cli ping)
- [x] Redis déployé et accessible sur le VPS
- [x] Tests de connectivité Redis réussis

#### Phase 4: Meilisearch Deployment
- [x] Service Meilisearch configuré dans docker-compose.yml
- [x] Secret MEILI_MASTER_KEY configuré dans .env
- [x] Volume Docker configuré pour persistence (meilisearch_data)
- [x] Health checks configurés (HTTP /health)
- [x] Meilisearch déployé et accessible sur le VPS
- [x] Tests de connectivité Meilisearch réussis

#### Phase 5: MinIO Deployment
- [x] Service MinIO configuré dans docker-compose.yml
- [x] Secret credentials MinIO configuré dans .env
- [x] Volume Docker configuré pour persistence (minio_data)
- [x] Service d'initialisation des buckets créé (minio-init)
- [x] Health checks configurés (HTTP /minio/health/live)
- [x] MinIO déployé et accessible sur le VPS
- [x] Buckets initialisés (property-images, documents, backups)
- [x] Tests de connectivité MinIO réussis

#### Phase 6: Déploiement et Validation
- [x] Services déployés sur le VPS avec `./install-services.sh`
- [x] Tous les services sont `Up` et `healthy`
- [x] Tests de connectivité réussis (`./test-services.sh`)
- [ ] Credentials sauvegardés de manière sécurisée
- [x] Documentation mise à jour avec les endpoints réels
- [ ] Persistence validée (redémarrer conteneurs et vérifier données conservées)

### Technical Notes

**Architecture:**
- **Approche:** Docker Compose (sans Kubernetes)
- **Localisation:** `infrastructure/docker-compose/`
- **Réseau:** Bridge network `viridial-network`
- **Persistence:** Volumes Docker locaux

**PostgreSQL:**
- **Image:** postgres:14-alpine
- **Storage:** Volume Docker `postgres_data` (50GB minimum recommandé)
- **Port:** 5432 (configurable via .env)
- **Configuration:** Optimisée pour VPS (max_connections=200, shared_buffers=256MB)
- **Connection Pooling:** HikariCP dans l'application (pas de PgBouncer séparé)
- **Multi-tenant:** Row-Level Security (RLS) activé (voir US-007)
- **Migrations:** Flyway pour versioning (voir US-007)
- **Health Check:** pg_isready

**Redis:**
- **Image:** redis:7-alpine
- **Port:** 6379 (configurable via .env)
- **Usage:** Cache distribué, sessions, queues temporaires
- **Persistence:** AOF activé (appendonly yes, appendfsync everysec)
- **Configuration:** Fichier `config/redis.conf` avec maxmemory 512mb
- **Health Check:** redis-cli ping

**Meilisearch:**
- **Image:** getmeili/meilisearch:v1.5
- **Port:** 7700 (configurable via .env)
- **Storage:** Volume Docker `meilisearch_data` (20GB minimum recommandé)
- **Master Key:** Généré automatiquement ou configuré dans .env
- **Initialisation:** Index à créer après déploiement (voir US-007)
- **Health Check:** HTTP GET /health

**MinIO:**
- **Image:** minio/minio:latest
- **Ports:** 
  - API: 9000 (configurable via .env)
  - Console: 9001 (configurable via .env)
- **Storage:** Volume Docker `minio_data` (100GB minimum recommandé)
- **Buckets:** Initialisés automatiquement via service `minio-init`
  - `property-images`
  - `documents`
  - `backups`
- **Access:** S3-compatible API
- **Health Check:** HTTP GET /minio/health/live

**Dependencies:**
- Docker installé et fonctionnel
- Docker Compose installé (v2.0+ ou docker-compose v1.29+)
- Au moins 2GB de RAM disponible
- Au moins 10GB d'espace disque disponible

**Fichiers de Configuration:**
- `docker-compose.yml` - Configuration des services
- `.env` - Variables d'environnement (secrets, ports, etc.)
- `config/redis.conf` - Configuration Redis
- `install-services.sh` - Script d'installation automatique
- `test-services.sh` - Script de test de connectivité

**Sécurité:**
- ⚠️ Ne JAMAIS commiter le fichier `.env` (déjà dans .gitignore)
- Mots de passe générés automatiquement par `install-services.sh`
- Sauvegarder les credentials dans un gestionnaire de mots de passe
- En production, limiter l'accès aux ports avec un firewall

### Definition of Done
- [x] Docker installé sur le VPS
- [x] Docker Compose installé sur le VPS
- [x] Services déployés avec `./install-services.sh`
- [x] PostgreSQL accessible sur le port configuré
- [x] Redis accessible sur le port configuré
- [x] Meilisearch accessible sur le port configuré
- [x] MinIO accessible sur les ports configurés (API et Console)
- [x] Health checks passent pour tous les services
- [x] Tests de connectivité réussis (`./test-services.sh`)
- [ ] Persistence validée (redémarrer conteneurs et vérifier données conservées)
- [x] Buckets MinIO initialisés (property-images, documents, backups)
- [ ] Credentials sauvegardés de manière sécurisée
- [x] Documentation mise à jour avec les endpoints réels
