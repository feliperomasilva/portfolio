import { useId } from 'react';
import { useLocale } from '../../i18n/LocaleContext';
import './LanguageToggle.css';

const FlagBR = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <circle cx="16" cy="16" r="16" fill="#009b3a" />
    <path d="M16 5.5 27 16 16 26.5 5 16Z" fill="#fedf00" />
    <circle cx="16" cy="16" r="5.2" fill="#002776" />
    <path d="M11.6 14.3c2.4 1.1 5.4 1.5 8.6.7l-.5 1.2c-3 .7-5.9.3-8.2-.7Z" fill="#fff" />
  </svg>
);

const FlagUS = ({ id }) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <circle cx="16" cy="16" r="16" fill="#b31942" />
    <clipPath id={id}><circle cx="16" cy="16" r="16" /></clipPath>
    <g clipPath={`url(#${id})`}>
      <rect x="0" y="4.9" width="32" height="2.5" fill="#fff" />
      <rect x="0" y="9.8" width="32" height="2.5" fill="#fff" />
      <rect x="0" y="14.7" width="32" height="2.5" fill="#fff" />
      <rect x="0" y="19.6" width="32" height="2.5" fill="#fff" />
      <rect x="0" y="24.5" width="32" height="2.5" fill="#fff" />
      <rect x="0" y="0" width="15" height="12.4" fill="#0a3161" />
    </g>
  </svg>
);

const LanguageToggle = ({ className = '' }) => {
  const { locale, toggle, t } = useLocale();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const isEn = locale === 'en';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isEn}
      aria-label={isEn ? t.toggleToPt : t.toggleToEn}
      title={isEn ? t.toggleToPt : t.toggleToEn}
      onClick={toggle}
      className={`lang-toggle${isEn ? ' is-en' : ' is-pt'} ${className}`}
    >
      <span className="lang-opt" data-active={!isEn} aria-hidden="true">
        <span key={`br-${String(!isEn)}`} className="lang-flag"><FlagBR /></span>
        <span className="lang-code">PT</span>
      </span>
      <span className="lang-opt" data-active={isEn} aria-hidden="true">
        <span key={`us-${String(isEn)}`} className="lang-flag"><FlagUS id={`us-${uid}`} /></span>
        <span className="lang-code">EN</span>
      </span>
      <span className="lang-knob" aria-hidden="true" />
    </button>
  );
};

export default LanguageToggle;
