import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Keep HTML document lang and notranslate flags synchronized with active language
  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language || 'en';
        document.documentElement.setAttribute('translate', 'no');
        document.documentElement.classList.add('notranslate');
        if (document.body) {
          document.body.setAttribute('translate', 'no');
          document.body.classList.add('notranslate');
        }
      }
    } catch (e) {
      console.error('Error syncing language attributes', e);
    }
  }, [language]);

  const setLanguage = (langCode) => {
    setLanguageState(langCode);
    try {
      localStorage.setItem('ff_lang', langCode);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = langCode || 'en';
        document.documentElement.setAttribute('translate', 'no');
        document.documentElement.classList.add('notranslate');
        if (document.body) {
          document.body.setAttribute('translate', 'no');
          document.body.classList.add('notranslate');
        }
      }
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
