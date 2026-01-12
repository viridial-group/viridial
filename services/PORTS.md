# Configuration des Ports - Services Viridial

## Ports assignés

| Service | Port | Description |
|---------|------|-------------|
| **auth-service** | **3001** | Service d'authentification (JWT, sessions) |
| **property-service** | **3003** | Service de gestion des propriétés |
| **geolocation-service** | **3003** | Service de géolocalisation et géocodage |
| **search-service** | **3004** | Service de recherche (Meilisearch) |
| **marketing-service** | **3005** | Service de marketing automation |
| **review-service** | **3006** | Service de gestion des avis |

## Frontend

- **Frontend Web** : Port **3000** (Next.js)

## Services externes (Docker)

- **PostgreSQL** : 5432
- **Redis** : 6379
- **Meilisearch** : 7700
- **MinIO API** : 9000
- **MinIO Console** : 9001

## Utilisation

Chaque service peut être démarré avec :

```bash
cd services/<service-name>
npm run build
npm start  # Utilise le port depuis .env.local
# ou
npm run start:local  # Utilise le port inline
```

## Notes

- Les ports sont configurés dans :
  - `.env.local` de chaque service
  - `src/main.ts` (port par défaut)
  - `package.json` (script `start:local`)
- Le port 8080 était utilisé par un autre service (Java), donc `auth-service` utilise maintenant 3001
