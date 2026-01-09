# Email Templates - Guide d'Utilisation

Ce dossier contient tous les templates d'email professionnels pour le marketing automation de Viridial.

## 📁 Structure

```
templates/
├── index.ts                           # Export central de tous les templates
├── email-templates-welcome.ts         # Série de bienvenue (3 templates)
├── email-templates-nurturing.ts       # Série nurturing/éducation (3 templates)
├── email-templates-conversion.ts      # Série conversion/vente (2 templates)
├── email-templates-reactivation.ts    # Série réactivation (2 templates)
└── README.md                          # Ce fichier
```

## 🎯 Catégories de Templates

### 1. Welcome Series (Bienvenue)
**Objectif** : Accueillir chaleureusement et guider les nouveaux utilisateurs

| Template ID | Nom | Envoyé après | Taux d'ouverture cible |
|-------------|-----|--------------|------------------------|
| `welcome_instant` | Email de Bienvenue Immédiat | Immédiatement | 40-50% |
| `welcome_guide_tips` | Guide "10 Conseils pour Trouver Votre Bien" | 1h | 25-35% |
| `welcome_agency_intro` | Présentation de l'Agence | J+2 | 20-30% |

**Utilisation** : Déclenché automatiquement lors de la création d'un lead (`LEAD_CREATED`)

### 2. Nurturing Series (Éducation)
**Objectif** : Éduquer, apporter de la valeur, construire la relation

| Template ID | Nom | Envoyé après | Taux d'ouverture cible |
|-------------|-----|--------------|------------------------|
| `nurturing_errors_avoid` | Les 5 Erreurs à Éviter lors de l'Achat | J+1 | 30-40% |
| `nurturing_financing_guide` | Guide Financement Immobilier | J+4 | 25-35% |
| `nurturing_virtual_tour` | Visite Virtuelle - Guide Complet | J+7 | 20-30% |

**Utilisation** : Utilisé dans les workflows de nurturing automatiques

### 3. Conversion Series (Vente)
**Objectif** : Convertir les leads en clients payants, créer l'urgence

| Template ID | Nom | Envoyé après | Taux d'ouverture cible |
|-------------|-----|--------------|------------------------|
| `trial_ending_soon` | Essai se termine bientôt - Urgence | J-3 (avant fin essai) | 35-45% |
| `trial_last_chance` | Dernière chance - Essai se termine demain | J-1 | 40-50% |

**Utilisation** : Déclenché automatiquement à des dates précises (`DATE_REACHED`)

### 4. Reactivation Series (Réengagement)
**Objectif** : Réactiver les leads inactifs, ramener les utilisateurs

| Template ID | Nom | Envoyé après | Taux d'ouverture cible |
|-------------|-----|--------------|------------------------|
| `we_miss_you` | Nous vous manquons ? | 30 jours d'inactivité | 20-30% |
| `special_offer_return` | Offre Spéciale de Retour | 60 jours d'inactivité | 15-25% |

**Utilisation** : Déclenché après une période d'inactivité (`DATE_REACHED`)

## 📧 Structure d'un Template

Chaque template contient :

```typescript
{
  subject: string,                    // Sujet de l'email (avec variables)
  subjectVariations: string[],        // Variations A/B testing du sujet
  htmlContent: string,                // Contenu HTML complet
  textContent: string,                // Version texte brut (fallback)
  variables: {                        // Variables dynamiques disponibles
    [key: string]: 'string' | 'number'
  }
}
```

## 🔧 Variables Disponibles

Tous les templates utilisent des variables qui seront remplacées dynamiquement :

### Variables Communes
- `{{firstName}}` : Prénom du destinataire
- `{{trialUrl}}` : URL de l'essai gratuit
- `{{demoUrl}}` : URL pour réserver une démo
- `{{unsubscribeUrl}}` : URL de désabonnement
- `{{preferencesUrl}}` : URL de gestion des préférences

### Variables Spécifiques
- Templates conversion : `{{propertyCount}}`, `{{leadCount}}`, `{{monthlyPrice}}`, `{{subscribeUrl}}`
- Templates réactivation : `{{newPropertiesCount}}`, `{{searchUrl}}`, `{{updatePreferencesUrl}}`
- Templates nurturing : `{{calculatorUrl}}`, `{{guideUrl}}`, `{{videoUrl}}`

## 🚀 Utilisation dans le Code

### Import d'un template spécifique

```typescript
import { emailTemplates } from './templates';

// Obtenir un template de bienvenue
const welcomeTemplate = emailTemplates.welcome.welcome_instant;

// Utiliser le sujet
const subject = welcomeTemplate.subject.replace('{{firstName}}', 'John');

// Utiliser le contenu HTML
const htmlContent = welcomeTemplate.htmlContent
  .replace(/\{\{firstName\}\}/g, 'John')
  .replace(/\{\{trialUrl\}\}/g, 'https://viridial.com/trial');
```

