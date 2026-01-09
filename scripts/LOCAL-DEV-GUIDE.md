# 🚀 Guide de développement local - Viridial

Ce guide explique comment démarrer tous les services Viridial en local sur votre Mac et insérer des données de test.

## 📋 Prérequis

- **Docker Desktop** installé et démarré sur votre Mac
- **Node.js** (version 18+) pour le frontend
- **Git** pour cloner le repository

## 🚀 Démarrage rapide

### Étape 1: Configuration de l'environnement

Les fichiers `.env` sont créés automatiquement par le script. Si nécessaire, créez-les manuellement :

```bash
# Exécuter le script de configuration
./scripts/setup-env.sh
```

### Étape 2: Démarrer tous les services

```bash
# Démarrer tous les services en une seule commande
./scripts/start-local-services.sh
```

Ce script va :
1. ✅ Créer le réseau Docker `viridial-network`
2. ✅ Démarrer Postgres, Redis, Meilisearch, MinIO
3. ✅ Initialiser la base de données Auth
4. ✅ Démarrer Auth Service
5. ✅ Démarrer Property Service
6. ✅ Démarrer Geolocation Service
7. ✅ Démarrer Search Service
8. ✅ Créer un utilisateur de test

### Étape 3: Insérer des données de test

```bash
# Insérer 8 propriétés de test avec leurs traductions
./scripts/insert-test-data.sh
```

## 🛑 Arrêter les services

```bash
# Arrêter tous les services
./scripts/stop-local-services.sh
```

## 📊 Services disponibles

Une fois démarrés, les services sont disponibles sur :

| Service | URL | Description |
|---------|-----|-------------|
| 🔐 Auth Service | http://localhost:8080 | Service d'authentification |
| 🏠 Property Service | http://localhost:3001 | Service de gestion des propriétés |
| 📍 Geolocation Service | http://localhost:3002 | Service de géolocalisation |
| 🔍 Search Service | http://localhost:3003 | Service de recherche (Meilisearch) |
| 🗄️ Postgres | localhost:5432 | Base de données PostgreSQL |
| 🔴 Redis | localhost:6379 | Cache Redis |
| 🔎 Meilisearch | http://localhost:7700 | Moteur de recherche |
| 📦 MinIO | http://localhost:9000 | Stockage d'objets (Console: 9001) |

## 🧪 Données de test

### Utilisateur de test

- **Email**: `test@viridial.com` (ou celui défini dans `AUTH_TEST_EMAIL`)
- **Password**: `    ` (4 espaces) (ou celui défini dans `AUTH_TEST_PASSWORD`)
- **Role**: `admin`

### Propriétés de test

Le script `insert-test-data.sh` insère **25 propriétés détaillées** avec :

- ✅ Appartement à Paris (listed)
- ✅ Maison à Lyon (listed)
- ✅ Villa à Nice (listed)
- ✅ Terrain à Bordeaux (listed)
- ✅ Appartement à Marseille (draft)
- ✅ Maison à Toulouse (listed)
- ✅ Local commercial à Lille (listed)
- ✅ Appartement à Nantes (review)

Chaque propriété inclut :
- ✅ Traductions en français et anglais
- ✅ Coordonnées géographiques (latitude/longitude)
- ✅ Images d'exemple (URLs Unsplash)
- ✅ Différents statuts (draft, review, listed)

## 🔍 Vérifier que tout fonctionne

### 1. Vérifier les conteneurs Docker

```bash
docker ps
```

Vous devriez voir :
- `viridial-postgres`
- `viridial-redis`
- `viridial-meilisearch`
- `viridial-minio`
- `viridial-auth-service`
- `viridial-property-service`
- `viridial-geolocation-service`
- `viridial-search-service`

### 2. Vérifier la base de données

```bash
# Se connecter à Postgres
docker exec -it viridial-postgres psql -U viridial -d viridial

# Compter les propriétés
SELECT COUNT(*) FROM properties;

# Voir les propriétés
SELECT p.id, pt.title, p.city, p.price, p.status 
FROM properties p 
LEFT JOIN property_translations pt ON p.id = pt.property_id 
WHERE pt.language = 'fr' 
LIMIT 5;
```

### 3. Tester l'API Auth

