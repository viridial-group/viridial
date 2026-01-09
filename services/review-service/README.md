# Review Service

Service de gestion des avis pour les propriétés, villes, quartiers et pays dans l'écosystème Viridial.

## Description

Le Review Service permet aux utilisateurs d'ajouter, modifier et consulter des avis (reviews) avec des notes de 1 à 5 étoiles pour différents types d'entités :
- **Propriétés** (properties)
- **Villes** (cities)
- **Quartiers** (neighborhoods)
- **Pays** (countries)

## Fonctionnalités

### Fonctionnalités de base
- ✅ Création d'avis avec note (1-5 étoiles), titre et commentaire
- ✅ Modification d'avis (uniquement par le propriétaire)
- ✅ Suppression d'avis (soft delete, uniquement par le propriétaire)
- ✅ Consultation d'avis avec filtres avancés
- ✅ Statistiques d'avis (note moyenne, distribution, taux de recommandation)
- ✅ Pagination des résultats
- ✅ Modération des avis (pending, approved, rejected)
- ✅ Authentification JWT requise pour créer/modifier/supprimer
- ✅ Soft delete pour préserver l'intégrité des données

### Fonctionnalités modernes (inspirées de Google Reviews, Airbnb, TripAdvisor)

- ✅ **Photos dans les avis** - Jusqu'à 10 photos par avis avec gestion des thumbnails
- ✅ **Votes utiles** - Système de votes "Utile" / "Pas utile" (like/dislike)
- ✅ **Réponses aux avis** - Les propriétaires/managers peuvent répondre aux avis
- ✅ **Tags/Catégories** - Avis tagués par catégorie (sécurité, localisation, prix, qualité, etc.)
- ✅ **Recommandation** - Les utilisateurs peuvent recommander ou non l'entité
- ✅ **Vérification** - Marqueur pour les avis vérifiés (utilisateur a réellement séjourné/visité)
- ✅ **Date de visite** - Date de la visite/séjour pour contexte temporel
- ✅ **Filtrage avancé** - Filtres par note, photos, vérification, recommandation
- ✅ **Tri avancé** - Tri par récent, utile, note haute/basse
- ✅ **Statistiques enrichies** - Taux de recommandation, nombre d'avis vérifiés

## Technologies

- **Framework**: NestJS 10
- **Base de données**: PostgreSQL avec TypeORM
- **Authentification**: JWT via Passport
- **Validation**: class-validator et class-transformer

## Configuration

### Variables d'environnement

```env
# Port du service
PORT=3005

# URL de la base de données PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/viridial_reviews

# Secret JWT pour valider les tokens (doit correspondre à auth-service)
JWT_ACCESS_SECRET=your-jwt-secret-key

# URL du frontend pour CORS
FRONTEND_URL=https://viridial.com

# Environnement
NODE_ENV=production
```

### Installation

```bash
# Installer les dépendances
npm install

# Construire le service
npm run build

# Démarrer en mode développement
npm run start:dev

# Démarrer en mode production
npm start
```

## Structure de la base de données

### Tables

#### Table `reviews`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique de l'avis |
| user_id | UUID | ID de l'utilisateur qui a écrit l'avis |
| entity_type | ENUM | Type d'entité: 'property', 'city', 'neighborhood', 'country' |
| entity_id | UUID | ID de l'entité revue |
| rating | INTEGER | Note de 1 à 5 étoiles |
| title | VARCHAR(200) | Titre de l'avis (optionnel) |
| comment | TEXT | Commentaire de l'avis (optionnel) |
| status | VARCHAR(20) | Statut: 'pending', 'approved', 'rejected' |
| photos | JSONB | Array d'URLs de photos (max 10) |
| tags | JSONB | Array de tags/catégories (security, location, price, etc.) |
| recommended | BOOLEAN | Recommande cette entité ? (optionnel) |
| verified | BOOLEAN | Avis vérifié (utilisateur a réellement visité/séjourné) |
| visit_date | DATE | Date de la visite/séjour (optionnel) |
| helpful_count | INTEGER | Nombre de votes "utile" |
| not_helpful_count | INTEGER | Nombre de votes "pas utile" |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de mise à jour |
| deleted_at | TIMESTAMP | Date de suppression (soft delete) |

