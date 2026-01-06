# Story Dependencies Matrix

Ce document mappe les dépendances entre les user stories pour faciliter la planification et identifier les risques de blocage.

## Légende

- **→** : Dépend de (doit être complété avant)
- **↔** : Dépendance bidirectionnelle (peuvent être développées en parallèle avec coordination)
- **⚠️** : Dépendance critique (bloque le développement)

## Matrice de Dépendances

### Setup Layer (Préparation Repository)

```
US-000 (GitHub Setup) ⚠️
  ↓
[Toutes les autres stories]
```

**Note:** US-000 doit être complété en premier car il configure le repository, les workflows CI/CD de base, et la structure pour toutes les autres stories.

### Foundation Layer (Infrastructure)

```
US-000 (GitHub Setup)
  ↓
US-INFRA-01 (Kubernetes Cluster)
  ↓
US-INFRA-02 (Services de Base)
  ↓
US-INFRA-04 (Sécurité) + US-INFRA-05 (Multi-tenant)
  ↓
US-001 (Organization) → US-014 (Authn) → US-015 (RBAC)
```

**Chaîne critique infrastructure:** US-000 → US-INFRA-01 → US-INFRA-02 → US-INFRA-04 → US-001 → US-014 → US-015

**Stories infrastructure:**
- **US-INFRA-01:** Kubernetes Cluster de Base (P0, 5 pts) - Base
- **US-INFRA-02:** Services de Base (P0, 5 pts) - Dépend de INFRA-01
- **US-INFRA-03:** Observabilité (P1, 5 pts) - Dépend de INFRA-01, INFRA-02
- **US-INFRA-04:** Sécurité (P0, 3 pts) - Dépend de INFRA-01
- **US-INFRA-05:** Multi-tenant (P0, 3 pts) - Dépend de INFRA-01, INFRA-02
- **US-INFRA-06:** Backup & DR (P1, 3 pts) - Dépend de INFRA-02

### Multi-tenant & Admin Layer

```
US-001 (Organization)
  ↓
US-004 (Users & Roles)
  ↓
US-005 (Admin i18n) ↔ US-012 (Backend i18n) ↔ US-013 (Frontend i18n)
```

**Note:** US-005, US-012, US-013 peuvent être développés en parallèle mais nécessitent coordination.

### Property Management Layer

```
US-019 (Geolocation) ⚠️
  ↓
US-007 (Properties CRUD)
  ↓
US-010 (Listing SEO)
```

**Chaîne critique:** US-019 doit être complété avant US-007 (géocodage requis).

### Search & Discovery Layer

```
US-007 (Properties CRUD)
  ↓
US-009 (Search)
  ↓
US-011 (Favorites) [P2 - peut attendre]
```

**Note:** US-009 nécessite que US-007 indexe les propriétés dans Meilisearch.

### Agency Management Layer

```
US-001 (Organization) + US-014 (Authn)
  ↓
US-002 (Agency Signup)
  ↓
US-003 (Billing) ↔ US-006 (Dashboard)
```

**Note:** US-003 et US-006 peuvent être développés en parallèle.

### Lead Management Layer

```
US-001 (Organization) + US-007 (Properties) + US-009 (Search)
  ↓
US-008 (Leads Management)
  ↓
US-024 (Lead Scoring & CRM)
```

### Advanced Features Layer

```
US-007 (Properties) + US-019 (Geolocation)
  ↓
US-020 (Price Estimator)
  ↓
US-021 (Neighborhood Insights)
```

```
US-007 (Properties)
  ↓
US-022 (Virtual Tours)
```

```
US-001 (Organization) + US-003 (Billing) + US-007 (Properties)
  ↓
US-023 (Listing Promotions)
```

```
US-001 (Organization) + US-007 (Properties)
  ↓
US-025 (Agent Marketplace)
```

```
US-001 (Organization) + US-004 (Users & Roles) + US-007 (Properties) + US-009 (Search)
  ↓
US-026 (Custom Fields Réutilisables)
```

**Note:** US-026 nécessite:
- US-001 pour isolation multi-tenant
- US-004 pour permissions (qui peut créer des champs)
- US-007 pour intégration avec Properties
- US-009 pour indexation dans Meilisearch

### Operations Layer

```
US-INFRA-01 (Kubernetes) + US-INFRA-02 (Services) + US-016 (CI/CD)
  ↓
US-INFRA-03 (Observability) + US-017 (Observability Alerts)
  ↓
US-INFRA-06 (Backup & DR) + US-018 (Backups Postgres)
```

**Note:** US-INFRA-03 et US-017 peuvent être développés en parallèle (stack vs alertes).

