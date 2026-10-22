/**
 * Las estaciones del recorrido. Cada una arma su objeto a partir del contenido que ya está
 * en la página (tecnologías, proyectos, puestos, certificados, clientes, artículos) y lo
 * mantiene sincronizado con lo que se está leyendo.
 * Una estación puede exponer `spot()`: el punto que la lámpara tiene que iluminar en ese momento.
 */
import * as THREE from 'three';
import { C, ACCENTS, clay, box, mesh, texture, loadImage, fit, wrap, Spring, clamp, lerp, fonts } from './kit.js';

const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
const two = (n) => String(n).padStart(2, '0');
const hex = (c) => `#${c.toString(16).padStart(6, '0')}`;
const ease = (x) => x * x * (3 - 2 * x);

// Avisa qué elemento de la lista está cruzando el centro de la pantalla. Lo resuelve el navegador
// con un IntersectionObserver: medir cada elemento a mano obligaba a recalcular el layout todo el tiempo.
function watchCenter(els, onEnter) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) onEnter(entry.target);
  }, { rootMargin: '-50% 0px -50% 0px' });
  for (const el of els) observer.observe(el);
}

const lit = (map, options) => new THREE.MeshStandardMaterial({ map, roughness: 0.82, ...options });
const screenOf = (map) => new THREE.MeshBasicMaterial({ map, toneMapped: false });

/* ---------- Tecnologías: un teclado donde cada tecla es una tecnología ---------- */

