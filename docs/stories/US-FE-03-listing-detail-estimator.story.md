```markdown
# US-FE-03: Listing Detail, Estimator & Report (IHM)

## Status: Draft

### Story
En tant qu'utilisateur, je veux une page détail d'annonce claire intégrant l'estimateur de prix, comparables et un rapport exportable pour évaluer le bien et partager le résultat.

### Acceptance Criteria
- Maquette de la page détail avec zones: galerie média, informations clés, estimateur, comparables, CTA (contact, share).
- Estimateur panel montre `estimate.value`, `low`, `high`, `confidence` et list of comparables avec distances.
- Bouton export PDF du rapport d'estimation (maquette + contenu).
- Comportement responsive et accessibilité pour la lecture des données.

**Priority:** P0
**Estimation:** 5

### Tasks
- [ ] Wireframes pour la page détail et panneau estimateur
- [ ] Définir data contract pour l'estimateur (display format)
- [ ] Implémenter UI components pour comparables list et report export
- [ ] Prototype export PDF (template) et test cross-browser
- [ ] Usability testing sur flux export/share

### Definition of Done
- [ ] Maquettes validées + composants intégrés au design system
- [ ] Prototype PDF export testé
- [ ] ACs vérifiés en smoke tests UI

```

## Inspiration & References
- S'inspirer du layout media kit et des cartes de listing dans les images fournies.
- Voir le brief designer: docs/communication/designer-brief.md
- Voir le brief developer: docs/communication/developer-brief.md

