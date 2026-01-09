'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, defaultLanguage, supportedLanguages } from '@/lib/i18n/config';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Load translations dynamically
const translationsCache: Record<string, any> = {};

async function loadTranslations(lang: Language): Promise<any> {
  if (translationsCache[lang]) {
    return translationsCache[lang];
  }

  try {
    const [common, home, features, pricing, search, property, auth, about, contact, caseStudies, testimonials] = await Promise.all([
      import(`@/lib/i18n/translations/common.${lang}.json`).catch(() => import(`@/lib/i18n/translations/common.${defaultLanguage}.json`)),
      import(`@/lib/i18n/translations/home.${lang}.json`).catch(() => import(`@/lib/i18n/translations/home.${defaultLanguage}.json`)),
      import(`@/lib/i18n/translations/features.${lang}.json`).catch(() => import(`@/lib/i18n/translations/features.${defaultLanguage}.json`)),
      import(`@/lib/i18n/translations/pricing.${lang}.json`).catch(() => import(`@/lib/i18n/translations/pricing.${defaultLanguage}.json`)),
      import(`@/lib/i18n/translations/search.${lang}.json`).catch(() => import(`@/lib/i18n/translations/search.${defaultLanguage}.json`)),
      import(`@/lib/i18n/translations/property.${lang}.json`).catch(() => import(`@/lib/i18n/translations/property.${defaultLanguage}.json`)),
      import(`@/lib/i18n/translations/auth.${lang}.json`).catch(() => import(`@/lib/i18n/translations/auth.${defaultLanguage}.json`)),
      import(`@/lib/i18n/translations/about.${lang}.json`).catch(() => import(`@/lib/i18n/translations/about.${defaultLanguage}.json`)),
      import(`@/lib/i18n/translations/contact.${lang}.json`).catch(() => import(`@/lib/i18n/translations/contact.${defaultLanguage}.json`)),
      import(`@/lib/i18n/translations/case-studies.${lang}.json`).catch(() => import(`@/lib/i18n/translations/case-studies.${defaultLanguage}.json`)),
      import(`@/lib/i18n/translations/testimonials.${lang}.json`).catch(() => import(`@/lib/i18n/translations/testimonials.${defaultLanguage}.json`)),
    ]);

    const translations = {
      common: common.default || common,
      home: home.default || home,
      features: features.default || features,
      pricing: pricing.default || pricing,
      search: search.default || search,
      property: property.default || property,
      auth: auth.default || auth,
      about: about.default || about,
      contact: contact.default || contact,
      'case-studies': caseStudies.default || caseStudies,
      testimonials: testimonials.default || testimonials,
    };

    translationsCache[lang] = translations;
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);
    // Fallback to default language
    if (lang !== defaultLanguage) {
      return loadTranslations(defaultLanguage);
    }
    return {};
  }
}

interface I18nProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      if (saved && supportedLanguages[saved]) {
        return saved;
      }
    }
    return initialLanguage || defaultLanguage;
  });

  const [translations, setTranslations] = useState<any>({});

  useEffect(() => {
    loadTranslations(language).then(setTranslations);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = supportedLanguages[lang].rtl ? 'rtl' : 'ltr';
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = supportedLanguages[language].rtl ? 'rtl' : 'ltr';
    }
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to key if translation not found
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  const isRTL = supportedLanguages[language].rtl;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}

