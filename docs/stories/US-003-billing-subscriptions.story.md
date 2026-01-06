# US-003: Gestion des abonnements (Billing)

## Status: Draft

### Story
En tant que responsable produit/finance, je veux pouvoir attacher un plan d'abonnement à une organisation pour contrôler l'accès aux fonctionnalités, quotas et facturation.

### Acceptance Criteria
- CRUD des plans (free, pro, enterprise) accessibles aux admins.
- Association d'un plan à une organisation.
- Simulation d'un webhook provider (ex: Stripe) pour recevoir événements de paiement.
- Accès aux features respectent le plan (API checks et UI flags).

**Priority:** P1
**Estimation:** 5

### Tasks
- [ ] DB model pour plans et facturation
- [ ] Admin UI pour gérer plans
- [ ] Webhook handler (stub) pour évènements paiement
- [ ] Tests de permission selon plan
