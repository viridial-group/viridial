/**
 * Email Templates - Nurturing Series
 * Basé sur les meilleures pratiques marketing (HubSpot, ActiveCampaign)
 * Optimisé pour le secteur immobilier - Contenu éducatif à haute valeur
 */

export const nurturingEmailTemplates = {
  /**
   * TEMPLATE 4: Les 5 Erreurs à Éviter lors de l'Achat
   * Jour 1 du workflow Nurturing
   * Taux d'ouverture cible: 30-40%
   */
  nurturing_errors_avoid: {
    subject: '{{firstName}}, les 5 erreurs à éviter lors de l\'achat immobilier ⚠️',
    subjectVariations: [
      '5 Erreurs Immobilières que {{firstName}} doit absolument éviter',
      '{{firstName}}, évitez ces erreurs coûteuses en immobilier',
      'Guide : Les pièges à éviter pour {{firstName}}',
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
                Aujourd'hui, je voulais partager avec vous <strong>5 erreurs courantes</strong> que font les acheteurs immobiliers et comment les éviter. Ces erreurs peuvent vous coûter cher en temps, en argent et en opportunités.
              </p>

              <!-- Error 1 -->
              <div style="padding: 20px; margin-bottom: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                <h3 style="margin: 0 0 10px; color: #991b1b; font-size: 18px; font-weight: 600;">
                  ❌ Erreur #1 : Ne pas pré-approuver son financement
                </h3>
                <p style="margin: 0 0 10px; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  <strong>Le problème :</strong> Vous trouvez le bien parfait, mais sans accord de principe bancaire, vous êtes en position de faiblesse face aux autres acheteurs.
                </p>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  <strong>La solution :</strong> Obtenez votre accord de principe <strong>avant</strong> de commencer vos recherches. Cela renforce votre crédibilité et accélère les démarches.
                </p>
              </div>

              <!-- Error 2 -->
              <div style="padding: 20px; margin-bottom: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                <h3 style="margin: 0 0 10px; color: #991b1b; font-size: 18px; font-weight: 600;">
                  ❌ Erreur #2 : Ne pas visiter le bien plusieurs fois
                </h3>
                <p style="margin: 0 0 10px; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  <strong>Le problème :</strong> Une seule visite ne suffit pas. Le quartier peut être bruyant le soir, ou au contraire trop calme le jour.
                </p>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  <strong>La solution :</strong> Visitez <strong>au moins 2 fois</strong> à des heures différentes (matin, soir, week-end). Testez les transports en commun, les commerces à proximité.
                </p>
              </div>

              <!-- Error 3 -->
              <div style="padding: 20px; margin-bottom: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                <h3 style="margin: 0 0 10px; color: #991b1b; font-size: 18px; font-weight: 600;">
                  ❌ Erreur #3 : Oublier les frais cachés
                </h3>
                <p style="margin: 0 0 10px; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  <strong>Le problème :</strong> Le prix d'achat n'est qu'une partie du coût réel. Frais de notaire, travaux, charges, taxes foncières peuvent représenter 10-15% du prix.
                </p>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  <strong>La solution :</strong> Calculez votre <strong>budget total réel</strong> dès le départ. Utilisez notre calculateur intégré pour ne pas avoir de mauvaises surprises.
                </p>
              </div>

              <!-- Error 4 -->
              <div style="padding: 20px; margin-bottom: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                <h3 style="margin: 0 0 10px; color: #991b1b; font-size: 18px; font-weight: 600;">
                  ❌ Erreur #4 : Acheter sous le coup de l'émotion
                </h3>
                <p style="margin: 0 0 10px; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  <strong>Le problème :</strong> "Coup de cœur" ne rime pas toujours avec "bon achat". L'émotion peut masquer des défauts importants.
                </p>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  <strong>La solution :</strong> Fixez-vous des <strong>critères objectifs</strong> avant de visiter. Si le bien ne répond pas à vos critères, passez votre chemin, même si "c'est joli".
                </p>
              </div>

              <!-- Error 5 -->
              <div style="padding: 20px; margin-bottom: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                <h3 style="margin: 0 0 10px; color: #991b1b; font-size: 18px; font-weight: 600;">
                  ❌ Erreur #5 : Ne pas faire d'étude de marché
                </h3>
                <p style="margin: 0 0 10px; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  <strong>Le problème :</strong> Sans comparaison avec les biens similaires, vous risquez de surpayer ou de sous-estimer la valeur.
                </p>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  <strong>La solution :</strong> Utilisez notre <strong>Price Estimator</strong> qui analyse automatiquement les comparables du marché pour vous donner une estimation juste et argumentée.
                </p>
              </div>

              <!-- CTA -->
              <div style="padding: 25px; background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); border-radius: 8px; margin: 30px 0; text-align: center;">
                <p style="margin: 0 0 15px; color: #1e40af; font-size: 16px; font-weight: 600;">
                  Évitez ces erreurs avec Viridial
                </p>
                <p style="margin: 0 0 20px; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                  Notre plateforme vous aide à prendre des décisions éclairées grâce à des outils d'estimation, de comparaison et de gestion intégrés.
                </p>
                <a href="{{trialUrl}}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">Tester le Price Estimator gratuitement →</a>
              </div>

              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Des questions sur ces erreurs ? <a href="{{demoUrl}}" style="color: #667eea; text-decoration: none;">Réservez un appel gratuit</a> avec notre équipe.
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #f9fafb; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #666666; font-size: 14px;">
                À bientôt,<br>
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

Voici 5 erreurs courantes à éviter lors de l'achat immobilier :

❌ Erreur #1 : Ne pas pré-approuver son financement
   Obtenez votre accord de principe AVANT de commencer vos recherches.

❌ Erreur #2 : Ne pas visiter le bien plusieurs fois
   Visitez au moins 2 fois à des heures différentes.

❌ Erreur #3 : Oublier les frais cachés
   Calculez votre budget total réel (frais de notaire, travaux, charges).

❌ Erreur #4 : Acheter sous le coup de l'émotion
   Fixez-vous des critères objectifs avant de visiter.

❌ Erreur #5 : Ne pas faire d'étude de marché
   Utilisez notre Price Estimator pour comparer avec le marché.

Tester le Price Estimator : {{trialUrl}}
Réserver un appel : {{demoUrl}}

L'équipe Viridial
    `,
    variables: {
      firstName: 'string',
      trialUrl: 'string',
      demoUrl: 'string',
    },
  },

  /**
   * TEMPLATE 5: Guide Financement Immobilier
   * Jour 4 du workflow Nurturing
   * Taux d'ouverture cible: 25-35%
   */
  nurturing_financing_guide: {
    subject: '{{firstName}}, comment financer votre projet immobilier 💰',
    subjectVariations: [
      'Guide Financement : Tout ce que {{firstName}} doit savoir',
      '{{firstName}}, les secrets d\'un financement immobilier réussi',
      'Comment obtenir votre prêt immobilier : Guide pour {{firstName}}',
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
                Bonjour {{firstName}}, 💰
              </h1>
              <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.6;">
                Le financement est souvent l'étape la plus stressante d'un projet immobilier. Aujourd'hui, je vous explique <strong>comment préparer et optimiser votre financement</strong> pour maximiser vos chances d'obtenir un prêt.
              </p>

              <div style="padding: 25px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; margin: 25px 0;">
                <h2 style="margin: 0 0 15px; color: #065f46; font-size: 20px; font-weight: 600;">📋 Les 4 Étapes Essentielles</h2>
                
                <div style="margin-bottom: 20px;">
                  <h3 style="margin: 0 0 8px; color: #047857; font-size: 17px; font-weight: 600;">1. Préparer votre dossier</h3>
                  <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                    Rassemblez : 3 derniers bulletins de salaire, avis d'imposition, relevés bancaires, justificatifs de revenus complémentaires. Plus votre dossier est complet, plus votre demande sera crédible.
                  </p>
                </div>

                <div style="margin-bottom: 20px;">
                  <h3 style="margin: 0 0 8px; color: #047857; font-size: 17px; font-weight: 600;">2. Calculer votre capacité d'emprunt</h3>
                  <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                    Règle générale : <strong>Vos remboursements ne doivent pas dépasser 33% de vos revenus</strong>. Utilisez notre calculateur intégré pour estimer votre capacité d'emprunt.
                  </p>
                </div>

                <div style="margin-bottom: 20px;">
                  <h3 style="margin: 0 0 8px; color: #047857; font-size: 17px; font-weight: 600;">3. Comparer les offres</h3>
                  <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                    Ne vous contentez pas d'une seule banque. Faites jouer la concurrence ! Les écarts de taux peuvent représenter plusieurs milliers d'euros sur la durée du prêt.
                  </p>
                </div>

                <div>
                  <h3 style="margin: 0 0 8px; color: #047857; font-size: 17px; font-weight: 600;">4. Obtenir l'accord de principe</h3>
                  <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                    L'accord de principe est votre <strong>sésame</strong> pour négocier en position de force. Valable généralement 3-4 mois, il vous donne une visibilité claire sur votre budget.
                  </p>
                </div>
              </div>

              <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 25px 0;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 15px; font-weight: 600;">💡 Astuce Pro</p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.7;">
                  <strong>Préparez votre dossier 2-3 mois avant de chercher activement.</strong> Ainsi, dès que vous trouvez le bien idéal, vous pouvez faire une offre ferme avec accord de principe en poche. C'est un atout considérable face aux autres acheteurs.
                </p>
              </div>

              <div style="padding: 20px; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 25px 0;">
                <h3 style="margin: 0 0 10px; color: #1e40af; font-size: 17px; font-weight: 600;">📊 Les Facteurs qui Influencent votre Taux</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.8;">
                  <li><strong>Votre apport</strong> : Plus vous apportez, meilleur sera le taux (idéal : 20% minimum)</li>
                  <li><strong>Votre situation professionnelle</strong> : CDI vs CDD vs Freelance</li>
                  <li><strong>La durée du prêt</strong> : Plus court = meilleur taux mais mensualités plus élevées</li>
                  <li><strong>Votre historique bancaire</strong> : Aucun incident de paiement</li>
                  <li><strong>Le type de bien</strong> : Résidence principale vs investissement</li>
                </ul>
              </div>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px;">
                    <p style="margin: 0 0 15px; color: #ffffff; font-size: 16px; font-weight: 600;">
                      Prêt à calculer votre capacité d'emprunt ?
                    </p>
                    <a href="{{calculatorUrl}}" style="display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">Utiliser notre Calculateur →</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Besoin d'aide pour préparer votre financement ? <a href="{{demoUrl}}" style="color: #667eea; text-decoration: none;">Réservez un conseil personnalisé</a> gratuit avec notre équipe.
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #f9fafb; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #666666; font-size: 14px;">
                À bientôt,<br>
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

Comment financer votre projet immobilier : Les 4 étapes essentielles

1. Préparer votre dossier
   Rassemblez tous les justificatifs nécessaires

2. Calculer votre capacité d'emprunt
   Vos remboursements ne doivent pas dépasser 33% de vos revenus

3. Comparer les offres
   Faites jouer la concurrence entre banques

4. Obtenir l'accord de principe
   Votre sésame pour négocier en position de force

💡 Astuce Pro : Préparez votre dossier 2-3 mois avant de chercher activement.

Les facteurs qui influencent votre taux :
- Votre apport (idéal : 20% minimum)
- Votre situation professionnelle
- La durée du prêt
- Votre historique bancaire
- Le type de bien

Utiliser notre Calculateur : {{calculatorUrl}}
Réserver un conseil : {{demoUrl}}

L'équipe Viridial
    `,
    variables: {
      firstName: 'string',
      calculatorUrl: 'string',
      demoUrl: 'string',
    },
  },

  /**
   * TEMPLATE 6: Visite Virtuelle - Guide Complet
   * Jour 7 du workflow Nurturing
   * Taux d'ouverture cible: 20-30%
   */
  nurturing_virtual_tour: {
    subject: '{{firstName}}, découvrez les visites virtuelles : guide complet 🏡',
    subjectVariations: [
      'Visites Virtuelles : Tout ce que {{firstName}} doit savoir',
      '{{firstName}}, comment utiliser les visites virtuelles efficacement',
      'Guide : Les Visites Virtuelles expliquées à {{firstName}}',
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
                Bonjour {{firstName}}, 🏡
              </h1>
              <p style="margin: 0 0 25px; color: #555555; font-size: 16px; line-height: 1.6;">
                Les <strong>visites virtuelles</strong> révolutionnent la recherche immobilière. Aujourd'hui, je vous explique comment les utiliser efficacement pour gagner du temps et trouver le bien idéal.
              </p>

              <div style="padding: 25px; background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); border-radius: 8px; margin: 25px 0;">
                <h2 style="margin: 0 0 15px; color: #1e40af; font-size: 20px; font-weight: 600;">🎯 Pourquoi les Visites Virtuelles ?</h2>
                <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.8;">
                  <li><strong>Gain de temps :</strong> Pré-selectionnez efficacement avant de visiter physiquement</li>
                  <li><strong>Accessibilité :</strong> Visitez depuis chez vous, 24/7</li>
                  <li><strong>Comparaison facile :</strong> Comparez plusieurs biens rapidement</li>
                  <li><strong>Vue détaillée :</strong> Zoom, navigation 360°, mesures précises</li>
                  <li><strong>Planification optimale :</strong> Ne visitez physiquement que les biens qui correspondent vraiment</li>
                </ul>
              </div>

              <h2 style="margin: 30px 0 15px; color: #333333; font-size: 20px; font-weight: 600;">📋 Comment Utiliser les Visites Virtuelles</h2>

              <div style="margin: 20px 0;">
                <div style="padding: 20px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                  <h3 style="margin: 0 0 10px; color: #333333; font-size: 17px; font-weight: 600;">1. Pré-visite de Sélection</h3>
                  <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    Utilisez la visite virtuelle pour <strong>éliminer rapidement</strong> les biens qui ne correspondent pas à vos critères. Faites attention à la luminosité, l'agencement, l'état général.
                  </p>
                </div>
              </div>

              <div style="margin: 20px 0;">
                <div style="padding: 20px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                  <h3 style="margin: 0 0 10px; color: #333333; font-size: 17px; font-weight: 600;">2. Analyse Détaillée</h3>
                  <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    Pour les biens qui vous intéressent, <strong>explorez en détail</strong> : vérifiez les finitions, les placards, la vue depuis les fenêtres, l'orientation des pièces.
                  </p>
                </div>
              </div>

              <div style="margin: 20px 0;">
                <div style="padding: 20px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                  <h3 style="margin: 0 0 10px; color: #333333; font-size: 17px; font-weight: 600;">3. Préparation à la Visite Physique</h3>
                  <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                    Après la visite virtuelle, vous arrivez <strong>préparé</strong> à la visite physique. Vous savez déjà ce que vous voulez voir en détail, quelles questions poser.
                  </p>
                </div>
              </div>

              <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 25px 0;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 15px; font-weight: 600;">💡 Astuce d'Expert</p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.7;">
                  <strong>Utilisez les visites virtuelles pour faire un premier tri.</strong> Ensuite, visitez physiquement uniquement les 3-5 biens qui ont retenu votre attention. Vous gagnerez un temps précieux et serez plus efficace dans votre recherche.
                </p>
              </div>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px;">
                    <p style="margin: 0 0 15px; color: #ffffff; font-size: 16px; font-weight: 600;">
                      Découvrez nos biens avec visites virtuelles
                    </p>
                    <a href="{{searchUrl}}" style="display: inline-block; padding: 14px 28px; background-color: #ffffff; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">Explorer les biens →</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Des questions sur les visites virtuelles ? <a href="{{demoUrl}}" style="color: #667eea; text-decoration: none;">Réservez un appel</a> avec notre équipe.
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #f9fafb; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; color: #666666; font-size: 14px;">
                À bientôt,<br>
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

Les visites virtuelles révolutionnent la recherche immobilière. Voici comment les utiliser efficacement :

🎯 Pourquoi les Visites Virtuelles ?
- Gain de temps : Pré-selection efficace
- Accessibilité : Visitez 24/7 depuis chez vous
- Comparaison facile : Plusieurs biens rapidement
- Vue détaillée : Zoom, 360°, mesures précises

📋 Comment les Utiliser :

1. Pré-visite de Sélection
   Éliminez rapidement les biens qui ne correspondent pas

2. Analyse Détaillée
   Explorez en détail les biens qui vous intéressent

3. Préparation à la Visite Physique
   Arrivez préparé avec vos questions

💡 Astuce : Faites un premier tri virtuel, puis visitez physiquement uniquement les 3-5 meilleurs biens.

Explorer les biens : {{searchUrl}}
Réserver un appel : {{demoUrl}}

L'équipe Viridial
    `,
    variables: {
      firstName: 'string',
      searchUrl: 'string',
      demoUrl: 'string',
    },
  },
};