```bash
# Créer un compte
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Se connecter
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@viridial.com",
    "password": "Test123!"
  }'
```

### 4. Tester l'API Property

```bash
# Récupérer l'ID utilisateur depuis la DB
USER_ID=$(docker exec viridial-postgres psql -U viridial -d viridial -t -c "SELECT id FROM users LIMIT 1;" | xargs)

# Lister les propriétés (avec token JWT - à obtenir via /auth/login)
curl -X GET "http://localhost:3001/properties?userId=${USER_ID}" \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN"
```

### 5. Tester le frontend

```bash
cd frontend/web
npm install
npm run dev
```

Le frontend sera disponible sur http://localhost:3000

## 🔧 Configuration des variables d'environnement

### Fichiers .env

Les fichiers `.env` sont nécessaires dans :
- `infrastructure/docker-compose/.env` (principal)
- `services/auth-service/.env`
- `services/property-service/.env`
- `services/geolocation-service/.env`

### Variables essentielles

```bash
# Base de données
POSTGRES_USER=viridial
POSTGRES_PASSWORD=votre_mot_de_passe_securise
POSTGRES_DB=viridial

# JWT
JWT_ACCESS_SECRET=votre_secret_jwt_tres_securise_minimum_32_caracteres

# Redis
REDIS_URL=redis://viridial-redis:6379

# Meilisearch
MEILI_MASTER_KEY=votre_cle_meilisearch_securisee

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=votre_mot_de_passe_minio

# Frontend URL (pour CORS)
FRONTEND_URL=http://localhost:3000
```

## 🐛 Dépannage

### Les services ne démarrent pas

1. Vérifier que Docker Desktop est démarré :
   ```bash
   docker info
   ```

2. Vérifier les logs :
   ```bash
   docker-compose logs [service-name]
   ```

3. Vérifier les ports disponibles :
   ```bash
   lsof -i :5432  # Postgres
   lsof -i :6379  # Redis
   lsof -i :7700  # Meilisearch
   ```

### Erreur de connexion à la base de données

Vérifier que Postgres est prêt :
```bash
docker exec viridial-postgres pg_isready -U viridial -d viridial
```

### Les données de test ne s'insèrent pas

1. Vérifier qu'un utilisateur existe :
   ```bash
   docker exec viridial-postgres psql -U viridial -d viridial -c "SELECT id, email FROM users LIMIT 5;"
   ```

2. Si aucun utilisateur, créer un utilisateur de test :
   ```bash
   cd infrastructure/docker-compose
   ./create-test-user.sh
   ```

3. Réessayer l'insertion :
   ```bash
   ./scripts/insert-test-data.sh
   ```

### Réinitialiser complètement

```bash
# Arrêter tous les services
./scripts/stop-local-services.sh

# Supprimer les volumes (⚠️ supprime toutes les données)
cd infrastructure/docker-compose
docker-compose -f docker-compose.yml down -v
docker-compose -f app-auth.yml down -v
docker-compose -f app-property.yml down -v
docker-compose -f app-geolocation.yml down -v
docker-compose -f app-search.yml down -v

# Redémarrer
cd ../..
./scripts/start-local-services.sh
./scripts/insert-test-data.sh
```

## 📝 Commandes utiles

```bash
# Voir les logs en temps réel
docker-compose logs -f [service-name]

# Voir tous les logs
docker-compose logs

# Redémarrer un service spécifique
docker-compose restart [service-name]

# Reconstruire un service
docker-compose -f app-[service].yml up -d --build

# Vérifier la santé des services
docker ps --filter "name=viridial"

# Nettoyer les conteneurs arrêtés
docker container prune -f

# Nettoyer les images non utilisées
docker image prune -f
```

## 🎯 Prochaines étapes

Une fois les services démarrés et les données insérées :

1. ✅ Connectez-vous au frontend avec l'utilisateur de test
2. ✅ Créez de nouvelles propriétés via l'interface
3. ✅ Testez la recherche avec les données mockées
4. ✅ Explorez les API avec Postman ou curl

## 📚 Documentation supplémentaire

- [README.md](../../README.md) - Documentation principale
- [QUICK_START.md](../../docs/QUICK-START.md) - Guide de démarrage rapide
- [services/property-service/README.md](../../services/property-service/README.md) - Documentation Property Service

