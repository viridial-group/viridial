# RBAC Adaptation Summary: Resources, Features, Permissions, and Roles

## Vue d'ensemble

Ce document décrit l'adaptation du système RBAC (Role-Based Access Control) pour intégrer la gestion des **Resources** et **Features** avec les **Roles** et **Permissions**.

## Architecture RBAC Adaptée

### Structure des Entités

```
Resources (Entités système)
    ↓
Permissions (Actions sur Resources)
    ↓
Features (Regroupent des Permissions)
    ↓
Roles (Collections de Permissions)
    ↓
Users (Ont des Roles)
```

### Relations

1. **Resource → Permission** : Une Permission est toujours liée à une Resource (NOT NULL)
2. **Permission → Feature** : Une Permission peut être regroupée sous plusieurs Features (Many-to-Many)
3. **Permission → Role** : Une Permission peut être assignée à plusieurs Roles (Many-to-Many)
4. **Role → User** : Un Role peut être assigné à plusieurs Users (Many-to-Many)

## Modifications Apportées

### 1. Entité Permission (`permission.entity.ts`)

**Changements :**
- `resourceId` est maintenant **obligatoire** (NOT NULL) au lieu de nullable
- `resourceEntity` est maintenant **obligatoire** au lieu de nullable
- `onDelete: 'RESTRICT'` au lieu de `'SET NULL'` pour empêcher la suppression d'une Resource si des Permissions y sont liées

**Avant :**
```typescript
@Column({ name: 'resource_id', type: 'uuid', nullable: true })
resourceId?: string | null;

@ManyToOne(() => Resource, { nullable: true, onDelete: 'SET NULL' })
resourceEntity?: Resource | null;
```

**Après :**
```typescript
@Column({ name: 'resource_id', type: 'uuid' })
resourceId!: string;

@ManyToOne(() => Resource, { nullable: false, onDelete: 'RESTRICT' })
resourceEntity!: Resource;
```

### 2. Schéma SQL (`schema-rbac-adapted.sql`)

**Nouveau fichier créé :** `services/organization-service/sql/schema-rbac-adapted.sql`

**Améliorations :**
- `resource_id` dans `permissions` est **NOT NULL** avec contrainte `ON DELETE RESTRICT`
- Ajout de colonnes d'audit dans `user_roles` et `role_permissions` (`assigned_by`, `granted_by`)
- Ajout de contraintes CHECK pour les actions (`read`, `write`, `delete`, `admin`, `create`, `update`, `view`, `manage`)
- Ajout de contraintes CHECK pour les catégories de Resources et Features
- Index optimisés pour les requêtes fréquentes
- Commentaires SQL pour la documentation

**Structure des Tables :**

```sql
-- Resources: Entités système
CREATE TABLE resources (
    id UUID PRIMARY KEY,
    internal_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) CHECK (category IN ('core', 'admin', 'billing', 'content', 'system', 'other')),
    ...
);

-- Features: Capacités métier
CREATE TABLE features (
    id UUID PRIMARY KEY,
    internal_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) CHECK (category IN ('core', 'premium', 'addon', 'administration', 'other')),
    ...
);

-- Permissions: Actions sur Resources (LIÉES À UNE RESOURCE)
CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    resource_id UUID NOT NULL, -- OBLIGATOIRE
    resource VARCHAR(100) NOT NULL, -- Dénormalisé pour performance
    action VARCHAR(50) NOT NULL CHECK (action IN ('read', 'write', 'delete', 'admin', 'create', 'update', 'view', 'manage')),
    ...
    CONSTRAINT fk_permission_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT,
    CONSTRAINT uk_permission_resource_action UNIQUE (resource_id, action)
);

-- Roles: Collections de Permissions
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    organization_id UUID NULL, -- NULL = rôle global
    ...
);

-- Tables de jonction
CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by UUID NULL, -- Audit trail
    ...
);

CREATE TABLE role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by UUID NULL, -- Audit trail
    ...
);

CREATE TABLE feature_permissions (
    feature_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    ...
);
```

### 3. Données de Seed (`seeds-rbac-adapted.sql`)

**Nouveau fichier créé :** `services/organization-service/sql/seeds-rbac-adapted.sql`

**Contenu :**
- **Resources** : organization, user, role, permission, resource, feature, plan, subscription, property, client, analytics, settings
- **Features** : organization-management, user-management, role-management, permission-management, resource-management, feature-management, plan-management, subscription-management, property-management, client-management, analytics, settings
- **Permissions** : Pour chaque Resource, création de permissions (read, create, update, delete, admin)
- **Feature-Permission Assignments** : Liaison des permissions aux features correspondantes
- **Roles** : Super Admin, Admin, Manager, User (rôles globaux)
- **Role-Permission Assignments** : Attribution des permissions aux rôles

