/**
 * El hero: Mateo de cuerpo entero, sentado en su escritorio. Tipea en la laptop, de vez en cuando
 * toma un sorbo de café y, cuando alguien mueve el cursor, se da vuelta para mirarlo. Si lo tocan, saluda.
 * Los brazos se resuelven con un IK de dos huesos: así las manos siempre llegan a las teclas o a la taza.
 */
import * as THREE from 'three';
import { C, clay, box, mesh, texture, glow, Spring, clamp, lerp, damp, fonts } from './kit.js';

const UP = new THREE.Vector3(0, 1, 0);
const tmp = new THREE.Vector3();

// Ubica el codo de un brazo de dos huesos (a: brazo, b: antebrazo) que va del hombro a la mano,
// doblado hacia el polo. Si la mano no llega, el brazo se estira en esa dirección.
function reach(shoulder, target, a, b, pole, elbow, hand) {
  hand.subVectors(target, shoulder);
  const d = clamp(hand.length(), Math.abs(a - b) + 1e-3, a + b - 1e-3);
  hand.normalize();
  const x = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - x * x));
  elbow.subVectors(pole, shoulder);
  elbow.addScaledVector(hand, -elbow.dot(hand)).normalize().multiplyScalar(h).addScaledVector(hand, x).add(shoulder);
  hand.multiplyScalar(d).add(shoulder);
}

// una cápsula tendida entre dos puntos
function bone(m, from, to) {
  m.position.lerpVectors(from, to, 0.5);
  m.quaternion.setFromUnitVectors(UP, tmp.subVectors(to, from).normalize());
}

/** La pantalla de la laptop: un editor con código que corre solo (se desplaza la textura, no se redibuja). */
function codeScreen() {
  const map = texture(512, 1024, (g) => {
    g.fillStyle = '#1c1e24';
    g.fillRect(0, 0, 512, 1024);
    const tones = ['#c792ea', '#82aaff', '#c3e88d', '#f78c6c', '#89ddff', '#ffcb6b', '#c8c8cc'];
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    let indent = 0;
    for (let i = 0; i < 32; i++) {
      const y = i * 32 + 11;
      g.fillStyle = '#3a3e49';
      g.fillRect(16, y + 2, 16, 8);
      if (rnd() < 0.12) continue;
      let x = 50 + indent * 28;
      const words = 1 + Math.floor(rnd() * 4);
      for (let w = 0; w < words && x < 460; w++) {
        const len = Math.min(22 + rnd() * 92, 490 - x);
        g.fillStyle = tones[Math.floor(rnd() * tones.length)];
        g.beginPath();
        g.roundRect(x, y, len, 12, 6);
        g.fill();
        x += len + 12;
      }
      if (rnd() < 0.3) indent = Math.min(3, indent + 1);
      else if (rnd() < 0.3) indent = Math.max(0, indent - 1);
    }
  });
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.y = 0.42;
  return map;
}

/** Una alfombra redonda tejida en anillos, para que el escritorio no flote en la nada. */
function rugMap() {
  return texture(512, 512, (g) => {
    const rings = [[256, '#cdbfa8'], [246, '#e6dccb'], [226, '#c9714f'], [214, '#e6dccb'], [190, '#8fa68a'], [182, '#e6dccb'],
      [120, '#ddd1bd'], [70, '#d9a441'], [62, '#e6dccb']];
    for (const [r, c] of rings) {
      g.fillStyle = c;
      g.beginPath();
      g.arc(256, 256, r, 0, Math.PI * 2);
      g.fill();
    }
    // la trama: radios finos que se notan apenas
    g.strokeStyle = 'rgba(80,60,40,0.07)';
    g.lineWidth = 2;
    for (let i = 0; i < 180; i++) {
      const a = (i / 180) * Math.PI * 2;
      g.beginPath();
      g.moveTo(256 + Math.cos(a) * 30, 256 + Math.sin(a) * 30);
      g.lineTo(256 + Math.cos(a) * 254, 256 + Math.sin(a) * 254);
      g.stroke();
    }
  });
}

