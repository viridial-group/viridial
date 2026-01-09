/**
 * Email Templates - Conversion & Sales Series
 * Basé sur les meilleures pratiques marketing (Neil Patel, HubSpot, Copyblogger)
 * Optimisé pour le secteur immobilier - Conversion orientée
 */

export const conversionEmailTemplates = {
  /**
   * TEMPLATE 7: Essai se termine bientôt - Urgence
   * J-3 avant fin de l'essai gratuit
   * Taux d'ouverture cible: 35-45%
   */
  trial_ending_soon: {
    subject: '⏰ {{firstName}}, votre essai se termine dans 3 jours - Ne manquez pas cette opportunité !',
    subjectVariations: [
      '🚨 {{firstName}}, plus que 3 jours pour profiter de votre essai gratuit',
      '{{firstName}}, votre essai se termine bientôt - Continuez sans limite',
      '⏰ Action requise : Votre essai Viridial expire dans 3 jours',
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
          
          <!-- Urgency Header -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">⏰ Urgence : Plus que 3 jours !</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Votre essai gratuit se termine bientôt</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 40px 20px;">
              <h2 style="margin: 0 0 15px; color: #333333; font-size: 24px; font-weight: 600;">
                Bonjour {{firstName}}, 👋
              </h2>
              <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.6;">
                Votre <strong>essai gratuit de 14 jours</strong> sur Viridial se termine dans <strong style="color: #ef4444;">3 jours</strong>. 
                J'espère que vous avez pu découvrir toutes les fonctionnalités de notre plateforme !
              </p>

              <!-- What You'll Lose -->
              <div style="padding: 25px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px; color: #991b1b; font-size: 18px; font-weight: 600;">
                  ⚠️ À la fin de votre essai, vous perdrez accès à :
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #7f1d1d; font-size: 14px; line-height: 1.8;">
                  <li>Vos <strong>{{propertyCount}} propriétés</strong> ajoutées</li>
                  <li>Vos <strong>{{leadCount}} leads</strong> en cours de suivi</li>
                  <li>L'accès au <strong>Price Estimator</strong> et aux analyses</li>
                  <li>La recherche avancée avec <strong>Meilisearch</strong></li>
                  <li>Toutes vos données et configurations</li>
                </ul>
              </div>

              <!-- What You Gain -->
              <div style="padding: 25px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px; color: #065f46; font-size: 18px; font-weight: 600;">
                  ✅ En continuant, vous bénéficiez de :
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px; line-height: 1.8;">
                  <li><strong>Accès illimité</strong> à toutes les fonctionnalités</li>
                  <li><strong>Support prioritaire</strong> par notre équipe</li>
                  <li><strong>Mises à jour régulières</strong> et nouvelles fonctionnalités</li>
                  <li><strong>Sécurité renforcée</strong> et sauvegardes automatiques</li>
                  <li><strong>Multi-tenant</strong> : gérez plusieurs agences si besoin</li>
                </ul>
              </div>

              <!-- Pricing -->
              <div style="padding: 25px; background-color: #f9fafb; border-radius: 8px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">À partir de seulement</p>
                <p style="margin: 0 0 15px; color: #333333; font-size: 36px; font-weight: 700;">
                  <span style="color: #667eea;">{{monthlyPrice}}€</span>
                  <span style="color: #999999; font-size: 18px; font-weight: 400;">/mois</span>
                </p>
                <p style="margin: 0; color: #666666; font-size: 12px;">Facturé mensuellement • Annulable à tout moment</p>
              </div>

              <!-- Special Offer -->
              <div style="padding: 25px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; margin: 25px 0; border: 2px solid #f59e0b; text-align: center;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 18px; font-weight: 700;">
                  🎁 Offre Spéciale : -20% les 3 premiers mois
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                  Pour les utilisateurs qui s'abonnent avant la fin de leur essai, nous offrons <strong>-20%</strong> sur les 3 premiers mois. 
                  Code : <strong style="background-color: #ffffff; padding: 2px 8px; border-radius: 3px;">TRIAL20</strong>
                </p>
              </div>

              <!-- CTA Primary -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{subscribeUrl}}" style="display: inline-block; padding: 18px 36px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">Continuer avec Viridial →</a>
                  </td>
                </tr>
              </table>

              <!-- Alternative CTA -->
              <p style="margin: 20px 0 0; text-align: center; color: #666666; font-size: 14px;">
                Besoin de plus de temps ? <a href="{{extendTrialUrl}}" style="color: #667eea; text-decoration: none; font-weight: 600;">Demander une extension de 7 jours gratuite</a>
              </p>

              <!-- Support -->
              <div style="padding: 20px; background-color: #eff6ff; border-radius: 6px; margin: 30px 0;">
                <p style="margin: 0 0 10px; color: #1e40af; font-size: 15px; font-weight: 600;">
                  💬 Des questions avant de vous abonner ?
                </p>
                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                  Notre équipe est là pour répondre à toutes vos questions. <a href="{{demoUrl}}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Réservez un appel gratuit de 15 minutes</a> pour discuter de vos besoins spécifiques.
                </p>
              </div>

            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #f9fafb; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #666666; font-size: 14px;">
                À très bientôt,<br>
                <strong>L'équipe Viridial</strong>
              </p>
              <p style="margin: 15px 0 0; color: #999999; font-size: 12px; line-height: 1.5;">
                P.S. : Plus de 87% de nos utilisateurs en essai choisissent de continuer avec Viridial. 
                Rejoignez-les et transformez votre agence immobilière dès aujourd'hui !
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
⏰ URGENCE : Plus que 3 jours !

Bonjour {{firstName}},

Votre essai gratuit de 14 jours sur Viridial se termine dans 3 jours.

⚠️ À la fin de votre essai, vous perdrez accès à :
- Vos {{propertyCount}} propriétés ajoutées
- Vos {{leadCount}} leads en cours de suivi
- L'accès au Price Estimator
- La recherche avancée Meilisearch
- Toutes vos données

✅ En continuant, vous bénéficiez de :
- Accès illimité à toutes les fonctionnalités
- Support prioritaire
- Mises à jour régulières
- Sécurité renforcée

💶 Prix : {{monthlyPrice}}€/mois

🎁 Offre Spéciale : -20% les 3 premiers mois
Code : TRIAL20

Continuer avec Viridial : {{subscribeUrl}}
Demander une extension : {{extendTrialUrl}}
Réserver un appel : {{demoUrl}}

L'équipe Viridial

P.S. : Plus de 87% de nos utilisateurs en essai choisissent de continuer.
    `,
    variables: {
      firstName: 'string',
      propertyCount: 'number',
      leadCount: 'number',
      monthlyPrice: 'number',
      subscribeUrl: 'string',
      extendTrialUrl: 'string',
      demoUrl: 'string',
    },
  },

  /**
   * TEMPLATE 8: Dernière chance - Essai se termine demain
   * J-1 avant fin de l'essai gratuit
   * Taux d'ouverture cible: 40-50%
   */
  trial_last_chance: {
    subject: '🚨 DERNIÈRE CHANCE {{firstName}} : Votre essai se termine demain !',
    subjectVariations: [
      '{{firstName}}, dernière chance : Votre essai expire demain',
      '⏰ Action immédiate requise : Essai Viridial expire demain',
      '🚨 {{firstName}}, ne perdez pas vos données - Agissez maintenant',
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
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; max-width: 600px; border: 3px solid #ef4444;">
          
          <!-- Critical Header -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); border-radius: 5px 5px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🚨 DERNIÈRE CHANCE</h1>
              <p style="margin: 15px 0 0; color: #ffffff; font-size: 20px; font-weight: 600;">Votre essai expire DEMAIN</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 40px 20px;">
              <h2 style="margin: 0 0 15px; color: #333333; font-size: 24px; font-weight: 600;">
                {{firstName}}, il ne reste plus qu'un jour ! ⏰
              </h2>
              
              <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.6; font-weight: 600;">
                Après demain, vous perdrez <strong style="color: #dc2626;">définitivement</strong> l'accès à :
              </p>

              <!-- Critical Loss List -->
              <div style="padding: 25px; background-color: #fee2e2; border: 2px solid #ef4444; border-radius: 6px; margin: 25px 0;">
                <ul style="margin: 0; padding-left: 20px; color: #991b1b; font-size: 15px; line-height: 2;">
                  <li style="margin-bottom: 10px;"><strong>{{propertyCount}} propriétés</strong> que vous avez ajoutées</li>
                  <li style="margin-bottom: 10px;"><strong>{{leadCount}} leads</strong> et leur historique complet</li>
                  <li style="margin-bottom: 10px;"><strong>Toutes vos configurations</strong> et paramètres personnalisés</li>
                  <li style="margin-bottom: 10px;"><strong>Vos analyses et statistiques</strong> accumulées</li>
                  <li><strong>Votre accès à la plateforme</strong> et toutes ses fonctionnalités</li>
                </ul>
              </div>

              <!-- Urgency Message -->
              <div style="padding: 25px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 5px solid #f59e0b; border-radius: 6px; margin: 25px 0;">
                <p style="margin: 0; color: #92400e; font-size: 16px; line-height: 1.7; font-weight: 600;">
                  ⚠️ <strong>Important :</strong> Une fois votre essai terminé, il ne sera plus possible de récupérer vos données sans abonnement. 
                  Ne laissez pas tout ce travail disparaître !
                </p>
              </div>

              <!-- Exclusive Offer -->
              <div style="padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; margin: 25px 0; text-align: center; color: #ffffff;">
                <p style="margin: 0 0 15px; font-size: 22px; font-weight: 700;">
                  🎁 Offre Exclusive : -30% le 1er mois
                </p>
                <p style="margin: 0 0 20px; font-size: 16px; opacity: 0.95;">
                  Code promo : <strong style="background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 4px; font-size: 18px;">LASTCHANCE30</strong>
                </p>
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                  Valable uniquement aujourd'hui pour les utilisateurs dont l'essai se termine demain
                </p>
              </div>

              <!-- Main CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{subscribeUrl}}" style="display: inline-block; padding: 20px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 20px; box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">Sauvegarder mes données →</a>
                  </td>
                </tr>
              </table>

              <!-- Social Proof -->
              <div style="padding: 20px; background-color: #f0fdf4; border-radius: 6px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 10px; color: #065f46; font-size: 14px; font-weight: 600;">
                  💬 Ils ont fait le bon choix :
                </p>
                <p style="margin: 0; color: #047857; font-size: 13px; font-style: italic; line-height: 1.6;">
                  "J'ai hésité jusqu'à la dernière minute, mais je ne regrette pas. Viridial a transformé ma façon de gérer mes biens." - Sophie M., Agence Immobilière Paris
                </p>
              </div>

              <!-- Support Emergency -->
              <div style="padding: 20px; background-color: #dbeafe; border-radius: 6px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 10px; color: #1e40af; font-size: 15px; font-weight: 600;">
                  💬 Besoin d'aide pour décider ?
                </p>
                <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
                  Appelez-nous maintenant : <a href="tel:{{phoneNumber}}" style="color: #3b82f6; text-decoration: none; font-weight: 700;">{{phoneNumber}}</a><br>
                  Ou <a href="{{demoUrl}}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">réservez un appel express de 10 minutes</a>
                </p>
              </div>

            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #fef2f2; border-top: 2px solid #ef4444;">
              <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                ⏰ Action requise avant demain 23h59
              </p>
              <p style="margin: 10px 0 0; color: #666666; font-size: 13px;">
                Cordialement,<br>
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
🚨 DERNIÈRE CHANCE

{{firstName}}, il ne reste plus qu'un jour !

Votre essai expire DEMAIN. Après demain, vous perdrez définitivement l'accès à :

❌ {{propertyCount}} propriétés que vous avez ajoutées
❌ {{leadCount}} leads et leur historique complet
❌ Toutes vos configurations et paramètres
❌ Vos analyses et statistiques
❌ Votre accès à la plateforme

⚠️ Important : Une fois votre essai terminé, il ne sera plus possible de récupérer vos données sans abonnement.

🎁 Offre Exclusive : -30% le 1er mois
Code : LASTCHANCE30
Valable uniquement aujourd'hui

Sauvegarder mes données : {{subscribeUrl}}

💬 Appelez-nous maintenant : {{phoneNumber}}
Ou réservez un appel express : {{demoUrl}}

⏰ Action requise avant demain 23h59

L'équipe Viridial
    `,
    variables: {
      firstName: 'string',
      propertyCount: 'number',
      leadCount: 'number',
      subscribeUrl: 'string',
      phoneNumber: 'string',
      demoUrl: 'string',
    },
  },
};

