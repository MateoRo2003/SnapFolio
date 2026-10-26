/**
 * MATEO ROJAS — ECHO EDITION PORTFOLIO (2026)
 * La coreografía del video de referencia:
 * 1. Carga: el punto de "MATEO." se despega y dibuja un anillo ondulado; todo se funde con el hero.
 * 2. Cabecera transparente que se esconde al bajar y vuelve al subir.
 * 3. Un solo bucle de scroll para las secciones fijas:
 *    - About me: "ABOUT" y "ME" se separan y la tarjeta crece hasta llenar la pantalla.
 *    - Experiencia: el scroll vertical mueve los paneles de costado, con estela en los títulos.
 *    - Featured project: la cinta ondulada avanza con el scroll (o arrastrándola).
 *    - Works '26: el anillo hexagonal se vuelve un tambor 3D que gira con el scroll.
 * 4. Servicios, modales, copiar email e idioma ES / EN.
 */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => {
    const t = clamp((v - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  /* ========================================================================
     1. CARGA
     ======================================================================== */
  const preloader = document.getElementById('preloader');

  function endLoading() {
    root.classList.remove('is-loading');
  }

  if (preloader) {
    const svg = document.getElementById('preloaderSvg');
    const ring = document.getElementById('preloaderRing');
    const head = document.getElementById('preloaderHead');
    const tail = document.getElementById('preloaderTail');
    const word = document.getElementById('preloaderWord');
    const dot = document.getElementById('preloaderDot');
    let done = false;
    let raf = 0;

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      preloader.classList.add('is-done');
      endLoading();
      setTimeout(() => { preloader.style.display = 'none'; }, 1300);
    };

    // el anillo: arranca a la derecha de la palabra (donde está el punto) y gira hacia arriba
    function ringPath(cx, cy, R) {
      const pts = [];
      const steps = 220;
      for (let i = 0; i <= steps; i++) {
        const t = -(i / steps) * Math.PI * 2;
        const r = R * (1 + 0.065 * Math.sin(t * 9) + 0.025 * Math.sin(t * 4 + 0.6));
        pts.push(`${i ? 'L' : 'M'}${(cx + Math.cos(t) * r).toFixed(2)},${(cy + Math.sin(t) * r).toFixed(2)}`);
      }
      return pts.join('');
    }

    const start = () => {
      const vw = innerWidth;
      const vh = innerHeight;
      svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
      const box = word.getBoundingClientRect();
      const dotBox = dot.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const R = box.width / 2 + Math.max(14, box.height * 0.35);
      ring.setAttribute('d', ringPath(cx, cy, R));
      const len = ring.getTotalLength();
      const from = { x: dotBox.left + dotBox.width / 2, y: dotBox.top + dotBox.height / 2 };
      const to = ring.getPointAtLength(0);
      const t0 = performance.now();
      // tiempos (ms): la palabra entra, el punto sube al anillo, lo dibuja, una pausa y se va
      const LIFT = 420, DRAW_START = 720, DRAW = 1450, HOLD = 260;

      const place = (el, p) => {
        el.setAttribute('cx', p.x.toFixed(2));
        el.setAttribute('cy', p.y.toFixed(2));
      };

      const tick = (now) => {
        const t = now - t0;
        if (t > LIFT) preloader.classList.add('is-drawing');
        if (t < LIFT) {
          head.style.opacity = '0';
        } else if (t < DRAW_START) {
          const k = smooth(LIFT, DRAW_START, t);
          head.style.opacity = '1';
          place(head, { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k) });
        } else {
          const k = smooth(DRAW_START, DRAW_START + DRAW, t);
          ring.style.strokeDashoffset = String(1 - k);
          place(head, ring.getPointAtLength(k * len));
          place(tail, ring.getPointAtLength(Math.max(0, k - 0.018) * len));
          tail.style.opacity = k > 0.02 && k < 0.99 ? '0.8' : '0';
          head.style.opacity = String(1 - smooth(0.96, 1, k));
        }
        if (t > DRAW_START + DRAW + HOLD) return finish();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (prefersReducedMotion) {
      setTimeout(finish, 300);
    } else {
      // se mide la palabra recién con la fuente cargada (si tarda, se sigue igual)
      Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 700))]).then(start);
    }
    preloader.addEventListener('click', finish);
    window.addEventListener('keydown', finish, { once: true });
  } else {
    endLoading();
  }

  // retrato del hero: en pantallas táctiles no hay hover, un toque muestra la foto y otro la oculta
  const heroPortrait = document.getElementById('heroPortrait');
  heroPortrait?.addEventListener('click', () => {
    if (window.matchMedia('(hover: none)').matches) heroPortrait.classList.toggle('is-revealed');
  });

  /* ========================================================================
     2. CABECERA
     ======================================================================== */
  const header = document.getElementById('echoHeader');
  const navPills = Array.from(document.querySelectorAll('.nav-pill'));
  const darkIds = ['about', 'experience', 'contact'];
  let lastY = window.scrollY;

  function updateHeader(y) {
    if (!header) return;
    if (y > 160 && y > lastY + 3) header.classList.add('is-hidden');
    else if (y < lastY - 3 || y <= 160) header.classList.remove('is-hidden');
    lastY = y;
    header.classList.toggle('is-scrolled', y > 24);

    let onDark = false;
    for (const id of darkIds) {
      const r = document.getElementById(id)?.getBoundingClientRect();
      if (r && r.top <= 36 && r.bottom >= 36) onDark = true;
    }
    header.classList.toggle('is-dark-mode', onDark);

    const checkY = window.innerHeight * 0.35;
    let current = 'home';
    for (const pill of navPills) {
      const id = pill.getAttribute('href')?.slice(1);
      const r = id && document.getElementById(id)?.getBoundingClientRect();
      if (r && r.top <= checkY && r.bottom >= 100) current = id;
    }
    navPills.forEach((p) => p.classList.toggle('is-active', p.getAttribute('href') === `#${current}`));
  }

  // el avance de una sección fija: 0 cuando su borde de arriba toca el de la pantalla, 1 al soltarse
  function pinProgress(section) {
    const r = section.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    return span > 0 ? clamp(-r.top / span, 0, 1) : 0;
  }

  // lleva el scroll al punto de una sección fija que corresponde a cierto avance
  function scrollToProgress(section, p) {
    const top = section.getBoundingClientRect().top + window.scrollY;
    const span = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * p, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  /* ========================================================================
     3·. TRANSICIÓN HERO → ABOUT
     El hero queda fijo y el "About me" sube por encima con el borde en arco. Mientras sube,
     "EXPLORE MY" se va hacia arriba, "PORTFOLIO" se agranda y se desenfoca, el retrato se achica
     y todo se oscurece. Cuando el telón ya lo tapó, el hero deja de pintarse.
     ======================================================================== */
  const hero = document.getElementById('home');
  const heroLine1 = document.querySelector('.hero-title-line1');
  const heroLine2 = document.querySelector('.hero-title-line2');
  const heroPortraitEl = document.getElementById('heroPortrait');
  const heroMetas = Array.from(document.querySelectorAll('.hero-meta-left > *, .hero-meta-right > *'));
  let heroHidden = false;

  function updateHeroOut() {
    const aboutEl = document.getElementById('about');
    if (!hero || !aboutEl) return;
    const vh = window.innerHeight;
    const q = clamp(1 - aboutEl.getBoundingClientRect().top / vh, 0, 1);
    const e = q * q * (3 - 2 * q);
    hero.style.setProperty('--out', e.toFixed(4));
    aboutEl.style.setProperty('--arch', (1 - e).toFixed(4));
    aboutEl.classList.toggle('is-flat', e >= 1);
    if (heroLine1) {
      heroLine1.style.transform = `translate3d(0, ${(-e * 16).toFixed(2)}vh, 0)`;
      heroLine1.style.filter = e > 0.01 ? `blur(${(e * 7).toFixed(2)}px)` : '';
      heroLine1.style.opacity = (1 - e * 0.7).toFixed(3);
    }
    if (heroLine2) {
      heroLine2.style.transform = `translate3d(0, ${(-e * 5).toFixed(2)}vh, 0) scale(${(1 + e * 0.08).toFixed(4)})`;
      heroLine2.style.filter = e > 0.01 ? `blur(${(e * 9).toFixed(2)}px)` : '';
    }
    if (heroPortraitEl) {
      heroPortraitEl.style.transform = `translateX(-50%) translate3d(0, ${(-e * 6).toFixed(2)}vh, 0) scale(${(1 - e * 0.22).toFixed(4)})`;
    }
    heroMetas.forEach((el) => {
      el.style.transform = `translate3d(0, ${(e * 8).toFixed(2)}vh, 0)`;
    });
    // ya tapado del todo: no se pinta (es lo único fijo debajo de toda la página)
    const covered = q >= 1;
    if (covered !== heroHidden) {
      heroHidden = covered;
      hero.style.visibility = covered ? 'hidden' : '';
    }
  }

  /* ========================================================================
     3a. ABOUT ME — portal fijo
     ======================================================================== */
  const about = document.getElementById('about');
  const wordA = document.getElementById('aboutWordA');
  const wordB = document.getElementById('aboutWordB');
  let aboutSplit = 0;
  let aboutVel = 0;

  function updateAbout() {
    if (!about) return;
    const p = pinProgress(about);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw < 768;
    const split = smooth(0.02, 0.42, p);
    const grow = smooth(0.1, 0.62, p);
    const content = smooth(0.64, 0.8, p);

    // la tarjeta: de un rectángulo vertical en el centro a casi toda la pantalla
    const cardW = (mobile ? 0.94 : 0.92) * vw;
    const cardH = (mobile ? 0.86 : 0.88) * vh;
    const w = lerp(mobile ? 0.5 * vw : Math.max(0.21 * vw, 220), cardW, grow);
    const h = lerp(mobile ? 0.42 * vh : 0.55 * vh, cardH, grow);
    about.style.setProperty('--ci-x', `${((cardW - w) / 2).toFixed(1)}px`);
    about.style.setProperty('--ci-y', `${((cardH - h) / 2).toFixed(1)}px`);
    about.style.setProperty('--grow', grow.toFixed(4));
    about.style.setProperty('--content', content.toFixed(4));
    about.classList.toggle('is-open', content > 0.5);

    // "ABOUT" se va a la izquierda y "ME" a la derecha, con una estela mientras se mueven
    aboutVel = clamp(lerp(aboutVel, Math.abs(split - aboutSplit) * 40, 0.35), 0, 1);
    aboutSplit = split;
    const fade = 1 - smooth(0.4, 0.58, p);
    if (wordA) {
      wordA.style.transform = `translate3d(${(-split * (mobile ? 0.3 : 0.38) * vw).toFixed(1)}px, ${(-split * 0.05 * vh).toFixed(1)}px, 0)`;
      wordA.style.opacity = fade.toFixed(3);
    }
    if (wordB) {
      wordB.style.transform = `translate3d(${(split * (mobile ? 0.3 : 0.36) * vw).toFixed(1)}px, ${(split * 0.12 * vh).toFixed(1)}px, 0)`;
      wordB.style.opacity = fade.toFixed(3);
    }
    about.style.setProperty('--v', aboutVel.toFixed(3));
  }

  /* ========================================================================
     3b. EXPERIENCIA — el scroll vertical mueve los paneles de costado
     ======================================================================== */
  const expSection = document.getElementById('experience');
  const expViewport = document.getElementById('expViewport');
  const expTrack = expViewport?.querySelector('.exp-horizontal-track');
  const expTabBtns = Array.from(document.querySelectorAll('.exp-tab-btn'));
  const expSlides = Array.from(document.querySelectorAll('.exp-slide-card'));
  const expChapterLabel = document.getElementById('expChapterLabel');
  const expProgressBar = document.getElementById('expProgressBar');
  const watermarkTop = document.getElementById('watermarkTop');
  const watermarkBottom = document.getElementById('watermarkBottom');
  let activeExpIndex = -1;
  let expX = 0;
  let expVel = 0;

  // Las letras grises del fondo son dos tiras largas con los textos de todas las etapas (arriba los
  // puestos, abajo las fechas, en orden inverso). Se deslizan sin cortar con el scroll —la de arriba
  // hacia la izquierda y la de abajo hacia la derecha— y en cada etapa queda a la vista su texto.
  const wmTop = { el: watermarkTop, segs: [], path: null };
  const wmBottom = { el: watermarkBottom, segs: [], path: null };

  function buildStrip(strip, key, reverse) {
    if (!strip.el) return;
    const words = expSlides.map((sl) => sl.dataset[key] || '');
    const order = reverse ? words.map((_, i) => words.length - 1 - i) : words.map((_, i) => i);
    strip.el.textContent = '';
    strip.segs = new Array(words.length);
    order.forEach((i, k) => {
      const seg = document.createElement('span');
      seg.className = 'wm-seg';
      seg.textContent = words[i];
      strip.el.append(seg);
      strip.segs[i] = seg;
      if (k < order.length - 1) {
        const dot = document.createElement('span');
        dot.className = 'wm-dot';
        dot.textContent = '•';
        strip.el.append(dot);
      }
    });
  }
  buildStrip(wmTop, 'wmTop', false);
  buildStrip(wmBottom, 'wmBottom', true);

  // Curva monótona y suave (Fritsch–Carlson) por puntos (avance → desplazamiento): la velocidad cambia
  // de a poco entre una etapa y la siguiente, sin saltos ni frenadas.
  function smoothPath(pts) {
    const n = pts.length;
    if (n < 2) return () => (pts[0] ? pts[0][1] : 0);
    const d = [];
    for (let i = 0; i < n - 1; i++) d.push((pts[i + 1][1] - pts[i][1]) / Math.max(1e-6, pts[i + 1][0] - pts[i][0]));
    const m = [d[0]];
    for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
    m.push(d[n - 2]);
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
      if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
    }
    return (x) => {
      if (x <= pts[0][0]) return pts[0][1];
      if (x >= pts[n - 1][0]) return pts[n - 1][1];
      let i = 0;
      while (x > pts[i + 1][0]) i++;
      const h = pts[i + 1][0] - pts[i][0], t = (x - pts[i][0]) / h, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * pts[i][1] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * pts[i + 1][1] + (t3 - t2) * h * m[i + 1];
    };
  }

  // en qué avance queda cada etapa acomodada (el mismo cálculo que las pestañas)
  function slideProgress(slide) {
    const travel = expTravel();
    return travel ? clamp((slide.offsetLeft - expViewport.clientWidth * 0.12) / travel, 0, 1) : 0;
  }

  function measureStrips() {
    if (!expSlides.length || !expViewport) return;
    const pad = expViewport.clientWidth * 0.04;
    const lead = expViewport.clientWidth * 0.18;
    for (const strip of [wmTop, wmBottom]) {
      if (!strip.el || !strip.segs.length) continue;
      const pts = [];
      expSlides.forEach((sl, i) => {
        const at = slideProgress(sl);
        const x = pad - strip.segs[i].offsetLeft;
        if (!pts.length || at > pts[pts.length - 1][0] + 1e-4) pts.push([at, x]);
      });
      // antes de la primera etapa y después de la última también se mueve (no hay tramos quietos)
      const dir = strip === wmTop ? 1 : -1;
      if (pts[0][0] > 0) pts.unshift([0, pts[0][1] + dir * lead]);
      if (pts[pts.length - 1][0] < 1) pts.push([1, pts[pts.length - 1][1] - dir * lead]);
      strip.path = smoothPath(pts);
    }
  }

  function setActiveExpSlide(idx) {
    if (idx === activeExpIndex || !expSlides[idx]) return;
    activeExpIndex = idx;
    const slide = expSlides[idx];
    expTabBtns.forEach((btn, i) => btn.classList.toggle('is-active', i === idx));
    if (expChapterLabel) expChapterLabel.textContent = slide.dataset.chapter || '';
  }

  function expTravel() {
    return expTrack && expViewport ? Math.max(0, expTrack.scrollWidth - expViewport.clientWidth) : 0;
  }

  function updateExperience() {
    if (!expSection || !expTrack) return;
    const p = pinProgress(expSection);
    const x = -p * expTravel();
    expVel = clamp(lerp(expVel, Math.abs(x - expX) / 30, 0.3), 0, 1);
    expX = x;
    expTrack.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
    expSection.style.setProperty('--v', expVel.toFixed(3));
    if (expProgressBar) expProgressBar.style.width = `${(8 + p * 92).toFixed(1)}%`;
    if (!wmTop.path) measureStrips();
    for (const strip of [wmTop, wmBottom]) {
      if (strip.el && strip.path) strip.el.style.transform = `translate3d(${strip.path(p).toFixed(1)}px, 0, 0)`;
    }

    // el panel activo es el que pasa por el 45 % de la pantalla
    const center = -x + expViewport.clientWidth * 0.45;
    let closest = 0;
    let min = Infinity;
    expSlides.forEach((sl, i) => {
      const d = Math.abs(sl.offsetLeft + sl.offsetWidth * 0.3 - center);
      if (d < min) {
        min = d;
        closest = i;
      }
    });
    setActiveExpSlide(closest);
  }

  expTabBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (expSlides[i] && expSection) scrollToProgress(expSection, slideProgress(expSlides[i]));
    });
  });
  // las medidas cambian con el tamaño de la ventana y cuando termina de cargar la fuente
  window.addEventListener('resize', () => { wmTop.path = null; });
  document.fonts?.ready.then(() => { wmTop.path = null; requestAnimationFrame(updateExperience); });

  /* ========================================================================
     3c. FEATURED PROJECT — cinta ondulada
     ======================================================================== */
  const landingProjects = [
    {
      title: 'Estudio Jurídico MJHD',
      sub: 'Sitio Web Institucional & Consultoría Legal · SEO Optimizado',
      img: 'assets/img/portfolio/cards/estudio-juridico-mjhd.webp',
      url: 'https://www.mjhdjuridica.com.ar',
    },
    {
      title: 'PresenciaWeb Studio',
      sub: 'Landing Page Agencia Digital · Diseño & Identidad de Marca',
      img: 'assets/img/portfolio/cards/presenciaweb.webp',
      url: 'https://presencia-web.vercel.app/',
    },
    {
      title: 'Travel Online Agency',
      sub: 'Landing Page Turismo · Traslados y Excursiones en Misiones',
      img: 'assets/img/portfolio/cards/travelonlineagency.webp',
      url: 'https://www.travelonlineagency.com.ar',
    },
    {
      title: 'DanyTours Iguazú',
      sub: 'Landing Page Turística · Reservas Directas por WhatsApp',
      img: 'assets/img/portfolio/cards/danytours.webp',
      url: 'https://www.danytours.com.ar',
    },
    {
      title: 'Traslados Márquez',
      sub: 'Landing Page Ejecutiva · Remises Turísticos en Puerto Iguazú',
      img: 'assets/img/portfolio/cards/traslados-marquez.webp',
      url: 'https://www.trasladosmarquez.com.ar',
    },
    {
      title: 'LGK Traslados',
      sub: 'Landing Page Comercial · Viajes en la Triple Frontera',
      img: 'assets/img/portfolio/cards/lgk-traslados.webp',
      url: 'https://www.trasladoslgk.com.ar',
    },
    {
      title: 'Simulador de Amortización',
      sub: 'Web App Financiera · Cálculo Interactivo de Préstamos',
      img: 'assets/img/portfolio/cards/simulador-de-amortizacion.webp',
      url: 'https://amortizacion-fronted.vercel.app/',
    },
  ];

  const landings = document.getElementById('landings');
  const waveCanvas = document.getElementById('waveRibbonCanvas');
  const waveTitleEl = document.getElementById('waveProjectTitle');
  const waveSubEl = document.getElementById('waveProjectSub');
  const waveCountEl = document.getElementById('waveProjectCount');
  const waveLinkEl = document.getElementById('waveProjectLink');
  let updateRibbon = () => {};

  if (waveCanvas && landings) {
    const wCtx = waveCanvas.getContext('2d');
    const n = landingProjects.length;
    const imgs = landingProjects.map((proj) => {
      const im = new Image();
      im.decoding = 'async';
      im.src = proj.img;
      im.onload = () => { dirty = true; wake(); };
      return im;
    });
    let pos = 0;
    let target = 0;
    let dragging = false;
    let dragX = 0;
    let dragPos = 0;
    let manualUntil = 0; // después de arrastrar, el scroll no pisa la posición elegida por un rato
    let lastIdx = -1;
    let visible = false;
    let running = false;
    let dirty = true;

    const pad2 = (v) => String(v).padStart(2, '0');
    function caption(centerIdx) {
      const idx = ((centerIdx % n) + n) % n;
      if (idx === lastIdx) return;
      lastIdx = idx;
      const item = landingProjects[idx];
      if (waveTitleEl) waveTitleEl.textContent = item.title;
      if (waveSubEl) waveSubEl.textContent = item.sub;
      if (waveCountEl) waveCountEl.textContent = `${pad2(idx + 1)} / ${pad2(n)}`;
      if (waveLinkEl) waveLinkEl.href = item.url;
    }

    function draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = waveCanvas.clientWidth || window.innerWidth;
      const ch = waveCanvas.clientHeight || 400;
      if (waveCanvas.width !== Math.round(cw * dpr) || waveCanvas.height !== Math.round(ch * dpr)) {
        waveCanvas.width = Math.round(cw * dpr);
        waveCanvas.height = Math.round(ch * dpr);
      }
      wCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wCtx.clearRect(0, 0, cw, ch);

      const cardW = clamp(cw * 0.4, 250, 640);
      const cardH = Math.min(cardW * 0.6, ch * 0.62);
      const stepX = cardW * 1.06;
      const centerIndex = Math.round(pos);
      caption(centerIndex);

      // cada tarjeta se dibuja en tiras verticales que siguen una curva en S: a la izquierda baja,
      // a la derecha sube, y en los bordes se agranda (más cerca), como la cinta del video
      const slices = Math.round(clamp(cardW / 5, 48, 110)); // tiras finas: el borde de la curva queda liso
      for (let offset = -2; offset <= 2; offset++) {
        const v = centerIndex + offset;
        const img = imgs[((v % n) + n) % n];
        const left = cw * 0.5 + (v - pos) * stepX - cardW * 0.5;
        if (left > cw + 50 || left + cardW < -50) continue;
        const stripW = cardW / slices;
        for (let s = 0; s < slices; s++) {
          const sx = left + s * stripW;
          const nx = (sx + stripW * 0.5 - cw * 0.5) / (cw * 0.5);
          const bend = Math.sin(nx * Math.PI * 0.9) * ch * 0.17 * Math.min(1, Math.abs(nx) * 1.5);
          const stripH = cardH * (1 + Math.min(1, Math.abs(nx)) * 0.28);
          const sy = (ch - stripH) * 0.5 - bend;
          if (img.complete && img.naturalWidth) {
            const srcW = img.naturalWidth / slices;
            wCtx.drawImage(img, s * srcW, 0, srcW, img.naturalHeight, sx, sy, stripW + 0.8, stripH);
          } else {
            wCtx.fillStyle = '#1d1d22';
            wCtx.fillRect(sx, sy, stripW + 0.8, stripH);
          }
          const shade = Math.min(0.45, Math.abs(nx) * 0.32);
          if (shade > 0.03) {
            wCtx.fillStyle = `rgba(9,9,11,${shade.toFixed(3)})`;
            wCtx.fillRect(sx, sy, stripW + 0.8, stripH);
          }
        }
      }
    }

    // se dibuja solo si la sección se ve y algo cambió
    function frame() {
      running = false;
      if (!visible) return;
      const before = pos;
      pos = dragging || prefersReducedMotion ? target : pos + (target - pos) * 0.12;
      if (Math.abs(target - pos) < 0.0005) pos = target;
      if (dirty || pos !== before) {
        dirty = false;
        draw();
      }
      if (pos !== target || dragging) wake();
    }
    function wake() {
      if (running || !visible) return;
      running = true;
      requestAnimationFrame(frame);
    }

    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      dirty = true;
      wake();
    }).observe(waveCanvas);
    window.addEventListener('resize', () => { dirty = true; wake(); });

    updateRibbon = () => {
      if (dragging || performance.now() < manualUntil) return;
      const next = pinProgress(landings) * (n - 1);
      if (next !== target) {
        target = next;
        wake();
      }
    };

    waveCanvas.addEventListener('pointerdown', (e) => {
      dragging = true;
      dragX = e.clientX;
      dragPos = target;
      waveCanvas.setPointerCapture(e.pointerId);
      wake();
    });
    waveCanvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      target = dragPos - (e.clientX - dragX) / 320;
      wake();
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      target = Math.round(target);
      manualUntil = performance.now() + 1500;
      wake();
    };
    waveCanvas.addEventListener('pointerup', endDrag);
    waveCanvas.addEventListener('pointercancel', endDrag);
  }

  /* ========================================================================
     3d. WORKS '26 — anillo hexagonal que se vuelve tambor 3D
     ======================================================================== */
  const flagshipWorks = [
    {
      id: 'orbita',
      title: 'Órbita',
      kind: 'Nuevo · Co-founder & CEO · Tiendas online sin comisión',
      img: 'assets/img/portfolio/cards/orbita.webp',
      url: 'https://orbita.site',
    },
    {
      id: 'paperflix',
      title: 'Paperflix',
      kind: 'Plataforma EdTech · +3.200 Escuelas en Chile',
      img: 'assets/img/portfolio/cards/paperflix.webp',
      gallery: [
        'assets/img/portfolio/paperflix/1.png',
        'assets/img/portfolio/paperflix/2.png',
        'assets/img/portfolio/paperflix/3.png',
        'assets/img/portfolio/paperflix/4.png',
        'assets/img/portfolio/paperflix/5.png',
        'assets/img/portfolio/paperflix/6.png',
      ],
    },
    {
      id: 'siti',
      title: 'S.I.T.I System',
      kind: 'Sistema Full Stack + Asistente IA Propio',
      img: 'assets/img/portfolio/cards/s-i-t-i-sistema-integral-de-tiendas-inde.webp',
      url: 'https://siti.mateorojas.com.ar',
    },
    {
      id: 'petty',
      title: 'Petty Joyas',
      kind: 'E-Commerce + POS con QR & WhatsApp Bot',
      img: 'assets/img/portfolio/cards/petty-joyas.webp',
      url: 'https://pettyjoyas.com.ar',
    },
    {
      id: 'mipaperlux',
      title: 'MiPaperlux',
      kind: 'Plataforma EdTech — Onboarding Gamificado',
      img: 'assets/img/portfolio/cards/mipaperlux.webp',
      gallery: [
        'assets/img/portfolio/mipaperlux/1.png',
        'assets/img/portfolio/mipaperlux/2.png',
        'assets/img/portfolio/mipaperlux/3.png',
        'assets/img/portfolio/mipaperlux/4.png',
      ],
    },
    {
      id: 'gabygor',
      title: 'GabyGor',
      kind: 'Reserva de Turnos en Tiempo Real',
      img: 'assets/img/portfolio/cards/gabygor.webp',
      url: 'https://gabygor.com.ar',
    },
    {
      id: 'gvstore',
      title: 'GV Store',
      kind: 'E-Commerce Deportivo Full Stack',
      img: 'assets/img/portfolio/cards/gv-store.webp',
      url: 'https://gvstore.com.ar',
    },
    {
      id: 'taccu',
      title: 'Taccu Rewards',
      kind: 'SaaS de Fidelización & Puntos',
      img: 'assets/img/portfolio/cards/taccu.webp',
      url: 'https://taccu.vercel.app/',
    },
    {
      id: 'tefaltacalle',
      title: 'TeFaltaCalleOK',
      kind: 'E-Commerce Streetwear & Panel Admin',
      img: 'assets/img/portfolio/cards/tefaltacalleok.webp',
      url: 'https://www.tefaltacalleok.com',
    },
  ];

  const worksSection = document.getElementById('works');
  const worksViewport = document.getElementById('works3dViewport');
  const worksCardsRig = document.getElementById('worksCardsRig');
  const worksIndexList = document.getElementById('worksIndexList');
  const workInfo = document.querySelector('.works-active-info');
  const workKindEl = document.getElementById('worksActiveKind');
  const workTitleEl = document.getElementById('worksActiveTitle');
  const workCtaEl = document.getElementById('worksActiveCta');
  let cardElements = [];
  let indexItems = [];
  let activeWorkIdx = -1;
  let drumPos = 0;
  let morph = 0;
  let worksRingSpin = 0; // el anillo gira un poco mientras se llega a la sección

  function openGalleryModal(title, images) {
    const modal = document.getElementById('galleryModal');
    const modalTitle = document.getElementById('galleryModalTitle');
    const modalBody = document.getElementById('galleryModalBody');
    if (!modal || !modalBody) return;
    if (modalTitle) modalTitle.textContent = `${title} — Capturas del Sistema`;
    modalBody.innerHTML = images
      .map(
        (src) =>
          `<div style="margin-bottom:1.25rem;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.12)"><img src="${src}" alt="${title}" loading="lazy" style="width:100%;display:block"></div>`
      )
      .join('');
    modal.classList.add('is-open');
  }

  function openWork(w) {
    if (w.url) window.open(w.url, '_blank', 'noopener');
    else if (w.gallery) openGalleryModal(w.title, w.gallery);
  }

  function setActiveWork(idx) {
    if (idx === activeWorkIdx) return;
    activeWorkIdx = idx;
    const w = flagshipWorks[idx];
    if (workKindEl) workKindEl.textContent = w.kind;
    if (workTitleEl) workTitleEl.textContent = w.title.toUpperCase();
    if (workCtaEl) {
      workCtaEl.innerHTML = w.url ? 'VER PROYECTO EN VIVO <i class="bi bi-arrow-up-right"></i>' : 'VER GALERÍA DEL SISTEMA <i class="bi bi-images"></i>';
      workCtaEl.href = w.url || '#works';
      workCtaEl.target = w.url ? '_blank' : '';
      workCtaEl.rel = 'noopener';
      workCtaEl.onclick = w.url ? null : (e) => {
        e.preventDefault();
        openGalleryModal(w.title, w.gallery);
      };
    }
    indexItems.forEach((li, i) => li.classList.toggle('is-active', i === idx));
  }

  // dónde va cada tarjeta: en el anillo (6 lugares alrededor de "WORKS '26") o en el tambor
  function placeWorks() {
    const n = flagshipWorks.length;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const cardH = cardElements[0]?.offsetHeight || 250;
    const ringR = Math.min(vh * 0.27, vw * 0.17);
    const drumR = cardH * 1.9;
    cardElements.forEach((card, i) => {
      // anillo
      const slot = i % 6;
      const th = ((slot * 60 - 90 + worksRingSpin) * Math.PI) / 180;
      const rx = Math.cos(th) * ringR;
      const ry = Math.sin(th) * ringR;
      const rz = (th * 180) / Math.PI + 90;
      const ringOpacity = i < 6 ? 1 : 0;
      // tambor
      let delta = i - drumPos;
      if (delta > n / 2) delta -= n;
      if (delta < -n / 2) delta += n;
      const a = delta * 0.75;
      const dy = Math.sin(a) * drumR;
      const dz = (Math.cos(a) - 1) * drumR;
      const drumOpacity = clamp(Math.cos(a) * 1.8 - 0.1, 0, 1);
      // mezcla
      const m = morph;
      const x = lerp(rx, 0, m);
      const y = lerp(ry, dy, m);
      const z = lerp(0, dz, m);
      const rotZ = lerp(rz, 0, m);
      const rotX = lerp(0, (-a * 180) / Math.PI, m);
      const scale = lerp(0.52, 1, m);
      const opacity = lerp(ringOpacity, drumOpacity, m);
      card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateZ(${rotZ.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      card.style.opacity = opacity.toFixed(3);
      card.style.zIndex = String(Math.round(100 + (m > 0.5 ? dz : -slot)));
      card.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
    });
  }

  function updateWorks() {
    if (!worksSection || !cardElements.length) return;
    const p = pinProgress(worksSection);
    const n = flagshipWorks.length;
    worksRingSpin = smooth(0, 0.16, p) * 40;
    morph = smooth(0.14, 0.3, p);
    drumPos = clamp((p - 0.3) / 0.66, 0, 1) * (n - 1);
    worksViewport?.style.setProperty('--morph', morph.toFixed(3));
    if (workInfo) workInfo.style.opacity = morph.toFixed(3);
    setActiveWork(Math.round(drumPos));
    placeWorks();
  }

  // a qué avance hay que llevar el scroll para que un proyecto quede al frente del tambor
  const workProgress = (i) => 0.3 + (i / (flagshipWorks.length - 1)) * 0.66;

  if (worksCardsRig && worksIndexList) {
    worksCardsRig.innerHTML = flagshipWorks
      .map(
        (w, i) => `
      <article class="work-3d-card" data-idx="${i}" tabindex="0" role="button" aria-label="${w.title}">
        <div class="work-card-browser-bar">
          <div class="browser-dots"><span></span><span></span><span></span></div>
          <span>${w.title.toLowerCase().replace(/\s+/g, '')}.app</span>
          <span>↗</span>
        </div>
        <div class="work-card-img-wrap">
          <img src="${w.img}" alt="${w.title}" loading="lazy">
          <span class="work-card-overlay-badge">${w.title}</span>
        </div>
      </article>`
      )
      .join('');
    worksIndexList.innerHTML = flagshipWorks
      .map((w, i) => `<li class="works-index-item"><button type="button" data-idx="${i}">${w.title}</button></li>`)
      .join('');
    cardElements = Array.from(worksCardsRig.querySelectorAll('.work-3d-card'));
    indexItems = Array.from(worksIndexList.querySelectorAll('.works-index-item'));

    cardElements.forEach((card, i) => {
      card.addEventListener('click', () => {
        if (morph > 0.9 && Math.round(drumPos) === i) openWork(flagshipWorks[i]);
        else scrollToProgress(worksSection, workProgress(i));
      });
    });
    indexItems.forEach((li, i) => {
      li.querySelector('button')?.addEventListener('click', () => scrollToProgress(worksSection, workProgress(i)));
    });

    // arrastrar el tambor también lo gira (mueve el scroll de la página)
    let dragY = null;
    worksViewport?.addEventListener('pointerdown', (e) => { dragY = e.clientY; });
    window.addEventListener('pointerup', (e) => {
      if (dragY === null) return;
      const dy = e.clientY - dragY;
      dragY = null;
      if (Math.abs(dy) < 36) return;
      const next = clamp(Math.round(drumPos) + (dy < 0 ? 1 : -1), 0, flagshipWorks.length - 1);
      scrollToProgress(worksSection, workProgress(next));
    });
    setActiveWork(0);
  }

  /* ========================================================================
     3e. EL BUCLE DE SCROLL (uno solo, a lo sumo una vez por cuadro)
     ======================================================================== */
  let ticking = false;
  let settle = 0;

  function onFrame() {
    ticking = false;
    const y = window.scrollY;
    updateHeader(y);
    updateHeroOut();
    updateAbout();
    updateExperience();
    updateRibbon();
    updateWorks();
    // las estelas (velocidad) se apagan solas unos cuadros después de parar
    if ((aboutVel > 0.01 || expVel > 0.01) && settle++ < 40) requestTick();
    else settle = 0;
  }
  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onFrame);
  }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  requestTick();

  /* ========================================================================
     8. SERVICES ACCORDION (00:26)
     ======================================================================== */
  const serviceItems = Array.from(document.querySelectorAll('.service-item'));
  serviceItems.forEach((item) => {
    const trigger = item.querySelector('.service-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      serviceItems.forEach((other) => {
        other.classList.remove('is-open');
        const btn = other.querySelector('.service-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ========================================================================
     9. MODALS, EMAIL COPY TOAST & LANGUAGE SWITCH (ES / EN)
     ======================================================================== */
  const toastEl = document.getElementById('toastNotification');
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  }

  // Copy email button
  document.querySelectorAll('[data-copy-email]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const email = 'rojas.mateo.web@gmail.com';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
          showToast('Email copiado: rojas.mateo.web@gmail.com');
        });
      }
    });
  });

  // Open/Close Modals
  document.querySelectorAll('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-open-modal');
      const modal = targetId ? document.getElementById(targetId) : null;
      if (modal) modal.classList.add('is-open');
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.echo-modal');
      if (modal) modal.classList.remove('is-open');
    });
  });

  document.querySelectorAll('.echo-modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('is-open');
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.echo-modal.is-open').forEach((m) => m.classList.remove('is-open'));
    }
  });

  // Technical Articles reader inside Articles Modal (uses window.ARTICLES from articles.js if loaded)
  document.querySelectorAll('[data-read-article]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-read-article');
      const readerModal = document.getElementById('articleReaderModal');
      const readerTitle = document.getElementById('articleReaderTitle');
      const readerBody = document.getElementById('articleReaderBody');
      if (!readerModal || !readerBody) return;

      const articlesMap = window.ARTICLES || {};
      const item = articlesMap[id];
      if (item) {
        if (readerTitle) readerTitle.textContent = item.cat || 'Artículo Técnico';
        readerBody.innerHTML = `<h2 style="font-size:1.65rem;margin-bottom:0.5rem">${item.title}</h2><p style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted-dark);margin-bottom:1.5rem">${item.date} · ${item.read}</p><div style="line-height:1.75;color:rgba(255,255,255,0.86)">${item.body}</div>`;
      } else {
        readerBody.innerHTML = `<p>Artículo seleccionado (#${id}).</p>`;
      }
      readerModal.classList.add('is-open');
    });
  });

  // Contact Form Submission feedback
  const contactForm = document.getElementById('echoContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(contactForm);
      const name = fd.get('name') || '';
      const subject = fd.get('subject') || 'Consulta desde Portfolio';
      const message = fd.get('message') || '';
      const mailto = `mailto:rojas.mateo.web@gmail.com?subject=${encodeURIComponent(
        `${subject} — ${name}`
      )}&body=${encodeURIComponent(String(message))}`;
      window.location.href = mailto;
      showToast('Abriendo tu cliente de correo...');
    });
  }

  // Bilingual Toggle (ES / EN)
  const langBtn = document.getElementById('langSwitchBtn');
  let currentLang = 'es';
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'es' ? 'en' : 'es';
      langBtn.textContent = currentLang === 'es' ? 'EN' : 'ES';
      document.documentElement.lang = currentLang;
      document.querySelectorAll('[data-es][data-en]').forEach((el) => {
        el.textContent = el.getAttribute(`data-${currentLang}`) || el.textContent;
      });
      showToast(currentLang === 'es' ? 'Idioma: Español' : 'Language: English');
    });
  }
})();
