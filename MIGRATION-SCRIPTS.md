# Migration vers une structure de scripts simplifiée

## ✅ Changements effectués

### 1. Scripts créés

Trois scripts essentiels ont été créés à la racine du projet :

- ✅ **`install.sh`** - Installation complète (dépendances, SASS, configuration)
- ✅ **`start.sh`** - Démarrage simplifié des services
- ✅ **`stop.sh`** - Arrêt simplifié des services

### 2. Scripts supprimés

**55 scripts .sh** ont été supprimés, incluant :
- `scripts/*.sh` (tous les anciens scripts)
- `infrastructure/scripts/*.sh`
- `infrastructure/docker-compose/*.sh`
- `services/auth-service/*.sh`
- `deploy/**/*.sh`
- `docs/stories/scripts/*.sh`

**Exception :** Les fichiers dans `node_modules/` ont été conservés.

### 3. Configuration SASS

✅ SASS ajouté à `frontend/web/package.json`
✅ Variables SASS créées dans `frontend/web/styles/_variables.scss`
✅ Mixins SASS créés dans `frontend/web/styles/_mixins.scss`
✅ Documentation complète ajoutée (`README-SCRIPTS.md` et `EXAMPLE-SASS-USAGE.md`)

## 📋 Nouvelle structure

```
viridial/
├── install.sh              # Installation complète
├── start.sh                # Démarrage des services
├── stop.sh                 # Arrêt des services
├── README-SCRIPTS.md       # Documentation des scripts
├── MIGRATION-SCRIPTS.md    # Ce fichier
├── frontend/
│   └── web/
│       ├── package.json    # SASS inclus
│       ├── styles/
│       │   ├── _variables.scss  # Variables SASS
│       │   └── _mixins.scss     # Mixins SASS
│       └── EXAMPLE-SASS-USAGE.md
└── ...
```

## 🚀 Utilisation

### Installation initiale

```bash
# Local
./install.sh --local

# Production VPS
./install.sh --production
```

### Démarrage

```bash
# Local
./start.sh --local

# Production VPS
./start.sh --production
```

### Arrêt

```bash
# Local
./stop.sh --local

# Production VPS
./stop.sh --production
```

## 🎨 SASS - Utilisation

### Exemple basique

```scss
// components/Button/Button.module.scss
@import '../../styles/variables';

.button {
  background-color: $viridial-primary;
  padding: $spacing-md $spacing-lg;
  
  &:hover {
    background-color: $viridial-secondary;
  }
}
```

```tsx
// components/Button/Button.tsx
import styles from './Button.module.scss'

export function Button() {
  return <button className={styles.button}>Click me</button>
}
```

### Fichiers globaux

```scss
// styles/global.scss
@import './variables';

body {
  font-family: $font-family-sans;
  background-color: $viridial-light;
}
```

```tsx
// app/layout.tsx
import '../styles/global.scss'
```

## 📚 Documentation

- `README-SCRIPTS.md` - Guide complet des scripts
- `frontend/web/EXAMPLE-SASS-USAGE.md` - Exemples d'utilisation SASS
- `MIGRATION-SCRIPTS.md` - Ce fichier (résumé de la migration)

## ⚠️ Notes importantes

1. **Next.js supporte SASS nativement** - Pas besoin de configuration supplémentaire
2. **Compilation automatique** - SASS est compilé automatiquement en dev et production
3. **Compatibilité Tailwind** - SASS et Tailwind peuvent être utilisés ensemble
4. **Modules SASS** - Utilisez `.module.scss` pour les styles locaux aux composants

## 🔄 Migration depuis l'ancienne structure

Si vous utilisiez les anciens scripts, voici les équivalences :

| Ancien Script | Nouveau Script |
|--------------|----------------|
| `scripts/quick-start-local.sh` | `./install.sh --local && ./start.sh --local` |
| `scripts/start-local-services.sh` | `./start.sh --local` |
| `scripts/stop-local-services.sh` | `./stop.sh --local` |
| `scripts/setup-env.sh` | `./install.sh` (inclut la configuration .env) |

## ✅ Checklist post-migration

- [x] Scripts install.sh, start.sh, stop.sh créés et exécutables
- [x] Tous les anciens scripts .sh supprimés
- [x] SASS ajouté au package.json frontend
- [x] Variables et mixins SASS créés
- [x] Documentation complète créée
- [x] Scripts testés (permissions exécutables)

## 🎯 Prochaines étapes

1. Tester l'installation : `./install.sh --local`
2. Tester le démarrage : `./start.sh --local`
3. Vérifier que SASS fonctionne en créant un fichier `.module.scss`
4. Lire la documentation SASS : `frontend/web/EXAMPLE-SASS-USAGE.md`

