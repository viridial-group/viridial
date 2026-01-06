# US-024: Lead Scoring & CRM Sync

## Status: Draft

### Story
En tant que gestionnaire, je veux que les leads entrants soient scorés automatiquement et synchronisés vers le CRM pour prioriser les suivis.

### Acceptance Criteria
- Lead scoring rules engine (configurable): recency, engagement, property value, contact completeness.
- Webhooks / connectors to popular CRMs (Zapier, HubSpot) and export CSV.
- UI for marketing to view top leads, change score, and export.
- Audit trail for lead updates.

**Priority:** High (P0)
**Estimation:** 5

### Tasks
- [ ] Implement scoring engine + rule UI
- [ ] Webhook/connector framework + sample HubSpot connector
- [ ] UI: leads inbox with filters and actions
- [ ] Tests: scoring rules, webhook resilience
