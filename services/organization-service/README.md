# Organization Service - Viridial

Service de gestion des organisations pour Viridial avec support multi-tenant et RBAC.

## 🚀 Fonctionnalités

- ✅ Gestion des organisations (CRUD)
- ✅ Hiérarchie d'organisations (parent-enfant)
- ✅ Gestion des adresses, téléphones, emails multiples
- ✅ Support multi-tenant avec isolation par organization_id
- ✅ Entités RBAC (Users, Roles, Permissions) intégrées
- ✅ TypeORM + PostgreSQL

## 📋 Endpoints

### Health Check
```
GET /organizations/health
```

### Organizations
```
GET    /organizations              # Liste toutes les organisations (avec filtres)
GET    /organizations/statistics   # Statistiques globales
GET    /organizations/:id          # Récupère une organisation
GET    /organizations/:id/sub-organizations  # Récupère les sous-organisations
POST   /organizations              # Crée une organisation
PUT    /organizations/:id          # Met à jour une organisation
PATCH  /organizations/:id          # Met à jour partiellement une organisation
DELETE /organizations/:id          # Supprime une organisation
POST   /organizations/bulk/delete  # Suppression en masse
POST   /organizations/bulk/update  # Mise à jour en masse
POST   /organizations/bulk/change-parent  # Changer le parent de plusieurs organisations
```

## 🔧 Configuration

### Variables d'Environnement

```env
# Database
DATABASE_URL=postgres://user:password@host:5432/database

# Server
PORT=3001
NODE_ENV=development
```

## 📊 Entités

### Organization
Gestion complète des organisations avec :
- Informations légales (SIREN, SIRET, RCS, TVA, etc.)
- Informations financières (devise, taux de commission, termes de paiement)
- Informations commerciales (secteur, spécialités, réseaux sociaux)
- Hiérarchie parent-enfant
- Plans d'abonnement (free, basic, professional, enterprise)
- Statut de conformité et licence

### User (RBAC)
- Gestion des utilisateurs liés aux organisations
- Support RBAC via UserRole
- Champs : firstName, lastName, phone, email, organizationId

### Role (RBAC)
- Rôles au niveau organisation ou global
- Many-to-Many avec Permissions
- Index unique sur [organizationId, name]

### Permission (RBAC)
- Permissions avec pattern resource/action
- Exemples : 'property:read', 'user:write', 'organization:admin'
- Index unique sur [resource, action]

### UserRole (RBAC)
- Table de jointure Users ↔ Roles
- Clé primaire composite (userId, roleId)
- Timestamp d'assignation

## 🗄️ Base de Données

### Tables Principales
- `organizations` - Organisations
- `organization_addresses` - Adresses multiples
- `organization_phones` - Téléphones multiples
- `organization_emails` - Emails multiples
- `users` - Utilisateurs (RBAC)
- `roles` - Rôles (RBAC)
- `permissions` - Permissions (RBAC)
- `role_permissions` - Jointure Roles ↔ Permissions
- `user_roles` - Jointure Users ↔ Roles

## 🧪 Tests

```bash
npm test
npm run test:e2e
```

## 🐳 Docker

```bash
# Build
docker build -t viridial/organization-service:latest .

# Run
docker run -p 3001:3001 \
  -e DATABASE_URL=postgres://... \
  viridial/organization-service:latest
```

## 📦 Dépendances

- NestJS 10
- TypeORM + PostgreSQL
- class-validator
- class-transformer

## 📚 Notes

- Les entités RBAC (User, Role, Permission, UserRole) sont disponibles pour intégration avec d'autres services
- Les organisations supportent la hiérarchie (parent-enfant)
- Isolation multi-tenant via organization_id
- Synchronisation automatique des schémas en développement (désactivée en production)
