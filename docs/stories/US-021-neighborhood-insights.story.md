# US-021: Neighborhood Insights

## Status: Draft

### Story
En tant que visiteur, je veux voir des informations sur le quartier (écoles, transports, commerces, indices) pour évaluer la qualité de vie autour d'une annonce.

### Acceptance Criteria
- Chaque fiche affiche: score de quartier (composite), distance aux écoles/gares, liste d'aménités proches (500m), et données démographiques si disponibles.
- Sources: open data et enrichissements locaux (configurable provider adapter).
- UI: carte mini avec heatmap de commodités et liens vers pages locales.

**Priority:** High (P0)
**Estimation:** 5

### Tasks
- [ ] Design data model for neighborhood insights
- [ ] Implement provider adapter (OSM, open gov data)
- [ ] UI components: insights panel + mini‑map
- [ ] Tests: provider stubs + integration
