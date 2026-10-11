import { useEffect, useRef } from 'react';
import { canAnimate, ensureGsap, refreshScroll, EASE, DUR } from '../../lib/js/motion';

// Atrasos nomeados para montar cascatas (d1 = chega primeiro, d6 = por último) — 60-500ms p/ stagger premium sem arrastar
const DELAY_MAP = { d1: 0.06, d2: 0.12, d3: 0.2, d4: 0.3, d5: 0.4, d6: 0.5 };
// Estado inicial de cada estilo de entrada — deslocamentos curtos (18–34px) p/ feel premium snappy
const FROM = {
  fade: { opacity: 0, y: 26 }, // sobe apagado
  blur: { opacity: 0, y: 14, filter: 'blur(12px)' }, // sobe desfocado e foca
  scale: { opacity: 0, y: 12, scale: 0.96 }, // cresce de 96%
  clip: { opacity: 0, y: 18, clipPath: 'inset(0 0 100% 0)' }, // abre como cortina
  left: { opacity: 0, x: -32 }, // entra da esquerda
  right: { opacity: 0, x: 32 }, // entra da direita
};

// Recalibra os triggers UMA vez por sessão (não por instância — há ~20 Reveals):
// os triggers nascem com o body travado pelo preloader (overflow hidden) e com
// fontes/imagens ainda carregando, então as posições medidas no mount ficam
// erradas e os reveals disparavam na hora errada (ou nunca). O refresh no
// frs:ready + load + troca de idioma (PT/EN muda a altura das seções) corrige.
let refreshHooked = false;
const hookRefreshOnce = () => {
  if (refreshHooked || typeof window === 'undefined') return;
  refreshHooked = true;
  const onLoad = () => refreshScroll();
  let localeT = 0;
  const onLocale = () => { clearTimeout(localeT); localeT = setTimeout(() => refreshScroll(), 120); };
  window.addEventListener('load', onLoad);
  window.addEventListener('frs:ready', onLoad);
  window.addEventListener('frs:locale', onLocale);
};

// Wrapper de reveal por scroll: envolve qualquer bloco e o anima UMA vez quando
// ele entra na tela rolando para baixo (start 'top 88%'). once:true + sem
// reverse: depois de revelado fica visível (voltar para cima não esconde nem
// re-dispara — era o toggleActions com reverse que fazia o texto sumir/repetir).
export const Reveal = ({ variant = 'fade', delay = 0, className = '', as: Tag = 'div', children, ...rest }: any) => {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Sem animação: mostra direto
    if (!canAnimate()) {
      el.style.opacity = '1';
      return;
    }
    hookRefreshOnce();
    const gsap = ensureGsap();
    const ms = typeof delay === 'number' ? delay : (DELAY_MAP[delay] || 0);
    const ctx = gsap.context(() => {
      gsap.fromTo(el, FROM[variant] || FROM.fade, {
        opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0 0 0% 0)',
        duration: variant === 'clip' ? DUR.slow : DUR.med,
        delay: ms, ease: EASE.out, overwrite: 'auto', clearProps: 'transform,filter,clipPath',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
          toggleActions: 'play none none none',
        },
      });
    });
    return () => ctx.revert();
  }, [variant, delay]);

  // Começa invisível (o JS revela); o CSS garante visibilidade se o JS falhar com reduced-motion
  return (
    <Tag ref={ref} className={`rv-g ${className}`} style={{ opacity: 0 }} {...rest}>
      {children}
    </Tag>
  );
};
