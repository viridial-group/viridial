# Fix NULL user_id Error

## Problème

L'erreur `column "user_id" of relation "properties" contains null values` se produit lorsque :
- TypeORM essaie de synchroniser le schéma et de rendre `user_id` NOT NULL
- Il existe des valeurs NULL dans la colonne `user_id` de la table `properties`

## Solution Rapide

### Option 1: Via Docker (si PostgreSQL est dans Docker)

```bash
# Trouver le nom du container PostgreSQL
docker ps | grep postgres

# Exécuter le script de correction
docker exec -i <container-name> psql -U viridial -d viridial < database/fix-user-id-quick.sql

# Ou utiliser le script shell
./database/fix-user-id.sh
```

### Option 2: Via psql direct (si installé localement)

```bash
psql -U viridial -d viridial -f database/fix-user-id-quick.sql
```

### Option 3: SQL direct dans psql

Connectez-vous à votre base de données et exécutez :

```sql
-- Corriger les NULL
UPDATE properties
SET user_id = COALESCE(
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  '00000000-0000-0000-0000-000000000001'::uuid
)
WHERE user_id IS NULL;

-- Rendre la colonne NOT NULL
ALTER TABLE properties ALTER COLUMN user_id SET NOT NULL;
```

### Option 4: Via le script complet

Le script `init-database-with-test-data.sql` inclut maintenant une section finale qui corrige automatiquement les NULL values. Réexécutez-le :

```bash
./database/run-test-data.sh
```

## Vérification

Après la correction, vérifiez qu'il n'y a plus de NULL :

```sql
SELECT COUNT(*) FROM properties WHERE user_id IS NULL;
-- Devrait retourner 0
```

## Prévention

Pour éviter ce problème à l'avenir :
1. Assurez-vous que tous les INSERT dans `properties` incluent un `user_id` valide
2. Utilisez des migrations TypeORM au lieu de `synchronize: true` en production
3. Le script `init-database-with-test-data.sql` corrige maintenant automatiquement les NULL avant de rendre la colonne NOT NULL

