# US-002: Self‑signup agence

## Status: Draft

### Story
En tant que responsable d'agence, je veux pouvoir m'inscrire pour créer une agence liée à une organisation existante ou en créer une nouvelle afin de publier et gérer des annonces.

### Acceptance Criteria
- Flow d'inscription public avec vérification e‑mail (ou invitation).
- Si l'organisation n'existe pas, possibilité de créer une nouvelle organisation (onboarding léger).
- L'agence est liée à l'organisation et reçoit un rôle `agency-admin` par défaut.
- Messages d'erreur et validations affichées.

**Priority:** P1
**Estimation:** 3

### Tasks
- [ ] Endpoint signup / agency creation
- [ ] UI agency signup flow
- [ ] Assign default role
- [ ] Tests

### Technical Notes
- **Database Schema:** Table `agencies` avec `id`, `name`, `organization_id` (FK), `contact_email`, `status` (pending/active/suspended)
- **User Creation:** Créer utilisateur avec email vérifié ou en attente de vérification
- **Role Assignment:** Assigner automatiquement rôle `agency-admin` pour le créateur
- **Organization Link:** Si organisation existe, lier l'agence; sinon créer organisation via US-001
- **Email Verification:** Envoyer email de vérification avec token (expiration 24h)
- **Security:** Rate limiting sur signup, validation email format, protection CSRF
- **Dependencies:** Nécessite US-001 (Organization), US-014 (Authn), US-004 (Roles)

### Definition of Done
- [ ] Endpoint signup fonctionnel avec validation complète
- [ ] UI flow complet (signup → email verification → activation)
- [ ] Rôle `agency-admin` assigné automatiquement
- [ ] Tests unitaires couvrent création, validation, et gestion d'erreurs
- [ ] Tests d'intégration vérifient le flow complet
- [ ] Email de vérification envoyé avec token valide
- [ ] Documentation API mise à jour
- [ ] Code review approuvé
- [ ] Déployé en staging et testé manuellement
