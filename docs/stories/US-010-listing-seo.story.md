# US-010: Listing page / SEO / hreflang

## Status: Draft

### Story
En tant que visiteur, je veux que les pages publiques des annonces soient optimisées pour le SEO et multi‑langue avec des balises `hreflang` afin d'améliorer l'indexation et l'affichage selon la langue.

### Acceptance Criteria
- Pages publiques incluent meta tags (title, description, canonical).
- `hreflang` implémenté pour chaque traduction d'annonce.
- Pages accessibles via URLs SEO‑friendly (slug) et supportent SSR/prerender minimal.

**Priority:** P1
**Estimation:** 5

### Tasks
- [ ] Implement SEO metadata in frontend rendering
- [ ] Add hreflang tags generation per property translations
- [ ] Ensure server rendering / prerender for key pages
- [ ] Tests SEO (snapshot meta tags)
