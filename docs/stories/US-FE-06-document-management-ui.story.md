```markdown
# US-FE-06: Document Management — Centraliser la gestion des documents (UX/UI)

## Status: Draft

### Story
En tant qu'utilisateur (agent / propriétaire / admin), je veux centraliser l'upload, l'organisation, la prévisualisation et le partage des documents (PDF, contrats, diagnostics) afin de gérer facilement les pièces liées aux annonces.

### Acceptance Criteria
- UI: bibliothèque de documents par annonce et par organisation avec filtres (type, date, auteur).
- Upload multi‑fichiers avec drag & drop, statut d'upload, et progress bar.
- Preview inline pour PDF et thumbnails pour formats supportés; téléchargement et suppression avec permissions.
- Versioning simple (historique) et meta‑data editing (titre, description, tags).
- Partage: génération de lien sécurisé (expirant) et droits view/download.
- Accessibilité: keyboard navigation, labels et erreurs claires.

**Priority:** P0
**Estimation:** 5

### Tasks
- [ ] Wireframes: bibliothèque documents & vue annonce
- [ ] Définir contract API pour upload/list/delete/preview (backend contract)
- [ ] Implémenter composants: upload zone, document card, preview modal
- [ ] Implementer client‑side validation (size/type) + server error handling
- [ ] Ajouter tests d'usabilité et checklist d'accessibilité
- [ ] Documentation: flux UI et exemples de permissions

### Definition of Done
- [ ] Maquettes validées et intégrées au design system
- [ ] Upload multi‑fichiers testés end‑to‑end (mock backend)
- [ ] Preview PDF fonctionnel et liens sécurisés testés
- [ ] Guide d'utilisation et règles de permission rédigés

```

## Inspiration & References
- UI patterns: three‑column layout (filters / list / detail) and document cards like in provided images.
- Voir le brief designer: docs/communication/designer-brief.md
- Voir le brief developer: docs/communication/developer-brief.md

