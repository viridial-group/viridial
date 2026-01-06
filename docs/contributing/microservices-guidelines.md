# Guidelines Microservices - Viridial

Guide pour développer et maintenir les microservices dans l'architecture Viridial.

## Architecture Microservices

### Services Identifiés

1. **auth-service** - Authentification, JWT, SSO
2. **property-service** - CRUD propriétés, géolocalisation
3. **search-service** - Recherche Meilisearch, filtres
4. **lead-service** - Gestion leads, scoring, CRM sync
5. **billing-service** - Abonnements, facturation, Stripe
6. **admin-service** - Administration, users, roles, i18n

### Communication Inter-Services

#### Synchronous (REST)

- **APIs REST** avec OpenAPI/Swagger
- **Service Discovery** via Kubernetes DNS: `service-name.namespace.svc.cluster.local`
- **Circuit Breaker** pattern pour résilience
- **Retry logic** avec exponential backoff

**Exemple:**
```typescript
// property-service appelle auth-service
const response = await fetch('http://auth-service.viridial-staging.svc.cluster.local/v1/users/me', {
  headers: { Authorization: `Bearer ${token}` }
});
```

#### Asynchronous (Events)

- **RabbitMQ** pour events découplés
- **Events:** `property.created`, `property.updated`, `lead.created`, etc.
- **Event Sourcing** pour audit trail (optionnel)

**Exemple:**
```typescript
// property-service publie event
await rabbitmq.publish('property.created', {
  propertyId: property.id,
  organizationId: property.organizationId,
  timestamp: new Date()
});

// search-service écoute event
rabbitmq.subscribe('property.created', async (event) => {
  await meilisearch.indexProperty(event.propertyId);
});
```

## Créer un Nouveau Microservice

### 1. Structure de Base

```bash
cd services
mkdir new-service
cd new-service
npm init -y
npm install @nestjs/core @nestjs/common @nestjs/platform-express
```

### 2. Structure de Dossiers

```
new-service/
├── src/
│   ├── main.ts              # Point d'entrée
│   ├── app.module.ts        # Module principal
│   ├── controllers/         # Controllers REST
│   ├── services/            # Business logic
│   ├── entities/            # Entités TypeORM
│   ├── dto/                 # Data Transfer Objects
│   ├── guards/              # Guards (auth, RBAC)
│   ├── interceptors/        # Interceptors
│   └── config/              # Configuration
├── test/                    # Tests
├── Dockerfile               # Image Docker
├── package.json             # Dépendances
├── tsconfig.json            # Config TypeScript
└── README.md                # Documentation service
```

### 3. Configuration de Base

**package.json:**
```json
{
  "name": "@viridial/new-service",
  "version": "1.0.0",
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build": "nest build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "jest --e2e"
  },
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0"
  }
}
```

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
CMD ["node", "dist/main.js"]
```

### 4. Ajouter au Monorepo

1. Ajouter service dans `services/README.md`
2. Ajouter au `docker-compose.yml` pour développement local
3. Créer manifests Kubernetes dans `infrastructure/kubernetes/manifests/`
4. Ajouter workflow CI/CD dans `.github/workflows/`

## Contrats API entre Services

### OpenAPI/Swagger

Chaque service expose son API avec OpenAPI:

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Property Service API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

### Contrats Partagés

Les contrats OpenAPI sont stockés dans `shared/contracts/`:

```
shared/contracts/
├── property-service.yaml
├── auth-service.yaml
└── ...
```

### Génération de Clients

Générer des clients TypeScript depuis les contrats:

```bash
npx @openapitools/openapi-generator-cli generate \
  -i shared/contracts/property-service.yaml \
  -g typescript-axios \
  -o shared/clients/property-client
```

## Gestion des Dépendances

### Dépendances Inter-Services

**Éviter:**
- Importer du code d'un autre service directement
- Couplage fort entre services

**Préférer:**
- Communication via APIs REST
- Events asynchrones
- Types partagés dans `shared/types/`

### Types Partagés

Utiliser `shared/types/` pour types communs:

```typescript
// Dans un service
import { Property, User } from '@viridial/shared/types';
```

**Ne PAS:**
- Importer des entités TypeORM d'un autre service
- Importer des services d'un autre service

## Tests

### Tests Unitaires

```typescript
describe('PropertyService', () => {
  it('should create property', async () => {
    const property = await service.create(createDto);
    expect(property).toBeDefined();
  });
});
```

### Tests d'Intégration

```typescript
describe('Property API (e2e)', () => {
  it('/properties (POST)', () => {
    return request(app.getHttpServer())
      .post('/properties')
      .send(createDto)
      .expect(201);
  });
});
```

### Tests Inter-Services

Utiliser mocks pour les appels inter-services:

```typescript
// Mock auth-service
jest.mock('@viridial/shared/clients/auth-client', () => ({
  AuthClient: {
    verifyToken: jest.fn().mockResolvedValue({ userId: '123' })
  }
}));
```

## Déploiement

### Docker

Chaque service a son Dockerfile et image Docker séparée.

### Kubernetes

Chaque service est déployé comme un Deployment Kubernetes séparé:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: property-service
  namespace: viridial-staging
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: property-service
        image: viridial/property-service:latest
```

### CI/CD

Chaque service a son propre workflow CI/CD qui:
1. Lint et test
2. Build l'image Docker
3. Push vers registry (si merge sur main/develop)
4. Déploie sur Kubernetes (si merge sur main)

## Monitoring

### Logs

Chaque service log dans un format structuré:

```typescript
logger.log({
  level: 'info',
  message: 'Property created',
  service: 'property-service',
  propertyId: property.id,
  organizationId: property.organizationId
});
```

### Métriques

Exposer des métriques Prometheus:

```typescript
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [PrometheusModule.register()]
})
export class AppModule {}
```

### Tracing

Utiliser OpenTelemetry pour tracing distribué:

```typescript
import { TraceService } from '@nestjs/observability';

@Injectable()
export class PropertyService {
  constructor(private trace: TraceService) {}

  async create(dto: CreatePropertyDto) {
    return this.trace.startActiveSpan('property.create', async (span) => {
      // ...
      span.end();
    });
  }
}
```

## Best Practices

1. **Single Responsibility:** Un service = un domaine métier
2. **Database per Service:** Chaque service a sa propre DB (ou schema)
3. **API Versioning:** Versionner les APIs (`/v1/`, `/v2/`)
4. **Error Handling:** Gérer les erreurs gracieusement
5. **Circuit Breaker:** Implémenter circuit breaker pour appels externes
6. **Retry Logic:** Retry avec exponential backoff
7. **Idempotency:** APIs idempotentes quand possible
8. **Documentation:** Documenter toutes les APIs (OpenAPI)

## Ressources

- [Repository Structure](../architecture/repository-structure.md)
- [GitHub Workflow](github-workflow.md)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Microservices Patterns](https://microservices.io/patterns/)

