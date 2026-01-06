# Lead Service

Service de gestion des leads et contacts pour Viridial.

## Responsabilités

- CRUD leads
- Lead scoring (calcul automatique)
- Synchronisation CRM (Zapier, HubSpot)
- Gestion du contact flow

## APIs

- `GET /leads` - Liste leads
- `POST /leads` - Créer lead
- `GET /leads/:id` - Détails lead
- `PUT /leads/:id` - Modifier lead
- `POST /leads/:id/score` - Calculer score lead
- `POST /leads/:id/sync-crm` - Synchroniser avec CRM

## Technologies

- **Framework:** NestJS
- **Database:** PostgreSQL
- **Events:** RabbitMQ (lead.created, lead.updated)
- **CRM Integration:** Zapier, HubSpot API

## Stories

- **US-008:** Gestion leads & contact flow
- **US-024:** Lead Scoring & CRM Sync

## Développement

```bash
cd services/lead-service
npm install
npm run start:dev
```

## Tests

```bash
npm test
npm run test:e2e
```

