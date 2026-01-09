# Marketing Service - Viridial

Service d'automatisation marketing complet pour Viridial, permettant de gérer les campagnes, workflows, leads, et analytics.

## 🎯 Fonctionnalités

### 📧 Email Marketing
- **Campagnes email** : Création, planification et envoi de campagnes
- **Templates d'email** : Gestion de templates avec variables Handlebars
- **Queue d'envoi** : Système de queue pour gérer les envois en masse
- **Tracking** : Suivi des ouvertures, clics, bounces
- **Désabonnement** : Gestion automatique des désabonnements

### 🤖 Workflows d'Automatisation
- **Workflows visuels** : Création de workflows multi-étapes
- **Déclencheurs** : Lead créé, form soumis, email ouvert/cliqué, date
- **Actions** : Envoyer email, attendre, mettre à jour lead, ajouter/retirer segment
- **Conditions** : Logique conditionnelle dans les workflows

### 👥 Gestion des Leads
- **CRM intégré** : Gestion complète des leads
- **Lead scoring** : Calcul automatique du score
- **Segmentation** : Segments statiques et dynamiques
- **Statuts** : Nouveau, contacté, qualifié, converti, désabonné

### 📊 Analytics & Reporting
- **Tracking complet** : Événements email, formulaires, conversions
- **Statistiques** : Taux d'ouverture, clics, conversion
- **Rapports** : Statistiques par campagne, segment, période
- **Real-time** : Mise à jour en temps réel des métriques

### 📝 Formulaires & Landing Pages
- **Formulaires** : Création de formulaires de capture
- **Landing pages** : Gestion de landing pages
- **Submissions** : Traitement automatique des soumissions
- **Intégration** : Déclenchement automatique de workflows

### 🎯 Segmentation
- **Segments statiques** : Ajout manuel de leads
- **Segments dynamiques** : Filtres automatiques
- **Conditions** : Filtres par statut, source, champs personnalisés

## 🏗️ Architecture

### Entités Principales

```
Campaign          → Campagnes email
EmailTemplate     → Templates d'emails
MarketingLead     → Leads marketing
EmailQueue        → Queue d'envoi d'emails
Workflow          → Workflows d'automatisation
WorkflowStep      → Étapes d'un workflow
Segment           → Segments d'audience
LandingPage       → Landing pages
Form              → Formulaires
FormField         → Champs de formulaire
FormSubmission    → Soumissions de formulaire
Analytics         → Événements analytics
```

### Services

- **EmailService** : Envoi d'emails, queue, tracking
- **CampaignService** : Gestion des campagnes
- **WorkflowService** : Exécution des workflows
- **LeadService** : Gestion des leads et scoring
- **SegmentService** : Segmentation d'audience
- **FormService** : Gestion des formulaires
- **LandingPageService** : Gestion des landing pages
- **AnalyticsService** : Tracking et statistiques
- **CronService** : Tâches planifiées (queue, workflows)

## 🚀 Démarrage

### Installation

```bash
cd services/marketing-service
npm install
```

### Configuration

Variables d'environnement requises :

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/viridial

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
SMTP_FROM=noreply@viridial.com

# Frontend (pour les URLs de tracking)
FRONTEND_URL=http://localhost:3000

# Port du service
PORT=3005
```

### Développement

```bash
npm run start:dev
```

Le service sera disponible sur `http://localhost:3005`

### Build

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Campagnes

```
GET    /marketing/campaigns              → Liste des campagnes
POST   /marketing/campaigns              → Créer une campagne
GET    /marketing/campaigns/:id          → Détails d'une campagne
PUT    /marketing/campaigns/:id          → Modifier une campagne
DELETE /marketing/campaigns/:id          → Supprimer une campagne
POST   /marketing/campaigns/:id/schedule → Planifier l'envoi
POST   /marketing/campaigns/:id/send     → Envoyer la campagne
```

### Templates Email

```
GET    /marketing/email-templates        → Liste des templates
POST   /marketing/email-templates        → Créer un template
GET    /marketing/email-templates/:id    → Détails d'un template
PUT    /marketing/email-templates/:id    → Modifier un template
DELETE /marketing/email-templates/:id    → Supprimer un template
```

### Leads

```
GET    /marketing/leads                  → Liste des leads
POST   /marketing/leads                  → Créer un lead
GET    /marketing/leads/:id              → Détails d'un lead
PUT    /marketing/leads/:id              → Modifier un lead
DELETE /marketing/leads/:id              → Supprimer un lead
POST   /marketing/leads/:id/segments/:segmentId → Ajouter au segment
```

### Workflows

```
GET    /marketing/workflows              → Liste des workflows
POST   /marketing/workflows              → Créer un workflow
GET    /marketing/workflows/:id          → Détails d'un workflow
PUT    /marketing/workflows/:id          → Modifier un workflow
POST   /marketing/workflows/:id/activate → Activer un workflow
POST   /marketing/workflows/:id/trigger  → Déclencher pour un lead
```

### Formulaires

```
GET    /marketing/forms                  → Liste des formulaires
POST   /marketing/forms                  → Créer un formulaire
POST   /marketing/forms/:id/submit       → Soumettre (public)
GET    /marketing/forms/:id              → Détails d'un formulaire
```

### Analytics

```
GET    /marketing/analytics/stats                    → Statistiques globales
GET    /marketing/analytics/campaigns/:id/stats      → Stats d'une campagne
```

### Tracking

