# Logo SASS pour Viridial

## 🎨 Description

Logo SVG personnalisé pour SASS, intégré dans le projet Viridial. Le logo est inspiré du logo officiel SASS avec des couleurs rose/violette caractéristiques.

## 📁 Fichiers

- **`/public/sass-logo.svg`** - Logo SVG principal
- **`components/ui/SassLogo.tsx`** - Composant React pour utiliser le logo
- **`components/ui/SassLogo.module.scss`** - Styles SASS pour le logo
- **`components/ui/SassLogoDemo.tsx`** - Composant de démonstration

## 🚀 Utilisation

### Import et utilisation basique

```tsx
import { SassLogo } from '@/components/ui/SassLogo'

export function MyComponent() {
  return (
    <div>
      <SassLogo size={48} />
    </div>
  )
}
```

### Options disponibles

```tsx
<SassLogo
  size={48}              // Taille en pixels (défaut: 48)
  showText={true}        // Afficher le texte "SASS" (défaut: false)
  animated={true}        // Animation pulse (défaut: false)
  className="custom"     // Classes CSS additionnelles
/>
```

### Variante avec badge

```tsx
import { SassLogoBadge } from '@/components/ui/SassLogo'

<SassLogoBadge
  size={48}
  variant="installed"    // 'default' | 'active' | 'installed'
/>
```

## 🎨 Couleurs

Les couleurs officielles SASS sont utilisées :

- **Primary** : `#CF649A` (Rose principal)
- **Secondary** : `#C6538C` (Rose secondaire)  
- **Dark** : `#BF4080` (Rose foncé)
- **Light** : `#E91E63` (Rose clair)

Ces couleurs sont disponibles dans `styles/_variables.scss` :

```scss
$sass-primary: #CF649A;
$sass-secondary: #C6538C;
$sass-dark: #BF4080;
$sass-light: #E91E63;
```

## 💡 Exemples

### Logo simple

```tsx
<SassLogo size={64} />
```

### Logo avec texte

```tsx
<SassLogo size={48} showText />
```

### Logo animé

```tsx
<SassLogo size={48} animated />
```

### Dans une carte

```tsx
<div className="card">
  <div className="flex items-center justify-between">
    <SassLogo size={64} showText />
    <SassLogoBadge variant="installed" />
  </div>
  <p>SASS est configuré et prêt à l'emploi</p>
</div>
```

## 🎯 Démonstration

Pour voir toutes les variantes du logo, importez et utilisez le composant de démonstration :

```tsx
import { SassLogoDemo } from '@/components/ui/SassLogoDemo'

export function DemoPage() {
  return <SassLogoDemo />
}
```

## 📐 Spécifications techniques

- **Format** : SVG
- **ViewBox** : `0 0 200 200`
- **Taille recommandée** : 48px - 128px
- **Optimisé pour** : Next.js Image component
- **Support** : Tous les navigateurs modernes

## 🔧 Personnalisation

Pour personnaliser les styles du logo, modifiez `components/ui/SassLogo.module.scss` :

```scss
.logoContainer {
  // Vos styles personnalisés
}

.logo {
  // Animation personnalisée
  &:hover {
    transform: scale(1.2) rotate(10deg);
  }
}
```

## 📝 Notes

- Le logo utilise un gradient linéaire pour un effet visuel moderne
- Les formes géométriques sont inspirées du logo officiel SASS
- Compatible avec le mode sombre via les variables CSS
- Optimisé pour les écrans haute résolution (Retina)

