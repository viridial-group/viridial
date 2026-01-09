# Guide d'utilisation SASS dans Viridial

Ce guide montre comment utiliser SASS dans le projet Viridial avec Next.js.

![SASS Logo](/sass-logo.svg)

## 🎨 Logo SASS

Un logo SVG personnalisé pour SASS est disponible dans le projet :

- **SVG Logo** : `/public/sass-logo.svg`
- **Composant React** : `components/ui/SassLogo.tsx`
- **Styles SASS** : `components/ui/SassLogo.module.scss`

### Utilisation du logo

```tsx
import { SassLogo, SassLogoBadge } from '@/components/ui/SassLogo'

// Logo simple
<SassLogo size={48} />

// Logo avec texte
<SassLogo size={48} showText />

// Logo animé
<SassLogo size={48} animated />

// Logo avec badge
<SassLogoBadge variant="installed" />
```

### Couleurs SASS disponibles

Les couleurs officielles SASS sont disponibles dans `styles/_variables.scss` :

```scss
$sass-primary: #CF649A;    // Rose principal
$sass-secondary: #C6538C;  // Rose secondaire
$sass-dark: #BF4080;       // Rose foncé
$sass-light: #E91E63;      // Rose clair
```

## 📁 Structure des fichiers SASS

```
frontend/web/
├── styles/
│   ├── _variables.scss      # Variables SASS partagées
│   ├── _mixins.scss          # Mixins réutilisables
│   └── ...
├── app/
│   ├── globals.css           # Styles globaux (Tailwind)
│   ├── my-page/
│   │   ├── page.tsx
│   │   └── my-page.module.scss  # Styles SASS pour ce composant
│   └── ...
└── components/
    └── Button/
        ├── Button.tsx
        └── Button.module.scss   # Styles SASS pour ce composant
```

## 🎨 Utilisation de base

### 1. Créer un fichier SASS module (style local)

```scss
// components/Button/Button.module.scss
@import '../../styles/variables';
@import '../../styles/mixins';

.button {
  @include button-base;
  background-color: $viridial-primary;
  color: white;
  padding: $spacing-md $spacing-lg;
  
  &:hover {
    background-color: $viridial-secondary;
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  // Variants
  &.secondary {
    background-color: $viridial-secondary;
  }
  
  &.outline {
    background-color: transparent;
    border: 2px solid $viridial-primary;
    color: $viridial-primary;
  }
  
  // Responsive
  @include mobile {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-sm;
  }
}
```

### 2. Utiliser le style dans le composant

```tsx
// components/Button/Button.tsx
import styles from './Button.module.scss'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button 
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

## 🎯 Utilisation avancée

### 1. Variables SASS personnalisées

```scss
// app/property/PropertyCard.module.scss
@import '../../styles/variables';

.propertyCard {
  @include card;
  transition: all 0.3s ease;
  
  .image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: $radius-md;
  }
  
  .title {
    color: $viridial-dark;
    font-size: $font-size-xl;
    margin: $spacing-md 0;
  }
  
  .price {
    color: $viridial-primary;
    font-weight: 600;
    font-size: $font-size-2xl;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
  }
}
```

### 2. Mixins personnalisés

```scss
// app/search/SearchBar.module.scss
@import '../../styles/variables';
@import '../../styles/mixins';

.searchBar {
  @include flex-center;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  
  .input {
    flex: 1;
    padding: $spacing-md;
    border: 2px solid #e5e7eb;
    border-radius: $radius-md;
    
    &:focus {
      outline: none;
      border-color: $viridial-primary;
    }
  }
  
  .button {
    @include button-base;
    background-color: $viridial-primary;
    color: white;
  }
  
  @include mobile {
    flex-direction: column;
    gap: $spacing-sm;
  }
}
```

### 3. Fichiers SASS globaux

Pour des styles globaux, vous pouvez créer un fichier `.scss` et l'importer dans `app/layout.tsx` :

```scss
// styles/global.scss
@import './variables';

