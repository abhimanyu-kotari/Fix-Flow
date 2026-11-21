import React, { createContext, useContext, useState } from 'react';
import { SUPPORTED_LANGUAGES, getTranslation } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('ff_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (langCode) => {
    setLanguageState(langCode);
    try {
      localStorage.setItem('ff_lang', langCode);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  const t = (key, params = {}) => {
    return getTranslation(language, key, params);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key, params = {}) => getTranslation('en', key, params),
      supportedLanguages: SUPPORTED_LANGUAGES
    };
  }
  return context;
}
