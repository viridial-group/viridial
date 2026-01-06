# Search Service

Service de recherche full-text pour Viridial.

## Responsabilités

- Recherche full-text dans Meilisearch
- Filtres avancés (prix, localisation, type, etc.)
- Facettes pour navigation
- Suggestions de recherche

## APIs

- `GET /search` - Recherche simple
- `POST /search` - Recherche avec filtres avancés
- `GET /search/facets` - Obtenir facettes disponibles
- `GET /search/suggestions` - Suggestions de recherche

## Technologies

- **Framework:** NestJS
- **Search Engine:** Meilisearch
- **Cache:** Redis (pour résultats fréquents)

## Stories

- **US-009:** Recherche internationale d'annonces (Public)

## Développement

```bash
cd services/search-service
npm install
npm run start:dev
```

## Tests

```bash
npm test
npm run test:e2e
```

