import { ArrowUpRight, FolderGit2 } from 'lucide-react';
import { projectsContent as baseProjects } from '../../data/content';
import { useLocale } from '../../i18n/LocaleContext';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/Premium';
import './Projects.css';

// Inclinação 3D do cartão que segue o mouse + move o brilho (::after) junto. Desligado no touch.
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
// Restaura o cartão ao tirar o mouse
const untilt = (e) => { e.currentTarget.style.transform = ''; };

// Topo visual do cartão: foto real do Agrotec com véu em degradê. Outros ids retornam null (sem visual).
const ProjectVisual = ({ project, alt }) => {
  if (project.id === 'agrotec') {
    return (
      <div className="proj-visual agrotec-photo">
        <img
          src="/assets/images/agrotec.jpg"
          alt={alt}
          loading="lazy"
        />
        <span className="proj-visual-veil" aria-hidden="true" />
      </div>
    );
  }
  return null;
};

// Seção Projetos: grade de cartões vindos de projectsContent (hoje só o case real Agrotec)
const Projects = () => {
  const { t } = useLocale();
  const projectsContent = t.projects;
  return (
  <section id="projects" className="section">
    <div className="wrap">
      <Reveal variant="blur">
        <SectionHeading index={projectsContent.index} eyebrow={projectsContent.eyebrow} title={projectsContent.title} sub={projectsContent.subtitle} />
      </Reveal>
      <div className="proj-grid">
        {baseProjects.projects.map((p, i) => (
          <Reveal key={p.id} variant={i === 0 ? 'clip' : i === 1 ? 'scale' : 'fade'} delay={['d1', 'd2', 'd3'][i % 3]}>
            <article className={`card proj-card accent-${p.accent}`} onMouseMove={tilt} onMouseLeave={untilt}>
              <ProjectVisual project={p} alt={projectsContent.visualAlt} />
              <div className="proj-body">
                {/* Linha superior: número + selo de status (● no ar / ○ conceito) */}
                <div className="proj-top"><span className="mono proj-num">{p.number}</span><span className={`status ${p.status}`}>{p.status === 'live' ? projectsContent.live : projectsContent.concept}</span></div>
                <span className="readout">{projectsContent.category}</span>
                <h3>{p.name}</h3>
                <p>{projectsContent.description}</p>
                <div className="proj-tags">{p.technologies.map((t) => <span key={t} className="tag">{t}</span>)}</div>
                {/* Ações: site no ar (nova aba se http) + código no GitHub. margin-top:auto alinha os botões na base */}
                <div className="proj-actions">
                  <a href={p.link} target={p.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{p.status === 'live' ? projectsContent.openLive : projectsContent.openConcept} <ArrowUpRight size={15} /></a>
                  <a href={p.github} target="_blank" rel="noopener noreferrer" className="ghost"><FolderGit2 size={15} /> {projectsContent.code}</a>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="sec-rule" />
    </div>
  </section>
  );
};

export default Projects;
