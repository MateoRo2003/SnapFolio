/**
 * Arranque del sitio: tema día/noche, dock de navegación, pantalla de carga y el mundo 3D.
 * Si el 3D no puede arrancar, el sitio queda en una columna con el avatar y la lámpara 2D.
 */
const root = document.documentElement;
const english = (root.lang || '').toLowerCase().startsWith('en');

// textos propios de la interfaz 3D: [español, inglés]
const TEXT = {
  toLight: ['Encender las luces', 'Turn the lights on'],
  toDark: ['Apagar las luces', 'Turn the lights off'],
  lamp: ['Tira del cordón de la lámpara', 'Pull the lamp cord'],
  desk: ['Toca los objetos del escritorio', 'Tap the things on the desk'],
  certs: ['Toca un certificado para abrirlo', 'Tap a certificate to open it'],
  keys: ['Cada tecla es una tecnología', 'Every key is a technology'],
  ball: ['La pelota sigue lo que estás leyendo', 'The ball follows what you are reading'],
  turn: ['Arrastra para girar la laptop', 'Drag to spin the laptop'],
  spin: ['Arrastra la calesita o toca un cartel', 'Drag the carousel or tap a sign'],
  books: ['Toca un libro para leer el artículo', 'Tap a book to read the article'],
  plane: ['Envía el mensaje y mira el avión', 'Send the message and watch the plane'],
  robot: ['Profe de robótica', 'Robotics teacher'],
  cert: ['Ver certificado', 'View certificate'],
  hi: ['¡Hola! Tocame y te saludo', 'Hi! Tap me and I wave'],
  work: ['Ver mis proyectos', 'See my projects'],
  completion: ['Certificado de finalización', 'Certificate of completion'],
  awarded: ['Otorgado a', 'Awarded to'],
  noLink: ['Sin enlace público', 'No public link'],
  open: ['Abrir', 'Open'],
  prev: ['Proyecto anterior', 'Previous project'],
  next: ['Proyecto siguiente', 'Next project'],
  all: ['Todos los proyectos', 'All projects'],
  // la terminal de la pantalla de carga
  t3d: ['three.js y el mundo 3D', 'three.js and the 3D world'],
  tDesk: ['el escritorio, la lámpara y el café', 'the desk, the lamp and the coffee'],
  tProjects: ['proyectos', 'projects'],
  tCerts: ['certificados', 'certificates'],
  tStack: ['tecnologías', 'technologies'],
  tReady: ['listo en', 'ready in'],
  tOpen: ['abriendo el estudio', 'opening the studio'],
};
const t = (key) => TEXT[key]?.[english ? 1 : 0] ?? key;

/* ---------- Tema ---------- */

let world = null;
let theme = root.dataset.theme === 'light' ? 'light' : 'dark';
const toggle = Object.assign(document.createElement('button'), { type: 'button', className: 'theme-toggle' });

function setTheme(next) {
  theme = next;
  const apply = () => {
    root.dataset.theme = theme;
    paintToggle();
  };
  // El navegador funde la pantalla vieja con la nueva en una sola pasada; donde no existe, el cambio es directo.
  // (si la pestaña está en segundo plano el fundido se cancela, pero el cambio se aplica igual)
  if (document.startViewTransition) document.startViewTransition(apply).ready.catch(() => { });
  else apply();
  try { localStorage.setItem('theme', theme); } catch (_) { }
  world?.setTheme(theme);
}

const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

function paintToggle() {
  const light = theme === 'light';
  const label = t(light ? 'toDark' : 'toLight');
  toggle.innerHTML = `<i class="bi ${light ? 'bi-lightbulb-fill' : 'bi-lightbulb'}"></i>`;
  toggle.dataset.label = label;
  toggle.setAttribute('aria-label', label);
  toggle.setAttribute('aria-pressed', String(light));
}

/* ---------- Dock ---------- */

// los enlaces quedan solo con el ícono: el texto pasa a ser su etiqueta flotante
for (const link of document.querySelectorAll('#navmenu a')) {
  const label = link.textContent.trim();
  link.dataset.label = label;
  link.setAttribute('aria-label', label);
}
const menu = document.querySelector('#navmenu ul');
if (menu) {
  const item = document.createElement('li');
  item.append(toggle);
  menu.append(item);
  toggle.addEventListener('click', toggleTheme);
  paintToggle();
}

// los modales viven dentro de las secciones; como paneles de vidrio los recortarían, van al body
for (const modal of document.querySelectorAll('main .modal')) document.body.append(modal);

/* ---------- Carga: la terminal ---------- */

const loader = document.getElementById('loader');
const term = document.getElementById('loaderTerm');
const marks = {}; // momentos reales: 'three' (llegó three.js) y 'world' (el mundo 3D ya está armado)
let loaded = false;

const count = (selector) => document.querySelectorAll(selector).length;

// lo que pesó three.js de verdad, si el navegador lo informa
function threeSize() {
  const entry = performance.getEntriesByType('resource').find((e) => e.name.includes('three.module'));
  const bytes = entry?.encodedBodySize || entry?.transferSize;
  return bytes ? `${Math.round(bytes / 1024)} kB` : '';
}