export function createKeyboard({ register, tip }) {
  const group = new THREE.Group();
  group.rotation.y = -0.2;
  const cards = [...document.querySelectorAll('#skills .skill-category-card')];
  const stack = text(document.querySelector('#skills .section-title strong[style]')); // el stack principal va en ámbar
  const skills = [...document.querySelectorAll('#skills .skill-item')].map((el) => {
    const img = el.querySelector('img');
    const name = img?.alt || text(el);
    return { el, name, src: img?.src, group: Math.max(0, cards.indexOf(el.closest('.skill-category-card'))), star: stack.includes(name) };
  });
  if (!skills.length) return { group, update() { } };

  const COLS = Math.ceil(Math.sqrt(skills.length)), ROWS = Math.ceil(skills.length / COLS), PITCH = 0.72;
  // cada categoría (frontend, backend, datos, herramientas…) tiene su color de tecla, como un teclado custom
  const TONES = [C.paper, 0xc9d6c4, 0xc6d3e3, 0xe8c9b8, 0xe9d9b0, 0xd9d4c8];
  const capShape = box(0.62, 0.34, 0.62, 0.11, 4);
  const faceShape = new THREE.PlaneGeometry(0.4, 0.4).rotateX(-Math.PI / 2);
  group.add(mesh(box(COLS * PITCH + 0.66, 0.3, ROWS * PITCH + 0.5, 0.18), clay(C.ink), 0, 0.15, 0));
  // una franja de luz ámbar asoma por debajo de las teclas, como la retroiluminación
  const under = new THREE.Mesh(new THREE.PlaneGeometry(COLS * PITCH + 0.2, ROWS * PITCH + 0.1).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
  under.position.y = 0.305;
  group.add(under);

  const keys = skills.map((skill, i) => {
    const row = Math.floor(i / COLS), col = i % COLS;
    const key = new THREE.Group();
    key.position.set((col - (COLS - 1) / 2) * PITCH + (row % 2 ? 0.12 : -0.12), 0.47, (row - (ROWS - 1) / 2) * PITCH);
    // mientras no llega el logo, la tecla muestra las primeras letras
    const map = texture(128, 128, (g) => {
      g.font = `600 44px ${fonts.heading}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = '#242427';
      g.fillText(skill.name.slice(0, 2), 64, 68);
    });
    if (skill.src) {
      loadImage(skill.src).then((img) => {
        map.g.clearRect(0, 0, 128, 128);
        fit(map.g, img, 10, 10, 108, 108, true);
        map.needsUpdate = true;
      }).catch(() => { });
    }
    const cap = mesh(capShape, clay(skill.star ? C.amber : TONES[skill.group % TONES.length]));
    const face = new THREE.Mesh(faceShape, lit(map, { transparent: true }));
    face.position.y = 0.173;
    key.add(cap, face);
    group.add(key);

    const item = { ...skill, key, press: new Spring(0, 340, 17), tap: 0, hot: false, fromPage: false };
    const hot = (on) => {
      item.hot = on;
      skill.el.classList.toggle('is-hot', on);
      tip(on ? skill.name : null);
    };
    register({ root: key, station: 'keyboard', cursor: 'pointer', over: () => hot(true), out: () => hot(false), click: () => { item.press.v = -2.4; } });
    // y al revés: pasar por la tecnología en la página hunde su tecla
    skill.el.addEventListener('pointerenter', () => { item.fromPage = true; });
    skill.el.addEventListener('pointerleave', () => { item.fromPage = false; });
    return item;
  });

  let idle = 1;
  function update({ dt, amount, still, mix }) {
    idle -= dt;
    if (idle < 0 && !still) {
      idle = 0.4 + Math.random() * 1.3;
      keys[Math.floor(Math.random() * keys.length)].tap = 0.13;
    }
    for (const k of keys) {
      k.tap -= dt;
      k.press.to = k.hot || k.fromPage || k.tap > 0 ? -0.11 : 0;
      k.key.position.y = 0.47 + k.press.step(dt);
    }
    under.material.opacity = lerp(0.13, 0, mix) * amount('keyboard');
  }

  return { group, update };
}

/* ---------- Portfolio: la web de cada proyecto, funcionando dentro de la laptop y del teléfono ---------- */

// Texturas grandes: se decodifican fuera del hilo principal y se suben a la placa de video una sola vez.
// Se guardan las últimas usadas y las demás se liberan, así la memoria de video no crece con cada proyecto.
const pictures = new Map();
function picture(src) {
  if (pictures.has(src)) {
    const hit = pictures.get(src);
    pictures.delete(src);
    pictures.set(src, hit); // pasa a ser la más reciente
    return hit;
  }
  const entry = { tex: null, ready: null };
  entry.ready = (async () => {
    const blob = await (await fetch(src)).blob();
    let tex;
    try {
      const bitmap = await createImageBitmap(blob, { imageOrientation: 'flipY' });
      tex = new THREE.Texture(bitmap);
      tex.flipY = false;
    } catch (_) {
      tex = new THREE.Texture(await loadImage(URL.createObjectURL(blob)));
    }
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    tex.userData.aspect = tex.image.width / tex.image.height;
    entry.tex = tex;
    return tex;
  })();
  pictures.set(src, entry);
  while (pictures.size > 8) {
    const [old, gone] = pictures.entries().next().value;
    pictures.delete(old);
    gone.ready.then((tex) => {
      tex.dispose();
      tex.image?.close?.();
    }).catch(() => { });
  }
  return entry;
}

// Encuadra una imagen dentro de una pantalla (cover), con zoom y paneo: el efecto Ken Burns.
function frame(tex, screenAspect, zoom = 1, px = 0.5, py = 0.5) {
  const a = tex.userData.aspect || screenAspect;
  const rx = a > screenAspect ? screenAspect / a : 1, ry = a > screenAspect ? 1 : a / screenAspect;
  tex.repeat.set(rx / zoom, ry / zoom);
  tex.offset.set((1 - tex.repeat.x) * px, (1 - tex.repeat.y) * py);
}

// Una web larga recorrida como la recorrería alguien: baja de a una pantalla, se detiene, y al final vuelve arriba.
function scrolled(tex, screenAspect, t) {
  const view = clamp(tex.userData.aspect / screenAspect, 0, 1); // fracción de la página que entra en pantalla
  tex.repeat.set(1, view);
  const steps = Math.max(0, Math.ceil((1 - view) / (view * 0.8)));
  const MOVE = 1.1, STOP = 1.3;
  const total = 2 + steps * (MOVE + STOP) + 1.6 + 1.2;
  let s = 0, k = t % total;
  if (steps) {
    k -= 2;
    if (k > 0) {
      const down = steps * (MOVE + STOP);
      if (k < down) {
        const n = Math.floor(k / (MOVE + STOP)), part = k - n * (MOVE + STOP);
        s = (n + ease(clamp(part / MOVE, 0, 1))) / steps;
      } else if (k < down + 1.6) s = 1;
      else s = 1 - ease(clamp((k - down - 1.6) / 1.2, 0, 1));
    }
  }
  tex.offset.set(0, (1 - view) * (1 - s));
}

export function createShowcase({ register, tip, t }) {
  const group = new THREE.Group();
  const turn = new THREE.Group();
  group.add(turn);

  const metal = clay(C.metal, { roughness: 0.3, metalness: 0.8 });
  const graphite = clay(0x232327, { roughness: 0.55 });
  const laptop = new THREE.Group();
  laptop.add(mesh(box(3.3, 0.11, 2.25, 0.05), metal, 0, 0.055, 0));
  const well = new THREE.Mesh(new THREE.PlaneGeometry(2.92, 1.02).rotateX(-Math.PI / 2), clay(0x18181b));
  well.position.set(0, 0.111, -0.36);
  laptop.add(well);

  // Teclado: todas las teclas son una sola malla instanciada, una llamada de dibujo para casi 70 teclas.
  const ROWS = [[14, 0.7], [14, 1], [14, 1], [13, 1], [12, 1], [0, 1]];
  const PITCH = 0.19, layout = [];
  ROWS.forEach(([count, depth], r) => {
    const z = -0.8 + r * 0.17;
    if (count) {
      const wide = 2.82 - (count - 1) * PITCH; // la última tecla de cada fila ocupa el resto (borrar, enter, shift…)
      for (let c = 0; c < count; c++) {
        const w = c === count - 1 ? wide : PITCH;
        const x = -1.41 + c * PITCH + w / 2;
        layout.push([x, z, w - 0.03, depth]);
      }
    } else {
      // fila de abajo: modificadores y la barra espaciadora
      [[0.2, 0], [0.2, 1], [0.24, 2], [1.24, 3], [0.24, 4], [0.2, 5], [0.42, 6]].reduce((x, [w]) => {
        layout.push([x + w / 2, z, w - 0.03, depth]);
        return x + w;
      }, -1.41);
    }
  });
  const keys = new THREE.InstancedMesh(box(1, 0.035, 0.145, 0.02, 2), clay(0x2b2b30, { roughness: 0.6 }), layout.length);
  const place = new THREE.Object3D();
  layout.forEach(([x, z, w, d], i) => {
    place.position.set(x, 0.13, z);
    place.scale.set(w, 1, d);
    place.updateMatrix();
    keys.setMatrixAt(i, place.matrix);
  });
  keys.receiveShadow = true;
  laptop.add(keys);
  // la retroiluminación asoma entre las teclas
  const backlight = new THREE.Mesh(new THREE.PlaneGeometry(2.86, 1.0).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
  backlight.position.set(0, 0.113, -0.37);
  laptop.add(backlight);
  const pad = mesh(box(1.1, 0.012, 0.62, 0.04, 2), clay(0xb9b9be, { roughness: 0.42, metalness: 0.6 }), 0, 0.108, 0.66);
  laptop.add(pad, mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.9, 16).rotateZ(Math.PI / 2), graphite, 0, 0.12, -1.08));

  const lid = new THREE.Group();
  lid.position.set(0, 0.11, -1.1);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(3.18, 2.03), clay(0x111113, { roughness: 0.4 }));
  bezel.position.set(0, 1.075, 0.037);
  // dos capas de pantalla: la de atrás muestra lo que se veía y la de adelante funde lo nuevo
  const blank = texture(4, 4, (g) => {
    g.fillStyle = '#111113';
    g.fillRect(0, 0, 4, 4);
  });
  const SCREEN = 2.98 / 1.8625;
  const screenShape = new THREE.PlaneGeometry(2.98, 1.8625);
  const under = new THREE.Mesh(screenShape, screenOf(blank));
  under.position.set(0, 1.09, 0.039);
  const over = new THREE.Mesh(screenShape, new THREE.MeshBasicMaterial({ map: blank, toneMapped: false, transparent: true, opacity: 0 }));
  over.position.set(0, 1.09, 0.041);
  // un reflejo apenas, en diagonal: la pantalla parece de vidrio
  const glare = new THREE.Mesh(screenShape, new THREE.MeshBasicMaterial({
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.09,
    map: texture(256, 160, (g) => {
      const grad = g.createLinearGradient(0, 0, 256, 160);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.42, 'rgba(255,255,255,0)');
      grad.addColorStop(0.5, 'rgba(255,255,255,1)');
      grad.addColorStop(0.62, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 160);
    }),
  }));
  glare.position.set(0, 1.09, 0.043);
  const lens = mesh(new THREE.SphereGeometry(0.018, 10, 8), clay(0x050506, { roughness: 0.2 }), 0, 2.07, 0.04);
  // atrás de la tapa, el logo encendido
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({
    transparent: true, toneMapped: false,
    map: texture(200, 200, (g) => {
      g.fillStyle = '#f3b949';
      g.font = `700 92px ${fonts.heading}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('</>', 100, 104);
    }),
  }));
  logo.position.set(0, 1.12, -0.037);
  logo.rotation.y = Math.PI;
  lid.add(mesh(box(3.3, 2.15, 0.07, 0.05), metal, 0, 1.075, 0), bezel, under, over, glare, lens, logo);
  laptop.add(lid);
  laptop.position.x = -0.35;

  const phone = new THREE.Group();
  phone.position.set(2.15, 0, 0.95);
  phone.rotation.y = -0.5;
  const lean = new THREE.Group();
  lean.rotation.x = -0.24;
  const PHONE = 0.76 / 1.6;
  const card = texture(360, 760);
  const phoneDisplay = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 1.6), screenOf(card));
  phoneDisplay.position.set(0, 0.87, 0.047);
  const island = mesh(box(0.2, 0.055, 0.01, 0.027, 2), clay(0x050506, { roughness: 0.3 }), 0, 1.6, 0.05);
  lean.add(mesh(box(0.84, 1.7, 0.09, 0.11), clay(0x2c2c31, { roughness: 0.4, metalness: 0.3 }), 0, 0.87, 0), phoneDisplay, island);
  lean.add(mesh(box(0.03, 0.2, 0.05, 0.012), graphite, 0.43, 1.25, 0), mesh(box(0.03, 0.12, 0.05, 0.012), graphite, -0.43, 1.32, 0), mesh(box(0.03, 0.12, 0.05, 0.012), graphite, -0.43, 1.15, 0));
  const bump = new THREE.Group();
  bump.position.set(-0.2, 1.47, -0.05);
  bump.add(mesh(box(0.3, 0.3, 0.03, 0.08, 2), graphite));
  for (const [x, y] of [[-0.065, 0.065], [0.065, -0.065]]) bump.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 18).rotateX(Math.PI / 2), clay(0x0c0c0e, { roughness: 0.2 }), x, y, -0.02));
  lean.add(bump);
  phone.add(lean, mesh(box(0.5, 0.42, 0.34, 0.08), clay(C.sage), 0, 0.21, -0.3));
  turn.add(laptop, phone);

  /* ---------- Proyectos: de la página ---------- */

  const section = document.getElementById('portfolio');
  const container = section?.querySelector('.isotope-container');
  const projects = [...document.querySelectorAll('#portfolio .portfolio-item')].map((el) => {
    const site = [...el.querySelectorAll('a[href^="http"]')].find((a) => !/github\.com/.test(a.hostname));
    const modal = document.querySelector(el.querySelector('[data-bs-target]')?.dataset.bsTarget || null);
    return {
      el,
      src: el.querySelector('.portfolio-img')?.getAttribute('src'),
      title: text(el.querySelector('h4')),
      kind: text(el.querySelector('.category')),
      tags: [...el.querySelectorAll('.tech-tags .badge')].slice(0, 4).map(text),
      host: site ? site.hostname.replace(/^www\./, '') : null,
      // los proyectos privados (los chilenos) no tienen web pública: se muestra su galería en movimiento
      shots: modal ? [...modal.querySelectorAll('a.glightbox')].map((a) => a.getAttribute('href')) : [],
    };
  });
  let live = {};
  const manifest = fetch('assets/img/portfolio/live/index.json').then((r) => (r.ok ? r.json() : {})).then((m) => { live = m; }).catch(() => { });

  // la isotope de la plantilla acomodaba la grilla entera; acá se muestra un proyecto por vez
  for (const p of projects) p.el.classList.remove('isotope-item');
  try { window.Isotope?.data(container)?.destroy(); } catch (_) { }
  section?.classList.add('is-picker');

  /* el selector: anterior / siguiente y la lista de nombres, en lugar del listado interminable */
  const nav = document.createElement('div');
  nav.className = 'project-nav';
  nav.innerHTML = `<button type="button" class="project-step" data-step="-1" aria-label="${t('prev')}"><i class="bi bi-arrow-left"></i></button>
    <span class="project-count"></span>
    <button type="button" class="project-step" data-step="1" aria-label="${t('next')}"><i class="bi bi-arrow-right"></i></button>`;
  const index = document.createElement('div');
  index.className = 'project-index';
  for (const p of projects) {
    p.pill = Object.assign(document.createElement('button'), { type: 'button', className: 'project-pill', textContent: p.title.split(/\s[—–-]\s|\s\(/)[0] });
    p.pill.addEventListener('click', () => show(p));
    index.append(p.pill);
  }
  container?.after(nav, index);
  const count = nav.querySelector('.project-count');

  let visible = projects;
  const filters = section?.querySelector('.portfolio-filters');
  // el filtro de la plantilla movía la isotope: se intercepta antes de que llegue
  filters?.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-filter]');
    if (!li) return;
    e.stopPropagation();
    filters.querySelector('.filter-active')?.classList.remove('filter-active');
    li.classList.add('filter-active');
    const rule = li.dataset.filter;
    visible = projects.filter((p) => rule === '*' || p.el.matches(rule));
    for (const p of projects) p.pill.hidden = !visible.includes(p);
    show(visible.includes(current) ? current : visible[0], true);
  }, true);

  const step = (d) => {
    const i = visible.indexOf(current);
    show(visible[(i + d + visible.length) % visible.length]);
  };
  nav.addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (b) step(+b.dataset.step);
  });
  let near = 0;
  addEventListener('keydown', (e) => {
    if (near < 0.5 || e.altKey || e.ctrlKey || e.metaKey || /input|textarea|select/i.test(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });

  /* ---------- Lo que pasa en las pantallas ---------- */

  let current = null, fade = 1, clock = 0, reel = null, phoneTex = null;
  const plain = (map) => Object.assign(map, { generateMipmaps: false, minFilter: THREE.LinearFilter });
  plain(card);

  // lo que se veía pasa a la capa de atrás y lo nuevo entra fundido por adelante
  function reveal(map) {
    if (over.material.map === map) return;
    under.material.map = over.material.map;
    over.material.map = map;
    over.material.opacity = 0;
    fade = 0;
  }

  // el teléfono, si el proyecto no tiene versión móvil capturada, es su ficha: tipo, nombre, stack y número
  function paintCard(project) {
    const g = card.g;
    g.fillStyle = '#131315';
    g.fillRect(0, 0, 360, 760);
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#f3b949';
    g.font = `600 17px ${fonts.body}`;
    let y = wrap(g, project.kind.toUpperCase(), 28, 150, 304, 24, 2);
    g.fillStyle = '#f5f5f3';
    g.font = `600 44px ${fonts.heading}`;
    y = wrap(g, project.title, 28, y + 40, 304, 50, 4);
    g.font = `500 17px ${fonts.body}`;
    let x = 28;
    y += 6;
    for (const tag of project.tags) {
      const w = g.measureText(tag).width + 26;
      if (x + w > 332) {
        x = 28;
        y += 44;
      }
      g.strokeStyle = 'rgba(255,255,255,0.22)';
      g.beginPath();
      g.roundRect(x, y, w, 34, 17);
      g.stroke();
      g.fillStyle = '#c8c8cc';
      g.fillText(tag, x + 13, y + 23);
      x += w + 8;
    }
    g.fillStyle = '#8d8d93';
    g.font = `500 16px ${fonts.body}`;
    g.fillText(`${two(projects.indexOf(project) + 1)} / ${two(projects.length)}`, 28, 716);
    card.repeat.set(1, 1);
    card.offset.set(0, 0);
    card.needsUpdate = true;
  }

  async function show(project, force) {
    if (!project || (project === current && !force)) return;
    current?.el.classList.remove('is-current');
    current?.pill.classList.remove('is-current');
    current = project;
    project.el.classList.add('is-current');
    project.pill.classList.add('is-current');
    count.textContent = `${two(visible.indexOf(project) + 1)} / ${two(visible.length)}`;
    // la tira de nombres se corre sola hasta el actual (sin mover la página)
    index.scrollTo({ left: project.pill.offsetLeft - index.clientWidth / 2 + project.pill.offsetWidth / 2, behavior: 'smooth' });
    clock = 0;
    await manifest;
    if (project !== current) return;
    const site = live[project.host];
    // tres formas de mostrarlo: la web real recorriéndose, la galería en movimiento o la captura sola
    reel = site ? { kind: 'scroll', src: site.desk[0] } : project.shots.length > 1 ? { kind: 'slides', srcs: project.shots, at: -1 } : { kind: 'still', src: project.src };
    phoneTex = null;
    phoneDisplay.material.map = card;
    paintCard(project);
    if (site?.mob) {
      picture(site.mob[0]).ready.then((tex) => {
        if (project !== current) return;
        phoneTex = tex;
        phoneDisplay.material.map = tex;
      }).catch(() => { });
    }
    const first = reel.kind === 'slides' ? reel.srcs[0] : reel.src;
    if (!first) return reveal(blank);
    const entry = picture(first);
    if (entry.tex) reveal(entry.tex);
    else {
      reveal(blank);
      entry.ready.then((tex) => { if (project === current) reveal(tex); }).catch(() => { });
    }
    // el que sigue queda listo para cuando lo pidan
    const next = visible[(visible.indexOf(project) + 1) % visible.length];
    const nextSite = live[next?.host];
    if (nextSite) picture(nextSite.desk[0]);
  }

  /* girar arrastrando */
  const REST = -0.3;
  let speed = 0, held = false;
  turn.rotation.y = REST;
  register({
    root: turn,
    station: 'showcase',
    cursor: 'grab',
    down: () => { held = true; },
    drag: (dx) => {
      turn.rotation.y += dx * 0.008;
      speed = dx * 0.4;
    },
    up: () => { held = false; },
  });
  register({
    root: phone,
    station: 'showcase',
    cursor: 'grab',
    over: () => tip(current?.title),
    out: () => tip(null),
    down: () => { held = true; },
    drag: (dx) => {
      turn.rotation.y += dx * 0.008;
      speed = dx * 0.4;
    },
    up: () => { held = false; },
  });

  const open = new Spring(0, 40, 9);

  function update({ dt, time, amount, mix, still }) {
    near = amount('showcase');
    // la laptop se abre al llegar y se cierra al irse
    open.to = near > 0.4 ? 1 : 0;
    lid.rotation.x = lerp(1.5, -0.27, clamp(open.step(dt), 0, 1.04));
    if (!held) {
      speed += ((REST + Math.sin(time * 0.5) * 0.05 - turn.rotation.y) * 7 - speed * 3.2) * dt;
      turn.rotation.y += speed * dt;
    }
    if (fade < 1) {
      fade = Math.min(1, fade + dt / 0.45);
      over.material.opacity = ease(fade);
    }
    backlight.material.opacity = lerp(0.32, 0.05, mix);

    clock += still ? 0 : dt;
    const tex = over.material.map;
    if (reel && tex !== blank) {
      if (reel.kind === 'scroll') scrolled(tex, SCREEN, clock);
      else if (reel.kind === 'still') frame(tex, SCREEN, 1.04 + Math.sin(clock * 0.25) * 0.04, 0.5 + Math.sin(clock * 0.18) * 0.3, 0.6);
      else {
        // galería: cada captura dura unos segundos, con un zoom lento hacia un rincón distinto
        const SLIDE = 4.2, n = Math.floor(clock / SLIDE) % reel.srcs.length, local = (clock % SLIDE) / SLIDE;
        if (n !== reel.at) {
          reel.at = n;
          const entry = picture(reel.srcs[n]);
          if (entry.tex) reveal(entry.tex);
          else entry.ready.then((next) => { if (reel?.srcs?.[n] && reel.at === n) reveal(next); }).catch(() => { });
          picture(reel.srcs[(n + 1) % reel.srcs.length]);
        }
        frame(tex, SCREEN, 1.02 + local * 0.1, n % 2 ? 0.2 + local * 0.3 : 0.8 - local * 0.3, n % 3 ? 0.7 : 0.4);
      }
    }
    if (phoneTex) scrolled(phoneTex, PHONE, clock + 0.8);
  }

  if (projects.length) {
    visible = projects;
    show(projects[0]);
  }
  return { group, update };
}

/* ---------- Experiencia: un escalón por puesto, con su emblema, y una pelota que acompaña la lectura ---------- */

// Emblemas chiquitos que dicen qué fue cada puesto sin repetir años: birrete, auriculares, maletín…
function emblem(kind) {
  const e = new THREE.Group();
  const ink = clay(C.ink), amber = clay(C.amber, { emissive: C.amber, emissiveIntensity: 0.25 });
  if (kind === 'cap') {
    e.add(mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.14, 24), ink, 0, 0.07, 0));
    const board = mesh(box(0.44, 0.035, 0.44, 0.01, 1), ink, 0, 0.16, 0);
    board.rotation.y = Math.PI / 4;
    e.add(board, mesh(new THREE.CapsuleGeometry(0.012, 0.15, 2, 6), amber, 0.2, 0.08, 0), mesh(new THREE.SphereGeometry(0.03, 10, 8), amber, 0.2, 0.0, 0));
  } else if (kind === 'headset') {
    e.add(mesh(new THREE.TorusGeometry(0.17, 0.028, 8, 24, Math.PI), clay(C.slate), 0, 0.12, 0));
    for (const side of [-1, 1]) e.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.07, 20).rotateZ(Math.PI / 2), clay(C.terra), side * 0.17, 0.1, 0));
    const boom = mesh(new THREE.CapsuleGeometry(0.012, 0.16, 2, 6), clay(C.slate), -0.12, 0.04, 0.08);
    boom.rotation.set(1.2, 0, 0.5);
    e.add(boom);
  } else if (kind === 'case') {
    e.add(mesh(box(0.42, 0.28, 0.15, 0.04), clay(C.walnut), 0, 0.14, 0), mesh(new THREE.TorusGeometry(0.06, 0.016, 6, 16, Math.PI), ink, 0, 0.28, 0), mesh(box(0.06, 0.04, 0.02, 0.008), amber, 0, 0.2, 0.08));
  } else if (kind === 'chart') {
    e.add(mesh(box(0.46, 0.03, 0.2, 0.012), ink, 0, 0.015, 0));
    [[C.blue, 0.14], [C.sage, 0.24], [C.terra, 0.36]].forEach(([color, h], i) => e.add(mesh(box(0.1, h, 0.1, 0.02), clay(color), -0.14 + i * 0.14, 0.03 + h / 2, 0)));
  } else if (kind === 'robot') {
    e.add(mesh(box(0.28, 0.22, 0.22, 0.06), clay(C.terra), 0, 0.11, 0), mesh(box(0.24, 0.18, 0.2, 0.06), clay(C.paper), 0, 0.33, 0), mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 6), ink, 0, 0.47, 0), mesh(new THREE.SphereGeometry(0.025, 10, 8), amber, 0, 0.53, 0));
    for (const side of [-1, 1]) e.add(mesh(new THREE.SphereGeometry(0.025, 10, 8), amber, side * 0.05, 0.34, 0.1));
  } else {
    // una laptop chiquita, con la pantalla encendida: el puesto de ahora
    e.add(mesh(box(0.42, 0.03, 0.3, 0.012), clay(C.metal, { roughness: 0.35, metalness: 0.7 }), 0, 0.015, 0));
    const lid = new THREE.Group();
    lid.position.set(0, 0.03, -0.14);
    lid.rotation.x = -0.25;
    lid.add(mesh(box(0.42, 0.28, 0.02, 0.01), clay(C.metal, { roughness: 0.35, metalness: 0.7 }), 0, 0.14, 0));
    const glowing = new THREE.Mesh(new THREE.PlaneGeometry(0.37, 0.23), new THREE.MeshBasicMaterial({ color: 0x9cc3ff, toneMapped: false }));
    glowing.position.set(0, 0.14, 0.011);
    lid.add(glowing);
    e.add(lid);
  }
  return e;
}

