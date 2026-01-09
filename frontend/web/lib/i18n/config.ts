export const supportedLanguages = {
  fr: { name: 'Français', nativeName: 'Français', flag: '🇫🇷', rtl: false },
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧', rtl: false },
  es: { name: 'Español', nativeName: 'Español', flag: '🇪🇸', rtl: false },
  ar: { name: 'العربية', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  de: { name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
  it: { name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹', rtl: false },
  vi: { name: 'Tiếng Việt', nativeName: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
  zh: { name: '中文', nativeName: '中文', flag: '🇨🇳', rtl: false },
  pt: { name: 'Português', nativeName: 'Português', flag: '🇵🇹', rtl: false },
  ru: { name: 'Русский', nativeName: 'Русский', flag: '🇷🇺', rtl: false },
} as const;

export type Language = keyof typeof supportedLanguages;
export const defaultLanguage: Language = 'fr';
export const languages = Object.keys(supportedLanguages) as Language[];

