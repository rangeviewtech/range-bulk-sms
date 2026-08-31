'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { LanguageCode, LanguageMeta, TranslationDictionary, getLanguageMeta, getDictionary } from '@/lib/i18n';
import { toast } from 'sonner';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode, showToast?: boolean) => void;
  dict: TranslationDictionary;
  currentLanguageMeta: LanguageMeta;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('EN');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage or cookie on mount
    try {
      const stored = localStorage.getItem('app_language');
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLanguageState(stored.toUpperCase() as LanguageCode);
      } else {
        const match = document.cookie.match(/app_language=([^;]+)/);
        if (match && match[1]) {
          setLanguageState(match[1].toUpperCase() as LanguageCode);
        }
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const setLanguage = (newLang: LanguageCode, showToast = true) => {
    const code = newLang.toUpperCase() as LanguageCode;
    setLanguageState(code);
    try {
      localStorage.setItem('app_language', code);
      document.cookie = `app_language=${code};path=/;max-age=31536000;SameSite=Lax`;
    } catch {
      // ignore
    }
    
    const meta = getLanguageMeta(code);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code.toLowerCase();
      document.documentElement.dir = meta.isRtl ? 'rtl' : 'ltr';
    }

    if (showToast) {
      toast.info(`Language set to ${meta.name}`);
    }
  };

  const meta = useMemo(() => getLanguageMeta(language), [language]);
  const dict = useMemo(() => getDictionary(language), [language]);
  const isRtl = Boolean(meta.isRtl);

  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      document.documentElement.lang = language.toLowerCase();
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    }
  }, [language, isRtl, mounted]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      dict,
      currentLanguageMeta: meta,
      isRtl,
    }),
    [language, dict, meta, isRtl]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    const defaultMeta = getLanguageMeta('EN');
    const defaultDict = getDictionary('EN');
    return {
      language: 'EN',
      setLanguage: () => {},
      dict: defaultDict,
      currentLanguageMeta: defaultMeta,
      isRtl: false,
    };
  }
  return context;
}
