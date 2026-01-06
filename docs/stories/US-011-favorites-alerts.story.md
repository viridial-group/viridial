# US-011: Favoris / Sauvegarde recherches

## Status: Draft

### Story
En tant qu'utilisateur connecté, je veux sauvegarder des annonces et des recherches afin de recevoir des alertes quand de nouvelles annonces correspondent à mes critères.

### Acceptance Criteria
- Fonction "favoris" pour chaque annonce (persisté par user).
- Sauvegarde de recherche avec critères et notification par email (ou webhook) quand nouveaux items matchent.
- UI liste favoris et gestion des alertes.

**Priority:** P2
**Estimation:** 5

### Tasks
- [ ] Models favorites & saved_search
- [ ] Notification worker (email/webhook)
- [ ] Frontend favorites & saved search UI
- [ ] Tests notifications
