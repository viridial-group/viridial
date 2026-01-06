# Guide: Créer GitHub Project "Viridial Roadmap"

## 🎯 Objectif

Créer un GitHub Project pour visualiser et organiser le travail selon la roadmap Viridial.

## 🔗 Accès Direct

**URL:** https://github.com/viridial-group/viridial/projects

## 📋 Étapes de Création

### Étape 1: Créer le Project

1. Aller sur: https://github.com/viridial-group/viridial/projects
2. Cliquer sur **"New project"** (Nouveau projet)
3. Choisir le template **"Board"** (Tableau)
4. Entrer le nom: **"Viridial Roadmap"**
5. Cliquer sur **"Create"** (Créer)

### Étape 2: Configurer les Colonnes

Par défaut, GitHub crée 3 colonnes. Modifier pour avoir:

1. **Backlog** (À faire)
   - Toutes les issues non commencées
   
2. **Ready** (Prêt)
   - Issues prêtes à être travaillées (labels `status:ready`)
   
3. **In Progress** (En cours)
   - Issues en cours de développement (labels `status:in-progress`)
   
4. **In Review** (En révision)
   - Issues en révision (labels `status:review`)
   
5. **Done** (Terminé)
   - Issues complétées (labels `status:done`)

**Pour modifier les colonnes:**
- Cliquer sur les 3 points (⋯) à côté du nom de la colonne
- Cliquer "Edit" ou "Delete"
- Pour ajouter: Cliquer "+ Add column"

### Étape 3: Configurer les Vues (Optionnel mais Recommandé)

#### Vue 1: Epic Board

1. Cliquer sur **"Views"** (Vues) en haut
2. Cliquer **"New view"** (Nouvelle vue)
3. Nom: **"Epic Board"**
4. Type: **Board**
5. Filtrer par: Label `epic:*`
6. Sauvegarder

#### Vue 2: Service Board

1. Créer une nouvelle vue
2. Nom: **"Service Board"**
3. Type: **Board**
4. Filtrer par: Label `service:*`
5. Sauvegarder

#### Vue 3: Sprint Board

1. Créer une nouvelle vue
2. Nom: **"Sprint Board"**
3. Type: **Board**
4. Filtrer par: Milestone (sélectionner un milestone)
5. Sauvegarder

### Étape 4: Configurer l'Automatisation (Optionnel)

GitHub Projects peut automatiquement déplacer les issues selon les labels:

1. Aller dans **Settings** du project
2. Section **"Automation"**
3. Activer:
   - **Auto-move issues** selon label `status:*`
   - **Auto-archive** issues avec label `status:done`

**Exemple de règles:**
- Si label `status:ready` → Déplacer vers colonne "Ready"
- Si label `status:in-progress` → Déplacer vers colonne "In Progress"
- Si label `status:review` → Déplacer vers colonne "In Review"
- Si label `status:done` → Déplacer vers colonne "Done"

## 📊 Utilisation du Project

### Ajouter des Issues au Project

1. Ouvrir une issue GitHub
2. Dans le panneau droit, section **"Projects"**
3. Sélectionner **"Viridial Roadmap"**
4. L'issue apparaîtra dans la colonne "Backlog"

### Déplacer une Issue

1. Dans le project board, faire glisser l'issue d'une colonne à l'autre
2. Ou utiliser les labels `status:*` si l'automatisation est activée

### Filtrer par Vue

1. Cliquer sur le menu **"Views"** en haut
2. Sélectionner la vue désirée (Epic Board, Service Board, Sprint Board)
3. Le board se mettra à jour automatiquement

## 🎯 Vues Recommandées

### Vue Globale (Par Défaut)
- Toutes les issues du projet
- Organisées par statut (Backlog → Done)

### Vue Epic
- Filtrer par label `epic:*`
- Voir toutes les issues d'un epic spécifique
- Exemple: `epic:foundation` montre toutes les issues de l'Epic 1

### Vue Service
- Filtrer par label `service:*`
- Voir toutes les issues d'un service spécifique
- Exemple: `service:auth` montre toutes les issues du service auth

### Vue Sprint
- Filtrer par milestone
- Voir toutes les issues d'un sprint spécifique
- Exemple: "Sprint 1-2: Foundation"

## 📚 Documentation

- Guide complet: `docs/roadmap/GITHUB-ROADMAP.md`
- GitHub Docs: https://docs.github.com/en/issues/planning-and-tracking-with-projects
