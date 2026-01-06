# US-INFRA-04: Sécurité Infrastructure (Secrets, Network Policies, RBAC)

## Status: Draft

### Story
En tant qu'équipe d'ingénierie, je souhaite sécuriser l'infrastructure avec gestion des secrets, isolation réseau et contrôle d'accès afin de protéger les données multi-tenant et les services.

### Acceptance Criteria
- Given secrets à gérer, When Vault est déployé, Then tous les secrets sont stockés de manière sécurisée.
- Given services déployés, When Network Policies sont appliquées, Then l'isolation réseau est garantie.
- Given accès cluster, When RBAC est configuré, Then seuls les utilisateurs autorisés peuvent accéder.
- Image scanning intégré dans CI/CD (pas de vulnérabilités critiques).
- TLS activé sur tous les endpoints publics.

**Priority:** P0
**Estimation:** 3

### Tasks

#### Phase 1: Secrets Management
- [ ] HashiCorp Vault déployé dans namespace `viridial-monitoring` ou dédié
- [ ] Vault initialisé avec unseal keys sécurisées
- [ ] Secrets migrés depuis Kubernetes Secrets vers Vault
- [ ] Rotation automatique configurée pour secrets critiques
- [ ] Intégration avec services (Vault Agent ou API)
- [ ] Backup des unseal keys et root token (stockage sécurisé)

#### Phase 2: Network Policies
- [ ] Network Policies créées pour isolation entre namespaces
- [ ] Network Policies par service (seulement communication nécessaire)
- [ ] Isolation multi-tenant testée (tenant A ne peut pas accéder tenant B)
- [ ] Egress policies pour contrôle sortant (optionnel)
- [ ] Documentation des règles de networking

#### Phase 3: Kubernetes RBAC
- [ ] Service accounts créés pour services
- [ ] Roles et RoleBindings configurés par namespace
- [ ] ClusterRoles pour accès cross-namespace (si nécessaire)
- [ ] RBAC pour accès cluster (développeurs, ops)
- [ ] Audit logging activé pour actions RBAC

#### Phase 4: Image Security
- [ ] Trivy intégré dans CI/CD pipeline
- [ ] Scanning des images Docker avant push
- [ ] Blocage des images avec vulnérabilités critiques
- [ ] Falco déployé pour runtime security (détection d'anomalies)
- [ ] Alertes configurées pour incidents de sécurité

#### Phase 5: TLS & Encryption
- [ ] TLS activé sur tous les endpoints publics (via Ingress)
- [ ] Cert-manager configuré avec Let's Encrypt
- [ ] Certificats automatiquement renouvelés
- [ ] mTLS optionnel via service mesh (Linkerd) pour inter-service

### Technical Notes

**Vault:**
- **Storage Backend:** Consul ou file storage (pour MVP)
- **Seal:** Shamir (par défaut) ou auto-unseal avec cloud KMS (optionnel)
- **Secrets Engines:** KV v2 pour secrets, Database pour rotation
- **Access:** Vault Agent injector ou API directe

**Network Policies:**
- **Calico:** Utilise les Network Policies Kubernetes standard
- **Isolation:** Par défaut deny all, puis allow spécifique
- **Multi-tenant:** Isolation entre namespaces par tenant

**RBAC:**
- **Service Accounts:** Un par service pour identification
- **Roles:** Limités par namespace (principle of least privilege)
- **ClusterRoles:** Pour accès cross-namespace (monitoring, ingress)

**Image Security:**
- **Trivy:** Scanning statique des images
- **Falco:** Runtime security, détection d'anomalies
- **Policy:** Blocage vulnérabilités critiques (CVSS >= 9.0)

**Dependencies:**
- Nécessite US-INFRA-01 (Kubernetes cluster) complété
- Nécessite US-016 (CI/CD) pour intégration Trivy

### Definition of Done
- [ ] Vault déployé et accessible
- [ ] Secrets stockés dans Vault (pas en plain text)
- [ ] Network Policies appliquées (isolation testée)
- [ ] TLS activé sur tous les endpoints publics
- [ ] Image scanning passe (pas de vulnérabilités critiques)
- [ ] RBAC configuré et testé (accès limité validé)
- [ ] Audit logging fonctionnel
- [ ] Documentation: guide de sécurité et procédures