#### Table `review_photos`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique de la photo |
| review_id | UUID | ID de l'avis (foreign key) |
| url | VARCHAR(500) | URL complète de la photo |
| thumbnail_url | VARCHAR(500) | URL du thumbnail (optionnel) |
| alt | VARCHAR(100) | Texte alternatif pour accessibilité |
| width | INTEGER | Largeur originale en pixels |
| height | INTEGER | Hauteur originale en pixels |
| display_order | INTEGER | Ordre d'affichage |
| created_at | TIMESTAMP | Date de création |

#### Table `review_votes`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique du vote |
| review_id | UUID | ID de l'avis (foreign key) |
| user_id | UUID | ID de l'utilisateur qui a voté |
| vote_type | ENUM | Type: 'helpful' ou 'not_helpful' |
| created_at | TIMESTAMP | Date de création |

#### Table `review_responses`

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique de la réponse |
| review_id | UUID | ID de l'avis (foreign key) |
| user_id | UUID | ID de l'utilisateur qui a répondu (propriétaire/manager) |
| content | TEXT | Contenu de la réponse |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de mise à jour |
| deleted_at | TIMESTAMP | Date de suppression (soft delete) |

### Contraintes

- Un utilisateur ne peut avoir qu'un seul avis par entité (unique constraint sur user_id + entity_type + entity_id)
- La note doit être entre 1 et 5
- Le statut doit être 'pending', 'approved' ou 'rejected'

## API Endpoints

### Base URL
```
http://localhost:3005/reviews
```

### Endpoints

#### Health Check
```http
GET /reviews/health
```
Retourne le statut du service.

#### Créer un avis (authentifié)
```http
POST /reviews
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "entityType": "property",
  "entityId": "uuid-de-la-propriete",
  "rating": 5,
  "title": "Excellent bien immobilier",
  "comment": "Très bien situé, excellent état...",
  "photos": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
  "tags": ["location", "quality", "value"],
  "recommended": true,
  "verified": true,
  "visitDate": "2024-01-15"
}
```

#### Lister les avis (public pour approuvés, authentifié pour tous)
```http
GET /reviews?entityType=property&entityId=uuid&page=1&limit=20
```

#### Recherche avancée avec filtres et tri
```http
GET /reviews/search?entityType=property&entityId=uuid&minRating=4&hasPhotos=true&sortBy=helpful&page=1&limit=20
```
**Query parameters:**
- `entityType` (optionnel): Filtrer par type d'entité
- `entityId` (optionnel): Filtrer par ID d'entité
- `minRating` (optionnel): Note minimum (1-5)
- `maxRating` (optionnel): Note maximum (1-5)
- `hasPhotos` (optionnel, boolean): Filtrer les avis avec photos uniquement
- `verifiedOnly` (optionnel, boolean): Filtrer les avis vérifiés uniquement
- `recommendedOnly` (optionnel, boolean): Filtrer les avis recommandés uniquement
- `sortBy` (optionnel): `recent` (défaut), `helpful`, `rating_high`, `rating_low`
- `page` (optionnel, défaut: 1): Numéro de page
- `limit` (optionnel, défaut: 20): Nombre d'avis par page

#### Obtenir un avis par ID
```http
GET /reviews/:id
```

#### Obtenir les statistiques d'une entité
```http
GET /reviews/stats/:entityType/:entityId
```
**Exemple:**
```http
GET /reviews/stats/property/uuid-de-la-propriete
```
Retourne:
```json
{
  "entityType": "property",
  "entityId": "uuid-de-la-propriete",
  "totalReviews": 25,
  "averageRating": 4.5,
  "ratingDistribution": {
    "1": 1,
    "2": 2,
    "3": 5,
    "4": 10,
    "5": 7
  },
  "recommendationRate": 85,
  "verifiedReviewsCount": 18
}
```

#### Modifier un avis (authentifié, propriétaire uniquement)
```http
PUT /reviews/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "rating": 4,
  "title": "Mise à jour du titre",
  "comment": "Commentaire modifié"
}
```

#### Supprimer un avis (authentifié, propriétaire uniquement)
```http
DELETE /reviews/:id
Authorization: Bearer <jwt-token>
```

#### Voter sur un avis (authentifié)
```http
POST /reviews/:id/vote
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "voteType": "helpful"  // ou "not_helpful"
}
```
Note: Voter à nouveau avec le même type supprime le vote. Changer le type de vote met à jour le vote.

