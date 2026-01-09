# Property Service

Service de gestion des propriétés pour Viridial.

## Configuration

### Variables d'environnement

Le service charge les variables d'environnement dans cet ordre :

1. `.env.local` - Pour développement local (priorité la plus élevée)
2. `.env` - Dans le répertoire du service
3. `.env` - À la racine du projet
4. `infrastructure/docker-compose/.env` - Configuration Docker Compose

### Configuration locale

Pour exécuter le service localement (hors Docker), créez un fichier `.env.local` :

```bash
# Dans services/property-service/.env.local
DATABASE_URL=postgres://viridial:viridial_dev_password_2024@localhost:5432/viridial
NODE_ENV=development
PORT=3001
JWT_ACCESS_SECRET=jwt_access_secret_dev_local_minimum_32_characters_long
FRONTEND_URL=http://localhost:3000
GEOLOCATION_SERVICE_URL=http://localhost:3002
SEARCH_SERVICE_URL=http://localhost:3003
```

**Important :** Quand vous exécutez localement, utilisez `localhost` au lieu de `viridial-postgres` pour la `DATABASE_URL` si la base de données est dans Docker mais accessible via le port exposé.

### Scripts disponibles

- `npm run build` - Compiler le service
- `npm start` - Démarrer le service (utilise les variables d'environnement)
- `npm run start:dev` - Mode développement avec watch
- `npm run start:local` - Démarrer avec DATABASE_URL locale préconfigurée

## Démarrer le service

### Mode Docker (recommandé)

Le service est configuré dans `infrastructure/docker-compose/app-property.yml` :

```bash
cd infrastructure/docker-compose
docker-compose -f app-property.yml up -d
```

### Mode local (pour développement)

1. Assurez-vous que la base de données PostgreSQL est accessible
2. Créez `.env.local` avec la configuration ci-dessus
3. Compilez et démarrez :

```bash
npm run build
npm start
```

## APIs principales

- `GET /properties` - Liste des propriétés
- `POST /properties` - Créer une propriété
- `GET /properties/:id` - Détails d'une propriété
- `PUT /properties/:id` - Modifier une propriété
- `DELETE /properties/:id` - Supprimer une propriété

## Technologies

- NestJS
- TypeORM
- PostgreSQL
- MinIO (storage)
