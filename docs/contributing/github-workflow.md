# GitHub Workflow pour Viridial

Ce guide décrit le processus de développement collaboratif avec GitHub pour le projet Viridial.

## Vue d'Ensemble

1. **Créer une Issue** liée à une story
2. **Créer une branche** depuis `develop`
3. **Développer** la feature
4. **Créer une Pull Request**
5. **Review** et approbation
6. **Merge** dans `develop` puis `main`

## Workflow Détaillé

### 1. Créer une Issue

**Option A: Depuis une Story Existante**
1. Aller dans `docs/stories/US-XXX-*.story.md`
2. Créer une Issue GitHub avec template "Story Implementation"
3. Remplir le template avec les informations de la story
4. Ajouter les labels appropriés (epic, service, priority)

**Option B: Nouvelle Feature/Bug**
1. Créer une Issue avec template "Feature Request" ou "Bug Report"
2. Si c'est une nouvelle feature importante, créer d'abord une story dans `docs/stories/`
3. Lier l'Issue à la story

### 2. Créer une Branche

```bash
# Depuis develop
git checkout develop
git pull origin develop

# Créer branche feature
git checkout -b feature/US-XXX-short-description

# Ou bugfix
git checkout -b bugfix/US-XXX-short-description
```

**Conventions de nommage:**
- `feature/US-XXX-description` pour nouvelles features
- `bugfix/US-XXX-description` pour corrections de bugs
- `infra/US-INFRA-XX-description` pour infrastructure
- `docs/description` pour documentation

### 3. Développer

- Respecter les standards de code du projet
- Écrire des tests (unitaires, intégration)
- Mettre à jour la documentation si nécessaire
- Commits clairs avec format: `type(service): description`

**Types de commits:**
- `feat(service): description` - Nouvelle feature
- `fix(service): description` - Correction de bug
- `docs: description` - Documentation
- `refactor(service): description` - Refactoring
- `test(service): description` - Tests
- `infra: description` - Infrastructure

### 4. Créer une Pull Request

1. Push la branche:
   ```bash
   git push origin feature/US-XXX-description
   ```

2. Créer PR sur GitHub:
   - Template PR pré-rempli
   - Lier à l'Issue: `Closes #123`
   - Référencer la story: `Story: US-XXX`
   - Ajouter labels appropriés

3. Checklist PR:
   - [ ] Tests passent
   - [ ] CI/CD passe
   - [ ] Documentation mise à jour
   - [ ] Pas de breaking changes (ou documentés)

### 5. Review Process

- **Minimum 1 approbation** pour `develop`
- **Minimum 2 approbations** pour `main`
- Les CODEOWNERS sont automatiquement assignés selon les fichiers modifiés
- Résoudre tous les commentaires avant merge

### 6. Merge

- **Squash and merge** recommandé pour garder l'historique propre
- Après merge, supprimer la branche
- L'Issue est automatiquement fermée si `Closes #123` est dans la PR

## Lien avec les Stories

### Référencer une Story dans une PR

Dans le template PR, remplir:
```markdown
## Story/Issue
- Story: US-XXX
- Epic: [Nom de l'epic]
```

### Créer une Issue depuis une Story

Utiliser le template "Story Implementation" et remplir:
- Story ID: US-XXX
- Fichier: `docs/stories/US-XXX-*.story.md`
- Epic: Nom de l'epic depuis `docs/stories/EPICS.md`

### Mettre à jour le Status d'une Story

Après merge d'une PR liée à une story:
1. Mettre à jour `Status: Done` dans `docs/stories/US-XXX-*.story.md`
2. Mettre à jour la roadmap si nécessaire

## Labels et Milestones

### Labels par Catégorie

**Priority:**
- `priority:p0` - Critique, doit être fait en premier
- `priority:p1` - Important
- `priority:p2` - Nice to have

**Type:**
- `type:bug` - Bug
- `type:feature` - Nouvelle feature
- `type:infrastructure` - Infrastructure
- `type:documentation` - Documentation

**Service:**
- `service:auth`, `service:property`, `service:search`, etc.

**Epic:**
- `epic:foundation`, `epic:multi-tenant`, `epic:property-management`, etc.

### Milestones

Les milestones correspondent aux sprints de la roadmap:
- `Sprint 1-2: Foundation`
- `Sprint 3: Multi-tenant Setup`
- etc.

## GitHub Projects

### Roadmap Board

Le board "Viridial Roadmap" organise les Issues par:
- **Colonnes:** Backlog, Epic 1-10, In Progress, Review, Done
- **Filtres:** Par epic, service, priority, milestone

### Utilisation

1. Créer Issue → Automatiquement ajoutée au board
2. Déplacer Issue dans colonne appropriée
3. Filtrer par epic/service pour voir la vue d'ensemble

## CI/CD

### Workflows Automatiques

- **Lint:** Vérification format de code
- **Test:** Tests unitaires et intégration
- **Build:** Build Docker images
- **Story Validation:** Validation format des stories

### Status Checks Requis

Pour merger dans `main` ou `develop`, tous les checks doivent passer:
- ✅ Lint
- ✅ Tests
- ✅ Build
- ✅ Story Validation (si docs/stories modifiés)

## Best Practices

1. **Une PR = Une Story** (quand possible)
2. **Petites PRs** plus faciles à reviewer
3. **Descriptions claires** dans PR et commits
4. **Tests obligatoires** pour nouvelles features
5. **Documentation à jour** si changements majeurs
6. **Communication** dans les PR pour clarifications

## Ressources

- Stories: `docs/stories/`
- Roadmap: `docs/stories/EPICS.md`
- Dependencies: `docs/stories/DEPENDENCIES.md`
- Architecture: `docs/architecture/`
- Contributing: `docs/contributing/`

