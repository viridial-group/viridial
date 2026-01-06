# Stratégie Monorepo - Viridial

## Décision

**Stratégie choisie:** **Monorepo** avec structure modulaire

**Date:** 2025-01-06

**Justification:**
- Facilite le partage de code entre services (shared/)
- Simplifie la gestion des dépendances
- Permet des refactorings cross-services plus faciles
- CI/CD unifié
- Meilleure cohérence des versions
- Plus simple pour le MVP et petites équipes

## Structure

```
viridial/
├── services/              # 6 microservices backend
│   ├── auth-service/
│   ├── property-service/
│   ├── search-service/
│   ├── lead-service/
│   ├── billing-service/
│   └── admin-service/
├── frontend/             # 3 applications frontend
│   ├── web/             # Site public
│   ├── agency/          # Application agence
│   └── admin/           # Application admin
├── shared/               # Code partagé
│   ├── types/          # Types TypeScript
│   ├── utils/          # Utilitaires
│   └── contracts/      # Contrats API (OpenAPI)
└── infrastructure/      # IaC
```

## Avantages Monorepo

1. **Partage de Code**
   - Types partagés dans `shared/types/`
   - Utilitaires dans `shared/utils/`
   - Contrats API dans `shared/contracts/`

2. **Cohérence**
   - Versions synchronisées
   - Standards de code unifiés
   - Tests cross-services facilités

3. **Refactoring**
   - Changements API propagés facilement
   - Migration de types simplifiée

4. **CI/CD**
   - Build unifié
   - Tests parallèles
   - Déploiement coordonné

5. **Développement**
   - IDE unique pour tout le code
   - Recherche globale facilitée
   - Navigation entre services rapide

## Inconvénients & Mitigations

1. **Taille du Repository**
   - **Mitigation:** Git LFS pour gros fichiers, .gitignore strict

2. **Build Times**
   - **Mitigation:** Builds parallèles, cache Docker, builds incrémentaux

3. **Permissions**
   - **Mitigation:** CODEOWNERS pour review automatique par service

4. **Couplage Accidental**
   - **Mitigation:** Structure claire, documentation, code reviews

## Gestion des Dépendances

### Workspaces (npm/yarn/pnpm)

```json
{
  "workspaces": [
    "services/*",
    "frontend/*",
    "shared/*"
  ]
}
```

### Imports Partagés

```typescript
// Dans un service
import { Property, User } from '@viridial/shared/types';
import { formatPrice } from '@viridial/shared/utils';
```

## CI/CD Strategy

### Build Par Service

- Chaque service build indépendamment
- Tests parallèles par service
- Images Docker séparées par service

### Déploiement

- Déploiement indépendant par service
- Kubernetes Deployments séparés
- Rollback par service

## Migration Future (si nécessaire)

Si le monorepo devient trop lourd, migration possible vers:
- **Multi-repo** avec packages npm partagés
- **Monorepo tools** (Nx, Turborepo) pour optimisations

Pour l'instant, monorepo simple suffit pour MVP.

## Conventions

- **Nommage:** `kebab-case` pour services
- **Imports:** Utiliser `@viridial/shared/*` pour code partagé
- **Tests:** Tests unitaires par service, tests d'intégration cross-services
- **Documentation:** README.md dans chaque service

## Ressources

- [Repository Structure](repository-structure.md)
- [Contributing Guide](../../CONTRIBUTING.md)
- [GitHub Workflow](../contributing/github-workflow.md)

