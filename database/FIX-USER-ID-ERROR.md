# 🔧 Fix: "column user_id contains null values" Error

## 🚨 Problème

TypeORM essaie de synchroniser le schéma et de rendre `user_id` NOT NULL, mais il y a des valeurs NULL dans la table `properties`.

**Erreur TypeORM:**
```
QueryFailedError: column "user_id" of relation "properties" contains null values
```

## ✅ Solutions

### Solution 1: Via Docker (Recommandé)

Si votre base de données PostgreSQL est dans Docker :

```bash
# 1. Démarrer le container PostgreSQL (si pas déjà démarré)
cd infrastructure/docker-compose
docker-compose up -d postgres

# 2. Exécuter le script de correction
docker exec -i viridial-postgres psql -U viridial -d viridial < database/fix-user-id-quick.sql

# Ou utiliser le script shell
./database/fix-user-id.sh
```

### Solution 2: SQL Direct

Connectez-vous à votre base de données PostgreSQL et exécutez :

```sql
-- Corriger les NULL values
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

### Solution 3: Réexécuter le Script Complet

Le script `init-database-with-test-data.sql` inclut maintenant une correction automatique :

```bash
./database/run-test-data.sh
```

### Solution 4: Désactiver Temporairement la Synchronisation TypeORM

Si vous ne pouvez pas corriger immédiatement, vous pouvez temporairement désactiver la synchronisation :

**`services/property-service/src/app.module.ts`** (ligne 47) :
```typescript
synchronize: false, // Désactiver temporairement
```

⚠️ **Attention:** Cela empêchera TypeORM de synchroniser automatiquement le schéma. Vous devrez utiliser des migrations manuelles.

## 🔍 Vérification

Après la correction, vérifiez qu'il n'y a plus de NULL :

```sql
SELECT COUNT(*) as null_count 
FROM properties 
WHERE user_id IS NULL;
-- Devrait retourner 0
```

## 📝 Fichiers Créés

- `database/fix-user-id-quick.sql` - Script SQL de correction rapide
- `database/fix-user-id.sh` - Script shell pour exécuter la correction
- `database/fix-properties-user-id.sql` - Script SQL complet avec vérifications
- `database/README-FIX-USER-ID.md` - Documentation détaillée

## 🎯 Cause Racine

Le problème se produit lorsque :
1. La table `properties` existe avec `user_id` nullable
2. Des données sont insérées avec `user_id` NULL
3. TypeORM essaie de synchroniser et rendre la colonne NOT NULL
4. PostgreSQL refuse car il y a des NULL values

## 🛡️ Prévention

Pour éviter ce problème à l'avenir :
1. ✅ Tous les INSERT dans `properties` doivent inclure un `user_id` valide
2. ✅ Le script `init-database-with-test-data.sql` corrige maintenant automatiquement les NULL
3. ✅ Utilisez des migrations TypeORM au lieu de `synchronize: true` en production

