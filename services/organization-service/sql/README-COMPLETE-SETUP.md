# Complete Database Setup - Guide d'utilisation

## Vue d'ensemble

Le fichier `complete-database-setup.sql` est un script SQL complet qui combine :
- **Schéma complet** : Toutes les tables, contraintes, index et relations
- **Seeds RBAC** : Resources, Features, Permissions, Roles et leurs relations
- **Organizations** : 3 organisations d'exemple avec adresses, téléphones, emails
- **Users** : 4 utilisateurs d'exemple (1 super admin + 3 org admins)
- **Plans** : Tous les plans (Pilot, Growth, Professional, Enterprise, AI) avec features et limits
- **Subscriptions** : Abonnements actifs pour les organisations d'exemple
- **User Roles** : Assignation de rôles aux utilisateurs
- **User Plans** : Liaison des utilisateurs aux subscriptions

## Structure du fichier

Le fichier est organisé en sections séquentielles :

1. **Schéma** (`schema-rbac-adapted.sql`)
   - Drop des tables existantes
   - Création de toutes les tables
   - Index et contraintes
   - Commentaires de documentation

2. **Seeds RBAC** (`seeds-rbac-adapted.sql`)
   - 12 Resources (organization, user, role, permission, resource, feature, plan, subscription, property, client, analytics, settings)
   - 12 Features (organization-management, user-management, role-management, etc.)
   - ~60 Permissions (read, create, update, delete, admin pour chaque resource)
   - 4 Roles globaux (Super Admin, Admin, Manager, User)
   - Assignations Feature-Permission
   - Assignations Role-Permission

3. **Organizations** (`organizations-seed.sql`)
   - 3 organisations d'exemple :
     - Viridial Real Estate (parent, professional plan)
     - Property Management Pro (child, basic plan)
     - Luxury Developments (standalone, enterprise plan)
   - Adresses, téléphones, emails pour chaque organisation
   - 4 utilisateurs (1 super admin + 3 org admins)

4. **Plans** (`seeds-plans.sql`)
   - 10 plans (Pilot, Growth, Professional, Enterprise, AI × monthly/annual)
   - Plan Features pour chaque plan
   - Plan Limits pour chaque plan
   - 3 Booster Packs (Extra Users, Storage Boost, Email Boost)

5. **Super Admin** (`create-super-admin.sql`)
   - Création de l'organisation "Viridial SaaS Administration"
   - Création du super admin user (admin@viridial.com)
   - Assignation du rôle "Super Admin"

6. **Assignations finales**
   - Assignation de rôles aux users des organisations
   - Création de subscriptions pour les organisations
   - Liaison users-subscriptions via user_plans

## Utilisation

### Option 1 : Exécution complète (recommandé pour nouvelle base)

```bash
# Exécuter le script complet
psql $DATABASE_URL -f sql/complete-database-setup.sql
```

### Option 2 : Exécution séquentielle (pour debug)

```bash
# 1. Schéma uniquement
psql $DATABASE_URL -f sql/schema-rbac-adapted.sql

# 2. Seeds RBAC
psql $DATABASE_URL -f sql/seeds-rbac-adapted.sql

# 3. Organizations et users
psql $DATABASE_URL -f sql/organizations-seed.sql

# 4. Plans
psql $DATABASE_URL -f sql/seeds-plans.sql

# 5. Super Admin
psql $DATABASE_URL -f sql/create-super-admin.sql
```

## Données créées

### Resources (12)
- organization, user, role, permission, resource, feature
- plan, subscription, property, client
- analytics, settings

### Features (12)
- organization-management, user-management, role-management
- permission-management, resource-management, feature-management
- plan-management, subscription-management
- property-management, client-management
- analytics, settings

### Permissions (~60)
- Pour chaque resource : read, create, update, delete, admin
- Toutes liées à leur resource (resource_id NOT NULL)

### Roles (4 globaux)
- **Super Admin** : Toutes les permissions
- **Admin** : Permissions admin pour resources core
- **Manager** : Read, create, update pour resources core
- **User** : Read uniquement pour resources core

