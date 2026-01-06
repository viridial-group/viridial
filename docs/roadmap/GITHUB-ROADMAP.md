# GitHub Roadmap - Viridial

Guide pour utiliser GitHub Projects pour gérer la roadmap Viridial.

## Vue d'Ensemble

GitHub Projects permet de visualiser et gérer la roadmap avec:
- **Vues par Epic:** Filtrer par epic (Foundation, Multi-tenant, etc.)
- **Vues par Service:** Filtrer par service (auth, property, etc.)
- **Vues par Sprint:** Filtrer par milestone (Sprint 1-2, Sprint 3, etc.)
- **Automatisation:** Déplacement automatique selon labels/status

## Création du Project

### 1. Créer le Project "Viridial Roadmap"

1. Aller dans **Projects** → **New Project**
2. Choisir **Board** (Kanban)
3. Nom: **"Viridial Roadmap"**
4. Description: "Roadmap complète du projet Viridial avec épics, stories et dépendances"

### 2. Créer les Colonnes

**Colonnes recommandées:**

1. **Backlog** - Stories non commencées
2. **Epic 1: Foundation** - Stories de l'epic Foundation
3. **Epic 2: Multi-tenant** - Stories de l'epic Multi-tenant
4. **Epic 3: Property Management** - Stories de l'epic Property Management
5. **Epic 4: Search** - Stories de l'epic Search
6. **Epic 5: Agency** - Stories de l'epic Agency
7. **Epic 6: Lead Management** - Stories de l'epic Lead Management
8. **Epic 7: Operations** - Stories de l'epic Operations
9. **Epic 8: Intelligence** - Stories de l'epic Intelligence
10. **Epic 9: Rich Media** - Stories de l'epic Rich Media
11. **Epic 10: Monetization** - Stories de l'epic Monetization
12. **In Progress** - Stories en cours
13. **Review** - Stories en review (PR ouverte)
14. **Done** - Stories terminées

### 3. Configurer l'Automatisation

**Règles recommandées:**

1. **Auto-move selon status:**
   - Si `status:in-progress` → Colonne "In Progress"
   - Si `status:review` → Colonne "Review"
   - Si `status:done` → Colonne "Done"

2. **Auto-move selon epic:**
   - Si `epic:foundation` → Colonne "Epic 1: Foundation"
   - Si `epic:multi-tenant` → Colonne "Epic 2: Multi-tenant"
   - etc.

3. **Auto-assign selon service:**
   - Si `service:auth` → Suggérer @team-backend
   - Si `service:frontend` → Suggérer @team-frontend
   - Si `service:infra` → Suggérer @team-devops

## Vues Personnalisées

### Vue "Epic Board"

**Filtres:**
- Group by: `epic:*`
- Filter: `type:feature`
- Sort: Priority (P0 → P2)

**Utilisation:**
- Voir toutes les stories d'un epic
- Suivre la progression par epic
- Identifier les dépendances entre épics

### Vue "Service Board"

**Filtres:**
- Group by: `service:*`
- Filter: `status:in-progress` OR `status:review`
- Sort: Priority

**Utilisation:**
- Voir le travail en cours par service
- Identifier les goulots d'étranglement
- Répartir la charge de travail

### Vue "Sprint Board"

**Filtres:**
- Group by: Milestone
- Filter: `status:ready` OR `status:in-progress` OR `status:review`
- Sort: Priority

**Utilisation:**
- Voir les stories du sprint actuel
- Suivre la vélocité
- Planifier le prochain sprint

### Vue "Critical Path"

**Filtres:**
- Filter: `priority:p0` OR `status:blocked`
- Sort: Priority

**Utilisation:**
- Identifier les bloqueurs
- Suivre le critical path
- Décider des priorités

## Synchronisation avec Stories

### Lier Issues aux Stories

Chaque story dans `docs/stories/` peut avoir une Issue GitHub correspondante:

```markdown
# US-001: Création d'organisation

## GitHub Issue
- Issue: #123
- Labels: epic:foundation, service:admin, priority:p0
- Milestone: Sprint 1-2: Foundation
```

### Script de Synchronisation

Utiliser le script pour créer/mettre à jour les Issues:

```bash
# Dry-run d'abord
./scripts/sync-stories-to-github.sh --dry-run

# Créer les Issues
./scripts/sync-stories-to-github.sh
```

Le script:
1. Lit `docs/stories/INDEX.md`
2. Crée une Issue pour chaque story
3. Ajoute les labels appropriés (epic, service, priority)
4. Assigne le milestone correspondant
5. Lie l'Issue à la story dans la description

## Workflow avec GitHub Projects

### 1. Créer une Story

1. Créer story dans `docs/stories/US-XXX-*.story.md`
2. Ajouter à `INDEX.md`
3. Mettre à jour `DEPENDENCIES.md` si nécessaire
4. Exécuter `sync-stories-to-github.sh` pour créer l'Issue

### 2. Commencer le Travail

1. Créer branche: `feature/US-XXX-description`
2. Mettre label `status:in-progress` sur l'Issue
3. L'Issue se déplace automatiquement dans "In Progress"

### 3. Créer Pull Request

1. Créer PR avec template
2. Référencer l'Issue: `Closes #123`
3. Mettre label `status:review` sur l'Issue
4. L'Issue se déplace automatiquement dans "Review"

### 4. Merge

1. Après merge, mettre label `status:done` sur l'Issue
2. L'Issue se déplace automatiquement dans "Done"
3. Mettre à jour le statut de la story dans `US-XXX-*.story.md`

## Métriques et Reporting

### Vélocité par Sprint

- Filtrer par Milestone
- Compter les Issues dans "Done"
- Calculer story points complétés

### Charge par Service

- Filtrer par `service:*`
- Voir les Issues en cours
- Identifier les services surchargés

### Progression par Epic

- Filtrer par `epic:*`
- Voir le pourcentage de completion
- Identifier les épics en retard

## Best Practices

1. **Toujours lier Issues aux Stories:**
   - Chaque story doit avoir une Issue GitHub
   - L'Issue référence la story dans la description

2. **Utiliser les Labels:**
   - Au moins: `type:*`, `service:*`, `priority:*`
   - Optionnel: `epic:*`, `status:*`

3. **Mettre à jour le Status:**
   - `status:ready` → Prêt à être travaillé
   - `status:in-progress` → En cours
   - `status:review` → PR ouverte
   - `status:done` → Terminé
   - `status:blocked` → Bloqué

4. **Utiliser les Milestones:**
   - Assigner chaque Issue à un milestone (Sprint)
   - Permet de suivre la progression par sprint

5. **Commenter les Issues:**
   - Mettre à jour la progression
   - Documenter les décisions
   - Lier les PRs

## Ressources

- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [Stories Epics](docs/stories/EPICS.md)
- [Stories Dependencies](docs/stories/DEPENDENCIES.md)
- [GitHub Workflow](../contributing/github-workflow.md)