function kindOf(item) {
  const all = `${text(item.querySelector('h4'))} ${text(item.querySelector('.company'))}`;
  if (item.querySelector('.bi-mortarboard') || /técnico superior|technician/i.test(all)) return 'cap';
  if (/robót|robot/i.test(all)) return 'robot';
  if (/datos|data/i.test(all)) return 'chart';
  if (/freelance/i.test(all)) return 'case';
  if (/soporte|support/i.test(all)) return 'headset';
  return 'laptop';
}

// "Paperlux · Chile" → Paperlux, "Hotel Gran Iguazú – H.C.I." → H.C.I., "Instituto Tecnológico Itec" → Itec,
// "Freelance Projects" → Freelance: se descartan las palabras genéricas y queda el nombre propio
const GENERIC = /^(instituto|institute|tecnol[oó]gico|technological|proyectos|projects|hotel|de|of|the)$/i;
function shortName(item) {
  const company = text(item.querySelector('.company'));
  if (/[–-]\s/.test(company)) return company.split(/\s[–-]\s/).pop();
  if (company.includes('·')) return company.split('·')[0].trim();
  const words = company.split(' ').filter((w) => !GENERIC.test(w));
  return words.length === 1 ? words[0] : words.pop() || company;
}

export function createStairs({ register }) {
  const group = new THREE.Group();
  group.rotation.y = -0.5;
  const items = [...document.querySelectorAll('#resume .timeline-item')].slice(0, 9);
  const n = items.length;
  if (n < 2) return { group, update() { } };

  const W = 0.92, RISE = 0.3, D = 1.5;
  const tops = [], badges = [];
  const STEPS = [C.paper, 0xe4d3bd, 0xd6ddcf, 0xd3dbe6, 0xead2c4, 0xe9dcb8, C.cream, 0xd9d4c8, C.paper];
  // el escalón más bajo es el puesto más antiguo; en la página el primero es el más nuevo
  for (let j = 0; j < n; j++) {
    const item = items[n - 1 - j];
    const h = RISE * (j + 1), x = (j - (n - 1) / 2) * W;
    group.add(mesh(box(W - 0.03, h, D, 0.05, 3), clay(STEPS[j % STEPS.length]), x, h / 2, 0));
    // el frente del escalón lleva el nombre del lugar; el emblema, arriba, cuenta qué se hacía ahí
    const name = shortName(item);
    const tone = STEPS[j % STEPS.length];
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.16, 0.2), lit(texture(320, 70, (g) => {
      g.fillStyle = hex(tone);
      g.fillRect(0, 0, 320, 70);
      g.font = `600 38px ${fonts.heading}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = 'rgba(36,36,39,0.85)';
      g.fillText(name, 160, 37, 300);
    })));
    tag.position.set(x, h - 0.15, D / 2 + 0.005);
    group.add(tag);
    const badge = emblem(kindOf(item));
    badge.position.set(x, h, -0.3);
    badge.userData.size = 1.65;
    badge.rotation.y = 0.5; // mira a la cámara, que ve la escalera girada
    group.add(badge);
    badges.push({ badge, hop: new Spring(0, 260, 11) });
    tops.push(new THREE.Vector3(x, h, 0.3));
  }

  const R = 0.2;
  const ball = mesh(new THREE.SphereGeometry(R, 36, 24), clay(C.amber, { roughness: 0.55 }));
  group.add(ball);
  const from = tops[n - 1].clone(), to = tops[n - 1].clone(), spot = tops[n - 1].clone();
  const squash = new Spring(1, 320, 13);
  let step = n - 1, air = 1, arc = 0.5;

  function hopTo(j) {
    from.copy(spot);
    to.copy(tops[j]);
    arc = 0.45 + Math.abs(j - step) * 0.14;
    step = j;
    air = 0;
  }

  register({ root: ball, station: 'stairs', cursor: 'pointer', click: () => hopTo(step) });
  let wanted = step; // el escalón del puesto que pasa por el centro de la pantalla
  watchCenter(items, (el) => { wanted = n - 1 - items.indexOf(el); });
  const aim = new THREE.Vector3();

  function update({ dt, amount, still }) {
    if (amount('stairs') > 0.4 && wanted !== step && air === 1) hopTo(wanted);
    if (air < 1) {
      air = Math.min(1, air + dt / (still ? 0.01 : 0.42));
      spot.lerpVectors(from, to, air);
      spot.y += Math.sin(Math.PI * air) * arc;
      if (air === 1) {
        squash.x = 0.7;
        badges[step].hop.v = 3.2; // el emblema del puesto salta cuando llega la pelota
      }
    }
    const s = squash.step(dt);
    ball.scale.set(1 + (1 - s) * 0.5, s, 1 + (1 - s) * 0.5);
    ball.position.copy(spot).y += R * s;
    badges.forEach(({ badge, hop }, j) => {
      const tall = tops[j].y;
      badge.position.y = tall + Math.max(0, hop.step(dt) * 0.12);
      badge.scale.setScalar(badge.userData.size * (j === step ? 1.12 : 1));
    });
  }

  return {
    group,
    update,
    // la lámpara alumbra el escalón donde está la pelota
    spot: () => group.localToWorld(aim.copy(tops[step])),
  };
}

/* ---------- Certificados: una repisa de dos estantes con cada diploma enmarcado ---------- */

const BRANDS = { udemy: '#a435f0', coursera: '#0056d2' };

function paintCert(g, cert, t, logo) {
  const W = 640, H = 448, brand = cert.brand;
  g.fillStyle = '#fbf8f1';
  g.fillRect(0, 0, W, H);
  // guarda doble: el color de la plataforma y un filete dorado
  g.strokeStyle = brand;
  g.lineWidth = 6;
  g.strokeRect(18, 18, W - 36, H - 36);
  g.strokeStyle = 'rgba(165,111,8,0.55)';
  g.lineWidth = 1.5;
  g.strokeRect(30, 30, W - 60, H - 60);

  let x = 56;
  if (logo) {
    fit(g, logo, 54, 50, 38, 38, true);
    x = 102;
  }
  g.textBaseline = 'alphabetic';
  g.fillStyle = brand;
  g.font = `700 19px ${fonts.body}`;
  g.fillText(cert.provider.toUpperCase(), x, 76);
  g.fillStyle = '#8d8a84';
  g.font = `300 34px ${fonts.heading}`;
  g.textAlign = 'right';
  g.fillText(cert.year || '', W - 56, 80);
  g.textAlign = 'left';

  g.fillStyle = '#8d8a84';
  g.font = `600 13px ${fonts.body}`;
  g.fillText(t('completion').toUpperCase().split('').join(String.fromCharCode(8202)), 56, 128);
  g.fillStyle = '#19191a';
  g.font = `600 31px ${fonts.heading}`;
  const y = wrap(g, cert.title, 56, 170, W - 112, 37, 3);

  g.fillStyle = '#8d8a84';
  g.font = `500 14px ${fonts.body}`;
  g.fillText(t('awarded'), 56, Math.max(y + 10, 300));
  g.fillStyle = '#2a2723';
  g.font = `italic 400 36px Georgia, "Times New Roman", serif`;
  g.fillText('Mateo Rojas', 56, Math.max(y + 48, 338));

  // la firma: un garabato con trazo de lapicera
  g.strokeStyle = '#2a2723';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(60, 396);
  g.bezierCurveTo(80, 368, 96, 410, 112, 384);
  g.bezierCurveTo(126, 362, 132, 404, 150, 390);
  g.bezierCurveTo(166, 378, 180, 396, 214, 384);
  g.stroke();
  g.strokeStyle = 'rgba(36,36,39,0.3)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(56, 404);
  g.lineTo(250, 404);
  g.stroke();

  // el sello: una roseta del color de la plataforma con dos cintas
  const cx = W - 112, cy = H - 116;
  g.fillStyle = brand;
  g.beginPath();
  g.moveTo(cx - 26, cy + 20);
  g.lineTo(cx - 36, cy + 82);
  g.lineTo(cx - 18, cy + 70);
  g.lineTo(cx - 8, cy + 86);
  g.lineTo(cx - 2, cy + 24);
  g.moveTo(cx + 26, cy + 20);
  g.lineTo(cx + 36, cy + 82);
  g.lineTo(cx + 18, cy + 70);
  g.lineTo(cx + 8, cy + 86);
  g.lineTo(cx + 2, cy + 24);
  g.fill();
  g.beginPath();
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI * 2, r = i % 2 ? 40 : 46;
    g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  g.fill();
  g.fillStyle = '#f3b949';
  g.beginPath();
  g.arc(cx, cy, 30, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#fbf8f1';
  g.font = `700 22px ${fonts.heading}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('MR', cx, cy + 1);
  g.textAlign = 'left';
}

export function createCerts({ register, tip, t }) {
  const group = new THREE.Group();
  const seen = new Set();
  // los carruseles repiten los certificados (uno para escritorio y otro para celular): se toma cada uno una vez
  const certs = [...document.querySelectorAll('#stats .stats-item')]
    .map((el) => {
      const by = text(el.querySelector('p'));
      const [provider, year] = by.split(/\s*-\s*/);
      return {
        title: text(el.querySelector('h5')), by, provider: provider || by, year,
        logo: el.querySelector('img')?.getAttribute('src'), link: el.querySelector('a[href]')?.href,
        brand: BRANDS[(provider || '').toLowerCase()] || '#a56f08',
      };
    })
    .filter((c) => c.title && !seen.has(c.title) && seen.add(c.title))
    .slice(0, 6);
  if (!certs.length) return { group, update() { } };

  /* en la página: una lista con todos, en lugar del carrusel de a uno */
  const list = document.createElement('ol');
  list.className = 'cert-list';
  certs.forEach((cert, i) => {
    const row = document.createElement('li');
    row.className = 'cert-row';
    row.innerHTML = `<span class="cert-row-logo">${cert.logo ? `<img src="${cert.logo}" alt="">` : ''}</span>
      <span class="cert-row-text"><strong></strong><small></small></span>
      ${cert.link ? `<a class="cert-row-link" href="${cert.link}" target="_blank" rel="noopener">${t('open')} <i class="bi bi-arrow-up-right"></i></a>` : `<span class="cert-row-none">${t('noLink')}</span>`}`;
    row.querySelector('strong').textContent = cert.title;
    row.querySelector('small').textContent = `${cert.provider} · ${cert.year || ''}`;
    row.addEventListener('pointerenter', () => { pinned = i; });
    row.addEventListener('pointerleave', () => { pinned = -1; });
    list.append(row);
    cert.row = row;
  });
  document.querySelector('#stats .section-header')?.after(list);

  /* la repisa */
  const walnut = clay(C.walnut, { roughness: 0.7 });
  const WIDTH = 5.3;
  for (const side of [-1, 1]) group.add(mesh(box(0.13, 3.05, 0.14, 0.04), walnut, side * (WIDTH / 2 + 0.05), 1.525, -0.18));
  for (const y of [0.32, 1.76]) {
    group.add(mesh(box(WIDTH, 0.08, 0.46, 0.03), walnut, 0, y, 0), mesh(box(WIDTH, 0.12, 0.035, 0.015), walnut, 0, y + 0.08, 0.215));
  }
  group.add(mesh(box(WIDTH + 0.4, 0.07, 0.3, 0.03), walnut, 0, 3.08, -0.18));
  // en lo alto, una planta y un trofeo chico: la repisa es de alguien
  const pot = new THREE.Group();
  pot.position.set(-2.2, 3.115, -0.18);
  pot.add(mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.2, 18), clay(C.terra), 0, 0.1, 0));
  for (let i = 0; i < 5; i++) {
    const leaf = mesh(new THREE.SphereGeometry(0.12, 12, 8).scale(0.4, 1, 0.16).translate(0, 0.12, 0), clay(C.leaf), 0, 0.18, 0);
    leaf.rotation.set(0.3 + (i % 2) * 0.3, i * 1.25, 0, 'YXZ');
    pot.add(leaf);
  }
  const cup = new THREE.Group();
  cup.position.set(2.15, 3.115, -0.18);
  const gold = clay(C.mustard, { roughness: 0.3, metalness: 0.6 });
  cup.add(mesh(box(0.22, 0.06, 0.22, 0.02), walnut, 0, 0.03, 0), mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.12, 10), gold, 0, 0.12, 0),
    mesh(new THREE.CylinderGeometry(0.11, 0.05, 0.16, 20), gold, 0, 0.26, 0));
  for (const side of [-1, 1]) cup.add(mesh(new THREE.TorusGeometry(0.045, 0.012, 6, 12, Math.PI).rotateZ(side * Math.PI / 2), gold, side * 0.11, 0.27, 0));
  group.add(pot, cup);

  const FRAMES = { udemy: C.ink, coursera: C.oak };
  const cards = certs.map((cert, i) => {
    const row = Math.floor(i / 3), col = i % 3;
    const card = new THREE.Group();
    const baseY = row ? 0.4 : 1.84;
    card.position.set((col - 1) * 1.68, baseY, -0.02);
    const tilt = new THREE.Group();
    tilt.rotation.x = -0.1; // apoyado contra la pared imaginaria, apenas hacia atrás
    card.add(tilt);
    const map = texture(640, 448, (g) => paintCert(g, cert, t));
    if (cert.logo) {
      loadImage(new URL(cert.logo, location.href).href).then((img) => {
        paintCert(map.g, cert, t, img);
        map.needsUpdate = true;
      }).catch(() => { });
    }
    const frameColor = FRAMES[cert.provider.toLowerCase()] ?? C.walnut;
    tilt.add(
      mesh(box(1.56, 1.12, 0.07, 0.025, 2), clay(frameColor, { roughness: 0.5 }), 0, 0.56, 0),
      mesh(box(1.42, 0.98, 0.02, 0.006, 1), clay(0xf3efe6), 0, 0.56, 0.03),
    );
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.91), lit(map, { roughness: 0.9 }));
    face.position.set(0, 0.56, 0.042);
    tilt.add(face);
    group.add(card);
    const lift = new Spring(0, 200, 14), lean = new Spring(-0.1, 160, 14);
    register({
      root: card,
      station: 'certs',
      cursor: 'pointer',
      over: () => {
        pinned = i;
        tip(cert.link ? t('cert') : cert.by);
      },
      out: () => {
        pinned = -1;
        tip(null);
      },
      click: () => { if (cert.link) window.open(cert.link, '_blank', 'noopener'); },
    });
    return { card, tilt, lift, lean, baseY, phase: i * 1.3 };
  });

  // si nadie elige uno, la lámpara los va recorriendo de a uno
  let pinned = -1, active = 0, clock = 0, shown = -1;
  const aim = new THREE.Vector3();

  function update({ dt, time, still }) {
    clock += dt;
    if (pinned >= 0) {
      active = pinned;
      clock = 0;
    } else if (clock > 3.4 && !still) {
      clock = 0;
      active = (active + 1) % cards.length;
    }
    if (active !== shown) {
      certs[shown]?.row.classList.remove('is-hot');
      certs[active].row.classList.add('is-hot');
      shown = active;
    }
    cards.forEach((c, i) => {
      const on = i === active;
      c.lift.to = on ? 0.08 : 0;
      c.lean.to = on ? 0.06 : -0.1;
      c.card.position.y = c.baseY + c.lift.step(dt);
      c.card.position.z = -0.02 + c.lift.x * 1.6;
      c.tilt.rotation.x = c.lean.step(dt) + Math.sin(time * 1.1 + c.phase) * 0.006;
    });
  }

  return {
    group,
    update,
    spot: () => cards[active].card.localToWorld(aim.set(0, 0.56, 0)),
  };
}

