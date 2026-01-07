# Property Service - Viridial

Service de gestion des propriétés immobilières pour Viridial.

## 🚀 Fonctionnalités

- ✅ CRUD propriétés complet
- ✅ Support multilingue (translations)
- ✅ Workflow de publication (draft → review → listed)
- ✅ Géolocalisation (latitude/longitude + adresse structurée)
- ✅ Gestion des médias (URLs)
- ⏳ Indexation Meilisearch (à implémenter)
- ⏳ Géocodage automatique (à implémenter)

## 📋 Endpoints API

### Health Check
```
GET /properties/health
```

### CRUD Propriétés

#### Lister les propriétés
```
GET /properties?userId=UUID&status=listed&limit=20&offset=0
```

#### Créer une propriété
```
POST /properties
Body: {
  "userId": "uuid",
  "type": "apartment",
  "price": 250000,
  "currency": "EUR",
  "street": "10 Rue Exemple",
  "postalCode": "75001",
  "city": "Paris",
  "country": "France",
  "translations": [{
    "language": "fr",
    "title": "Appartement centre ville",
    "description": "..."
  }]
}
```

#### Obtenir une propriété
```
GET /properties/:id
```

#### Modifier une propriété
```
PUT /properties/:id
Body: { ... }
```

#### Supprimer une propriété
```
DELETE /properties/:id
```

#### Publier une propriété
```
POST /properties/:id/publish
```

## 🗄️ Structure de Base de Données

### Table `properties`
- Informations principales (type, prix, statut)
- Géolocalisation (latitude, longitude)
- Adresse structurée (street, postalCode, city, region, country)
- Médias (JSON array d'URLs)
- Workflow status (draft, review, listed, flagged, archived)

### Table `property_translations`
- Traductions multilingues (title, description, notes)
- SEO (metaTitle, metaDescription)
- Relation 1-N avec properties (unique par language)

## 🔧 Configuration

### Variables d'Environnement

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/viridial

# Server
PORT=3001
NODE_ENV=production

# Frontend (pour CORS)
FRONTEND_URL=https://viridial.com
```

## 🚀 Développement Local

```bash
cd services/property-service

# Installer les dépendances
npm install

# Démarrer en mode dev (watch)
npm run start:dev

# Build
npm run build

# Production
npm start
```

## 🐳 Déploiement Docker

### Build
```bash
docker build -t viridial/property-service:latest .
```

### Run
```bash
docker run -d \
  -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  -e FRONTEND_URL=https://viridial.com \
  --name viridial-property-service \
  viridial/property-service:latest
```

### Déploiement VPS
```bash
./scripts/deploy-property-service-vps.sh
```

## 📊 Migrations

Les tables sont créées automatiquement en dev (`synchronize: true`).

Pour la production, appliquer la migration manuelle:
```bash
psql $DATABASE_URL < services/property-service/src/migrations/create-properties-tables.sql
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests e2e
npm run test:e2e
```

## 📝 Stories

- **US-007:** CRUD annonces (Agency) - ✅ Implémenté
- **US-019:** Système de géolocalisation (Geocoding) - ⏳ À implémenter

## 🔄 Prochaines Étapes

- [ ] Implémenter l'authentification JWT (intégration avec auth-service)
- [ ] Ajouter le géocodage automatique (US-019)
- [ ] Intégration Meilisearch pour l'indexation
- [ ] Upload et optimisation d'images (MinIO/S3)
- [ ] Workflow de modération (flagged status)
- [ ] Bulk import CSV/XLS
- [ ] Export JSON-LD Schema.org pour SEO

## 🔗 Intégration

### Nginx
Le service est accessible via Nginx à:
- `https://viridial.com/properties/*`

### Frontend
L'API est disponible pour le frontend:
```typescript
const API_URL = process.env.NEXT_PUBLIC_PROPERTY_API_URL || 'https://viridial.com/properties';
```

