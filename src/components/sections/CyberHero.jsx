import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { ArrowDown, Copy, Check, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleContext';
import { scrollToId } from '../../lib/js/dom';
import { canAnimate, ensureGsap, ensureSplitText, refreshScroll, EASE } from '../../lib/js/motion';
import { prefersReducedMotion } from '../../lib/js/device';
import { Magnetic } from '../ui/Magnetic';
import { AnimatedIcon } from '../ui/AnimatedIcon';
import Showreel from './Showreel';
import './CyberHero.css';

// Palco 3D sob demanda: three.js (~600KB) fora do bundle inicial.
// Chunk tolerante a falha de rede: se o download falhar, renderiza null
// (card fica no fluxo normal) em vez de travar o Suspense para sempre.
const MacbookStage = lazy(() =>
  import('./macbook/MacbookStage').catch(() => ({ default: () => null }))
);

const ROW = 148;
const BASE_TRACKS = 3;
const BASE = BASE_TRACKS * ROW;

const trackHref = (id) => {
  if (id === 'agrotec') return 'https://projetoagrotec.vercel.app/';
  if (id === 'frontend') return '#skills';
  return null;
};

const MomentumCard = ({ tracks, labels }) => {
  const LOOP_TRACKS = [...tracks, ...tracks, ...tracks];
  const loopLen = LOOP_TRACKS.length;
  const cardRef = useRef(null);
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const offset = useRef(BASE);
  const vel = useRef(0);
  const dragging = useRef(false);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const snap = useRef(null);

  const go = useCallback((dir) => {
    snap.current = offset.current + dir * ROW;
    vel.current = 0;
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Pausa o autoplay com a aba oculta para não acumular snaps ao voltar.
    const id = setInterval(() => { if (!document.hidden) go(1); }, 4200);
    return () => clearInterval(id);
  }, [playing, go]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const total = tracks.length * ROW;
    // Cache das linhas: evita querySelectorAll a cada frame (~60x/s)
    const rows = Array.from(el.querySelectorAll('.cy-track'));
    let raf = 0;
    let inView = true;
    const wrap = (v) => {
      let n = (v - BASE) % total;
      if (n < 0) n += total;
      return BASE + n;
    };
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!inView || document.hidden) return;
      if (snap.current !== null) {
        offset.current += (snap.current - offset.current) * 0.16;
        if (Math.abs(snap.current - offset.current) < 0.5) {
          offset.current = snap.current;
          snap.current = null;
          offset.current = wrap(offset.current);
        }
      } else if (!dragging.current) {
        offset.current += vel.current;
        vel.current *= 0.94;
        if (Math.abs(vel.current) < 0.05) vel.current = 0;
        offset.current = wrap(offset.current);
      }
      const center = offset.current / ROW;
      rows.forEach((r, i) => {
        let d = i - center;
        if (d > loopLen / 2) d -= loopLen;
        if (d < -loopLen / 2) d += loopLen;
        const abs = Math.abs(d);
        if (abs > 2.2) {
          r.style.opacity = '0';
          r.style.visibility = 'hidden';
          return;
        }
        r.style.visibility = 'visible';
        r.style.transform = `translateY(${(d * ROW).toFixed(1)}px) scale(${(1 - Math.min(abs * 0.1, 0.25)).toFixed(3)})`;
        r.style.opacity = String(Math.max(0, 1 - abs * 0.5));
        r.style.zIndex = String(10 - Math.round(abs * 3));
      });
      const nearest = ((Math.round(center) % tracks.length) + tracks.length) % tracks.length;
      setIndex((p) => (p === nearest ? p : nearest));
    };
    raf = requestAnimationFrame(render);
    const down = (e) => {
      dragging.current = true;
      snap.current = null;
      vel.current = 0;
      lastY.current = e.clientY;
      lastT.current = performance.now();
    };
    // Pointer Events cobrem mouse + touch + caneta; os listeners touch duplicados
    // foram removidos (disparavam junto e aplicavam o deslocamento 2x no mobile).
    // touch-action: pan-y no CSS mantém a rolagem vertical da página.
    const move = (e) => {
      if (!dragging.current) return;
      const y = e.clientY;
      const dy = lastY.current - y;
      offset.current = wrap(offset.current + dy);
      const t = performance.now();
      const dt = Math.max(1, t - lastT.current);
      vel.current = (dy / dt) * 16;
      lastY.current = y;
      lastT.current = t;
    };
    const up = () => {
      if (!dragging.current) return;
      dragging.current = false;
      snap.current = wrap(Math.round(offset.current / ROW) * ROW);
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    const obs = new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0 });
    obs.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [tracks, loopLen]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !canAnimate()) return;
    if (window.matchMedia('(hover: none)').matches) return;
    const gsap = ensureGsap();
    const rX = gsap.quickTo(card, 'rotationX', { duration: 0.7, ease: 'power3' });
    const rY = gsap.quickTo(card, 'rotationY', { duration: 0.7, ease: 'power3' });
    const onMove = (e) => {
      // Dentro da tela 3D o transform é dono do CSS3DRenderer — não disputar.
      if (card.classList.contains('mb-screen-card')) return;
      const r = card.getBoundingClientRect();
      rX((((e.clientY - r.top) / r.height - 0.5) * -6).toFixed(2));
      rY((((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2));
    };
    const onLeave = () => {
      if (card.classList.contains('mb-screen-card')) return;
      rX(0); rY(0);
    };
    card.style.transformPerspective = '1100px';
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    return () => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave); };
  }, []);

  const active = tracks[index % tracks.length];
  const openActive = () => {
    const href = trackHref(active.id);
    if (href === null) scrollToId('contact');
    else if (href.startsWith('#')) scrollToId(href.slice(1));
    else window.open(href, '_blank', 'noopener');
  };

  return (
    <div className="cy-card card" ref={cardRef}>
      <div className="cy-card-top">
        <span className="mono">~/felipe — {labels.live}</span>
        <span className="cy-live"><i />{labels.live}</span>
      </div>
      <div className="cy-list" ref={listRef} role="listbox" aria-label={labels.listLabel} tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); go(1); }
          if (e.key === 'ArrowUp') { e.preventDefault(); go(-1); }
          if (e.key === 'Enter') { e.preventDefault(); openActive(); }
        }}>
        <div className="cy-list-inner">
          {LOOP_TRACKS.map((t, i) => {
            const li = ((i % tracks.length) + tracks.length) % tracks.length;
            return (
              <button key={`${t.id}-${i}`} role="option" aria-selected={li === index} tabIndex={-1}
                className={`cy-track ${li === index ? 'active' : ''}`} onClick={() => {
                  const cur = offset.current / ROW;
                  const span = LOOP_TRACKS.length;
                  let best = i;
                  let bestDist = Math.abs(i - cur);
                  [i - tracks.length, i + tracks.length].forEach((c) => {
                    if (c < 0 || c >= span) return;
                    const d = Math.abs(c - cur);
                    if (d < bestDist) { bestDist = d; best = c; }
                  });
                  snap.current = best * ROW;
                  vel.current = 0;
                }}>
                <span className="readout">{t.tag}</span>
                <strong>{t.title}</strong>
                <span className="cy-desc">{t.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="cy-controls">
        <button onClick={() => go(-1)} aria-label={labels.prev}><ChevronLeft size={18} /></button>
        <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? labels.pause : labels.play} className="cy-play">
          {playing ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <button onClick={() => go(1)} aria-label={labels.next}><ChevronRight size={18} /></button>
        <button className="cy-open" onClick={openActive}>{active.cta}</button>
      </div>
    </div>
  );
};

const CyberHero = () => {
  const { t, locale } = useLocale();
  const hero = t.hero;
  const contact = t.contact;
  const rootRef = useRef(null);
  const slotRef = useRef(null);
  const titleARef = useRef(null);
  const titleBRef = useRef(null);
  const [copied, setCopied] = useState(false);
  // 3D sob demanda: só monta o palco após a intro (preloader) liberar a hero.
  const [stageOn, setStageOn] = useState(false);
  // Palco 3D desistiu (sem WebGL / sem card / erro): remove o palco e volta ao
  // layout normal com o card no fluxo — nunca deixa caixa vazia na hero.
  const [stageOff, setStageOff] = useState(false);
  const reduced = prefersReducedMotion();

  // Liga o palco 3D após o preloader (ou de imediato se já passou / sem animação).
  // Sem setState síncrono no efeito: agenda via rAF/timeout para não encadear renders.
  // Aparelho fraco não bloqueia: o palco monta com qualidade reduzida (sem sombras,
  // pixel ratio menor); só movimento reduzido desliga o 3D de vez.
  // Watchdog de 3s: se o chunk lazy travar (rede), desliga o mb-mode para o card
  // voltar ao fluxo em vez de ficar escondido no slot vazio.
  useEffect(() => {
    if (reduced) return;
    let alive = true;
    const on = () => { if (alive) setStageOn(true); };
    try {
      if (sessionStorage.getItem('frs-preloaded')) {
        const id = requestAnimationFrame(on);
        return () => { alive = false; cancelAnimationFrame(id); };
      }
    } catch { /* noop */ }
    window.addEventListener('frs:ready', on, { once: true });
    const t = setTimeout(on, 6000);
    return () => { alive = false; window.removeEventListener('frs:ready', on); clearTimeout(t); };
  }, [reduced]);

  // Watchdog do palco: se o stage montou mas falhou sem avisar (ex: componente null
  // por chunk quebrado), o mb-mode esconderia o card — desliga e restaura o fluxo.
  useEffect(() => {
    if (!stageOn || stageOff) return;
    const id = setTimeout(() => {
      const cardInScreen = document.querySelector('.mb-css3d .cy-card');
      if (!cardInScreen) setStageOff(true);
    }, 4000);
    return () => clearTimeout(id);
  }, [stageOn, stageOff]);

  // SplitText oficial: "Interfaces que / parecem vivas." com máscara + stagger de chars.
  // Sub/nome sem fatiar: fade/y sutil na mesma timeline (hierarquia preservada).
  // À prova de falha: watchdog de 3.5s garante o texto visível mesmo se GSAP/SplitText
  // travar (CDN, exceção silenciosa, StrictMode double-effect); 'play' sem a classe
  // .play também revela via CSS. Troca de idioma reconstrói o split do zero.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !titleARef.current || !titleBRef.current) return;
    root.classList.add('play');
    if (!canAnimate()) return;
    const gsap = ensureGsap();
    const SplitText = ensureSplitText();
    let splitA = null;
    let splitB = null;
    let onReady = null;
    let done = false;
    // Watchdog: se a intro não concluir em 3.5s, força estado final visível.
    const watchdog = setTimeout(() => {
      if (done) return;
      done = true;
      try {
        gsap.set(['.cy-eyebrow', '.cy-sub', '.cy-ctas', '.cy-proof'], { opacity: 1, y: 0, clearProps: 'transform' });
        if (splitA) gsap.set(splitA.chars, { yPercent: 0, opacity: 1, clearProps: 'transform' });
        if (splitB) gsap.set(splitB.chars, { yPercent: 0, opacity: 1, clearProps: 'transform' });
      } catch { /* noop */ }
    }, 3500);
    const ctx = gsap.context(() => {
      gsap.set(['.cy-eyebrow', '.cy-sub', '.cy-ctas', '.cy-proof'], { opacity: 0, y: 22 });
      try {
        splitA = new SplitText(titleARef.current, { type: 'chars,words,lines', linesClass: 'st-line', charsClass: 'st-char', wordsClass: 'st-word', mask: 'lines' });
        splitB = new SplitText(titleBRef.current, { type: 'chars,words,lines', linesClass: 'st-line', charsClass: 'st-char', wordsClass: 'st-word', mask: 'lines' });
      } catch {
        done = true;
        clearTimeout(watchdog);
        gsap.set(['.cy-eyebrow', '.cy-sub', '.cy-ctas', '.cy-proof'], { opacity: 1, y: 0 });
        return;
      }
      gsap.set([splitA.chars, splitB.chars].flat(), { yPercent: 115, opacity: 0 });
      const play = () => {
        if (done) return;
        done = true;
        clearTimeout(watchdog);
        const tl = gsap.timeline({ defaults: { ease: EASE.out } });
        tl.to('.cy-eyebrow', { opacity: 1, y: 0, duration: 0.45 }, 0)
          .to(splitA.chars, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.018 }, 0.06)
          .to(splitB.chars, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.018 }, 0.22)
          .to('.cy-sub', { opacity: 1, y: 0, duration: 0.55 }, 0.55)
          .to('.cy-ctas', { opacity: 1, y: 0, duration: 0.55 }, 0.65)
          .to('.cy-proof', { opacity: 1, y: 0, duration: 0.45 }, 0.75);
        refreshScroll();
      };
      let played = false;
      const once = () => { if (!played) { played = true; play(); } };
      onReady = once;
      try {
        if (sessionStorage.getItem('frs-preloaded')) once();
        else window.addEventListener('frs:ready', once, { once: true });
      } catch { once(); }
      // Rede de segurança: se o preloader travar sem disparar, toca sozinho em 2.5s.
      setTimeout(once, 2500);
    }, root);
    return () => {
      clearTimeout(watchdog);
      if (onReady) window.removeEventListener('frs:ready', onReady);
      ctx.revert();
      try { splitA?.revert(); } catch { /* noop */ }
      try { splitB?.revert(); } catch { /* noop */ }
    };
  }, [locale]);

  const copyEmail = async () => {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    };
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(contact.email);
        done();
        return;
      }
      throw new Error('no-clipboard');
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = contact.email;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      } catch { /* mantém "Copiar e-mail" sem travar */ }
    }
  };

  return (
    <section id="showreel" className={`cy-hero${stageOn && !reduced && !stageOff ? ' mb-mode' : ''}`} ref={rootRef} aria-label={hero.sectionLabel}>
      {/* Fundo: vídeo leve (mobile/desktop) — os 300 frames com pin de 5000px foram removidos. */}
      <Showreel />
      <div className="cy-matrix" aria-hidden="true"><span className="cy-fade" /></div>
      <div className="wrap cy-grid">
        <div className="cy-card-slot" ref={slotRef}>
          <MomentumCard tracks={hero.tracks} labels={hero} />
        </div>
        <div className="cy-copy">
          <p className="readout cy-eyebrow"><span className="cy-pulse" />{hero.eyebrow}</p>
          <h1 className="cy-title" key={locale} aria-label={`${hero.headlineA} ${hero.headlineB}`}>
            <span className="cy-mask" aria-hidden="true"><span ref={titleARef} className="st-split">{hero.headlineA}</span></span>
            <span className="cy-mask" aria-hidden="true"><span ref={titleBRef} className="st-split cy-accent">{hero.headlineB}</span></span>
          </h1>
          <p className="cy-sub"><strong>{hero.name}.</strong> {hero.sub}</p>
          <div className="cy-ctas">
            <Magnetic strength={0.05}>
              <button className="btn btn-primary shine" onClick={() => scrollToId('projects')}>
                <AnimatedIcon name="rocket" size={18} fallback={<ArrowDown size={17} aria-hidden="true" />} /> {hero.projectsBtn}
              </button>
            </Magnetic>
            <Magnetic strength={0.05}>
              <button className="btn btn-ghost" onClick={copyEmail}>
                <AnimatedIcon name="copy" size={18} fallback={copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />} />
                {copied ? hero.copiedBtn : hero.copyBtn}
              </button>
            </Magnetic>
          </div>
          <ul className="cy-proof" aria-label={hero.proofLabel}>
            {hero.proof.map((item) => (
              <li key={item.k}><strong className="mono">{item.k}</strong><span>{item.v}</span></li>
            ))}
          </ul>
        </div>
      </div>
      {/* Palco 3D: notebook procedural com o card real na tela (carregado sob demanda).
          Se o palco desistir (onFallback), sai de cena e o card volta ao fluxo. */}
      {stageOn && !reduced && !stageOff && (
        <div className="wrap mb-wrap">
          <Suspense fallback={<div className="mb-stage mb-loading" aria-hidden="true" />}>
            <MacbookStage cardSlotRef={slotRef} onFallback={() => setStageOff(true)} />
          </Suspense>
        </div>
      )}
    </section>
  );
};

export default CyberHero;
