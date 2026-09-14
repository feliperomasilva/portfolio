import { Suspense, lazy, useEffect, useState } from 'react';

// O player Lottie é pesado: carrega sob demanda (lazy) para não entrar no bundle inicial
const LottieLazy = lazy(() => import('lottie-react').then((m) => ({ default: m.Lottie })));

// Cache em memória dos JSONs já baixados (evita refetch do mesmo ícone)
const cache = {};

// Ícone animado (Lottie) com fallback estático: enquanto o JSON não chega, mostra o ícone lucide.
// Props: name (arquivo /assets/lottie/{name}.json), size, fallback, playOn ('hover' toca no hover, 'always' sempre).
export const AnimatedIcon = ({ name, size = 20, className = '', fallback = null, playOn = 'hover', ...rest }) => {
  const [data, setData] = useState(() => cache[name] || null);
  const [playing, setPlaying] = useState(playOn === 'always');

  // Baixa o JSON uma vez; flag cancelled evita setState após desmontar
  useEffect(() => {
    if (!name || cache[name]) return;
    let cancelled = false;
    fetch(`/assets/lottie/${name}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json || cancelled) return;
        cache[name] = json;
        setData(json);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [name]);

  // Sem JSON ainda: renderiza o fallback (ícone estático), então nunca fica vazio
  if (!data) return fallback;

  const enter = () => { if (playOn === 'hover') setPlaying(true); };
  const leave = () => { if (playOn === 'hover') setPlaying(false); };

  return (
    <span
      className={`anim-icon ${className}`}
      style={{ display: 'inline-flex', width: size, height: size }}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
      aria-hidden="true"
      {...rest}
    >
      <Suspense fallback={fallback}>
        <LottieLazy src={data} autoplay={playing} loop={playing} style={{ width: size, height: size }} />
      </Suspense>
    </span>
  );
};

export default AnimatedIcon;
