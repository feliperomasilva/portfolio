import * as THREE from 'three';

// Fundo azul fluido contido: 1 plano com shader GLSL (uTime/uMouse/uProgress).
// Sem partículas, sem bloom: gradiente + ondas suaves + vinheta.
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uProgress;

  // Ruído barato (hash + value noise) para movimento orgânico sem textura
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 uv = vUv;
    vec2 m = uMouse * 0.5 + 0.5;
    float n = noise(uv * 3.0 + vec2(uTime * 0.08, uTime * 0.05));
    float n2 = noise(uv * 6.0 - vec2(uTime * 0.05, uTime * 0.07));
    float glow = smoothstep(0.35, 1.0, n * 0.6 + n2 * 0.4);

    vec3 deep = vec3(0.020, 0.039, 0.078);   // #050a14
    vec3 blue = vec3(0.180, 0.486, 0.965);   // #2e7cf6
    vec3 ice  = vec3(0.490, 0.827, 0.988);   // #7dd3fc

    // Brilho segue o mouse de leve
    float md = distance(uv, vec2(m.x, 1.0 - m.y));
    float halo = smoothstep(0.65, 0.0, md) * 0.35;

    vec3 col = mix(deep, blue * 0.35, glow * 0.5 + halo);
    col = mix(col, ice * 0.25, smoothstep(0.6, 1.0, glow) * 0.35);

    // Escurece nas bordas (foco no notebook) e com o progresso do scroll
    float vig = smoothstep(1.05, 0.25, distance(uv, vec2(0.5, 0.55)));
    col *= mix(0.75, 1.0, vig);
    col *= mix(1.0, 0.82, uProgress);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const createBackdrop = () => {
  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uProgress: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  mesh.renderOrder = -10;

  const onMouse = (e) => {
    uniforms.uMouse.value.set(
      (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1,
      (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1
    );
  };
  window.addEventListener('mousemove', onMouse, { passive: true });

  return {
    mesh,
    uniforms,
    setProgress: (p) => { uniforms.uProgress.value = Math.max(0, Math.min(1, p)); },
    dispose: () => {
      window.removeEventListener('mousemove', onMouse);
      try { mesh.geometry.dispose(); } catch { /* noop */ }
      try { material.dispose(); } catch { /* noop */ }
    },
  };
};
