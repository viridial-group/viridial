# Property Service

Service de gestion des propriétés immobilières pour Viridial.

## Responsabilités

- CRUD propriétés
- Géolocalisation (intégration service géocodage)
- Gestion des médias (images, vidéos)
- Indexation dans Meilisearch (via events)

## APIs

- `GET /properties` - Liste propriétés (avec filtres)
- `POST /properties` - Créer propriété
- `GET /properties/:id` - Détails propriété
- `PUT /properties/:id` - Modifier propriété
- `DELETE /properties/:id` - Supprimer propriété
- `POST /properties/:id/publish` - Publier propriété

## Technologies

- **Framework:** NestJS
- **Database:** PostgreSQL
- **Storage:** MinIO (S3-compatible) pour médias
- **Events:** RabbitMQ (property.created, property.updated)

## Stories

- **US-007:** CRUD annonces (Agency)
- **US-019:** Système de géolocalisation (Geocoding)

## Développement

```bash
cd services/property-service
npm install
npm run start:dev
```

## Tests

```bash
npm test
npm run test:e2e
```

