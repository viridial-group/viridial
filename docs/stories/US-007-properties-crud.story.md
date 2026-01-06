# US-007: CRUD annonces (Agency)

## Status: Draft

### Story
En tant qu'agent, je veux pouvoir créer, éditer et publier des annonces multilingues afin que mes biens soient visibles publiquement.

### Acceptance Criteria
- Formulaire complet: title, description (multi), price, currency, address, media uploads, property type.
- Sélection de langue(s) pour la fiche; possibilité d'ajouter traduction pour chaque champ textuel.
- Workflow publishing: draft → review → listed.
- Lors de la publication, l'annonce est indexée dans Meilisearch avec les champs multilangue.

Additional Acceptance Criteria & Features:
- Each property record stores canonical geolocation (`latitude`, `longitude`) and structured address components (street, postal_code, city, region, country).
- Address validation and geocoding performed on save (reverse geocode to fill missing fields); geocode service fallback with caching.
- Image upload supports automatic optimization (resizing, webp), CDN/storage path, and validation (limits, virus scan stub).
- Moderation workflow: properties can be flagged by users, enter a `flagged` state and appear in admin moderation queue.
- Bulk import: CSV/XLS import for properties with mapping UI and import preview; import creates `import_job` with validation report.
- Schema.org JSON‑LD output available for each public listing to improve SEO.

**Priority:** P0
**Estimation:** 8

### Tasks
- [ ] DB model properties + translations
- [ ] Property editor UI with media upload
- [ ] Publish workflow backend & indexing to search
- [ ] Tests (unit / e2e)
- [ ] Geocoding integration (batch + cache) and lat/lon storage
- [ ] Image optimization pipeline and CDN/storage hooks
- [ ] Moderation queue UI & admin actions (approve/reject/takedown)
- [ ] Bulk import job + validation report
- [ ] JSON‑LD schema.org export for listings

### QA Scenarios (Gherkin)
#### Scenario: Create property with address and geocode
Given I am an authenticated agent
When I submit a new property with address "10 Rue Exemple, Paris"
Then the system should save the property and populate `latitude` and `longitude`
And the property should appear in Meilisearch index within 30s

#### Scenario: Bulk import with validation report
Given I upload a CSV with 3 property rows, one missing price
When I run the import job
Then the job should create two properties and mark one as failed with validation errors

