# US-INFRA-06: Backup & Disaster Recovery

## Status: Draft

### Story
En tant qu'équipe d'ingénierie, je souhaite configurer des backups automatiques et un plan de disaster recovery afin de garantir la récupération des données en cas d'incident.

### Acceptance Criteria
- Given backups configurés, When backup s'exécute, Then les backups sont créés automatiquement (quotidien).
- Given backup disponible, When je restaure, Then les données sont restaurées correctement.
- Given DR plan, When je teste, Then le plan de recovery fonctionne (RTO < 4h, RPO < 1h).
- Point-in-Time Recovery disponible pour PostgreSQL.

**Priority:** P1
**Estimation:** 3

### Tasks

#### Phase 1: Database Backups
- [ ] Script de backup PostgreSQL créé (pg_dump)
- [ ] CronJob Kubernetes pour backup quotidien
- [ ] Backup vers MinIO ou storage externe
- [ ] Retention configurée (30 jours)
- [ ] WAL archiving configuré pour Point-in-Time Recovery
- [ ] Test de restauration effectué

#### Phase 2: Storage Backups
- [ ] Backup MinIO configuré (bucket replication ou mc mirror)
- [ ] Backup quotidien des buckets critiques
- [ ] Retention configurée
- [ ] Test de restauration effectué

#### Phase 3: Configuration Backups
- [ ] Backup Terraform state (versionné dans Git ou storage sécurisé)
- [ ] Backup Kubernetes manifests (versionnés dans Git)
- [ ] Backup secrets Vault (unseal keys, root token)
- [ ] Documentation de la localisation des backups

#### Phase 4: Disaster Recovery Plan
- [ ] DR plan documenté avec procédures étape par étape
- [ ] RTO (Recovery Time Objective) défini: < 4h
- [ ] RPO (Recovery Point Objective) défini: < 1h
- [ ] Procédure de failover documentée
- [ ] Procédure de restauration complète documentée

#### Phase 5: DR Testing
- [ ] Test de restauration PostgreSQL effectué
- [ ] Test de restauration MinIO effectué
- [ ] Test de failover simulé (panne d'un node)
- [ ] Test de restauration complète (simulation disaster)
- [ ] Documentation des résultats de tests

### Technical Notes

**PostgreSQL Backups:**
- **Méthode:** pg_dump quotidien + WAL archiving continu
- **Storage:** MinIO bucket `backups/postgres/` ou storage externe
- **Retention:** 30 jours de backups quotidiens
- **Point-in-Time Recovery:** WAL archiving vers storage externe
- **Format:** Custom format compressé (.dump)

**MinIO Backups:**
- **Méthode:** `mc mirror` ou bucket replication
- **Storage:** Bucket de backup ou storage externe
- **Retention:** 30 jours
- **Buckets critiques:** `property-images`, `documents`

**Configuration Backups:**
- **Terraform State:** Versionné dans Git (repo séparé) ou stocké dans Vault
- **Kubernetes Manifests:** Versionnés dans Git
- **Secrets:** Unseal keys Vault stockées de manière sécurisée (1Password, etc.)

**Disaster Recovery:**
- **RTO (Recovery Time Objective):** < 4h (temps pour restaurer service)
- **RPO (Recovery Point Objective):** < 1h (perte de données maximale)
- **Scenarios:** 
  - Panne d'un node (automatic recovery)
  - Panne cluster (restauration depuis backups)
  - Corruption données (Point-in-Time Recovery)

**Dependencies:**
- Nécessite US-INFRA-01 (Kubernetes cluster) complété
- Nécessite US-INFRA-02 (Services de base) pour backups
- Nécessite US-INFRA-04 (Vault) pour backup secrets

### Definition of Done
- [ ] Backup automatique PostgreSQL configuré (quotidien)
- [ ] Backup MinIO configuré (quotidien)
- [ ] Point-in-Time Recovery testé (restore à un point donné)
- [ ] DR plan documenté avec procédures
- [ ] DR test effectué (simulation de failover)
- [ ] Documentation: guide de backup et restauration
- [ ] Runbook: procédures de restauration étape par étape

