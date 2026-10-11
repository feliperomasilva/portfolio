/* eslint-disable react/only-export-components -- provider + hook coesos no mesmo módulo i18n */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STRINGS } from './content';

const LocaleContext = createContext(null);
const KEY = 'frs-locale';

const getInitial = () => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'pt') return saved;
  } catch { /* noop */ }
  return 'pt';
};

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState(getInitial);

  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en-US';
    try { localStorage.setItem(KEY, locale); } catch { /* noop */ }
    window.dispatchEvent(new CustomEvent('frs:locale', { detail: locale }));
  }, [locale]);

  const toggle = useCallback(() => {
    setLocale((p) => (p === 'pt' ? 'en' : 'pt'));
  }, []);

  const value = useMemo(() => ({
    locale,
    setLocale,
    toggle,
    t: STRINGS[locale],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
};

export default LocaleContext;
