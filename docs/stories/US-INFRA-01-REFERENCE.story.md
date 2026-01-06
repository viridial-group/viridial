# US-INFRA-01: Mise en place de l'architecture technique

## Status: Draft

### Story
En tant qu'équipe d'ingénierie, je souhaite provisionner et documenter l'architecture technique (infra, CI/CD, observabilité, DB, search) afin de déployer les services en staging et supporter le MVP multi-tenant.

### Acceptance Criteria
- Given accès aux VPS/serveurs (Hetzner, DigitalOcean, OVH, ou on-prem), When j'exécute les scripts IaC, Then le cluster et la DB staging sont provisionnés.
- Given CI pipeline configuré, When push sur la branche `main`, Then build/tests passent et l'image est déployée en staging.
- Observability (metrics/logs/tracing) accessible et avec dashboard minimal.
- Multi-tenant isolation garantie au niveau infrastructure (network, database, storage).
- Service discovery et load balancing fonctionnels entre microservices.
- Secrets management sécurisé avec rotation automatique.
- Backup automatique configuré avec stratégie de retention.
- Disaster recovery plan documenté et testable.

### Tasks

#### Phase 1: Infrastructure as Code (IaC)
- [ ] Créer repo `infrastructure/` avec structure modulaire (Terraform ou Ansible)
- [ ] Module VPS/Servers: provisioning de VMs (Hetzner, DigitalOcean, OVH) ou bare metal
- [ ] Module Kubernetes: cluster Kubernetes standard via Kubeadm - 100% gratuit
- [ ] Module Database: PostgreSQL self-managed avec réplication (pas de RDS payant)
- [ ] Module Storage: MinIO (S3-compatible) pour assets et backups
- [ ] Module Networking: Load Balancer (Nginx Ingress), DNS (Cloudflare gratuit)
- [ ] Module Security: Firewall rules (UFW/iptables), Vault pour secrets
- [ ] Variables et outputs pour staging/production
- [ ] Documentation avec exemples (Ansible playbooks ou Terraform)

