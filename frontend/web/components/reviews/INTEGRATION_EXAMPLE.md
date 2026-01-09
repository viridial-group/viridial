# Exemple d'Intégration - ReviewSection

Ce guide montre comment intégrer le composant `ReviewSection` dans vos pages pour afficher les avis des utilisateurs.

## Exemple 1: Page de Détail d'une Propriété

```tsx
'use client';

import React from 'react';
import { ReviewSection } from '@/components/reviews/ReviewSection';
import { ReviewEntityType } from '@/lib/api/review';
import { useAuth } from '@/hooks/use-auth';

interface PropertyDetailPageProps {
  propertyId: string;
}

const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ propertyId }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Autres sections de la page (galerie, description, etc.) */}
      
      <section className="mt-12 border-t pt-8">
        <ReviewSection
          entityType={ReviewEntityType.PROPERTY}
          entityId={propertyId}
          currentUserId={isAuthenticated ? user?.id : undefined}
        />
      </section>
    </div>
  );
};

export default PropertyDetailPage;
```

## Exemple 2: Page de Détail d'une Ville

```tsx
'use client';

import React from 'react';
import { ReviewSection } from '@/components/reviews/ReviewSection';
import { ReviewEntityType } from '@/lib/api/review';

interface CityDetailPageProps {
  cityId: string;
}

const CityDetailPage: React.FC<CityDetailPageProps> = ({ cityId }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Avis sur la Ville</h1>
      
      <ReviewSection
        entityType={ReviewEntityType.CITY}
        entityId={cityId}
      />
    </div>
  );
};

export default CityDetailPage;
```

## Exemple 3: Intégration avec un Hook Personnalisé

```tsx
'use client';

import React from 'react';
import { ReviewSection } from '@/components/reviews/ReviewSection';
import { ReviewEntityType } from '@/lib/api/review';
import { useProperty } from '@/hooks/use-property'; // Votre hook existant

interface PropertyDetailPageProps {
  propertyId: string;
}

const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ propertyId }) => {
  const { property, isLoading } = useProperty(propertyId);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!property) {
    return <div>Propriété non trouvée</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{property.title}</h1>
      <p className="text-gray-600 mb-8">{property.description}</p>

      {/* Section des avis */}
      <section className="mt-12 border-t pt-8">
        <ReviewSection
          entityType={ReviewEntityType.PROPERTY}
          entityId={property.id}
        />
      </section>
    </div>
  );
};

export default PropertyDetailPage;
```

## Exemple 4: Avec Callbacks Personnalisés

```tsx
'use client';

import React, { useState } from 'react';
import { ReviewSection } from '@/components/reviews/ReviewSection';
import { ReviewEntityType } from '@/lib/api/review';
import { toast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

interface PropertyDetailPageProps {
  propertyId: string;
}

const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({ propertyId }) => {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReviewCreated = () => {
    toast({
      title: 'Avis créé',
      description: 'Votre avis a été soumis avec succès et est en attente de modération.',
      variant: 'success',
    });
    setRefreshKey((prev) => prev + 1); // Force refresh si nécessaire
  };

  const handleReviewUpdated = () => {
    toast({
      title: 'Avis mis à jour',
      description: 'Votre avis a été mis à jour avec succès.',
      variant: 'success',
    });
  };

  const handleReviewDeleted = () => {
    toast({
      title: 'Avis supprimé',
      description: 'Votre avis a été supprimé avec succès.',
      variant: 'success',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ReviewSection
        key={refreshKey} // Force re-render si nécessaire
        entityType={ReviewEntityType.PROPERTY}
        entityId={propertyId}
        onReviewCreated={handleReviewCreated}
        onReviewUpdated={handleReviewUpdated}
        onReviewDeleted={handleReviewDeleted}
      />
    </div>
  );
};

export default PropertyDetailPage;
```

## Props du Composant ReviewSection

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| `entityType` | `ReviewEntityType` | ✅ | Type d'entité (PROPERTY, CITY, NEIGHBORHOOD, COUNTRY) |
| `entityId` | `string` | ✅ | ID unique de l'entité |
| `currentUserId` | `string \| undefined` | ❌ | ID de l'utilisateur actuel (pour les actions personnalisées) |
| `onReviewCreated` | `() => void` | ❌ | Callback appelé après création d'un avis |
| `onReviewUpdated` | `() => void` | ❌ | Callback appelé après mise à jour d'un avis |
| `onReviewDeleted` | `() => void` | ❌ | Callback appelé après suppression d'un avis |

## Types d'Entités Disponibles

```typescript
enum ReviewEntityType {
  PROPERTY = 'property',
  CITY = 'city',
  NEIGHBORHOOD = 'neighborhood',
  COUNTRY = 'country',
}
```

## Notes Importantes

1. **Authentification**: Le composant gère automatiquement l'authentification via le hook `useAuth`. Les utilisateurs non connectés peuvent voir les avis mais ne peuvent pas en créer.

2. **Pagination**: La pagination est gérée automatiquement par le composant. Les utilisateurs peuvent naviguer entre les pages d'avis.

3. **Filtres**: Les filtres sont persistants dans l'URL si vous utilisez `useSearchParams` de Next.js. Vous pouvez personnaliser ce comportement si nécessaire.

4. **Performance**: Le composant utilise `React.memo` pour optimiser les re-renders. Les données sont mises en cache via React Query.

5. **Accessibilité**: Tous les composants sont accessibles au clavier et aux lecteurs d'écran.

## Personnalisation

Si vous souhaitez personnaliser l'apparence ou le comportement du composant, vous pouvez:

1. Modifier les styles dans `ReviewCard.tsx`, `ReviewFilters.tsx`, etc.
2. Créer une variante personnalisée en copiant et modifiant les composants
3. Utiliser les callbacks pour ajouter votre propre logique métier

## Support

Pour toute question ou problème, consultez:
- `README.md` - Documentation générale des composants
- `docs/review-service-features-summary.md` - Résumé des fonctionnalités
- `services/review-service/README.md` - Documentation de l'API backend

