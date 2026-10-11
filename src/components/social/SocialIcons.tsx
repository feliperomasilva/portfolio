import { useEffect } from 'react';
import { MessageCircle, FileText } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleContext';
import HoverLinks from './HoverLinks';
import '../styles/social.css';

// Rail social fixa (desktop): ícones com follows magnético do mouse + botão
// vertical de CV (abre o PDF do currículo em nova aba + download).
// Links vêm do i18n (contact.links: github/linkedin/whatsapp).
// CV embutido em public/Felipe_Romao_CV.pdf (cópia do original em Downloads).
// SVGs de marca inline (o lucide novo removeu os brand icons); WhatsApp/CV via lucide.
const CV_HREF = '/Felipe_Romao_CV.pdf';
const iconFor = (name: string) => {
  if (name === 'github')
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    );
  if (name === 'linkedin')
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  if (name === 'whatsapp') return <MessageCircle size={24} aria-hidden="true" />;
  return <FileText size={24} aria-hidden="true" />;
};

const SocialIcons = () => {
  const { t } = useLocale();
  const links = (t.contact?.links as Array<{ label: string; url: string; icon: string }>) || [];

  // Rail some com fade enquanto a hero (#showreel) está visível: evita ficar
  // por cima dos CTAs/texto (classe .in-hero no wrapper, via CSS em social.css).
  useEffect(() => {
    const wrap = document.querySelector('.icons-section');
    const hero = document.getElementById('showreel');
    if (!wrap || !hero || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      ([e]) => wrap.classList.toggle('in-hero', e.isIntersecting),
      { threshold: 0.08 },
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  // Follow magnético dos ícones: UM rAF compartilhado sob demanda (não um por
  // ícone rodando para sempre). Só trabalha ~300ms após o último mousemove
  // (idle-check por frame com deadline); parado = zero custo. O rect de cada
  // item é cacheado e recalculado no máximo 1x/s (era getBoundingClientRect
  // por mousemove + style por frame = layout thrash contínuo).
  useEffect(() => {
    const social = document.getElementById('frs-social');
    if (!social) return;
    if (window.matchMedia('(hover: none)').matches) return;
    const items = Array.from(social.querySelectorAll('span'));
    const links = items
      .map((elem) => {
        const el = elem as HTMLElement;
        const link = el.querySelector('a') as HTMLElement | null;
        return link ? { el, link } : null;
      })
      .filter(Boolean) as Array<{ el: HTMLElement; link: HTMLElement }>;
    if (!links.length) return;
    const state = links.map(() => ({ mx: 0, my: 0, cx: 0, cy: 0, rect: null as DOMRect | null, stamp: 0 }));
    const center = (i: number) => {
      const s = state[i];
      const now = performance.now();
      if (!s.rect || now - s.stamp > 1000) {
        s.rect = links[i].el.getBoundingClientRect();
        s.stamp = now;
        // Alvo inicial = centro (evita pulo no 1º frame)
        s.mx = s.rect.width / 2;
        s.my = s.rect.height / 2;
        s.cx = s.mx;
        s.cy = s.my;
      }
      return s.rect;
    };
    let raf = 0;
    let lastMove = 0;
    const tick = () => {
      raf = 0;
      let settled = true;
      links.forEach(({ link }, i) => {
        const s = state[i];
        s.cx += (s.mx - s.cx) * 0.2;
        s.cy += (s.my - s.cy) * 0.2;
        if (Math.abs(s.mx - s.cx) > 0.5 || Math.abs(s.my - s.cy) > 0.5) settled = false;
        link.style.setProperty('--siLeft', `${s.cx.toFixed(1)}px`);
        link.style.setProperty('--siTop', `${s.cy.toFixed(1)}px`);
      });
      // Continua só se ainda há movimento ou o mouse mexeu há <300ms
      if (!settled || performance.now() - lastMove < 300) {
        raf = requestAnimationFrame(tick);
      } else {
        links.forEach(({ link }) => link.classList.remove('si-live'));
      }
    };
    const kick = () => {
      if (!raf) {
        links.forEach(({ link }) => link.classList.add('si-live'));
        raf = requestAnimationFrame(tick);
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      lastMove = performance.now();
      links.forEach(({ el }, i) => {
        const r = center(i);
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const s = state[i];
        if (x >= 0 && x <= 60 && y >= 0 && y <= 60) {
          s.mx = x;
          s.my = y;
        } else {
          s.mx = r.width / 2;
          s.my = r.height / 2;
        }
      });
      kick();
    };
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="icons-section frs-social" aria-label="Social">
      <div className="social-icons" data-cursor="icons" id="frs-social">
        {links.map((l) => (
          <span key={l.label}>
            <a href={l.url} target="_blank" rel="noopener noreferrer" aria-label={l.label}>
              {iconFor(l.icon)}
            </a>
          </span>
        ))}
      </div>
      <a className="resume-button" href={CV_HREF} target="_blank" rel="noopener noreferrer" download="Felipe_Romao_CV.pdf" aria-label="Abrir currículo em PDF" data-cursor="disable">
        <HoverLinks text="CV" cursor />
        <span>
          <FileText size={20} aria-hidden="true" />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
