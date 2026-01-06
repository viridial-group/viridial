# US-004: Gestion utilisateurs & rôles (Admin)

## Status: Draft

### Story
En tant que super‑admin, je veux pouvoir créer/éditer/supprimer des utilisateurs, rôles et permissions afin de contrôler l'accès fonctionnel par organisation et par agence.

### Acceptance Criteria
- UI pour CRUD users, assign roles, définir scope (org/agency/global).
- Interface pour créer/éditer roles et lier permissions.
- Audit log listant actions admin (who, what, when).
- Tests pour enforcement RBAC.

Additional Acceptance Criteria:
- Ability to define moderation roles and workflows (flag, review, takedown) scoped by organization.
- GDPR tools: data export (user data) and data erase workflows per organization with audit trail.
- Ability to configure retention policies per organization (data purge automation).

**Priority:** P0
**Estimation:** 5

### Tasks
- [ ] Backend endpoints users/roles/permissions
- [ ] Admin UI pages
- [ ] Audit logging
- [ ] Tests role enforcement
- [ ] Moderation roles and workflows UI
- [ ] GDPR tools: data export and erase workflows
- [ ] Retention policies configuration

### Technical Notes
- **Database Schema:** 
  - Table `users` avec colonnes: `id`, `email`, `organization_id`, `agency_id` (nullable), `status`
  - Table `roles` avec `id`, `name`, `organization_id` (nullable pour global), `permissions` (JSON)
  - Table `user_roles` (many-to-many)
  - Table `audit_logs` avec `user_id`, `action`, `resource_type`, `resource_id`, `timestamp`, `ip_address`
- **Permissions Model:** Permissions stockées comme JSON array ou table séparée selon granularité
- **Scope Isolation:** Tous les endpoints doivent vérifier `organization_id` pour isolation multi-tenant
- **Audit Trail:** Logger toutes les actions admin (create/update/delete users, roles, permissions)
- **GDPR Compliance:** 
  - Export: générer JSON/CSV avec toutes les données utilisateur
  - Erase: anonymiser ou supprimer données selon politique de rétention
  - Audit trail doit être conservé même après suppression (anonymisé)
- **Dependencies:** Nécessite US-001 (Organization), US-014 (Authn), US-015 (RBAC)

### Definition of Done
- [ ] CRUD complet pour users, roles, permissions via API
- [ ] UI admin complète avec validation et feedback
- [ ] Audit logging fonctionnel pour toutes les actions admin
- [ ] Tests unitaires couvrent tous les scénarios CRUD
- [ ] Tests d'intégration vérifient enforcement RBAC
- [ ] GDPR tools fonctionnels (export/erase) avec audit trail
- [ ] Documentation API et permissions mise à jour
- [ ] Code review approuvé
- [ ] Déployé en staging et testé manuellement
