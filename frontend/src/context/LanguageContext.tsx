import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { en, TranslationKey } from '../locales/en';
import { or } from '../locales/or';

export type Language = 'en' | 'or';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>, fallback?: string) => string;
}

const STORAGE_KEY = 'myc_language';

const dictionaries: Record<Language, Record<string, string>> = {
  en: en as unknown as Record<string, string>,
  or: or as unknown as Record<string, string>,
};

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'or') {
      return saved;
    }
  } catch {
    // Fallback if localStorage is disabled or throws
  }
  return 'en';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Sync document html lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    if (lang === 'en' || lang === 'or') {
      setLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>, fallback?: string): string => {
      const currentDict = dictionaries[language];
      const enDict = dictionaries.en;

      let value = currentDict?.[key] || enDict?.[key] || fallback || key;

      if (params && typeof value === 'string') {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }

      return value;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
