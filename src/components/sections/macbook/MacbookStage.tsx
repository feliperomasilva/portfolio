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
const MacbookStage = ({ cardSlotRef, onProgress, onFallback }: any) => {
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
      renderer = new THREE.WebGLRenderer({ antialias: !mobile && !lowEnd, alpha: true, powerPreference: 'high-performance' });
    } catch { fail(); return; }
    renderer.setClearColor(0x000000, 0);
    // Task 4: pixelRatio menor (mobile 1, lowEnd 1.25) — o card é DOM (nítido),
    // só o notebook 3D suaviza um pouco.
    const maxPR = mobile ? 1 : lowEnd ? 1.25 : 1.75;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPR));
    renderer.setSize(W(), H());
    // Sombras custam caro: desligadas em aparelho fraco (mobile incluso — o chão some junto, sem erro)
    renderer.shadowMap.enabled = !lowEnd;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // fix-topo: base estourava no 3/4 — exposure 0.85->0.7 e roughness do
    // alumínio 0.32->0.42 (menos especular direto, mais acetinado).
    renderer.toneMappingExposure = 0.7;
    renderer.domElement.className = 'mb-webgl';
    mount.appendChild(renderer.domElement);

    const css = new CSS3DRenderer();
    css.setSize(W(), H());
    css.domElement.className = 'mb-css3d';
    mount.appendChild(css.domElement);

    // Cena + câmera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(mobile ? 48 : 36, W() / H(), 0.1, 60);
    scene.add(camera);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    // fix-topo2: base ainda lavada no 3/4 — key de cima bate cheio no topo.
    // Key 1.0->0.85, fill 0.9->0.55, rim 1.2->1.0, ambient 0.7->0.5.
    const key = new THREE.DirectionalLight(0xdfeaff, 0.85);
    key.position.set(4, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(lowEnd ? 512 : 1024, lowEnd ? 512 : 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.bias = -0.0004;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x7dd3fc, 0.55);
    fill.position.set(-5, 3, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x2e7cf6, 1.0);
    rim.position.set(-2, 4, -6);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0x223349, 0.5));

    // Chão: sombra suave
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.ShadowMaterial({ opacity: 0.32 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    scene.add(floor);

    // Notebook (mobile levanta só um pouco no palco alto para centralizar
    // sem descolar da sombra; o display continua perto do alvo da câmera)
    const mac = buildMacbook();
    scene.add(mac.group);
    mac.group.position.y = mobile ? 0.7 : 0.55;

    // Fundo estúdio: plano shader FILHO da câmera (sempre cobre o frame,
    // em qualquer viewport ou dolly A/B/C). fit no init + resize.
    const backdrop = createBackdrop();
    camera.add(backdrop.mesh);
    backdrop.fitToCamera(camera);
    backdrop.setQuality(lowEnd || mobile ? 'low' : 'high');

    // ---- Card real na tela via CSS3D ----
    // Preserva identidade, listeners, estado React: move o próprio nó, sem clonar.
    // Sem placeholder no DOM (o slot é gerenciado pelo React; placeholder nativo
    // confundiria a reconciliação). Guardamos pai/próximo para restaurar no cleanup.
    const originalParent = cardEl.parentNode;
    const originalNext = cardEl.nextSibling;

    // Mede o card para calibrar escala CSS3D (px -> mundo).
    // Card em "tela cheia": cover 100% + teto 102% anti-vazamento. O display é
    // 1.58 e o card wide (~1080x~680 ~= 1.59) preenche sem pilares; o teto
    // impede spill sobre o bezel.
    // ORDEM IMPORTA: a variante wide (.mb-css3d .mb-screen-card, 1080px) só
    // casa dentro do container CSS3D — por isso o nó é movido ANTES de medir.
    // Mede-se o nativo wide (não a largura do slot), congelado inline em
    // seguida para o CSS3DRenderer não refluir. Sem o move-antes-medir, o
    // inline congelava a largura do slot (~478px) e vencia a classe 1080px
    // (foi o FAIL fillW=1.36 medido com o slot congelado).
    // visibility hidden até o 1º css.render: sem isso o card cru (1080px sem
    // transform) pisca 1 frame no canto do mount (antes ficava no slot oculto).
    cardEl.classList.add('mb-screen-card');
    cardEl.style.visibility = 'hidden';
    css.domElement.appendChild(cardEl);
    const rect = cardEl.getBoundingClientRect();
    const pxW = Math.max(280, rect.width || 400);
    const pxH = Math.max(300, rect.height || 420);
    // Cover 100% + teto 1.02 (Step 2 do brief: over>0 medido na Task 3
    // com 1.04 → reduz o teto ANTES de mexer no display; uma coisa por vez).
    const scale = Math.min(
      Math.max((mac.displaySize.w * 1.0) / pxW, (mac.displaySize.h * 1.0) / pxH),
      (mac.displaySize.w * 1.02) / pxW
    );
    cardEl.style.width = `${Math.round(pxW)}px`;
    cardEl.style.visibility = '';

    const cssObj = new CSS3DObject(cardEl);
    // Escala: CSS3DRenderer usa px; convertemos para mundo
    cssObj.scale.set(scale, scale, scale);
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
    // A: 3/4 orbital | B: frontal | C: dolly-in leitura (card em tela cheia)
    // Coluna lateral: distâncias menores que o layout vertical antigo —
    // o palco é mais estreito, então a câmera chega mais perto.
    // Framing no estado A: notebook inteiro visível (mais longe + alvo no centro
    // do corpo). Nos estados B/C o alvo sobe para a tela.
    // basePos/baseTgt são a fonte da verdade do scroll (GSAP tweeta eles);
    // a câmera copia + offset de mouse por frame (sem acumular deriva).
    // Mobile: palco estreito e alto — câmera aproxima e o alvo sobe para a tela,
    // preenchendo o palco com o notebook (sem vazio acima/abaixo). O scrub
    // mantém até a leitura.
    const dist = mobile ? 7.2 : 5.8;
    const camA = mobile
      ? new THREE.Vector3(2.4, 2.4, dist)
      : new THREE.Vector3(2.9, 2.4, dist);
    const tgtA = mobile ? new THREE.Vector3(0, 1.1, 0) : new THREE.Vector3(0, 0.85, 0);
    const camB = mobile ? new THREE.Vector3(0, 1.7, dist * 0.92) : new THREE.Vector3(0, 1.6, dist * 0.95);
    const tgtB = mobile ? new THREE.Vector3(0, 1.4, 0) : new THREE.Vector3(0, 1.25, 0);
    const camC = mobile ? new THREE.Vector3(0, 1.9, 3.05) : new THREE.Vector3(0, 1.5, 2.95);
    const tgtC = mobile ? new THREE.Vector3(0, 1.6, 0) : new THREE.Vector3(0, 1.35, 0);

    const basePos = camA.clone();
    const baseTgt = tgtA.clone();
    camera.position.copy(basePos);
    camera.lookAt(baseTgt);

    // Parallax mouse com limites (não atrapalha leitura)
    // hoverX/Y dirty: o cursor do teclado é resolvido no tick (1 raycast
    // leve por frame no máximo) — sem rAF novo.
    let hoverX = 0;
    let hoverY = 0;
    let hoverDirty = false;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouse = (e) => {
      const r = mount.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2;
      mouse.ty = ((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2;
      hoverX = e.clientX;
      hoverY = e.clientY;
      hoverDirty = true;
    };
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (fine) window.addEventListener('mousemove', onMouse, { passive: true });

    // ---- Teclado interativo: raycast no mount + togglePower ----
    // OUVIR NO MOUNT (não no canvas): o .mb-webgl tem pointer-events:none e
    // o clique borbulha para o mount com coordenadas válidas — sem CSS novo.
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pickAt = (clientX, clientY) => {
      if (disposed) return null;
      const r = mount.getBoundingClientRect();
      ndc.set(
        ((clientX - r.left) / Math.max(1, r.width)) * 2 - 1,
        -((clientY - r.top) / Math.max(1, r.height)) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      // Só os 2 alvos, sem recursão (NÃO intersect recursivo no grupo: custo).
      const hits = raycaster.intersectObjects([mac.powerBtn, mac.keys], false);
      return hits.length ? hits[0] : null;
    };
    // togglePower: define o alvo da máquina de estados (Task 3) e inicia o
    // fade do card via classe (sem visibility:hidden imediato — o tick assenta
    // o estado ao fim de ~0.9s). Toggle no meio inverte sem travar.
    // fbBtn hoisted (fix I2): togglePower espelha aria-pressed no fallback DOM.
    let fbBtn = null;
    const togglePower = () => {
      const on = !mac.isOn();
      if (reduced) {
        // Movimento reduzido: transição instantânea (comportamento antigo).
        mac.setPowerTarget(on, true);
        cssObj.visible = on;
        cardEl.style.visibility = on ? '' : 'hidden';
        cardEl.classList.remove('mb-power-fade');
      } else {
        mac.setPowerTarget(on);
        cssObj.visible = true;
        cardEl.style.visibility = '';
        cardEl.classList.toggle('mb-power-fade', !on);
      }
      cardEl.style.pointerEvents = on && progress.v > 0.5 ? 'auto' : 'none';
      try { fbBtn?.setAttribute('aria-pressed', String(on)); } catch { /* noop */ }
      return on;
    };
    // Click vs drag: só dispara se mover <6px entre pointerdown e click.
    // Estado do touch (tap vs scroll): declarado aqui para onTap/onTouchEnd
    // compartilharem sem uso-antes-da-declaração.
    let downX = 0;
    let downY = 0;
    let touchT = 0;
    let touchX = 0;
    let touchY = 0;
    let touchFiredAt = 0;
    const onPointerDown = (e) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const onTap = (e) => {
      if (disposed || progress.v < 0.5) return;
      // Tap de touch já tratado no touchend: ignora o click sintético (~500ms).
      if (performance.now() - touchFiredAt < 500) return;
      if (Math.hypot(e.clientX - downX, e.clientY - downY) >= 6) return;
      const hit = pickAt(e.clientX, e.clientY);
      if (!hit) return;
      if (hit.object === mac.powerBtn || hit.object?.userData?.isPower) {
        togglePower();
        return;
      }
      // Raycast contra o InstancedMesh retorna instanceId (ids 0-69).
      if (hit.object === mac.keys && hit.instanceId !== undefined) {
        mac.pressKey(hit.instanceId);
      }
    };
    mount.addEventListener('pointerdown', onPointerDown);
    mount.addEventListener('click', onTap);

    // Touch: tap curto pressiona, arrastar faz scroll (sem impedir o padrão).
    // touchstart guarda tempo/pos; touchend só raycasta se <300ms e <10px
    // (senão deixa o scroll nativo rolar). Listeners passivos: sem preventDefault.
    const onTouchStart = (e) => {
      const t = e.changedTouches?.[0];
      if (!t) return;
      touchT = performance.now();
      touchX = t.clientX;
      touchY = t.clientY;
    };
    const onTouchEnd = (e) => {
      const t = e.changedTouches?.[0];
      if (!t || disposed || progress.v < 0.5) return;
      if (performance.now() - touchT >= 300) return;
      if (Math.hypot(t.clientX - touchX, t.clientY - touchY) >= 10) return;
      const hit = pickAt(t.clientX, t.clientY);
      if (!hit) return;
      // Marca para o onTap ignorar o click sintético que segue o touchend.
      touchFiredAt = performance.now();
      if (hit.object === mac.powerBtn || hit.object?.userData?.isPower) {
        togglePower();
        return;
      }
      if (hit.object === mac.keys && hit.instanceId !== undefined) {
        mac.pressKey(hit.instanceId);
      }
    };
    mount.addEventListener('touchstart', onTouchStart, { passive: true });
    mount.addEventListener('touchend', onTouchEnd, { passive: true });

    // Fallback a11y/teclado: botão DOM que espelha o power 3D (aceite: alterna
    // no pin 85%, onde o power 3D projeta fora do mount). Canto inferior-direito
    // do stage, invisível até :focus-visible. Criado só com palco ativo (após
    // o early-return reduced||!glOK); removido no cleanup.
    fbBtn = document.createElement('button');
    fbBtn.type = 'button';
    fbBtn.className = 'mb-power-fallback';
    fbBtn.textContent = '⏻';
    fbBtn.setAttribute('aria-label', 'Ligar/desligar tela do notebook');
    fbBtn.setAttribute('aria-pressed', 'true');
    fbBtn.setAttribute('title', 'Ligar/desligar tela');
    fbBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePower(); });
    mount.appendChild(fbBtn);

    // Scroll: master pin curto reversível (coluna lateral = pin mais curto)
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
      if (mobile) {
        // Mobile SEM pin: o hero empilhado (~1300px) é mais alto que a viewport;
        // pinar a seção inteira prendia o scroll com o notebook abaixo da dobra.
        // Em vez disso, a câmera faz scrub direto na entrada do palco na tela
        // (3/4 -> frontal -> leitura), sem travar a rolagem. Reversível.
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: mount,
            start: 'top 90%',
            end: 'top 5%',
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (disposed) return;
              progress.v = self.progress;
              // Hardening: não reabilita pointer num card com power OFF (hidden).
              cardEl.style.pointerEvents = self.progress > 0.5 && mac.isOn() ? 'auto' : 'none';
              try { mount.style.setProperty('--mb-p', self.progress.toFixed(3)); } catch { /* noop */ }
              setNavState(self.progress);
              onProgress?.(self.progress);
            },
          },
        });
        tl.to(basePos, { x: camB.x, y: camB.y, z: camB.z, duration: 0.55 }, 0);
        tl.to(baseTgt, { x: tgtB.x, y: tgtB.y, z: tgtB.z, duration: 0.55 }, 0);
        tl.to(basePos, { x: camC.x, y: camC.y, z: camC.z, duration: 0.45 }, 0.55);
        tl.to(baseTgt, { x: tgtC.x, y: tgtC.y, z: tgtC.z, duration: 0.45 }, 0.55);
        st = tl.scrollTrigger;
        cardEl.style.pointerEvents = 'none';
      } else {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: () => `+=1800`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (disposed) return;
            progress.v = self.progress;
            // Libera interatividade só quando legível (e power ligado)
            cardEl.style.pointerEvents = self.progress > 0.5 && mac.isOn() ? 'auto' : 'none';
            // Barra de progresso do pin (CSS var -> ::before do .mb-stage, sem re-render)
            try { mount.style.setProperty('--mb-p', self.progress.toFixed(3)); } catch { /* noop */ }
            setNavState(self.progress);
            onProgress?.(self.progress);
          },
          onLeave: () => {
            // Pin liberado: garante que o véu de foco não fique preso
            hero?.classList.remove('mb-focus');
          },
        },
      });
      // A->B (0..0.5): órbita para frontal. HOLD (0.5..0.65): pausa com o
      // notebook parado e legível. B->C (0.65..1): dolly-in de leitura.
      // NOTA: só câmera aqui. Nada de .cy-copy/.cy-grid neste timeline — o texto
      // da hero é dono da intro (SplitText) e o pin mexe no layout via pin-spacer;
      // um fromTo no copy dentro do timeline do pin zerava o texto (era o bug
      // da hero vazia: opacity 0 preso quando o trigger não atualizava).
      tl.to(basePos, { x: camB.x, y: camB.y, z: camB.z, duration: 0.5 }, 0);
      tl.to(baseTgt, { x: tgtB.x, y: tgtB.y, z: tgtB.z, duration: 0.5 }, 0);
      // Hold: mantém câmera parada (dolly-in só após a pausa)
      tl.to(basePos, { x: camB.x, y: camB.y, z: camB.z, duration: 0.15 }, 0.5);
      tl.to(baseTgt, { x: tgtB.x, y: tgtB.y, z: tgtB.z, duration: 0.15 }, 0.5);
      tl.to(basePos, { x: camC.x, y: camC.y, z: camC.z, duration: 0.35 }, 0.65);
      tl.to(baseTgt, { x: tgtC.x, y: tgtC.y, z: tgtC.z, duration: 0.35 }, 0.65);
      st = tl.scrollTrigger;
      // Estado inicial: card sem pointer até focar
      cardEl.style.pointerEvents = 'none';
      }
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

    // Matrix + shader: reduzem enquanto o stage está visível (economia de GPU)
    // `visible` controla o loop único abaixo (pausa render fora da tela).
    // Avisa o fundo global via frs:stage para escurecer o shader.
    let visible = true;
    let bgObs = null;
    if ('IntersectionObserver' in window && mount) {
      bgObs = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        document.body.classList.toggle('mb-stage-live', e.isIntersecting);
        try {
          window.dispatchEvent(new CustomEvent('frs:stage', { detail: { live: e.isIntersecting } }));
        } catch { /* noop */ }
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
    let frame = 0;
    let lastCamX = Infinity;
    let lastCamY = Infinity;
    let lastCamZ = Infinity;
    let lastTgtX = Infinity;
    let lastTgtY = Infinity;
    let settledFrames = 0;
    const tick = () => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      let dirty = true;
      let dt = 1 / 60;
      try {
        dt = Math.max(0.001, Math.min(0.05, clock.getDelta()));
      } catch { /* noop */ }
      const t = clock.elapsedTime || 0;
      // Task 4: backdrop uTime a 30Hz (metade dos uniforms/frame, mesma fluidez)
      if ((frame & 1) === 0) backdrop.uniforms.uTime.value = t;
      backdrop.setProgress(progress.v);
      // Task 3: avança a máquina de estados do power no delta do clock.
      // Ao assentar desligado: esconde o card (cssObj + visibility).
      try {
        const wasSettled = mac.isPowerSettled();
        mac.updatePower(reduced ? 10 : dt);
        if (!wasSettled && mac.isPowerSettled() && !mac.isOn()) {
          cssObj.visible = false;
          cardEl.style.visibility = 'hidden';
        }
      } catch { /* power nunca quebra o frame */ }
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      // Cursor do teclado: consome o dirty do pointermove (1 raycast a cada
      // 3º frame), só em fine-pointer — sem rAF novo, sem flag separada.
      if (fine && hoverDirty && (frame % 3) === 0) {
        hoverDirty = false;
        try {
          mount.classList.toggle('mb-hit', !!pickAt(hoverX, hoverY));
        } catch { /* raycast de cursor nunca quebra o frame */ }
      }
      // Aplica offset de mouse como deslocamento de posição/lookAt (não briga com ScrollTrigger)
      const ox = mouse.x * 0.28;
      const oy = mouse.y * -0.18;
      const damp = progress.v > 0.5 ? 0.4 : 1;
      camera.position.set(basePos.x + ox * damp, basePos.y + oy * damp, basePos.z);
      camera.lookAt(baseTgt.x + ox * 0.3, baseTgt.y + oy * 0.3, baseTgt.z);
      // Task 4: render sob demanda — câmera assentada + mouse parado +
      // power assentado E ligado = pula o render. Desligado nunca assenta
      // (glow do logo pulsa contínuo) — senão o pulso congelaria.
      const settled =
        Math.abs(camera.position.x - lastCamX) < 1e-4 &&
        Math.abs(camera.position.y - lastCamY) < 1e-4 &&
        Math.abs(camera.position.z - lastCamZ) < 1e-4 &&
        Math.abs(baseTgt.x - lastTgtX) < 1e-4 &&
        Math.abs(baseTgt.y - lastTgtY) < 1e-4 &&
        Math.abs(mouse.tx - mouse.x) < 1e-3 &&
        Math.abs(mouse.ty - mouse.y) < 1e-3 &&
        mac.isPowerSettled() &&
        mac.isOn();
      lastCamX = camera.position.x;
      lastCamY = camera.position.y;
      lastCamZ = camera.position.z;
      lastTgtX = baseTgt.x;
      lastTgtY = baseTgt.y;
      if (settled) {
        settledFrames += 1;
        if (settledFrames > 8) { dirty = false; }
      } else {
        settledFrames = 0;
      }
      frame += 1;
      if (!dirty) return;
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
      try { backdrop.fitToCamera(camera); } catch { /* noop */ }
      renderer.setSize(w, h);
      css.setSize(w, h);
      // fix-ultrawide: resize sem reload deixava o palco vazio — o render sob
      // demanda entendia como assentado e pulava o frame. Zera os últimos
      // conhecidos para forçar o próximo tick a renderizar.
      lastCamX = Infinity;
      lastCamY = Infinity;
      lastCamZ = Infinity;
      lastTgtX = Infinity;
      lastTgtY = Infinity;
      settledFrames = 0;
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
      mount.removeEventListener('pointerdown', onPointerDown);
      mount.removeEventListener('click', onTap);
      mount.removeEventListener('touchstart', onTouchStart);
      mount.removeEventListener('touchend', onTouchEnd);
      try { fbBtn.remove(); } catch { /* noop */ }
      try { mount.classList.remove('mb-hit'); } catch { /* noop */ }
      try { bgObs?.disconnect(); } catch { /* noop */ }
      document.body.classList.remove('mb-stage-live');
      try { st?.kill(); } catch { /* noop */ }
      try { ctx.revert(); } catch { /* noop */ }
      // Devolve o card ao DOM original, intacto (mesmo nó, mesmos listeners/estado)
      // Restauração exata: mesmo pai + mesma posição entre irmãos.
      // ORDEM IMPORTA: primeiro scene.remove(cssObj) — o CSS3DObject reage ao
      // evento 'removed' chamando element.remove() no card; se o card já
      // tivesse sido reinserido no slot, esse remove() o arrancaria de lá e
      // ele sumiria da página (ficava detached/órfão). Só DEPOIS reinserimos.
      try {
        scene.remove(cssObj);
      } catch {
        /* cena já desmontada */
      }
      try {
        cardEl.classList.remove('mb-screen-card');
        cardEl.classList.remove('mb-power-fade');
        cardEl.style.opacity = '';
        cardEl.style.pointerEvents = '';
        cardEl.style.width = '';
        cardEl.style.visibility = '';
        if (originalParent) originalParent.insertBefore(cardEl, originalNext);
      } catch { /* noop */ }
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
