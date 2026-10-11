import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../../lib/js/device';
import '../styles/cursor.css';

// Cursor customizado do Website: glow que segue o mouse + estados
// data-cursor ("icons" expande sobre o social, "disable" esconde).
// Só desktop: exige pointer fino + sem reduced-motion, senão retorna null.
// Segue o mouse via quickTo (0.12s): cada mousemove vira um tween curto com
// overwrite automático — sem loop rAF e sem lerp /6 (era isso que deixava o
// orbe lento). Parado = zero custo (sem rAF rodando).
const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [enabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      !prefersReducedMotion() &&
      window.innerWidth >= 1024,
  );

  useEffect(() => {
    if (!enabled) return;
    const cursor = cursorRef.current;
    if (!cursor) return;
    let hover = false;
    // quickTo: um tween reutilizável por eixo — o GSAP cancela o anterior
    // sozinho (overwrite) a cada mousemove, sem encadear tweens.
    const setX = gsap.quickTo(cursor, 'x', { duration: 0.12, ease: 'power2.out' });
    const setY = gsap.quickTo(cursor, 'y', { duration: 0.12, ease: 'power2.out' });
    const onMove = (e: MouseEvent) => {
      if (hover) return;
      setX(e.clientX);
      setY(e.clientY);
    };
    document.addEventListener('mousemove', onMove, { passive: true });

    const items = Array.from(document.querySelectorAll('[data-cursor]'));
    const cleanups: Array<() => void> = [];
    items.forEach((item) => {
      const element = item as HTMLElement;
      const onOver = () => {
        const rect = element.getBoundingClientRect();
        if (element.dataset.cursor === 'icons') {
          cursor.classList.add('cursor-icons');
          setX(rect.left);
          setY(rect.top);
          cursor.style.setProperty('--cursorH', `${rect.height}px`);
          hover = true;
        }
        if (element.dataset.cursor === 'disable') {
          cursor.classList.add('cursor-disable');
        }
      };
      const onOut = () => {
        cursor.classList.remove('cursor-disable', 'cursor-icons');
        hover = false;
      };
      element.addEventListener('mouseover', onOver);
      element.addEventListener('mouseout', onOut);
      cleanups.push(() => {
        element.removeEventListener('mouseover', onOver);
        element.removeEventListener('mouseout', onOut);
      });
    });
    return () => {
      document.removeEventListener('mousemove', onMove);
      cleanups.forEach((fn) => fn());
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div className="cursor-main" ref={cursorRef} aria-hidden="true"></div>;
};

export default Cursor;
