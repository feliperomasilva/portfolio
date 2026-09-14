import { Braces, Palette, Wrench, Database } from 'lucide-react';
import { skillsContent as baseSkills } from '../../data/content';
import { useLocale } from '../../i18n/LocaleContext';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/Premium';
import './Skills.css';

// Chave icon (vinda do content.js) → componente de ícone lucide
const icons = { code: Braces, palette: Palette, wrench: Wrench, database: Database };

// Mesmo tilt 3D dos projetos: cartão inclina seguindo o mouse + move o brilho. Desligado no touch.
const tilt = (e) => {
  if (window.matchMedia('(hover: none)').matches) return;
  const card = e.currentTarget;
  const r = card.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  card.style.transform = `translateY(-8px) perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg)`;
  card.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
  card.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
};
const untilt = (e) => { e.currentTarget.style.transform = ''; };

// Seção Habilidades: 4 cartões (Frontend, Motion, Ferramentas, Backend) com entrada alternada clip/scale
const Skills = () => {
  const { t } = useLocale();
  const skillsContent = t.skills;
  return (
  <section id="skills" className="section skills-sec">
    <div className="wrap">
      <Reveal variant="blur">
        <SectionHeading index={skillsContent.index} eyebrow={skillsContent.eyebrow} title={skillsContent.title} sub={skillsContent.subtitle} />
      </Reveal>
      <div className="skills-grid">
        {baseSkills.categories.map((cat, i) => {
          const Icon = icons[cat.icon] || Braces;
          const name = skillsContent.categories[i]?.name || cat.name;
          return (
            <Reveal key={cat.name} variant={i % 2 ? 'scale' : 'clip'} delay={['d1', 'd2', 'd3', 'd4'][i % 4]}>
              <article className="card skill-card" onMouseMove={tilt} onMouseLeave={untilt}>
                {/* Topo: ícone em degradê + etiqueta mod-01..04 */}
                <div className="skill-top"><span className="skill-icon"><Icon size={20} /></span><span className="readout">mod-0{i + 1}</span></div>
                <h3>{name}</h3>
                <ul>
                  {cat.skills.map((s) => (
                    <li key={s}><span className="dot" />{s}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          );
        })}
      </div>
      <div className="sec-rule" />
    </div>
  </section>
  );
};

export default Skills;
