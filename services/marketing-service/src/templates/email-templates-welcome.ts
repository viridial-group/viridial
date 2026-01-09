/**
 * Email Templates - Welcome & Onboarding Series
 * Basé sur les meilleures pratiques marketing (HubSpot, ActiveCampaign, Mailchimp)
 * Optimisé pour le secteur immobilier
 */

export const welcomeEmailTemplates = {
  /**
   * TEMPLATE 1: Email de Bienvenue Immédiat
   * Envoyé instantanément après inscription/lead créé
   * Taux d'ouverture cible: 40-50%
   */
  welcome_instant: {
    subject: 'Bienvenue sur Viridial ! Votre essai gratuit commence maintenant 🎉',
    subjectVariations: [
      'Bienvenue {{firstName}} ! Votre essai gratuit Viridial démarre maintenant',
      'Bonjour {{firstName}}, bienvenue sur Viridial 🏠',
      '{{firstName}}, merci de nous rejoindre ! Votre essai gratuit est prêt',
    ],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur Viridial</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Bienvenue {{firstName}} ! 🎉</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Introduction -->
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Félicitations ! Votre essai gratuit de <strong>14 jours</strong> sur <strong>Viridial</strong> vient de commencer.
              </p>

              <p style="margin: 0 0 30px; color: #555555; font-size: 16px; line-height: 1.6;">
                Viridial est la plateforme SaaS qui simplifie la gestion immobilière pour votre agence. Vous avez maintenant accès à :
              </p>

              <!-- Features List -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td width="30" valign="top">
                          <span style="color: #10b981; font-size: 20px;">✅</span>
                        </td>
                        <td>
                          <strong style="color: #333333; font-size: 16px;">Gestion complète de vos propriétés</strong>
                          <p style="margin: 5px 0 0; color: #666666; font-size: 14px; line-height: 1.5;">Ajoutez, gérez et publiez vos biens immobiliers en quelques clics</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td width="30" valign="top">
                          <span style="color: #10b981; font-size: 20px;">✅</span>
                        </td>
                        <td>
                          <strong style="color: #333333; font-size: 16px;">Recherche avancée instantanée</strong>
                          <p style="margin: 5px 0 0; color: #666666; font-size: 14px; line-height: 1.5;">Meilisearch pour des résultats de recherche ultra-rapides</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td width="30" valign="top">
                          <span style="color: #10b981; font-size: 20px;">✅</span>
                        </td>
                        <td>
                          <strong style="color: #333333; font-size: 16px;">CRM et gestion de leads intégrés</strong>
                          <p style="margin: 5px 0 0; color: #666666; font-size: 14px; line-height: 1.5;">Suivez vos leads et convertissez-les en clients</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td width="30" valign="top">
                          <span style="color: #10b981; font-size: 20px;">✅</span>
                        </td>
                        <td>
                          <strong style="color: #333333; font-size: 16px;">Estimation automatique de prix</strong>
                          <p style="margin: 5px 0 0; color: #666666; font-size: 14px; line-height: 1.5;">Price Estimator pour valoriser rapidement vos biens</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Primary -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px;">
                <tr>
                  <td align="center">
                    <a href="{{trialUrl}}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">Commencer mon essai gratuit →</a>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 15px; color: #333333; font-size: 18px; font-weight: 600;">🎯 Votre prochaine étape :</h2>
                <ol style="margin: 0; padding-left: 20px; color: #555555; font-size: 15px; line-height: 1.8;">
                  <li><strong>Complétez votre profil</strong> (2 minutes) - Configurez votre agence</li>
                  <li><strong>Ajoutez votre première propriété</strong> (5 minutes) - Testez l'éditeur</li>
                  <li><strong>Testez la recherche avancée</strong> - Découvrez la vitesse Meilisearch</li>
                  <li><strong>Découvrez l'estimateur de prix</strong> - Valorisez un bien en quelques secondes</li>
                </ol>
              </div>

              <!-- Support Section -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-radius: 6px; border: 1px solid #fcd34d;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 15px; font-weight: 600;">💡 Besoin d'aide pour démarrer ?</p>
                <p style="margin: 0 0 15px; color: #78350f; font-size: 14px; line-height: 1.6;">
                  Nous sommes là pour vous accompagner dans votre essai !
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 5px 0;">
                      <a href="{{guideUrl}}" style="color: #92400e; text-decoration: none; font-size: 14px;">📖 Guide de démarrage rapide</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;">
                      <a href="{{videoUrl}}" style="color: #92400e; text-decoration: none; font-size: 14px;">🎥 Vidéo tutoriel (5 minutes)</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0;">
                      <a href="{{demoUrl}}" style="color: #92400e; text-decoration: none; font-size: 14px; font-weight: 600;">💬 Réserver une démo personnalisée</a>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #eeeeee; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.6;">
                <strong style="color: #333333;">À très bientôt,</strong><br>
                L'équipe Viridial
              </p>
              <p style="margin: 20px 0 0; padding-top: 20px; border-top: 1px solid #eeeeee; color: #999999; font-size: 12px; line-height: 1.5;">
                P.S. : Réservez votre créneau pour une <a href="{{demoUrl}}" style="color: #667eea; text-decoration: none;">démo personnalisée de 30 minutes</a> et découvrez comment Viridial peut transformer votre agence immobilière.
              </p>
            </td>
          </tr>

          <!-- Unsubscribe -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #ffffff;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Vous recevez cet email car vous avez créé un compte sur Viridial.<br>
                <a href="{{unsubscribeUrl}}" style="color: #999999; text-decoration: underline;">Se désabonner</a> | 
                <a href="{{preferencesUrl}}" style="color: #999999; text-decoration: underline;">Gérer mes préférences</a>
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
Bienvenue {{firstName}} ! 🎉

Félicitations ! Votre essai gratuit de 14 jours sur Viridial vient de commencer.

Viridial est la plateforme SaaS qui simplifie la gestion immobilière pour votre agence. Vous avez maintenant accès à :

✅ Gestion complète de vos propriétés
   Ajoutez, gérez et publiez vos biens immobiliers en quelques clics

✅ Recherche avancée instantanée
   Meilisearch pour des résultats de recherche ultra-rapides

✅ CRM et gestion de leads intégrés
   Suivez vos leads et convertissez-les en clients

✅ Estimation automatique de prix
   Price Estimator pour valoriser rapidement vos biens

🎯 Votre prochaine étape :

1. Complétez votre profil (2 minutes)
2. Ajoutez votre première propriété (5 minutes)
3. Testez la recherche avancée
4. Découvrez l'estimateur de prix

Commencer mon essai gratuit : {{trialUrl}}

💡 Besoin d'aide ?
📖 Guide de démarrage rapide : {{guideUrl}}
🎥 Vidéo tutoriel : {{videoUrl}}
💬 Réserver une démo : {{demoUrl}}

À très bientôt,
L'équipe Viridial

P.S. : Réservez votre créneau pour une démo personnalisée et découvrez comment Viridial peut transformer votre agence.

Se désabonner : {{unsubscribeUrl}}
    `,
    variables: {
      firstName: 'string',
      trialUrl: 'string',
      guideUrl: 'string',
      videoUrl: 'string',
      demoUrl: 'string',
      unsubscribeUrl: 'string',
      preferencesUrl: 'string',
    },
  },

  /**
   * TEMPLATE 2: Guide "10 Conseils pour Trouver Votre Bien"
   * Envoyé 1h après l'email de bienvenue
   * Taux d'ouverture cible: 25-35%
   */
  welcome_guide_tips: {
    subject: '{{firstName}}, voici 10 conseils pour trouver le bien immobilier idéal 🏠',
    subjectVariations: [
      'Guide gratuit : 10 Conseils Immobilier pour {{firstName}}',
      '{{firstName}}, découvrez comment trouver votre bien idéal',
      '10 Conseils d\'Expert Immobilier pour vous',
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
                Merci de nous rejoindre ! Pour vous aider à démarrer, voici <strong>10 conseils d'experts</strong> pour trouver le bien immobilier idéal.
              </p>

              <!-- Tips -->
              <div style="margin: 30px 0;">
                <div style="padding: 20px; margin-bottom: 15px; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                  <h3 style="margin: 0 0 8px; color: #1e40af; font-size: 18px; font-weight: 600;">1️⃣ Définissez vos critères prioritaires</h3>
                  <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">Listez vos "must-have" vs "nice-to-have". Cela vous fera gagner du temps et vous aidera à prendre des décisions plus rapidement.</p>
                </div>

                <div style="padding: 20px; margin-bottom: 15px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
                  <h3 style="margin: 0 0 8px; color: #065f46; font-size: 18px; font-weight: 600;">2️⃣ Évaluez votre budget réel</h3>
                  <p style="margin: 0; color: #047857; font-size: 14px; line-height: 1.6;">Incluez tous les frais : notaire, travaux, frais de dossier. Utilisez notre Price Estimator pour obtenir une estimation précise.</p>
                </div>

                <div style="padding: 20px; margin-bottom: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                  <h3 style="margin: 0 0 8px; color: #92400e; font-size: 18px; font-weight: 600;">3️⃣ Explorez différents quartiers</h3>
                  <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">Visitez plusieurs zones, même celles que vous ne connaissez pas. Les meilleures opportunités sont parfois là où on ne les attend pas.</p>
                </div>

                <div style="padding: 20px; margin-bottom: 15px; background-color: #fce7f3; border-left: 4px solid #ec4899; border-radius: 4px;">
                  <h3 style="margin: 0 0 8px; color: #831843; font-size: 18px; font-weight: 600;">4️⃣ Préparez votre financement à l'avance</h3>
                  <p style="margin: 0; color: #9f1239; font-size: 14px; line-height: 1.6;">Obtenez un accord de principe bancaire. Cela renforce votre position lors des négociations et accélère les démarches.</p>
                </div>

                <div style="padding: 20px; margin-bottom: 15px; background-color: #f3e8ff; border-left: 4px solid #8b5cf6; border-radius: 4px;">
                  <h3 style="margin: 0 0 8px; color: #5b21b6; font-size: 18px; font-weight: 600;">5️⃣ Utilisez la recherche avancée</h3>
                  <p style="margin: 0; color: #6b21a8; font-size: 14px; line-height: 1.6;">Filtrez par prix, type, localisation, et bien plus. Notre moteur de recherche vous fait gagner des heures.</p>
                </div>

                <!-- More tips (condensed) -->
                <div style="padding: 20px; background-color: #f9fafb; border-radius: 6px; margin-top: 20px;">
                  <p style="margin: 0 0 10px; color: #333333; font-size: 15px; font-weight: 600;">Et 5 conseils supplémentaires :</p>
                  <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 14px; line-height: 1.8;">
                    <li><strong>6.</strong> Faites plusieurs visites aux différents moments de la journée</li>
                    <li><strong>7.</strong> Vérifiez les charges et les taxes foncières</li>
                    <li><strong>8.</strong> Demandez l'historique des ventes du quartier</li>
                    <li><strong>9.</strong> Négociez toujours (même si le prix vous convient)</li>
                    <li><strong>10.</strong> Faites confiance à votre intuition, mais vérifiez les détails techniques</li>
                  </ul>
                </div>
              </div>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px;">
                    <p style="margin: 0 0 15px; color: #ffffff; font-size: 16px; font-weight: 600;">Prêt à trouver votre bien idéal ?</p>
                    <a href="{{trialUrl}}" style="display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">Essayer Viridial gratuitement →</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Besoin d'aide pour votre recherche ? <a href="{{demoUrl}}" style="color: #667eea; text-decoration: none;">Réservez une consultation gratuite</a> avec notre équipe.
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #f9fafb; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #666666; font-size: 14px;">
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
Bonjour {{firstName}},

Merci de nous rejoindre ! Voici 10 conseils d'experts pour trouver le bien immobilier idéal :

1. Définissez vos critères prioritaires
2. Évaluez votre budget réel
3. Explorez différents quartiers
4. Préparez votre financement à l'avance
5. Utilisez la recherche avancée
6. Faites plusieurs visites aux différents moments
7. Vérifiez les charges et taxes
8. Demandez l'historique des ventes
9. Négociez toujours
10. Faites confiance à votre intuition, mais vérifiez les détails

Essayer Viridial gratuitement : {{trialUrl}}
Réserver une consultation : {{demoUrl}}

L'équipe Viridial
    `,
    variables: {
      firstName: 'string',
      trialUrl: 'string',
      demoUrl: 'string',
    },
  },

  /**
   * TEMPLATE 3: Présentation de l'Agence
   * Envoyé J+2 après inscription
   * Taux d'ouverture cible: 20-30%
   */
  welcome_agency_intro: {
    subject: '{{firstName}}, découvrez qui nous sommes et nos valeurs 🏡',
    subjectVariations: [
      'Qui sommes-nous ? Présentation de Viridial',
      '{{firstName}}, notre mission : Simplifier l\'immobilier pour vous',
      'Découvrez l\'histoire de Viridial',
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
                Aujourd'hui, j'aimerais vous présenter <strong>Viridial</strong> et partager avec vous notre mission et nos valeurs.
              </p>

              <div style="padding: 25px; background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); border-radius: 8px; margin: 25px 0;">
                <h2 style="margin: 0 0 15px; color: #1e40af; font-size: 20px; font-weight: 600;">🎯 Notre Mission</h2>
                <p style="margin: 0; color: #1e3a8a; font-size: 15px; line-height: 1.7;">
                  <strong>Simplifier la gestion immobilière</strong> pour que les agences puissent se concentrer sur l'essentiel : leurs clients et leurs transactions, plutôt que sur les tâches administratives chronophages.
                </p>
              </div>

              <h2 style="margin: 30px 0 15px; color: #333333; font-size: 20px; font-weight: 600;">💎 Nos Valeurs</h2>

              <div style="margin: 20px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50" valign="top" style="padding-right: 15px;">
                      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px;">🚀</div>
                    </td>
                    <td>
                      <h3 style="margin: 0 0 5px; color: #333333; font-size: 17px; font-weight: 600;">Innovation Continue</h3>
                      <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">Nous intégrons les dernières technologies pour vous offrir une expérience toujours meilleure.</p>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="margin: 20px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50" valign="top" style="padding-right: 15px;">
                      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px;">🤝</div>
                    </td>
                    <td>
                      <h3 style="margin: 0 0 5px; color: #333333; font-size: 17px; font-weight: 600;">Proximité Client</h3>
                      <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">Votre succès est notre priorité. Nous sommes là pour vous accompagner à chaque étape.</p>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="margin: 20px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50" valign="top" style="padding-right: 15px;">
                      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px;">🔒</div>
                    </td>
                    <td>
                      <h3 style="margin: 0 0 5px; color: #333333; font-size: 17px; font-weight: 600;">Sécurité & Confidentialité</h3>
                      <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">Vos données sont protégées avec une architecture multi-tenant sécurisée et conforme RGPD.</p>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="margin: 20px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50" valign="top" style="padding-right: 15px;">
                      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px;">⚡</div>
                    </td>
                    <td>
                      <h3 style="margin: 0 0 5px; color: #333333; font-size: 17px; font-weight: 600;">Performance</h3>
                      <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">Infrastructure Kubernetes pour une vitesse et une scalabilité optimales.</p>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="padding: 25px; background-color: #fef3c7; border-radius: 8px; margin: 30px 0; border: 1px solid #fcd34d;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 15px; font-weight: 600;">💡 Notre Engagement</p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.7;">
                  Nous sommes convaincus que <strong>Viridial peut faire la différence pour votre agence</strong>. C'est pourquoi nous offrons un essai gratuit de 14 jours, sans carte bancaire, pour que vous puissiez tester toutes les fonctionnalités en toute sérénité.
                </p>
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{trialUrl}}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Découvrir Viridial →</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Des questions ? <a href="{{demoUrl}}" style="color: #667eea; text-decoration: none;">Réservez un appel</a> avec notre équipe, nous serons ravis d'échanger avec vous.
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #f9fafb; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #666666; font-size: 14px;">
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
Bonjour {{firstName}},

Aujourd'hui, j'aimerais vous présenter Viridial et partager avec vous notre mission et nos valeurs.

🎯 Notre Mission
Simplifier la gestion immobilière pour que les agences puissent se concentrer sur l'essentiel : leurs clients.

💎 Nos Valeurs
🚀 Innovation Continue - Technologies de pointe
🤝 Proximité Client - Votre succès est notre priorité
🔒 Sécurité & Confidentialité - Données protégées
⚡ Performance - Infrastructure scalable

💡 Notre Engagement
Nous sommes convaincus que Viridial peut faire la différence pour votre agence.

Découvrir Viridial : {{trialUrl}}
Réserver un appel : {{demoUrl}}

L'équipe Viridial
    `,
    variables: {
      firstName: 'string',
      trialUrl: 'string',
      demoUrl: 'string',
    },
  },
};

