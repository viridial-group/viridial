# Labels GitHub - Viridial

Documentation des labels GitHub utilisés dans le projet Viridial.

## Catégories de Labels

### Priority (Priorité)

| Label | Description | Couleur |
|-------|-------------|---------|
| `priority:p0` | Critique - Bloqueur, doit être résolu immédiatement | Rouge |
| `priority:p1` | Important - À traiter rapidement | Orange |
| `priority:p2` | Nice to have - Peut attendre | Jaune |

**Utilisation:**
- Assigner selon la criticité de l'issue/story
- P0 = Bloque le développement ou la production
- P1 = Impacte une feature importante
- P2 = Amélioration, optimisation

### Type (Type d'Issue)

| Label | Description | Couleur |
|-------|-------------|---------|
| `type:bug` | Bug à corriger | Rouge |
| `type:feature` | Nouvelle fonctionnalité | Vert |
| `type:infrastructure` | Tâche infrastructure | Bleu |
| `type:documentation` | Documentation | Violet |
| `type:refactoring` | Refactoring de code | Rose |

**Utilisation:**
- Un issue doit avoir au moins un label `type:*`
- Permet de filtrer par type de travail

### Service (Service Concerné)

| Label | Description | Couleur |
|-------|-------------|---------|
| `service:auth` | Auth Service | Bleu |
| `service:property` | Property Service | Bleu |
| `service:search` | Search Service | Bleu |
| `service:lead` | Lead Service | Bleu |
| `service:billing` | Billing Service | Bleu |
| `service:admin` | Admin Service | Bleu |
| `service:frontend` | Frontend (web/agency/admin) | Bleu |
| `service:infra` | Infrastructure | Bleu |
| `service:shared` | Code partagé | Bleu |

**Utilisation:**
- Identifier quel(s) service(s) est/sont concerné(s)
- Un issue peut avoir plusieurs labels `service:*`
- Utilisé pour CODEOWNERS et review automatique

### Epic (Épic)

| Label | Description | Couleur |
|-------|-------------|---------|
| `epic:foundation` | Epic 1: Foundation | Rouge foncé |
| `epic:multi-tenant` | Epic 2: Multi-tenant | Rouge foncé |
| `epic:property-management` | Epic 3: Property Management | Rouge foncé |
| `epic:search` | Epic 4: Search | Rouge foncé |
| `epic:agency` | Epic 5: Agency | Rouge foncé |
| `epic:lead-management` | Epic 6: Lead Management | Rouge foncé |
| `epic:operations` | Epic 7: Operations | Rouge foncé |
| `epic:intelligence` | Epic 8: Intelligence | Rouge foncé |
| `epic:rich-media` | Epic 9: Rich Media | Rouge foncé |
| `epic:monetization` | Epic 10: Monetization | Rouge foncé |

**Utilisation:**
- Lier une issue/story à un epic
- Permet de filtrer par epic dans GitHub Projects
- Voir `docs/stories/EPICS.md` pour détails des épics

### Status (Statut)

| Label | Description | Couleur |
|-------|-------------|---------|
| `status:ready` | Prêt à être travaillé | Vert |
| `status:in-progress` | En cours de développement | Jaune |
| `status:review` | En review (PR ouverte) | Bleu |
| `status:blocked` | Bloqué (attente dépendance) | Rouge |
| `status:done` | Terminé | Vert |

**Utilisation:**
- Suivre le statut d'une issue/story
- Automatiquement mis à jour par GitHub Projects
- Permet de voir rapidement l'état du projet

### Infrastructure (Infrastructure)

| Label | Description | Couleur |
|-------|-------------|---------|
| `infra:kubernetes` | Kubernetes | Bleu |
| `infra:database` | Database (PostgreSQL, Redis, etc.) | Bleu |
| `infra:observability` | Observability (Prometheus, Grafana, etc.) | Bleu |
| `infra:security` | Security (Vault, RBAC, etc.) | Bleu |
| `infra:ci-cd` | CI/CD (GitHub Actions, etc.) | Bleu |

**Utilisation:**
- Pour les issues infrastructure (US-INFRA-XX)
- Permet de filtrer par type d'infrastructure
- Complémentaire à `type:infrastructure`

## Utilisation dans les Issues

### Exemple d'Issue Bug

```markdown
Labels:
- type:bug
- priority:p0
- service:auth
- status:in-progress
```

### Exemple d'Issue Feature

```markdown
Labels:
- type:feature
- priority:p1
- service:property
- epic:property-management
- status:ready
```

### Exemple d'Issue Infrastructure

```markdown
Labels:
- type:infrastructure
- priority:p0
- service:infra
- infra:kubernetes
- epic:foundation
- status:in-progress
```

## Filtres Utiles

### Par Service
```
label:service:auth
label:service:property
```

### Par Priority
```
label:priority:p0
label:priority:p1
```

### Par Epic
```
label:epic:foundation
label:epic:property-management
```

### Par Status
```
label:status:in-progress
label:status:blocked
```

### Combinaisons
```
label:service:auth label:priority:p0 label:status:in-progress
label:epic:foundation label:type:infrastructure
```

## Création des Labels

Les labels sont créés automatiquement avec le script:

```bash
./scripts/create-github-labels.sh
```

Ou manuellement via GitHub UI:
1. Aller dans Settings → Labels
2. Créer chaque label avec la couleur et description appropriées

## Mise à Jour

Pour mettre à jour les labels:

```bash
# Le script met à jour automatiquement les labels existants
./scripts/create-github-labels.sh
```

## Ressources

- [GitHub Labels Documentation](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/managing-labels)
- [Stories Epics](docs/stories/EPICS.md)
- [GitHub Workflow](github-workflow.md)