### Utilisation avec le service EmailTemplate

```typescript
import { EmailTemplateService } from '../services/email-template.service';

// Créer un template dans la base de données
const template = await emailTemplateService.create({
  name: 'Bienvenue Instantané',
  description: 'Email de bienvenue envoyé immédiatement après inscription',
  category: EmailTemplateCategory.WELCOME,
  subject: welcomeTemplate.subject,
  htmlContent: welcomeTemplate.htmlContent,
  textContent: welcomeTemplate.textContent,
  variables: welcomeTemplate.variables,
  organizationId: orgId,
  createdById: userId,
});
```

### Utilisation dans un Workflow

```typescript
// Dans le WorkflowService, lors de l'exécution d'un step SEND_EMAIL
const template = await this.emailTemplateService.findOne(step.emailTemplateId);
const lead = await this.leadService.findOne(leadId);

// Remplacer les variables
let subject = template.subject;
let htmlContent = template.htmlContent;

for (const [key, value] of Object.entries(template.variables)) {
  const replacement = this.getVariableValue(key, lead, template);
  subject = subject.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), replacement);
  htmlContent = htmlContent.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), replacement);
}

// Envoyer l'email
await this.emailService.send({
  to: lead.email,
  subject,
  htmlContent,
});
```

## 📊 Meilleures Pratiques

### 1. A/B Testing
Utilisez les `subjectVariations` pour tester différents sujets :
- Testez 2-3 variations du sujet
- Envoyez à des segments similaires
- Mesurez le taux d'ouverture et de clic
- Gardez le gagnant après 100-200 envois

### 2. Personnalisation
- Toujours utiliser `{{firstName}}` pour personnaliser
- Remplacer toutes les variables avant envoi
- Vérifier que les URLs sont correctes et trackables

### 3. Timing
- Respecter les délais indiqués (immédiat, 1h, J+1, etc.)
- Ne pas spammer : minimum 24h entre 2 emails
- Adapter selon le fuseau horaire du destinataire

### 4. Responsive Design
Tous les templates sont conçus pour être responsive :
- Testés sur desktop, tablette, mobile
- Compatibles avec tous les clients email majeurs
- Fallback texte pour les clients limités

### 5. Conformité Légale
- Toujours inclure lien de désabonnement
- Respecter RGPD (opt-in requis)
- Inclure adresse de l'expéditeur
- Mentionner pourquoi l'email est reçu

## 🎨 Personnalisation et Branding

### Couleurs de Marque Viridial
- Primary: `#667eea` (Violet)
- Secondary: `#764ba2` (Violet foncé)
- Success: `#10b981` (Vert)
- Warning: `#f59e0b` (Orange)
- Error: `#ef4444` (Rouge)

### Style
- Police : `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`
- Largeur : 600px maximum
- Border-radius : 8px pour les containers
- Padding : 40px pour le contenu principal

## 🔍 Tracking et Analytics

Chaque email doit inclure :
- Tracking pixel pour les ouvertures (1x1 transparent)
- Liens trackés pour les clics
- UTM parameters sur toutes les URLs externes
- Events Analytics pour chaque action

Exemple d'URL trackée :
```
{{demoUrl}}?utm_source=email&utm_medium=welcome&utm_campaign=onboarding&tracking_id={{trackingId}}
```

## 📝 Ajouter un Nouveau Template

1. Créer le template dans le fichier approprié (par catégorie)
2. Suivre la structure existante
3. Ajouter les variables nécessaires
4. Tester le rendu HTML/text
5. Ajouter au fichier `index.ts`
6. Documenter dans ce README

## 🧪 Tests

Avant d'envoyer un template en production :
1. Tester avec différents prénoms (longs, courts, spéciaux)
2. Vérifier le rendu sur Gmail, Outlook, Apple Mail
3. Tester sur mobile (iPhone, Android)
4. Vérifier que tous les liens fonctionnent
5. Valider le texte alternatif pour les images
6. Vérifier l'accessibilité (contraste, tailles)

## 📚 Ressources

- [Can I Email](https://www.caniemail.com/) : Compatibilité email clients
- [MJML](https://mjml.io/) : Framework pour emails responsive
- [Email on Acid](https://www.emailonacid.com/) : Tests de rendu
- [Litmus](https://www.litmus.com/) : Tests et analytics

## 🆘 Support

Pour toute question sur les templates :
1. Consulter ce README
2. Vérifier les exemples dans les fichiers sources
3. Contacter l'équipe marketing
4. Ouvrir une issue dans le dépôt

---

**Dernière mise à jour** : 2025-01-12
**Version** : 1.0.0
**Maintenu par** : Équipe Marketing Viridial