/* ---------- Clientes: una calesita de carteles con cada logo; se gira arrastrando ---------- */

export function createClients({ register, tip }) {
  const group = new THREE.Group();
  const seen = new Set();
  const clients = [...document.querySelectorAll('#clientes .client-logo-item a')]
    .filter((a) => a.href && !seen.has(a.href) && seen.add(a.href))
    .map((a) => ({ a, img: a.querySelector('img'), name: text(a), site: a.hostname.replace(/^www\./, '') }));
  const n = clients.length;
  if (!n) return { group, update() { } };

  const R = Math.max(1.5, n * 0.27);
  const ring = new THREE.Group();
  group.add(ring);
  ring.add(mesh(new THREE.CylinderGeometry(R + 0.3, R + 0.36, 0.1, 72), clay(C.walnut, { roughness: 0.7 }), 0, 0.05, 0));
  // la calesita tiene un techito de lona a rayas, como las de plaza
  const canopy = mesh(new THREE.ConeGeometry(0.55, 0.36, 12), clay(C.terra), 0, 2.32, 0);
  ring.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.1, 10), clay(C.ink), 0, 1.1, 0), canopy, mesh(new THREE.SphereGeometry(0.06, 10, 8), clay(C.amber), 0, 2.52, 0));
  const post = new THREE.CylinderGeometry(0.02, 0.02, 0.76, 8);
  const board = box(1.25, 0.82, 0.05, 0.05, 3);

  let speed = 0.22, held = false, calm = false;
  const spin = (dx) => {
    ring.rotation.y += dx * 0.007;
    speed = dx * 0.35;
  };

  clients.forEach((client, i) => {
    const angle = (i / n) * Math.PI * 2;
    const sign = new THREE.Group();
    sign.position.set(Math.sin(angle) * R, 0, Math.cos(angle) * R);
    sign.rotation.y = angle;
    const map = texture(460, 288, (g) => {
      g.fillStyle = '#fbfaf7';
      g.fillRect(0, 0, 460, 288);
      g.fillStyle = '#19191a';
      g.font = `600 40px ${fonts.heading}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(client.name || client.site, 230, 148, 400);
    });
    if (client.img) {
      loadImage(client.img.src).then((img) => {
        map.g.fillStyle = '#fbfaf7';
        map.g.fillRect(0, 0, 460, 288);
        fit(map.g, img, 40, 34, 380, 220, true);
        map.needsUpdate = true;
      }).catch(() => { });
    }
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.72), lit(map));
    face.position.set(0, 1.25, 0.027);
    sign.add(mesh(post, clay(C.ink), 0, 0.46, 0), mesh(board, clay(ACCENTS[i % ACCENTS.length]), 0, 1.25, -0.004), face);
    ring.add(sign);
    register({
      root: sign,
      station: 'clients',
      cursor: 'pointer',
      over: () => {
        calm = true;
        tip(client.site);
      },
      out: () => {
        calm = false;
        tip(null);
      },
      down: () => { held = true; },
      drag: spin,
      up: () => { held = false; },
      click: () => client.a.click(),
    });
  });

  function update({ dt, still }) {
    if (held) return;
    speed += ((still || calm ? 0 : 0.22) - speed) * Math.min(1, dt * 1.6);
    ring.rotation.y += speed * dt;
  }

  return { group, update };
}

/* ---------- Blog: un libro por artículo; tocarlo abre el artículo ---------- */

export function createBooks({ register, tip }) {
  const group = new THREE.Group();
  group.rotation.y = 0.3;
  const seen = new Set();
  const posts = [...document.querySelectorAll('#blog .btn-read-more')]
    .filter((b) => !seen.has(b.dataset.article) && seen.add(b.dataset.article))
    .map((button) => ({ button, title: text(button.closest('.card')?.querySelector('h5')) }))
    .slice(0, 9);
  if (!posts.length) return { group, update() { } };

  const TONES = [C.blue, C.paper, C.terra, C.sage, C.mustard, C.ink, C.blush];
  const LIGHT = new Set([C.paper, C.mustard, C.blush, C.sage]);
  let y = 0;
  // se apilan de abajo hacia arriba, así el artículo más reciente queda arriba
  const books = posts.slice().reverse().map((post, i) => {
    const w = 2.1 + ((i * 37) % 5) * 0.07, h = 0.17 + ((i * 53) % 4) * 0.02, d = 1.5 - ((i * 29) % 4) * 0.06;
    const tone = TONES[i % TONES.length];
    const book = new THREE.Group();
    book.position.y = y + h / 2;
    book.rotation.y = (((i * 61) % 9) - 4) * 0.035;
    y += h + 0.004;
    const spine = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.3, h * 0.6), lit(texture(640, 36, (g) => {
      g.font = `600 24px ${fonts.body}`;
      g.textBaseline = 'middle';
      g.fillStyle = LIGHT.has(tone) ? '#242427' : '#f3f0e9';
      let label = post.title;
      while (label.length > 8 && g.measureText(label).width > 624) label = `${label.slice(0, -4)}…`;
      g.fillText(label, 8, 19);
    }), { transparent: true }));
    spine.position.z = d / 2 + 0.003;
    // las hojas: un bloque crema apenas más chico que las tapas
    book.add(mesh(box(w, h, d, 0.025, 2), clay(tone)), mesh(box(w - 0.06, h - 0.05, d + 0.004, 0.01, 1), clay(0xf1ebdd), 0.03, 0, -0.002), spine);
    group.add(book);
    const slide = new Spring(0, 170, 15);
    register({
      root: book,
      station: 'books',
      cursor: 'pointer',
      over: () => {
        slide.to = 0.3;
        tip(post.title);
      },
      out: () => {
        slide.to = 0;
        tip(null);
      },
      click: () => post.button.click(),
    });
    return { book, slide };
  });

  const pencil = new THREE.Group();
  pencil.position.set(0.3, 0.045, 1.25);
  pencil.rotation.y = 0.22;
  pencil.add(
    mesh(new THREE.CylinderGeometry(0.042, 0.042, 1.4, 6).rotateZ(Math.PI / 2), clay(C.amber)),
    mesh(new THREE.ConeGeometry(0.042, 0.15, 6).rotateZ(-Math.PI / 2), clay(C.cream), 0.775, 0, 0),
    mesh(new THREE.ConeGeometry(0.014, 0.05, 6).rotateZ(-Math.PI / 2), clay(C.ink), 0.826, 0, 0),
    mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.12, 12).rotateZ(Math.PI / 2), clay(C.blush), -0.74, 0, 0),
  );
  // y una taza de té al lado de la pila
  const tea = new THREE.Group();
  tea.position.set(-1.45, 0, 0.75);
  tea.add(mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.34, 24), clay(C.sage), 0, 0.17, 0), mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.01, 24), clay(0x8a5a2b, { roughness: 0.25 }), 0, 0.33, 0),
    mesh(new THREE.TorusGeometry(0.1, 0.028, 8, 18, Math.PI).rotateZ(-Math.PI / 2), clay(C.sage), 0.19, 0.18, 0));
  group.add(pencil, tea);

  function update({ dt }) {
    for (const b of books) b.book.position.z = b.slide.step(dt);
  }

  return { group, update };
}

/* ---------- Contacto: un sobre y un avión de papel que sale volando al enviar ---------- */

export function createMail({ register, tip, t }) {
  const group = new THREE.Group();
  const envelope = new THREE.Group();
  envelope.position.y = 0.1;
  envelope.rotation.set(-0.3, 0.28, 0);
  const flap = new THREE.Shape();
  flap.moveTo(-1.12, 0.73);
  flap.lineTo(1.12, 0.73);
  flap.lineTo(0, -0.1);
  flap.closePath();
  // la estampilla: azul, con borde dentado y la lámpara dibujada
  const stamp = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.5), lit(texture(168, 200, (g) => {
    g.fillStyle = '#fbf8f1';
    g.fillRect(0, 0, 168, 200);
    g.fillStyle = hex(C.blue);
    g.fillRect(14, 14, 140, 172);
    g.fillStyle = '#fbf8f1';
    for (let i = 0; i < 9; i++) {
      for (const [x, y] of [[i * 21, 0], [i * 21, 200], [0, i * 25], [168, i * 25]]) {
        g.beginPath();
        g.arc(x, y, 6, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.strokeStyle = '#fbf8f1';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(84, 14);
    g.lineTo(84, 70);
    g.stroke();
    g.fillStyle = '#242427';
    g.beginPath();
    g.arc(84, 104, 36, Math.PI, 0);
    g.fill();
    g.fillStyle = '#f3b949';
    g.beginPath();
    g.arc(84, 108, 12, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(243,185,73,0.35)';
    g.beginPath();
    g.moveTo(66, 110);
    g.lineTo(102, 110);
    g.lineTo(130, 180);
    g.lineTo(38, 180);
    g.fill();
  }), { roughness: 0.9 }));
  stamp.position.set(0.78, 1.22, 0.053);
  stamp.rotation.z = -0.06;
  envelope.add(
    mesh(box(2.3, 1.5, 0.1, 0.05, 3), clay(C.paper), 0, 0.75, 0),
    mesh(new THREE.ExtrudeGeometry(flap, { depth: 0.02, bevelEnabled: false }), clay(C.cream), 0, 0.75, 0.051),
    mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 32).rotateX(Math.PI / 2), clay(C.clayRed), 0, 0.67, 0.088),
    stamp,
  );
  group.add(envelope, mesh(box(1.5, 0.12, 0.8, 0.05), clay(C.walnut, { roughness: 0.7 }), 0, 0.06, -0.2));

  // avión de papel: dos alas y la quilla
  const N = [0, 0, 0.8], S = [0, 0.05, -0.6], L = [-0.62, 0.06, -0.6], Rw = [0.62, 0.06, -0.6], K = [0, -0.2, -0.6];
  const shape = new THREE.BufferGeometry();
  shape.setAttribute('position', new THREE.Float32BufferAttribute([...N, ...S, ...L, ...N, ...Rw, ...S, ...N, ...K, ...S], 3));
  shape.computeVertexNormals();
  const SIZE = 0.5;
  const plane = mesh(shape, clay(C.paper, { side: THREE.DoubleSide, flatShading: true }));
  plane.scale.setScalar(SIZE);
  group.add(plane);

  const REST = new THREE.Vector3(1.15, 1.95, 0.2);
  const spot = new THREE.Vector3(), ahead = new THREE.Vector3();
  let flight = -1; // segundos de vuelo; negativo es posado
  let shown = 1; // después de un vuelo vuelve a aparecer de a poco

  // trayectoria: sale hacia adelante, sube y se pierde a lo lejos
  const path = (s, out) => out.set(REST.x + 5.2 * s * s + Math.sin(s * 5) * 0.6, REST.y + Math.sin(s * Math.PI * 0.85) * 1.5 + s * s * 1.6, REST.z + 1.6 * Math.sin(s * Math.PI) - 7 * s * s);
  const fly = () => { if (flight < 0) flight = 0; };

  register({ root: plane, station: 'mail', cursor: 'pointer', over: () => tip(t('plane')), out: () => tip(null), click: fly });
  document.getElementById('contactForm')?.addEventListener('submit', fly);

  function update({ dt, time }) {
    if (flight < 0) {
      shown = Math.min(1, shown + dt * 1.5);
      plane.position.copy(REST).y += Math.sin(time * 1.6) * 0.07;
      plane.rotation.set(-0.12 + Math.sin(time * 1.6 + 1) * 0.05, -0.7, Math.sin(time * 1.1) * 0.08);
      plane.scale.setScalar(SIZE * shown);
      return;
    }
    flight += dt;
    const s = flight / 2.2;
    if (s >= 1) {
      flight = -1;
      shown = 0;
      return;
    }
    path(s, spot);
    path(s + 0.02, ahead);
    plane.position.copy(spot);
    plane.lookAt(group.localToWorld(ahead));
    plane.rotateZ(Math.sin(s * 9) * 0.35);
    plane.scale.setScalar(SIZE * (1 - s * s * 0.5));
  }

  return { group, update };
}
