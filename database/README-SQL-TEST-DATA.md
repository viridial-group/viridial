# Script SQL Complet avec Données de Test - Viridial

## 📋 Description

Ce script SQL (`init-database-with-test-data.sql`) crée toutes les tables nécessaires pour le projet Viridial et insère des données de test complètes pour le développement et les tests.

## 🗂️ Tables Créées

### 1. **users** (Service d'authentification)
- Utilisateurs avec rôles (admin, agent, user)
- Authentification email/password
- Vérification email

### 2. **password_reset_tokens** & **email_verification_tokens**
- Tokens pour réinitialisation de mot de passe
- Tokens pour vérification d'email

### 3. **neighborhoods** (Quartiers écologiques)
- Informations sur les quartiers
- Statistiques écologiques (eco_score, green_spaces, etc.)
- Caractéristiques (renewable_energy, water_management, etc.)

### 4. **properties** (Propriétés immobilières)
- Propriétés avec statuts (draft, review, listed, flagged, archived)
- Types (house, apartment, villa, land, commercial, other)
- Géolocalisation et adresses
- Relations avec quartiers

### 5. **property_translations**
- Traductions multilingues (fr, en) pour les propriétés
- SEO (meta_title, meta_description)

### 6. **property_details**
- Détails enrichis par type de propriété
- Surface, chambres, salles de bain
- Caractéristiques (garage, parking, piscine, etc.)
- Classe énergétique et consommation

### 7. **custom_field_definitions** & **custom_field_values**
- Champs personnalisés réutilisables (EAV model)
- Support multilingue
- Types: text, number, boolean, select, etc.

### 8. **reviews**
- Avis sur propriétés, quartiers, villes, pays
- Notes, photos, tags, votes utiles
- Modération (pending, approved, rejected)

### 9. **property_favorites**
- Favoris utilisateurs

## 🚀 Utilisation

### Via Docker (recommandé)

```bash
# Copier le script dans le conteneur
docker cp database/init-database-with-test-data.sql viridial-postgres:/tmp/

# Exécuter le script
docker exec -i viridial-postgres psql -U viridial -d viridial -f /tmp/init-database-with-test-data.sql
```

### Via psql direct

```bash
psql -U viridial -d viridial -f database/init-database-with-test-data.sql
```

### Via Docker Compose

```bash
# Si la base de données est dans docker-compose
docker-compose exec postgres psql -U viridial -d viridial -f /tmp/init-database-with-test-data.sql
```

## 📊 Données de Test Incluses

### Utilisateurs (7)
- 1 admin
- 3 agents immobiliers
- 3 utilisateurs normaux

**Mots de passe de test:** `Passw0rd!` (hash bcrypt)
⚠️ **À changer en production!**

### Quartiers Écologiques (5)
- **Paris 11e - Bastille**: Quartier dynamique avec espaces verts
- **Paris 15e - Vaugirard**: Quartier résidentiel avec jardins partagés
- **Lyon - Confluence**: Éco-quartier moderne exemplaire
- **Marseille - Euroméditerranée**: Quartier en développement durable
- **Bordeaux - Bastide**: Quartier rénové avec mobilité douce

### Propriétés (8)
- 4 appartements à Paris (280k€ - 450k€)
- 2 maisons à Lyon (580k€ - 720k€)
- 1 villa à Marseille (950k€)
- 1 terrain à Bordeaux (180k€)

Toutes avec:
- Traductions FR/EN
- Détails complets (surface, chambres, etc.)
- Champs personnalisés écologiques (certifications, panneaux solaires, etc.)
- Photos (URLs Unsplash)

### Avis (4)
- Avis sur propriétés et quartiers
- Notes, commentaires, tags
- Votes utiles

### Favoris (5)
- Relations utilisateurs ↔ propriétés

## 🔍 Requêtes de Test

### 1. Propriétés avec détails complets

```sql
SELECT 
  p.id,
  pt.title,
  pt.description,
  p.price,
  p.city,
  n.name AS neighborhood_name,
  pd.surface_area,
  pd.bedrooms,
  pd.energy_class
FROM properties p
LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language = 'fr'
LEFT JOIN neighborhoods n ON p.neighborhood_id = n.id
LEFT JOIN property_details pd ON p.id = pd.property_id
WHERE p.status = 'listed' AND p.deleted_at IS NULL
ORDER BY p.created_at DESC;
```

