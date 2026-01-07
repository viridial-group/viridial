# US-INFRA-03: Stack Observabilité (Metrics, Logs, Tracing)

## Status: In Progress

### Story
En tant qu'équipe d'ingénierie, je souhaite déployer une stack d'observabilité complète (Prometheus, Grafana, Loki, Jaeger) afin de monitorer les services, analyser les logs et tracer les requêtes distribuées.

### Acceptance Criteria
- Given services déployés, When Prometheus scrape, Then toutes les métriques sont collectées.
- Given logs générés, When Loki collecte, Then les logs sont centralisés et queryables.
- Given requêtes distribuées, When Jaeger trace, Then les traces sont disponibles pour debugging.
- Given métriques collectées, When Grafana visualise, Then les dashboards affichent les métriques clés.
- Alerting configuré pour incidents critiques (Slack, email).

**Priority:** P1
**Estimation:** 5

### Tasks

#### Phase 1: Prometheus (Metrics)
- [x] Docker Compose configuration créée (`infrastructure/docker-compose/observability/docker-compose.observability.yml`)
- [x] Prometheus configuré avec docker-compose
- [x] Configuration scrape créée (`config/prometheus/prometheus.yml`)
- [x] Règles d'alerte configurées (`config/prometheus/alerts.yml`)
- [x] Exporters configurés: Node Exporter, Postgres Exporter, Redis Exporter
- [x] Retention configurée (30 jours)
- [x] Storage: Volume Docker pour métriques historiques (prometheus_data)
- [ ] Prometheus déployé et accessible sur le VPS
- [ ] Tests de connectivité Prometheus réussis

#### Phase 2: Grafana (Visualization)
- [x] Grafana configuré avec docker-compose
- [x] Datasource Prometheus configurée automatiquement (`config/grafana/provisioning/datasources/`)
- [x] Datasource Loki configurée automatiquement
- [x] Provisioning de dashboards configuré (`config/grafana/provisioning/dashboards/`)
- [ ] Dashboards créés manuellement:
  - Infrastructure (CPU, memory, disk, network)
  - Services (latency, throughput, errors)
  - Business metrics (tenant count, API calls, etc.)
- [x] Authentication configurée (admin user via .env)
- [ ] Grafana déployé et accessible sur le VPS
- [ ] Tests de connectivité Grafana réussis

#### Phase 3: Loki (Logging)
- [x] Loki configuré avec docker-compose
- [x] Promtail configuré pour collection de logs Docker
- [x] Configuration Promtail créée (`config/promtail/promtail-config.yml`)
- [x] Configuration labels: tenant, service, level, container
- [x] Storage: Volume Docker pour logs (loki_data)
- [x] Retention configurée (30 jours)
- [ ] Loki déployé et accessible sur le VPS
- [ ] LogQL queries testées

#### Phase 4: Jaeger (Tracing)
- [x] Jaeger configuré avec docker-compose (all-in-one)
- [x] Storage: Badger (persistent) configuré
- [x] Ports exposés: UI (16686), HTTP collector (14268), gRPC collector (14250), UDP agents (6831, 6832)
- [ ] OpenTelemetry instrumentation configurée dans services (quand services déployés)
- [ ] Sampling configuré (10% production, 100% staging)
- [ ] Jaeger déployé et accessible sur le VPS
- [ ] UI accessible pour visualisation des traces

#### Phase 5: Alerting
- [x] Alertmanager configuré avec docker-compose
- [x] Configuration Alertmanager créée (`config/alertmanager/alertmanager.yml`)
- [x] Règles d'alerte configurées dans Prometheus:
  - Service down (critical)
  - High latency (p95 > 200ms) (warning)
  - High error rate (> 5%) (critical)
  - Disk space low (critical)
  - Memory high (warning)
  - CPU high (warning)
  - PostgreSQL connection issues (critical)
  - Redis down (critical)
- [ ] Intégrations: Slack, email configurées (optionnel - à décommenter dans alertmanager.yml)
- [ ] Alertmanager déployé et accessible sur le VPS
- [ ] Tests d'alertes effectués

