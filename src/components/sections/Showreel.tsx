import './Showreel.css';

// Fundo da hero: VÉU PURO, sem vídeo/poster e sem personagem 3D.
// O fundo agora é o ShaderBackdrop fixo + matrix + véu em degradê
// (contraste sem fantasma). Mantém o mesmo nome para não mexer no CyberHero.
const Showreel = () => {
  return (
    <div className="showreel-bg" aria-hidden="true">
      <span className="showreel-veil" />
    </div>
  );
};

export default Showreel;
