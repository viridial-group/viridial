# Billing Service

Service de facturation et gestion des abonnements pour Viridial.

## Responsabilités

- Gestion des abonnements
- Facturation automatique
- Intégration Stripe
- Gestion des plans tarifaires

## APIs

- `GET /subscriptions` - Liste abonnements
- `POST /subscriptions` - Créer abonnement
- `PUT /subscriptions/:id` - Modifier abonnement
- `POST /subscriptions/:id/cancel` - Annuler abonnement
- `GET /invoices` - Liste factures
- `GET /invoices/:id` - Détails facture

## Technologies

- **Framework:** NestJS
- **Database:** PostgreSQL
- **Payment:** Stripe API
- **Events:** RabbitMQ (subscription.created, payment.succeeded)

## Stories

- **US-003:** Gestion des abonnements (Billing)

## Développement

```bash
cd services/billing-service
npm install
npm run start:dev
```

## Tests

```bash
npm test
npm run test:e2e
```