### Organizations (3)
1. **Viridial Real Estate**
   - Plan: professional
   - 2 adresses (headquarters + branch)
   - 3 téléphones (main, sales, support)
   - 4 emails (main, sales, support, billing)
   - 2 users (admin, agent)

2. **Property Management Pro**
   - Plan: basic
   - Parent: Viridial Real Estate
   - 1 adresse, 1 téléphone, 1 email
   - 1 user (admin)

3. **Luxury Developments**
   - Plan: enterprise
   - 1 adresse, 1 téléphone, 1 email
   - 1 user (admin)

### Users (5)
- **admin@viridial.com** : Super Admin (rôle Super Admin)
- **admin@viridial-real-estate.fr** : Admin (rôle Admin)
- **marie.martin@viridial-real-estate.fr** : Agent (rôle Manager)
- **admin@property-management-pro.fr** : Admin (rôle Admin)
- **admin@luxury-developments.fr** : Admin (rôle Admin)

### Plans (10)
- ONE PILOT (monthly) - Free
- ONE GROWTH (monthly/annual) - $12/$10
- ONE PROFESSIONAL (monthly/annual) - $30/$25
- ONE ENTERPRISE (monthly/annual) - $42/$35
- ONE AI (monthly/annual) - $50/$42

### Subscriptions (3)
- Viridial Real Estate → Professional (monthly, $30)
- Property Management Pro → Growth (monthly, $12)
- Luxury Developments → Enterprise (monthly, $42)

## Credentials par défaut

### Super Admin
- **Email** : `admin@viridial.com`
- **Password** : `Admin@123456`
- **Rôle** : Super Admin (toutes les permissions)

### Organization Users
- **Password** : `Password123!` (pour tous les users des organisations)
- **Emails** :
  - `admin@viridial-real-estate.fr` (Admin)
  - `marie.martin@viridial-real-estate.fr` (Manager)
  - `admin@property-management-pro.fr` (Admin)
  - `admin@luxury-developments.fr` (Admin)

⚠️ **IMPORTANT** : Changez tous les mots de passe après la première connexion !

## Vérification

Après l'exécution, le script affiche un résumé avec les statistiques :
- Nombre de Resources créées
- Nombre de Features créées
- Nombre de Permissions créées
- Nombre de Roles créés
- Nombre de Users créés
- Nombre d'Organizations créées
- Nombre de Plans créés
- Nombre de Subscriptions créées

## Notes importantes

1. **resource_id NOT NULL** : Toutes les permissions doivent être liées à une resource
2. **ON DELETE RESTRICT** : Les resources ne peuvent pas être supprimées si des permissions y sont liées
3. **Rôles globaux vs organisationnels** : Les rôles créés sont globaux (organization_id = NULL)
4. **Subscriptions actives** : Les subscriptions sont créées avec status 'active' et dates de période valides
5. **User Plans** : Tous les users sont automatiquement liés à la subscription de leur organisation

## Dépannage

### Erreur : "Super Admin role not found"
- Assurez-vous que `seeds-rbac-adapted.sql` a été exécuté avant `create-super-admin.sql`

### Erreur : "Foreign key constraint violation"
- Vérifiez l'ordre d'exécution des sections
- Le schéma doit être créé avant les seeds

### Erreur : "Duplicate key violation"
- Le script utilise `ON CONFLICT DO NOTHING` pour éviter les doublons
- Si vous réexécutez, les données existantes seront préservées

## Prochaines étapes

1. **Vérifier les données** : Connectez-vous avec le super admin et vérifiez les organisations, users, plans
2. **Changer les mots de passe** : Changez tous les mots de passe par défaut
3. **Créer des rôles organisationnels** : Créez des rôles spécifiques à chaque organisation si nécessaire
4. **Configurer les features** : Activez/désactivez les features selon les besoins des organisations
5. **Gérer les subscriptions** : Ajustez les subscriptions selon les besoins réels