* {
  box-sizing: border-box;
}

body {
  font-family: $font-family-sans;
  color: $viridial-dark;
  background-color: $viridial-light;
}

a {
  color: $viridial-primary;
  text-decoration: none;
  
  &:hover {
    color: $viridial-secondary;
    text-decoration: underline;
  }
}
```

Puis dans `app/layout.tsx` :

```tsx
import '../styles/global.scss'
// ... autres imports
```

## 📱 Responsive Design avec SASS

```scss
// components/Header/Header.module.scss
@import '../../styles/variables';
@import '../../styles/mixins';

.header {
  @include container;
  @include flex-between;
  padding: $spacing-lg 0;
  
  .logo {
    font-size: $font-size-2xl;
    color: $viridial-primary;
  }
  
  .nav {
    @include flex-center;
    gap: $spacing-lg;
    
    @include mobile {
      display: none;
    }
  }
  
  .mobileMenu {
    display: none;
    
    @include mobile {
      display: block;
    }
  }
}
```

## 🎨 Compatibilité avec Tailwind

Vous pouvez utiliser SASS et Tailwind ensemble :

```tsx
// Composant avec classes Tailwind + SASS module
import styles from './MyComponent.module.scss'

export function MyComponent() {
  return (
    <div className={`${styles.customStyle} bg-white p-4 rounded-lg`}>
      {/* Contenu */}
    </div>
  )
}
```

## 🚀 Compilation

### Développement

```bash
npm run dev
```

SASS est compilé automatiquement lors du développement.

### Production

```bash
npm run build
```

SASS est compilé en CSS optimisé et minifié pour la production.

## 📝 Bonnes pratiques

1. **Utilisez des modules SASS** (`.module.scss`) pour le style local aux composants
2. **Utilisez des variables SASS** pour les valeurs réutilisables
3. **Créez des mixins** pour les patterns CSS répétitifs
4. **Organisez vos fichiers** : un fichier SASS par composant ou page
5. **Combine SASS et Tailwind** : utilisez Tailwind pour les utilitaires, SASS pour les styles complexes

## 🔍 Exemple complet

```scss
// app/property/[id]/PropertyDetail.module.scss
@import '../../../styles/variables';
@import '../../../styles/mixins';

.propertyDetail {
  @include container;
  padding: $spacing-2xl 0;
  
  .header {
    margin-bottom: $spacing-xl;
    
    .title {
      font-size: $font-size-3xl;
      color: $viridial-dark;
      margin-bottom: $spacing-md;
      
      @include mobile {
        font-size: $font-size-2xl;
      }
    }
    
    .price {
      font-size: $font-size-2xl;
      color: $viridial-primary;
      font-weight: 600;
    }
  }
  
  .gallery {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-md;
    margin-bottom: $spacing-xl;
    
    @include mobile {
      grid-template-columns: 1fr;
    }
    
    .image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: $radius-lg;
      
      &:hover {
        transform: scale(1.05);
        transition: transform 0.3s ease;
      }
    }
  }
  
  .description {
    @include card;
    margin-bottom: $spacing-xl;
    
    p {
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: $spacing-md;
    }
  }
  
  .actions {
    @include flex-center;
    gap: $spacing-md;
    
    .button {
      @include button-base;
      padding: $spacing-md $spacing-xl;
      
      &.primary {
        background-color: $viridial-primary;
        color: white;
      }
      
      &.secondary {
        background-color: transparent;
        border: 2px solid $viridial-primary;
        color: $viridial-primary;
      }
    }
  }
}
```

## 🎯 Ressources

- [Next.js SASS Documentation](https://nextjs.org/docs/app/building-your-application/styling/sass)
- [SASS Documentation](https://sass-lang.com/documentation)
- [SASS Variables](https://sass-lang.com/documentation/variables)
- [SASS Mixins](https://sass-lang.com/documentation/at-rules/mixin)

