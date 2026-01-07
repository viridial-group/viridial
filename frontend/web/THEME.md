# Viridial Design Theme

Ce document décrit le thème de design Viridial appliqué au frontend Next.js, basé sur les prototypes HTML dans `docs/design/prototype/`.

## 🎨 Couleurs

### Couleurs principales
- **Primary**: `#0B1220` - Texte principal, boutons primaires
- **Accent**: `#FF3B30` - CTA principal, actions importantes (rouge vif)
- **Neutral-100**: `#FFFFFF` - Fond blanc
- **Neutral-200**: `#F7F7F9` - Fond de page
- **Neutral-400**: `#E6E7EA` - Bordures
- **Muted**: `#6B7280` - Texte secondaire

### Couleurs sémantiques
- **Success**: `#05C46B` - Succès, validation
- **Danger**: `#EF4444` - Erreurs, suppression
- **Warning**: `#F59E0B` - Avertissements
- **Info**: `#0EA5E9` - Informations
- **Secondary**: `#2563EB` - Actions secondaires

## 📏 Espacement

Basé sur un système de 8px :
- `xs`: 8px
- `sm`: 12px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px

## 🔲 Border Radius

- `sm`: 6px
- `md`: 8px (par défaut)
- `lg`: 12px
- `radius`: 10px (pour les cards)

## 🔤 Typographie

- **Font Family**: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial
- **H1**: 3xl (30px) / semibold
- **H2**: 2xl (24px) / semibold
- **H3**: xl (20px) / semibold
- **Body**: sm (14px) / regular
- **Caption**: xs (12px) / regular

## 🎯 Composants

### Button Variants

Le composant `Button` supporte les variantes suivantes :

- `default`: Fond primary (#0B1220), texte blanc
- `secondary`: Fond bleu (#2563EB), texte blanc
- `success`: Fond vert (#05C46B), texte blanc
- `danger`: Fond rouge (#EF4444), texte blanc
- `warning`: Fond orange (#F59E0B), texte blanc
- `outline`: Bordure, fond transparent
- `light`: Fond blanc, bordure, texte primary
- `ghost`: Pas de bordure, hover subtil
- `accent`: Fond accent (#FF3B30), texte blanc
- `link`: Style lien

### Tailles de boutons

- `sm`: h-8, px-3, text-xs
- `default`: h-10, px-4, text-sm
- `lg`: h-12, px-6, text-base
- `icon`: h-10 w-10, rounded-full

### Card

- Fond: `var(--color-neutral-100)`
- Bordure: `var(--color-neutral-400)`
- Border radius: `10px`
- Ombre: `0 4px 12px rgba(11,18,32,0.04)`

## 📝 Utilisation

### Variables CSS

Toutes les couleurs sont disponibles via des variables CSS dans `app/globals.css` :

```css
background: var(--color-primary);
color: var(--color-accent);
border: 1px solid var(--color-neutral-400);
```

### Classes Tailwind

Les couleurs sont également disponibles via Tailwind :

```tsx
<div className="bg-[var(--color-neutral-200)] text-[var(--color-primary)]">
  Contenu
</div>
```

### Composants shadcn/ui

Les composants shadcn/ui sont configurés pour utiliser automatiquement le thème Viridial via les variables CSS.

## 🎨 Exemples

### Bouton primaire (accent)
```tsx
<Button variant="accent">Se connecter</Button>
```

### Bouton outline
```tsx
<Button variant="outline">Annuler</Button>
```

### Card avec thème
```tsx
<Card className="bg-[var(--color-neutral-100)] border border-[var(--color-neutral-400)]">
  <CardHeader>
    <CardTitle className="text-[var(--color-primary)]">Titre</CardTitle>
  </CardHeader>
</Card>
```

## 📚 Références

- Design tokens: `docs/design/tokens.css`
- Prototypes: `docs/design/prototype/desktop-wide-sample.html`
- Button demo: `docs/design/prototype/buttons-demo.html`

