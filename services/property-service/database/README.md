# Property Service Database Schema

Ce répertoire contient le schéma SQL complet pour le service de gestion des propriétés immobilières.

## Fichiers

- **schema.sql** : Schéma complet de la base de données avec toutes les tables, index, contraintes et données de seed

## Structure de la Base de Données

### Tables de Référence (Types et Sous-types)

1. **property_statuses** - Statuts des propriétés (draft, review, listed, flagged, archived)
2. **property_types** - Types de propriétés avec support des sous-types (house, apartment, villa, land, commercial, etc.)
   - Sous-types commerciaux : commercial_office, commercial_retail, commercial_warehouse, commercial_restaurant, commercial_hotel
   - Sous-types terrains : land_residential, land_commercial, land_agricultural
3. **flag_statuses** - Statuts des signalements (pending, reviewed, resolved)
4. **custom_field_types** - Types de champs personnalisés (text, textarea, number, date, etc.)
5. **import_statuses** - Statuts des jobs d'import (processing, completed, failed)

### Tables Principales

1. **neighborhoods** - Quartiers avec leurs caractéristiques et statistiques
2. **properties** - Propriétés immobilières avec leurs informations principales
3. **property_translations** - Traductions multilingues des propriétés
4. **property_details** - Détails enrichis des propriétés selon leur type
5. **property_flags** - Signalements de propriétés pour modération
6. **property_favorites** - Favoris des utilisateurs pour les propriétés
7. **custom_field_definitions** - Définitions de champs personnalisés réutilisables
8. **custom_field_values** - Valeurs des champs personnalisés pour les entités
9. **import_jobs** - Jobs d'import en masse de propriétés

### Relations

**Tables de Référence :**
- `properties.status_code` → `property_statuses.code` (Many-to-One)
- `properties.type_code` → `property_types.code` (Many-to-One)
- `property_types.parent_code` → `property_types.code` (Self-referencing pour sous-types)
- `property_flags.status_code` → `flag_statuses.code` (Many-to-One)
- `custom_field_definitions.field_type_code` → `custom_field_types.code` (Many-to-One)
- `import_jobs.status_code` → `import_statuses.code` (Many-to-One)

**Tables Principales :**
- `properties.neighborhood_id` → `neighborhoods.id` (Many-to-One)
- `property_translations.property_id` → `properties.id` (One-to-Many, CASCADE)
- `property_details.property_id` → `properties.id` (One-to-One, CASCADE)
- `property_flags.property_id` → `properties.id` (Many-to-One, CASCADE)
- `property_favorites.property_id` → `properties.id` (Many-to-One, CASCADE)
- `custom_field_values.field_definition_id` → `custom_field_definitions.id` (Many-to-One, CASCADE)

## Utilisation

### Création de la Base de Données

```bash
# Se connecter à PostgreSQL
psql -U viridial -d viridial

# Exécuter le schéma
\i database/schema.sql
```

### Ou via psql en ligne de commande

```bash
psql -U viridial -d viridial -f database/schema.sql
```

### Réinitialisation de la Base de Données

⚠️ **Attention** : Cette opération supprimera toutes les données existantes !

```sql
-- Supprimer toutes les tables (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS custom_field_values CASCADE;
DROP TABLE IF EXISTS custom_field_definitions CASCADE;
DROP TABLE IF EXISTS import_jobs CASCADE;
DROP TABLE IF EXISTS property_favorites CASCADE;
DROP TABLE IF EXISTS property_flags CASCADE;
DROP TABLE IF EXISTS property_details CASCADE;
DROP TABLE IF EXISTS property_translations CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;

-- Supprimer les tables de référence
DROP TABLE IF EXISTS import_statuses CASCADE;
DROP TABLE IF EXISTS custom_field_types CASCADE;
DROP TABLE IF EXISTS flag_statuses CASCADE;
DROP TABLE IF EXISTS property_types CASCADE; -- CASCADE supprimera aussi les sous-types
DROP TABLE IF EXISTS property_statuses CASCADE;

-- Puis réexécuter schema.sql
```

## Données de Seed

Le fichier `schema.sql` contient des données d'exemple pour :

- **3 quartiers** : Marrakech Médina, Casablanca Ain Diab, Rabat Agdal
- **6 propriétés** : 
  - 1 riad à Marrakech (listed)
  - 1 villa à Casablanca (listed)
  - 1 maison à Rabat (listed)
  - 1 appartement à Marrakech (draft)
  - 1 local commercial à Casablanca (listed)
  - 1 terrain à Rabat (listed)
- **Traductions** : Français et anglais pour chaque propriété
- **Détails** : Informations complètes selon le type de propriété
- **Favoris** : 4 favoris de différents utilisateurs
- **Signalements** : 1 signalement en attente de modération
- **Champs personnalisés** : 3 définitions et 3 valeurs d'exemple
- **Jobs d'import** : 2 jobs (1 complété, 1 en cours)

