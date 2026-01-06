# US-018: Backups & DR pour Postgres

## Status: Draft

### Story
En tant qu'administrateur, je veux que la base de données Postgres soit sauvegardée régulièrement et qu'un runbook de restauration soit disponible pour garantir la résilience des données.

### Acceptance Criteria
- Politique de backup (daily snapshot) documentée et automatisée.
- Test de restauration documenté et exécuté (manuel guidé ou script de restore PoC).
- Procédures de validation post‑restore (checksums/row counts) incluses.

**Priority:** P1
**Estimation:** 3

### Tasks
- [ ] Configurer backup job (cron container or cloud snapshot PoC)
- [ ] Créer script de restauration et test de validité
- [ ] Documenter runbook restore et rollback
