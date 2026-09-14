import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowDown, Copy, Check, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { heroContent, contactContent } from '../../data/content';
import { scrollToId } from '../../lib/js/dom';
import { canAnimate, ensureGsap, EASE } from '../../lib/js/motion';
import { Magnetic } from '../ui/Magnetic';
import { AnimatedIcon } from '../ui/AnimatedIcon';
import Showreel from './Showreel';
import './CyberHero.css';

const SplitWords = ({ text, className = '' }) => (
  <span className={`split-words ${className}`} aria-label={text}>
    {String(text)
      .split(' ')
      .map((w, i) => (
        <span key={i} className="w-word" aria-hidden="true">
          <span className="w-inner">{w}</span>
        </span>
      ))}
  </span>
);

const TRACKS = [
  { id: 'agrotec', tag: 'CASE · NO AR', title: 'Agrotec', desc: 'Site informativo com ChatBot (IA).', cta: 'Abrir projeto', href: 'https://projetoagrotec.vercel.app/' },
  { id: 'frontend', tag: 'STACK · CSS', title: 'Frontend + Backend', desc: 'React, HTML, Python e Java Script.', cta: 'Ver habilidades', href: '#skills' },
  { id: 'contato', tag: 'CONTATO · DIRETO', title: 'Vamos conversar?', desc: 'Contato direto por e-mail.', cta: 'Iniciar projeto', href: null },
];

const ROW = 148;
const LOOP_TRACKS = [...TRACKS, ...TRACKS, ...TRACKS];
const BASE = TRACKS.length * ROW;

