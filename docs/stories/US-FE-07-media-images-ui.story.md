```markdown
# US-FE-07: Media & Images Management (IHM / UX)

## Status: Draft

### Story
En tant que designer et gestionnaire de contenu, je veux un espace pour uploader, organiser, retoucher léger et réutiliser les images (photo annonce, plan, vignettes) afin d'assurer qualité et cohérence visuelle.

### Acceptance Criteria
- Upload d'images multiples avec génération automatique de vignettes (thumbs) et variantes (webp, retina).
- Outils légers: crop, rotate, focal point, compress options (lossy/lossless) en UI.
- Tags & catégories, recherche par métadonnées, et dossier/bucket view.
- Permissions: qui peut uploader, remplacer, supprimer, publier.
- API contract pour fournir images optimisées au frontend (srcset, sizes) et CDN integration.
- Accessibility: alt text editing et checklist d'images accessibles.

**Priority:** P0
**Estimation:** 5

### Tasks
- [ ] Wireframes du gestionnaire d'images et du flow d'édition rapide
- [ ] Définir contract API pour upload, transformations et CDN URLs
- [ ] Implémenter composants: media gallery, editor modal, tag UI
- [ ] Integrer génération thumbnails et variants (mock pipeline)
- [ ] Tests: performance of gallery, lazy loading, accessibility

### Definition of Done
- [ ] Maquettes validées et composants intégrés au design system
- [ ] Upload + edition léger fonctionnels en prototype
- [ ] Documentation API images (usage srcset, best practices)
- [ ] Accessibility checks passed for image content

```

## Inspiration & References
- Référence: UI media kit et gallery du site fourni (voir pièces jointes). Utiliser les layouts de cards, thumbnails et panels metrics comme guide.
- Voir le brief designer: docs/communication/designer-brief.md
- Voir le brief developer: docs/communication/developer-brief.md

