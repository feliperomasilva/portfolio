import { useEffect, useRef, useState } from 'react';
import { canAnimate, ensureGsap } from '../../lib/js/motion';
import './Preloader.css';

// Palavras-âncora da intro: cada uma vira uma pill em pastel e ecoa uma frente do site
// (Frontend → Skills/Projetos, Motion → Hero/ScrollFX, Detalhe → About). É assim que a intro
// "conversa" com o resto: o vocabulário dela reaparece nas seções.
const WORDS = [
  { n: '01', label: 'Frontend', tone: 'tone-blue' },
  { n: '02', label: 'Motion', tone: 'tone-yellow' },
  { n: '03', label: 'Detalhe', tone: 'tone-green' },
];

// Intro minimalista-editorial: um documento branco sobre fundo osso que se apresenta em cascata
// (cartão → filete → cabeçalho → serifada → pills → contador) e sai como cortina para cima,
// disparando o evento 'frs:ready' que acorda a entrada do Hero. Aparece 1x por sessão.
// ESC ou "Pular" acelera a timeline sem pular a coreografia de saída.
const Preloader = ({ onDone }) => {
  // Se já viu nesta sessão, nem monta (o Hero toca direto)
  const [visible, setVisible] = useState(() => {
    if (typeof sessionStorage === 'undefined') return true;
    return !sessionStorage.getItem('frs-preloaded');
  });
  const rootRef = useRef(null);
  const numRef = useRef(null);
  const barRef = useRef(null);
  const tlRef = useRef(null);
  const doneRef = useRef(false);

  // Avança a timeline em 2.8x (usado pelo ESC e pelo botão Pular). Ignora se já está saindo.
  const skip = () => {
    const tl = tlRef.current;
    if (!tl || doneRef.current) return;
    if (tl.progress() > 0.82) return;
    tl.timeScale(2.8);
  };

  useEffect(() => {
    if (!visible) return;
    // Trava a rolagem enquanto a intro está no ar
    document.body.style.overflow = 'hidden';
    // Sem animação: finaliza direto
    if (!canAnimate()) {
      finish();
      return;
    }
    const gsap = ensureGsap();
    const num = { v: 0 };
    const tl = gsap.timeline({ onComplete: finish });
    tlRef.current = tl;
    // Estado inicial de tudo que entra em cascata
    tl.set('.intro-card', { opacity: 0, y: 24 }, 0);
    tl.set('.intro-rule-top', { scaleX: 0 }, 0);
    tl.set('.intro-meta > *', { opacity: 0, y: 8 }, 0);
    tl.set('.intro-serif > span', { yPercent: 112 }, 0);
    tl.set('.intro-sub', { opacity: 0, y: 12 }, 0);
    tl.set('.intro-word', { opacity: 0, y: 12 }, 0);
    tl.set('.intro-foot', { opacity: 0 }, 0);
    // 1. O documento aparece
    tl.to('.intro-card', { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 0.05);
    // 2. O filete superior desenha da esquerda para a direita
    tl.to('.intro-rule-top', { scaleX: 1, duration: 0.8, ease: 'expo.inOut' }, 0.15);
    // 3. Metadados do cabeçalho sobem em cascata
    tl.to('.intro-meta > *', { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.08 }, 0.25);
    // 4. A serifada gigante sobe de dentro das máscaras, linha por linha
    tl.to('.intro-serif > span', { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 }, 0.35);
    // 5. Subtítulo + pills entram com o atraso em cascata (80ms entre itens)
    tl.to('.intro-sub', { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 0.9);
    tl.to('.intro-word', { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.08 }, 1.0);
    // 6. Contador 000→100 e barra de progresso correm em paralelo com a cascata
    tl.to(num, {
      v: 100, duration: 1.6, ease: 'power2.inOut',
      onUpdate: () => {
        if (numRef.current) numRef.current.textContent = String(Math.round(num.v)).padStart(3, '0');
        if (barRef.current) barRef.current.style.transform = `scaleX(${(num.v / 100).toFixed(3)})`;
      },
    }, 0.4);
    tl.to('.intro-foot', { opacity: 1, duration: 0.5, ease: 'expo.out' }, 1.1);
    // 7. Respiro com tudo composto antes da saída
    tl.to({}, { duration: 0.3 });
    // 8. Saída: o conteúdo afunda suavemente e a página inteira sobe como cortina, revelando o Hero
    tl.to('.intro-card', { y: -28, opacity: 0, duration: 0.5, ease: 'expo.in' }, '>-0.05');
    tl.to(rootRef.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '<0.15');

    // Marca a sessão, libera o scroll, acorda o Hero e desmonta
    function finish() {
      if (doneRef.current) return;
      doneRef.current = true;
      try { sessionStorage.setItem('frs-preloaded', '1'); } catch { /* noop */ }
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('frs:ready'));
      setVisible(false);
      if (onDone) onDone();
    }
    // ESC pula a intro (acelera, sem quebrar a saída)
    const onKey = (e) => { if (e.key === 'Escape') skip(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); tl.kill(); document.body.style.overflow = ''; };
  }, [visible, onDone]);

  if (!visible) return null;
  return (
    <div ref={rootRef} className="preloader intro" aria-label="Introdução" style={{ clipPath: 'inset(0 0 0% 0)' }}>
      {/* Mancha radial lenta atrás do documento (20s+, quase invisível) */}
      <span className="intro-ambient" aria-hidden="true" />
      <div className="intro-card" role="dialog" aria-modal="true" aria-label="Apresentação do portfólio">
        {/* Barra de janela minimalista: três pontos + título + ano */}
        <div className="intro-chrome" aria-hidden="true">
          <span className="intro-dot" />
          <span className="intro-dot" />
          <span className="intro-dot" />
          <span className="intro-chrome-title mono">portfólio — vol. 03</span>
          <span className="intro-chrome-year mono">©2026</span>
        </div>
        <span className="intro-rule-top" aria-hidden="true" />
        {/* Metadados de abertura */}
        <div className="intro-meta">
          <span className="mono">introdução — 01</span>
          <span className="mono">brasil · remoto</span>
          <span className="mono">react · motion · ui</span>
        </div>
        {/* Nome em serifada editorial, uma linha por máscara */}
        <h1 className="intro-serif" aria-label="Felipe Romão">
          <span className="intro-mask" aria-hidden="true"><span>Felipe</span></span>
          <span className="intro-mask" aria-hidden="true"><span><em>Romão</em></span></span>
        </h1>
        <p className="intro-sub">Desenvolvedor criativo. Interfaces que parecem vivas, construídas com arquitetura frontend, motion design e obsessão por detalhe.</p>
        {/* Três frentes em pills pastel que reaparecem como temas das seções */}
        <ul className="intro-words" aria-label="Frentes de atuação">
          {WORDS.map((w) => (
            <li key={w.n} className="intro-word">
              <span className="intro-num mono">{w.n}</span>
              <span className={`intro-pill ${w.tone}`}>{w.label}</span>
            </li>
          ))}
        </ul>
        {/* Rodapé: contador + progresso + saída */}
        <div className="intro-foot">
          <span className="intro-count mono" ref={numRef}>000</span>
          <span className="intro-progress" aria-hidden="true"><span ref={barRef} /></span>
          <button type="button" className="intro-skip" onClick={skip}>
            <kbd>ESC</kbd> pular
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
