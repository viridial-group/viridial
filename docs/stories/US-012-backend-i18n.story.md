# US-012: Backend i18n & Accept‑Language handling

## Status: Draft

### Story
En tant que développeur backend, je veux que l'API respecte l'en‑tête `Accept‑Language` et fournisse des messages/validations localisés afin que les réponses soient dans la langue désirée par le client.

### Acceptance Criteria
- `Accept‑Language` est respecté par un `LocaleResolver` et expose `locale` aux controllers.
- Messages d'erreur/validation sont fournis via `messages_{locale}.properties`.
- Tests couvrent plusieurs locales et fallback sur `DEFAULT_LOCALE`.

**Priority:** P0
**Estimation:** 2

### Tasks
- [ ] Configurer MessageSource et LocaleResolver
- [ ] Ajouter fichiers messages en FR/EN
- [ ] Tests d'intégration pour localisation
