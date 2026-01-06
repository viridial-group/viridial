# Guide: Configuration Repository Settings GitHub

## 🎯 Objectif

Configurer les paramètres du repository GitHub pour améliorer la découvrabilité et l'organisation.

## 🔗 Accès Direct

**URL:** https://github.com/viridial-group/viridial/settings

## 📋 Configuration

### 1. General Settings

**URL:** https://github.com/viridial-group/viridial/settings

#### Description

Dans la section **"About"** (en haut de la page Settings):

- **Description:**
  ```
  Viridial - SaaS immobilier multi-tenant avec architecture microservices
  ```

#### Topics (Sujets)

Ajouter les topics suivants pour améliorer la découvrabilité:

```
microservices
saas
real-estate
kubernetes
typescript
nestjs
postgresql
meilisearch
docker
monorepo
multi-tenant
```

**Pour ajouter des topics:**
1. Dans la section "About", cliquer sur l'icône d'engrenage (⚙️)
2. Entrer les topics un par un
3. GitHub suggérera des topics existants
4. Cliquer sur "Save changes"

### 2. Features Settings

**URL:** https://github.com/viridial-group/viridial/settings

Dans la section **"Features"**:

#### ✅ Issues
- **Status:** Activé ✅
- Permet de créer et gérer les issues GitHub
- Nécessaire pour le workflow de développement

#### ✅ Projects
- **Status:** Activé ✅
- Permet de créer des GitHub Projects
- Nécessaire pour la roadmap

#### ❌ Wiki
- **Status:** Désactivé ❌
- Utiliser `docs/` dans le repository à la place
- Plus facile à versionner avec Git

#### ✅ Discussions (Optionnel)
- **Status:** Activé (optionnel)
- Permet les discussions communautaires
- Utile pour les questions générales

#### ✅ Actions
- **Status:** Activé ✅ (par défaut)
- Nécessaire pour les workflows CI/CD

### 3. Security Settings (Optionnel mais Recommandé)

**URL:** https://github.com/viridial-group/viridial/settings/security

#### Dependency Graph
- ✅ Activé par défaut
- Permet de voir les dépendances du projet

#### Dependabot Alerts
- ✅ Activé si `.github/dependabot.yml` est configuré
- Alertes automatiques pour les vulnérabilités

#### Code Scanning
- ✅ Activé si `.github/workflows/codeql.yml` est configuré
- Analyse de sécurité automatique

### 4. Pages Settings (Optionnel)

**URL:** https://github.com/viridial-group/viridial/settings/pages

Si vous voulez héberger la documentation:

- **Source:** `main` branch
- **Folder:** `/docs` ou `/root`
- **Custom domain:** (optionnel)

## ✅ Checklist de Configuration

- [ ] Description ajoutée
- [ ] Topics ajoutés (9 topics recommandés)
- [ ] Issues activé
- [ ] Projects activé
- [ ] Wiki désactivé
- [ ] Discussions activé (optionnel)
- [ ] Actions activé (par défaut)

## 📊 Résumé des Settings

| Feature | Status | Justification |
|---------|--------|---------------|
| Issues | ✅ Activé | Workflow de développement |
| Projects | ✅ Activé | Roadmap et planning |
| Wiki | ❌ Désactivé | Utiliser docs/ dans Git |
| Discussions | ✅ Activé (opt) | Questions communautaires |
| Actions | ✅ Activé | CI/CD workflows |

## 🎯 Après Configuration

Une fois les settings configurés:

1. Le repository sera plus facilement découvrable grâce aux topics
2. La description apparaîtra dans les résultats de recherche GitHub
3. Les features seront configurées pour le workflow de développement

## 📚 Documentation

- GitHub Docs: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features
