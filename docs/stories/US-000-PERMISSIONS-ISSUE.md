# US-000: Problème de Permissions GitHub

## 🔍 Diagnostic

Le script `create-github-labels.sh` a détecté un problème de permissions:

- **Repository:** viridial-group/viridial ✅ Existe
- **Authentification:** shicham ✅ OK
- **Permissions:** `pull: true, push: false` ❌ Pas d'écriture

## ⚠️ Impact

Les labels GitHub ne peuvent pas être créés automatiquement car vous n'avez que les permissions de lecture.

## ✅ Solutions

### Option 1: Obtenir les Permissions (Recommandé)

1. Aller sur: https://github.com/viridial-group/viridial/settings/access
2. Si vous êtes owner/admin de l'organisation:
   - Ajouter votre compte (shicham) comme collaborateur
   - Permissions: **Write** (minimum requis)
3. Réessayer: `./scripts/create-github-labels.sh`

### Option 2: Création Manuelle

Suivre le guide: `docs/contributing/create-labels-manually.md`

- Aller sur: https://github.com/viridial-group/viridial/labels
- Créer les 38 labels selon le guide

### Option 3: Demander à un Collaborateur

Si vous n'êtes pas owner, demander à un collaborateur avec permissions Write d'exécuter:
```bash
./scripts/create-github-labels.sh
```

## 📊 État Actuel

- ✅ Git initialisé et commit créé
- ✅ Repository GitHub existe
- ✅ Authentification GitHub CLI OK
- ⚠️  Permissions d'écriture manquantes
- ⏳ Labels à créer (manuellement ou après obtention permissions)

## 🚀 Prochaines Étapes

1. **Résoudre les permissions** (Option 1 ou 3)
2. **Créer les labels** (automatique ou manuel)
3. **Créer les milestones**: `./scripts/create-github-milestones.sh`
4. **Configurer branch protection** (GitHub UI)
5. **Créer GitHub Project** (GitHub UI)

## 📝 Note

Les autres tâches de US-000 peuvent continuer même sans les labels. Les labels peuvent être créés plus tard.
