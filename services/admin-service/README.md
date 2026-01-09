# Admin Service - Viridial

Service d'administration pour Viridial avec gestion des organisations, utilisateurs, rôles et permissions.

## 🚀 Fonctionnalités

- ✅ Gestion des organisations (CRUD)
- ✅ Gestion des utilisateurs (CRUD)
- ✅ Gestion des rôles (CRUD)
- ✅ Gestion des permissions (CRUD)
- ✅ RBAC (Role-Based Access Control)
- ✅ Isolation multi-tenant par organization_id
- ✅ TypeORM + PostgreSQL

## 📋 Endpoints

### Health Check
```
GET /admin/health
```

### Organizations
```
GET    /api/admin/organizations      # Liste toutes les organisations
GET    /api/admin/organizations/:id  # Récupère une organisation
POST   /api/admin/organizations      # Crée une organisation
PUT    /api/admin/organizations/:id  # Met à jour une organisation
DELETE /api/admin/organizations/:id  # Supprime une organisation
```

### Users
```
GET    /api/admin/users              # Liste tous les utilisateurs (avec filtres)
GET    /api/admin/users/:id          # Récupère un utilisateur
POST   /api/admin/users              # Crée un utilisateur
PUT    /api/admin/users/:id          # Met à jour un utilisateur
DELETE /api/admin/users/:id          # Supprime un utilisateur
POST   /api/admin/users/:id/reset-password  # Réinitialise le mot de passe
```

### Roles
```
GET    /api/admin/roles              # Liste tous les rôles
GET    /api/admin/roles/:id          # Récupère un rôle
POST   /api/admin/roles              # Crée un rôle
PUT    /api/admin/roles/:id          # Met à jour un rôle
DELETE /api/admin/roles/:id          # Supprime un rôle
```

### Permissions
```
GET    /api/admin/permissions        # Liste toutes les permissions
GET    /api/admin/permissions/:id    # Récupère une permission
POST   /api/admin/permissions        # Crée une permission
PUT    /api/admin/permissions/:id    # Met à jour une permission
DELETE /api/admin/permissions/:id    # Supprime une permission
```

## 🔧 Configuration

### Variables d'Environnement

```env
# Database
DATABASE_URL=postgres://viridial:123456@localhost:5432/viridial

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=3600s
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Service
PORT=3006
NODE_ENV=development
```

## 🏃 Développement

```bash
# Installation
npm install

# Développement
npm run start:dev

# Production
npm run build
npm start
```

## 🔒 Sécurité

- Tous les endpoints nécessitent une authentification JWT
- RBAC pour vérifier les permissions
- Isolation multi-tenant par `organization_id`
- Guards pour protéger les routes sensibles