/** Calcomanías para la tapa de la laptop: las tecnologías de siempre y su monograma. */
function sticker(label, bg, fg, round = true) {
  return texture(160, 160, (g) => {
    g.fillStyle = '#f7f4ee';
    g.beginPath();
    if (round) g.arc(80, 80, 78, 0, Math.PI * 2);
    else g.roundRect(4, 30, 152, 100, 24);
    g.fill();
    g.fillStyle = bg;
    g.beginPath();
    if (round) g.arc(80, 80, 66, 0, Math.PI * 2);
    else g.roundRect(14, 40, 132, 80, 18);
    g.fill();
    g.fillStyle = fg;
    g.font = `700 ${label.length > 3 ? 34 : 48}px ${fonts.heading}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(label, 80, 84);
  });
}

export function createAvatar({ camera, register, tip, t }) {
  const group = new THREE.Group(); // la estación entera
  // todo el escritorio está girado: así la cámara ve a Mateo de tres cuartos, no de frente ni de espaldas
  const rig = new THREE.Group();
  rig.rotation.y = -0.7;
  group.add(rig);

  /* ---------- Alfombra, escritorio y silla ---------- */

  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.55, 72).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: rugMap(), roughness: 1 }));
  rug.position.set(0.15, 0.012, -0.25);
  rug.receiveShadow = true;
  rig.add(rug);

  const oak = clay(C.oak, { roughness: 0.62 }), walnut = clay(C.walnut, { roughness: 0.7 });
  const DESK = 1.27; // altura de la tapa del escritorio
  rig.add(mesh(box(3.4, 0.1, 1.42, 0.045), oak, 0, DESK - 0.05, 0.25));
  for (const z of [-0.38, 0.88]) rig.add(mesh(box(0.09, DESK - 0.1, 0.09, 0.03), walnut, 1.6, (DESK - 0.1) / 2, z));
  // cajonera bajo el extremo del fondo
  const drawers = new THREE.Group();
  drawers.position.set(-1.22, 0, 0.25);
  drawers.add(mesh(box(0.8, DESK - 0.1, 1.26, 0.05), clay(C.sage), 0, (DESK - 0.1) / 2, 0));
  for (let i = 0; i < 3; i++) {
    const y = 0.22 + i * 0.33;
    drawers.add(mesh(box(0.03, 0.28, 1.1, 0.012), clay(0x9db497), 0.41, y, 0), mesh(new THREE.CapsuleGeometry(0.022, 0.2, 4, 8).rotateX(Math.PI / 2), walnut, 0.44, y + 0.03, 0));
  }
  rig.add(drawers);

  const chair = new THREE.Group();
  chair.position.set(0, 0, -0.95);
  const chairFrame = clay(C.ink), cushion = clay(C.denim);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const spoke = mesh(box(0.5, 0.06, 0.09, 0.03), chairFrame, Math.cos(a) * 0.24, 0.11, Math.sin(a) * 0.24);
    spoke.rotation.y = -a;
    chair.add(spoke, mesh(new THREE.SphereGeometry(0.06, 12, 8), chairFrame, Math.cos(a) * 0.47, 0.06, Math.sin(a) * 0.47));
  }
  chair.add(
    mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.52, 12), clay(C.metal, { roughness: 0.35, metalness: 0.7 }), 0, 0.38, 0),
    mesh(box(0.98, 0.16, 0.92, 0.08), cushion, 0, 0.7, 0),
    mesh(box(0.12, 0.5, 0.06, 0.03), chairFrame, 0, 0.92, -0.47),
  );
  const backrest = mesh(box(0.94, 0.92, 0.14, 0.07), cushion, 0, 1.32, -0.53);
  backrest.rotation.x = -0.12;
  chair.add(backrest);
  rig.add(chair);

  /* ---------- La laptop: código en la pantalla y calcomanías en la tapa ---------- */

  const laptop = new THREE.Group();
  laptop.position.set(0, DESK, 0.02);
  laptop.rotation.y = -0.35; // apenas girada hacia la cámara
  const metal = clay(C.metal, { roughness: 0.35, metalness: 0.72 });
  laptop.add(mesh(box(1.22, 0.05, 0.82, 0.025), metal, 0, 0.025, 0));
  const keysMap = texture(256, 128, (g) => {
    g.fillStyle = '#2b2b2f';
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#45454b';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) g.fillRect(4 + c * 18, 6 + r * 20, 15, 16);
    g.fillRect(70, 106, 110, 16);
  });
  const keyboard = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 0.42).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: keysMap, roughness: 0.7 }));
  keyboard.position.set(0, 0.052, 0.12);
  laptop.add(keyboard);
  const lid = new THREE.Group();
  lid.position.set(0, 0.05, 0.4);
  lid.rotation.x = 0.2; // la tapa se abre hacia atrás, lejos de Mateo
  lid.add(mesh(box(1.22, 0.78, 0.035, 0.025), metal, 0, 0.39, 0));
  const code = codeScreen();
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.68), new THREE.MeshBasicMaterial({ map: code, toneMapped: false }));
  screen.position.set(0, 0.4, -0.019);
  screen.rotation.y = Math.PI; // mira hacia Mateo
  lid.add(screen);
  // la tapa vista desde atrás, que es lo que ve la cámara: calcomanías
  const stickers = [['</>', '#242427', '#f3b949', 0.27, 0.58, 0.2, 0.3], ['MR', '#c9714f', '#f7f4ee', 0.22, 0.2, -0.24, -0.2],
    ['NG', '#b4343f', '#f7f4ee', 0.17, -0.12, 0.5, 0.1], ['php', '#6f8fb5', '#f7f4ee', 0.24, -0.3, 0.32, 0, false], ['JS', '#d9a441', '#242427', 0.17, 0.42, 0.18, -0.1]];
  for (const [label, bg, fg, size, x, y, turn, round] of stickers) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: sticker(label, bg, fg, round !== false), transparent: true, roughness: 0.5 }));
    s.position.set(x, 0.39 + y, 0.019);
    s.rotation.z = turn;
    lid.add(s);
  }
  laptop.add(lid);
  rig.add(laptop);

  // la luz fría de la pantalla sobre la cara: de noche es lo que más se nota
  const screenLight = new THREE.PointLight(0xbcd2ff, 0, 2.6, 2);
  screen.add(screenLight);
  screenLight.position.set(0, 0, 0.35);

  /* ---------- Sobre el escritorio ---------- */

  const mug = new THREE.Group();
  const MUG = new THREE.Vector3(0.74, DESK, -0.12);
  mug.position.copy(MUG);
  mug.rotation.y = 2.4;
  mug.add(
    mesh(new THREE.CylinderGeometry(0.11, 0.095, 0.22, 24), clay(C.blue), 0, 0.11, 0),
    mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.01, 24), clay(0x3a2d26, { roughness: 0.25 }), 0, 0.212, 0),
    mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 18, Math.PI).rotateZ(-Math.PI / 2), clay(C.blue), 0.105, 0.115, 0),
  );
  rig.add(mug);
  // el vapor del café: tres bocanadas que suben y se desvanecen
  const puffs = [0, 1, 2].map(() => {
    const p = glow(0.22, 0xffffff);
    p.material.blending = THREE.NormalBlending;
    p.material.opacity = 0;
    rig.add(p);
    return p;
  });

  const plant = new THREE.Group();
  plant.position.set(-1.22, DESK, 0.62);
  plant.add(mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 24), clay(C.terra), 0, 0.15, 0));
  const leaves = [];
  for (let i = 0; i < 8; i++) {
    const leaf = mesh(new THREE.SphereGeometry(0.17, 14, 10).scale(0.4, 1, 0.16).translate(0, 0.17, 0), clay(i % 3 ? C.leaf : C.moss), 0, 0.27, 0);
    leaf.rotation.set(0.25 + (i % 3) * 0.24, i * 0.8, 0, 'YXZ');
    leaf.scale.setScalar(0.85 + (i % 4) * 0.14);
    leaves.push(leaf);
    plant.add(leaf);
  }
  rig.add(plant);

  // libros apilados con un lápiz encima
  const pile = new THREE.Group();
  pile.position.set(-1.15, DESK, -0.1);
  [[0.62, 0.09, 0.46, C.blue, 0.1], [0.56, 0.08, 0.42, C.mustard, -0.12], [0.5, 0.1, 0.4, C.paper, 0.05]].reduce((y, [w, h, d, color, turn]) => {
    const b = mesh(box(w, h, d, 0.02), clay(color), 0, y + h / 2, 0);
    b.rotation.y = turn;
    pile.add(b);
    return y + h;
  }, 0);
  rig.add(pile);
  // dos notas adhesivas sobre la mesa
  [[0.5, 0.52, C.mustard, 0.3], [0.78, 0.58, C.blush, -0.2]].forEach(([x, z, color, turn]) => {
    const note = mesh(box(0.2, 0.008, 0.2, 0.003, 1), clay(color), x, DESK + 0.004, z);
    note.rotation.y = turn;
    note.castShadow = false;
    rig.add(note);
  });

  /* ---------- El robot: el de las clases de robótica, al lado del escritorio ---------- */

  const robot = new THREE.Group();
  robot.position.set(-0.9, 0, 1.45);
  robot.rotation.y = 1;
  robot.scale.setScalar(0.82);
  const lightUp = clay(C.amber, { emissive: C.amber, emissiveIntensity: 1.3 });
  const top = new THREE.Group();
  top.position.y = 0.8;
  top.add(mesh(box(0.52, 0.38, 0.44, 0.13), clay(C.paper), 0, 0.2, 0));
  const antenna = mesh(new THREE.SphereGeometry(0.045, 14, 10), lightUp, 0, 0.6, 0);
  top.add(mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 8), clay(C.slate), 0, 0.48, 0), antenna);
  const visor = mesh(box(0.42, 0.2, 0.03, 0.05), clay(C.ink, { roughness: 0.3 }), 0, 0.21, 0.215);
  top.add(visor);
  robot.add(mesh(box(0.62, 0.56, 0.5, 0.15), clay(C.terra), 0, 0.5, 0), mesh(box(0.28, 0.16, 0.03, 0.02), clay(C.ink), 0, 0.52, 0.25), top);
  const robotEyes = [];
  for (const side of [-1, 1]) {
    const eye = mesh(new THREE.SphereGeometry(0.045, 14, 10), lightUp, side * 0.1, 0.21, 0.235);
    eye.castShadow = false;
    top.add(eye);
    robotEyes.push(eye);
    const arm = mesh(new THREE.CapsuleGeometry(0.055, 0.2, 4, 10), clay(C.slate), side * 0.38, 0.5, 0.04);
    arm.rotation.x = -0.35;
    robot.add(arm, mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 24).rotateZ(Math.PI / 2), clay(C.ink), side * 0.27, 0.15, 0));
  }
  rig.add(robot);

  /* ---------- Mateo ---------- */

  const body = new THREE.Group(); // origen en el piso, bajo el asiento; mira hacia +z (el escritorio)
  body.position.copy(chair.position);
  rig.add(body);

  const skin = clay(C.skin), hair = clay(C.hair), jeans = clay(C.denim, { roughness: 0.9 }), hoodie = clay(C.terra, { roughness: 0.92 });
  const shoes = clay(C.paper);

  // piernas: sentado, con los muslos hacia adelante y las canillas hacia abajo
  body.add(mesh(box(0.82, 0.3, 0.58, 0.14), jeans, 0, 0.92, -0.04));
  for (const side of [-1, 1]) {
    const hip = new THREE.Vector3(side * 0.2, 0.92, 0), knee = new THREE.Vector3(side * 0.21, 0.92, 0.48), ankle = new THREE.Vector3(side * 0.23, 0.16, 0.55);
    const thigh = mesh(new THREE.CapsuleGeometry(0.15, 0.48, 4, 12), jeans), shin = mesh(new THREE.CapsuleGeometry(0.13, 0.76, 4, 12), jeans);
    bone(thigh, hip, knee);
    bone(shin, knee, ankle);
    body.add(thigh, shin, mesh(box(0.24, 0.15, 0.42, 0.07), shoes, side * 0.23, 0.075, 0.64));
  }

  // el torso gira y se inclina por encima de la cadera: así puede darse vuelta sin mover las piernas
  const upper = new THREE.Group();
  upper.position.set(0, 0.95, -0.04);
  body.add(upper);
  const torso = mesh(box(0.9, 0.86, 0.56, 0.25, 6), hoodie, 0, 0.47, 0);
  upper.add(
    torso,
    mesh(box(0.7, 0.28, 0.28, 0.13), clay(C.clayRed), 0, 0.86, -0.27), // la capucha, caída sobre la espalda
    mesh(box(0.5, 0.2, 0.05, 0.05), clay(C.clayRed), 0, 0.2, 0.27), // el bolsillo canguro
    mesh(new THREE.CylinderGeometry(0.17, 0.18, 0.22, 20), skin, 0, 0.94, 0),
  );
  for (const side of [-1, 1]) {
    const cord = mesh(new THREE.CapsuleGeometry(0.014, 0.2, 2, 6), clay(C.paper), side * 0.09, 0.66, 0.285);
    cord.castShadow = false;
    upper.add(cord);
  }

  const head = new THREE.Group();
  head.position.set(0, 0.98, 0);
  upper.add(head);
  head.add(
    mesh(box(1.02, 1.16, 0.98, 0.43, 8), skin, 0, 0.66, 0),
    mesh(box(1.1, 0.5, 1.06, 0.24, 6), hair, 0, 1.07, -0.02),
    mesh(box(1.1, 0.78, 0.42, 0.2, 6), hair, 0, 0.82, -0.36),
  );
  const fringe = mesh(box(0.86, 0.3, 0.26, 0.13, 5), hair, 0.08, 0.93, 0.44);
  fringe.rotation.z = -0.16;
  head.add(fringe);
  const eyes = [], brows = [];
  for (const side of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.15, 20, 14), skin, side * 0.52, 0.5, 0.02);
    ear.scale.set(0.5, 1, 0.8);
    const eye = mesh(new THREE.SphereGeometry(0.075, 20, 14), clay(C.ink, { roughness: 0.3 }), side * 0.2, 0.56, 0.485);
    eye.scale.set(0.85, 1.12, 0.45);
    eye.castShadow = false;
    const brow = mesh(new THREE.CapsuleGeometry(0.022, 0.13, 4, 8), hair, side * 0.2, 0.735, 0.49);
    brow.rotation.z = Math.PI / 2 + side * 0.08;
    brow.castShadow = false;
    head.add(ear, eye, brow);
    eyes.push(eye);
    brows.push(brow);
  }
  head.add(mesh(new THREE.SphereGeometry(0.055, 16, 12), clay(0xe2c8af), 0, 0.44, 0.5));
  const SMILE = Math.PI * 0.62;
  const mouth = mesh(new THREE.TorusGeometry(0.115, 0.02, 8, 28, SMILE), clay(0xa9836f), 0, 0.37, 0.487);
  mouth.rotation.z = -Math.PI / 2 - SMILE / 2;
  mouth.castShadow = false;
  head.add(mouth);
  // un rubor apenas, para que la cara no sea de un solo color
  for (const side of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), new THREE.MeshBasicMaterial({ color: C.blush, transparent: true, opacity: 0.35, depthWrite: false }));
    cheek.position.set(side * 0.31, 0.42, 0.493);
    head.add(cheek);
  }

  // brazos: se arman cada cuadro desde el hombro hasta la mano
  const ARM = 0.52, FORE = 0.55;
  const sleeve = clay(C.terra, { roughness: 0.92 });
  const arms = [-1, 1].map((side) => {
    const arm = {
      side,
      upperArm: mesh(new THREE.CapsuleGeometry(0.12, ARM, 4, 12), sleeve),
      forearm: mesh(new THREE.CapsuleGeometry(0.105, FORE, 4, 12), sleeve),
      hand: mesh(new THREE.SphereGeometry(0.115, 16, 12), skin),
      shoulder: new THREE.Vector3(), elbow: new THREE.Vector3(), wrist: new THREE.Vector3(), aim: new THREE.Vector3(),
      // la mano viaja con un resorte por eje: los cambios de tecla o de pose no saltan
      x: new Spring(0, 170, 20), y: new Spring(0, 170, 20), z: new Spring(0, 170, 20),
      key: 0, press: 0,
    };
    body.add(arm.upperArm, arm.forearm, arm.hand);
    return arm;
  });
  const [right, left] = arms; // mirando hacia +z, la derecha queda en -x

  /* ---------- Hacia dónde mira y qué hace ---------- */

  // puntos fijos del escritorio, en el espacio del cuerpo
  rig.updateMatrixWorld(true);
  const toBody = (object, local = new THREE.Vector3()) => body.worldToLocal(object.localToWorld(local.clone()));
  const SCREEN = toBody(screen);
  const KEYS = toBody(keyboard);
  const MUG_AT = toBody(mug, new THREE.Vector3(0, 0.12, 0));
  const MOUTH = new THREE.Vector3(0.12, 2.25, 0.32);
  const WAVE = new THREE.Vector3(0.78, 2.5, 0.38);

  const yaw = new Spring(0, 50, 11), pitch = new Spring(0, 50, 11), twist = new Spring(0, 30, 10);
  const nod = new Spring(0, 190, 9), hop = new Spring(0, 240, 12), pop = new Spring(1, 110, 11);
  let blink = 2.5, glad = 0, attention = 0, noticed = 0, wave = 0, sip = -1, untilSip = 7, mugHeld = false;

  function greet() {
    wave = 2.4;
    glad = 1.4;
    hop.v = 2.6;
    nod.v = -4;
  }

  register({ root: body, station: 'avatar', cursor: 'pointer', over: () => tip(t('hi')), out: () => tip(null), click: greet });
  register({
    root: laptop,
    station: 'avatar',
    cursor: 'pointer',
    over: () => tip(t('work')),
    out: () => tip(null),
    click: () => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }),
  });

  const spin = new Spring(0, 55, 7), jump = new Spring(0, 240, 12);
  register({
    root: robot,
    station: 'avatar',
    cursor: 'pointer',
    over: () => tip(t('robot')),
    out: () => tip(null),
    click: () => {
      spin.to += Math.PI * 2;
      jump.v = 3;
    },
  });

  const look = new THREE.Vector3(), axis = new THREE.Vector3(), neck = new THREE.Vector3();
  let lastPointer = { x: 0, y: 0 };

  function update({ dt, time, pointer, still, amount, mix }) {
    if (amount('avatar') < 0.02) return;

    // cuando el cursor se mueve, Mateo levanta la vista; después de un rato vuelve a lo suyo
    if (pointer.x !== lastPointer.x || pointer.y !== lastPointer.y) noticed = 2.2;
    lastPointer = { x: pointer.x, y: pointer.y };
    noticed = Math.max(0, noticed - dt);
    wave = Math.max(0, wave - dt);
    const watching = noticed > 0 || wave > 0 ? 1 : 0;
    attention = still ? watching : damp(attention, watching, 3.2, dt);

    // a quién mira: a la pantalla o a la cámara (corrida por el cursor)
    look.copy(camera.position);
    look.addScaledVector(axis.setFromMatrixColumn(camera.matrixWorld, 0), pointer.x * 2.6);
    look.addScaledVector(axis.setFromMatrixColumn(camera.matrixWorld, 1), pointer.y * 1.6);
    body.worldToLocal(look);
    look.lerp(sip > 0.5 && sip < 2.2 ? MUG_AT : SCREEN, 1 - attention);
    neck.set(0, 1.93, -0.04);
    look.sub(neck);
    const wantYaw = clamp(Math.atan2(look.x, look.z), -1.45, 1.45);
    twist.to = clamp(wantYaw * 0.38, -0.5, 0.5);
    yaw.to = clamp(wantYaw - twist.to, -0.95, 0.95);
    pitch.to = clamp(-Math.atan2(look.y, Math.hypot(look.x, look.z)), -0.35, 0.42) + (sip > 1.1 && sip < 1.9 ? -0.25 : 0);
    if (still) {
      yaw.x = yaw.to;
      pitch.x = pitch.to;
      twist.x = twist.to;
    }
    upper.rotation.set(0.1 - attention * 0.06, twist.step(dt), 0);
    head.rotation.set(pitch.step(dt) + nod.step(dt) * 0.12, yaw.step(dt), -yaw.x * 0.08);
    body.position.y = Math.max(0, hop.step(dt) * 0.1);
    body.scale.setScalar(Math.max(0.001, pop.step(dt)));
    torso.scale.y = 1 + Math.sin(time * 1.7) * 0.012;

    blink -= dt;
    if (blink < -0.13) blink = 2.4 + Math.random() * 3;
    glad = Math.max(0, glad - dt);
    const open = glad > 0 ? 0.3 : blink < 0 ? 0.08 : 1;
    for (const eye of eyes) eye.scale.y += (1.12 * open - eye.scale.y) * Math.min(1, dt * 30);
    for (const brow of brows) brow.position.y = 0.735 + (glad > 0 ? 0.035 : 0) - pitch.x * 0.03;
    mouth.scale.setScalar(glad > 0 ? 1.18 : 1);

    // café: cada tanto, si no está mirando a nadie, toma un sorbo
    untilSip -= dt;
    if (sip < 0 && untilSip < 0 && attention < 0.2 && !still) sip = 0;
    if (sip >= 0) {
      sip += dt;
      if (sip > 2.9) {
        sip = -1;
        untilSip = 9 + Math.random() * 7;
      }
    }

    // las manos: tipean, o la izquierda saluda, o va y viene con la taza
    upper.updateMatrix();
    for (const arm of arms) {
      arm.shoulder.set(arm.side * 0.5, 0.72, 0.02).applyMatrix4(upper.matrix);
      arm.key -= dt;
      if (arm.key < 0) {
        // otra tecla: cada mano tiene su ritmo
        arm.key = 0.09 + Math.random() * 0.16;
        arm.press = 0.06;
        arm.dx = (Math.random() - 0.5) * 0.22;
        arm.dz = (Math.random() - 0.5) * 0.1;
      }
      arm.press -= dt;
      arm.aim.set(KEYS.x + arm.side * 0.24 + (arm.dx || 0), KEYS.y + 0.1 - (arm.press > 0 ? 0.035 : 0), KEYS.z - 0.04 + (arm.dz || 0));
    }
    if (wave > 0) {
      left.aim.copy(WAVE).x += Math.sin(time * 14) * 0.12;
    } else if (sip >= 0) {
      // 0–0.5 va a la taza, 0.5–1.1 la levanta, 1.1–1.9 toma, 1.9–2.5 la baja, 2.5–2.9 la suelta
      const s = sip;
      const lift = s < 0.5 ? 0 : s < 1.1 ? (s - 0.5) / 0.6 : s < 1.9 ? 1 : s < 2.5 ? 1 - (s - 1.9) / 0.6 : 0;
      mugHeld = s > 0.45 && s < 2.55;
      left.aim.lerpVectors(MUG_AT, MOUTH, lift * lift * (3 - 2 * lift));
      if (s < 0.5 || s > 2.5) left.aim.lerp(MUG_AT, 1);
    }
    for (const arm of arms) {
      if (still) {
        arm.x.x = arm.aim.x;
        arm.y.x = arm.aim.y;
        arm.z.x = arm.aim.z;
      }
      arm.x.to = arm.aim.x;
      arm.y.to = arm.aim.y;
      arm.z.to = arm.aim.z;
      arm.wrist.set(arm.x.step(dt), arm.y.step(dt), arm.z.step(dt));
      // el codo apunta hacia afuera y abajo
      neck.set(arm.side * 1.2, 0.6, -0.4).add(arm.shoulder);
      reach(arm.shoulder, arm.wrist, ARM, FORE, neck, arm.elbow, arm.aim);
      bone(arm.upperArm, arm.shoulder, arm.elbow);
      bone(arm.forearm, arm.elbow, arm.aim);
      arm.hand.position.copy(arm.aim);
    }
    // la taza va en la mano mientras toma
    if (mugHeld) {
      body.localToWorld(tmp.copy(left.hand.position));
      rig.worldToLocal(tmp);
      mug.position.set(tmp.x, tmp.y - 0.1, tmp.z);
    } else {
      mug.position.lerp(MUG, Math.min(1, dt * 12));
    }

    // vapor: sube en espiral desde la taza
    puffs.forEach((p, i) => {
      const s = (time * 0.32 + i / 3) % 1;
      p.position.set(mug.position.x + Math.sin(s * 6 + i) * 0.05, mug.position.y + 0.26 + s * 0.5, mug.position.z);
      p.scale.setScalar(0.12 + s * 0.22);
      p.material.opacity = Math.sin(Math.PI * s) * lerp(0.22, 0.12, mix);
    });

    code.offset.y = (time * 0.035) % 1;
    screenLight.intensity = lerp(1.1, 0.25, mix);
    robot.rotation.y = 1 + spin.step(dt);
    robot.position.y = Math.max(0, jump.step(dt) * 0.12);
    top.rotation.y += (pointer.x * 0.5 - top.rotation.y) * Math.min(1, dt * 4);
    antenna.material.emissiveIntensity = 1 + Math.sin(time * 3) * 0.5;
    leaves.forEach((leaf, i) => { leaf.rotation.z = Math.sin(time * 0.9 + i) * 0.04; });
  }

  return {
    group,
    update,
    laptop: screen, // la pantalla de carga vuela hasta acá
    /** aparece con un rebote al terminar la carga y saluda */
    intro() {
      pop.x = 0.001;
      pop.v = 0;
      setTimeout(greet, 900);
    },
  };
}
