import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/js/device';
import { onResizeDebounced } from '../../lib/js/perf';

// Caracteres da "chuva" estilo Matrix (kana + dígitos + símbolos)
const MATRIX_CHARS = 'アイカキクケコサシスセソ01<>[]{}=+*/#$%&';

// Fundo global do site: canvas fixo com chuva de caracteres + véu escuro por cima para legibilidade.
// Sobe leve por padrão (~20fps, colunas capadas) e reduz ainda mais quando o
// palco 3D do notebook está vivo (evento frs:stage) — 2 WebGL + 1 canvas 2D
// juntos derrubam o fps no mobile. Desliga sozinho com movimento reduzido.
export const Background = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const mobile = () => window.innerWidth < 768;
    // Ritmo da chuva: normal 50ms (~20fps) + rastro; com palco 3D vivo cai
    // para ~12fps (gap maior) para a GPU respirar
    let gap = 50;
    let raf = 0;
    let w = 0;
    let h = 0;
    let cols = 0;
    let drops = [];
    const font = 14;

    // Ajusta o canvas ao tamanho da tela e reinicia as colunas de caracteres.
    // Usa devicePixelRatio (máx 2) com ctx escalado: sem isso o texto fica
    // borrado em telas HiDPI/retina porque 1px CSS vira vários px físicos.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(w / font);
      // Limita o nº de colunas para não pesar (menor ainda no celular;
      // Task 4: 44->32 no mobile — fillText por frame é o custo dominante)
      const max = mobile() ? 32 : 90;
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

    // Loop da chuva: redesenha com rastro translúcido; gotas reiniciam aleatoriamente ao sair da tela.
    // `gap` é mutável (desacelera com o palco 3D vivo) — por isso `last` compara contra a variável.
    let last = 0;
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
    // Com o palco 3D vivo, desacelera a chuva (GPU respira); ao sair, volta
    const onStage = (e: Event) => {
      gap = (e as CustomEvent)?.detail?.live ? 85 : 50;
    };
    window.addEventListener('frs:stage', onStage as EventListener);
    // Pausa a animação com a aba oculta para economizar CPU/bateria
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else { last = 0; raf = requestAnimationFrame(tick); }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      offResize();
      window.removeEventListener('frs:stage', onStage as EventListener);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <>
      {/* O canvas em si (atrás de tudo, sem interceptar cliques) */}
      <canvas ref={canvasRef} className="bg-matrix" aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.28 }} />
      {/* Véu escuro sobre o canvas para o texto das seções continuar legível */}
      <div className="bg-matrix-veil" aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(5,10,20,0.78), rgba(5,10,20,0.38) 28%, rgba(5,10,20,0.38) 72%, rgba(5,10,20,0.86))' }} />
    </>
  );
};

export default Background;
