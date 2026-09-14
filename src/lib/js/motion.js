// Central de animações do site: configura o GSAP uma única vez e expõe helpers de scroll, easing e rolagem suave.
// Todos os componentes que animam algo importam daqui em vez de configurar o GSAP por conta própria.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { prefersReducedMotion } from './device';

// Flag interna: garante que os plugins do GSAP sejam registrados uma única vez
let registered = false;
// Devolve o gsap já configurado (registra ScrollTrigger + ScrollToPlugin na primeira chamada)
export const ensureGsap = () => {
  if (registered || typeof window === 'undefined') return gsap;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  // Ignora resize do mobile na hora de recalcular os triggers (evita "pulos" no iOS)
  ScrollTrigger.config({ ignoreMobileResize: true });
  // Suaviza soluços do ticker após a aba ficar inativa
  gsap.ticker.lagSmoothing(500, 33);
  registered = true;
  return gsap;
};

// Curvas de easing padrão do site (sempre as mesmas, para o movimento parecer um sistema só)
export const EASE = {
  out: 'expo.out', // entradas suaves que desaceleram no fim
  inOut: 'expo.inOut', // transições de ida e volta (ex: saída do preloader)
  spring: 'elastic.out(1, 0.55)', // efeito mola (reservado para microinterações)
  css: 'cubic-bezier(0.22, 1, 0.36, 1)', // mesma curva em CSS puro
};

// Durações padrão (em segundos): curta, rápida, média e lenta
export const DUR = { instant: 0.25, fast: 0.45, med: 0.8, slow: 1.1 };

// Pode animar? Retorna false fora do navegador ou se o usuário pediu "reduzir movimento"
export const canAnimate = () => typeof window !== 'undefined' && !prefersReducedMotion();

// Rola suavemente até a seção com o id dado, descontando a altura da navbar fixa (76px)
export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  // Com movimento reduzido, pula direto sem animar
  if (prefersReducedMotion()) {
    el.scrollIntoView();
    return;
  }
  ensureGsap();
  gsap.to(window, { duration: 1, ease: EASE.out, scrollTo: { y: el, offsetY: 76 } });
};

// Reexporta o ScrollTrigger para os componentes criarem triggers sem importar o gsap direto
export { ScrollTrigger };
// Manda o ScrollTrigger recalcular as posições (usado após carregar vídeo, fontes ou o preloader)
export const refreshScroll = () => {
  if (typeof window === 'undefined') return;
  ensureGsap();
  ScrollTrigger.refresh();
};
