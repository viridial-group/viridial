# Implémentation Backend - Signup & Password Reset

Ce document contient toutes les instructions pour implémenter les endpoints signup, forgot-password et reset-password dans `auth-service`.

## 📋 Prérequis

### 1. Corriger les permissions (si nécessaire)

```bash
cd /Users/mac/viridial
sudo chown -R $(whoami) services/auth-service/src/
```

### 2. Installer nodemailer

```bash
cd services/auth-service
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## 📁 Fichiers à créer

Tous les fichiers sont prêts dans `/tmp/`. Copie-les avec :

```bash
cd /Users/mac/viridial
sudo cp /tmp/signup.dto.ts services/auth-service/src/dto/
sudo cp /tmp/forgot-password.dto.ts services/auth-service/src/dto/
sudo cp /tmp/reset-password.dto.ts services/auth-service/src/dto/
sudo cp /tmp/password-reset-token.entity.ts services/auth-service/src/entities/
sudo cp /tmp/email.service.ts services/auth-service/src/services/
```

## 🔧 Modifications à apporter

### 1. `app.module.ts`

**Ajouter les imports:**
```typescript
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { EmailService } from './services/email.service';
```

**Modifier `TypeOrmModule.forFeature`:**
```typescript
TypeOrmModule.forFeature([User, PasswordResetToken]),
```

**Ajouter `EmailService` dans `providers`:**
```typescript
providers: [AuthService, OidcService, GoogleStrategy, EmailService],
```

### 2. `auth.service.ts`

**Ajouter les imports:**
```typescript
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { EmailService } from './email.service';
import { randomBytes } from 'crypto';
import { HttpException, HttpStatus, ConflictException, BadRequestException } from '@nestjs/common';
```

**Modifier le constructor:**
```typescript
constructor(
  private readonly jwtService: JwtService,
  @InjectRepository(User)
  private readonly userRepo: any,
  @InjectRepository(PasswordResetToken)
  private readonly resetTokenRepo: any,
  private readonly emailService: EmailService,
) {}
```

**Ajouter les méthodes (voir `/tmp/auth.service.updates.ts` pour le code complet):**
- `signup(email, password, confirmPassword)`
- `requestPasswordReset(email)`
- `resetPassword(token, newPassword, confirmPassword)`

### 3. `auth.controller.ts`

**Ajouter les imports:**
```typescript
import { SignupDto } from '../dto/signup.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
```

**Ajouter les endpoints (voir `/tmp/auth.controller.updates.ts` pour le code complet):**
- `POST /auth/signup`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

## 📝 Code complet des méthodes

Voir les fichiers dans `/tmp/`:
- `/tmp/auth.service.updates.ts` - Méthodes à ajouter dans AuthService
- `/tmp/auth.controller.updates.ts` - Endpoints à ajouter dans AuthController
- `/tmp/app.module.updates.ts` - Modifications pour AppModule

## ⚙️ Configuration requise

**Variables d'environnement (.env):**
```env
# SMTP (déjà configuré normalement)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@viridial.com
SMTP_PASS=...
EMAIL_FROM=support@viridial.com
FROM_NAME=Viridial Support

# Frontend URL pour liens de réinitialisation
FRONTEND_URL=http://localhost:3000
# Ou en production:
# FRONTEND_URL=https://viridial.com
```

## 🧪 Tests

Après implémentation, tester avec:

```bash
# 1. Démarrer auth-service
cd services/auth-service
npm run start:dev

# 2. Tester signup
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","confirmPassword":"Test1234"}'

# 3. Tester forgot-password
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 4. Tester reset-password (avec token reçu par email)
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"...","newPassword":"NewPass1234","confirmPassword":"NewPass1234"}'
```

## ✅ Checklist

- [ ] Permissions corrigées
- [ ] nodemailer installé
- [ ] Fichiers DTO créés (3 fichiers)
- [ ] Entity PasswordResetToken créée
- [ ] Service EmailService créé
- [ ] AppModule mis à jour
- [ ] AuthService mis à jour (3 méthodes)
- [ ] AuthController mis à jour (3 endpoints)
- [ ] Variables d'environnement configurées
- [ ] Tests manuels effectués