// cada paso se tilda cuando de verdad terminó (y no antes de su parte del avance, para que se llegue a leer)
const STEPS = [
  { text: () => t('t3d'), detail: threeSize, done: (p) => marks.three && p > 0.26 },
  { text: () => t('tDesk'), done: (p) => marks.world && p > 0.46 },
  { text: () => `${count('#portfolio .portfolio-item')} ${t('tProjects')}`, done: (p) => p > 0.62 },
  // (el carrusel de escritorio tiene cada certificado una vez; el de celular los repite, y en inglés sin traducir)
  { text: () => `${count('#certCarouselDesktop .stats-item') || count('#stats .stats-item')} ${t('tCerts')}`, done: (p) => p > 0.76 },
  { text: () => `${count('#skills .skill-item')} ${t('tStack')}`, done: (p) => p > 0.9 },
];
const CMD = 'npm run portfolio';
const SPIN = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';

function paint(typed, p, frame, ready) {
  let out = `<span class="u">mateo@portfolio</span> <span class="m">~ %</span> <span class="w">${CMD.slice(0, typed)}</span>`;
  if (typed < CMD.length) return `${out}<span class="cursor"></span>`;
  out += `\n\n<span class="m">&gt; mateo-rojas@${new Date().getFullYear()} start\n&gt; three + studio</span>\n\n`;
  for (const step of STEPS) {
    if (!step.ok && step.done(p)) step.ok = true;
    if (step.ok) out += `<span class="ok">✓</span> ${step.text()}${step.detail?.() ? ` <span class="m">${step.detail()}</span>` : ''}\n`;
    else {
      out += `<span class="a">${SPIN[frame % SPIN.length]}</span> ${step.text()}\n`;
      break; // los pasos aparecen de a uno, como en una terminal
    }
  }
  const filled = Math.round(p * 24);
  out += `\n<span class="a">${'█'.repeat(filled)}</span><span class="m">${'░'.repeat(24 - filled)}</span> ${String(Math.round(p * 100)).padStart(3)}%`;
  if (ready) out += `\n\n<span class="ok">✓</span> <span class="w">${t('tReady')} ${ready}s</span> <span class="m">→ ${t('tOpen')}</span><span class="cursor"></span>`;
  return out;
}

function reveal() {
  root.classList.add('is-ready');
  world?.intro();
  // la terminal vuela hasta la laptop del escritorio y se mete en ella; si no se ve, solo se desvanece
  const at = world?.locate?.('laptop');
  if (at) {
    const box = loader.querySelector('.term').getBoundingClientRect();
    loader.style.setProperty('--tx', `${Math.round(at.x - (box.left + box.width / 2))}px`);
    loader.style.setProperty('--ty', `${Math.round(at.y - (box.top + box.height / 2))}px`);
    loader.style.setProperty('--ts', '0.05');
  }
  loader.classList.add('is-out');
  setTimeout(() => loader.classList.add('is-gone'), 1300);
}

if (loader && term) {
  // primero se tipea el comando; después el avance llega solo hasta el 90 y espera ahí a que el mundo esté listo
  let typed = 0, shown = 0, goal = 0.06, frame = 0, ready = null, hold = 0;
  const run = setInterval(() => {
    frame++;
    if (typed < CMD.length) {
      if (frame > 14 && frame % 3) typed++;
    } else {
      goal = loaded ? 1 : Math.min(0.9, goal + 0.006);
      shown += Math.min((goal - shown) * 0.1, 0.017);
    }
    const p = shown < 0.994 ? shown : 1;
    if (p === 1 && !ready) {
      for (const step of STEPS) step.ok = true; // si algo no llegó a avisar (sin 3D), igual se termina
      ready = (performance.now() / 1000).toFixed(2);
    }
    term.innerHTML = paint(typed, p, frame >> 1, ready);
    if (ready && ++hold > 22) {
      clearInterval(run);
      reveal();
    }
  }, 30);
} else {
  root.classList.add('is-ready');
}

/* ---------- Mundo 3D ---------- */

// el avatar y la lámpara 2D usan GSAP y jQuery: solo se descargan si de verdad hacen falta
const LEGACY = [
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/CustomEase.min.js',
  'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/CustomWiggle.min.js',
  'https://code.jquery.com/jquery-3.6.0.min.js',
];
const script = (src) => new Promise((resolve, reject) => document.head.append(Object.assign(document.createElement('script'), { src, onload: resolve, onerror: reject })));

async function fallback() {
  root.classList.remove('stage-on');
  try {
    for (const src of LEGACY) await script(src); // en orden: los plugins necesitan a GSAP
  } catch (_) {
    return; // sin las librerías, el hero queda con el avatar quieto
  }
  for (const dormant of document.querySelectorAll('script[data-legacy-hero]')) {
    const script = document.createElement('script');
    script.textContent = dormant.textContent;
    dormant.replaceWith(script);
  }
  // el portfolio se había acomodado para el panel angosto
  window.Isotope?.data(document.querySelector('.isotope-container'))?.layout();
}

async function boot() {
  if (!root.classList.contains('stage-on')) return fallback();
  try {
    const { createWorld } = await import('./world.js');
    marks.three = true;
    world = createWorld({ mount: document.getElementById('stage'), t, theme: root.dataset.theme, toggleTheme });
    marks.world = true;
    await world.ready;
  } catch (error) {
    console.warn('[studio] el 3D no pudo arrancar:', error);
    world = null;
    fallback();
  }
}

// si el mundo tarda demasiado, la página se muestra igual
Promise.race([boot(), new Promise((resolve) => setTimeout(resolve, 9000))]).then(() => { loaded = true; });
