import { useEffect, useRef } from 'react';
import { canAnimate, ensureGsap, EASE, DUR } from '../../lib/js/motion';

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

// Wrapper de reveal por scroll: envolve qualquer bloco e o anima quando ele entra na tela.
// Props: variant (estilo acima), delay (nº ou chave d1-d6), as (tag) + resto repassado.
export const Reveal = ({ variant = 'fade', delay = 0, className = '', as: Tag = 'div', children, ...rest }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Sem animação: mostra direto
    if (!canAnimate()) {
      el.style.opacity = '1';
      return;
    }
    const gsap = ensureGsap();
    const ms = typeof delay === 'number' ? delay : (DELAY_MAP[delay] || 0);
    const ctx = gsap.context(() => {
      // Anima até o estado final quando o topo do bloco chega a 88% da tela; reverte ao sair.
      // once:false + reverse mantém continuidade no scroll rápido sem replays bruscos.
      gsap.fromTo(el, FROM[variant] || FROM.fade, {
        opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0 0 0% 0)',
        duration: variant === 'clip' ? DUR.slow : DUR.med,
        delay: ms, ease: EASE.out, overwrite: 'auto', clearProps: 'transform,filter,clipPath',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          end: 'bottom 12%',
          toggleActions: 'play none none reverse',
          once: false,
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
