# US-013: Frontend language switcher + fallback

## Status: Draft

### Story
En tant qu'utilisateur, je veux changer la langue de l'interface et des contenus, et que mon choix soit mémorisé afin d'utiliser le site dans ma langue préférée.

### Acceptance Criteria
- Composant language switcher présent dans l'UI.
- Choix persistant (cookie ou profil utilisateur si connecté).
- Contenu/textes tombent sur `DEFAULT_LOCALE` si traduction manquante.

**Priority:** P0
**Estimation:** 3

### Tasks
- [ ] Ajouter vue‑i18n et config locales
- [ ] Language switcher component
- [ ] Persist selection cookie/profile
- [ ] Tests e2e pour langue/fallback
