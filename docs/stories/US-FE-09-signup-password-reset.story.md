# US-FE-09: Inscription et Réinitialisation de Mot de Passe

## Status: Draft

### Story
En tant qu'utilisateur, je veux pouvoir créer un compte et réinitialiser mon mot de passe si je l'oublie, afin d'avoir un accès complet à la plateforme Viridial.

### Acceptance Criteria
- [ ] Endpoint backend `/auth/signup` pour créer un compte
- [ ] Validation email et mot de passe côté backend (format, force)
- [ ] Hash du mot de passe avec bcrypt avant stockage
- [ ] Vérification que l'email n'existe pas déjà
- [ ] Page frontend `/signup` fonctionnelle avec formulaire complet
- [ ] Endpoint backend `/auth/forgot-password` pour demander une réinitialisation
- [ ] Endpoint backend `/auth/reset-password` pour réinitialiser avec un token
- [ ] Génération de token de réinitialisation sécurisé
- [ ] Envoi d'email avec lien de réinitialisation (via SMTP)
- [ ] Page frontend `/forgot-password` fonctionnelle
- [ ] Page frontend `/reset-password` pour réinitialiser avec token
- [ ] Validation côté client améliorée (format email, force mot de passe)
- [ ] Messages d'erreur clairs et contextuels
- [ ] Gestion des erreurs réseau et timeout

**Priority:** P0
**Estimation:** 8

### Tasks

#### Backend (auth-service)

- [ ] Créer DTO `SignupDto` avec validation (email, password, confirmPassword)
- [ ] Créer DTO `ForgotPasswordDto` (email)
- [ ] Créer DTO `ResetPasswordDto` (token, newPassword, confirmPassword)
- [ ] Créer endpoint `POST /auth/signup` dans `AuthController`
- [ ] Implémenter méthode `signup()` dans `AuthService`
  - [ ] Valider format email
  - [ ] Valider force du mot de passe (min 8 caractères, majuscule, minuscule, chiffre)
  - [ ] Vérifier que l'email n'existe pas déjà
  - [ ] Hasher le mot de passe avec bcrypt
  - [ ] Créer l'utilisateur dans la base de données
  - [ ] Générer et retourner les tokens JWT
- [ ] Créer endpoint `POST /auth/forgot-password` dans `AuthController`
- [ ] Implémenter méthode `requestPasswordReset()` dans `AuthService`
  - [ ] Vérifier que l'email existe
  - [ ] Générer un token de réinitialisation sécurisé (JWT ou UUID)
  - [ ] Stocker le token avec expiration (1h) dans la base de données
  - [ ] Envoyer un email avec le lien de réinitialisation
- [ ] Créer endpoint `POST /auth/reset-password` dans `AuthController`
- [ ] Implémenter méthode `resetPassword()` dans `AuthService`
  - [ ] Valider le token de réinitialisation
  - [ ] Vérifier que le token n'est pas expiré
  - [ ] Valider la force du nouveau mot de passe
  - [ ] Hasher le nouveau mot de passe
  - [ ] Mettre à jour le mot de passe de l'utilisateur
  - [ ] Invalider le token de réinitialisation
- [ ] Créer entity `PasswordResetToken` pour stocker les tokens
- [ ] Configurer l'envoi d'emails via SMTP (Nodemailer)

#### Frontend (frontend/web)

- [ ] Améliorer la validation côté client dans `app/login/page.tsx`
  - [ ] Validation format email en temps réel
  - [ ] Messages d'erreur contextuels
- [ ] Implémenter la page `/signup` complètement
  - [ ] Formulaire avec email, password, confirmPassword
  - [ ] Validation côté client (format email, force mot de passe, confirmation)
  - [ ] Intégration avec endpoint `/auth/signup`
  - [ ] Gestion des erreurs (email déjà utilisé, etc.)
  - [ ] Redirection vers `/login` après inscription réussie
  - [ ] Message de succès
- [ ] Implémenter la page `/forgot-password` complètement
  - [ ] Formulaire avec email
  - [ ] Validation format email
  - [ ] Intégration avec endpoint `/auth/forgot-password`
  - [ ] Message de confirmation après envoi
  - [ ] Gestion des erreurs
