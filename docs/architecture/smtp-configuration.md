# Configuration SMTP - Viridial

Configuration de l'envoi d'emails pour Viridial via SMTP Hostinger.

## Configuration Actuelle

- **Provider:** Hostinger
- **Host:** smtp.hostinger.com
- **Port:** 465 (SSL/TLS)
- **From:** support@viridial.com
- **User:** support@viridial.com

## Utilisation dans les Services

### Service Identity (US-014)

Le service d'authentification utilise SMTP pour:
- Envoi d'emails de vérification
- Réinitialisation de mot de passe
- Invitations d'utilisateurs

**Configuration NestJS:**

```typescript
// src/config/smtp.config.ts
export const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  from: process.env.EMAIL_FROM,
  fromName: process.env.FROM_NAME,
};
```

**Utilisation avec Nodemailer:**

```typescript
import * as nodemailer from 'nodemailer';
import { smtpConfig } from './config/smtp.config';

const transporter = nodemailer.createTransport({
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,
  auth: {
    user: smtpConfig.auth.user,
    pass: smtpConfig.auth.pass,
  },
});

// Envoyer email
await transporter.sendMail({
  from: `"${smtpConfig.fromName}" <${smtpConfig.from}>`,
  to: user.email,
  subject: 'Vérification email',
  html: '<p>Votre code de vérification...</p>',
});
```

### Service Admin (US-004)

Le service admin utilise SMTP pour:
- Invitations d'organisations
- Notifications administratives

## Secrets Kubernetes

Les secrets SMTP sont stockés dans Kubernetes:

```bash
# Voir secret
kubectl get secret smtp-config -n viridial-staging -o yaml

# Utiliser dans Deployment
envFrom:
- secretRef:
    name: smtp-config
```

## Tests SMTP

### Test de Connexion

```bash
# Depuis un pod Kubernetes
kubectl run smtp-test --image=node:18-alpine -it --rm --restart=Never -- \
  sh -c "npm install -g nodemailer && node -e \"
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: 'support@viridial.com',
        pass: 'S@upport!19823'
      }
    });
    transporter.verify((error, success) => {
      if (error) console.log('Error:', error);
      else console.log('SMTP OK');
    });
  \""
```

### Test d'Envoi

```typescript
// Test unitaire
describe('SMTP Service', () => {
  it('should send email', async () => {
    const result = await emailService.sendVerificationEmail(
      'test@example.com',
      '123456'
    );
    expect(result).toBeDefined();
  });
});
```

## Sécurité

### Bonnes Pratiques

1. **Secrets dans Kubernetes:** Ne jamais hardcoder les credentials
2. **Rotation:** Changer le mot de passe SMTP régulièrement
3. **Rate Limiting:** Limiter le nombre d'emails par utilisateur
4. **Validation:** Valider les adresses email avant envoi
5. **Logs:** Logger les envois (sans credentials)

### Rate Limiting

```typescript
// Limiter à 5 emails/heure par utilisateur
const rateLimiter = new RateLimiter({
  points: 5,
  duration: 3600, // 1 heure
});

await rateLimiter.consume(userId);
```

## Monitoring

### Métriques à Surveiller

- Nombre d'emails envoyés
- Taux d'échec d'envoi
- Temps de réponse SMTP
- Quota SMTP utilisé

### Alertes

- Échec d'envoi > 5%
- Temps de réponse > 5s
- Quota SMTP > 80%

## Troubleshooting

### Erreur: "Connection timeout"

```bash
# Vérifier connectivité depuis pod
kubectl run test --image=busybox -it --rm --restart=Never -- \
  nc -zv smtp.hostinger.com 465
```

### Erreur: "Authentication failed"

- Vérifier credentials dans secret Kubernetes
- Vérifier que le compte SMTP est actif
- Vérifier firewall VPS (port 465 ouvert)

### Erreur: "Rate limit exceeded"

- Implémenter rate limiting
- Utiliser queue (RabbitMQ) pour envois asynchrones
- Vérifier quota Hostinger

## Migration Future

Pour production à grande échelle, considérer:
- **Service Email dédié:** SendGrid, Mailgun, AWS SES
- **Queue asynchrone:** RabbitMQ pour envois batch
- **Templates:** Service de templates (SendGrid, Mailchimp)
- **Tracking:** Open/click tracking

## Ressources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Hostinger SMTP Guide](https://www.hostinger.com/tutorials/how-to-use-free-email-smtp-server)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)

