import { useEffect, useRef, useState } from 'react';
import { canAnimate, ensureGsap } from '../../lib/js/motion';
import './Showreel.css';

// Vídeo de fundo do Hero: versão leve p/ mobile (baseline, máx. compatibilidade) + 720p p/ desktop.
// Poster extraído do 1º segundo do vídeo — aparece instantaneamente enquanto o vídeo carrega,
// depois some de vez quando o vídeo toca (nunca ficam os dois visíveis = sem fantasma).
const POSTER_SRC = '/assets/lottie/showreel-poster.jpg';
const VIDEO_MOBILE = '/assets/lottie/showreel-480.mp4';
const VIDEO_DESKTOP = '/assets/lottie/showreel-720.mp4';

// Fundo de vídeo do Hero: loop contínuo que NUNCA pausa no scroll (só na aba oculta, p/ bateria).
// Se o vídeo falhar, some e fica só o poster + véu (nunca quebra a página).
// O zoom sutil no scroll anima o wrapper único (.showreel-zoom) via ScrollTrigger com scrub.
const Showreel = () => {
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  // true = vídeo indisponível, renderiza só o poster
  const [failed, setFailed] = useState(false);
  // true = vídeo já tocou ao menos 1x; poster some de vez e vídeo fica visível (sem piscar em stalls)
  const [started, setStarted] = useState(false);
  // Um único src (mobile leve ou desktop): <source media> é ignorado dentro de <video>
  // em vários browsers, então a escolha é feita aqui via matchMedia.
  const [src] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
      ? VIDEO_MOBILE
      : VIDEO_DESKTOP
  ));

  // Autoplay contínuo: muted via propriedade JS (o iOS ignora o atributo JSX), playsinline
  // webkit, load() único + play() controlado (sem atributo autoPlay p/ não correr com o load),
  // retries com backoff, retomada ao voltar à aba / destravar preloader / primeiro gesto.
  // Nunca pausa por scroll: o vídeo segue em loop mesmo com o Hero fora da tela.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    let disposed = false;
    let retries = 0;
    const timers = new Set();

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        if (!disposed) fn();
      }, ms);
      timers.add(id);
      return id;
    };

    const tryPlay = () => {
      if (disposed || document.hidden) return;
      video.muted = true;
      let p;
      try {
        p = video.play();
      } catch {
        return;
      }
      if (p && typeof p.then === 'function') {
        p.then(() => {
          retries = 0;
          if (!disposed) setStarted(true);
        }).catch(() => {
          if (!disposed && retries < 8) {
            retries += 1;
            later(tryPlay, retries * 400);
          }
        });
      }
    };

    const onPlaying = () => {
      retries = 0;
      setStarted(true);
    };
    // Stall/buffer: retoma sem load() (load() abortaria o stream e causaria o frame travado)
    const onWaiting = () => tryPlay();
    const onCanPlay = () => tryPlay();
    const onError = () => setFailed(true);
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else tryPlay();
    };
    // Preloader destrava (~4s de intro): garante play quando o Hero aparece
    const onReady = () => {
      tryPlay();
      later(tryPlay, 300);
    };
    // Primeiro gesto desbloqueia o autoplay onde ele foi adiado (Low Power / Data Saver)
    const onGesture = () => tryPlay();

    video.addEventListener('playing', onPlaying);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('loadeddata', onCanPlay);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('canplaythrough', onCanPlay);
    video.addEventListener('error', onError);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('frs:ready', onReady);
    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('touchend', onGesture);
    window.addEventListener('keydown', onGesture);
    try {
      video.load();
    } catch {
      /* noop */
    }
    tryPlay();
    later(tryPlay, 600);
    later(tryPlay, 1800);

    return () => {
      disposed = true;
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('loadeddata', onCanPlay);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('canplaythrough', onCanPlay);
      video.removeEventListener('error', onError);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('frs:ready', onReady);
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('touchend', onGesture);
      window.removeEventListener('keydown', onGesture);
    };
  }, [failed]);

  // Zoom de 1.0 → 1.06 acompanhando o scroll no wrapper único (poster+vídeo juntos = sem fantasma)
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !canAnimate()) return;
    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.to('.showreel-zoom', {
        scale: 1.06,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.8 },
      });
    }, root);
    return () => ctx.revert();
  }, [failed]);

  return (
    <div className="showreel-bg" ref={rootRef} aria-hidden="true">
      <div className="showreel-zoom">
        <img
          className={`showreel-media showreel-poster${started ? ' is-hidden' : ''}`}
          src={POSTER_SRC}
          alt=""
          draggable={false}
        />
        {!failed && (
          <video
            ref={videoRef}
            className={`showreel-media showreel-video${started ? ' is-started' : ''}`}
            src={src}
            preload="auto"
            muted
            loop
            playsInline
            disablePictureInPicture
            onError={() => setFailed(true)}
          />
        )}
      </div>
      {/* Véu escuro em degradê que garante o contraste do texto sobre o vídeo */}
      <span className="showreel-veil" />
    </div>
  );
};

export default Showreel;
