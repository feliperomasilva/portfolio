import { useEffect } from 'react';
import { canAnimate, ensureGsap, refreshScroll } from '../../lib/js/motion';

// Parallax global discreto (componente invisível): move títulos, visuais, stats, divisórias e marca do rodapé
// conforme o scroll, tudo com scrub (segue o dedo, sem travar a página). Só usa transform/opacity (GPU).
const ScrollFX = () => {
  useEffect(() => {
    if (!canAnimate()) return;
    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      // Títulos das seções flutuam para cima enquanto atravessam a tela — scrub rápido p/ resposta premium
      gsap.utils.toArray<HTMLElement>('.sec-title-premium').forEach((el) => {
        gsap.fromTo(el, { y: 22 }, {
          y: -22, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        });
      });
      // Imagens/visuais dos projetos deslizam levemente dentro do cartão
      gsap.utils.toArray<HTMLElement>('.proj-visual').forEach((el) => {
        gsap.fromTo(el, { yPercent: -5 }, {
          yPercent: 5, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        });
      });
      // Cards de estatística com deriva vertical sutil
      gsap.utils.toArray<HTMLElement>('.stat-card').forEach((el) => {
        gsap.fromTo(el, { y: 16 }, {
          y: -16, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        });
      });
      // Linhas divisórias crescem e ganham opacidade ao entrar na tela
      gsap.utils.toArray<HTMLElement>('.sec-rule').forEach((el) => {
        gsap.fromTo(el, { scaleX: 0.6, opacity: 0.4 }, {
          scaleX: 1, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 60%', scrub: 0.6 },
        });
      });
      // Marca do rodapé sobe e aparece junto com o fim da página
      const brand = document.querySelector('.footer-brand');
      if (brand) {
        gsap.fromTo(brand, { y: 24, opacity: 0.4 }, {
          y: 0, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: '.footer-premium', start: 'top bottom', end: 'bottom bottom', scrub: 0.8 },
        });
      }
    });
    // Recalcula as posições após carregar tudo, após o preloader e com atraso de segurança (fontes/vídeo).
    // Também recalcula ao trocar o idioma: os textos PT/EN têm comprimentos diferentes
    // e mudam a altura das seções (sem isso o parallax/trigger fica desalinhado).
    const onLoad = () => refreshScroll();
    let localeT = 0;
    const onLocale = () => { clearTimeout(localeT); localeT = setTimeout(() => refreshScroll(), 120); };
    window.addEventListener('load', onLoad);
    window.addEventListener('frs:ready', onLoad);
    window.addEventListener('frs:locale', onLocale);
    const t = setTimeout(() => refreshScroll(), 900);
    return () => {
      window.removeEventListener('load', onLoad);
      window.removeEventListener('frs:ready', onLoad);
      window.removeEventListener('frs:locale', onLocale);
      clearTimeout(t);
      clearTimeout(localeT);
      ctx.revert();
    };
  }, []);
  return null;
};

export default ScrollFX;
