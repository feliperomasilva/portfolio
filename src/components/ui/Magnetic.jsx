import { useEffect, useRef } from 'react';
import { canAnimate } from '../../lib/js/motion';

// Wrapper de efeito magnético sutil: o elemento inclina levemente em direção ao cursor e volta com easing.
// Props: strength (força, padrão 0.12 = bem leve), as (tag renderizada) + resto repassado ao elemento.
// Limites de segurança: deslocamento máx ±8px, inativo no touch e com movimento reduzido.
export const Magnetic = ({ children, strength = 0.12, className = '', as: Tag = 'div', ...rest }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !canAnimate() || window.matchMedia('(hover: none)').matches) return;
    let raf = 0;
    // A cada movimento, calcula o vetor do centro ao cursor e move uma fração dele
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      // Fora da área do elemento: ignora (não "puxa" de longe)
      const dist = Math.hypot(x, y);
      const max = Math.max(r.width, r.height);
      if (dist > max) return;
      const k = Math.min(strength, 0.14);
      const cx = Math.max(-8, Math.min(8, x * k));
      const cy = Math.max(-8, Math.min(8, y * k));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      });
    };
    // Ao sair, retorna ao centro com transição suave e limpa o estilo inline depois
    const leave = () => {
      cancelAnimationFrame(raf);
      el.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
      el.style.transform = 'translate3d(0,0,0)';
      setTimeout(() => { if (el.isConnected) el.style.transition = ''; }, 600);
    };
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); cancelAnimationFrame(raf); };
  }, [strength]);
  return <Tag ref={ref} className={`magnetic ${className}`} {...rest}>{children}</Tag>;
};

export default Magnetic;
