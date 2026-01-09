/**
 * Email Templates - Reactivation & Re-engagement Series
 * Basé sur les meilleures pratiques marketing (Marketo, Salesforce)
 * Optimisé pour le secteur immobilier - Réactivation des leads inactifs
 */

export const reactivationEmailTemplates = {
  /**
   * TEMPLATE 9: Nous vous manquons ?
   * Envoyé 30 jours d'inactivité
   * Taux d'ouverture cible: 20-30%
   */
  we_miss_you: {
    subject: '{{firstName}}, nous vous manquons ? 🏡',
    subjectVariations: [
      '{{firstName}}, qu\'est-ce qui vous empêche de trouver votre bien ?',
      'Nous avons de nouvelles propriétés qui pourraient vous intéresser, {{firstName}}',
      '{{firstName}}, votre recherche immobilière continue ?',
    ],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; max-width: 600px;">
          
          <tr>
            <td style="padding: 40px 40px 20px;">
              <h1 style="margin: 0 0 10px; color: #333333; font-size: 26px; font-weight: 600;">
                Bonjour {{firstName}}, 👋
              </h1>
              <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.6;">
                Il y a quelque temps, vous avez consulté des biens sur <strong>Viridial</strong>. 
                Nous avons remarqué que vous n'avez pas été actif depuis quelque temps, et nous nous demandons si votre recherche se poursuit toujours.
              </p>

              <!-- Empathy Section -->
              <div style="padding: 25px; background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); border-radius: 8px; margin: 25px 0;">
                <h2 style="margin: 0 0 15px; color: #1e40af; font-size: 20px; font-weight: 600;">
                  💭 Nous comprenons...
                </h2>
                <p style="margin: 0; color: #1e3a8a; font-size: 15px; line-height: 1.7;">
                  La recherche immobilière peut prendre du temps. Parfois, on fait une pause, on réfléchit, on ajuste ses critères. 
                  C'est tout à fait normal ! Nous sommes là pour vous accompagner lorsque vous serez prêt.
                </p>
              </div>

              <!-- New Properties -->
              <div style="padding: 25px; background-color: #f9fafb; border-radius: 8px; margin: 25px 0;">
                <h2 style="margin: 0 0 15px; color: #333333; font-size: 20px; font-weight: 600;">
                  🏠 Nouvelles Propriétés qui pourraient vous intéresser
                </h2>
                <p style="margin: 0 0 20px; color: #666666; font-size: 15px; line-height: 1.6;">
                  Depuis votre dernière visite, <strong>{{newPropertiesCount}} nouvelles propriétés</strong> correspondant à vos critères ont été ajoutées.
                </p>
                <!-- Property Cards (placeholder - would be dynamic) -->
                <div style="margin: 20px 0;">
                  <div style="padding: 15px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 5px; color: #333333; font-size: 16px; font-weight: 600;">{{property1Title}}</h3>
                    <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">{{property1Location}} • {{property1Price}}</p>
                    <a href="{{property1Url}}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 600;">Voir cette propriété →</a>
                  </div>
                </div>
              </div>

              <!-- Help Section -->
              <div style="padding: 25px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 25px 0;">
                <h3 style="margin: 0 0 10px; color: #92400e; font-size: 17px; font-weight: 600;">
                  💡 Besoin d'aide pour relancer votre recherche ?
                </h3>
                <p style="margin: 0 0 15px; color: #78350f; font-size: 14px; line-height: 1.7;">
                  Nos conseillers immobiliers sont là pour vous aider à :
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                  <li>Affiner vos critères de recherche</li>
                  <li>Mettre à jour vos alertes personnalisées</li>
                  <li>Discuter de votre projet et de vos priorités</li>
                  <li>Explorer de nouveaux quartiers qui pourraient vous convenir</li>
                </ul>
              </div>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px;">
                    <p style="margin: 0 0 15px; color: #ffffff; font-size: 16px; font-weight: 600;">
                      Prêt à reprendre votre recherche ?
                    </p>
                    <a href="{{searchUrl}}" style="display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin-right: 10px;">Explorer les nouvelles propriétés →</a>
                    <a href="{{demoUrl}}" style="display: inline-block; padding: 14px 28px; background-color: rgba(255,255,255,0.2); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; border: 2px solid #ffffff;">Parler à un conseiller</a>
                  </td>
                </tr>
              </table>

              <!-- Update Preferences -->
              <p style="margin: 20px 0 0; text-align: center; color: #666666; font-size: 13px;">
                Votre recherche est terminée ? <a href="{{updatePreferencesUrl}}" style="color: #667eea; text-decoration: none;">Mettre à jour vos préférences</a> ou <a href="{{unsubscribeUrl}}" style="color: #999999; text-decoration: none;">vous désabonner</a>
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #f9fafb; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #666666; font-size: 14px;">
                À très bientôt,<br>
                <strong>L'équipe Viridial</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `
Bonjour {{firstName}},

Il y a quelque temps, vous avez consulté des biens sur Viridial. Nous avons remarqué que vous n'avez pas été actif depuis quelque temps.

💭 Nous comprenons que la recherche immobilière peut prendre du temps. Nous sommes là pour vous accompagner lorsque vous serez prêt.

🏠 Nouvelles Propriétés
Depuis votre dernière visite, {{newPropertiesCount}} nouvelles propriétés correspondant à vos critères ont été ajoutées.

💡 Besoin d'aide pour relancer votre recherche ?
Nos conseillers peuvent vous aider à :
- Affiner vos critères
- Mettre à jour vos alertes
- Discuter de votre projet
- Explorer de nouveaux quartiers

Explorer les nouvelles propriétés : {{searchUrl}}
Parler à un conseiller : {{demoUrl}}

Mettre à jour vos préférences : {{updatePreferencesUrl}}

L'équipe Viridial
    `,
    variables: {
      firstName: 'string',
      newPropertiesCount: 'number',
      property1Title: 'string',
      property1Location: 'string',
      property1Price: 'string',
      property1Url: 'string',
      searchUrl: 'string',
      demoUrl: 'string',
      updatePreferencesUrl: 'string',
      unsubscribeUrl: 'string',
    },
  },

  /**
   * TEMPLATE 10: Offre Spéciale de Retour
   * Envoyé 60 jours d'inactivité
   * Taux d'ouverture cible: 15-25%
   */
  special_offer_return: {
    subject: '🎁 {{firstName}}, une offre spéciale pour votre retour sur Viridial',
    subjectVariations: [
      '{{firstName}}, nous vous réservons quelque chose de spécial',
      'Offre exclusive pour {{firstName}} : -50% sur votre 1er mois',
      '{{firstName}}, votre bien idéal vous attend - Offre limitée',
    ],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; max-width: 600px;">
          
          <!-- Special Offer Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0 0 15px; color: #ffffff; font-size: 32px; font-weight: 700;">🎁 Offre Spéciale</h1>
              <p style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">-50% sur votre 1er mois</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 40px 20px;">
              <h2 style="margin: 0 0 15px; color: #333333; font-size: 24px; font-weight: 600;">
                Bonjour {{firstName}}, 👋
              </h2>
              <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.6;">
                Il y a quelque temps, vous avez exploré <strong>Viridial</strong> pour trouver votre bien immobilier. 
                Nous pensons que vous méritez une <strong>seconde chance</strong> pour découvrir tout ce que notre plateforme peut faire pour vous.
              </p>

              <!-- Offer Details -->
              <div style="padding: 30px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; margin: 25px 0; text-align: center; border: 2px solid #10b981;">
                <p style="margin: 0 0 10px; color: #065f46; font-size: 18px; font-weight: 600;">
                  Profitez de -50% sur votre 1er mois
                </p>
                <p style="margin: 0 0 20px; color: #047857; font-size: 36px; font-weight: 700;">
                  <span style="text-decoration: line-through; color: #999999; font-size: 24px;">{{regularPrice}}€</span>
                  <span style="color: #10b981;">{{discountPrice}}€</span>
                </p>
                <p style="margin: 0 0 15px; color: #065f46; font-size: 14px;">
                  Code promo exclusif : <strong style="background-color: #ffffff; padding: 4px 12px; border-radius: 4px; font-size: 16px; color: #10b981;">COMEBACK50</strong>
                </p>
                <p style="margin: 0; color: #047857; font-size: 12px;">
                  Offre valable jusqu'au {{expiryDate}} • Utilisable une seule fois
                </p>
              </div>

              <!-- What You Get -->
              <div style="padding: 25px; background-color: #f9fafb; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin: 0 0 20px; color: #333333; font-size: 18px; font-weight: 600;">
                  ✅ Avec cette offre, vous obtenez :
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                  <li><strong>Accès complet</strong> à toutes les fonctionnalités Viridial</li>
                  <li><strong>Price Estimator</strong> pour valoriser vos biens</li>
                  <li><strong>Recherche avancée</strong> ultra-rapide avec Meilisearch</li>
                  <li><strong>CRM intégré</strong> pour gérer vos leads</li>
                  <li><strong>Support prioritaire</strong> par notre équipe</li>
                  <li><strong>Multi-tenant</strong> : gérez plusieurs agences</li>
                </ul>
              </div>

              <!-- Urgency -->
              <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 25px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.7;">
                  ⏰ <strong>Cette offre est limitée dans le temps</strong> et exclusivement réservée aux utilisateurs comme vous qui n'ont pas encore sauté le pas. 
                  Ne laissez pas passer cette opportunité !
                </p>
              </div>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{subscribeUrl}}" style="display: inline-block; padding: 18px 36px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">Profiter de l'offre →</a>
                  </td>
                </tr>
              </table>

              <!-- Alternative -->
              <p style="margin: 20px 0 0; text-align: center; color: #666666; font-size: 14px;">
                Vous préférez d'abord explorer ? <a href="{{searchUrl}}" style="color: #667eea; text-decoration: none; font-weight: 600;">Découvrir les nouvelles propriétés</a>
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #f9fafb; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #666666; font-size: 14px;">
                Cordialement,<br>
                <strong>L'équipe Viridial</strong>
              </p>
              <p style="margin: 15px 0 0; color: #999999; font-size: 12px; line-height: 1.5;">
                Cette offre est personnelle et ne peut être transférée. 
                Si vous ne souhaitez plus recevoir ces emails, <a href="{{unsubscribeUrl}}" style="color: #999999; text-decoration: underline;">cliquez ici</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `
🎁 OFFRE SPÉCIALE : -50% sur votre 1er mois

Bonjour {{firstName}},

Nous vous réservons une offre spéciale pour votre retour sur Viridial.

✅ Profitez de -50% sur votre 1er mois
   Prix régulier : {{regularPrice}}€
   Votre prix : {{discountPrice}}€
   Code promo : COMEBACK50

✅ Avec cette offre, vous obtenez :
- Accès complet à toutes les fonctionnalités
- Price Estimator
- Recherche avancée ultra-rapide
- CRM intégré
- Support prioritaire

⏰ Offre valable jusqu'au {{expiryDate}}
   Utilisable une seule fois

Profiter de l'offre : {{subscribeUrl}}
Découvrir les nouvelles propriétés : {{searchUrl}}

L'équipe Viridial

Cette offre est personnelle. Se désabonner : {{unsubscribeUrl}}
    `,
    variables: {
      firstName: 'string',
      regularPrice: 'number',
      discountPrice: 'number',
      expiryDate: 'string',
      subscribeUrl: 'string',
      searchUrl: 'string',
      unsubscribeUrl: 'string',
    },
  },
};

