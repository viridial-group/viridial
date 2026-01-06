# US-009: Recherche internationale d’annonces (Public)

## Status: Draft

### Story
En tant que visiteur, je veux rechercher des biens immobiliers par texte, lieu et filtres (prix, type, pays) pour trouver rapidement des annonces pertinentes dans ma langue.

### Acceptance Criteria
- Recherche full‑text via Meilisearch index `properties`.
- Filtres facettés: country, property_type, price range.
- Autocomplete (suggestions) sur champ `title` et `address.city`.
- Résultats respectent préférence langue (Accept‑Language) et permettent pagination.

Additional Acceptance Criteria & Geo features:
- Support geo‑queries: radius search (lat/lon + distance), bbox filter, and distance sorting.
- Index properties with geo_point field and precomputed numeric boosts for region relevance.
- Map clustering support for front‑end (tile aggregation or server clusters for large result sets).
- Faceted counts should be accurate for filtered geo areas (e.g., within radius).
- Search result includes snippet translations where available and fallback to default locale.

**Priority:** P0
**Estimation:** 8

### Tasks
- [ ] Meilisearch indexing on property publish
- [ ] Search API endpoint `/api/search/properties`
- [ ] Frontend search UI + autocomplete
- [ ] Tests e2e search relevance
- [ ] Geo indexing and radius/bbox query support
- [ ] Server clustering logic or precomputed tiles for map view
- [ ] Relevance tuning for locale + proximity boosting

### QA Scenarios (Gherkin)
#### Scenario: Radius search returns nearby properties sorted by distance
Given the index contains properties with coordinates near lat=48.8566,lon=2.3522
When I query `/api/search/properties?lat=48.8566&lon=2.3522&radius=5km`
Then results should only include properties within 5 km and be ordered by ascending distance

#### Scenario: Autocomplete respects locale
Given the index has a property titled "Appartement cosy"
When I call the autocomplete endpoint with Accept-Language: fr
Then the suggestion should include "Appartement cosy"

