import { useEffect, useRef } from 'react';
import { canAnimate, ensureGsap, EASE, DUR } from '../../lib/js/motion';

// Atrasos nomeados para montar cascatas (d1 = chega primeiro, d6 = por último)
const DELAY_MAP = { d1: 0.08, d2: 0.16, d3: 0.26, d4: 0.38, d5: 0.5, d6: 0.62 };
// Estado inicial de cada estilo de entrada
const FROM = {
  fade: { opacity: 0, y: 34 }, // sobe apagado
  blur: { opacity: 0, y: 18, filter: 'blur(14px)' }, // sobe desfocado e foca
  scale: { opacity: 0, y: 16, scale: 0.94 }, // cresce de 94%
  clip: { opacity: 0, y: 24, clipPath: 'inset(0 0 100% 0)' }, // abre como cortina
  left: { opacity: 0, x: -44 }, // entra da esquerda
  right: { opacity: 0, x: 44 }, // entra da direita
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
      // Anima até o estado final quando o topo do bloco chega a 88% da tela; reverte ao sair
      gsap.fromTo(el, FROM[variant] || FROM.fade, {
        opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0 0 0% 0)',
        duration: variant === 'clip' ? DUR.slow : DUR.med,
        delay: ms, ease: EASE.out, overwrite: 'auto', clearProps: 'transform,filter,clipPath',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          end: 'bottom 12%',
          toggleActions: 'play none none reverse',
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
