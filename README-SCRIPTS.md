# Scripts Viridial - Structure Simplifiée

Ce projet utilise maintenant une structure simplifiée avec seulement 3 scripts essentiels pour l'installation, le démarrage et l'arrêt des services.

## 📋 Scripts Disponibles

### 1. `install.sh` - Installation

Script d'installation complète qui :
- ✅ Vérifie les prérequis (Node.js, npm, Docker)
- ✅ Configure les fichiers `.env`
- ✅ Installe toutes les dépendances (frontend + backend)
- ✅ Installe et configure **SASS** pour le frontend
- ✅ Configure Docker (réseau, variables d'environnement)

**Usage :**

```bash
# Installation locale (développement)
./install.sh --local

# Installation production (VPS)
./install.sh --production
```

**Fonctionnalités SASS :**
- SASS est automatiquement installé dans `frontend/web`
- Support natif dans Next.js (fichiers `.scss` et `.sass`)
- Compilation automatique en développement et production

### 2. `start.sh` - Démarrage

Script de démarrage simplifié qui :
- ✅ Démarre tous les services Docker (local)
- ✅ Démarre le frontend Next.js avec SASS (local)
- ✅ Utilise PM2 pour la production (VPS)

**Usage :**

```bash
# Démarrage local (développement)
./start.sh --local

# Démarrage production (VPS)
./start.sh --production
```

**Services démarrés :**
- 🌐 Frontend Next.js (http://localhost:3000)
- 🔐 Auth Service (http://localhost:8080)
- 🏠 Property Service (http://localhost:3001)
- 📍 Geolocation Service (http://localhost:3002)
- 🔍 Search Service (http://localhost:3003)
- 🗄️ Postgres (localhost:5432)
- 🔴 Redis (localhost:6379)
- 🔎 Meilisearch (http://localhost:7700)
- 📦 MinIO (http://localhost:9000)

### 3. `stop.sh` - Arrêt

Script d'arrêt simplifié qui :
- ✅ Arrête tous les services Docker (local)
- ✅ Arrête le frontend Next.js (local)
- ✅ Arrête PM2 services (production)

**Usage :**

```bash
# Arrêt local (développement)
./stop.sh --local

# Arrêt production (VPS)
./stop.sh --production
```

## 🎨 Utilisation de SASS

### Configuration

SASS est déjà configuré dans le projet. Vous pouvez l'utiliser directement :

1. **Importer un fichier SASS dans vos composants :**

```tsx
// app/my-page/page.tsx
import styles from './my-page.module.scss'

export default function MyPage() {
  return <div className={styles.container}>Content</div>
}
```

2. **Créer un fichier SASS :**

```scss
// app/my-page/my-page.module.scss
.container {
  padding: 2rem;
  
  .title {
    color: #10b981;
    font-size: 2rem;
  }
  
  &:hover {
    background-color: #f0fdfa;
  }
}
```

### Fichiers SASS globaux

Vous pouvez créer des fichiers SASS globaux dans `frontend/web/app/` :

```scss
// app/globals.scss (ou globals.sass)
$primary-color: #10b981;
$secondary-color: #059669;

body {
  font-family: 'Inter', sans-serif;
  background-color: #f0fdfa;
}
```

Puis les importer dans `app/layout.tsx` :

```tsx
import './globals.scss'
```

### Compilation

- **Développement :** Compilation automatique avec `npm run dev`
- **Production :** Compilation automatique avec `npm run build`

SASS est compilé en CSS optimisé lors du build de production.

## 🚀 Workflow Complet

### Premier démarrage (local)

```bash
# 1. Installation complète
./install.sh --local

# 2. Vérifier que .env est configuré
cat .env

# 3. Démarrer tous les services
./start.sh --local

# 4. Accéder au frontend
open http://localhost:3000
```

### Production (VPS)

```bash
# 1. Installation production
./install.sh --production

# 2. Configurer les variables d'environnement
nano .env

# 3. Démarrer les services
./start.sh --production

# 4. Vérifier l'état avec PM2
pm2 status
pm2 logs
```

### Arrêt

```bash
# Arrêter tous les services
./stop.sh --local  # ou --production
```

## 📁 Structure Simplifiée

```
viridial/
├── install.sh          # Installation complète
├── start.sh            # Démarrage des services
├── stop.sh             # Arrêt des services
├── .env                # Variables d'environnement principales
├── frontend/
│   └── web/
│       ├── package.json    # SASS inclus
│       ├── app/
│       │   └── *.scss      # Fichiers SASS
│       └── ...
└── services/
    └── ...
```

## 🔧 Configuration SASS

### Variables SASS personnalisées

Créez un fichier de variables partagées :

```scss
// frontend/web/styles/_variables.scss
$viridial-primary: #10b981;
$viridial-secondary: #059669;
$viridial-dark: #064e3b;
$spacing-unit: 1rem;
```

Importez-le dans vos fichiers :

```scss
// frontend/web/components/Button/Button.module.scss
@import '../styles/variables';

.button {
  background-color: $viridial-primary;
  padding: $spacing-unit * 2;
}
```

### Mixins SASS

Créez des mixins réutilisables :

```scss
// frontend/web/styles/_mixins.scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin responsive($breakpoint) {
  @if $breakpoint == mobile {
    @media (max-width: 768px) {
      @content;
    }
  }
}
```

## 📝 Notes Importantes

1. **SASS est natif dans Next.js** : Pas besoin de configuration supplémentaire
2. **Modules SASS** : Utilisez `.module.scss` pour le style local aux composants
3. **Fichiers globaux** : Importez `.scss` directement dans `layout.tsx`
4. **Variables CSS** : Compatible avec les variables CSS de Tailwind

## 🐛 Dépannage

### SASS non compilé

```bash
cd frontend/web
npm install sass
npm run dev
```

### Erreur de permission

```bash
chmod +x install.sh start.sh stop.sh
```

### Docker non démarré (local)

Assurez-vous que Docker Desktop est démarré avant d'exécuter `start.sh`.

## 📚 Ressources

- [Next.js - SASS Support](https://nextjs.org/docs/app/building-your-application/styling/sass)
- [SASS Documentation](https://sass-lang.com/documentation)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