## Graph de Dépendances (Textuel)

```
                    US-000 (GitHub Setup)
                         ↓
                    US-INFRA-01 (Kubernetes)
                         ↓
                    US-INFRA-02 (Services)
                         ↓
                    US-001
                    ↙  ↓  ↘
              US-002  US-004  US-014
                    ↓  ↓  ↓
              US-003  US-005  US-015
                    ↓  ↓  ↓
              US-006  US-012
                    ↓  ↓
                    US-013
                         
                    US-019
                         ↓
                    US-007
                    ↙  ↓  ↘
              US-009  US-010  US-020
                    ↓  ↓  ↓
              US-011  US-021  US-022
                         
              US-008 → US-024
              US-023
              US-025
              US-026 (Custom Fields)
                         
              US-016 → US-017 → US-018
```

## Critical Path Analysis

### Chemin Critique Principal

1. **US-000** (GitHub Setup) - 5 pts
2. **US-INFRA-01** (Kubernetes Cluster) - 5 pts
2. **US-INFRA-02** (Services de Base) - 5 pts
3. **US-001** (Organization) - 3 pts
4. **US-014** (Authn) - 5 pts
5. **US-015** (RBAC) - 5 pts
6. **US-019** (Geolocation) - 5 pts
7. **US-007** (Properties CRUD) - 8 pts
8. **US-009** (Search) - 8 pts

**Total chemin critique:** 49 story points (44 + 5 pour US-000)

### Chemins Secondaires (peuvent être parallélisés)

**Path A: Admin & i18n**
- US-004 → US-005 → US-012 → US-013 (13 pts)

**Path B: Agency Management**
- US-002 → US-003 → US-006 (13 pts)

**Path C: Operations**
- US-016 → US-INFRA-03 → US-017 → US-INFRA-06 → US-018 (24 pts)

## Risques de Blocage

### Blocages Critiques Identifiés

1. **US-019 bloque US-007** ⚠️
   - **Impact:** Impossible de créer des propriétés sans géocodage
   - **Mitigation:** Développer US-019 en priorité ou créer un mock temporaire

2. **US-007 bloque US-009** ⚠️
   - **Impact:** Impossible de rechercher sans propriétés indexées
   - **Mitigation:** US-007 doit être complété avant US-009

3. **US-001 bloque tout le multi-tenant** ⚠️
   - **Impact:** Toutes les features nécessitent des organisations
   - **Mitigation:** US-001 est déjà P0 et dans le chemin critique

4. **US-014 + US-015 bloquent les features authentifiées** ⚠️
   - **Impact:** Pas d'accès sécurisé aux features
   - **Mitigation:** Développer en séquence dans Epic 1

### Dépendances Faibles (peuvent être contournées)

- **US-011 (Favorites)** peut attendre US-009
- **US-022 (Virtual Tours)** peut être développé indépendamment de US-007 (mais nécessite propriétés)
- **US-025 (Marketplace)** peut être développé en parallèle avec coordination

## Recommandations de Planification

### Phase 0: Setup Repository (Sprint 0 - Prérequis)
**Must Have:**
- US-000 (GitHub Setup) - **DOIT être fait en premier**

### Phase 1: Foundation (Sprint 1-2)
**Must Have:**
- US-INFRA-01 (Kubernetes Cluster), US-INFRA-02 (Services de Base), US-001, US-014, US-015

**Can Have (si temps):**
- US-016 (CI/CD peut être fait en parallèle)

### Phase 2: Core Setup (Sprint 3)
**Must Have:**
- US-004, US-012, US-013
- US-019 (critique pour Phase 3)

**Can Have:**
- US-005 (peut être fait en parallèle)

### Phase 3: Core Features (Sprint 4-5)
**Must Have:**
- US-007 (bloqué par US-019)
- US-009 (bloqué par US-007)

**Can Have:**
- US-010 (peut être fait en parallèle de US-007)

### Phase 4: Agency Features (Sprint 6)
**Must Have:**
- US-002, US-003, US-006

**Can Have:**
- US-008 (peut commencer si US-007 est prêt)

### Phase 5: Advanced & Operations (Sprint 7+)
**Can Have (selon priorités):**
- US-017, US-018 (Operations)
- US-020, US-021 (Intelligence)
- US-022, US-023, US-024, US-025 (Advanced Features)
- US-026 (Custom Fields - nécessite US-007 et US-009)

## Notes

- Les dépendances sont basées sur l'analyse des stories
- Certaines dépendances peuvent être assouplies avec des mocks/stubs temporaires
- Le développement en parallèle est possible pour les stories non-critiques avec coordination
- Les dépendances doivent être revues lors de la planification de sprint

