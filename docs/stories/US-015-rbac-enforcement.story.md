# US-015: RBAC enforcement on APIs

## Status: Draft

### Story
En tant que développeur, je veux que chaque endpoint API vérifie les permissions et le scope (organization/agency/global) pour protéger les actions sensibles (publication, admin).

### Acceptance Criteria
- Middleware auth vérifie role + scope avant exécution des controllers.
- Tests couvrent accès autorisé vs refusé pour endpoints critiques.
- Logs et messages d'erreur clairs pour accès refusé.
- Support des permissions granulaires: read, write, delete, admin par ressource.
- Vérification du scope organization_id pour isolation multi-tenant.
- Cache des permissions pour performance (TTL configurable).
- Documentation des permissions requises pour chaque endpoint.

**Priority:** P0
**Estimation:** 5

### Tasks
- [ ] RBAC middleware implémenté avec vérification role + scope
- [ ] Système de permissions granulaires (read/write/delete/admin)
- [ ] Annotation/metadata endpoints pour permissions requises
- [ ] Cache des permissions (Redis ou in-memory avec TTL)
- [ ] Tests unitaires & d'intégration pour tous les scénarios d'accès
- [ ] Documentation OpenAPI avec permissions requises
- [ ] Logging structuré pour accès refusés (audit trail)
- [ ] Rate limiting par rôle pour endpoints sensibles

### Definition of Done
- [ ] Tous les endpoints protégés par RBAC middleware
- [ ] Tests couvrent: accès autorisé, refusé, scope invalide, token expiré
- [ ] Documentation des permissions par endpoint
- [ ] Performance: vérification permissions < 10ms (avec cache)
- [ ] Audit trail fonctionnel pour accès refusés
