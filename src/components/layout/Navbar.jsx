import { useEffect, useRef, useState } from 'react';
import { Menu, X, ArrowUpRight, Home, User, Cpu, Layers, Send } from 'lucide-react';
import { navItems } from '../../data/content';
import { scrollToId } from '../../lib/js/dom';
import { onScrollRaf } from '../../lib/js/perf';
import { canAnimate, ensureGsap, EASE } from '../../lib/js/motion';
import { AnimatedIcon } from '../ui/AnimatedIcon';
import './Navbar.css';

// Para cada seção, qual animação Lottie tentar + qual ícone lucide usar se ela falhar
const NAV_ICONS = {
  showreel: { lottie: 'home', Fallback: Home },
  about: { lottie: 'user', Fallback: User },
  skills: { lottie: 'cpu', Fallback: Cpu },
  projects: { lottie: 'layers', Fallback: Layers },
  contact: { lottie: 'send', Fallback: Send },
};

// Botão individual da navbar desktop: ícone + rótulo + barrinha. O ícone/barra aparecem no hover
// (com bounce) e ficam fixos quando é a seção ativa. Tudo com guards de touch/movimento reduzido.
const NavButton = ({ item, active, onGo }) => {
  const btnRef = useRef(null);
  const icon = NAV_ICONS[item.id] || NAV_ICONS.showreel;
  const IconFallback = icon.Fallback;

  // Hover/foco: ícone pula para dentro com bounce + barrinha cresce da esquerda
  const animateIn = () => {
    if (!canAnimate() || !btnRef.current) return;
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const gsap = ensureGsap();
    const btn = btnRef.current;
    const ico = btn.querySelector('.nav-ico');
    const bar = btn.querySelector('.nav-bar');
    if (!ico || !bar) return;
    const tl = gsap.timeline({ overwrite: 'auto', defaults: { ease: 'expo.out' } });
    tl.to(ico, { scale: 1, rotate: 0, x: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, 0);
    tl.to(bar, { scaleX: 1, duration: 0.4 }, 0);
  };
  // Saída do hover: esconde ícone/barra, EXCETO se for o botão ativo (ele mantém o estado aceso)
  const animateOut = () => {
    if (!canAnimate() || !btnRef.current) return;
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const btn = btnRef.current;
    if (btn.classList.contains('active')) return;
    const gsap = ensureGsap();
    const ico = btn.querySelector('.nav-ico');
    const bar = btn.querySelector('.nav-bar');
    if (!ico || !bar) return;
    const tl = gsap.timeline({ overwrite: 'auto', defaults: { ease: 'power2.inOut' } });
    tl.to(ico, { scale: 0, rotate: 24, x: -6, opacity: 0, duration: 0.28 }, 0);
    tl.to(bar, { scaleX: 0, duration: 0.28 }, 0);
  };

  // Quando o scrollspy troca a seção ativa, sincroniza o estado visual do botão correspondente
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn || !canAnimate()) return;
    const ico = btn.querySelector('.nav-ico');
    const bar = btn.querySelector('.nav-bar');
    if (!ico || !bar) return;
    const gsap = ensureGsap();
    gsap.to(ico, { scale: active ? 1 : 0, rotate: active ? 0 : 24, x: active ? 0 : -6, opacity: active ? 1 : 0, duration: 0.35, ease: 'expo.out', overwrite: 'auto' });
    gsap.to(bar, { scaleX: active ? 1 : 0, duration: 0.35, ease: 'expo.out', overwrite: 'auto' });
  }, [active]);

  return (
    <button
      ref={btnRef}
      onClick={() => onGo(item.id)}
      onMouseEnter={animateIn}
      onMouseLeave={animateOut}
      onFocus={animateIn}
      onBlur={animateOut}
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
  }, []);

  // Menu mobile aberto = página travada (evita rolar o fundo por trás do painel)
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
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

  // Entrada em cascata dos itens do menu mobile (só desktop-pequeno/tablet, com animação permitida)
  useEffect(() => {
    if (!open || !canAnimate() || window.innerWidth < 768) return;
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
        <button className="brand" onClick={() => go('showreel')} aria-label="Voltar ao início">
          <span className="brand-mark">F</span>
          <span className="brand-text">Felipe Romao <em>©2026</em></span>
        </button>
        {/* Links desktop em pílula */}
        <nav className="nav-links nav-v2" aria-label="Navegação principal">
          {navItems.map((item) => (
            <NavButton key={item.id} item={item} active={active === item.id} onGo={go} />
          ))}
        </nav>
        {/* CTA com brilho varrendo (classe shine) */}
        <div className="nav-cta">
          <button className="btn btn-primary nav-btn shine" onClick={() => go('contact')}>
            <AnimatedIcon name="send" size={18} playOn="hover" fallback={<ArrowUpRight size={18} aria-hidden="true" />} />
            Vamos construir
          </button>
        </div>
        {/* Hambúrguer (só aparece no mobile via CSS) */}
        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {/* Painel mobile: links numerados + CTA de contratação */}
      <div className={`mobile-panel ${open ? 'open' : ''}`}>
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
        <button className="btn btn-primary" onClick={() => go('contact')}>Contratar para um projeto <ArrowUpRight size={17} /></button>
      </div>
    </header>
  );
};

export default Navbar;
