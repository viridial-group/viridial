# Guide: Création Manuelle des Milestones GitHub

Ce guide vous aidera à créer manuellement les milestones GitHub si le script `create-github-milestones.sh` ne peut pas être exécuté en raison de problèmes de permissions.

## Accéder aux Milestones du Repository

1. Ouvrez votre navigateur et allez à l'URL de votre repository GitHub:
   `https://github.com/viridial-group/viridial`
2. Cliquez sur l'onglet **"Issues"** (Problèmes).
3. Dans le menu latéral gauche, cliquez sur **"Milestones"**.
4. Cliquez sur le bouton **"New milestone"** (Nouveau jalon).

## Milestones à Créer

Voici la liste des milestones à créer selon la roadmap Viridial. Pour chaque milestone, vous devrez spécifier le **Titre**, la **Description** et la **Date d'échéance** (optionnel).

### Sprint 1-2: Foundation

- **Titre:** `Sprint 1-2: Foundation`
- **Description:** `Foundation: Infrastructure, Auth, Multi-tenant Setup`
- **Date d'échéance:** Dans 4 semaines (calculer depuis aujourd'hui)

**Stories incluses:**
- US-INFRA-01: Kubernetes Cluster
- US-INFRA-02: Services de Base
- US-001: Création d'organisation
- US-002: Agency Signup
- US-014: Authn & JWT

### Sprint 3: Multi-tenant Setup

- **Titre:** `Sprint 3: Multi-tenant Setup`
- **Description:** `Multi-tenant: Organizations, RBAC, i18n`
- **Date d'échéance:** Dans 6 semaines

**Stories incluses:**
- US-004: Gestion utilisateurs & rôles
- US-015: RBAC Enforcement
- US-INFRA-05: Infrastructure Multi-tenant

### Sprint 4-5: Core Features

- **Titre:** `Sprint 4-5: Core Features`
- **Description:** `Core: Properties CRUD, Search, Leads`
- **Date d'échéance:** Dans 10 semaines

**Stories incluses:**
- US-007: Properties CRUD
- US-009: Search
- US-010: Lead Management
- US-026: Custom Fields

### Sprint 6: Agency Features

- **Titre:** `Sprint 6: Agency Features`
- **Description:** `Agency: Dashboard, Property Management`
- **Date d'échéance:** Dans 12 semaines

**Stories incluses:**
- US-003: Agency Dashboard
- US-008: Property Management
- US-011: Agency Analytics

### Sprint 7: Lead Management

- **Titre:** `Sprint 7: Lead Management`
- **Description:** `Leads: Scoring, CRM Sync, Contact Flow`
- **Date d'échéance:** Dans 14 semaines

**Stories incluses:**
- US-012: Lead Scoring
- US-013: CRM Integration
- US-016: Contact Flow

### Sprint 8: Operations

- **Titre:** `Sprint 8: Operations`
- **Description:** `Operations: Observability, Backups, Security`
- **Date d'échéance:** Dans 16 semaines

**Stories incluses:**
- US-INFRA-03: Observability Stack
- US-INFRA-04: Security Infrastructure
- US-INFRA-06: Backup & DR

### Sprint 9+: Advanced Features

- **Titre:** `Sprint 9+: Advanced Features`
- **Description:** `Advanced: Price Estimator, Virtual Tours, Promotions`
- **Date d'échéance:** (Laisser vide - pas de date fixe)

**Stories incluses:**
- US-020: Price Estimator
- US-021: Virtual Tours
- US-022: Promotions

## Étapes pour Créer un Milestone

1. Cliquez sur **"New milestone"** (Nouveau jalon).
2. Entrez le **Titre** du milestone.
3. Entrez la **Description** du milestone.
4. (Optionnel) Sélectionnez une **Date d'échéance** (Due date).
5. Cliquez sur **"Create milestone"** (Créer le jalon).

Répétez ces étapes pour tous les milestones listés ci-dessus.

## Associer des Issues aux Milestones

Après avoir créé les milestones:

1. Ouvrez chaque issue GitHub.
2. Dans le panneau latéral droit, trouvez le champ **"Milestone"**.
3. Sélectionnez le milestone approprié pour cette issue.
4. L'issue sera automatiquement associée au milestone.

## Vérification

Pour vérifier que tous les milestones ont été créés:

1. Aller sur: https://github.com/viridial-group/viridial/milestones
2. Vous devriez voir tous les milestones listés ci-dessus.
3. Chaque milestone devrait avoir le bon nombre d'issues associées.

## Alternative: Utiliser GitHub CLI (si permissions obtenues)

Si vous obtenez les permissions Write plus tard, vous pouvez utiliser:

```bash
./scripts/github/create-github-milestones.sh
```

Le script créera automatiquement tous les milestones.
