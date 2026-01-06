# US-001: Création d’organisation (Tenant)

## Status: Draft

### Story
En tant qu'admin d'organisation, je veux pouvoir créer une organisation SaaS avec son profil et son administrateur initial afin que l'organisation dispose d'un espace isolé pour ses données, utilisateurs et paramètres.

### Acceptance Criteria
- Un formulaire permet de créer une organization avec nom, slug, contact principal.
- Lors de la création, un utilisateur owner est créé et reçoit un e‑mail d'invitation.
- Une `organization_id` est générée et utilisée comme scope pour isoler données (properties, users, leads).
- Tests unitaires et intégration couvrent la création et l'envoi d'e‑mail (mock).

**Priority:** P0
**Estimation:** 3

### Tasks
- [ ] API POST /organizations implémentée
- [ ] UI création organisation (Admin/Onboarding)
- [ ] Email d'invitation template + queue
- [ ] Tests automatisés

### Technical Notes
- **Database Schema:** Table `organizations` avec colonnes: `id` (UUID), `name`, `slug` (unique), `contact_email`, `created_at`, `updated_at`
- **Multi-tenant Isolation:** Toutes les tables doivent inclure `organization_id` comme clé étrangère
- **Slug Generation:** Slug auto-généré depuis le nom (lowercase, hyphens, validation unique)
- **Email Queue:** Utiliser queue système (Redis/Bull) pour envoi asynchrone d'emails
- **Security:** Validation du slug (pas de caractères spéciaux), rate limiting sur création
- **Dependencies:** Nécessite US-INFRA-01 (infrastructure) et système d'email configuré

### Definition of Done
- [ ] API endpoint fonctionnel avec validation complète
- [ ] UI permet création avec feedback utilisateur
- [ ] Email d'invitation envoyé avec token d'activation
- [ ] Tests unitaires couvrent création, validation, et gestion d'erreurs
- [ ] Tests d'intégration vérifient le flow complet (création → email → activation)
- [ ] Documentation API mise à jour (OpenAPI/Swagger)
- [ ] Code review approuvé
- [ ] Déployé en staging et testé manuellement
