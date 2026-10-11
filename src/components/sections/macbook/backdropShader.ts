import * as THREE from 'three';

// Fundo estúdio escuro + glow azul: 1 plano shader GLSL que vive como FILHO
// da câmera (camera.add(mesh)) — cobre o frame em qualquer viewport ou
// dolly (A/B/C), sem vazar borda nunca. Sem partículas, sem bloom.
// Paleta dos tokens: deep #050a14, blue #2e7cf6, ice #7dd3fc.
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uProgress;
  uniform float uDetail;

  // Ruído barato (hash + value noise) para movimento orgânico sem textura
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
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
    // Low: 1 oitava (reusa n) — metade do custo do noise em aparelho fraco
    float n2 = uDetail > 0.5 ? noise(uv * 6.0 - vec2(uTime * 0.05, uTime * 0.07)) : n;
    float glow = smoothstep(0.30, 1.0, n * 0.6 + n2 * 0.4);

    vec3 deep = vec3(0.020, 0.039, 0.078);   // #050a14
    vec3 blue = vec3(0.180, 0.486, 0.965);   // #2e7cf6
    vec3 ice  = vec3(0.490, 0.827, 0.988);   // #7dd3fc

    // Brilho segue o mouse de leve
    float md = distance(uv, vec2(m.x, 1.0 - m.y));
    float halo = smoothstep(0.70, 0.0, md) * 0.50;

    // Núcleo do estúdio: glow atrás do notebook (foco permanente, com ou sem mouse)
    float cd = distance(uv, vec2(0.5, 0.52));
    float core = smoothstep(0.75, 0.0, cd);

    vec3 col = mix(deep, blue * 0.55, glow * 0.65 + halo * 0.6);
    col += blue * core * 0.35;
    col = mix(col, ice * 0.35, smoothstep(0.55, 1.0, glow) * 0.45);

    // Vinheta (foco no notebook) + dim com o progresso do scroll (suave: não mata o glow)
    float vig = smoothstep(1.05, 0.25, cd);
    col *= mix(0.70, 1.05, vig);
    col *= mix(1.0, 0.88, uProgress);

    // Dither anti-banding (highp + 1 LSB de ruído de tela)
    float d = hash12(gl_FragCoord.xy) - 0.5;
    col += d * (1.2 / 255.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Distância câmera->fundo em unidades de mundo (dentro do far=60, bem atrás
// do notebook que fica perto da origem com a câmera em z 3..7).
const BACKDROP_DIST = 18;

export const createBackdrop = () => {
  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uProgress: { value: 0 },
    uDetail: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    depthWrite: false,
    depthTest: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  mesh.renderOrder = -10;
  // Filho da câmera: nunca sai do frame e nunca sofre culling no dolly
  mesh.frustumCulled = false;

  // Dimensiona o plano pelo frustum: cobre a viewport inteira + margem.
  // Chamar no init e em todo resize (aspect muda). O mesh deve estar sob a
  // câmera (camera.add(mesh)) antes/depois — a escala independe do pai.
  const fitToCamera = (cam: THREE.PerspectiveCamera, margin = 1.15) => {
    const fov = THREE.MathUtils.degToRad(cam.fov);
    const h = 2 * BACKDROP_DIST * Math.tan(fov / 2);
    const w = h * cam.aspect;
    mesh.scale.set(w * margin, h * margin, 1);
    mesh.position.set(0, 0, -BACKDROP_DIST);
    mesh.updateMatrix();
  };

  const setQuality = (q: 'high' | 'low') => {
    uniforms.uDetail.value = q === 'low' ? 0 : 1;
  };

  const onMouse = (e: MouseEvent) => {
    uniforms.uMouse.value.set(
      (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1,
      (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1
    );
  };
  window.addEventListener('mousemove', onMouse, { passive: true });

  return {
    mesh,
    uniforms,
    setProgress: (p: number) => { uniforms.uProgress.value = Math.max(0, Math.min(1, p)); },
    fitToCamera,
    setQuality,
    dispose: () => {
      window.removeEventListener('mousemove', onMouse);
      try { mesh.parent?.remove(mesh); } catch { /* noop */ }
      try { mesh.geometry.dispose(); } catch { /* noop */ }
      try { material.dispose(); } catch { /* noop */ }
    },
  };
};
