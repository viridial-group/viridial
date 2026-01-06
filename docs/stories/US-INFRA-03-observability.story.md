# US-INFRA-03: Stack Observabilité (Metrics, Logs, Tracing)

## Status: Draft

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
- [ ] Prometheus déployé dans namespace `viridial-monitoring`
- [ ] ServiceMonitor CRDs installés (Prometheus Operator optionnel)
- [ ] Configuration scrape pour tous les services
- [ ] Exporters installés: Spring Actuator, Postgres, Redis, Node Exporter
- [ ] Retention configurée (30 jours)
- [ ] Storage: PersistentVolume pour métriques historiques

#### Phase 2: Grafana (Visualization)
- [ ] Grafana déployé dans namespace `viridial-monitoring`
- [ ] Datasource Prometheus configurée
- [ ] Datasource Loki configurée
- [ ] Dashboards pré-configurés:
  - Infrastructure (CPU, memory, disk, network)
  - Services (latency, throughput, errors)
  - Business metrics (tenant count, API calls, etc.)
- [ ] Authentication configurée (LDAP ou OAuth optionnel)

#### Phase 3: Loki (Logging)
- [ ] Loki déployé dans namespace `viridial-monitoring`
- [ ] Fluent Bit ou Fluentd déployé comme DaemonSet pour collection
- [ ] Configuration labels: tenant, service, level
- [ ] Storage: PersistentVolume pour logs
- [ ] Retention configurée (30 jours)
- [ ] LogQL queries testées

#### Phase 4: Jaeger (Tracing)
- [ ] Jaeger déployé dans namespace `viridial-monitoring`
- [ ] OpenTelemetry instrumentation configurée dans services
- [ ] Sampling configuré (10% production, 100% staging)
- [ ] Storage: In-memory ou Elasticsearch (optionnel)
- [ ] UI accessible pour visualisation des traces

#### Phase 5: Alerting
- [ ] Alertmanager déployé
- [ ] Règles d'alerte configurées:
  - Service down
  - High latency (p95 > 200ms)
  - High error rate (> 5%)
  - Disk space low
  - Memory high
- [ ] Intégrations: Slack, email, PagerDuty (optionnel)
- [ ] Tests d'alertes effectués

#### Phase 6: Custom Metrics
- [ ] Business metrics exposées (tenant count, API calls, etc.)
- [ ] Custom dashboards Grafana pour métriques business
- [ ] Alertes business configurées (ex: tenant limit atteint)

### Technical Notes

**Prometheus:**
- **Scrape Interval:** 15 secondes
- **Retention:** 30 jours
- **Storage:** PersistentVolume 50GB minimum
- **Exporters:** Spring Actuator (micrometer), postgres_exporter, redis_exporter, node_exporter

**Grafana:**
- **Dashboards:** 
  - Infrastructure: CPU, memory, disk, network par node
  - Services: request rate, latency (p50, p95, p99), error rate
  - Business: tenant count, API calls, search queries
- **Authentication:** Admin user + service accounts

**Loki:**
- **Collection:** Fluent Bit (léger) ou Fluentd (plus features)
- **Labels:** tenant, service, level, namespace
- **Retention:** 30 jours
- **Storage:** PersistentVolume 100GB minimum

**Jaeger:**
- **Sampling:** 10% production, 100% staging
- **Storage:** In-memory (MVP) ou Elasticsearch (production)
- **Instrumentation:** OpenTelemetry dans services Spring Boot

**Dependencies:**
- Nécessite US-INFRA-01 (Kubernetes cluster) complété
- Nécessite US-INFRA-02 (Services de base) pour exporter métriques
- Services doivent exposer endpoints `/actuator/prometheus` (Spring Boot)

### Definition of Done
- [ ] Prometheus scrape tous les services et collecte métriques
- [ ] Grafana dashboards créés et fonctionnels (infrastructure, services, business)
- [ ] Loki collecte logs de tous les services
- [ ] Jaeger trace les requêtes entre services
- [ ] Alertmanager configuré avec alertes critiques (Slack/email)
- [ ] Custom metrics business exposées et visualisées
- [ ] Tests: vérifier métriques, logs, traces pour un flow complet
- [ ] Documentation: guide d'utilisation des dashboards et alertes

