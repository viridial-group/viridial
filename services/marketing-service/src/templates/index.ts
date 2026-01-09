/**
 * Email Templates Index
 * Exporte tous les templates d'email organisés par catégorie
 */

import { welcomeEmailTemplates } from './email-templates-welcome';
import { nurturingEmailTemplates } from './email-templates-nurturing';
import { conversionEmailTemplates } from './email-templates-conversion';
import { reactivationEmailTemplates } from './email-templates-reactivation';

/**
 * Tous les templates d'email organisés par catégorie
 */
export const emailTemplates = {
  welcome: welcomeEmailTemplates,
  nurturing: nurturingEmailTemplates,
  conversion: conversionEmailTemplates,
  reactivation: reactivationEmailTemplates,
};

/**
 * Liste complète de tous les templates avec leurs métadonnées
 */
export const allEmailTemplates = {
  // Welcome Series
  welcome_instant: {
    ...welcomeEmailTemplates.welcome_instant,
    category: 'welcome',
    sendAfter: 'immediately',
    trigger: 'LEAD_CREATED',
  },
  welcome_guide_tips: {
    ...welcomeEmailTemplates.welcome_guide_tips,
    category: 'welcome',
    sendAfter: '1 hour',
    trigger: 'LEAD_CREATED',
  },
  welcome_agency_intro: {
    ...welcomeEmailTemplates.welcome_agency_intro,
    category: 'welcome',
    sendAfter: '2 days',
    trigger: 'LEAD_CREATED',
  },

  // Nurturing Series
  nurturing_errors_avoid: {
    ...nurturingEmailTemplates.nurturing_errors_avoid,
    category: 'nurturing',
    sendAfter: '1 day',
    trigger: 'WORKFLOW_STEP',
  },
  nurturing_financing_guide: {
    ...nurturingEmailTemplates.nurturing_financing_guide,
    category: 'nurturing',
    sendAfter: '4 days',
    trigger: 'WORKFLOW_STEP',
  },
  nurturing_virtual_tour: {
    ...nurturingEmailTemplates.nurturing_virtual_tour,
    category: 'nurturing',
    sendAfter: '7 days',
    trigger: 'WORKFLOW_STEP',
  },

  // Conversion Series
  trial_ending_soon: {
    ...conversionEmailTemplates.trial_ending_soon,
    category: 'conversion',
    sendAfter: '11 days', // J-3 avant fin essai (14 jours)
    trigger: 'DATE_REACHED',
  },
  trial_last_chance: {
    ...conversionEmailTemplates.trial_last_chance,
    category: 'conversion',
    sendAfter: '13 days', // J-1 avant fin essai
    trigger: 'DATE_REACHED',
  },

  // Reactivation Series
  we_miss_you: {
    ...reactivationEmailTemplates.we_miss_you,
    category: 'reactivation',
    sendAfter: '30 days',
    trigger: 'DATE_REACHED',
  },
  special_offer_return: {
    ...reactivationEmailTemplates.special_offer_return,
    category: 'reactivation',
    sendAfter: '60 days',
    trigger: 'DATE_REACHED',
  },
};

/**
 * Helper function pour obtenir un template par son ID
 */
export function getEmailTemplate(templateId: string) {
  const template = allEmailTemplates[templateId];
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }
  return template;
}

/**
 * Helper function pour obtenir tous les templates d'une catégorie
 */
export function getTemplatesByCategory(category: 'welcome' | 'nurturing' | 'conversion' | 'reactivation') {
  return Object.entries(allEmailTemplates)
    .filter(([_, template]) => template.category === category)
    .reduce((acc, [id, template]) => {
      acc[id] = template;
      return acc;
    }, {} as typeof allEmailTemplates);
}

/**
 * Exporter les templates par défaut pour facilité d'utilisation
 */
export default emailTemplates;

