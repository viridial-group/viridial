'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '@/contexts/I18nContext';
import { supportedLanguages, Language } from '@/lib/i18n/config';
import { Card, CardContent } from '@/components/ui/card';

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Sélectionner la langue"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4 text-gray-600" />
        <span className="hidden sm:inline text-sm font-medium text-gray-700">
          {supportedLanguages[language].flag} {supportedLanguages[language].nativeName}
        </span>
        <span className="sm:hidden text-sm font-medium text-gray-700">
          {supportedLanguages[language].flag}
        </span>
      </button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-64 z-50 border-2 shadow-xl animate-fade-in">
          <CardContent className="p-2">
            <div className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wide">
              Langue / Language
            </div>
            <div className="max-h-80 overflow-y-auto">
              {(Object.keys(supportedLanguages) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between rounded-md transition-colors ${
                    language === lang ? 'bg-viridial-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{supportedLanguages[lang].flag}</span>
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {supportedLanguages[lang].nativeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {supportedLanguages[lang].name}
                      </div>
                    </div>
                  </div>
                  {language === lang && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