#### Phase 2: Container Orchestration (Kubernetes)
- [ ] Cluster Kubernetes standard provisionné via Kubeadm sur VPS
- [ ] Architecture: 1 control plane node + 2+ worker nodes (minimum 4GB RAM, 2 CPU par node)
- [ ] CNI Plugin: Calico ou Flannel pour networking (Calico recommandé pour Network Policies)
- [ ] Namespaces: `viridial-staging`, `viridial-production`, `viridial-monitoring`
- [ ] Resource quotas et limits par namespace
- [ ] Network Policies pour isolation multi-tenant
- [ ] Ingress Controller: Nginx Ingress Controller ou Traefik avec TLS
- [ ] Service Mesh: Linkerd (optionnel pour MVP, recommandé pour production)
- [ ] Cert-manager pour certificats TLS automatiques (Let's Encrypt gratuit)
- [ ] CoreDNS configuré pour service discovery interne
- [ ] Metrics Server installé pour HPA (Horizontal Pod Autoscaler)

#### Phase 3: Microservices Architecture
- [ ] API Gateway: Kong ou Traefik avec rate limiting, auth, routing
- [ ] Service Discovery: Consul ou Kubernetes native (DNS)
- [ ] Message Queue: RabbitMQ ou Apache Kafka pour async communication
- [ ] Service Registry: Consul ou Kubernetes Service objects
- [ ] Circuit Breaker: Resilience4j (Java) ou Hystrix pattern
- [ ] Configuration Management: Spring Cloud Config ou Consul KV
- [ ] Service-to-service auth: mTLS via service mesh ou JWT

#### Phase 4: Database & Storage
- [ ] PostgreSQL 14+ avec réplication master-slave
- [ ] Connection pooling: PgBouncer ou HikariCP
- [ ] Database migrations: Flyway avec versioning
- [ ] Multi-tenant schema: row-level security (RLS) ou schema-per-tenant
- [ ] Backup automatique: pg_dump + WAL archiving (Point-in-Time Recovery)
- [ ] Meilisearch cluster avec persistence et backup
- [ ] Object Storage: MinIO (S3-compatible) pour assets (images, documents)
- [ ] Redis cluster pour cache distribué et sessions

#### Phase 5: CI/CD Pipeline
- [ ] GitHub Actions workflows:
  - [ ] Build: compile, test, lint, security scan (Trivy, OWASP)
  - [ ] Package: build Docker images, push to registry (GHCR/Docker Hub)
  - [ ] Deploy: Helm charts ou Kustomize pour Kubernetes
  - [ ] Rollback: automation pour rollback en cas d'échec
- [ ] Multi-stage builds optimisés (cache layers)
- [ ] Image scanning et vulnerability checks
- [ ] Blue-green ou canary deployment strategy
- [ ] Environment promotion: dev → staging → production

#### Phase 6: Observability Stack
- [ ] Metrics: Prometheus avec exporters (Spring Actuator, Postgres, Redis)
- [ ] Visualization: Grafana avec dashboards pré-configurés
- [ ] Logging: Loki pour aggregation, Fluent Bit/Fluentd pour collection
- [ ] Tracing: Jaeger ou Tempo pour distributed tracing
- [ ] Alerting: Alertmanager avec règles (PagerDuty, Slack, email)
- [ ] APM: OpenTelemetry instrumentation dans services
- [ ] Custom dashboards: business metrics, tenant usage, performance

#### Phase 7: Security & Compliance
- [ ] Secrets Management: HashiCorp Vault ou Kubernetes Secrets (encrypted)
- [ ] Network Policies: isolation entre services et tenants
- [ ] Pod Security Policies: restrictions sur containers
- [ ] RBAC: Kubernetes RBAC pour accès cluster
- [ ] Image Security: scanning avec Trivy, Falco pour runtime security
- [ ] WAF: ModSecurity ou Cloudflare WAF rules
- [ ] DDoS Protection: rate limiting au niveau ingress
- [ ] Audit Logging: Falco ou auditd pour compliance

#### Phase 8: Multi-tenant Infrastructure
- [ ] Tenant isolation: network policies, database RLS, storage buckets
- [ ] Resource quotas par tenant (CPU, memory, storage)
- [ ] Tenant-aware routing: header-based ou subdomain routing
- [ ] Tenant metadata service: tracking tenant resources
- [ ] Billing integration hooks: usage metrics export
- [ ] Tenant onboarding automation: infrastructure provisioning

#### Phase 9: Backup & Disaster Recovery
- [ ] Database backups: quotidien avec retention 30 jours
- [ ] Point-in-Time Recovery: WAL archiving configuré
- [ ] Storage backups: MinIO bucket replication
- [ ] Configuration backups: Terraform state, Kubernetes manifests
- [ ] DR Plan documenté: RTO < 4h, RPO < 1h
- [ ] DR Testing: procédure de test trimestriel
- [ ] Cross-region replication (optionnel pour MVP)

#### Phase 10: Documentation & Runbooks
- [ ] Architecture diagram: C4 model (Context, Container, Component)
- [ ] Infrastructure documentation: setup, scaling, troubleshooting
- [ ] Runbooks: deploy, rollback, backup/restore, incident response
- [ ] API documentation: OpenAPI specs, Postman collections
- [ ] Developer onboarding guide: local setup, debugging
- [ ] Operations playbook: monitoring, alerting, escalation

### Technical Notes

#### Architecture Patterns

**Microservices Communication:**
- **Synchronous:** REST APIs avec OpenAPI specs, gRPC pour inter-service (optionnel)
- **Asynchronous:** RabbitMQ ou Apache Kafka pour events (property updates, lead notifications)
- **Service Mesh:** Linkerd (lightweight) ou Istio (feature-rich) pour mTLS, observability, traffic management

**Multi-tenant Strategies:**
- **Database:** Row-Level Security (RLS) avec `organization_id` comme tenant key
- **Storage:** Buckets/prefixes par tenant dans MinIO
- **Network:** Kubernetes Network Policies pour isolation
- **Application:** Tenant context propagation via headers (X-Tenant-ID)

**Service Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway (Kong/Traefik)            │
│              Rate Limiting, Auth, Routing                 │
└──────────────┬──────────────────────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│Identity│ │Property│ │Search │
│Service │ │Service │ │Service│
└───┬───┘ └───┬───┘ └───┬───┘
    │          │          │
    └──────────┼──────────┘
               │
    ┌──────────▼──────────┐
    │   Message Queue     │
    │  (RabbitMQ/Kafka)   │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │   PostgreSQL (RLS)  │
    │   Meilisearch       │
    │   Redis (Cache)     │
    │   MinIO (Storage)   │
    └─────────────────────┘
```

**Technology Stack (Open Source Only):**

| Component | Technology | Version | Purpose | Cost |
|-----------|-----------|---------|---------|------|
| **Orchestration** | Kubernetes (Kubeadm) | 1.28+ | Container orchestration | Gratuit |
| **CNI Plugin** | Calico | 3.27+ | Network policies, pod networking | Gratuit |
| **Service Mesh** | Linkerd | 2.13+ | mTLS, observability (optional) | Gratuit |
| **API Gateway** | Kong | 3.4+ | API management, rate limiting | Gratuit (OSS) |
| **Ingress** | Traefik | 2.10+ | Load balancing, TLS termination | Gratuit |
| **Message Queue** | RabbitMQ | 3.12+ | Async messaging | Gratuit |
| **Database** | PostgreSQL | 14+ | Primary data store (self-hosted) | Gratuit |
| **Search** | Meilisearch | 1.5+ | Full-text search | Gratuit |
| **Cache** | Redis | 7.2+ | Distributed cache | Gratuit |
| **Storage** | MinIO | Latest | S3-compatible object storage | Gratuit |
| **Monitoring** | Prometheus | 2.45+ | Metrics collection | Gratuit |
| **Visualization** | Grafana | 10.0+ | Dashboards | Gratuit |
| **Logging** | Loki | 2.9+ | Log aggregation | Gratuit |
| **Tracing** | Jaeger | 1.50+ | Distributed tracing | Gratuit |
| **Secrets** | Vault | 1.15+ | Secrets management | Gratuit (OSS) |
| **CI/CD** | GitHub Actions | - | Build and deploy | Gratuit (public repos) |
| **IaC** | Ansible ou Terraform | Latest | Infrastructure provisioning | Gratuit |
| **Config** | Helm | 3.13+ | Kubernetes package manager | Gratuit |
| **DNS** | Cloudflare | - | DNS management | Gratuit (tier gratuit) |

**Infrastructure Components:**

1. **Kubernetes Cluster (Standard via Kubeadm):**
   - **Architecture:** 1 control plane node + 2+ worker nodes
   - **Requirements par node:**
     - Control Plane: 4GB RAM, 2 CPU, 50GB disk
     - Worker: 4GB RAM, 2 CPU, 50GB disk (minimum)
   - **Installation:** Via Kubeadm (CNCF standard)
   - **CNI Plugin:** Calico (recommandé) ou Flannel pour networking
   - **Coût:** Seulement VPS (Hetzner CPX21: 5€/mois, DigitalOcean Regular: 12$/mois)
   - **Staging:** 3 nodes (1 control + 2 workers) = 15€/mois
   - **Production:** 5+ nodes (1 control + 4 workers) = 25€/mois
   
   **Features Kubernetes:**
   - Auto-scaling: HPA (Horizontal Pod Autoscaler) basé sur CPU/memory
   - Resource quotas par namespace (tenant isolation)
   - Network Policies pour segmentation réseau
   - Service Discovery via CoreDNS
   - Load Balancing via Service objects
   - ConfigMaps et Secrets pour configuration
   - Persistent Volumes pour stockage
   - DaemonSets pour agents (monitoring, logging)

   **Migration Progressive:**
   - **Phase 1 (Développement):** Docker Compose local (déjà en place)
   - **Phase 2 (Staging):** Kubernetes 3 nodes (1 control + 2 workers)
   - **Phase 3 (Production):** Kubernetes 5+ nodes avec HA (multiple control planes optionnel)
   - Permet migration progressive sans tout réécrire

2. **API Gateway (Kong):**
   - Rate limiting: 100 req/min par tenant
   - Authentication: JWT validation, API keys
   - Request/response transformation
   - Analytics: request logging, metrics

3. **Service Discovery:**
   - Kubernetes native DNS via CoreDNS (`service-name.namespace.svc.cluster.local`)
   - Service objects pour load balancing interne
   - Endpoints automatiques pour service discovery
   - Consul (optionnel) pour service registry avancé

4. **Message Queue (RabbitMQ):**
   - Exchanges: `property.events`, `lead.events`, `notification.events`
   - Queues par service avec DLQ (Dead Letter Queue)
   - Persistence activée pour reliability

5. **Database (PostgreSQL):**
   - Primary: master avec réplication synchrone
   - Replica: read-only pour scaling reads
   - Connection pooling: PgBouncer (transaction mode)
   - Row-Level Security (RLS) pour multi-tenant isolation

6. **Storage (MinIO):**
   - Buckets: `property-images`, `documents`, `backups`
   - Lifecycle policies: transition vers cold storage après 90 jours
   - Versioning activé pour recovery

7. **Observability:**
   - **Prometheus:** scrape toutes les 15s, retention 30 jours
   - **Grafana:** dashboards pour services, infrastructure, business metrics
   - **Loki:** log aggregation avec labels (tenant, service, level)
   - **Jaeger:** tracing avec sampling 10% (production), 100% (staging)

**Security Considerations:**

- **Network Isolation:** Kubernetes Network Policies entre namespaces
- **Secrets:** Vault avec rotation automatique (tokens, DB passwords)
- **mTLS:** Service mesh pour inter-service communication
- **RBAC:** Kubernetes RBAC + application-level RBAC (US-015)
- **Image Security:** Trivy scanning dans CI/CD pipeline
- **Compliance:** Audit logs pour toutes les actions admin

**Scalability Patterns:**

- **Horizontal Pod Scaling:** HPA (Horizontal Pod Autoscaler) basé sur CPU (70%) et memory (80%)
  - Les pods se répliquent automatiquement selon la charge
  - Limité par les ressources disponibles sur les nodes
- **Database Scaling:** Read replicas PostgreSQL pour scaling reads
- **Cache Strategy:** Redis avec TTL et cache-aside pattern
- **CDN:** Cloudflare (free tier) pour assets statiques
- **Node Scaling (VPS):** 
  - **Manuel:** Ajout/suppression de nodes VPS selon besoin
  - **Semi-automatique:** Scripts Ansible pour provisionner nouveaux nodes
  - **Note:** Auto-scaling de nodes nécessite APIs cloud (non disponible sur VPS standard)
  - **Alternative:** Prévoir nodes supplémentaires et activer selon charge

**Dependencies & Coûts:**

- **VPS/Serveurs (seul coût réel):**
  - **Staging (Kubernetes):** 3 VPS Hetzner CPX21 (4GB RAM, 2 CPU) = 15€/mois
  - **Production (Kubernetes):** 5 VPS Hetzner CPX21 (4GB RAM, 2 CPU) = 25€/mois
  - **HA Production (optionnel):** 3 control planes + 4 workers = 35€/mois
  - **Alternatives:** DigitalOcean (plus cher), OVH (bon marché), Scaleway (flexible)
  - **On-prem:** Gratuit si serveurs disponibles (minimum 4GB RAM par node)

- **Services (100% gratuit - open source):**
  - Kubernetes (Kubeadm): Gratuit
  - Tous les services (Postgres, Redis, MinIO, etc.): Gratuit
  - Observabilité (Prometheus, Grafana, Loki, Jaeger): Gratuit
  - CI/CD (GitHub Actions): Gratuit pour repos publics

- **Services externes gratuits:**
  - **DNS:** Cloudflare (tier gratuit, illimité)
  - **CDN:** Cloudflare (tier gratuit, protection DDoS incluse)
  - **Container Registry:** GitHub Container Registry (gratuit pour repos publics)
  - **Domain:** Achat unique (~10-15€/an pour .com)

- **Total coût mensuel MVP:** ~9-15€ (seulement VPS)
- **Total coût mensuel production:** ~25-50€ (seulement VPS)

- GitHub repository avec secrets configurés
- Domain name pour staging (ex: staging.viridial.com)

### Definition of Done

#### Infrastructure
- [ ] Ansible playbooks ou Terraform modules créés et testés
- [ ] **Kubernetes cluster** provisionné via Kubeadm et accessible via `kubectl`
- [ ] CNI Plugin (Calico) installé et configuré
- [ ] CoreDNS fonctionnel pour service discovery
- [ ] Metrics Server installé pour HPA
- [ ] All namespaces créés avec resource quotas
- [ ] Network policies appliquées et testées
- [ ] Ingress controller (Nginx Ingress) fonctionnel avec TLS (cert-manager + Let's Encrypt gratuit)
- [ ] VPS provisionnés et configurés (firewall, SSH keys, monitoring de base)
- [ ] Kubernetes RBAC configuré pour accès sécurisé

#### Services
- [ ] Identity Service déployé et accessible via API Gateway
- [ ] Property Service déployé (si applicable)
- [ ] Search Service (Meilisearch) déployé et indexé
- [ ] Health checks passent pour tous les services (`/health`, `/ready`)
- [ ] Service discovery fonctionnel (services peuvent communiquer)

#### Database & Storage
- [ ] PostgreSQL déployé avec réplication configurée
- [ ] Flyway migrations exécutées (schema créé)
- [ ] Row-Level Security (RLS) activé et testé
- [ ] PgBouncer configuré pour connection pooling
- [ ] MinIO déployé avec buckets créés
- [ ] Redis déployé et accessible

#### CI/CD
- [ ] GitHub Actions pipeline complet (build → test → deploy)
- [ ] Images Docker buildées et pushées vers registry
- [ ] Deployment automatique en staging sur push `main`
- [ ] Rollback automatique en cas d'échec de health check
- [ ] Security scanning (Trivy) intégré dans pipeline

#### Observability
- [ ] Prometheus scrape tous les services
- [ ] Grafana dashboards créés (infrastructure, services, business)
- [ ] Loki collecte logs de tous les services
- [ ] Jaeger trace les requêtes entre services
- [ ] Alertmanager configuré avec alertes critiques (Slack/email)
- [ ] Custom metrics business (tenant count, API calls, etc.)

#### Security
- [ ] Vault déployé et accessible
- [ ] Secrets stockés dans Vault (pas en plain text)
- [ ] Network Policies appliquées (isolation testée)
- [ ] TLS activé sur tous les endpoints publics
- [ ] Image scanning passe (pas de vulnérabilités critiques)

#### Multi-tenant
- [ ] Tenant isolation testée (network, database, storage)
- [ ] Resource quotas par tenant fonctionnelles
- [ ] Tenant routing testé (header-based ou subdomain)

#### Backup & DR
- [ ] Backup automatique PostgreSQL configuré (quotidien)
- [ ] Backup MinIO configuré (quotidien)
- [ ] Point-in-Time Recovery testé (restore à un point donné)
- [ ] DR plan documenté avec procédures
- [ ] DR test effectué (simulation de failover)

#### Documentation
- [ ] Architecture diagram (C4 model) créé et documenté
- [ ] Runbooks créés: deploy, rollback, backup/restore, incident
- [ ] Developer guide: setup local, debugging, troubleshooting
- [ ] API documentation: OpenAPI specs publiées
- [ ] Infrastructure README avec setup instructions

#### Testing & Validation
- [ ] Smoke tests passent (health endpoints, basic API calls)
- [ ] Load testing effectué (100 concurrent users)
- [ ] Multi-tenant isolation validée (tenant A ne peut pas accéder données tenant B)
- [ ] Disaster recovery testé (simulation de panne)
- [ ] Performance benchmarks documentés (p95 latency < 200ms)

#### Production Readiness
- [ ] Monitoring et alerting opérationnels
- [ ] Logs centralisés et queryables
- [ ] Tracing fonctionnel pour debugging
- [ ] Backup et restore validés
- [ ] Documentation complète et à jour
- [ ] Team formée sur l'infrastructure
