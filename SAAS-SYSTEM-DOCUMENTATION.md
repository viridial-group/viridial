# SaaS - Software as a Service (Viridial)

## 📋 Clarification

**SaaS** = **Software as a Service** (Logiciel en tant que Service)

Viridial est une **plateforme SaaS** pour l'immobilier durable. Le logo SaaS représente le système projet en tant que service cloud.

## 🎨 Logo SaaS créé

- **Fichier** : `frontend/web/public/saas-logo.svg`
- **Composant** : `frontend/web/components/ui/SaasLogo.tsx`
- **Styles** : `frontend/web/components/ui/SaasLogo.module.scss`

### Design du logo

- **Nuages** : Représentent les services cloud et la scalabilité
- **Flèche vers le haut** : Croissance et expansion du service
- **Connexions** : Services interconnectés dans le cloud
- **Couleurs vertes Viridial** : Identité de marque du système

## 🚀 Intégration dans le Header

Le logo SaaS est intégré dans le header pour indiquer que Viridial est une plateforme SaaS :

- **Desktop (XL)** : Logo 32px visible à droite, dans les actions
- **Mobile (MD)** : Logo 24px visible avant le bouton menu
- **Mobile (< MD)** : Logo masqué pour économiser l'espace

## 💡 Utilisation

### Dans le header

```tsx
import { SaasLogo } from '@/components/ui/SaasLogo'

<SaasLogo size={32} simple />
```

### Dans une carte/badge

```tsx
import { SaasLogoBadge } from '@/components/ui/SaasLogo'

<SaasLogoBadge variant="cloud" />
```

### Variantes de badge

- `default` : Badge gris "SaaS"
- `active` : Badge vert "ACTIVE"
- `cloud` : Badge bleu "CLOUD"

## 🎨 Couleurs SaaS

Variables disponibles dans `styles/_variables.scss` :

```scss
$saas-primary: #10b981;    // Vert Viridial principal
$saas-secondary: #059669;  // Vert Viridial secondaire
$saas-dark: #047857;       // Vert Viridial foncé
$saas-light: #34d399;      // Vert Viridial clair
$saas-cloud: #e0f2fe;      // Bleu clair pour cloud
```

## 📝 Note importante

**Distinction importante :**

- **SASS** (Syntactically Awesome Style Sheets) = Préprocesseur CSS utilisé pour les styles
- **SaaS** (Software as a Service) = Modèle de service cloud représenté par le logo

Les deux coexistent dans le projet :
- **SASS** pour les styles CSS (`.scss` files)
- **SaaS** pour le branding de la plateforme (logo et composants)

## 📚 Documentation

- Logo SaaS : `/public/SAAS-LOGO-README.md`
- Styles SASS : `/EXAMPLE-SASS-USAGE.md`

