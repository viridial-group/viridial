# API Contracts - OpenAPI/Swagger

Ce dossier contient les spécifications OpenAPI pour tous les services.

## Structure

Chaque service a son fichier OpenAPI:

- `auth-service.yaml` - API auth-service
- `property-service.yaml` - API property-service
- `search-service.yaml` - API search-service
- `lead-service.yaml` - API lead-service
- `billing-service.yaml` - API billing-service
- `admin-service.yaml` - API admin-service

## Format

OpenAPI 3.0 avec:
- Endpoints complets
- Request/Response schemas
- Authentication requirements
- Examples

## Utilisation

### Générer Client TypeScript

```bash
# Utiliser openapi-generator ou swagger-codegen
npx @openapitools/openapi-generator-cli generate \
  -i shared/contracts/auth-service.yaml \
  -g typescript-axios \
  -o frontend/web/src/api/auth-client
```

### Validation

```bash
# Valider un contrat
npx swagger-cli validate shared/contracts/auth-service.yaml
```

## Versioning

Les APIs sont versionnées:
- `/v1/auth/login` - Version 1
- `/v2/auth/login` - Version 2 (breaking changes)

## Documentation

Générer la documentation Swagger UI:

```bash
npx swagger-ui-serve shared/contracts/*.yaml
```

