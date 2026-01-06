# US-019: Système de géolocalisation (Geocoding / Reverse Geocoding)

## Status: Draft

### Story
En tant que product owner et développeur, je veux un service de géolocalisation centralisé (geocode/reverse) pour normaliser les adresses, obtenir lat/lon, et supporter les recherches par rayon et heatmap afin d'améliorer la qualité des annonces et la pertinence des recherches.

### Acceptance Criteria
- Service centralisé (microservice or module) qui reçoit une adresse et renvoie latitude/longitude et composantes d'adresse normalisées.
- Reverse geocoding: à partir de lat/lon récupérer composantes d'adresse.
- Caching layer (Redis) pour résultats geocode afin d'éviter surcoûts API et rate limits.
- Support batch geocoding pour imports (CSV) avec job reporting et re‑try.
- Tolerance & validation: flag les adresses ambiguës, propose suggestions et validation manuelle via l'UI.
- Expose API pour calculer distance entre deux points et pour rechercher propriétés dans un rayon (km) avec pagination.
- Tests d'intégration simulant un provider (Nominatim, Google Geocoding, or Mapbox) via stub.

**Priority:** P0
**Estimation:** 5

### Tasks
- [ ] Design API: `/geocode`, `/reverse`, `/distance`, `/search/nearby`.
- [ ] Integrate provider adapter pattern (configurable provider, with offline stub).
- [ ] Implement caching (Redis) with TTL and cache keys normalized by address or coordinates.
- [ ] Batch job for CSV import with validation and partial success report.
- [ ] UI: address validation suggestions and manual correction workflow for flagged addresses.
- [ ] Indexing sync: ensure property publishes trigger geocode if lat/lon absent and update search index.
- [ ] Tests: unit + integration with provider stubs and batch job tests.

### QA Scenarios (Gherkin)
#### Scenario: Geocode an address and store lat/lon
Given the geocode provider returns lat=48.8566 and lon=2.3522 for "10 Rue Exemple, Paris"
When the API `/geocode` is called with that address
Then the response contains `latitude=48.8566` and `longitude=2.3522`

#### Scenario: Batch import geocodes and report
Given a CSV import with three addresses
When the batch job runs
Then the job report contains counts: successes, failures, and retryable records

