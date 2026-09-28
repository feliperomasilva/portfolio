import * as THREE from 'three';

// Constrói um notebook procedural inspirado em MacBook (sem GLB externo).
// Retorna { group, screen, displaySize, displayCenter, dispose }.
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

  const alu = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#b8bfc9'),
    metalness: 0.9,
    roughness: 0.34,
  });
  const aluDark = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#8d94a0'),
    metalness: 0.85,
    roughness: 0.42,
  });
  const black = new THREE.MeshStandardMaterial({ color: '#0b0e14', metalness: 0.2, roughness: 0.6 });
  const keyMat = new THREE.MeshStandardMaterial({ color: '#141922', metalness: 0.3, roughness: 0.55 });

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
  const totalW = cols * keyW + (cols - 1) * gapX;
  const totalD = rows * keyD + (rows - 1) * gapY;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Última fileira: spacebar mais larga (pula 4 slots e coloca 1 larga)
      if (r === rows - 1 && c > 3 && c < 9) {
        if (c === 4) {
          dummy.position.set(0, BASE_H + 0.026, -0.18 + totalD / 2 - r * (keyD + gapY) - keyD / 2);
          dummy.scale.set(4.2, 1, 1);
          dummy.updateMatrix();
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
      if (ki < rows * cols) keys.setMatrixAt(ki++, dummy.matrix);
    }
  }
  keys.count = ki;
  keys.instanceMatrix.needsUpdate = true;
  group.add(keys);

  // Trackpad
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.01, 0.62),
    new THREE.MeshStandardMaterial({ color: '#aab1bd', metalness: 0.85, roughness: 0.38 })
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

  // Bezel preto frontal
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(SCREEN_W - 0.06, SCREEN_H - 0.06, 0.012),
    new THREE.MeshStandardMaterial({ color: '#05070c', metalness: 0.4, roughness: 0.5 })
  );
  bezel.position.set(0, SCREEN_H / 2, SCREEN_T / 2 + 0.002);
  lid.add(bezel);

  // Plano emissivo da tela (fundo luminoso atrás do HTML real)
  const DISPLAY_W = SCREEN_W - 0.32;
  const DISPLAY_H = SCREEN_H - 0.3;
  const displayGeo = new THREE.PlaneGeometry(DISPLAY_W, DISPLAY_H);
  const displayMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#0a1322') });
  const display = new THREE.Mesh(displayGeo, displayMat);
  display.position.set(0, SCREEN_H / 2, SCREEN_T / 2 + 0.012);
  lid.add(display);

  // Vidro sutil sobre o display
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(DISPLAY_W, DISPLAY_H),
    new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 0,
      roughness: 0.08,
      transmission: 0,
      transparent: true,
      opacity: 0.06,
    })
  );
  glass.position.set(0, SCREEN_H / 2, SCREEN_T / 2 + 0.016);
  lid.add(glass);

  // Webcam
  const cam = new THREE.Mesh(
    new THREE.CircleGeometry(0.015, 16),
    new THREE.MeshBasicMaterial({ color: '#1c2433' })
  );
  cam.position.set(0, SCREEN_H - 0.1, SCREEN_T / 2 + 0.009);
  lid.add(cam);

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
    displaySize: { w: DISPLAY_W, h: DISPLAY_H },
    displayCenterWorld: center,
    dispose,
  };
};
