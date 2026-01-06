# Admin Service

Service d'administration système pour Viridial.

## Responsabilités

- Gestion des utilisateurs
- Gestion des rôles et permissions
- Gestion des organisations
- Configuration i18n (labels, traductions)
- Configuration système

## APIs

- `GET /admin/users` - Liste utilisateurs
- `POST /admin/users` - Créer utilisateur
- `PUT /admin/users/:id` - Modifier utilisateur
- `GET /admin/organizations` - Liste organisations
- `GET /admin/config` - Configuration système
- `GET /admin/i18n` - Labels i18n
- `PUT /admin/i18n` - Modifier labels

## Technologies

- **Framework:** NestJS
- **Database:** PostgreSQL
- **RBAC:** Enforcement des permissions

## Stories

- **US-001:** Création d'organisation (Tenant)
- **US-004:** Gestion utilisateurs & rôles (Admin)
- **US-005:** Configuration multi-lang & labels (Admin)

## Développement

```bash
cd services/admin-service
npm install
npm run start:dev
```

## Tests

```bash
npm test
npm run test:e2e
```