### 2. Propriétés avec champs personnalisés écologiques

```sql
SELECT 
  p.id,
  pt.title,
  cfd.field_key,
  cfv.value_text,
  cfv.value_number,
  cfv.value_boolean
FROM properties p
JOIN property_translations pt ON p.id = pt.property_id AND pt.language = 'fr'
JOIN custom_field_values cfv ON p.id = cfv.entity_id AND cfv.entity_type = 'property'
JOIN custom_field_definitions cfd ON cfv.field_definition_id = cfd.id
WHERE p.status = 'listed' AND p.deleted_at IS NULL
ORDER BY p.id, cfd.field_key;
```

### 3. Quartiers avec statistiques écologiques

```sql
SELECT 
  n.name,
  n.city,
  n.stats->>'eco_score' AS eco_score,
  n.stats->>'green_spaces' AS green_spaces,
  n.features->>'renewable_energy' AS has_renewable_energy,
  COUNT(p.id) AS property_count
FROM neighborhoods n
LEFT JOIN properties p ON n.id = p.neighborhood_id AND p.deleted_at IS NULL
GROUP BY n.id, n.name, n.city, n.stats, n.features
ORDER BY (n.stats->>'eco_score')::numeric DESC;
```

### 4. Avis approuvés avec détails

```sql
SELECT 
  r.rating,
  r.title,
  r.comment,
  r.recommended,
  r.verified,
  r.helpful_count,
  u.email AS user_email,
  CASE 
    WHEN r.entity_type = 'property' THEN pt.title
    WHEN r.entity_type = 'neighborhood' THEN n.name
    ELSE r.entity_type
  END AS entity_name
FROM reviews r
JOIN users u ON r.user_id = u.id
LEFT JOIN properties p ON r.entity_type = 'property' AND r.entity_id = p.id
LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language = 'fr'
LEFT JOIN neighborhoods n ON r.entity_type = 'neighborhood' AND r.entity_id = n.id
WHERE r.status = 'approved' AND r.deleted_at IS NULL
ORDER BY r.created_at DESC;
```

### 5. Statistiques globales

```sql
SELECT 
  'Users' AS table_name,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE is_active = true) AS active
FROM users
UNION ALL
SELECT 
  'Properties' AS table_name,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'listed') AS active
FROM properties
WHERE deleted_at IS NULL
UNION ALL
SELECT 
  'Neighborhoods' AS table_name,
  COUNT(*) AS total,
  COUNT(*) AS active
FROM neighborhoods
UNION ALL
SELECT 
  'Reviews' AS table_name,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'approved') AS active
FROM reviews
WHERE deleted_at IS NULL;
```

## 🔐 Sécurité

⚠️ **Important pour la production:**

1. **Changer tous les mots de passe** - Les hash bcrypt dans le script sont des placeholders
2. **Ne pas utiliser ce script en production** - Il contient des données de test
3. **Vérifier les permissions** - S'assurer que seuls les utilisateurs autorisés peuvent exécuter ce script

## 🧹 Nettoyage

Pour réinitialiser la base de données:

```sql
-- ATTENTION: Supprime toutes les données!
TRUNCATE TABLE 
  property_favorites, 
  reviews, 
  custom_field_values, 
  custom_field_definitions,
  property_details, 
  property_translations, 
  properties, 
  neighborhoods,
  email_verification_tokens, 
  password_reset_tokens, 
  users 
CASCADE;
```

Puis réexécutez le script d'initialisation.

## 📝 Notes

- Les UUIDs sont fixes pour faciliter les tests et les relations
- Les dates sont générées dynamiquement (NOW() - INTERVAL)
- Les URLs d'images pointent vers Unsplash (peuvent être remplacées)
- Les données sont réalistes mais fictives
- Le script est idempotent (utilise ON CONFLICT DO NOTHING)

## 🔗 Relations

```
users (1) ──→ (N) properties
neighborhoods (1) ──→ (N) properties
properties (1) ──→ (N) property_translations
properties (1) ──→ (1) property_details
properties (1) ──→ (N) custom_field_values
properties (1) ──→ (N) reviews
users (1) ──→ (N) reviews
users (N) ──→ (N) properties (via property_favorites)
```

## 📚 Documentation Complémentaire

- [Architecture de la base de données](../docs/architecture/database-schema.md)
- [Guide de migration](../services/property-service/src/migrations/README.md)
- [Types partagés](../shared/types/index.ts)

