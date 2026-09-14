import { useEffect, useState } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';
// Camadas globais: fundo animado, tela de loading e parallax por scroll
import Background from './components/effects/Background';
import Preloader from './components/effects/Preloader';
import ScrollFX from './components/effects/ScrollFX';
// Estrutura da página: navbar + seções (Hero com showreel, Sobre, Habilidades, Projetos, Contato)
import Navbar from './components/layout/Navbar';
import CyberHero from './components/sections/CyberHero';
import About from './components/sections/About';
import Skills from './components/sections/Skills';
import Projects from './components/sections/Projects';
import Contact from './components/sections/Contact';
import { LocaleProvider, useLocale } from './i18n/LocaleContext';
import { scrollToId } from './lib/js/dom';
import { onScrollRaf } from './lib/js/perf';
import { prefersReducedMotion } from './lib/js/device';
import './styles/globals.css';
import './styles/animations.css';
import './styles/premium.css';
import './App.css';

// Botão flutuante "Fale comigo": aparece depois de rolar 90% da primeira tela e leva ao contato
const FloatCTA = () => {
  const { t } = useLocale();
  const [show, setShow] = useState(false);
  useEffect(() => {
    // Listener de scroll otimizado (1x por frame) que liga/desliga o botão
    const check = (y) => setShow(y > window.innerHeight * 0.9);
    check(window.scrollY);
    return onScrollRaf(check);
  }, []);
  return (
    <button className={`float-cta ${show ? 'show' : ''}`} onClick={() => scrollToId('contact')} aria-label={t.floatLabel}>
      <MessageCircle size={17} /> {t.floatCta}
    </button>
  );
};

function AppInner() {
  const { t } = useLocale();
  useEffect(() => {
    // Rolagem suave global; desliga se o usuário preferir movimento reduzido
    document.documentElement.style.scrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; };
  }, []);

  return (
    <div className="app">
      {/* Link invisível para teclado/leitores de tela pularem direto ao conteúdo */}
      <a className="skip-link" href="#showreel">{t.skipLink}</a>
      <Preloader />
      <Background />
      <ScrollFX />
      <Navbar />
      {/* Ordem das seções na página */}
      <main className="app-main">
        <CyberHero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
      {/* Rodapé: assinatura + botão de voltar ao topo */}
      <footer className="footer-premium footer-matrix">
        <span className="footer-grid" aria-hidden="true" />
        <div className="wrap footer-content">
          <p className="footer-brand">Felipe Romao <span>{t.footerBrand}</span></p>
          <div className="footer-row">
            <p className="mono">{t.footerNote}</p>
            <button className="top-btn" onClick={() => scrollToId('showreel')} aria-label={t.topBtn}>
              {t.topBtn} <ArrowUp size={15} />
            </button>
          </div>
        </div>
      </footer>
      <FloatCTA />
    </div>
  );
}

function App() {
  return (
    <LocaleProvider>
      <AppInner />
    </LocaleProvider>
  );
}

export default App;
