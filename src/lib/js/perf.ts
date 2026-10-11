// Helpers de performance: evitam que scroll/resize disparem trabalho pesado a cada pixel.

// Executa o callback no máximo 1x por frame via requestAnimationFrame (padrão "rAF throttle")
export const onScrollRaf = (fn) => {
  let ticking = false;
  const update = () => {
    ticking = false;
    fn(window.scrollY);
  };
  const handler = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
};

// Agrupa eventos de resize: só chama a função depois que o usuário parar de redimensionar (padrão 200ms)
export const onResizeDebounced = (fn, wait = 200) => {
  let t = 0;
  const handler = () => {
    clearTimeout(t);
    t = setTimeout(fn, wait);
  };
  window.addEventListener('resize', handler);
  return () => {
    window.removeEventListener('resize', handler);
    clearTimeout(t);
  };
};
