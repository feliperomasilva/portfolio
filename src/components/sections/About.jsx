import { useEffect, useRef, useState } from 'react';
import { aboutContent } from '../../data/content';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/Premium';
import { canAnimate, ensureGsap } from '../../lib/js/motion';
import './About.css';

// Número que conta de 0 até value ao entrar na tela (1.2s com easing cúbico). Com movimento reduzido, mostra direto.
const CountUp = ({ value, suffix }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = `${value}${suffix}`;
      return;
    }
    let raf = 0;
    // Dispara uma única vez quando 40% do número aparece; depois desconecta o observer
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1200, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${Math.round(eased * value)}${suffix}`;
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [value, suffix]);
  return <span ref={ref}>0{suffix}</span>;
};

// Seção Sobre: foto com parallax à esquerda + texto no meio + números + linha que cresce no scroll.
// A foto some ao sair da seção e reaparece ao voltar (toggle via ScrollTrigger com reverse).
const About = () => {
  const lineRef = useRef(null);
  // true = profile.jpg carregou; false = mostra o placeholder com instrução (some sozinho ao adicionar a foto)
  const [photoOk, setPhotoOk] = useState(true);
  useEffect(() => {
    if (!canAnimate() || !lineRef.current) return;
    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo('.line-grow', { scaleX: 0 }, {
        scaleX: 1, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: '#about', start: 'top 75%' },
      });
      // Foto: entra ao chegar na seção, sai ao abandoná-la (reverse anima a saída de volta)
      gsap.fromTo('.about-photo', { opacity: 0, y: 60, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: '#about', start: 'top 80%', end: 'bottom 30%', toggleActions: 'play none none reverse' },
      });
      // Parallax interno: a imagem desliza dentro da moldura seguindo o scroll da seção
      gsap.fromTo('.about-photo img', { yPercent: -8 }, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="section" ref={lineRef}>
      <div className="wrap">
        <Reveal variant="blur">
          <SectionHeading index={aboutContent.index} eyebrow="sobre mim" title={aboutContent.title} />
        </Reveal>
        <div className="about-grid">
          {/* Painel da foto: ocupa a esquerda e avança ao centro; some ao sair da seção */}
          <Reveal variant="clip" delay="d1">
            <figure className="about-photo card" aria-label="Foto de Felipe Romao da Silva">
              {photoOk ? (
                <img
                  src="/assets/images/profile.jpg"
                  alt="Foto de Felipe Romao da Silva"
                  loading="lazy"
                  onError={() => setPhotoOk(false)}
                />
              ) : (
                <span className="about-photo-empty mono">adicione sua foto em public/assets/images/profile.jpg</span>
              )}
              {/* Véu em degradê que funde a foto com o fundo animado da página */}
              <span className="about-photo-veil" aria-hidden="true" />
            </figure>
          </Reveal>
          {/* Coluna de texto: frase de abertura + parágrafos + assinatura, com entrada em cascata */}
          <div>
            <Reveal variant="fade" delay="d2"><p className="about-intro">{aboutContent.intro}</p></Reveal>
            {aboutContent.description.map((p, i) => (
              <Reveal key={i} variant="fade" delay={['d2', 'd3', 'd4'][i % 3]}><p className="about-p">{p}</p></Reveal>
            ))}
            <Reveal variant="fade" delay="d4">
              <p className="about-promise mono">De acordo com o cliente · atenção ao detalhe · frontend + motion + backend</p>
            </Reveal>
          </div>
          {/* Coluna de números: cada stat vira um card com contagem animada */}
          <div className="about-stats">
            {aboutContent.stats.map((s, i) => (
              <Reveal key={s.label} variant="scale" delay={['d1', 'd2', 'd3', 'd4'][i % 4]}>
                <div className="card stat-card">
                  <strong><CountUp value={s.value} suffix={s.suffix} /></strong>
                  <span>{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="sec-rule" />
      </div>
    </section>
  );
};

export default About;
