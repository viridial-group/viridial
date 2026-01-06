# Guide: Configuration Branch Protection GitHub

## 🎯 Objectif

Protéger les branches `main` et `develop` contre les merges accidentels et garantir la qualité du code.

## 🔗 Accès Direct

**URL:** https://github.com/viridial-group/viridial/settings/branches

## 📋 Configuration pour `main` (Production)

### Étape 1: Ajouter une Rule pour `main`

1. Sur la page **Settings → Branches**
2. Cliquer sur **"Add rule"** (Ajouter une règle)
3. Dans le champ **"Branch name pattern"**, entrer: `main`
4. Cliquer sur **"Create"**

### Étape 2: Configurer les Options

Une fois la règle créée, cocher les options suivantes:

#### ✅ Require a pull request before merging
- ✅ **Require approvals:** `2` (deux approbations requises)
- ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require review from Code Owners** (si CODEOWNERS est configuré)

#### ✅ Require status checks to pass before merging
- ✅ **Require branches to be up to date before merging**
- Dans la liste des status checks, sélectionner:
  - `ci-base` (si disponible)
  - `lint` (si disponible)
  - `test` (si disponible)
  - `build` (si disponible)

**Note:** Les status checks apparaîtront après le premier push et l'exécution des workflows GitHub Actions.

#### ✅ Require conversation resolution before merging
- ✅ Cocher cette option pour s'assurer que tous les commentaires sont résolus

#### ✅ Require signed commits
- ⚠️ Optionnel mais recommandé pour la sécurité
- Nécessite la configuration de GPG keys

#### ✅ Require linear history
- ✅ Recommandé pour garder un historique Git propre
- Évite les merge commits

#### ✅ Include administrators
- ✅ **IMPORTANT:** Cocher cette option
- Même les administrateurs doivent respecter les règles

#### ✅ Do not allow bypassing the above settings
- ✅ **CRITIQUE:** Cocher cette option
- Empêche de contourner les règles même avec des permissions admin

#### ✅ Allow force pushes
- ❌ **NE PAS COCHER** (déjà décoché par défaut)

#### ✅ Allow deletions
- ❌ **NE PAS COCHER** (déjà décoché par défaut)

### Étape 3: Sauvegarder

Cliquer sur **"Save changes"** en bas de la page.

## 📋 Configuration pour `develop` (Development)

### Étape 1: Ajouter une Rule pour `develop`

1. Toujours sur **Settings → Branches**
2. Cliquer sur **"Add rule"** (Ajouter une règle)
3. Dans le champ **"Branch name pattern"**, entrer: `develop`
4. Cliquer sur **"Create"**

### Étape 2: Configurer les Options (Moins strict que `main`)

#### ✅ Require a pull request before merging
- ✅ **Require approvals:** `1` (une approbation suffit)
- ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require review from Code Owners** (si CODEOWNERS est configuré)

#### ✅ Require status checks to pass before merging
- ✅ **Require branches to be up to date before merging**
- Dans la liste des status checks, sélectionner:
  - `ci-base` (si disponible)
  - `lint` (si disponible)
  - `test` (si disponible)

**Note:** Pas besoin de `build` pour `develop` (moins strict que `main`)

#### ✅ Require conversation resolution before merging
- ✅ Cocher cette option

#### ✅ Include administrators
- ✅ Cocher cette option

#### ✅ Do not allow bypassing the above settings
- ✅ Cocher cette option

### Étape 3: Sauvegarder

Cliquer sur **"Save changes"** en bas de la page.

## 📊 Résumé des Règles

| Option | `main` | `develop` |
|--------|--------|-----------|
| Approvals requis | 2 | 1 |
| Status checks | ci-base, lint, test, build | ci-base, lint, test |
| Conversation resolution | ✅ | ✅ |
| Include administrators | ✅ | ✅ |
| No bypass | ✅ | ✅ |
| Linear history | ✅ | Optionnel |

## ✅ Vérification

Après configuration:

1. Essayer de créer une PR vers `main` ou `develop`
2. Vérifier que les règles s'appliquent:
   - PR requise ✅
   - Approvals requis ✅
   - Status checks requis ✅

## 🔧 Dépannage

### Les status checks n'apparaissent pas

**Cause:** Les workflows GitHub Actions n'ont pas encore été exécutés.

**Solution:**
1. Créer une PR de test
2. Les workflows s'exécuteront automatiquement
3. Les status checks apparaîtront ensuite dans les options

### Impossible de merger même avec approvals

**Cause:** Les status checks ne sont pas encore passés.

**Solution:**
1. Vérifier que tous les workflows GitHub Actions passent
2. Attendre que tous les status checks soient verts ✅

### Besoin de merger en urgence

**Note:** Avec "Do not allow bypassing", même les admins ne peuvent pas contourner.

**Solution temporaire:**
1. Désactiver temporairement la règle (Settings → Branches)
2. Merger
3. Réactiver immédiatement la règle

## 📚 Documentation

- GitHub Docs: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- Guide workflow: `docs/contributing/github-workflow.md`
