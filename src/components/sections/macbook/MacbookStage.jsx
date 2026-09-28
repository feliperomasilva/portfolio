import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { canAnimate, ensureGsap } from '../../../lib/js/motion';
import { isLowEnd, isMobileViewport, prefersReducedMotion } from '../../../lib/js/device';
import { buildMacbook } from './buildMacbook';
import { createBackdrop } from './backdropShader';
import './MacbookStage.css';

// Palco 3D: notebook procedural + card real (div.cy-card.card) projetado na tela via CSS3DRenderer.
// Híbrido WebGL (notebook) + DOM interativo (card): sem canvas texture, sem clone, sem perder listeners.
// Câmera controlada pelo scroll (pin curto reversível) + parallax sutil de mouse com limites.
const MacbookStage = ({ cardSlotRef, onProgress, onFallback }) => {
  const mountRef = useRef(null);
  const failedRef = useRef(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    // Fallback = desmontar: avisa o pai uma única vez e ele remove o palco,
    // voltando ao layout normal (nunca deixa caixa vazia ocupando a hero).
    const fail = () => {
      if (failedRef.current) return;
      failedRef.current = true;
      try { onFallback?.(); } catch { /* noop */ }
    };
    const cardEl = cardSlotRef?.current?.querySelector('.cy-card');
    if (!cardEl) { fail(); return; }

    const reduced = prefersReducedMotion();
    const mobile = isMobileViewport();
    const lowEnd = isLowEnd();

    // Sem WebGL ou movimento reduzido: sem palco (card fica no fluxo normal).
    // Aparelho fraco/mobile NÃO desliga o 3D — só reduz qualidade abaixo.
    let glOK = true;
    try {
      const test = document.createElement('canvas');
      glOK = !!(window.WebGLRenderingContext && (test.getContext('webgl2') || test.getContext('webgl')));
    } catch { glOK = false; }
    if (reduced || !glOK) { fail(); return; }

    let disposed = false;
    const W = () => mount.clientWidth || 1;
    const H = () => mount.clientHeight || 1;

    // Renderers (o construtor lança se o contexto WebGL falhar na hora)
    let renderer = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
    } catch { fail(); return; }
    renderer.setClearColor(0x000000, 0);
    const maxPR = mobile ? 1.25 : lowEnd ? 1.5 : 1.75;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPR));
    renderer.setSize(W(), H());
    // Sombras custam caro: desligadas em aparelho fraco (o chão some junto, sem erro)
    renderer.shadowMap.enabled = mobile ? true : !lowEnd;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = 'mb-webgl';
    mount.appendChild(renderer.domElement);

    const css = new CSS3DRenderer();
    css.setSize(W(), H());
    css.domElement.className = 'mb-css3d';
    mount.appendChild(css.domElement);

    // Cena + câmera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(mobile ? 42 : 36, W() / H(), 0.1, 60);
    scene.add(camera);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    // Iluminação de estúdio azul
    const key = new THREE.DirectionalLight(0xdfeaff, 2.2);
    key.position.set(4, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.bias = -0.0004;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x7dd3fc, 0.7);
    fill.position.set(-5, 3, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x2e7cf6, 1.4);
    rim.position.set(-2, 4, -6);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0x223349, 0.6));

    // Chão: sombra suave
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.ShadowMaterial({ opacity: 0.32 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    scene.add(floor);

    // Notebook
    const mac = buildMacbook();
    scene.add(mac.group);
    mac.group.position.y = 0.55;

    // Fundo shader azul fluido (contido: 1 plano atrás, sem partículas/bloom)
    const backdrop = createBackdrop();
    backdrop.mesh.position.set(0, 1.6, -6.5);
    backdrop.mesh.scale.set(16, 9, 1);
    scene.add(backdrop.mesh);

    // ---- Card real na tela via CSS3D ----
    // Preserva identidade, listeners, estado React: move o próprio nó, sem clonar.
    // Sem placeholder no DOM (o slot é gerenciado pelo React; placeholder nativo
    // confundiria a reconciliação). Guardamos pai/próximo para restaurar no cleanup.
    const originalParent = cardEl.parentNode;
    const originalNext = cardEl.nextSibling;

    // Mede o card no fluxo para calibrar escala CSS3D (px -> mundo).
    // Fit por altura E largura: o card é mais alto que o display 16:10,
    // então a escala é o mínimo dos dois (carta centralizada com margens).
    const rect = cardEl.getBoundingClientRect();
    const pxW = Math.max(280, rect.width || 400);
    const pxH = Math.max(300, rect.height || 420);
    const worldPerPx = Math.min(
      mac.displaySize.w / pxW,
      mac.displaySize.h / pxH
    );
    cardEl.classList.add('mb-screen-card');
    cardEl.style.width = `${Math.round(pxW)}px`;

    const cssObj = new CSS3DObject(cardEl);
    // Escala: CSS3DRenderer usa px; convertemos para mundo
    cssObj.scale.set(worldPerPx, worldPerPx, worldPerPx);
    scene.add(cssObj);

    // Posiciona o CSS3D exatamente sobre o display (world), herdando rotação da tampa.
    // Recalcula DEPOIS de posicionar o grupo (o centro guardado no build é local).
    mac.group.updateMatrixWorld(true);
    const dc = new THREE.Vector3();
    mac.display.getWorldPosition(dc);
    cssObj.position.copy(dc);
    // Copia quaternion world do display para o card acompanhar a inclinação da tampa
    const dq = new THREE.Quaternion();
    mac.display.getWorldQuaternion(dq);
    cssObj.quaternion.copy(dq);
    // Pequeno offset para frente (evita z-fight com o vidro)
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(dq);
    cssObj.position.addScaledVector(forward, 0.012);

    // ---- Câmera: estados cinematográficos ----
    // A: 3/4 orbital | B: frontal | C: dolly-in leitura (card confortável)
    // basePos/baseTgt são a fonte da verdade do scroll (GSAP tweeta eles);
    // a câmera copia + offset de mouse por frame (sem acumular deriva).
    const dist = mobile ? 7.4 : 6.2;
    const camA = new THREE.Vector3(3.4, 2.6, dist * 0.92);
    const tgtA = new THREE.Vector3(0, 1.0, 0);
    const camB = new THREE.Vector3(0, 1.7, dist);
    const tgtB = new THREE.Vector3(0, 1.25, 0);
    const camC = new THREE.Vector3(0, 1.55, mobile ? 4.6 : 3.9);
    const tgtC = new THREE.Vector3(0, 1.35, 0);

    const basePos = camA.clone();
    const baseTgt = tgtA.clone();
    camera.position.copy(basePos);
    camera.lookAt(baseTgt);

    // Parallax mouse com limites (não atrapalha leitura)
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouse = (e) => {
      const r = mount.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2;
      mouse.ty = ((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2;
    };
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (fine) window.addEventListener('mousemove', onMouse, { passive: true });

    // Scroll: master pin curto reversível
    const gsap = ensureGsap();
    const hero = document.getElementById('showreel');
    const progress = { v: 0 };
    const ctx = gsap.context(() => {}, mount);

    const setNavState = (p) => {
      if (!hero) return;
      hero.classList.toggle('mb-focus', p > 0.55);
    };

    let st = null;
    if (hero && canAnimate()) {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: () => `+=${mobile ? 1800 : 2300}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (disposed) return;
            progress.v = self.progress;
            // Libera interatividade só quando legível
            cardEl.style.pointerEvents = self.progress > 0.5 ? 'auto' : 'none';
            setNavState(self.progress);
            onProgress?.(self.progress);
          },
          onLeave: () => {
            // Pin liberado: garante que o véu de foco não fique preso
            hero?.classList.remove('mb-focus');
          },
        },
      });
      // A->B (0..0.55): órbita para frontal. B->C (0.55..1): dolly-in leitura.
      // NOTA: só câmera aqui. Nada de .cy-copy/.cy-grid neste timeline — o texto
      // da hero é dono da intro (SplitText) e o pin mexe no layout via pin-spacer;
      // um fromTo no copy dentro do timeline do pin zerava o texto (era o bug
      // da hero vazia: opacity 0 preso quando o trigger não atualizava).
      tl.to(basePos, { x: camB.x, y: camB.y, z: camB.z, duration: 0.55 }, 0);
      tl.to(baseTgt, { x: tgtB.x, y: tgtB.y, z: tgtB.z, duration: 0.55 }, 0);
      tl.to(basePos, { x: camC.x, y: camC.y, z: camC.z, duration: 0.45 }, 0.55);
      tl.to(baseTgt, { x: tgtC.x, y: tgtC.y, z: tgtC.z, duration: 0.45 }, 0.55);
      st = tl.scrollTrigger;
      // Estado inicial: card sem pointer até focar
      cardEl.style.pointerEvents = 'none';
    } else {
      // Sem animação de scroll: posição final de leitura direta
      basePos.copy(camC);
      baseTgt.copy(tgtC);
      camera.position.copy(basePos);
      camera.lookAt(baseTgt);
      cardEl.style.pointerEvents = 'auto';
    }
    // Reversão do pin: o onUpdate do ScrollTrigger dispara ao voltar,
    // então o foco volta sozinho (mb-focus sai quando p < 0.55).

    // Matrix: reduz enquanto o stage está visível (economia de GPU)
    // `visible` controla o loop único abaixo (pausa render fora da tela).
    let visible = true;
    let bgObs = null;
    if ('IntersectionObserver' in window && mount) {
      bgObs = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        document.body.classList.toggle('mb-stage-live', e.isIntersecting);
      }, { threshold: 0.05 });
      bgObs.observe(mount);
    } else {
      document.body.classList.add('mb-stage-live');
    }

    // Loop único: lerp mouse + backdrop uTime + render sob demanda.
    // Watchdog de primeira renderização: se em 120 frames (~2s) nada foi
    // desenhado (GPU travada, shader quebrado), desmonta e devolve o card.
    let raf = 0;
    let framesDrawn = 0;
    const clock = new THREE.Clock();
    const onVis = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf && !disposed) { raf = requestAnimationFrame(tick); }
    };
    document.addEventListener('visibilitychange', onVis);

    // Desentrelaça scroll (gsap) de mouse (lerp): a câmera é recomposta
    // a cada frame a partir do estado do scroll + offset pequeno de mouse.
    const tick = () => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      const t = clock.getElapsedTime();
      backdrop.uniforms.uTime.value = t;
      backdrop.setProgress(progress.v);
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      // Aplica offset de mouse como deslocamento de posição/lookAt (não briga com ScrollTrigger)
      const ox = mouse.x * 0.28;
      const oy = mouse.y * -0.18;
      const damp = progress.v > 0.5 ? 0.4 : 1;
      camera.position.set(basePos.x + ox * damp, basePos.y + oy * damp, basePos.z);
      camera.lookAt(baseTgt.x + ox * 0.3, baseTgt.y + oy * 0.3, baseTgt.z);
      try {
        renderer.render(scene, camera);
        css.render(scene, camera);
        framesDrawn += 1;
      } catch {
        // GPU estourou no meio do loop (shader/contexto): desmonta, card volta.
        fail();
        return;
      }
      if (framesDrawn === 120 && !renderer.getContext()) { fail(); return; }
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      if (disposed) return;
      const w = W();
      const h = H();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      css.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const onLost = (e) => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; };
    const onRestored = () => { if (!disposed && !raf) raf = requestAnimationFrame(tick); };
    renderer.domElement.addEventListener('webglcontextlost', onLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', onRestored, false);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouse);
      try { bgObs?.disconnect(); } catch { /* noop */ }
      document.body.classList.remove('mb-stage-live');
      try { st?.kill(); } catch { /* noop */ }
      try { ctx.revert(); } catch { /* noop */ }
      // Devolve o card ao DOM original, intacto (mesmo nó, mesmos listeners/estado)
      // Restauração exata: mesmo pai + mesma posição entre irmãos.
      try {
        cardEl.classList.remove('mb-screen-card');
        cardEl.style.pointerEvents = '';
        cardEl.style.width = '';
        if (originalParent) originalParent.insertBefore(cardEl, originalNext);
      } catch { /* noop */ }
      try { scene.remove(cssObj); } catch { /* noop */ }
      try { mount.removeChild(renderer.domElement); } catch { /* noop */ }
      try { mount.removeChild(css.domElement); } catch { /* noop */ }
      try { mac.dispose(); } catch { /* noop */ }
      try { backdrop.dispose(); } catch { /* noop */ }
      try { floor.geometry.dispose(); floor.material.dispose(); } catch { /* noop */ }
      try { envRT.dispose(); pmrem.dispose(); } catch { /* noop */ }
      try { renderer.dispose(); } catch { /* noop */ }
      try { css.domElement.remove(); } catch { /* noop */ }
    };
  }, [cardSlotRef, onProgress, onFallback]);

  return <div className="mb-stage" ref={mountRef} aria-hidden="false" />;
};

export default MacbookStage;
