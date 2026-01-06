# Créer les Labels GitHub Manuellement

## Problème

Le script automatique `scripts/create-github-labels.sh` nécessite les permissions d'écriture sur le repository. Si vous n'avez que les permissions de lecture, créez les labels manuellement.

## Solution: Création Manuelle

### Étape 1: Accéder à la Page Labels

1. Aller sur: https://github.com/viridial-group/viridial/labels
2. Cliquer sur "New label"

### Étape 2: Créer les Labels par Catégorie

#### Priority Labels

| Label name | Description | Color |
|------------|-------------|-------|
| `priority:p0` | Critique - Bloqueur | `#d73a4a` |
| `priority:p1` | Important | `#e99695` |
| `priority:p2` | Nice to have | `#fbca04` |

#### Type Labels

| Label name | Description | Color |
|------------|-------------|-------|
| `type:bug` | Bug | `#d73a4a` |
| `type:feature` | Feature | `#0e8a16` |
| `type:infrastructure` | Infrastructure | `#0052cc` |
| `type:documentation` | Documentation | `#5319e7` |
| `type:refactoring` | Refactoring | `#c5def5` |

#### Service Labels

| Label name | Description | Color |
|------------|-------------|-------|
| `service:auth` | Auth Service | `#1d76db` |
| `service:property` | Property Service | `#1d76db` |
| `service:search` | Search Service | `#1d76db` |
| `service:lead` | Lead Service | `#1d76db` |
| `service:billing` | Billing Service | `#1d76db` |
| `service:admin` | Admin Service | `#1d76db` |
| `service:frontend` | Frontend | `#1d76db` |
| `service:infra` | Infrastructure | `#1d76db` |
| `service:shared` | Shared Code | `#1d76db` |

#### Epic Labels

| Label name | Description | Color |
|------------|-------------|-------|
| `epic:foundation` | Epic 1: Foundation | `#b60205` |
| `epic:multi-tenant` | Epic 2: Multi-tenant | `#b60205` |
| `epic:property-management` | Epic 3: Property Management | `#b60205` |
| `epic:search` | Epic 4: Search | `#b60205` |
| `epic:agency` | Epic 5: Agency | `#b60205` |
| `epic:lead-management` | Epic 6: Lead Management | `#b60205` |
| `epic:operations` | Epic 7: Operations | `#b60205` |
| `epic:intelligence` | Epic 8: Intelligence | `#b60205` |
| `epic:rich-media` | Epic 9: Rich Media | `#b60205` |
| `epic:monetization` | Epic 10: Monetization | `#b60205` |

#### Status Labels

| Label name | Description | Color |
|------------|-------------|-------|
| `status:ready` | Ready | `#0e8a16` |
| `status:in-progress` | In Progress | `#fbca04` |
| `status:review` | In Review | `#0052cc` |
| `status:blocked` | Blocked | `#d73a4a` |
| `status:done` | Done | `#0e8a16` |

#### Infrastructure Labels

| Label name | Description | Color |
|------------|-------------|-------|
| `infra:kubernetes` | Kubernetes | `#0052cc` |
| `infra:database` | Database | `#0052cc` |
| `infra:observability` | Observability | `#0052cc` |
| `infra:security` | Security | `#0052cc` |
| `infra:ci-cd` | CI/CD | `#0052cc` |

## Total: 38 Labels

## Alternative: Obtenir les Permissions

Si vous êtes owner de l'organisation ou avez accès aux settings:

1. Aller sur: https://github.com/viridial-group/viridial/settings/access
2. Ajouter votre compte comme collaborateur avec permissions "Write"
3. Réessayer le script: `./scripts/create-github-labels.sh`

## Vérification

Après création, vérifier:
```bash
gh label list --repo viridial-group/viridial | grep -E "(priority:|type:|service:|epic:|status:|infra:)"
```