#### Phase 6: Déploiement et Validation
- [x] Script d'installation créé (`install-observability.sh`)
- [x] Script de test créé (`test-observability.sh`)
- [x] Documentation complète créée (`README.md`)
- [ ] Services déployés sur le VPS avec `./install-observability.sh`
- [ ] Tous les services sont `Up` et `healthy`
- [ ] Tests de connectivité réussis (`./test-observability.sh`)

#### Phase 7: Custom Metrics (Future)
- [ ] Business metrics exposées (tenant count, API calls, etc.) - quand services déployés
- [ ] Custom dashboards Grafana pour métriques business
- [ ] Alertes business configurées (ex: tenant limit atteint)

### Technical Notes

**Architecture:**
- **Approche:** Docker Compose (sans Kubernetes)
- **Localisation:** `infrastructure/docker-compose/observability/`
- **Réseau:** Utilise le réseau Docker `viridial-network` (créé par services de base)

**Prometheus:**
- **Scrape Interval:** 15 secondes
- **Retention:** 30 jours
- **Storage:** Volume Docker `prometheus_data`
- **Exporters:** 
  - Node Exporter (métriques système) - port 9100
  - Postgres Exporter (métriques PostgreSQL) - port 9187
  - Redis Exporter (métriques Redis) - port 9121
  - Spring Actuator (quand services déployés) - `/actuator/prometheus`
- **Configuration:** `config/prometheus/prometheus.yml`
- **Alertes:** `config/prometheus/alerts.yml`

**Grafana:**
- **Port:** 3000
- **Authentication:** Admin user (configuré via .env)
- **Datasources:** 
  - Prometheus (auto-provisioned)
  - Loki (auto-provisioned)
- **Dashboards:** À créer manuellement ou importer dans `/var/lib/grafana/dashboards`
- **Provisioning:** `config/grafana/provisioning/`

**Loki:**
- **Port:** 3100
- **Collection:** Promtail (collecte logs Docker automatiquement)
- **Labels:** tenant, service, level, container, project
- **Retention:** 30 jours (720h)
- **Storage:** Volume Docker `loki_data`
- **Configuration:** `config/loki/loki-config.yml`

**Promtail:**
- **Port:** 9080 (HTTP)
- **Collection:** Logs Docker via socket (`/var/run/docker.sock`)
- **Configuration:** `config/promtail/promtail-config.yml`
- **Labels automatiques:** service, container, project

**Jaeger:**
- **Mode:** All-in-one (collector + query + UI)
- **Ports:**
  - UI: 16686
  - HTTP Collector: 14268
  - gRPC Collector: 14250
  - UDP Agents: 6831, 6832
- **Storage:** Badger (persistent) - Volume Docker `jaeger_data`
- **Retention:** 7 jours (168h)
- **Instrumentation:** OpenTelemetry dans services Spring Boot (quand services déployés)

**Alertmanager:**
- **Port:** 9093
- **Configuration:** `config/alertmanager/alertmanager.yml`
- **Notifications:** Email et Slack (à configurer - décommenter dans config)
- **Storage:** Volume Docker `alertmanager_data`

**Dependencies:**
- Nécessite US-INFRA-02 (Services de base) complété
- Nécessite réseau Docker `viridial-network` (créé par services de base)
- Services Spring Boot doivent exposer endpoints `/actuator/prometheus` (quand déployés)

### Definition of Done
- [ ] Docker Compose configuration créée et testée
- [ ] Prometheus déployé et scrape tous les exporters (Node, Postgres, Redis)
- [ ] Grafana accessible avec datasources configurés (Prometheus, Loki)
- [ ] Dashboards Grafana créés (infrastructure minimum)
- [ ] Loki collecte logs de tous les conteneurs Docker
- [ ] Promtail fonctionne et envoie logs à Loki
- [ ] Jaeger accessible et prêt à recevoir traces
- [ ] Alertmanager configuré avec règles d'alerte
- [ ] Tests de connectivité réussis (`./test-observability.sh`)
- [ ] Documentation complète créée (`README.md`)
- [ ] Services déployés sur le VPS et opérationnels
- [ ] Persistence validée (redémarrer conteneurs et vérifier données conservées)
- [ ] (Future) Custom metrics business exposées et visualisées (quand services déployés)
- [ ] (Future) Tests: vérifier métriques, logs, traces pour un flow complet (quand services déployés)