#### Supprimer un vote (authentifié)
```http
DELETE /reviews/:id/vote?type=helpful
Authorization: Bearer <jwt-token>
```

#### Créer une réponse à un avis (authentifié, généralement par propriétaire/manager)
```http
POST /reviews/:id/responses
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "content": "Merci pour votre avis. Nous sommes ravis que vous ayez apprécié votre séjour..."
}
```

#### Modifier une réponse (authentifié, propriétaire uniquement)
```http
PUT /reviews/responses/:responseId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "content": "Réponse mise à jour..."
}
```

#### Supprimer une réponse (authentifié, propriétaire uniquement)
```http
DELETE /reviews/responses/:responseId
Authorization: Bearer <jwt-token>
```

## Migration de base de données

Pour créer les tables dans PostgreSQL, exécutez les migrations dans l'ordre :

```bash
# 1. Créer la table reviews (avec nouvelles colonnes)
psql -U postgres -d viridial_reviews -f src/migrations/create-reviews-table.sql

# 2. Créer la table review_photos (optionnel, photos peuvent être stockées en JSONB dans reviews)
psql -U postgres -d viridial_reviews -f src/migrations/create-review-photos-table.sql

# 3. Créer la table review_votes
psql -U postgres -d viridial_reviews -f src/migrations/create-review-votes-table.sql

# 4. Créer la table review_responses
psql -U postgres -d viridial_reviews -f src/migrations/create-review-responses-table.sql
```

Ou manuellement en suivant les fichiers SQL dans `src/migrations/`.

## Docker

### Construire l'image
```bash
docker build -t viridial/review-service:latest .
```

### Exécuter le conteneur
```bash
docker run -d \
  --name review-service \
  -p 3005:3005 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e JWT_ACCESS_SECRET=your-secret \
  viridial/review-service:latest
```

## Développement

### Structure du projet

```
src/
├── controllers/        # Contrôleurs REST API
│   └── review.controller.ts
├── services/          # Logique métier
│   └── review.service.ts
├── entities/          # Entités TypeORM
│   └── review.entity.ts
├── dto/              # Data Transfer Objects
│   ├── create-review.dto.ts
│   ├── update-review.dto.ts
│   ├── review-query.dto.ts
│   └── review-response.dto.ts
├── guards/           # Guards d'authentification
│   └── jwt-auth.guard.ts
├── strategies/       # Stratégies Passport
│   └── jwt.strategy.ts
├── decorators/       # Décorateurs personnalisés
│   └── user.decorator.ts
├── auth/            # Module d'authentification
│   └── auth.module.ts
├── migrations/      # Migrations SQL
│   └── create-reviews-table.sql
├── app.module.ts    # Module principal
└── main.ts          # Point d'entrée
```

## Tests

```bash
# Tests unitaires
npm test

# Tests e2e
npm run test:e2e
```

## Sécurité

- Toutes les opérations de modification nécessitent une authentification JWT
- Un utilisateur ne peut modifier/supprimer que ses propres avis
- Les avis non approuvés ne sont visibles que par leur auteur
- Validation stricte des DTOs avec class-validator
- Protection CORS configurée

## Intégration avec d'autres services

Ce service s'intègre avec :
- **auth-service**: Validation des tokens JWT pour l'authentification
- **property-service**: Référence des propriétés via `entity_id` quand `entity_type = 'property'`
- **geolocation-service**: Référence des villes/quartiers/pays via `entity_id`

## Notes importantes

- Les avis sont créés avec le statut `pending` par défaut et nécessitent une modération
- Une fois qu'un avis est modifié, son statut est remis à `pending` pour re-modération
- Les statistiques ne prennent en compte que les avis approuvés (`status = 'approved'`)
- Un utilisateur ne peut avoir qu'un seul avis actif par entité (pas de doublons)
- Les photos peuvent être stockées soit dans le champ JSONB `photos` de la table `reviews`, soit dans la table `review_photos` pour une gestion plus avancée
- Les votes sont uniques par utilisateur par avis (un utilisateur ne peut voter qu'une fois, mais peut changer son vote)
- Les réponses sont uniques par utilisateur par avis (un utilisateur ne peut répondre qu'une fois, mais peut modifier sa réponse)
- Les tags disponibles sont: security, location, price, quality, neighborhood, transport, cleanliness, communication, value, amenities

