# Shared - Code Partagé

Ce dossier contient le code partagé entre les microservices et les applications frontend.

## Structure

### types/
Types TypeScript partagés entre services et frontend:
- `Property.ts` - Types pour propriétés
- `User.ts` - Types pour utilisateurs
- `Organization.ts` - Types pour organisations
- `Lead.ts` - Types pour leads
- `Subscription.ts` - Types pour abonnements
- etc.

### utils/
Utilitaires partagés:
- Validation helpers
- Formatting (dates, prix, etc.)
- Date helpers
- String manipulation
- etc.

### contracts/
Contrats API OpenAPI/Swagger:
- `auth-service.yaml` - API auth-service
- `property-service.yaml` - API property-service
- `search-service.yaml` - API search-service
- `lead-service.yaml` - API lead-service
- `billing-service.yaml` - API billing-service
- `admin-service.yaml` - API admin-service

## Utilisation

### Dans un Service Backend

```typescript
// Importer types partagés
import { Property, User } from '@viridial/shared/types';

// Importer utils
import { formatPrice, validateEmail } from '@viridial/shared/utils';
```

### Dans Frontend

```typescript
// Importer types partagés
import { Property, User } from '@/shared/types';

// Importer utils
import { formatDate } from '@/shared/utils';
```

## Conventions

- **Types:** Interfaces TypeScript strictes
- **Utils:** Fonctions pures, testables
- **Contracts:** OpenAPI 3.0 specs

## Versioning

Les types et utils partagés doivent être rétro-compatibles.
Pour breaking changes, créer une nouvelle version majeure.