const MomentumCard = () => {
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
    const id = setInterval(() => go(1), 4200);
    return () => clearInterval(id);
  }, [playing, go]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const total = TRACKS.length * ROW;
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
        if (vel.current === 0) offset.current = wrap(offset.current);
        else offset.current = wrap(offset.current);
      }
      const rows = el.querySelectorAll('.cy-track');
      const center = offset.current / ROW;
      rows.forEach((r, i) => {
        let d = i - center;
        const span = LOOP_TRACKS.length;
        if (d > span / 2) d -= span;
        if (d < -span / 2) d += span;
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
      const nearest = ((Math.round(center) % TRACKS.length) + TRACKS.length) % TRACKS.length;
      setIndex((p) => (p === nearest ? p : nearest));
    };
    raf = requestAnimationFrame(render);
    const down = (e) => {
      dragging.current = true;
      snap.current = null;
      vel.current = 0;
      lastY.current = e.touches ? e.touches[0].clientY : e.clientY;
      lastT.current = performance.now();
    };
    const move = (e) => {
      if (!dragging.current) return;
      if (e.cancelable && e.touches) e.preventDefault();
      const y = e.touches ? e.touches[0].clientY : e.clientY;
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
    el.addEventListener('touchstart', down, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', up);
    const obs = new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0 });
    obs.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      el.removeEventListener('touchstart', down);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', up);
    };
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !canAnimate()) return;
    if (window.matchMedia('(hover: none)').matches) return;
    const gsap = ensureGsap();
    const rX = gsap.quickTo(card, 'rotationX', { duration: 0.7, ease: 'power3' });
    const rY = gsap.quickTo(card, 'rotationY', { duration: 0.7, ease: 'power3' });
    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      rX((((e.clientY - r.top) / r.height - 0.5) * -6).toFixed(2));
      rY((((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2));
    };
    const onLeave = () => { rX(0); rY(0); };
    card.style.transformPerspective = '1100px';
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    return () => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave); };
  }, []);

  const active = TRACKS[index];
  const openActive = () => {
    if (active.href === null) scrollToId('contact');
    else if (active.href.startsWith('#')) scrollToId(active.href.slice(1));
    else window.open(active.href, '_blank', 'noopener');
  };

  return (
    <div className="cy-card card" ref={cardRef}>
      <div className="cy-card-top">
        <span className="mono">~/felipe — live</span>
        <span className="cy-live"><i />ao vivo</span>
      </div>
      <div className="cy-list" ref={listRef} role="listbox" aria-label="Destaques navegáveis" tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); go(1); }
          if (e.key === 'ArrowUp') { e.preventDefault(); go(-1); }
          if (e.key === 'Enter') { e.preventDefault(); openActive(); }
        }}>
        <div className="cy-list-inner">
          {LOOP_TRACKS.map((t, i) => {
            const li = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
            return (
              <button key={`${t.id}-${i}`} role="option" aria-selected={li === index} tabIndex={-1}
                className={`cy-track ${li === index ? 'active' : ''}`} onClick={() => {
                  const cur = offset.current / ROW;
                  const span = LOOP_TRACKS.length;
                  let best = i;
                  let bestDist = Math.abs(i - cur);
                  [i - TRACKS.length, i + TRACKS.length].forEach((c) => {
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
        <button onClick={() => go(-1)} aria-label="Anterior"><ChevronLeft size={18} /></button>
        <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pausar' : 'Retomar'} className="cy-play">
          {playing ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <button onClick={() => go(1)} aria-label="Próximo"><ChevronRight size={18} /></button>
        <button className="cy-open" onClick={openActive}>{active.cta}</button>
      </div>
    </div>
  );
};

const CyberHero = () => {
  const rootRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!canAnimate()) { root.classList.add('play'); return; }
    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.set(['.cy-eyebrow', '.cy-sub', '.cy-ctas', '.cy-proof', '.cy-card'], { opacity: 0, y: 26 });
      gsap.set('.cy-hero .w-word', { opacity: 0.12 });
      gsap.set('.cy-hero .w-inner', { y: 26, opacity: 0 });
      const play = () => {
        const tl = gsap.timeline({ defaults: { ease: EASE.out } });
        tl.to('.cy-eyebrow', { opacity: 1, y: 0, duration: 0.5 })
          .to('.cy-hero .w-word', { opacity: 1, duration: 0.5 }, 0.08)
          .to('.cy-hero .w-inner', { y: 0, opacity: 1, duration: 0.9, stagger: 0.09 }, 0.08)
          .to('.cy-sub', { opacity: 1, y: 0, duration: 0.6 }, 0.5)
          .to('.cy-ctas', { opacity: 1, y: 0, duration: 0.6 }, 0.62)
          .to('.cy-proof', { opacity: 1, y: 0, duration: 0.5 }, 0.74)
          .to('.cy-card', { opacity: 1, y: 0, duration: 0.9 }, 0.6);
        root.classList.add('play');
      };
      if (sessionStorage.getItem('frs-preloaded')) play();
      else window.addEventListener('frs:ready', play, { once: true });
      gsap.to('.cy-hero .w-word', {
        y: -10,
        ease: 'none',
        stagger: 0.06,
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.8 },
      });
      gsap.to('.cy-copy', { yPercent: -4, opacity: 0.55, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.8 } });
      gsap.to('.cy-card', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.8 } });
    }, root);
    return () => ctx.revert();
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactContent.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };

  return (
    <section id="showreel" className="cy-hero" ref={rootRef} aria-label="Apresentação com showreel">
      <Showreel />
      <div className="cy-matrix" aria-hidden="true"><span className="cy-fade" /></div>
      <div className="wrap cy-grid">
        <MomentumCard />
        <div className="cy-copy">
          <p className="readout cy-eyebrow"><span className="cy-pulse" />{'// full-stack criativo — React · Motion · UI'}</p>
          <h1 className="cy-title">
            <span className="cy-mask"><SplitWords text={heroContent.headlineA} /></span>
            <span className="cy-mask"><SplitWords text={heroContent.headlineB} className="cy-accent" /></span>
          </h1>
          <p className="cy-sub"><strong>{heroContent.name}.</strong> {heroContent.sub}</p>
          <div className="cy-ctas">
            <Magnetic strength={0.12}>
              <button className="btn btn-primary shine" onClick={() => scrollToId('projects')}>
                <AnimatedIcon name="rocket" size={18} fallback={<ArrowDown size={17} aria-hidden="true" />} /> Ver projetos
              </button>
            </Magnetic>
            <Magnetic strength={0.12}>
              <button className="btn btn-ghost" onClick={copyEmail}>
                <AnimatedIcon name="copy" size={18} fallback={copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />} />
                {copied ? 'E-mail copiado' : 'Copiar e-mail'}
              </button>
            </Magnetic>
          </div>
          <ul className="cy-proof" aria-label="Prova rápida">
            {heroContent.proof.map((item) => (
              <li key={item.k}><strong className="mono">{item.k}</strong><span>{item.v}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CyberHero;
