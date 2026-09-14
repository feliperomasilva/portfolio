import { useEffect, useRef, useState } from 'react';
import { canAnimate, ensureGsap } from '../../lib/js/motion';
import './Showreel.css';

// Caminho do vídeo de fundo do Hero (vive junto dos JSONs Lottie em public/assets/lottie)
const VIDEO_SRC = '/assets/lottie/showreel.mp4';

// Fundo de vídeo do Hero: roda em loop esmaecido atrás do texto. Se o vídeo falhar, some e fica só o fundo
// sólido + véu (nunca quebra a página). O zoom sutil no scroll é feito via ScrollTrigger com scrub.
const Showreel = () => {
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  // true = vídeo indisponível, renderiza só o fundo
  const [noVideo, setNoVideo] = useState(false);

  // Tenta dar play assim que houver dados suficientes (autoplay mutado é permitido pelos navegadores)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || noVideo) return;
    const play = () => { video.play().catch(() => {}); };
    if (video.readyState >= 2) play();
    else video.addEventListener('canplay', play, { once: true });
    return () => video.removeEventListener('canplay', play);
  }, [noVideo]);

  // Zoom de 1.0 → 1.06 acompanhando o scroll (some com movimento reduzido via canAnimate)
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !canAnimate()) return;
    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.to('.showreel-video', {
        scale: 1.06,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.8 },
      });
    }, root);
    return () => ctx.revert();
  }, [noVideo]);

  return (
    <div className="showreel-bg" ref={rootRef} aria-hidden="true">
      {!noVideo && (
        <video
          ref={videoRef}
          className="showreel-video"
          preload="metadata"
          muted
          loop
          autoPlay
          playsInline
          disablePictureInPicture
          onError={() => setNoVideo(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}
      {/* Véu escuro em degradê que garante o contraste do texto sobre o vídeo */}
      <span className="showreel-veil" />
    </div>
  );
};

export default Showreel;
