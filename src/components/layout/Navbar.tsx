import { useEffect, useRef, useState } from 'react';
import { Menu, X, ArrowUpRight, Home, User, Cpu, Layers, Send } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleContext';
import { scrollToId } from '../../lib/js/dom';
import { onScrollRaf } from '../../lib/js/perf';
import { canAnimate, ensureGsap, EASE } from '../../lib/js/motion';
import { AnimatedIcon } from '../ui/AnimatedIcon';
import LanguageToggle from '../ui/LanguageToggle';
import './Navbar.css';

// Para cada seção, qual animação Lottie tentar + qual ícone lucide usar se ela falhar.
// `lottie: null` usa só o fallback sem disparar fetch 404 (ex: showreel não tem home.json).
const NAV_ICONS = {
  showreel: { lottie: null, Fallback: Home },
  about: { lottie: 'user', Fallback: User },
  skills: { lottie: 'cpu', Fallback: Cpu },
  projects: { lottie: 'layers', Fallback: Layers },
  contact: { lottie: 'send', Fallback: Send },
};

// Botão individual da navbar desktop: ícone + rótulo + barrinha. Hover/ativo 100% via CSS
// (sem GSAP/inline styles) para nunca travar com mouse rápido. Tudo com guards de touch/movimento reduzido via CSS.
const NavButton = ({ item, active, onGo }) => {
  const icon = NAV_ICONS[item.id] || NAV_ICONS.showreel;
  const IconFallback = icon.Fallback;

  return (
    <button
      onClick={() => onGo(item.id)}
      className={active ? 'active' : ''}
      aria-current={active ? 'true' : undefined}
    >
      <span className="nav-ico" aria-hidden="true">
        <AnimatedIcon name={icon.lottie} size={19} playOn="always" fallback={<IconFallback size={18} aria-hidden="true" />} />
      </span>
      <span className="nav-label">{item.label}</span>
      <span className="nav-bar" aria-hidden="true" />
    </button>
  );
};

// Navbar fixa: marca + links desktop + CTA + menu mobile. Comportamentos:
// - scrollspy (IntersectionObserver marca a seção visível), esconde ao rolar para baixo e
//   mostra blur de fundo após 24px; trava o scroll do body com o menu mobile aberto.
const Navbar = () => {
  const { t } = useLocale();
  const navItems = t.nav.items;
  const [active, setActive] = useState('showreel');
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);

  // Scrollspy: observa as 5 seções e marca como ativa a que cruza a faixa central da tela
  useEffect(() => {
    const sections = navItems.map((i) => document.getElementById(i.id)).filter(Boolean);
    let current = 'showreel';
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            current = e.target.id;
            setActive((prev) => (prev === current ? prev : current));
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [navItems]);

  // Menu mobile aberto = página travada (evita rolar o fundo por trás do painel).
  // Guarda a posição para restaurar exatamente onde o usuário estava (iOS costuma
  // perder o scrollY ao alternar overflow:hidden no body).
  useEffect(() => {
    if (open) {
      const y = window.scrollY;
      document.body.style.top = `-${y}px`;
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, y);
      };
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Efeitos de scroll da barra: blur após 24px + auto-hide descendo além de 140px (sobe e ela volta)
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let lastY = window.scrollY;
    header.classList.toggle('scrolled', lastY > 24);
    return onScrollRaf((y) => {
      header.classList.toggle('scrolled', y > 24);
      header.classList.toggle('hidden', y > lastY && y > 140 && !open);
      lastY = y;
    });
  }, [open]);

  // Entrada em cascata dos itens do menu mobile (com animação permitida).
  // Sem guarda de largura: o painel só existe no mobile via CSS (≤900px), então
  // o filtro antigo (só animava com width ≥768) deixava os celulares sem cascata.
  useEffect(() => {
    if (!open || !canAnimate()) return;
    const ctx = ensureGsap().context(() => {
      ensureGsap().fromTo('.mobile-panel button', { opacity: 0, x: -28 }, { opacity: 1, x: 0, duration: 0.5, ease: EASE.out, stagger: 0.07, delay: 0.1, clearProps: 'transform,opacity' });
    });
    return () => ctx.revert();
  }, [open ]);

  // Vai à seção: fecha o mobile primeiro e rola no próximo frame (evita conflito com o unlock do scroll)
  const go = (id) => {
    setOpen(false);
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <header ref={headerRef} className="nav">
      <div className="wrap nav-inner">
        {/* Marca: monograma F + nome, volta ao início */}
        <button className="brand" onClick={() => go('showreel')} aria-label={t.nav.brandLabel}>
          <span className="brand-mark">F</span>
          <span className="brand-text">Felipe Romao <em>©2026</em></span>
        </button>
        {/* Links desktop em pílula */}
        <nav className="nav-links nav-v2" aria-label={t.nav.mainLabel}>
          {navItems.map((item) => (
            <NavButton key={item.id} item={item} active={active === item.id} onGo={go} />
          ))}
        </nav>
        {/* CTA com brilho varrendo (classe shine) */}
        <div className="nav-cta">
          <LanguageToggle />
          <button className="btn btn-primary nav-btn shine" onClick={() => go('contact')}>
            <AnimatedIcon name="send" size={18} playOn="hover" fallback={<ArrowUpRight size={18} aria-hidden="true" />} />
            {t.nav.cta}
          </button>
        </div>
        {/* Hambúrguer (só aparece no mobile via CSS) */}
        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label={open ? t.nav.closeMenu : t.nav.openMenu} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {/* Painel mobile: toggle de idioma + links numerados + CTA de contratação.
          Abertura por grid-rows 0fr->1fr (só composite, sem reflow de layout
          como o max-height fixo anterior; altura automática p/ PT/EN) +
          fade/deslize do conteúdo. O .mobile-panel-inner é o filho único
          exigido pela técnica. */}
      <div className={`mobile-panel ${open ? 'open' : ''}`}>
        <div className="mobile-panel-inner">
        <div className="mobile-lang">
          <LanguageToggle />
        </div>
        {navItems.map((item, i) => {
          const icon = NAV_ICONS[item.id] || NAV_ICONS.showreel;
          const IconFallback = icon.Fallback;
          return (
            <button key={item.id} onClick={() => go(item.id)} className={active === item.id ? 'active' : ''}>
              <span className="mono">0{i + 1}</span>
              <AnimatedIcon name={icon.lottie} size={20} playOn="always" fallback={<IconFallback size={19} aria-hidden="true" />} />
              {item.label}
            </button>
          );
        })}
        <button className="btn btn-primary" onClick={() => go('contact')}>{t.nav.mobileCta} <ArrowUpRight size={17} /></button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
