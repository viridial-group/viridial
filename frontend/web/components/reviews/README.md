# Composants d'Avis - Documentation

## Vue d'ensemble

Cette section contient tous les composants React pour afficher et gérer les avis sur les propriétés, villes, quartiers et pays. Les composants sont inspirés des meilleures pratiques de Google Reviews, Airbnb et TripAdvisor.

## Installation des Dépendances

Avant d'utiliser ces composants, assurez-vous d'avoir installé les dépendances nécessaires:

```bash
cd frontend/web
npm install
# ou
pnpm install
```

### Dépendances requises

- `next`: Framework React
- `react`: Bibliothèque React
- `lucide-react`: Icônes
- `date-fns`: Formatage des dates (optionnel, fallback inclus)

## Variables d'Environnement

Ajoutez à votre fichier `.env.local`:

```env
NEXT_PUBLIC_REVIEW_API_URL=http://localhost:3005
```

## Utilisation

### Exemple Basique - Page de Propriété

```tsx
'use client';

import { ReviewSection } from '@/components/reviews/ReviewSection';
import { ReviewEntityType } from '@/lib/api/review';
import { useAuth } from '@/hooks/use-auth'; // Votre hook d'authentification

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth(); // Récupérer l'utilisateur connecté
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Détails de la Propriété</h1>
      
      {/* Autres contenus de la page */}
      
      {/* Section Avis */}
      <section className="mt-12" id="reviews">
        <ReviewSection
          entityType={ReviewEntityType.PROPERTY}
          entityId={params.id}
          currentUserId={user?.id}
          showForm={true}
        />
      </section>
    </div>
  );
}
```

### Exemple - Page de Ville

```tsx
'use client';

import { ReviewSection } from '@/components/reviews/ReviewSection';
import { ReviewEntityType } from '@/lib/api/review';

export default function CityDetailPage({ params }: { params: { slug: string } }) {
  const cityId = 'city-uuid-from-api';
  const userId = 'user-id-from-auth';
  
  return (
    <ReviewSection
      entityType={ReviewEntityType.CITY}
      entityId={cityId}
      currentUserId={userId}
      showForm={true}
    />
  );
}
```

### Utilisation Avancée - Composants Individuels

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ReviewStats } from '@/components/reviews/ReviewStats';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { useReviews } from '@/hooks/use-reviews';
import { ReviewEntityType } from '@/lib/api/review';

export default function CustomReviewPage() {
  const [showForm, setShowForm] = useState(false);
  const {
    reviews,
    stats,
    loading,
    total,
    page,
    setPage,
    fetchReviews,
    createReview,
    vote,
  } = useReviews({
    entityType: ReviewEntityType.PROPERTY,
    entityId: 'property-id',
    autoFetch: true,
  });

  return (
    <div>
      {/* Stats */}
      <ReviewStats stats={stats} loading={loading} />
      
      {/* Form */}
      {showForm && (
        <ReviewForm
          entityType={ReviewEntityType.PROPERTY}
          entityId="property-id"
          onSubmit={async (data) => {
            await createReview(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
      
      {/* List */}
      <ReviewList
        reviews={reviews}
        loading={loading}
        total={total}
        page={page}
        onPageChange={(newPage) => {
          setPage(newPage);
          fetchReviews();
        }}
        onVote={vote}
      />
    </div>
  );
}
```

## Composants Disponibles

### ReviewSection

Composant d'intégration principal qui combine tous les autres composants.

**Props:**
- `entityType`: ReviewEntityType (PROPERTY, CITY, NEIGHBORHOOD, COUNTRY)
- `entityId`: string - ID de l'entité
- `currentUserId?`: string - ID de l'utilisateur connecté (optionnel)
- `showForm?`: boolean - Afficher le formulaire de création (défaut: true)

### ReviewCard

Affiche un avis individuel avec toutes ses informations.

**Props:**
- `review`: Review - Objet avis
- `currentUserId?`: string - ID de l'utilisateur connecté
- `onVote?`: (reviewId: string, voteType: 'helpful' | 'not_helpful') => void
- `onEdit?`: (review: Review) => void
- `onDelete?`: (reviewId: string) => void
- `onRespond?`: (review: Review) => void
- `showEntityInfo?`: boolean

### ReviewList

Liste paginée des avis avec filtres.

**Props:**
- `reviews`: Review[] - Liste des avis
- `loading?`: boolean
- `total?`: number
- `page?`: number
- `limit?`: number
- `currentUserId?`: string
- `onVote?`, `onEdit?`, `onDelete?`, `onRespond?`: Handlers
- `onPageChange?`: (page: number) => void
- `onFilterChange?`: (filters: any) => void
- `showFilters?`: boolean

### ReviewStats

Affiche les statistiques d'avis (note moyenne, distribution, etc.).

**Props:**
- `stats`: ReviewStats | null
- `loading?`: boolean

### ReviewFilters

Filtres et tri pour les avis.

**Props:**
- `filters`: ReviewFilters
- `onFilterChange`: (filters: ReviewFilters) => void
- `totalReviews?`: number

### ReviewForm

Formulaire de création/modification d'avis.

**Props:**
- `entityType`: ReviewEntityType
- `entityId`: string
- `review?`: Review - Pour édition (optionnel)
- `onSubmit`: (review: CreateReviewRequest | UpdateReviewRequest) => Promise<void>
- `onCancel?`: () => void
- `loading?`: boolean

## Hook useReviews

Hook personnalisé pour gérer l'état et les actions des avis.

```tsx
const {
  reviews,        // Review[] - Liste des avis
  stats,          // ReviewStats | null - Statistiques
  loading,        // boolean - État de chargement
  error,          // string | null - Erreur éventuelle
  total,          // number - Nombre total d'avis
  page,           // number - Page actuelle
  limit,          // number - Nombre d'avis par page
  setPage,        // (page: number) => void
  fetchReviews,   // (filters?: ReviewFilters) => Promise<void>
  fetchStats,     // () => Promise<void>
  createReview,   // (review: CreateReviewRequest) => Promise<Review>
  updateReview,   // (id: string, review: UpdateReviewRequest) => Promise<Review>
  removeReview,   // (id: string) => Promise<void>
  vote,           // (reviewId: string, voteType: 'helpful' | 'not_helpful') => Promise<void>
  unvote,         // (reviewId: string, voteType: 'helpful' | 'not_helpful') => Promise<void>
} = useReviews({
  entityType: ReviewEntityType.PROPERTY,
  entityId: 'property-id',
  autoFetch: true, // Charger automatiquement au montage
});
```

## Styling

Les composants utilisent Tailwind CSS et suivent le système de design existant du projet. Ils sont responsive et adaptés aux différentes tailles d'écran.

## Personnalisation

Pour personnaliser l'apparence, vous pouvez:
1. Modifier les classes Tailwind dans les composants
2. Ajouter vos propres variantes dans `components/ui/`
3. Créer des thèmes personnalisés via CSS variables

## Accessibilité

- Support du clavier pour toutes les interactions
- Labels ARIA appropriés
- Contraste de couleurs conforme WCAG
- Support des lecteurs d'écran

## Performance

- Mémoisation des composants avec `memo()`
- Pagination côté serveur
- Chargement paresseux des images
- Optimisation des re-renders avec `useCallback`

## Notes

- Les photos doivent être hébergées sur un service externe (URLs complètes)
- L'authentification JWT est gérée automatiquement via `localStorage.getItem('auth_token')`
- Les dates sont formatées avec un fallback si `date-fns` n'est pas installé
- Les composants gèrent automatiquement les états de chargement et d'erreur

