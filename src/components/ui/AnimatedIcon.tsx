import { Suspense, lazy, useEffect, useRef, useState } from 'react';

// O player Lottie é pesado: carrega sob demanda (lazy) para não entrar no bundle inicial
const LottieLazy = lazy(() => import('lottie-react').then((m) => ({ default: m.Lottie })));

// Cache em memória dos JSONs já baixados (evita refetch do mesmo ícone)
const cache = {};

// Ícone animado (Lottie) com fallback estático: enquanto o JSON não chega, mostra o ícone lucide.
// Props: name (arquivo /assets/lottie/{name}.json; null desliga o fetch e usa só o fallback), size, fallback, playOn ('hover' toca no hover, 'always' sempre).
// lottie-react v3: autoplay/loop são config de carga (trocar recria a animação), então hover usa lottieRef.play()/pause() sem remontar.
export const AnimatedIcon = ({ name, size = 20, className = '', fallback = null, playOn = 'hover', ...rest }) => {
  const [data, setData] = useState(() => (name ? cache[name] || null : null));
  const lottieRef = useRef(null);

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

  const always = playOn === 'always';
  const enter = () => { if (!always) { try { lottieRef.current?.play(); } catch { /* noop */ } } };
  const leave = () => { if (!always) { try { lottieRef.current?.pause(); } catch { /* noop */ } } };

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
        <LottieLazy
          lottieRef={lottieRef}
          src={data}
          autoplay={always}
          loop
          style={{ width: size, height: size }}
        />
      </Suspense>
    </span>
  );
};

export default AnimatedIcon;
