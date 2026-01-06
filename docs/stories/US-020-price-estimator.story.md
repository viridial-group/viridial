# US-020: Price Estimator (Automated Valuation)

## Status: Draft

### Story
En tant qu'utilisateur je veux voir une estimation de prix automatique pour un bien (avec intervalle de confiance et comparables) afin d'évaluer la valeur du bien rapidement.

### Acceptance Criteria
- Endpoint `GET /properties/{id}/estimate` retourne: `estimate.value`, `estimate.low`, `estimate.high`, `confidence`, and list of `comparables` with distance and attributes.
- Estimation inclut comparables récents (last 12 months) et ajustements simples (surface, pièces, localisation, état).
- UI montre historique de prix et note de confiance; export PDF du rapport d'estimation.
- Performance: endpoint < 2s on cached results; batch recompute off‑peak.

**Priority:** P0
**Estimation:** 8

### Tasks
- [ ] Design estimator API contract and response schema
- [ ] Implement comps selection rules (radius, timeframe, filters)
- [ ] Implement rule‑based estimator (median comps + adjustments)
- [ ] Cache and async recompute job (daily/cron)
- [ ] UI: estimate panel, comparables list, export report
- [ ] Integration tests and spot manual validation at sample addresses
- [ ] Telemetry: estimator usage and distribution of confidence
