import * as THREE from 'three';

// Constrói um notebook procedural inspirado em MacBook (sem GLB externo).
// Retorna { group, lid, display, displayMat, displaySize, displayCenterWorld, keys, powerBtn, applePlane, appleMat, setAppleGlow, pressKey, setPower, setPowerTarget, updatePower, isOn, isPowerSettled, dispose }.
// Unidades em "mundo": base 3.2 x 2.2, tela 3.2 x 2.05.
export const buildMacbook = () => {
  const disposables = [];
  const track = (obj) => {
    obj.traverse((o) => {
      if (o.geometry) disposables.push(o.geometry);
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (m.map) disposables.push(m.map);
          disposables.push(m);
        });
      }
    });
    return obj;
  };

  const group = new THREE.Group();
  group.name = 'macbook';

  // Alumínio anodizado premium (Apple): grafite acetinado + clearcoat sutil.
  // EnvMap vem do RoomEnvironment da cena (scene.environment).
  // Tom escuro: o alumínio claro (#c9d1dd) estourava para branco sob key 2.6
  // + exposure 1.15 no ângulo 3/4 (visto nos prints da hero).
  // fix-topo2: topo da base ainda lavava para branco no 3/4 — grafite fecha
  // o tom (#9aa3b5->#6b7280) e roughness sobe (menos especular direto).
  const alu = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#6b7280'),
    metalness: 0.9,
    roughness: 0.5,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    envMapIntensity: 0.55,
  });
  const aluDark = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#565d6b'),
    metalness: 0.9,
    roughness: 0.45,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.7,
  });
  const black = new THREE.MeshStandardMaterial({ color: '#0b0e14', metalness: 0.2, roughness: 0.6 });
  // Teclas com backlight: emissive azul sutil aceso por baixo
  const keyMat = new THREE.MeshStandardMaterial({
    color: '#161c28',
    emissive: new THREE.Color('#2e7cf6'),
    emissiveIntensity: 0.28,
    metalness: 0.35,
    roughness: 0.5,
  });

  const roundedBox = (w, h, d, mat) => {
    // Chanfro barato: Box + bordas via bevel fake com segundo mesh ligeiramente menor.
    // Mantém leve para mobile (sem RoundedBoxGeometry externo).
    const g = new THREE.BoxGeometry(w, h, d, 1, 1, 1);
    const m = new THREE.Mesh(g, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };

  // Base de alumínio
  const BASE_W = 3.2;
  const BASE_D = 2.2;
  const BASE_H = 0.12;
  const base = roundedBox(BASE_W, BASE_H, BASE_D, alu);
  base.position.y = BASE_H / 2;
  group.add(base);

  // Rebaixo frontal (lábio para abrir a tampa)
  const lip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.04), aluDark);
  lip.position.set(0, BASE_H - 0.005, BASE_D / 2 - 0.02);
  group.add(lip);

  // Teclado: placa + teclas via InstancedMesh (~78 teclas)
  const kbW = 2.7;
  const kbD = 0.95;
  const kbPlate = new THREE.Mesh(new THREE.BoxGeometry(kbW, 0.012, kbD), black);
  kbPlate.position.set(0, BASE_H + 0.006, -0.18);
  kbPlate.receiveShadow = true;
  group.add(kbPlate);

  const rows = 5;
  const cols = 15;
  const keyW = 0.145;
  const keyD = 0.14;
  const keyH = 0.028;
  const gapX = 0.028;
  const gapY = 0.028;
  const keyGeo = new THREE.BoxGeometry(keyW, keyH, keyD);
  const keys = new THREE.InstancedMesh(keyGeo, keyMat, rows * cols);
  keys.castShadow = false;
  keys.receiveShadow = true;
  const dummy = new THREE.Object3D();
  let ki = 0;
  const keyHome = new Float32Array(rows * cols * 3);
  let spacebarId = -1;
  const totalW = cols * keyW + (cols - 1) * gapX;
  const totalD = rows * keyD + (rows - 1) * gapY;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Slot do botão power: canto superior-direito (botão dedicado abaixo)
      if (r === 0 && c === cols - 1) continue;
      // Última fileira: spacebar mais larga (pula 4 slots e coloca 1 larga)
      if (r === rows - 1 && c > 3 && c < 9) {
        if (c === 4) {
          dummy.position.set(0, BASE_H + 0.026, -0.18 + totalD / 2 - r * (keyD + gapY) - keyD / 2);
          dummy.scale.set(4.2, 1, 1);
          dummy.updateMatrix();
          keyHome[ki * 3] = dummy.position.x;
          keyHome[ki * 3 + 1] = dummy.position.y;
          keyHome[ki * 3 + 2] = dummy.position.z;
          spacebarId = ki;
          keys.setMatrixAt(ki++, dummy.matrix);
          dummy.scale.set(1, 1, 1);
        }
        continue;
      }
      const x = -totalW / 2 + c * (keyW + gapX) + keyW / 2;
      const z = -0.18 + totalD / 2 - r * (keyD + gapY) - keyD / 2;
      // Ajuste do deslocamento da spacebar na última linha
      const xFix = r === rows - 1 && c >= 9 ? x - keyW * 1.1 : x;
      dummy.position.set(xFix, BASE_H + 0.026, z);
      dummy.updateMatrix();
      if (ki < rows * cols) {
        keyHome[ki * 3] = dummy.position.x;
        keyHome[ki * 3 + 1] = dummy.position.y;
        keyHome[ki * 3 + 2] = dummy.position.z;
        keys.setMatrixAt(ki++, dummy.matrix);
      }
    }
  }
  keys.count = ki;
  keys.userData.home = keyHome;
  keys.instanceMatrix.needsUpdate = true;
  group.add(keys);

  // Botão power dedicado no slot pulado (r=0, c=cols-1):
  // x/z reusam as fórmulas do loop acima.
  const powerX = -totalW / 2 + (cols - 1) * (keyW + gapX) + keyW / 2;
  const powerZ = -0.18 + totalD / 2 - keyD / 2; // r=0
  const powerBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.03, 24),
    new THREE.MeshStandardMaterial({ color: '#0d1320', emissive: new THREE.Color('#2e7cf6'), emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.4 })
  );
  powerBtn.name = 'powerBtn';
  powerBtn.userData.isPower = true;
  powerBtn.position.set(powerX, BASE_H + 0.027, powerZ);
  group.add(powerBtn);

  // Pressiona uma tecla: dip de 0.012 por 120ms via setTimeout (sem loop novo).
  const pressKey = (id: number) => {
    if (id < 0 || id >= keys.count) return;
    const hx = keyHome[id * 3];
    const hy = keyHome[id * 3 + 1];
    const hz = keyHome[id * 3 + 2];
    dummy.position.set(hx, hy - 0.012, hz);
    dummy.scale.set(id === spacebarId ? 4.2 : 1, 1, 1);
    dummy.updateMatrix();
    keys.setMatrixAt(id, dummy.matrix);
    keys.instanceMatrix.needsUpdate = true;
    setTimeout(() => {
      dummy.position.set(hx, hy, hz);
      dummy.scale.set(id === spacebarId ? 4.2 : 1, 1, 1);
      dummy.updateMatrix();
      keys.setMatrixAt(id, dummy.matrix);
      keys.instanceMatrix.needsUpdate = true;
      dummy.scale.set(1, 1, 1);
    }, 120);
  };

  // Trackpad em vidro: superfície lisa com reflexo
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.01, 0.62),
    new THREE.MeshPhysicalMaterial({
      color: '#8f97a8',
      metalness: 0.6,
      roughness: 0.25,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 0.9,
    })
  );
  pad.position.set(0, BASE_H + 0.005, 0.68);
  pad.receiveShadow = true;
  group.add(pad);

  // Dobradiça
  const hingeGeo = new THREE.CylinderGeometry(0.055, 0.055, BASE_W * 0.92, 24);
  const hinge = new THREE.Mesh(hingeGeo, aluDark);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, BASE_H + 0.045, -BASE_D / 2 + 0.04);
  hinge.castShadow = true;
  group.add(hinge);

  // Tampa / tela
  const SCREEN_W = 3.2;
  const SCREEN_H = 2.05;
  const SCREEN_T = 0.08;
  const lid = new THREE.Group();
  lid.position.set(0, BASE_H + 0.045, -BASE_D / 2 + 0.04);

  const lidMesh = roundedBox(SCREEN_W, SCREEN_H, SCREEN_T, alu);
  // Tampa centrada: desloca para cima metade da altura
  lidMesh.position.y = SCREEN_H / 2;
  lid.add(lidMesh);

  // Bezel preto glossy frontal (quase edge-to-edge: moldura mínima de 1cm)
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(SCREEN_W - 0.02, SCREEN_H - 0.02, 0.012),
    new THREE.MeshPhysicalMaterial({
      color: '#04060b',
      metalness: 0.5,
      roughness: 0.25,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.1,
    })
  );
  bezel.position.set(0, SCREEN_H / 2, SCREEN_T / 2 + 0.002);
  lid.add(bezel);

  // Plano emissivo da tela (fundo luminoso atrás do HTML real).
  // Display quase edge-to-edge: ocupa ~98.5% da tampa para o card em "tela cheia".
  const DISPLAY_W = SCREEN_W - 0.04;
  const DISPLAY_H = SCREEN_H - 0.05;
  const displayGeo = new THREE.PlaneGeometry(DISPLAY_W, DISPLAY_H);
  const displayMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#0a1322') });
  const display = new THREE.Mesh(displayGeo, displayMat);
  display.position.set(0, SCREEN_H / 2, SCREEN_T / 2 + 0.012);
  lid.add(display);

  // Vidro sobre o display: reflexo diagonal sutil de estúdio
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(DISPLAY_W, DISPLAY_H),
    new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 0,
      roughness: 0.05,
      transmission: 0,
      transparent: true,
      opacity: 0.09,
      envMapIntensity: 1.4,
    })
  );
  glass.position.set(0, SCREEN_H / 2, SCREEN_T / 2 + 0.016);
  lid.add(glass);

  // Monograma FRD procedural (sem asset externo): canvas 1024, iniciais em
  // bold condensado do sistema + filete azul identidade + sheen metálico.
  // Preenche o canvas como o logo anterior: fonte 410px (frd-off1: 300px
  // saiu pequeno/apagado após minificação+mipmaps) + dupla passada de fill
  // para núcleo denso + backlight 56.
  // Entre display (+0.012) e vidro (+0.016): à frente do display, sem z-fight.
  const appleCanvas = document.createElement('canvas');
  appleCanvas.width = 1024;
  appleCanvas.height = 1024;
  const actx = appleCanvas.getContext('2d');
  if (actx) {
    const S = 1024;
    actx.clearRect(0, 0, S, S);
    // Gradiente metálico vertical: branco luminoso -> prata-azulado
    const metal = actx.createLinearGradient(0, S * 0.28, 0, S * 0.62);
    metal.addColorStop(0, '#ffffff');
    metal.addColorStop(0.38, '#f2f5f9');
    metal.addColorStop(0.62, '#d9e0ec');
    metal.addColorStop(0.82, '#c3ccdb');
    metal.addColorStop(1, '#aeb8c9');
    actx.fillStyle = metal;
    actx.shadowColor = 'rgba(223, 234, 255, 1)';
    actx.shadowBlur = 56;
    actx.textAlign = 'center';
    actx.textBaseline = 'middle';
    // FRD em bold condensado do sistema (vetor via fonte, sem asset externo)
    actx.font = `900 410px system-ui, 'Segoe UI', Inter, Arial, sans-serif`;
    try { (actx as any).letterSpacing = '-16px'; } catch { /* sem tracking */ }
    // Dupla passada: núcleo denso (a 2ª cobre o bleed do shadowBlur)
    actx.fillText('FRD', S / 2, S * 0.45);
    actx.shadowBlur = 0;
    actx.fillText('FRD', S / 2, S * 0.45);
    // Filete azul (identidade do site) sob as iniciais
    actx.shadowColor = 'rgba(46, 124, 246, 1)';
    actx.shadowBlur = 30;
    const barW = 560, barH = 22, barX = (S - barW) / 2, barY = S * 0.62;
    const barGrad = actx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, '#2e7cf6');
    barGrad.addColorStop(1, '#7dd3fc');
    actx.fillStyle = barGrad;
    actx.beginPath();
    if (typeof actx.roundRect === 'function') {
      actx.roundRect(barX, barY, barW, barH, barH / 2);
    } else {
      actx.rect(barX, barY, barW, barH);
    }
    actx.fill();
    // Sheen metálico só sobre o já desenhado (source-atop preserva o transparente)
    actx.shadowBlur = 0;
    actx.globalCompositeOperation = 'source-atop';
    const sheen = actx.createLinearGradient(0, S * 0.28, 0, S * 0.62);
    sheen.addColorStop(0, 'rgba(255,255,255,0.55)');
    sheen.addColorStop(0.45, 'rgba(255,255,255,0.06)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    actx.fillStyle = sheen;
    actx.fillRect(0, 0, S, S);
    actx.globalCompositeOperation = 'source-over';
  }
  const appleTex = new THREE.CanvasTexture(appleCanvas);
  try {
    appleTex.colorSpace = THREE.SRGBColorSpace;
  } catch { /* noop */ }
  try {
    appleTex.anisotropy = 8;
  } catch { /* noop */ }
  const appleSize = DISPLAY_W * 0.28;
  const appleMat = new THREE.MeshBasicMaterial({
    map: appleTex,
    transparent: true,
    opacity: 0,
    toneMapped: false,
  });
  const applePlane = new THREE.Mesh(new THREE.PlaneGeometry(appleSize, appleSize), appleMat);
  applePlane.name = 'frdLogo';
  applePlane.position.set(0, SCREEN_H / 2, SCREEN_T / 2 + 0.014);
  applePlane.visible = false;
  lid.add(applePlane);
  // Intensidade do glow (Task 3): multiplica o brilho do material.
  // v 0..1 — ajusta a cor (o mapa é multiplicado pela cor no MeshBasicMaterial).
  let glowMul = 1;
  const setAppleGlow = (v: number) => {
    glowMul = Math.max(0, Math.min(1.6, v));
    const b = 0.55 + 0.45 * Math.min(1, glowMul);
    appleMat.color.setScalar(b);
    return glowMul;
  };
  setAppleGlow(1);

  // Estado de energia com transição animada (Task 3): NUNCA mexe no DOM
  // do card (o fade do card é classe CSS no Stage). powerT 0=ligado, 1=desligado.
  // Desligar = display lerp->preto -> logo fade-in 0.8->1 + glow pulsante.
  // Toggle no meio inverte sem travar. reduced-motion usa instantâneo.
  let powerTarget = true;
  let powerT = 0;
  let offTime = 0;
  const ON_COLOR = new THREE.Color('#0a1322');
  const OFF_COLOR = new THREE.Color('#000000');
  const tmpC = new THREE.Color();
  const smooth = (x: number) => x * x * (3 - 2 * x);
  const applyPower = () => {
    const e = smooth(Math.max(0, Math.min(1, powerT)));
    displayMat.color.copy(tmpC.copy(ON_COLOR).lerp(OFF_COLOR, e));
    applePlane.visible = powerT > 0.01;
    appleMat.opacity = e;
    const s = 0.8 + 0.2 * e;
    applePlane.scale.set(s, s, 1);
    keyMat.emissiveIntensity = 0.28 + (0.05 - 0.28) * e;
  };
  applyPower();
  const setPowerTarget = (on: boolean, instant = false) => {
    powerTarget = on;
    if (instant) {
      powerT = on ? 0 : 1;
      offTime = 0;
      setAppleGlow(1);
      applyPower();
    }
    return powerTarget;
  };
  // Avança a transição; retorna true quando assentou no alvo.
  // O pulso do logo (desligado assentado) é seno suave via setAppleGlow.
  // Boot (religar): burst de glow 1->1.6->1 nos primeiros ~0.3s — o FRD
  // estoura o brilho e dissolve em fade-out enquanto o display volta.
  const updatePower = (dt: number) => {
    const step = Math.max(0, Math.min(0.05, dt)) / 0.9;
    if (powerTarget && powerT > 0) {
      powerT = Math.max(0, powerT - step);
      offTime = 0;
      const bootPhase = 1 - Math.max(0, Math.min(1, powerT / 0.33));
      setAppleGlow(1 + 0.6 * Math.sin(bootPhase * Math.PI));
      applyPower();
    } else if (!powerTarget && powerT < 1) {
      powerT = Math.min(1, powerT + step);
      if (powerT >= 1) offTime = 0;
      applyPower();
    } else if (!powerTarget) {
      // Desligado assentado: glow pulsante contínuo (amplitude pequena)
      offTime += Math.max(0, Math.min(0.05, dt));
      setAppleGlow(1 + 0.18 * Math.sin(offTime * 2.4));
    }
    return powerTarget ? powerT <= 0 : powerT >= 1;
  };
  // Compat: setPower instantâneo (palco sem animação / fallback antigo).
  const setPower = (on: boolean) => setPowerTarget(on, true);
  const isOn = () => powerTarget;
  const isPowerSettled = () => (powerTarget ? powerT <= 0 : powerT >= 1);
  // Webcam com anel de brilho — no centro da faixa superior do bezel fino
  // (DISPLAY_H = SCREEN_H - 0.05 → borda superior do display em SCREEN_H - 0.025;
  // a faixa visível do bezel é [..-0.025, ..-0.01]).
  // Reduzida para caber na faixa de 0.015: o display opaco ocluiria o resto.
  const cam = new THREE.Mesh(
    new THREE.CircleGeometry(0.008, 16),
    new THREE.MeshBasicMaterial({ color: '#1c2433' })
  );
  cam.position.set(0, SCREEN_H - 0.0175, SCREEN_T / 2 + 0.009);
  lid.add(cam);
  const camRing = new THREE.Mesh(
    new THREE.RingGeometry(0.009, 0.012, 24),
    new THREE.MeshBasicMaterial({ color: '#2e7cf6', transparent: true, opacity: 0.5 })
  );
  camRing.position.set(0, SCREEN_H - 0.0175, SCREEN_T / 2 + 0.0095);
  lid.add(camRing);

  // Abertura: ~100deg (Math.PI * 0.56 a partir da base deitada)
  // Lid parte deitado (rotX -90deg) e levanta; aqui fixamos aberto.
  const OPEN_ANGLE = -Math.PI * 0.06; // quase vertical, leve inclinação para trás
  lid.rotation.x = OPEN_ANGLE;

  group.add(lid);
  track(group);

  // Centro do display em coordenadas locais do grupo (para posicionar CSS3D)
  // Calcula via matriz após update.
  group.updateMatrixWorld(true);
  const displayCenter = new THREE.Vector3();
  display.getWorldPosition(displayCenter);
  // Converte para espaço local do grupo (grupo está na origem, então é world mesmo)
  group.worldToLocal(displayCenter.clone());

  const center = new THREE.Vector3();
  display.getWorldPosition(center);

  const dispose = () => {
    disposables.forEach((d) => {
      try {
        if (d && typeof d.dispose === 'function') d.dispose();
      } catch { /* noop */ }
    });
  };

  return {
    group,
    lid,
    display,
    displayMat,
    displaySize: { w: DISPLAY_W, h: DISPLAY_H },
    displayCenterWorld: center,
    keys,
    powerBtn,
    applePlane,
    appleMat,
    setAppleGlow,
    pressKey,
    setPower,
    setPowerTarget,
    updatePower,
    isOn,
    isPowerSettled,
    dispose,
  };
};