## Notes Importantes

1. **Tables de Référence** : Au lieu d'utiliser des ENUMs SQL, le schéma utilise des tables de référence pour une meilleure flexibilité et extensibilité
2. **Sous-types** : Les types de propriétés supportent des sous-types via `parent_code` (ex: commercial_retail est un sous-type de commercial)
3. **UUIDs** : Tous les IDs sont des UUIDs générés automatiquement
4. **Codes de Propriété** :
   - **`internal_code`** : Code interne généré automatiquement par le service lors de la création d'une propriété (format: PROP-YYYY-NNNNNN). Ce champ est NOT NULL et UNIQUE. Le service doit générer ce code de manière séquentielle.
   - **`external_code`** : Code externe optionnel pour référencer une propriété depuis un système externe. Ce champ peut être NULL et n'est pas unique (plusieurs propriétés peuvent avoir le même code externe si nécessaire).
5. **Soft Delete** : La table `properties` utilise un soft delete via `deleted_at`
6. **Multilingue** : Les traductions sont stockées dans `property_translations` avec le code langue ISO 639-1. Les labels des tables de référence sont aussi multilingues (JSONB)
7. **JSONB** : Plusieurs champs utilisent JSONB pour la flexibilité (media_urls, stats, features, labels, etc.)
8. **Index** : Des index sont créés sur les colonnes fréquemment utilisées pour les recherches, y compris `internal_code` et `external_code` (index partiel pour external_code car il peut être NULL)
9. **Contraintes** : Des contraintes UNIQUE sont définies pour éviter les doublons (ex: favorite user+property, translation property+language, internal_code)
10. **Ordre d'affichage** : Les tables de référence incluent un champ `display_order` pour contrôler l'ordre d'affichage dans les interfaces
11. **Activation/Désactivation** : Les tables de référence incluent un champ `is_active` pour activer/désactiver des valeurs sans les supprimer

## Migration avec TypeORM

Si vous utilisez TypeORM pour les migrations, vous pouvez générer automatiquement les migrations à partir des entités :

```bash
npm run typeorm migration:generate -- -n InitialPropertySchema
```

Puis exécuter les migrations :

```bash
npm run typeorm migration:run
```

## Vérification

Après avoir exécuté le schéma, vous pouvez vérifier que tout est correct :

```sql
-- Compter les enregistrements
SELECT 'neighborhoods' as table_name, COUNT(*) as count FROM neighborhoods
UNION ALL
SELECT 'properties', COUNT(*) FROM properties
UNION ALL
SELECT 'property_translations', COUNT(*) FROM property_translations
UNION ALL
SELECT 'property_details', COUNT(*) FROM property_details
UNION ALL
SELECT 'property_favorites', COUNT(*) FROM property_favorites
UNION ALL
SELECT 'property_flags', COUNT(*) FROM property_flags
UNION ALL
SELECT 'custom_field_definitions', COUNT(*) FROM custom_field_definitions
UNION ALL
SELECT 'custom_field_values', COUNT(*) FROM custom_field_values
UNION ALL
SELECT 'import_jobs', COUNT(*) FROM import_jobs;

-- Vérifier les relations avec les tables de référence
SELECT 
    p.id,
    p.internal_code,
    p.external_code,
    pt_main.label->>'fr' as type_label,
    ps.label->>'fr' as status_label,
    pt.title,
    pd.bedrooms,
    pd.bathrooms,
    n.name as neighborhood_name
FROM properties p
LEFT JOIN property_types pt_main ON p.type_code = pt_main.code
LEFT JOIN property_statuses ps ON p.status_code = ps.code
LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language = 'fr'
LEFT JOIN property_details pd ON p.id = pd.property_id
LEFT JOIN neighborhoods n ON p.neighborhood_id = n.id
WHERE p.deleted_at IS NULL
ORDER BY p.created_at DESC;

-- Vérifier les types et sous-types
SELECT 
    pt.code,
    pt.label->>'fr' as label_fr,
    pt.label->>'en' as label_en,
    pt.parent_code,
    pt_parent.label->>'fr' as parent_label_fr,
    pt.display_order,
    pt.is_active
FROM property_types pt
LEFT JOIN property_types pt_parent ON pt.parent_code = pt_parent.code
ORDER BY pt.parent_code NULLS FIRST, pt.display_order;

-- Compter les propriétés par type et sous-type
SELECT 
    pt.code,
    pt.label->>'fr' as type_label,
    pt.parent_code,
    COUNT(p.id) as property_count
FROM property_types pt
LEFT JOIN properties p ON pt.code = p.type_code AND p.deleted_at IS NULL
GROUP BY pt.code, pt.label, pt.parent_code
ORDER BY pt.parent_code NULLS FIRST, pt.display_order;
```

