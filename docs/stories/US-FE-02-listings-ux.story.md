```markdown
# US-FE-02: Listings Search & Results UX (IHM)

## Status: Draft

### Story
En tant que visiteur, je veux une expérience de recherche et de résultats claire et rapide (liste + carte) pour trouver des annonces pertinentes et comparer rapidement les options.

### Acceptance Criteria
- Maquette mobile/tablette/desktop pour page de recherche (filters, sort, pagination/infinite scroll).
- Composant liste & carte synchronisés (selection sur carte met en avant la carte et la liste).
- UI pour filtres avancés (prix, surface, pièces, distance) avec interactions et labels clairs.
- Performance: rendu initial < 1s sur dataset de test (pagination ou lazy load).
- Accessibilité: navigation clavier pour filtres et résultats.

**Priority:** P0
**Estimation:** 5

### Tasks
- [ ] Créer wireframes pour mobile/tablette/desktop
- [ ] Définir interactions filtrage et états (vide, loading, error)
- [ ] Implémenter composants UI (list card, map marker, filter panel)
- [ ] Tests d'usabilité rapide (prototype clickable) et collecte feedback
- [ ] Documenter comportements et animations micro-interactions

### Definition of Done
- [ ] Maquettes validées par PO/UX
- [ ] Composants intégrés au `ui/` design system
- [ ] Prototype interactif testé et retours synthétisés

```
