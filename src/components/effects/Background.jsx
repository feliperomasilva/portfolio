import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/js/device';
import { onResizeDebounced } from '../../lib/js/perf';

// Caracteres da "chuva" estilo Matrix (kana + dígitos + símbolos)
const MATRIX_CHARS = 'アイカキクケコサシスセソ01<>[]{}=+*/#$%&';

// Fundo global do site: canvas fixo com chuva de caracteres + véu escuro por cima para legibilidade.
// Desliga sozinho com movimento reduzido (vira imagem estática) e é mais leve no celular.
export const Background = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const mobile = () => window.innerWidth < 768;
    let raf = 0;
    let w = 0;
    let h = 0;
    let cols = 0;
    let drops = [];
    const font = 14;

    // Ajusta o canvas ao tamanho da tela e reinicia as colunas de caracteres
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      cols = Math.floor(w / font);
      // Limita o nº de colunas para não pesar (menor ainda no celular)
      const max = mobile() ? 44 : 90;
      if (cols > max) cols = max;
      drops = Array.from({ length: cols }, () => Math.random() * (h / font));
      ctx.fillStyle = '#050a14';
      ctx.fillRect(0, 0, w, h);
      // Com movimento reduzido, desenha 1x parado em vez de animar
      if (reduced) {
        ctx.font = `${font}px "JetBrains Mono", monospace`;
        ctx.fillStyle = 'rgba(34, 255, 136, 0.55)';
        for (let i = 0; i < cols; i++) {
          const ch = MATRIX_CHARS[(Math.random() * MATRIX_CHARS.length) | 0];
          ctx.fillText(ch, i * font, Math.random() * h);
        }
      }
    };
    resize();
    const offResize = onResizeDebounced(resize);
    if (reduced) return () => { offResize(); };

    // Loop da chuva: redesenha ~20x/seg com rastro translúcido; gotas reiniciam aleatoriamente ao sair da tela
    let last = 0;
    const gap = 50;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (now - last < gap) return;
      last = now;
      ctx.fillStyle = 'rgba(5, 10, 20, 0.18)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${font}px "JetBrains Mono", monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = MATRIX_CHARS[(Math.random() * MATRIX_CHARS.length) | 0];
        const x = i * font;
        const y = drops[i] * font;
        // Raramente pinta um caractere bem claro (brilho esporádico)
        ctx.fillStyle = Math.random() > 0.972 ? '#c8ffe2' : 'rgba(34, 255, 136, 0.55)';
        ctx.fillText(ch, x, y);
        if (y > h && Math.random() > 0.974) drops[i] = 0;
        drops[i]++;
      }
    };
    raf = requestAnimationFrame(tick);
    // Pausa a animação com a aba oculta para economizar CPU/bateria
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else { last = 0; raf = requestAnimationFrame(tick); }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      offResize();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <>
      {/* O canvas em si (atrás de tudo, sem interceptar cliques) */}
      <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.28 }} />
      {/* Véu escuro sobre o canvas para o texto das seções continuar legível */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(5,10,20,0.78), rgba(5,10,20,0.38) 28%, rgba(5,10,20,0.38) 72%, rgba(5,10,20,0.86))' }} />
    </>
  );
};

export default Background;
