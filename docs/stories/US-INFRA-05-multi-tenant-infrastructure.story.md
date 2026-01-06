# US-INFRA-05: Infrastructure Multi-tenant (Isolation, Quotas, Routing)

## Status: Draft

### Story
En tant qu'équipe d'ingénierie, je souhaite configurer l'isolation multi-tenant au niveau infrastructure (network, storage, resources) afin de garantir la séparation des données et ressources entre organisations.

### Acceptance Criteria
- Given tenant A et tenant B, When je teste l'isolation, Then tenant A ne peut pas accéder aux données de tenant B.
- Given resource quotas configurées, When un tenant dépasse ses limites, Then le tenant est throttlé.
- Given routing configuré, When un tenant accède, Then le routing est tenant-aware (header ou subdomain).
- Usage metrics exportées pour billing.

**Priority:** P0
**Estimation:** 3

### Tasks

#### Phase 1: Network Isolation
- [ ] Network Policies configurées pour isolation par tenant
- [ ] Namespaces par tenant (optionnel) ou isolation via labels
- [ ] Isolation testée: tenant A ne peut pas accéder services tenant B
- [ ] Documentation des règles d'isolation réseau

#### Phase 2: Storage Isolation
- [ ] MinIO buckets isolés par tenant (prefix ou buckets séparés)
- [ ] PostgreSQL RLS (Row-Level Security) activé avec `organization_id`
- [ ] Isolation testée: tenant A ne peut pas accéder données tenant B
- [ ] Documentation des stratégies de stockage multi-tenant

#### Phase 3: Resource Quotas
- [ ] ResourceQuota créées par tenant (CPU, memory, storage)
- [ ] LimitRange configuré pour limites par pod
- [ ] Monitoring des quotas (alertes si approche limite)
- [ ] Documentation des quotas et limites

#### Phase 4: Tenant-aware Routing
- [ ] Routing header-based: `X-Tenant-ID` pour identification
- [ ] Routing subdomain optionnel: `tenant1.viridial.com`
- [ ] API Gateway configuré pour extraction tenant context
- [ ] Tests de routing avec différents tenants

#### Phase 5: Tenant Metadata & Billing
- [ ] Service de métadonnées tenant (tracking ressources)
- [ ] Usage metrics exportées (CPU, memory, storage, API calls)
- [ ] Intégration hooks pour billing (webhooks ou queue)
- [ ] Dashboard Grafana pour usage par tenant

### Technical Notes

**Multi-tenant Strategies:**

**Database Isolation:**
- **Row-Level Security (RLS):** PostgreSQL RLS avec `organization_id` comme tenant key
- **Policy:** `CREATE POLICY tenant_isolation ON properties USING (organization_id = current_setting('app.tenant_id')::uuid)`
- **Context:** Tenant ID propagé via session variable ou JWT claim

**Storage Isolation:**
- **MinIO:** Buckets par tenant (`tenant-{org-id}-images`) ou prefixes (`images/{org-id}/`)
- **Access Control:** IAM policies MinIO par tenant
- **Backup:** Isolation des backups par tenant

**Network Isolation:**
- **Kubernetes Network Policies:** Isolation entre namespaces ou via labels
- **Service Mesh:** Linkerd peut isoler par tenant (optionnel)

**Resource Quotas:**
- **Par Tenant:** ResourceQuota avec limites CPU, memory, storage
- **Monitoring:** Alertes si quota > 80%
- **Scaling:** Augmenter quotas selon besoin

**Tenant Routing:**
- **Header-based:** `X-Tenant-ID` ou `X-Organization-ID` dans headers HTTP
- **Subdomain:** `{tenant-slug}.viridial.com` avec routing DNS
- **API Gateway:** Kong/Traefik extrait tenant et injecte dans contexte

**Dependencies:**
- Nécessite US-INFRA-01 (Kubernetes cluster) complété
- Nécessite US-INFRA-02 (Services de base) pour RLS et storage
- Nécessite US-001 (Organization) pour tenant identification

### Definition of Done
- [ ] Tenant isolation testée (network, database, storage)
- [ ] Resource quotas par tenant fonctionnelles
- [ ] Tenant routing testé (header-based ou subdomain)
- [ ] Usage metrics exportées pour billing
- [ ] Documentation: guide multi-tenant et isolation
- [ ] Tests: validation isolation complète (tenant A isolé de tenant B)

