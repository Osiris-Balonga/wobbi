import { useEffect, useMemo, useState } from 'react';
import {
  applyDocumentLocale,
  LocaleContext,
  resolveLocale,
  STORAGE_KEY,
  supportedLocales,
  translate,
} from './index.js';

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (supportedLocales.includes(saved)) return saved;
    } catch {
      // Browser storage may be unavailable.
    }
    return resolveLocale(
      navigator.languages?.length ? navigator.languages : [navigator.language],
    );
  });

  useEffect(() => {
    applyDocumentLocale(locale);
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // The selected language still works for this session.
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key, values) => translate(locale, key, values),
    }),
    [locale],
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
