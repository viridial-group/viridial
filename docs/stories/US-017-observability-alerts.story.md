# US-017: Observability & Alerts

## Status: Draft

### Story
En tant que SRE, je veux collecter métriques, logs et traces et définir des dashboards et alertes basiques afin de détecter et réagir rapidement aux incidents (ex: augmentation d'erreurs 5xx, latence élevée).

### Acceptance Criteria
- Applications exposent métriques Prometheus (`/metrics`) et logs structurés envoyés à une solution centralisée (Loki/ELK PoC).
- Dashboard Grafana minimal pour taux d'erreur, latence p95, et utilisation CPU/mémoire.
- Alert rule: si error_rate > threshold → send alert (email/Slack stub).
- Tracing de requêtes critiques avec Jaeger (PoC) pour visualiser latence distribuée.

**Priority:** P1
**Estimation:** 5

### Tasks
- [ ] Exposer métriques via Micrometer/Prometheus
- [ ] Centraliser logs (Loki) ou fichier local PoC
- [ ] Provision Grafana dashboards (templates)
- [ ] Add alert rules and test firing conditions
- [ ] Document runbook incident simple
