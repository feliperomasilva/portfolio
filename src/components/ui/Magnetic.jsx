import { useEffect, useRef } from 'react';
import { canAnimate } from '../../lib/js/motion';

// Wrapper de efeito magnético bem sutil: segue o cursor com atraso suave (lerp) e volta devagar.
// Props: strength (força, padrão 0.05 = quase imperceptível), as (tag renderizada) + resto repassado.
// Limites de segurança: deslocamento máx ±5px, inativo no touch e com movimento reduzido.
export const Magnetic = ({ children, strength = 0.05, className = '', as: Tag = 'div', ...rest }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !canAnimate() || window.matchMedia('(hover: none)').matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    // Interpola a posição atual até o alvo: tira o aspecto "grudento" e deixa o movimento amortecido
    const tick = () => {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      if (Math.abs(tx - cx) < 0.05) cx = tx;
      if (Math.abs(ty - cy) < 0.05) cy = ty;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      if (cx !== tx || cy !== ty) raf = requestAnimationFrame(tick);
      else raf = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    // A cada movimento, calcula o vetor do centro ao cursor e move uma fração pequena dele
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      // Fora da área do elemento: ignora (não "puxa" de longe)
      const dist = Math.hypot(x, y);
      const max = Math.max(r.width, r.height);
      if (dist > max) return;
      const k = Math.min(strength, 0.07);
      tx = Math.max(-5, Math.min(5, x * k));
      ty = Math.max(-5, Math.min(5, y * k));
      kick();
    };
    // Ao sair, retorna ao centro com o mesmo amortecimento (sem salto)
    const leave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); cancelAnimationFrame(raf); };
  }, [strength]);
  return <Tag ref={ref} className={`magnetic ${className}`} {...rest}>{children}</Tag>;
};

export default Magnetic;