```
GET    /marketing/track/open/:trackingId      → Pixel de tracking (ouverture)
GET    /marketing/track/click/:trackingId     → Tracking de clic
GET    /marketing/track/unsubscribe/:leadId   → Désabonnement
```

## 🔄 Tâches Automatiques (Cron)

Le service exécute automatiquement :

- **Toutes les minutes** : Traitement de la queue d'emails
- **Toutes les 5 minutes** : Traitement des workflows en attente
- **Toutes les heures** : Mise à jour des statistiques des campagnes

## 📧 Système d'Email

### Templates avec Variables

Les templates utilisent Handlebars pour le rendu :

```handlebars
Bonjour {{firstName}},

Merci de vous être inscrit sur Viridial !

Vous pouvez maintenant :
- Gérer vos propriétés
- Rechercher des biens
- Estimer des prix

Besoin d'aide ? Répondez simplement à cet email.

L'équipe Viridial

---
<a href="{{unsubscribeUrl}}">Se désabonner</a>
```

Variables disponibles :
- `{{firstName}}`, `{{lastName}}`, `{{email}}`
- `{{unsubscribeUrl}}` : URL de désabonnement
- Variables personnalisées définies dans le template

### Tracking

Chaque email contient :
- **Pixel de tracking** : 1x1 image transparente pour détecter l'ouverture
- **URLs trackées** : Tous les liens sont trackés automatiquement
- **Statistiques** : Ouvertures, clics, bounces en temps réel

## 🤖 Workflows

### Types de Déclencheurs

- **lead_created** : Quand un nouveau lead est créé
- **lead_updated** : Quand un lead est mis à jour
- **form_submitted** : Quand un formulaire est soumis
- **email_opened** : Quand un email est ouvert
- **email_clicked** : Quand un lien est cliqué
- **date_reached** : À une date/heure spécifique

### Types d'Actions

- **send_email** : Envoyer un email
- **wait** : Attendre X minutes/heures/jours
- **update_lead** : Mettre à jour les champs d'un lead
- **add_to_segment** : Ajouter le lead à un segment
- **remove_from_segment** : Retirer le lead d'un segment
- **condition** : Branchement conditionnel

### Exemple de Workflow

```
1. Lead créé (déclencheur)
   ↓
2. Envoyer email de bienvenue (action)
   ↓
3. Attendre 3 jours (action)
   ↓
4. Envoyer email de nurturing (action)
   ↓
5. Si email ouvert → Ajouter au segment "Engaged" (condition)
```

## 📊 Analytics

### Événements Trackés

- `EMAIL_SENT` : Email envoyé
- `EMAIL_OPENED` : Email ouvert
- `EMAIL_CLICKED` : Lien cliqué
- `EMAIL_BOUNCED` : Email en erreur
- `EMAIL_UNSUBSCRIBED` : Désabonnement
- `FORM_SUBMITTED` : Formulaire soumis
- `LEAD_CREATED` : Lead créé
- `LEAD_UPDATED` : Lead mis à jour
- `CONVERSION` : Conversion (lead → client)

### Métriques Calculées

- Taux d'ouverture email
- Taux de clic email
- Taux de conversion
- Taux de rebond
- Score moyen des leads
- Taux de désabonnement

## 🔗 Intégration avec les Autres Services

### auth-service
- Authentification des requêtes
- Récupération de l'organizationId depuis le JWT

### lead-service (optionnel)
- Synchronisation des leads
- Enrichissement des données

## 📝 Exemples d'Utilisation

### Créer une Campagne

```typescript
const campaign = await fetch('/api/marketing/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Email de bienvenue',
    type: 'email',
    emailTemplateId: 'template-uuid',
    segmentId: 'segment-uuid',
    subject: 'Bienvenue sur Viridial !',
    scheduledAt: '2025-01-15T09:00:00Z',
  }),
});
```

### Créer un Workflow

```typescript
const workflow = await fetch('/api/marketing/workflows', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Nurturing nouveau lead',
    trigger: 'lead_created',
    steps: [
      { type: 'send_email', emailTemplateId: 'welcome-uuid', order: 1 },
      { type: 'wait', waitDuration: 3, waitDurationType: 'days', order: 2 },
      { type: 'send_email', emailTemplateId: 'nurture-uuid', order: 3 },
    ],
  }),
});
```

### Soumettre un Formulaire (Public)

```typescript
const result = await fetch('/api/marketing/forms/form-uuid/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+33612345678',
    organizationId: 'org-uuid',
  }),
});
```

## 🐳 Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3005
CMD ["npm", "start"]
```

## 📚 Documentation Complète

Voir les DTOs dans `src/dto/` pour les formats de données détaillés.

## 🔐 Sécurité

- Toutes les routes nécessitent une authentification (à implémenter)
- Vérification de l'organizationId sur toutes les requêtes
- Validation des données avec class-validator
- Protection contre les injections SQL (TypeORM)
- Gestion sécurisée du désabonnement (UUID)

## 🚧 TODO / Améliorations Futures

- [ ] Intégration avec auth-service pour JWT
- [ ] Support SMS et Push notifications
- [ ] A/B testing des campagnes
- [ ] Workflow builder visuel
- [ ] Export des rapports en PDF
- [ ] Intégration avec services externes (Mailchimp, SendGrid)
- [ ] Support multi-langues pour les templates
- [ ] A/B testing des sujets d'email
- [ ] Machine learning pour l'optimisation des envois

