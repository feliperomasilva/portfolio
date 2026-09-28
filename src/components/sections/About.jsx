import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../i18n/LocaleContext';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/Premium';
import StatIcon from '../ui/StatIcon';
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
  const { t } = useLocale();
  const aboutContent = t.about;
  const lineRef = useRef(null);
  // true = profile.jpg carregou; false = mostra o placeholder com instrução (some sozinho ao adicionar a foto)
  const [photoOk, setPhotoOk] = useState(true);
  useEffect(() => {
    if (!canAnimate() || !lineRef.current) return;
    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      // Cada linha decorativa cresce ao entrar na tela da PRÓPRIA seção.
      // Antes o trigger era '#about' para todas as linhas, então as linhas de
      // Skills/Projetos/Contato já apareciam crescidas antes do usuário chegar nelas.
      gsap.utils.toArray('.line-grow').forEach((line) => {
        gsap.fromTo(line, { scaleX: 0 }, {
          scaleX: 1, duration: 0.8, ease: 'expo.out',
          scrollTrigger: { trigger: line.closest('section') || line, start: 'top 75%' },
        });
      });
      // Foto: entra ao chegar na seção, sai ao abandoná-la (reverse anima a saída de volta)
      gsap.fromTo('.about-photo', { opacity: 0, y: 48, scale: 0.97 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: '#about', start: 'top 80%', end: 'bottom 30%', toggleActions: 'play none none reverse' },
      });
      // Parallax interno: a imagem desliza dentro da moldura seguindo o scroll da seção
      gsap.fromTo('.about-photo img', { yPercent: -7 }, {
        yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="section" ref={lineRef}>
      <div className="wrap">
        <Reveal variant="blur">
          <SectionHeading index={aboutContent.index} eyebrow={aboutContent.eyebrow} title={aboutContent.title} />
        </Reveal>
        <div className="about-grid">
          {/* Painel da foto: ocupa a esquerda e avança ao centro; some ao sair da seção */}
          <Reveal variant="clip" delay="d1">
            <figure className="about-photo card" aria-label={aboutContent.photoLabel}>
              {photoOk ? (
                <picture>
                  <source srcSet="/assets/images/profile.webp" type="image/webp" />
                  <img
                    src="/assets/images/profile.jpg"
                    alt={aboutContent.photoAlt}
                    loading="lazy"
                    decoding="async"
                    width="800"
                    height="1000"
                    onError={() => setPhotoOk(false)}
                  />
                </picture>
              ) : (
                <span className="about-photo-empty mono">{aboutContent.photoEmpty}</span>
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
              <p className="about-promise mono">{aboutContent.promise}</p>
            </Reveal>
          </div>
          {/* Coluna de números: cada stat vira um card com ícone acima + contagem animada */}
          <div className="about-stats">
            {aboutContent.stats.filter((s) => s.icon !== 'stat-original').map((s, i) => (
              <Reveal key={s.label} variant="scale" delay={['d1', 'd2', 'd3'][i % 3]}>
                <div className="card stat-card">
                  <span className="stat-icon" aria-hidden="true">
                    <StatIcon name={s.icon} size={24} />
                  </span>
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
