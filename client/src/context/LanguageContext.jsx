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

  // Keep HTML document lang locked to 'en' and enforce notranslate flags to prevent browser auto-translation
  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        // ALWAYS keep document lang as 'en' so Chrome does not detect a foreign page and trigger auto-translate
        document.documentElement.lang = 'en';
        document.documentElement.setAttribute('translate', 'no');
        document.documentElement.setAttribute('data-no-translation', 'true');
        document.documentElement.classList.add('notranslate');
        if (document.body) {
          document.body.setAttribute('translate', 'no');
          document.body.setAttribute('data-no-translation', 'true');
          document.body.classList.add('notranslate');
        }
        const root = document.getElementById('root');
        if (root) {
          root.setAttribute('translate', 'no');
          root.setAttribute('data-no-translation', 'true');
          root.classList.add('notranslate');
        }
      }
    } catch (e) {
      console.error('Error syncing language attributes', e);
    }
  }, [language]);

  // Active mutation defense against third-party translation extensions (e.g. Immersive Translate, Google Translate)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;

    const cleanupInjectedNodes = () => {
      try {
        const injected = document.querySelectorAll(
          '.immersive-translate-target-wrapper, .immersive-translate-target, .immersive-translate-text, font[style*="vertical-align"], #goog-gt-tt'
        );
        injected.forEach(node => {
          try { node.remove(); } catch {}
        });
      } catch {}
    };

    cleanupInjectedNodes();

    const observer = new MutationObserver((mutations) => {
      let shouldClean = false;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) {
            const el = node;
            if (
              el.classList?.contains('immersive-translate-target-wrapper') ||
              el.classList?.contains('immersive-translate-target') ||
              el.classList?.contains('immersive-translate-text') ||
              el.tagName === 'FONT' ||
              el.id === 'goog-gt-tt'
            ) {
              shouldClean = true;
              break;
            }
          }
        }
        if (shouldClean) break;
      }
      if (shouldClean) {
        cleanupInjectedNodes();
      }
    });

    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const setLanguage = (langCode) => {
    setLanguageState(langCode);
    try {
      localStorage.setItem('ff_lang', langCode);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = 'en';
        document.documentElement.setAttribute('translate', 'no');
        document.documentElement.setAttribute('data-no-translation', 'true');
        document.documentElement.classList.add('notranslate');
        if (document.body) {
          document.body.setAttribute('translate', 'no');
          document.body.setAttribute('data-no-translation', 'true');
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
