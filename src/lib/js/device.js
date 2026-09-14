// Perguntas sobre o dispositivo/usuário. Centraliza essas checagens para não espalhar matchMedia pelo código.

// Respeita a configuração de acessibilidade do sistema ("reduzir movimento")
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Atalho para saber se a viewport é de celular
export const isMobileViewport = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

// Detecta aparelho fraco (poucos núcleos, pouca RAM, economia de dados ou rede 2G) com cache do resultado
let lowEndCache = null;
export const isLowEnd = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (lowEndCache !== null) return lowEndCache;
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory || 8;
  const conn = navigator.connection || {};
  const saveData = conn.saveData === true;
  const slowNet = /^(slow-2g|2g)$/.test(conn.effectiveType || '');
  lowEndCache = cores <= 4 || mem <= 4 || saveData || slowNet;
  return lowEndCache;
};

// Combina tudo: se qualquer condição pedir menos efeito, os componentes pesados devem simplificar
export const shouldReduceFX = () => prefersReducedMotion() || isLowEnd() || isMobileViewport();
