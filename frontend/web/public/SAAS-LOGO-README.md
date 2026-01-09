# Logo SaaS (Software as a Service) pour Viridial

## 🎨 Description

Logo SVG personnalisé pour SaaS représentant une plateforme cloud/service. Le logo utilise les couleurs vertes de Viridial pour représenter le système projet en tant que service.

## 📁 Fichiers

- **`/public/saas-logo.svg`** - Logo SVG principal
- **`components/ui/SaasLogo.tsx`** - Composant React pour utiliser le logo
- **`components/ui/SaasLogo.module.scss`** - Styles SASS pour le logo

## 🚀 Utilisation

### Import et utilisation basique

```tsx
import { SaasLogo } from '@/components/ui/SaasLogo'

export function MyComponent() {
  return (
    <div>
      <SaasLogo size={48} />
    </div>
  )
}
```

### Options disponibles

```tsx
<SaasLogo
  size={48}              // Taille en pixels (défaut: 48)
  showText={true}        // Afficher le texte "SaaS" (défaut: false)
  animated={true}        // Animation pulse (défaut: false)
  simple={true}         // Version simplifiée sans styles SASS (défaut: false)
  className="custom"    // Classes CSS additionnelles
/>
```

### Variante avec badge

```tsx
import { SaasLogoBadge } from '@/components/ui/SaasLogo'

<SaasLogoBadge
  size={48}
  variant="cloud"    // 'default' | 'active' | 'cloud'
/>
```

## 🎨 Couleurs

Les couleurs Viridial sont utilisées pour représenter le SaaS :

- **Primary** : `#10b981` (Vert Viridial principal)
- **Secondary** : `#059669` (Vert Viridial secondaire)  
- **Dark** : `#047857` (Vert Viridial foncé)
- **Light** : `#34d399` (Vert Viridial clair)
- **Cloud** : `#e0f2fe` (Bleu clair pour cloud)

Ces couleurs sont disponibles dans `styles/_variables.scss` :

```scss
$saas-primary: #10b981;
$saas-secondary: #059669;
$saas-dark: #047857;
$saas-light: #34d399;
$saas-cloud: #e0f2fe;
```

## 💡 Exemples

### Logo simple

```tsx
<SaasLogo size={64} />
```

### Logo avec texte

```tsx
<SaasLogo size={48} showText />
```

### Logo animé

```tsx
<SaasLogo size={48} animated />
```

### Dans le header

```tsx
<SaasLogo size={32} simple />
```

### Dans une carte

```tsx
<div className="card">
  <div className="flex items-center justify-between">
    <SaasLogo size={64} showText />
    <SaasLogoBadge variant="cloud" />
  </div>
  <p>Viridial est une plateforme SaaS pour l'immobilier durable</p>
</div>
```

## 🎯 Signification du logo

- **Nuages (Clouds)** : Représentent les services cloud et la scalabilité
- **Flèche vers le haut** : Indique la croissance et l'expansion
- **Connexions** : Symbolisent les services interconnectés
- **Couleurs vertes** : Lien avec Viridial et l'immobilier durable

## 📐 Spécifications techniques

- **Format** : SVG
- **ViewBox** : `0 0 200 200`
- **Taille recommandée** : 32px - 128px
- **Optimisé pour** : Next.js Image component
- **Support** : Tous les navigateurs modernes

## 🔧 Personnalisation

Pour personnaliser les styles du logo, modifiez `components/ui/SaasLogo.module.scss` :

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

