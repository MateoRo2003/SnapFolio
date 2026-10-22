/**
 * La lámpara colgante: cuelga del borde superior de la escena, se balancea como un péndulo
 * cuando la cámara viaja o cuando la empujan, ilumina lo que se está mirando y es el
 * interruptor del tema: tirar del cordón (o tocarla) cambia entre noche y día.
 */
import * as THREE from 'three';
import { C, clay, mesh, glow, texture, Spring, clamp, lerp } from './kit.js';

const CABLE = 0.7; // largo del cable desde el punto de cuelgue
const SHADE = 0.42; // radio de la pantalla
const NIGHT = 15, DAY = 2.5; // intensidad del foco en cada tema

export function createLamp({ scene, camera, register, toggleTheme }) {
  const root = new THREE.Group();
  scene.add(root);

  const rim = -CABLE - 0.16 - SHADE; // altura del borde de la pantalla
  root.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, CABLE + 3, 8), clay(C.ink), 0, (3 - CABLE) / 2, 0));
  root.add(mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.16, 24), clay(C.ink), 0, -CABLE - 0.08, 0));

  const dome = new THREE.SphereGeometry(SHADE, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  const shade = mesh(dome, clay(C.ink), 0, rim, 0);
  const inside = new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ color: C.warm, side: THREE.BackSide }));
  inside.position.y = rim;
  inside.scale.setScalar(0.975);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), new THREE.MeshBasicMaterial({ color: C.warm }));
  bulb.position.y = rim - 0.02;
  const halo = glow(1.7);
  halo.position.copy(bulb.position);

  // el haz: un cono apenas visible que cae desde la bombita
  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(1.55, 3.4, 48, 1, true).translate(0, -1.7, 0),
    new THREE.MeshBasicMaterial({
      color: C.warm, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      map: texture(4, 128, (g) => {
        const grad = g.createLinearGradient(0, 0, 0, 128);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 4, 128);
      }),
    }),
  );
  beam.position.y = rim;
  root.add(shade, inside, bulb, halo, beam);

  // Polvo suspendido en el haz: puntos que flotan solos. Lo anima la placa de video (un uniforme de
  // tiempo), así no cuesta nada por cuadro.
  const MOTES = 140;
  const spots = new Float32Array(MOTES * 3), seeds = new Float32Array(MOTES);
  for (let i = 0; i < MOTES; i++) {
    const h = 0.35 + Math.random() * 2.9, r = Math.sqrt(Math.random()) * (h / 3.4) * 1.35, a = Math.random() * Math.PI * 2;
    spots.set([Math.cos(a) * r, rim - h, Math.sin(a) * r], i * 3);
    seeds[i] = Math.random() * 100;
  }
  const dustShape = new THREE.BufferGeometry();
  dustShape.setAttribute('position', new THREE.BufferAttribute(spots, 3));
  dustShape.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
  const dustLook = { uTime: { value: 0 }, uOpacity: { value: 1 }, uScale: { value: 1 }, uColor: { value: new THREE.Color(C.warm) } };
  const dust = new THREE.Points(dustShape, new THREE.ShaderMaterial({
    uniforms: dustLook,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float seed;
      uniform float uTime, uScale;
      varying float vTwinkle;
      void main() {
        vec3 p = position;
        float t = uTime * 0.25 + seed;
        p.x += sin(t * 1.3) * 0.12;
        p.z += cos(t * 1.1) * 0.12;
        p.y += sin(t * 0.7) * 0.18;
        vTwinkle = 0.45 + 0.55 * sin(uTime * 1.7 + seed * 3.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uScale * (3.0 + fract(seed) * 4.0) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uOpacity;
      uniform vec3 uColor;
      varying float vTwinkle;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * uOpacity * vTwinkle);
      }`,
  }));
  dust.frustumCulled = false;
  root.add(dust);

  // Una polilla: de noche da vueltas alrededor de la bombita, de día descansa arriba de la pantalla.
  const moth = new THREE.Group();
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.bezierCurveTo(0.05, 0.07, 0.13, 0.06, 0.14, 0.0);
  wingShape.bezierCurveTo(0.12, -0.05, 0.05, -0.05, 0, 0);
  const wingGeo = new THREE.ShapeGeometry(wingShape, 6);
  const wingMat = clay(0xe8dcc4, { side: THREE.DoubleSide, roughness: 1 });
  const wings = [-1, 1].map((side) => {
    const pivot = new THREE.Group();
    const w = new THREE.Mesh(wingGeo, wingMat);
    w.rotation.x = -Math.PI / 2;
    w.scale.x = side;
    pivot.add(w);
    moth.add(pivot);
    return pivot;
  });
  moth.add(mesh(new THREE.CapsuleGeometry(0.018, 0.06, 3, 6).rotateX(Math.PI / 2), clay(0x8a7660)));
  moth.scale.setScalar(0.9);
  root.add(moth);
  const perch = new THREE.Vector3(0.16, rim + SHADE * 0.93, 0.08), flyAt = new THREE.Vector3(), flyPrev = new THREE.Vector3();

  // el cordón: de acá se tira
  const pull = new THREE.Group();
  pull.position.set(0.27, rim + 0.03, 0);
  const string = mesh(new THREE.CylinderGeometry(0.007, 0.007, 1, 6).translate(0, -0.5, 0), clay(C.stone));
  const bead = mesh(new THREE.SphereGeometry(0.05, 20, 14), clay(C.amber));
  const grip = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshBasicMaterial({ visible: false }));
  pull.add(string, bead, grip);
  root.add(pull);

  // decae suave: la lámpara está cerca de lo que ilumina y con caída física lo quemaría
  const light = new THREE.SpotLight(C.warm, NIGHT, 0, 0.62, 0.9, 1);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.bias = -0.0004;
  light.shadow.radius = 6;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 30;
  scene.add(light, light.target);

  /* ---------- Interacción ---------- */

  const stretch = new Spring(0, 260, 13);
  let flick = 1; // segundos desde el último cambio de tema: hace parpadear la bombita
  const right = new THREE.Vector3();

  function toggle() {
    flick = 0;
    toggleTheme();
  }

  const shove = (dx) => {
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    bob.addScaledVector(right, dx * 0.0035 * root.scale.x);
  };

  register({
    root: grip,
    station: '*',
    cursor: 'grab',
    drag: (dx, dy, totalX, totalY) => {
      stretch.to = clamp(totalY / 150, 0, 1);
      shove(dx * 0.5);
    },
    up: () => {
      if (stretch.x > 0.35) toggle();
      stretch.to = 0;
    },
    click: toggle,
  });
  register({ root: shade, station: '*', cursor: 'grab', drag: (dx) => shove(dx), click: toggle });

  /* ---------- Péndulo ---------- */

  const DOWN = new THREE.Vector3(0, -1, 0);
  const bob = new THREE.Vector3(), prev = new THREE.Vector3(), step = new THREE.Vector3(), dir = new THREE.Vector3();
  let hung = false;

  function update({ dt, time, pivot, scale, mix, focus, still }) {
    const length = CABLE * scale;
    if (!hung || still) {
      bob.copy(pivot).y -= length;
      prev.copy(bob);
      hung = true;
    }
    step.subVectors(bob, prev).multiplyScalar(Math.exp(-2.2 * dt)).clampLength(0, length * 0.4);
    prev.copy(bob);
    bob.add(step);
    bob.y -= 22 * scale * dt * dt;

    // el cable no se estira ni se levanta más de unos 50 grados
    dir.subVectors(bob, pivot).normalize();
    if (dir.y > -0.64) {
      const k = Math.sqrt(1 - 0.64 * 0.64) / (Math.hypot(dir.x, dir.z) || 1);
      dir.set(dir.x * k, -0.64, dir.z * k);
    }
    bob.copy(pivot).addScaledVector(dir, length);

    root.position.copy(pivot);
    root.quaternion.setFromUnitVectors(DOWN, dir);
    root.scale.setScalar(scale);

    const drop = 0.46 + stretch.step(dt) * 0.42;
    string.scale.y = drop;
    bead.position.y = grip.position.y = -drop;

    // al cambiar de tema la bombita parpadea un instante antes de quedar encendida
    flick += dt;
    const on = flick < 0.07 || (flick > 0.13 && flick < 0.2) ? 0.08 : 1;
    const day = mix;
    bulb.material.color.setHex(C.warm).multiplyScalar(lerp(0.3, 1, on));
    inside.material.color.setHex(C.warm).multiplyScalar(lerp(0.12, lerp(0.95, 0.8, day), on));
    halo.material.opacity = on * lerp(0.75, 0.3, day);
    beam.material.opacity = on * lerp(0.06, 0, day);
    dustLook.uTime.value = time;
    dustLook.uOpacity.value = on * lerp(0.85, 0.12, day);
    // tamaño en pantalla de una mota de unos milímetros (0.65 = 2·tan de la mitad del campo visual)
    dustLook.uScale.value = (innerHeight * Math.min(devicePixelRatio, 1.5) / 0.65) * scale * 0.0045;
    dust.visible = day < 0.95;

    // la polilla: vuelo de noche, quieta de día
    const night = 1 - day;
    const a = time * 2.4, b = time * 3.7;
    flyAt.set(Math.cos(a) * 0.42 + Math.sin(b) * 0.06, rim - 0.28 + Math.sin(a * 0.7) * 0.14, Math.sin(a) * 0.42 + Math.cos(b * 1.3) * 0.06);
    flyPrev.copy(moth.position);
    moth.position.lerpVectors(perch, flyAt, still ? 0 : night);
    if (night > 0.5 && !still) moth.lookAt(root.localToWorld(flyAt.set(Math.cos(a + 0.4) * 0.42, flyAt.y, Math.sin(a + 0.4) * 0.42)));
    else moth.rotation.set(0, 0.6, 0);
    const flap = night > 0.5 && !still ? Math.sin(time * 38) * 0.9 : 0.15;
    wings[0].rotation.z = flap;
    wings[1].rotation.z = -flap;

    bulb.getWorldPosition(light.position);
    light.target.position.copy(focus);
    light.intensity = on * lerp(NIGHT, DAY, day);
  }

  return {
    root,
    light,
    update,
    /** parpadeo de la bombita: acompaña cada cambio de tema, venga del cordón o del menú */
    flicker() {
      flick = 0;
    },
  };
}