**Exemple de Permissions créées :**
- `organization:read`, `organization:create`, `organization:update`, `organization:delete`, `organization:admin`
- `user:read`, `user:create`, `user:update`, `user:delete`, `user:admin`
- `role:read`, `role:create`, `role:update`, `role:delete`, `role:admin`
- `permission:read`, `permission:create`, `permission:update`, `permission:delete`, `permission:admin`
- `resource:read`, `resource:create`, `resource:update`, `resource:delete`, `resource:admin`
- `feature:read`, `feature:create`, `feature:update`, `feature:delete`, `feature:admin`
- `plan:read`, `plan:create`, `plan:update`, `plan:delete`, `plan:admin`
- `subscription:read`, `subscription:create`, `subscription:update`, `subscription:delete`, `subscription:admin`

## Utilisation

### 1. Appliquer le Schéma

```bash
# Exécuter le schéma adapté
psql -U your_user -d your_database -f services/organization-service/sql/schema-rbac-adapted.sql
```

### 2. Peupler les Données Initiales

```bash
# Exécuter les seeds adaptés
psql -U your_user -d your_database -f services/organization-service/sql/seeds-rbac-adapted.sql
```

### 3. Vérifier les Données

```sql
-- Vérifier les Resources
SELECT * FROM resources ORDER BY category, name;

-- Vérifier les Features
SELECT * FROM features ORDER BY category, name;

-- Vérifier les Permissions par Resource
SELECT r.name AS resource, p.action, p.description
FROM permissions p
JOIN resources r ON p.resource_id = r.id
ORDER BY r.name, p.action;

-- Vérifier les Permissions par Feature
SELECT f.name AS feature, r.name AS resource, p.action
FROM feature_permissions fp
JOIN features f ON fp.feature_id = f.id
JOIN permissions p ON fp.permission_id = p.id
JOIN resources r ON p.resource_id = r.id
ORDER BY f.name, r.name, p.action;

-- Vérifier les Permissions par Role
SELECT ro.name AS role, r.name AS resource, p.action
FROM role_permissions rp
JOIN roles ro ON rp.role_id = ro.id
JOIN permissions p ON rp.permission_id = p.id
JOIN resources r ON p.resource_id = r.id
WHERE ro.organization_id IS NULL
ORDER BY ro.name, r.name, p.action;
```

## Avantages de cette Architecture

1. **Intégrité des Données** : Toutes les permissions sont liées à une resource (NOT NULL)
2. **Performance** : Colonne `resource` dénormalisée pour éviter les JOINs fréquents
3. **Flexibilité** : Features permettent de regrouper des permissions pour activation/désactivation en bloc
4. **Audit Trail** : Colonnes `assigned_by` et `granted_by` pour tracer qui a assigné des rôles/permissions
5. **Hiérarchie** : Support des rôles hiérarchiques via `parent_id`
6. **Séparation** : Rôles globaux (organization_id = NULL) vs rôles spécifiques à une organisation

## Migration depuis l'Ancien Schéma

Si vous avez déjà des données existantes :

1. **Backup** : Sauvegarder la base de données
2. **Nettoyer** : Supprimer les permissions sans resource_id (si elles existent)
3. **Créer Resources** : Créer les resources manquantes pour les permissions existantes
4. **Mettre à jour** : Mettre à jour les permissions pour lier `resource_id`
5. **Appliquer** : Exécuter le nouveau schéma et les seeds

## Fichiers Créés/Modifiés

### Nouveaux Fichiers
- `services/organization-service/sql/schema-rbac-adapted.sql` - Schéma SQL complet adapté
- `services/organization-service/sql/seeds-rbac-adapted.sql` - Données de seed adaptées
- `services/organization-service/sql/RBAC_ADAPTATION_SUMMARY.md` - Ce document

### Fichiers Modifiés
- `services/organization-service/src/entities/permission.entity.ts` - `resourceId` et `resourceEntity` maintenant obligatoires

## Prochaines Étapes

1. **Tester le Schéma** : Exécuter le schéma sur une base de test
2. **Vérifier les Seeds** : S'assurer que toutes les données sont correctement créées
3. **Mettre à jour les Services** : Adapter les services backend pour utiliser le nouveau schéma
4. **Mettre à jour les DTOs** : S'assurer que les DTOs reflètent les changements (resource_id obligatoire)
5. **Tests** : Créer des tests pour valider le nouveau système RBAC

## Notes Importantes

- ⚠️ **Migration Requise** : Si vous avez des données existantes, une migration est nécessaire
- ⚠️ **resource_id Obligatoire** : Toutes les nouvelles permissions doivent avoir un `resource_id`
- ✅ **Backward Compatibility** : La colonne `resource` (dénormalisée) est conservée pour compatibilité
- ✅ **Performance** : Les index sont optimisés pour les requêtes fréquentes
- ✅ **Audit Trail** : Les colonnes d'audit permettent de tracer les changements

