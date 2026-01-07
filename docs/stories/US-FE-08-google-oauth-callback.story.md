# US-FE-08: Intégration Complète Google OAuth Callback Frontend

## Status: Draft

### Story
En tant qu'utilisateur, je veux pouvoir me connecter avec Google et être automatiquement redirigé vers mon tableau de bord après authentification, afin d'avoir une expérience fluide et sécurisée.

### Acceptance Criteria
- [ ] Page callback `/auth/callback` qui gère le retour depuis Google OAuth
- [ ] Récupération automatique des tokens depuis la réponse du backend
- [ ] Stockage des tokens dans localStorage via AuthContext
- [ ] Redirection automatique vers `/dashboard` après authentification réussie
- [ ] Gestion des erreurs (refus d'autorisation, erreur réseau, etc.)
- [ ] Loading state pendant le traitement du callback
- [ ] Message d'erreur clair si l'authentification échoue

**Priority:** P0
**Estimation:** 3

### Tasks
- [ ] Créer la page `/app/auth/callback/page.tsx`
- [ ] Implémenter la logique de récupération des tokens depuis l'URL ou le backend
- [ ] Intégrer avec AuthContext pour stocker les tokens
- [ ] Gérer les cas d'erreur (refus, timeout, erreur réseau)
- [ ] Ajouter des loading states et feedback utilisateur
- [ ] Tester le flow complet : Login → Google → Callback → Dashboard
- [ ] Mettre à jour la documentation d'intégration

### Dev Notes

#### Contexte
Le backend `auth-service` expose un endpoint `/auth/oidc/google/callback` qui retourne les tokens en JSON après authentification Google réussie. Actuellement, le frontend redirige vers cet endpoint backend, mais il n'y a pas de page frontend pour gérer le callback et stocker les tokens.

#### Solution Proposée

**Option 1: Callback Backend → Redirection Frontend avec Tokens (Recommandé)**
1. Modifier le backend pour rediriger vers le frontend avec les tokens en paramètres URL (hash ou query)
2. Créer une page frontend `/auth/callback` qui :
   - Extrait les tokens de l'URL
   - Les stocke via AuthContext
   - Redirige vers `/dashboard`

**Option 2: Callback Backend → API Frontend**
1. Le backend redirige vers `/auth/callback?code=...`
2. La page frontend `/auth/callback` :
   - Récupère le code depuis l'URL
   - Appelle un endpoint frontend qui communique avec le backend
   - Reçoit les tokens et les stocke

**Option 3: Popup Window (Future)**
- Utiliser une popup pour l'authentification Google
- Communication postMessage entre popup et parent window
- Plus complexe mais meilleure UX

#### Implémentation Recommandée (Option 1)

**Backend Modification:**
```typescript
// services/auth-service/src/controllers/auth.controller.ts
@Get('oidc/google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthCallback(@Req() req: any, @Res() res: Response) {
  const googleProfile = req.user;
  const user = await this.oidcService.findOrCreateUser(googleProfile);
  const tokens = await this.oidcService.generateTokens(user);
  
  // Rediriger vers le frontend avec les tokens dans le hash
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const redirectUrl = `${frontendUrl}/auth/callback#access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`;
  
  return res.redirect(redirectUrl);
}
```

**Frontend Page:**
```typescript
// frontend/web/app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { login } = useAuth(); // Ou méthode setTokens directement
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extraire les tokens du hash de l'URL
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const errorParam = params.get('error');

    if (errorParam) {
      setError('Authentification Google échouée');
      setIsLoading(false);
      return;
    }

    if (accessToken && refreshToken) {
      // Stocker les tokens via AuthContext
      tokenStorage.setTokens(accessToken, refreshToken);
      // Mettre à jour l'état d'authentification
      // Rediriger vers dashboard
      router.push('/dashboard');
    } else {
      setError('Tokens manquants');
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return <div>Connexion en cours...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Erreur: {error}</p>
        <Link href="/login">Retour à la connexion</Link>
      </div>
    );
  }

  return null;
}
```

#### Fichiers à Créer/Modifier

**Frontend:**
- `frontend/web/app/auth/callback/page.tsx` - Page de callback
- `frontend/web/lib/api/auth.ts` - Ajouter méthode pour gérer le callback si nécessaire
- `frontend/web/contexts/AuthContext.tsx` - Ajouter méthode `setTokens()` si absente

**Backend:**
- `services/auth-service/src/controllers/auth.controller.ts` - Modifier callback pour rediriger vers frontend
- `services/auth-service/.env` - Ajouter `FRONTEND_URL`

**Documentation:**
- `frontend/web/INTEGRATION-AUTH.md` - Mettre à jour avec le flow callback

#### Configuration Requise

**Backend (.env):**
```env
FRONTEND_URL=http://localhost:3000
# Ou en production:
# FRONTEND_URL=https://viridial.com
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080
```

#### Tests Manuels

1. **Flow Complet:**
   - Aller sur `/login`
   - Cliquer sur "Continuer avec Google"
   - S'authentifier avec Google
   - Vérifier redirection vers `/auth/callback`
   - Vérifier redirection automatique vers `/dashboard`
   - Vérifier que les tokens sont stockés dans localStorage

2. **Gestion d'Erreurs:**
   - Refuser l'autorisation Google → Vérifier message d'erreur
   - Erreur réseau → Vérifier message d'erreur
   - Tokens manquants → Vérifier message d'erreur

#### Prochaines Étapes (Post-Implémentation)

- [ ] Améliorer l'UX avec des animations de chargement
- [ ] Ajouter des toast notifications pour feedback
- [ ] Implémenter Option 3 (Popup) pour une meilleure UX
- [ ] Tests E2E avec Playwright/Cypress
- [ ] Gestion du refresh token automatique

