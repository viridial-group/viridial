# Viridial Web Frontend

Application Next.js pour le site public de Viridial avec authentification intégrée.

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 20+
- pnpm (recommandé) ou npm
- `auth-service` en cours d'exécution (voir `services/auth-service/README.md`)

### Installation

```bash
cd frontend/web
pnpm install
```

### Configuration

1. Copier `.env.example` vers `.env.local`:
```bash
cp .env.example .env.local
```

2. Configurer l'URL de l'API d'authentification:
```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080
```

### Développement

```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure

```
frontend/web/
├── app/
│   ├── login/          # Page de connexion
│   ├── dashboard/      # Page protégée (après login)
│   ├── layout.tsx      # Layout principal avec AuthProvider
│   └── page.tsx        # Page d'accueil (redirige vers /login)
├── components/
│   └── ui/             # Composants shadcn/ui (Button, Input, Card, etc.)
├── contexts/
│   └── AuthContext.tsx # Contexte React pour l'authentification
├── lib/
│   ├── api/
│   │   └── auth.ts     # Client API pour auth-service
│   └── auth.ts         # Utilitaires de gestion des tokens JWT
└── package.json
```

## 🔐 Authentification

### Fonctionnalités

- **Login Email/Password**: Connexion avec email et mot de passe
- **Google SSO**: Authentification via Google OAuth (PoC)
- **Gestion des tokens**: Stockage sécurisé des JWT (access + refresh)
- **Refresh automatique**: Renouvellement automatique des tokens expirés
- **Protection de routes**: Redirection automatique si non authentifié

### Utilisation

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { isAuthenticated, login, logout, accessToken } = useAuth();

  if (!isAuthenticated) {
    return <div>Non connecté</div>;
  }

  return (
    <div>
      <p>Connecté ! Token: {accessToken?.substring(0, 20)}...</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

## 🎨 Composants UI

L'application utilise [shadcn/ui](https://ui.shadcn.com/) pour les composants.

### Ajouter un composant

```bash
pnpm dlx shadcn@latest add [component-name]
```

### Composants disponibles

- `Button` - Boutons avec variantes
- `Input` - Champs de saisie
- `Label` - Labels pour formulaires
- `Card` - Cartes de contenu

## 🔗 Intégration avec auth-service

L'application frontend communique avec `auth-service` via les endpoints suivants:

- `POST /auth/login` - Connexion email/password
- `POST /auth/refresh` - Rafraîchir le token d'accès
- `GET /auth/oidc/google` - Initier l'authentification Google
- `GET /auth/oidc/google/callback` - Callback Google OAuth

## 📝 Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NEXT_PUBLIC_AUTH_API_URL` | URL de l'API auth-service | `http://localhost:8080` |

## 🧪 Tester l'Authentification

1. **Démarrer auth-service**:
   ```bash
   cd services/auth-service
   npm run start:dev
   ```

2. **Créer un utilisateur de test** (voir `services/auth-service/README.md`)

3. **Démarrer le frontend**:
   ```bash
   cd frontend/web
   pnpm dev
   ```

4. **Accéder à** `http://localhost:3000/login`

5. **Se connecter** avec les identifiants de test

## 🚀 Déploiement

### Build de production

```bash
pnpm build
pnpm start
```

### Variables d'environnement en production

Assurez-vous de configurer `NEXT_PUBLIC_AUTH_API_URL` avec l'URL de production de `auth-service`.

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Auth Service README](../../services/auth-service/README.md)
