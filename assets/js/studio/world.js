/**
 * El mundo: una mesa de estudio sin bordes con una estación por sección. La cámara viaja de una
 * a otra con el scroll, el contenido va en paneles a un costado y la escena ocupa el otro.
 * El lienzo es transparente: el fondo es el de la página, así el 3D siempre coincide con el tema.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { C, clamp, lerp, smooth, damp, texture } from './kit.js';
import { createLamp } from './lamp.js';
import { createAvatar } from './avatar.js';
import { createKeyboard, createShowcase, createStairs, createCerts, createClients, createBooks, createMail } from './stations.js';

// Recorrido: qué estación mira cada sección y desde dónde. cam y look son relativos a la estación;
// span y tall son el ancho y el alto que tienen que entrar en cuadro.
const TOUR = [
  { id: 'hero', at: 'avatar', cam: [1.4, 3, 7.6], look: [0.15, 1.4, 0], span: 5.7, tall: 3.6, hint: 'lamp' },
  // de frente, más cerca: un retrato con la laptop y sus calcomanías
  { id: 'about', at: 'avatar', cam: [-3.6, 3, 3.9], look: [0.2, 1.75, -0.3], span: 4.8, tall: 3.9, lamp: -0.34, hint: 'desk' },
  { id: 'stats', at: 'certs', cam: [0, 1.9, 7], look: [0, 1.45, 0], span: 5.6, tall: 3.4, hint: 'certs' },
  { id: 'skills', at: 'keyboard', cam: [0, 5.6, 5.6], look: [0, 0.2, 0.3], span: 6.8, tall: 4.4, lamp: 0.36, hint: 'keys' },
  { id: 'github-contributions', at: 'keyboard', cam: [2.6, 3.4, 6.6], look: [0, 0.3, 0], span: 7, tall: 3.6, lamp: 0.36 },
  { id: 'resume', at: 'stairs', cam: [0.6, 2.8, 8.4], look: [0, 1, 0], span: 6, tall: 3, hint: 'ball' },
  { id: 'portfolio', at: 'showcase', cam: [0.4, 2, 7.6], look: [0.3, 1, 0], span: 5.6, tall: 3, hint: 'turn' },
  { id: 'clientes', at: 'clients', cam: [0, 2.3, 8], look: [0, 1, 0], span: 6.4, tall: 3, hint: 'spin' },
  { id: 'blog', at: 'books', cam: [0.8, 2.2, 6], look: [0, 0.8, 0], span: 3.8, tall: 2.6, hint: 'books' },
  { id: 'contact', at: 'mail', cam: [0, 1.9, 6.6], look: [0, 1.15, 0], span: 4, tall: 3.4, hint: 'plane' },
];
const PLACE = {
  avatar: [0, 0, 0], certs: [8, 0, -0.5], keyboard: [18, 0, 0], stairs: [29, 0, 0],
  showcase: [40, 0, 0], clients: [51, 0, 0], books: [61, 0, 0], mail: [70, 0, 0],
};
const FOV = 36, TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

export function createWorld({ mount, t, theme, toggleTheme }) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lite = matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 700;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  // Resolución adaptable: en escritorio arranca en 1x (con antialiasing alcanza), sube una sola vez
  // si el equipo va sobrado y baja de a pasos cuando los cuadros no llegan a tiempo.
  // Las gráficas integradas ni lo intentan: probar la resolución alta les cuesta un par de tirones para nada.
  const gl = renderer.getContext();
  const gpu = gl.getExtension('WEBGL_debug_renderer_info') ? gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL) : '';
  const modest = lite || /Intel(?!.*Arc)|SwiftShader|llvmpipe|Microsoft Basic/i.test(gpu);
  const BASE = Math.min(devicePixelRatio, lite ? 1.5 : 1), TOP = modest ? BASE : Math.min(devicePixelRatio, 1.5), FLOOR = 0.6;
  let ratio = BASE;
  renderer.setPixelRatio(ratio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.autoUpdate = false; // las sombras se recalculan cuadro por medio (ver frame)
  const canvas = renderer.domElement;
  mount.append(canvas);

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);

  // de día ilumina el sol; de noche, la lámpara
  const sun = new THREE.DirectionalLight(0xfff5e6, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(1024);
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 4;
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 32 });
  scene.add(sun, sun.target);

  // El piso es una mesa de madera que se pierde en la penumbra. Se desvanece alrededor de lo que se mira
  // (un shader corta su opacidad con la distancia), así no tiene bordes y el fondo sigue siendo el de la página.
  const wood = texture(1024, 1024, (g) => {
    const tones = ['#a07650', '#ac825a', '#97704c', '#a67b53', '#9b7350', '#b0865e', '#a27852', '#99714d'];
    let seed = 5;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    tones.forEach((tone, i) => {
      const y = i * 128;
      g.fillStyle = tone;
      g.fillRect(0, y, 1024, 128);
      // la veta: líneas finas onduladas, apenas más oscuras o más claras
      for (let l = 0; l < 26; l++) {
        const base = y + rnd() * 128, amp = 1 + rnd() * 4, freq = 0.004 + rnd() * 0.01, phase = rnd() * 6;
        g.strokeStyle = rnd() < 0.5 ? 'rgba(60,38,20,0.16)' : 'rgba(255,235,205,0.08)';
        g.lineWidth = 0.6 + rnd() * 1.6;
        g.beginPath();
        for (let x = 0; x <= 1024; x += 16) g.lineTo(x, base + Math.sin(x * freq + phase) * amp);
        g.stroke();
      }
      // junta entre tablas y un corte en algún punto del largo
      g.fillStyle = 'rgba(40,24,12,0.45)';
      g.fillRect(0, y, 1024, 2);
      g.fillRect(Math.floor(rnd() * 900) + 60, y, 2, 128);
    });
  });
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  wood.repeat.set(30, 11);
  // La madera no calcula luces (con cuatro luces y media pantalla de piso era lo más caro de cada cuadro):
  // se pinta con el charco de la lámpara de noche y con luz pareja de día. Las sombras van en una capa aparte,
  // que solo las recibe. Las dos se desvanecen alrededor de lo que se mira.
  const floorLook = {
    uFocus: { value: new THREE.Vector3() }, uRadius: { value: 9 },
    uBeam: { value: new THREE.Vector3() }, uPool: { value: 4.6 }, uDay: { value: 0 }, uWarm: { value: new THREE.Color(C.warm) },
  };
  const VARY = 'varying vec3 vFloor;\nuniform vec3 uFocus;\nuniform float uRadius;';
  const FADE = '\ngl_FragColor.a *= 1.0 - smoothstep(uRadius * 0.3, uRadius, distance(vFloor.xz, uFocus.xz));';
  const faded = (material, fragment = (f) => f) => {
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, floorLook);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vFloor;')
        .replace('#include <project_vertex>', '#include <project_vertex>\nvFloor = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      shader.fragmentShader = fragment(shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${VARY}`)
        .replace('#include <dithering_fragment>', `#include <dithering_fragment>${FADE}`));
    };
    return material;
  };
  const plank = faded(new THREE.MeshBasicMaterial({ map: wood, transparent: true }), (f) => f
    .replace('#include <common>', '#include <common>\nuniform vec3 uBeam, uWarm;\nuniform float uPool, uDay;')
    .replace('#include <map_fragment>', `#include <map_fragment>
      float pool = 1.0 - smoothstep(0.0, uPool, distance(vFloor.xz, uBeam.xz));
      diffuseColor.rgb *= mix(vec3(0.06) + uWarm * pool * pool * 1.7, vec3(0.93, 0.89, 0.83), uDay);`));
  const plane = new THREE.PlaneGeometry(320, 120).rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(plane, plank);
  const shade = new THREE.Mesh(plane, faded(new THREE.ShadowMaterial({ opacity: 0.55, depthWrite: false })));
  ground.position.x = shade.position.x = 35;
  shade.position.y = 0.002;
  shade.receiveShadow = true;
  shade.renderOrder = 1;

  // contraluz fría de noche: recorta las siluetas contra el fondo oscuro (la lámpara es la luz cálida de frente)
  const rim = new THREE.DirectionalLight(C.night, 0);
  scene.add(rim, rim.target);
  scene.add(ground, shade);

  /* ---------- Globo de texto y pista ---------- */

  const tipEl = Object.assign(document.createElement('div'), { className: 'stage-tip' });
  const hintEl = Object.assign(document.createElement('div'), { className: 'stage-hint' });
  document.body.append(tipEl, hintEl);
  const tip = (text) => {
    if (text) tipEl.textContent = text;
    tipEl.classList.toggle('is-on', !!text);
  };

  /* ---------- Estaciones ---------- */

  const interactives = [];
  const ctx = {
    scene, camera, t, tip, toggleTheme,
    register(item) {
      item.root.userData.hit = item;
      interactives.push(item);
    },
  };
  const lamp = createLamp(ctx);
  const avatar = createAvatar(ctx);
  const stations = {
    avatar, certs: createCerts(ctx), keyboard: createKeyboard(ctx), stairs: createStairs(ctx),
    showcase: createShowcase(ctx), clients: createClients(ctx), books: createBooks(ctx), mail: createMail(ctx),
  };
  for (const [name, station] of Object.entries(stations)) {
    station.group.position.fromArray(PLACE[name]);
    scene.add(station.group);
  }

  // Solo una luz proyecta sombras a la vez: de día el sol, de noche la lámpara (en móviles, siempre el sol).
  function castFrom(day) {
    sun.castShadow = day || lite;
    lamp.light.castShadow = !day && !lite;
  }
  // Los dos repartos se compilan ahora, durante la carga: así cambiar de tema no frena compilando shaders.
  for (const day of [theme !== 'light', theme === 'light']) {
    castFrom(day);
    renderer.compile(scene, camera);
  }

  /* ---------- Medidas: dónde cae cada sección en el scroll y cuánto lugar le queda a la escena ---------- */

  const tour = TOUR.map((stop) => ({ ...stop, el: document.getElementById(stop.id) })).filter((stop) => stop.el);
  let vw = 1, vh = 1, sized = false;

  // Un panel más bajo que la pantalla pasaba de largo: la cámara llegaba a su estación y el texto ya
  // se había ido arriba de todo. Ahora queda fijo en el medio (sticky) mientras se recorre un tramo extra.
  function pin() {
    const desktop = vw >= 1200;
    for (const stop of tour) {
      if (stop.id === 'hero') continue;
      const el = stop.el;
      let track = el.parentElement.classList.contains('panel-track') ? el.parentElement : null;
      const short = desktop && el.offsetHeight < vh * 0.84;
      if (short && !track) {
        track = document.createElement('div');
        track.className = 'panel-track';
        el.before(track);
        track.append(el);
      }
      if (!track) continue;
      track.classList.toggle('is-pinned', short);
      track.style.setProperty('--dwell', `${short ? Math.round(vh * 0.5) : 0}px`);
      el.style.setProperty('--pin', `${Math.max(16, Math.round((vh - el.offsetHeight) / 2))}px`);
    }
  }

  function measure() {
    if (!sized) return;
    pin();
    tour.forEach((stop, i) => {
      const box = stop.el.getBoundingClientRect();
      // en vertical cuenta el tramo entero (con el panel fijo adentro); en horizontal, el panel
      const span = (stop.el.closest('.panel-track') || stop.el).getBoundingClientRect();
      const top = span.top + scrollY;
      stop.arrive = i ? top - vh * 0.45 : 0;
      stop.leave = Math.max(stop.arrive, top + span.height - vh * 0.55);

      const beside = vw >= 1200 && box.width < vw * 0.7;
      let room = vw / vh, frame = i ? 0.4 : 0.48;
      if (beside) {
        // panel a un lado: la escena se centra en el espacio que queda del otro
        const panelLeft = box.left + box.width / 2 < vw / 2;
        const from = panelLeft ? box.right : 96, to = panelLeft ? vw : box.left;
        stop.offX = (from + to) / 2 - vw / 2;
        stop.offY = 0;
        room = (to - from) / vh;
        frame = 0.72;
      } else {
        // panel a todo el ancho: la escena se ve en la ventana que queda arriba de cada sección
        stop.offX = 0;
        stop.offY = (i ? -0.24 : 0.15) * vh;
      }
      const reach = Math.hypot(stop.cam[0] - stop.look[0], stop.cam[1] - stop.look[1], stop.cam[2] - stop.look[2]);
      stop.far = Math.max(1, stop.span / (2 * TAN * room * reach), stop.tall / (2 * TAN * frame * reach));
      stop.beside = beside;
    });
  }

  function resize() {
    // una pestaña recién abierta en segundo plano puede medir cero: se espera al próximo aviso
    if (!innerWidth || !innerHeight) return;
    vw = innerWidth;
    vh = innerHeight;
    sized = true;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    measure();
  }

  addEventListener('resize', resize);
  let queued = false;
  new ResizeObserver(() => {
    if (queued) return;
    queued = true;
    setTimeout(() => {
      queued = false;
      measure();
    }, 120);
  }).observe(document.body);

  /* ---------- Puntero ---------- */

  const pointer = { x: 0, y: 0, over: false, moved: false };
  const raycaster = new THREE.Raycaster();
  const amounts = {};
  let hover = null, drag = null, idle = 0; // idle: segundos sin que nada se mueva

  function pick() {
    raycaster.setFromCamera(pointer, camera);
    const roots = interactives.filter((it) => it.station === '*' || amounts[it.station] > 0.5).map((it) => it.root);
    for (const hit of raycaster.intersectObjects(roots, true)) {
      for (let o = hit.object; o; o = o.parent) if (o.userData.hit) return o.userData.hit;
    }
    return null;
  }

  function setHover(next) {
    if (next === hover) return;
    hover?.out?.();
    hover = next;
    hover?.over?.();
    canvas.style.cursor = hover?.cursor || '';
  }

  function track(e) {
    pointer.x = (e.clientX / vw) * 2 - 1;
    pointer.y = 1 - (e.clientY / vh) * 2;
    pointer.over = e.target === canvas;
    pointer.moved = true;
    idle = 0;
    tipEl.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 18}px)`;
  }

  addEventListener('pointermove', (e) => {
    track(e);
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    drag.item.drag?.(dx, dy, e.clientX - drag.startX, e.clientY - drag.startY);
  }, { passive: true });

  canvas.addEventListener('pointerdown', (e) => {
    track(e);
    setHover(pick()); // en táctil no hay hover previo
    if (!hover) return;
    drag = { item: hover, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: 0 };
    canvas.setPointerCapture(e.pointerId);
    if (hover.cursor === 'grab') canvas.style.cursor = 'grabbing';
    hover.down?.();
  });

  function release(e) {
    if (!drag) return;
    const { item, moved } = drag;
    drag = null;
    item.up?.();
    if (e.type === 'pointerup' && moved < 7) item.click?.();
    canvas.style.cursor = hover?.cursor || '';
    if (e.pointerType !== 'mouse') setHover(null);
  }

  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => {
    pointer.over = false;
    if (!drag) setHover(null);
  });

  /* ---------- Cuadro ---------- */

  const state = { dt: 0, time: 0, mix: 0, pointer, still, amount: (name) => amounts[name] || 0 };
  const from = new THREE.Vector3(), to = new THREE.Vector3(), lookFrom = new THREE.Vector3(), lookTo = new THREE.Vector3();
  let aimed = false;
  const beam = new THREE.Vector3(), eye = new THREE.Vector3(), look = new THREE.Vector3(), pivot = new THREE.Vector3(), ray = new THREE.Vector3(), side = new THREE.Vector3();
  let k = 0, hold = 0, mix = theme === 'light' ? 1 : 0, mixTo = mix, intro = 1;
  let before = performance.now(), hintKey = null, hintLeft = -1, frames = 0, snap = true, onReady;
  let skipped = false, carry = 0; // cuadro salteado en reposo y el tiempo que dejó pendiente

  // de dónde mira una parada, ya alejada lo necesario para que su estación entre en cuadro
  function pose(stop, outEye, outLook) {
    const [x, y, z] = PLACE[stop.at];
    outLook.set(x + stop.look[0], y + stop.look[1], z + stop.look[2]);
    outEye.set(x + stop.cam[0], y + stop.cam[1], z + stop.cam[2]).sub(outLook).multiplyScalar(stop.far).add(outLook);
  }

  // Mide cuánto tardan los cuadros mientras hay movimiento y ajusta la resolución del lienzo.
  let pace = 16.7, paced = 0, tried = false;
  function tune(ms) {
    if (ms > 100) return; // un salto así es un cambio de pestaña, no un cuadro lento
    pace += (ms - pace) * 0.1;
    if (++paced < 40) return;
    let next = ratio;
    if (ratio > BASE && pace > 19.5) next = BASE; // la resolución alta solo se queda si no cuesta fluidez
    else if (pace > 25) next = Math.max(FLOOR, ratio - 0.15);
    else if (pace < 18.5 && !tried && paced > 150) next = TOP;
    else return;
    tried = true; // se prueba subir una sola vez: si no aguantó, no se insiste
    paced = 0;
    pace = 16.7;
    if (next === ratio) return;
    ratio = next;
    renderer.setPixelRatio(ratio);
    renderer.setSize(vw, vh, false);
  }

  // ?fps en la dirección muestra un medidor: cuadros por segundo y resolución en uso
  const meter = new URLSearchParams(location.search).has('fps') ? document.createElement('div') : null;
  if (meter) {
    window.__studio = { renderer, scene, camera, ground, shade, rim, sun, lamp, stations }; // para medir desde la consola
    meter.style.cssText = 'position:fixed;top:8px;right:8px;z-index:9999;font:12px/1.4 monospace;color:#fff;background:#000c;padding:4px 8px;border-radius:6px;pointer-events:none';
    document.body.append(meter);
  }
  let rendered = 0, since = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    const elapsed = Math.min(0.05, (now - before) / 1000);
    before = now;
    if (!sized) return;

    // posición en el recorrido: entera mientras se lee una sección, fraccionaria en el viaje a la siguiente
    const y = scrollY;
    let target = tour.length - 1, progress = 1;
    for (let i = 0; i < tour.length; i++) {
      const stop = tour[i], next = tour[i + 1];
      if (y <= stop.leave || !next) {
        target = i;
        progress = clamp((y - stop.arrive) / Math.max(1, stop.leave - stop.arrive), 0, 1);
        break;
      }
      if (y < next.arrive) {
        target = i + (y - stop.leave) / (next.arrive - stop.leave);
        break;
      }
    }
    // En reposo (nada se desplaza y el cursor está quieto) alcanza con la mitad de los cuadros:
    // las animaciones de fondo se ven igual y el equipo trabaja la mitad.
    const moving = snap || intro < 1 || Math.abs(target - k) > 0.002 || Math.abs(mixTo - mix) > 0.002;
    idle = moving ? 0 : idle + elapsed;
    const calm = idle > 1.2 && !drag;
    if (calm && (skipped = !skipped)) {
      carry = elapsed;
      return;
    }
    const dt = state.dt = Math.min(0.05, elapsed + carry);
    carry = 0;
    if (!calm) tune(elapsed * 1000);
    state.time += still ? 0 : dt;

    // el primer cuadro arranca ya parado en la sección donde quedó el scroll
    k = still || snap ? target : damp(k, target, 6, dt);
    hold = still || snap ? progress : damp(hold, progress, 4, dt);
    snap = false;
    mix = state.mix = still ? mixTo : damp(mix, mixTo, 3.4, dt);
    intro = Math.min(1, intro + dt / 1.8);

    const i = clamp(Math.floor(k), 0, Math.max(0, tour.length - 2));
    const a = tour[i], b = tour[i + 1] || a;
    const f = clamp(k - i, 0, 1), e = f * f * (3 - 2 * f);
    pose(a, from, lookFrom);
    pose(b, to, lookTo);
    eye.lerpVectors(from, to, e);
    look.lerpVectors(lookFrom, lookTo, e);
    // entre estaciones la cámara se levanta y se aleja un poco, como un salto
    const leap = Math.min(1, from.distanceTo(to) / 9) * Math.sin(Math.PI * e);
    eye.y += leap * 0.8;
    eye.z += leap * 2.4;
    // mientras se lee una sección deriva despacio, y acompaña apenas al cursor
    eye.x += (hold - 0.5) * 0.9 * (1 - e) + (lite ? 0 : pointer.x * 0.2);
    eye.y += lite ? 0 : pointer.y * 0.1;
    eye.z += (1 - smooth(0, 1, intro)) * 3.2;

    const offX = lerp(a.offX, b.offX, e), offY = lerp(a.offY, b.offY, e);
    camera.position.copy(eye);
    camera.lookAt(look);
    camera.setViewOffset(vw, vh, -offX, -offY, vw, vh);
    camera.updateMatrixWorld();

    for (const name in stations) amounts[name] = 0;
    tour.forEach((stop, j) => { amounts[stop.at] = Math.max(amounts[stop.at], 1 - smooth(0, 1, Math.abs(k - j))); });
    // las estaciones lejanas ni se dibujan: tampoco entran en la pasada de sombras
    for (const name in stations) stations[name].group.visible = amounts[name] > 0;

    // la lámpara cuelga del borde superior, arriba de lo que se mira
    const reach = eye.distanceTo(look);
    const beside = a.beside && b.beside;
    // (alguna estación la corre al costado para que no tape lo que muestra)
    const aside = beside ? lerp(a.lamp ?? -0.05, b.lamp ?? -0.05, e) : 0.62;
    ray.set((2 * offX) / vw + aside, 1.02, 0.5).unproject(camera).sub(eye).normalize();
    pivot.copy(eye).addScaledVector(ray, reach - 1.2);
    // la luz apunta a lo que la estación quiera mostrar (un certificado, un escalón) o, si no, al centro
    const wants = stations[tour[Math.round(k)].at].spot?.() || look;
    if (!aimed || still) beam.copy(wants);
    else beam.lerp(wants, 1 - Math.exp(-5 * dt));
    aimed = true;
    floorLook.uBeam.value.copy(beam);
    lamp.update({ dt, time: state.time, pivot, scale: (reach - 1.2) * (beside ? 0.092 : 0.052), mix, focus: beam, still });

    sun.position.set(look.x - 4.5, 9, look.z + 5.5);
    sun.target.position.set(look.x, 0, look.z);
    sun.intensity = lerp(0, 1.5, mix);
    scene.environmentIntensity = lerp(0.12, 0.68, mix);
    rim.position.set(look.x + 3, 6, look.z - 9);
    rim.target.position.copy(look);
    rim.intensity = lerp(0.9, 0, mix);
    floorLook.uFocus.value.copy(look);
    floorLook.uRadius.value = clamp(reach * 0.62, 5, 8.5);
    floorLook.uDay.value = mix;
    shade.material.opacity = lerp(0.55, 0.3, mix);

    // qué hay bajo el cursor solo se vuelve a buscar si el cursor o la cámara se movieron
    if (!drag && (pointer.moved || moving)) setHover(pointer.over ? pick() : null);
    pointer.moved = false;

    // pista de la estación: aparece cuando la cámara ya llegó
    const stop = tour[Math.round(k)];
    const settled = Math.abs(k - Math.round(k)) < 0.2 && intro === 1 && (stop.beside || hold < 0.15);
    if (stop.hint !== hintKey && !hintEl.classList.contains('is-on')) {
      hintKey = stop.hint;
      hintEl.innerHTML = hintKey ? `<i class="bi bi-hand-index-thumb"></i>${t(hintKey)}` : '';
    }
    hintEl.classList.toggle('is-on', settled && !!stop.hint && stop.hint === hintKey);
    const left = Math.round(vw / 2 + stop.offX);
    if (left !== hintLeft) hintEl.style.left = `${hintLeft = left}px`;

    for (const name in stations) if (amounts[name] > 0) stations[name].update(state);
    // las sombras son blandas: recalcularlas cuadro por medio no se nota y ahorra una pasada entera
    renderer.shadowMap.needsUpdate = (rendered++ & 1) === 0;
    renderer.render(scene, camera);

    if (meter && rendered % 30 === 0) {
      meter.textContent = `${Math.round(30000 / (now - since))} fps · x${ratio.toFixed(2)}${calm ? ' · reposo' : ''}`;
      since = now;
    }
    if (onReady && ++frames === 2) onReady();
  }

  resize();
  frame(before);

  return {
    ready: new Promise((resolve) => { onReady = resolve; }),
    setTheme(next) {
      mixTo = next === 'light' ? 1 : 0;
      // el parpadeo de la bombita tapa el instante en que las sombras cambian de luz
      lamp.flicker();
      castFrom(next === 'light');
    },
    /** dónde está en pantalla (en px) un objeto de la escena, o null si no se ve */
    locate(name) {
      const target = name === 'laptop' ? avatar.laptop : null;
      if (!target || !sized) return null;
      const v = target.getWorldPosition(new THREE.Vector3()).project(camera);
      if (Math.abs(v.x) > 1 || Math.abs(v.y) > 1 || v.z > 1) return null;
      return { x: ((v.x + 1) / 2) * vw, y: ((1 - v.y) / 2) * vh };
    },
        /** entrada después de la carga: la cámara se acerca y el avatar aparece */
    intro() {
      if (still) return;
      intro = 0;
      avatar.intro();
    },
  };
}