- [ ] Créer la page `/reset-password` (nouvelle)
  - [ ] Formulaire avec token (depuis URL), newPassword, confirmPassword
  - [ ] Validation côté client
  - [ ] Intégration avec endpoint `/auth/reset-password`
  - [ ] Redirection vers `/login` après réinitialisation réussie
  - [ ] Gestion des erreurs (token invalide, expiré, etc.)
- [ ] Ajouter méthode `signup()` dans `lib/api/auth.ts`
- [ ] Ajouter méthode `forgotPassword()` dans `lib/api/auth.ts`
- [ ] Ajouter méthode `resetPassword()` dans `lib/api/auth.ts`
- [ ] Améliorer la gestion des erreurs dans `AuthContext`
- [ ] Ajouter des toast notifications (optionnel, avec shadcn/ui toast)

### Dev Notes

#### Backend - Structure des Endpoints

**POST /auth/signup**
```typescript
Body: {
  email: string;
  password: string;
  confirmPassword: string;
}
Response: {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  }
}
```

**POST /auth/forgot-password**
```typescript
Body: {
  email: string;
}
Response: {
  message: string; // "If this email exists, a reset link has been sent"
}
```

**POST /auth/reset-password**
```typescript
Body: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
Response: {
  message: string; // "Password reset successful"
}
```

#### Frontend - Validation Côté Client

**Règles de validation email:**
- Format email valide (regex)
- Non vide

**Règles de validation mot de passe:**
- Minimum 8 caractères
- Au moins une majuscule
- Au moins une minuscule
- Au moins un chiffre
- Confirmation doit correspondre

#### Entity PasswordResetToken

```typescript
@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### Configuration SMTP

Le service doit utiliser la configuration SMTP existante :
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- Template d'email pour réinitialisation de mot de passe
- Lien de réinitialisation : `https://viridial.com/reset-password?token=...`

#### Fichiers à Créer/Modifier

**Backend:**
- `services/auth-service/src/dto/signup.dto.ts` - Nouveau
- `services/auth-service/src/dto/forgot-password.dto.ts` - Nouveau
- `services/auth-service/src/dto/reset-password.dto.ts` - Nouveau
- `services/auth-service/src/entities/password-reset-token.entity.ts` - Nouveau
- `services/auth-service/src/controllers/auth.controller.ts` - Ajouter endpoints
- `services/auth-service/src/services/auth.service.ts` - Ajouter méthodes
- `services/auth-service/src/services/email.service.ts` - Nouveau (ou utiliser service existant)

**Frontend:**
- `frontend/web/app/signup/page.tsx` - Implémenter complètement
- `frontend/web/app/forgot-password/page.tsx` - Implémenter complètement
- `frontend/web/app/reset-password/page.tsx` - Créer nouvelle page
- `frontend/web/lib/api/auth.ts` - Ajouter méthodes signup, forgotPassword, resetPassword
- `frontend/web/lib/validation.ts` - Nouveau (utilitaires de validation)

#### Configuration Requise

**Backend (.env):**
```env
# SMTP (déjà configuré)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=support@viridial.com
SMTP_PASS=...
EMAIL_FROM=support@viridial.com

# Frontend URL pour liens de réinitialisation
FRONTEND_URL=http://localhost:3000
# Ou en production:
# FRONTEND_URL=https://viridial.com
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080
```

#### Tests Manuels

1. **Inscription:**
   - Aller sur `/signup`
   - Remplir le formulaire avec email valide
   - Mot de passe conforme aux règles
   - Vérifier création du compte
   - Vérifier redirection vers `/login`
   - Tester avec email déjà existant → Erreur
   - Tester avec mot de passe faible → Erreur

2. **Mot de passe oublié:**
   - Aller sur `/forgot-password`
   - Entrer un email existant
   - Vérifier réception de l'email
   - Cliquer sur le lien dans l'email
   - Vérifier redirection vers `/reset-password?token=...`
   - Entrer un nouveau mot de passe
   - Vérifier réinitialisation réussie
   - Tester avec token expiré → Erreur
   - Tester avec token invalide → Erreur

#### Prochaines Étapes (Post-Implémentation)

- [ ] Vérification d'email (email verification)
- [ ] Expiration automatique des tokens de réinitialisation
- [ ] Rate limiting sur signup et forgot-password
- [ ] Tests unitaires et d'intégration
- [ ] Tests E2E avec Playwright/Cypress
- [ ] Amélioration UX avec animations et feedback visuel

