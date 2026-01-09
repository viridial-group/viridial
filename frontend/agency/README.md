# Viridial Agency Frontend

Interface d'administration moderne pour la gestion multi-tenant des organisations, utilisateurs, rôles et permissions.

## 🚀 Démarrage rapide

### Installation

```bash
cd frontend/agency
pnpm install
```

### Développement

```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:3007`

### Build de production

```bash
pnpm build
pnpm start
```

## 📁 Structure

```
frontend/agency/
├── app/                    # Pages Next.js
│   ├── dashboard/          # Pages du tableau de bord
│   │   ├── organizations/  # Gestion des organisations
│   │   ├── users/          # Gestion des utilisateurs
│   │   └── roles/          # Gestion des rôles & permissions
│   ├── login/              # Page de connexion
│   └── layout.tsx          # Layout principal
├── components/             # Composants React
│   ├── layout/             # Composants de layout
│   └── ui/                 # Composants UI réutilisables
├── contexts/               # Contextes React
│   ├── AuthContext.tsx     # Gestion de l'authentification
│   └── OrganizationContext.tsx  # Gestion des organisations
└── lib/                    # Utilitaires et API clients
    ├── api/                # Clients API
    │   ├── auth.ts         # API authentification
    │   ├── organization.ts # API organisations
    │   └── user.ts         # API utilisateurs
    └── utils.ts            # Utilitaires
```

## 🔌 Services backend

L'application consomme les services suivants :

- **auth-service** (`localhost:8080`) : Authentification et gestion des utilisateurs
- **admin-service** (`localhost:3006/api/admin`) : Gestion des organisations, utilisateurs, rôles

## 🔐 Authentification

L'authentification utilise JWT avec access token et refresh token stockés dans localStorage.

## 🎨 UI/UX

- Design moderne avec Tailwind CSS
- Composants shadcn/ui
- Interface responsive
- Animations et transitions fluides
- Mode sombre prêt (non activé par défaut)

## 📝 Fonctionnalités

- ✅ Authentification (login/logout)
- ✅ Gestion des organisations (CRUD)
- ✅ Gestion des utilisateurs (CRUD)
- ✅ Gestion des rôles et permissions (visualisation)
- 🔄 Gestion des rôles personnalisés (à venir)
- 🔄 Édition des permissions (à venir)

