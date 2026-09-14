// Cabeçalho reutilizado das seções (Sobre, Habilidades, Projetos, Contato).
// Props: index (número "01"), eyebrow (rótulo pequeno), title, sub (opcional) e align (left/center).
export const SectionHeading = ({ index, eyebrow, title, sub, align = 'left' }) => (
  <div className={`sec-head-premium ${align}`}>
    {/* Linha superior: número da seção + linha decorativa + rótulo */}
    <div className="sec-index-premium">
      <span className="num mono">{index}</span>
      <span className="line-grow" aria-hidden="true" />
      <span className="readout">{eyebrow}</span>
    </div>
    <h2 className="sec-title-premium">{title}</h2>
    {/* O subtítulo só aparece se for passado */}
    {sub ? <p className="sec-sub-premium">{sub}</p> : null}
  </div>
);

export default SectionHeading;
