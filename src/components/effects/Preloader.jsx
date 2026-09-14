import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../i18n/LocaleContext';
import { canAnimate, ensureGsap } from '../../lib/js/motion';
import './Preloader.css';

// Tones seguem a ordem das frentes (Frontend, Backend, Responsividade)
const TONES = ['tone-blue', 'tone-green', 'tone-ice'];

// Intro dark minimalista no tema do site: vazio --bg-0 com glows amber/ice/matrix,
// nome "Felipe Romão da Silva" desenhado em stroke SVG, contador 000→100 em ~5s,
// saída em cortina que dispara 'frs:ready' para o Hero. 1x por sessão. ESC acelera.
const Preloader = ({ onDone }) => {
  const { t } = useLocale();
  const pre = t.preloader;
  const WORDS = pre.words.map((label, i) => ({
    n: `0${i + 1}`,
    label,
    tone: TONES[i % TONES.length],
  }));
  const [visible, setVisible] = useState(() => {
    if (typeof sessionStorage === 'undefined') return true;
    return !sessionStorage.getItem('frs-preloaded');
  });
  const rootRef = useRef(null);
  const numRef = useRef(null);
  const barRef = useRef(null);
  const statusRef = useRef(null);
  const tlRef = useRef(null);
  const doneRef = useRef(false);

  const skip = () => {
    const tl = tlRef.current;
    if (!tl || doneRef.current) return;
    if (tl.progress() > 0.82) return;
    tl.timeScale(3);
  };

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = 'hidden';
    if (!canAnimate()) {
      finish();
      return;
    }
    const gsap = ensureGsap();
    const root = rootRef.current;
    if (!root) {
      finish();
      return;
    }
    const q = (sel) => root.querySelectorAll(sel);
    const num = { v: 0 };
    const setStatus = (t) => {
      if (statusRef.current) statusRef.current.textContent = t;
    };
    const tl = gsap.timeline({ onComplete: finish });
    tlRef.current = tl;

    tl.set(q('.boot-bg'), { opacity: 0 }, 0);
    tl.set(q('.boot-meta > *'), { opacity: 0, y: 10 }, 0);
    tl.set(q('.boot-draw .draw-line'), { strokeDashoffset: 1400, fillOpacity: 0 }, 0);
    tl.set(q('.boot-rule'), { scaleX: 0 }, 0);
    tl.set(q('.boot-sub'), { opacity: 0, y: 14 }, 0);
    tl.set(q('.boot-word'), { opacity: 0, y: 14, scale: 0.96 }, 0);
    tl.set(q('.boot-foot'), { opacity: 0, y: 10 }, 0);

    tl.to(q('.boot-bg'), { opacity: 1, duration: 0.8, ease: 'expo.out' }, 0.05);
    tl.to(q('.boot-meta > *'), { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.08 }, 0.2);
    tl.to(q('.boot-draw .draw-line'), { strokeDashoffset: 0, duration: 2.6, ease: 'expo.inOut', stagger: 0.3 }, 0.3);
    tl.to(q('.boot-draw .draw-main'), { fillOpacity: 1, duration: 0.9, ease: 'expo.out' }, 2.1);
    tl.to(q('.boot-draw .draw-second'), { fillOpacity: 1, duration: 0.9, ease: 'expo.out' }, 2.6);
    tl.to(q('.boot-rule'), { scaleX: 1, duration: 1.0, ease: 'expo.inOut' }, 1.4);
    tl.to(q('.boot-sub'), { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 2.4);
    tl.to(q('.boot-word'), { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'expo.out', stagger: 0.09 }, 2.7);
    tl.to(q('.boot-foot'), { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 2.9);

    tl.call(() => setStatus(pre.status[0]), null, 0.5);
    tl.call(() => setStatus(pre.status[1]), null, 2.0);
    tl.call(() => setStatus(pre.status[2]), null, 3.8);

    tl.to(num, {
      v: 100, duration: 3.6, ease: 'power2.inOut',
      onUpdate: () => {
        if (numRef.current) numRef.current.textContent = String(Math.round(num.v)).padStart(3, '0');
        if (barRef.current) barRef.current.style.transform = `scaleX(${(num.v / 100).toFixed(3)})`;
      },
    }, 0.4);

    tl.to({}, { duration: 0.35 });
    tl.to(q('.boot-card'), { y: -26, opacity: 0, duration: 0.45, ease: 'expo.in' }, '>-0.02');
    tl.to(root, { clipPath: 'inset(0 0 100% 0)', duration: 0.75, ease: 'expo.inOut' }, '<0.12');

    function finish() {
      if (doneRef.current) return;
      doneRef.current = true;
      try { sessionStorage.setItem('frs-preloaded', '1'); } catch { /* noop */ }
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('frs:ready'));
      setVisible(false);
      if (onDone) onDone();
    }
    const onKey = (e) => { if (e.key === 'Escape') skip(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); tl.kill(); document.body.style.overflow = ''; };
  }, [visible, onDone, pre.status]);

  if (!visible) return null;
  return (
    <div ref={rootRef} className="preloader intro-boot" aria-label={pre.introLabel} style={{ clipPath: 'inset(0 0 0% 0)' }}>
      <div className="boot-bg" aria-hidden="true">
        <span className="boot-glow glow-a" />
        <span className="boot-glow glow-b" />
        <span className="boot-grid" />
        <span className="boot-vignette" />
      </div>
      <div className="boot-card" role="dialog" aria-modal="true" aria-label={pre.dialogLabel}>
        <div className="boot-meta">
          {pre.meta.map((m) => (
            <span key={m} className="mono">{m}</span>
          ))}
        </div>
        <svg className="boot-draw" viewBox="0 0 680 196" role="img" aria-label="Felipe Romão da Silva">
          <text x="50%" y="82" textAnchor="middle" className="draw-line draw-main">Felipe Romão</text>
          <text x="50%" y="152" textAnchor="middle" className="draw-line draw-second">da Silva</text>
        </svg>
        <span className="boot-rule" aria-hidden="true" />
        <p className="boot-sub">{pre.sub}</p>
        <ul className="boot-words" aria-label={pre.wordsLabel}>
          {WORDS.map((w) => (
            <li key={w.n} className="boot-word">
              <span className="boot-num mono">{w.n}</span>
              <span className={`boot-pill ${w.tone}`}>{w.label}</span>
            </li>
          ))}
        </ul>
        <div className="boot-foot">
          <span className="boot-count mono" ref={numRef}>000</span>
          <span className="boot-progress" aria-hidden="true"><span ref={barRef} /></span>
          <span className="boot-status mono" ref={statusRef}>{pre.status[0]}</span>
          <button type="button" className="boot-skip" onClick={skip} autoFocus>
            <kbd>ESC</kbd> {pre.skip}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
