// Fundo shader fixo na estética do site: navy #050a14, azul #2e7cf6, ice #7dd3fc.
// Substitui o personagem 3D removido. Camada fixa atrás de tudo (z -1),
// sem bloquear cliques. Leve: 1 quad fullscreen em WebGL puro (sem three.js,
// para não puxar ~600KB para o bundle inicial), DPR capado, pausa fora da
// tela/aba oculta, frame estático com reduced-motion.
import { useEffect, useRef } from 'react';
import { prefersReducedMotion, isMobileViewport } from '../../lib/js/device';

const VERT = /* glsl */ `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uDim;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 uv = vUv;
    // Mantém proporção em telas ultrawide/retrato
    uv.x *= 1.4;
    float n = noise(uv * 2.6 + vec2(uTime * 0.06, uTime * 0.04));
    float n2 = noise(uv * 5.2 - vec2(uTime * 0.04, uTime * 0.05));
    float glow = smoothstep(0.35, 1.0, n * 0.62 + n2 * 0.38);

    vec3 deep = vec3(0.020, 0.039, 0.078);   // #050a14
    vec3 blue = vec3(0.180, 0.486, 0.965);   // #2e7cf6
    vec3 ice  = vec3(0.490, 0.827, 0.988);   // #7dd3fc
    vec3 matrix = vec3(0.133, 1.0, 0.533);   // #22ff88

    vec2 m = uMouse * 0.5 + 0.5;
    float md = distance(vUv, vec2(m.x, 1.0 - m.y));
    float halo = smoothstep(0.7, 0.0, md) * 0.30;

    vec3 col = mix(deep, blue * 0.38, glow * 0.55 + halo);
    col = mix(col, ice * 0.28, smoothstep(0.62, 1.0, glow) * 0.38);
    // Fio verde matrix bem sutil nas cristas do ruído
    col = mix(col, matrix * 0.20, smoothstep(0.78, 1.0, glow) * 0.22);

    // Vinheta: foco no centro, bordas fundem no --bg-0
    float vig = smoothstep(1.15, 0.25, distance(vUv, vec2(0.5, 0.5)));
    col *= mix(0.7, 1.05, vig);
    col *= uDim;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
  const sh = gl.createShader(type);
  if (!sh) throw new Error('shader');
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error('compile');
  return sh;
};

const ShaderBackdrop = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = prefersReducedMotion();
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }) as WebGLRenderingContext | null;
    } catch {
      return;
    }
    if (!gl) return;
    const ctx = gl;

    let program: WebGLProgram;
    try {
      program = ctx.createProgram()!;
      ctx.attachShader(program, compile(ctx, ctx.VERTEX_SHADER, VERT));
      ctx.attachShader(program, compile(ctx, ctx.FRAGMENT_SHADER, FRAG));
      ctx.linkProgram(program);
      if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) throw new Error('link');
    } catch {
      return;
    }
    ctx.useProgram(program);

    // Quad fullscreen: 2 triângulos cobrindo o NDC
    const buf = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), ctx.STATIC_DRAW);
    const locPos = ctx.getAttribLocation(program, 'position');
    ctx.enableVertexAttribArray(locPos);
    ctx.vertexAttribPointer(locPos, 2, ctx.FLOAT, false, 0, 0);

    const locTime = ctx.getUniformLocation(program, 'uTime');
    const locMouse = ctx.getUniformLocation(program, 'uMouse');
    const locDim = ctx.getUniformLocation(program, 'uDim');
    let mx = 0;
    let my = 0;
    let dim = 1;

    const mobile = isMobileViewport();
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5);
    const resize = () => {
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      my = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    const draw = (t: number) => {
      ctx.uniform1f(locTime, t);
      ctx.uniform2f(locMouse, mx, my);
      ctx.uniform1f(locDim, dim);
      try { ctx.drawArrays(ctx.TRIANGLES, 0, 6); } catch { /* noop */ }
    };

    // Com o palco 3D vivo, o shader global pausa de vez (fundo dim estático) —
    // economiza um contexto WebGL inteiro no momento mais pesado da página.
    let stageLive = false;
    const onStage = (e: Event) => {
      const live = !!(e as CustomEvent).detail?.live;
      stageLive = live;
      dim = live ? 0.55 : 1;
      if (live) draw((performance.now() - t0) / 1000);
    };
    window.addEventListener('frs:stage', onStage as EventListener);

    let raf = 0;
    let disposed = false;
    const t0 = performance.now();

    if (reduced) {
      // 1 frame estático, sem loop
      draw(8.0);
    } else {
      const tick = () => {
        if (disposed) return;
        raf = requestAnimationFrame(tick);
        if (document.hidden || stageLive) return;
        draw((performance.now() - t0) / 1000);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('frs:stage', onStage as EventListener);
      try { ctx.deleteBuffer(buf); ctx.deleteProgram(program); } catch { /* noop */ }
    };
  }, []);

  return <canvas ref={ref} className="bg-shader" aria-hidden="true" />;
};

export default ShaderBackdrop;
