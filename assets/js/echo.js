/**
 * MATEO ROJAS — ECHO EDITION PORTFOLIO (2026)
 * La coreografía del video de referencia:
 * 1. Carga: la firma "Mateo Rojas" se escribe con una lapicera de luz y se deshace en polvo.
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
  // idiomas (i18n.js): lo que se escribe desde acá va en español y se pasa por localize()
  const i18n = window.echoI18n || { lang: 'es', localize() {}, set() {}, original: (n) => n.nodeValue };
  const localize = (el) => i18n.localize(el);

  /* ========================================================================
     1. CARGA
     ======================================================================== */
  const preloader = document.getElementById('preloader');

  function endLoading() {
    root.classList.remove('is-loading');
    document.dispatchEvent(new Event('echo:loaded'));
  }

  if (preloader) {
    root.classList.add('is-signing'); // el logo se escribe cuando termina la carga
    const svg = document.getElementById('signSvg');
    const sign = preloader.querySelector('.preloader-sign');
    const strokes = Array.from(document.querySelectorAll('#signInk path'));
    const caption = document.getElementById('signCaption');
    const sparks = document.getElementById('signSparks');
    const sctx = sparks.getContext('2d');
    let done = false;
    let doneAt = 0;
    let raf = 0;

    const finish = (skip) => {
      if (done) return;
      done = true;
      doneAt = performance.now();
      if (skip === true || !raf) {
        cancelAnimationFrame(raf);
        sctx.clearRect(0, 0, sparks.width, sparks.height);
      }
      preloader.classList.add('is-done');
      endLoading();
      setTimeout(() => { preloader.style.display = 'none'; cancelAnimationFrame(raf); }, 1300);
      // mientras se va la carga, la firma chica del navbar se escribe sola (arranca vacía)
      if (!prefersReducedMotion) hideLogoInk();
      setTimeout(writeLogo, prefersReducedMotion || skip === true ? 0 : 450);
    };
    const skip = () => finish(true);

    // el logo usa los mismos trazos que la firma grande: se vuelven a tapar y la lapicera los
    // destapa de nuevo, más rápido y sin levantarse
    // (la firma grande ya está entera con su letra completa encima: taparle los trazos no se nota)
    // (cada trazo queda invisible hasta que la lapicera llega: si no, su punta redonda se ve como un punto)
    const hideLogoInk = () => strokes.forEach((p, i) => {
      p.style.opacity = '0';
      p.style.strokeDashoffset = String(lens[i]);
    });
    const writeLogo = () => {
      if (prefersReducedMotion) {
        root.classList.remove('is-signing');
        return;
      }
      const LOGO_MS = 900;
      const at = [];
      lens.reduce((sum, len) => { at.push(sum / total); return sum + len; }, 0);
      let w0 = 0;
      const step = (now) => {
        w0 ||= now;
        const k = clamp((now - w0) / LOGO_MS, 0, 1);
        const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; // arranca y termina suave
        strokes.forEach((p, i) => {
          const share = lens[i] / total;
          const drawn = clamp((e - at[i]) / share, 0, 1) * lens[i];
          p.style.opacity = drawn > 0 ? '1' : '0';
          p.style.strokeDashoffset = String(lens[i] - drawn);
        });
        if (k < 1) requestAnimationFrame(step);
        else root.classList.remove('is-signing');
      };
      requestAnimationFrame(step);
    };

    // "FULL STACK DEVELOPER" va letra por letra
    const letters = caption ? Array.from(caption.textContent).map((ch) => {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00a0' : ch;
      return span;
    }) : [];
    if (caption) caption.replaceChildren(...letters);

    // cada trazo de la máscara se prepara con su largo real: la lapicera avanza pareja en todos
    const lens = strokes.map((p) => p.getTotalLength());
    const shown = lens.map(() => -1);
    strokes.forEach((p, i) => {
      p.style.strokeDasharray = `${lens[i]} ${lens[i]}`;
      p.style.strokeDashoffset = String(lens[i]);
    });
    const LIFT = 10; // ms que la lapicera "se levanta" entre trazos (la letra de pincel tiene muchos)
    const total = lens.reduce((x, y) => x + y, 0);
    const DRAW = 2200; // ms para toda la firma
    const speed = total / (DRAW - LIFT * strokes.length); // unidades del SVG por ms
    const starts = [];
    lens.reduce((at, len) => { starts.push(at); return at + len / speed + LIFT; }, 0);
    const CAPTION_AT = DRAW * 0.78, HOLD = 380, WIPE = 650;
    const isDot = strokes.map((p) => p.hasAttribute('data-dot'));

    // ---- la luz: chispas, cola y polvo, en un canvas encima de la firma ----
    let vw = 0, vh = 0, dpr = 1, ctm = null, box = null, fx = 1;
    const sizeSparks = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      vw = window.innerWidth;
      vh = window.innerHeight;
      sparks.width = Math.round(vw * dpr);
      sparks.height = Math.round(vh * dpr);
      ctm = svg.getScreenCTM();
      box = svg.getBoundingClientRect();
      // la luz se achica con la firma (en un celular la firma mide un tercio que en escritorio)
      fx = clamp(ctm.a / 0.54, 0.4, 1);
    };
    const toScreen = (pt) => [pt.x * ctm.a + ctm.e, pt.y * ctm.d + ctm.f];
    // un punto de luz difuso, dibujado una sola vez y reusado por todas las partículas
    const tint = (getComputedStyle(preloader).getPropertyValue('--sign-tint').trim() || '255 255 255').split(/\s+/).join(',');
    const dot = (rgb) => {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, `rgba(${rgb},1)`);
      grad.addColorStop(0.22, `rgba(${rgb},0.6)`);
      grad.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      return c;
    };
    const glow = dot('255,255,255');
    const glowTint = dot(tint);
    const parts = [];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const emit = (x, y, o = {}) => parts.push({
      x, y,
      vx: (o.vx ?? rnd(-0.04, 0.04)) * (0.4 + 0.6 * fx),
      vy: (o.vy ?? rnd(-0.06, 0.02)) * (0.4 + 0.6 * fx),
      age: -(o.delay || 0),
      life: o.life ?? rnd(450, 1100),
      size: (o.size ?? rnd(2.5, 8)) * (0.5 + 0.5 * fx),
      alpha: o.alpha ?? 1,
      drift: o.drift ?? 0,
      img: o.img ?? (Math.random() < 0.6 ? glowTint : glow),
    });
    const stepSparks = (dt, now) => {
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sctx.clearRect(0, 0, vw, vh);
      sctx.globalCompositeOperation = 'lighter';
      const drag = Math.pow(0.985, dt / 16.7);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.age += dt;
        if (p.age < 0) continue;
        if (p.age > p.life) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
        const k = p.age / p.life;
        // frenan y suben de a poco, como brasas; el polvo de la salida además ondula
        p.vx = p.vx * drag + (p.drift ? Math.sin(p.y * 0.025 + now * 0.003) * p.drift * dt : 0);
        p.vy = p.vy * drag - 0.00003 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const s = p.size * (1 - k * 0.5);
        sctx.globalAlpha = p.alpha * (1 - k) * (1 - k);
        sctx.drawImage(p.img, p.x - s / 2, p.y - s / 2, s, s);
      }
      sctx.globalAlpha = 1;
    };
    // la cola de luz: un tramo que se afina hacia atrás, detrás de la punta de la lapicera
    const comet = (i, drawn) => {
      const path = strokes[i];
      const TAIL = 340, N = 22;
      const pts = [];
      for (let k = N; k >= 0; k--) {
        const at = drawn - (TAIL * k) / N;
        if (at >= 0) pts.push([toScreen(path.getPointAtLength(at)), 1 - k / N]); // f: 0 en la cola, 1 en la punta
      }
      sctx.lineCap = 'round';
      // dos pasadas: un halo ancho y suave, y el núcleo brillante que se afina hacia atrás
      for (const [wide, alpha] of [[3.2, 0.16], [1, 0.85]]) {
        for (let k = 1; k < pts.length; k++) {
          const [[x0, y0]] = pts[k - 1];
          const [[x1, y1], f] = pts[k];
          sctx.strokeStyle = `rgba(${tint},${alpha * f * f})`;
          sctx.lineWidth = (0.8 + f * 4.2) * wide * fx;
          sctx.beginPath();
          sctx.moveTo(x0, y0);
          sctx.lineTo(x1, y1);
          sctx.stroke();
        }
      }
      const [hx, hy] = pts[pts.length - 1][0];
      const g = 68 * fx, c = 18 * (0.5 + 0.5 * fx);
      sctx.drawImage(glowTint, hx - g / 2, hy - g / 2, g, g);
      sctx.drawImage(glow, hx - c / 2, hy - c / 2, c, c);
      return [hx, hy];
    };

    // la salida: la firma se deshace en polvo de luz siguiendo una barrida de izquierda a derecha
    let dissolving = false;
    const dissolve = () => {
      dissolving = true;
      sign.style.setProperty('--wipe', `${WIPE}ms`);
      sign.classList.add('is-dissolving');
      const left = box.left - 0.25 * box.width;
      for (let i = 0; i < strokes.length; i++) {
        for (let at = 0; at < lens[i]; at += 8) {
          const [x, y] = toScreen(strokes[i].getPointAtLength(at));
          emit(x + rnd(-2.5, 2.5), y + rnd(-2.5, 2.5), {
            delay: WIPE * clamp((x - left) / (1.5 * box.width), 0, 1),
            life: rnd(650, 1400),
            vx: rnd(0.02, 0.14),
            vy: rnd(-0.11, -0.01),
            size: rnd(2, 6.5),
            alpha: rnd(0.55, 1),
            drift: 0.0005,
            img: Math.random() < 0.3 ? glowTint : glow,
          });
        }
      }
      setTimeout(finish, WIPE * 0.6);
    };

    let t0 = 0, last = 0, endedAt = 0, prevHead = null;
    const done_ = new Array(strokes.length).fill(false);
    const tick = (now) => {
      const t = now - t0;
      const dt = Math.min(50, now - (last || now));
      last = now;
      if (!dissolving) {
        let head = null;
        for (let i = 0; i < strokes.length; i++) {
          const drawn = clamp((t - starts[i]) * speed, 0, lens[i]);
          if (drawn !== shown[i]) {
            if (shown[i] <= 0 && drawn > 0) strokes[i].style.opacity = '1';
            strokes[i].style.strokeDashoffset = String(lens[i] - drawn);
            shown[i] = drawn;
          }
          if (drawn > 0 && drawn < lens[i]) head = [i, drawn];
          if (drawn >= lens[i] && !done_[i]) {
            done_[i] = true;
            const [x, y] = toScreen(strokes[i].getPointAtLength(lens[i]));
            // al levantar la lapicera saltan unas chispas; el punto de la j salpica más
            const n = isDot[i] ? 26 : 4;
            for (let k = 0; k < n; k++) {
              const ang = rnd(0, Math.PI * 2), v = isDot[i] ? rnd(0.04, 0.2) : rnd(0.02, 0.07);
              emit(x, y, { vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, life: rnd(400, 900), size: rnd(2, isDot[i] ? 7 : 5) });
            }
          }
        }
        stepSparks(dt, now);
        if (head) {
          const [hx, hy] = comet(head[0], head[1]);
          // chispas repartidas por todo el tramo que recorrió la punta en este cuadro (va rápido)
          const [px, py] = prevHead && prevHead[2] === head[0] ? prevHead : [hx, hy];
          for (let k = 0, n = Math.round((dt / 16.7) * 6); k < n; k++) {
            const u = Math.random();
            emit(lerp(px, hx, u) + rnd(-2, 2), lerp(py, hy, u) + rnd(-2, 2), { vx: rnd(-0.07, 0.07), vy: rnd(-0.09, 0.03), size: rnd(3, 11) });
          }
          prevHead = [hx, hy, head[0]];
        } else prevHead = null;
        // polvo suave flotando alrededor mientras se escribe
        if (Math.random() < 0.35) {
          emit(rnd(box.left, box.right), rnd(box.top, box.bottom), { vx: rnd(-0.01, 0.01), vy: rnd(-0.025, -0.008), life: rnd(1200, 2200), size: rnd(2, 4.5), alpha: 0.35, img: glow });
        }
        if (t > DRAW && !endedAt) {
          endedAt = now;
          svg.classList.add('is-inked');
        }
        const shownLetters = Math.floor(clamp((t - CAPTION_AT) / 38, 0, letters.length));
        for (let k = 0; k < shownLetters; k++) letters[k].classList.add('is-in');
        if (t > Math.max(DRAW, CAPTION_AT + letters.length * 38) + HOLD) dissolve();
      } else {
        stepSparks(dt, now);
        if (done && (now - doneAt > 1300 || !parts.length)) return;
      }
      raf = requestAnimationFrame(tick);
    };

    if (prefersReducedMotion) {
      strokes.forEach((p) => { p.style.opacity = '1'; p.style.strokeDashoffset = '0'; });
      svg.classList.add('is-inked');
      letters.forEach((l) => l.classList.add('is-in'));
      setTimeout(finish, 600);
    } else {
      sizeSparks();
      window.addEventListener('resize', sizeSparks);
      requestAnimationFrame((now) => { t0 = now; raf = requestAnimationFrame(tick); });
    }
    preloader.addEventListener('click', skip);
    window.addEventListener('keydown', skip, { once: true });
  } else {
    endLoading();
  }

  /* ========================================================================
     2. CABECERA
     ======================================================================== */
  const header = document.getElementById('echoHeader');
  const navPills = Array.from(document.querySelectorAll('.nav-pill'));
  const darkIds = ['about', 'experience', 'works', 'hablemos', 'contact'];
  let lastY = window.scrollY;

  // los enlaces internos (#seccion) bajan suave hasta el punto justo de cada una. El hero queda
  // fijo debajo de toda la página (su ancla no lleva a ningún lado): "inicio" es arriba de todo.
  // En el "About me" se llega con la tarjeta abierta y el texto a la vista.
  const NAV_AT = { about: 0.82 }; // avance dentro de la sección fija
  function navTarget(id) {
    if (id === 'home') return 0;
    const el = document.getElementById(id);
    if (!el) return null;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = Math.max(0, el.offsetHeight - window.innerHeight);
    return Math.round(top + span * (NAV_AT[id] || 0));
  }
  function goTo(id, instant) {
    const y = navTarget(id);
    if (y == null) return false;
    window.scrollTo({ top: y, behavior: instant || prefersReducedMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', id === 'home' ? location.pathname + location.search : `#${id}`);
    return true;
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = a.getAttribute('href').slice(1);
    if (!id || navTarget(id) == null) return;
    e.preventDefault();
    closeMenu();
    goTo(id);
  });
  // si se entra con un ancla (#about…), al punto justo y no al borde de la sección
  if (location.hash.length > 1) {
    const id = decodeURIComponent(location.hash.slice(1));
    document.addEventListener('echo:loaded', () => requestAnimationFrame(() => goTo(id, true)), { once: true });
  }

  // contacto: WhatsApp con un mensaje listo (en el idioma de la página) y el botón flotante
  const WA_NUMBER = '5493757673226';
  const setWaLinks = () => {
    const text = i18n.lang === 'en'
      ? "Hi Mateo, I saw your portfolio and I'd like to ask you about a project."
      : 'Hola Mateo, vi tu portfolio y quiero consultarte por un proyecto.';
    document.querySelectorAll('[data-wa]').forEach((a) => { a.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`; });
  };
  setWaLinks();
  document.addEventListener('echo:lang', setWaLinks);

  const fab = document.getElementById('contactFab');
  const fabBtn = document.getElementById('fabBtn');
  const setFab = (open) => {
    fab?.classList.toggle('is-open', open);
    fabBtn?.setAttribute('aria-expanded', String(open));
  };
  fabBtn?.addEventListener('click', () => setFab(!fab.classList.contains('is-open')));
  fab?.querySelectorAll('.fab-option').forEach((o) => o.addEventListener('click', () => setFab(false)));
  document.addEventListener('click', (e) => { if (fab && !fab.contains(e.target)) setFab(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setFab(false); });
  // se ve después del hero, y no cuando en pantalla ya hay otra forma de contactar (los destacados
  // tienen su botón justo donde iría este, después viene la llamada y al final el pie)
  const fabHides = ['works', 'hablemos', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
  function updateFab(y) {
    if (!fab) return;
    const vh = window.innerHeight;
    const other = document.getElementById('works')?.dataset.covering === '1' || fabHides.some((el) => {
      const r = el.getBoundingClientRect();
      return r.top < vh * 0.85 && r.bottom > vh * 0.15;
    });
    const show = y > vh * 0.8 && !other;
    if (show !== fab.classList.contains('is-shown')) {
      fab.classList.toggle('is-shown', show);
      if (!show) setFab(false);
    }
  }

  // el menú de tablet y celular
  const menuBtn = document.getElementById('menuBtn');
  const navSheet = document.getElementById('navSheet');
  function openMenu() {
    if (!navSheet) return;
    navSheet.classList.add('is-open');
    navSheet.setAttribute('aria-hidden', 'false');
    menuBtn?.setAttribute('aria-expanded', 'true');
    root.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!navSheet?.classList.contains('is-open')) return;
    navSheet.classList.remove('is-open');
    navSheet.setAttribute('aria-hidden', 'true');
    menuBtn?.setAttribute('aria-expanded', 'false');
    root.style.overflow = '';
  }
  menuBtn?.addEventListener('click', openMenu);
  navSheet?.querySelector('[data-close-menu]')?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  function updateHeader(y) {
    if (!header) return;
    if (y > 160 && y > lastY + 3) header.classList.add('is-hidden');
    else if (y < lastY - 3 || y <= 160) header.classList.remove('is-hidden');
    lastY = y;
    header.classList.toggle('is-scrolled', y > 24);

    let onDark = false;
    for (const id of darkIds) {
      const el = document.getElementById(id);
      if (!el || el.dataset.tone === 'light') continue;
      const r = el.getBoundingClientRect();
      if (r.top <= 36 && r.bottom >= 36) onDark = true;
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
     El hero queda fijo y, al bajar, su arco se agranda hasta llenar la pantalla con la noche
     estrellada. Mientras tanto "EXPLORE MY" se va hacia arriba, "PORTFOLIO" se agranda, se
     desenfocan y se apagan. Con el arco lleno aparece el "About me", que empieza con esa misma
     imagen, y el hero deja de pintarse.
     ======================================================================== */
  const hero = document.getElementById('home');
  const heroLine1 = document.querySelector('.hero-title-line1');
  const heroLine2 = document.querySelector('.hero-title-line2');
  const heroMetas = Array.from(document.querySelectorAll('.hero-meta-left > *, .hero-meta-right > *'));
  let heroHidden = false;
  let windowKick = null;
  let nightKick = null; // vuelve a dibujar la noche (3·b2)
  let aboutDustKick = null; // y el polvo de la tarjeta del "About me" (3·b3)

  function updateHeroOut() {
    const aboutEl = document.getElementById('about');
    if (!hero || !aboutEl) return;
    const vh = window.innerHeight;
    const q = clamp(1 - aboutEl.getBoundingClientRect().top / vh, 0, 1);
    const e = q * q * (3 - 2 * q);
    hero.style.setProperty('--out', e.toFixed(4));
    aboutEl.classList.toggle('is-flat', q >= 1);
    nightKick?.(); // la del "About me" arranca al llegar arriba
    aboutDustKick?.();
    const fade = (1 - smooth(0.25, 0.9, e)).toFixed(3);
    if (heroLine1) {
      heroLine1.style.transform = `translate3d(0, ${(-e * 16).toFixed(2)}vh, 0)`;
      heroLine1.style.filter = e > 0.01 ? `blur(${(e * 7).toFixed(2)}px)` : '';
      heroLine1.style.opacity = fade;
    }
    if (heroLine2) {
      heroLine2.style.transform = `translate3d(0, ${(-e * 5).toFixed(2)}vh, 0) scale(${(1 + e * 0.08).toFixed(4)})`;
      heroLine2.style.filter = e > 0.01 ? `blur(${(e * 9).toFixed(2)}px)` : '';
      heroLine2.style.opacity = fade;
    }
    const metaFade = (1 - smooth(0, 0.45, e)).toFixed(3);
    heroMetas.forEach((el) => {
      el.style.transform = `translate3d(0, ${(e * 8).toFixed(2)}vh, 0)`;
      el.style.opacity = metaFade;
    });
    // ya tapado del todo: no se pinta (es lo único fijo debajo de toda la página)
    const covered = q >= 1;
    if (covered !== heroHidden) {
      heroHidden = covered;
      hero.style.visibility = covered ? 'hidden' : '';
      if (!covered) windowKick?.();
      nightKick?.();
    }
  }

  /* ========================================================================
     3·b. LA VENTANA DEL HERO
     Adentro del arco la noche deriva sola, despacio, como si se mirara por una ventana. El
     corrimiento lo pone en --px/--py y el CSS lo apaga a medida que el arco llena la pantalla.
     ======================================================================== */
  const heroWindow = document.getElementById('heroWindow');
  if (heroWindow && hero && !prefersReducedMotion) {
    const RANGE = 26; // px que se corre la noche, como mucho
    let raf = 0;

    function frame(now) {
      raf = 0;
      if (heroHidden || document.hidden) return; // vuelve con windowKick
      const t = now * 0.00012;
      heroWindow.style.setProperty('--px', (-Math.sin(t * 1.7) * 0.7 * RANGE).toFixed(2));
      heroWindow.style.setProperty('--py', (-Math.sin(t * 2.3 + 1) * 0.5 * RANGE * 0.6).toFixed(2));
      raf = requestAnimationFrame(frame);
    }

    windowKick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    document.addEventListener('visibilitychange', () => { if (!document.hidden) windowKick(); });
    windowKick();
  }

  /* ========================================================================
     3·b2. LA NOCHE SE MUEVE
     La noche estrellada (la del arco y la del "About me") se dibuja en WebGL encima de su imagen:
     cada trazo corre a lo largo de sí mismo y las ventanas del castillo se prenden y se apagan.
     El sentido de cada trazo sale de starry-flow.webp, calculado una vez desde la imagen:
     RG = hacia dónde corre y cuánto (en las curvas cerradas, menos, para no salirse del trazo),
     B = número de ventana (0 = ninguna), A = desfase del ciclo.
     Solo dibuja mientras se ve, a 30 cuadros por segundo (el flujo es lento y alcanza).
     ======================================================================== */
  const nightCanvases = Array.from(document.querySelectorAll('canvas[data-night]'));
  if (nightCanvases.length && !prefersReducedMotion && window.WebGL2RenderingContext) {
    const VERT = `#version 300 es
      in vec2 aPos;
      void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;
    const FRAG = `#version 300 es
      precision highp float;
      uniform sampler2D uImg;
      uniform sampler2D uFlow;
      uniform vec2 uRes;      // el canvas, en píxeles
      uniform vec2 uImgSize;  // la imagen, en píxeles
      uniform vec2 uFocus;    // object-position
      uniform float uTime;
      out vec4 outColor;

      float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

      // cada ventana tiene su ritmo: está prendida casi siempre y a veces se apaga un rato
      float windowOn(float id, float t) {
        float k = t / (4.0 + hash(id) * 9.0) + hash(id + 3.1);
        float seg = floor(k);
        float a = step(0.3, hash(id * 7.0 + seg));
        float b = step(0.3, hash(id * 7.0 + seg + 1.0));
        float s = mix(a, b, smoothstep(0.9, 1.0, fract(k)));
        return s * (0.9 + 0.1 * sin(t * 9.0 + id * 5.0) * sin(t * 6.1 + id));
      }

      void main() {
        vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
        float scale = max(uRes.x / uImgSize.x, uRes.y / uImgSize.y);
        vec2 shown = uImgSize * scale;
        vec2 offset = (uRes - shown) * uFocus;
        vec2 uv = (frag - offset) / shown;
        vec4 flow = texture(uFlow, uv);
        vec2 dir = flow.rg * 2.0 - 1.0;

        // los trazos corren a lo largo de sí mismos: dos copias desfasadas que se turnan.
        // 16 px por ciclo es lo que el mapa supone al frenar las curvas cerradas
        vec2 step1 = dir * 16.0 / uImgSize;
        float ph = uTime / 1.5 + flow.a * 2.0;
        float p0 = fract(ph);
        float p1 = fract(ph + 0.5);
        vec3 c0 = texture(uImg, uv - step1 * p0).rgb;
        vec3 c1 = texture(uImg, uv - step1 * p1).rgb;
        float w = abs(2.0 * p0 - 1.0);
        vec3 col = mix(c0, c1, w);
        // al mezclar dos copias se pierde contraste a mitad del ciclo: se devuelve respecto del tono
        // promedio de la zona (las copias se parecen mucho, por eso se devuelve solo la mitad)
        vec3 mean = textureLod(uImg, uv, 4.0).rgb;
        float k = mix(1.0, inversesqrt(w * w + (1.0 - w) * (1.0 - w)), 0.55);
        col = clamp(mean + (col - mean) * k, 0.0, 1.0);

        // las ventanas: apagadas quedan como el castillo
        float id = floor(texelFetch(uFlow, ivec2(uv * vec2(textureSize(uFlow, 0))), 0).b * 255.0 + 0.5);
        if (id > 0.5) {
          col *= mix(0.06, 1.0, windowOn(id, uTime));
        }
        outColor = vec4(col, 1.0);
      }`;

    const load = (src) => new Promise((ok, fail) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => ok(im);
      im.onerror = fail;
      im.src = src;
    });
    let sources = null; // la imagen y el mapa, se piden una sola vez
    const getSources = () => (sources ||= Promise.all([
      load('assets/img/echo/starry-night.webp'),
      load('assets/img/echo/starry-flow.webp'),
    ]));

    const views = [];

    function makeView(canvas) {
      const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power' });
      if (!gl) return null;
      const sh = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'aPos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const u = {};
      ['uImg', 'uFlow', 'uRes', 'uImgSize', 'uFocus', 'uTime'].forEach((n) => { u[n] = gl.getUniformLocation(prog, n); });
      const view = { canvas, gl, u, ready: false, visible: false, w: 0, h: 0, dpr: 1 };
      getSources().then(([img, flow]) => {
        if (gl.isContextLost()) return;
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
        const tex = (unit, im, mip) => {
          const t = gl.createTexture();
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, t);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
          if (mip) gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        };
        tex(0, img, true); // con mipmaps: achicada no titila al moverse
        tex(1, flow, true);
        gl.uniform1i(u.uImg, 0);
        gl.uniform1i(u.uFlow, 1);
        gl.uniform2f(u.uImgSize, img.naturalWidth, img.naturalHeight);
        gl.uniform2f(u.uFocus, 0.3, 0.5); // el mismo object-position que la imagen
        view.ready = true;
        // un primer cuadro ya: la del "About me" queda lista antes de que el arco llegue a llenar la pantalla
        render(view, performance.now() / 1000);
        kick();
      }).catch(() => {});
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        view.ready = false;
        canvas.classList.remove('is-on');
      });
      return view;
    }

    function fit(view) {
      // hasta 1.5x y no más de ~2.4 millones de píxeles: los trazos se ven nítidos y la gráfica descansa
      const cw = view.canvas.clientWidth;
      const ch = view.canvas.clientHeight;
      let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (cw * ch * dpr * dpr > 2.4e6) dpr = Math.sqrt(2.4e6 / (cw * ch));
      const w = Math.round(cw * dpr);
      const h = Math.round(ch * dpr);
      if (w === view.w && h === view.h) return;
      view.w = view.canvas.width = w;
      view.h = view.canvas.height = h;
      view.dpr = dpr;
      view.gl.viewport(0, 0, w, h);
      view.gl.uniform2f(view.u.uRes, w, h);
    }

    function render(view, t) {
      fit(view);
      const { gl, u, canvas } = view;
      gl.uniform1f(u.uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!canvas.classList.contains('is-on')) canvas.classList.add('is-on');
    }

    let raf = 0;
    let frameNo = 0;
    // el arco, mientras el hero no está tapado; el del "About me", desde que llega arriba
    const aboutPortal = document.getElementById('about');
    const isShown = (v) => v.visible && v.ready && (v.inHero ? !heroHidden : !!aboutPortal?.classList.contains('is-flat'));

    function frame(now) {
      raf = 0;
      if (document.hidden) return;
      const shown = views.filter(isShown);
      if (!shown.length) return;
      // un cuadro sí y uno no: el flujo es lento y alcanza
      if (frameNo++ % 2 === 0) shown.forEach((v) => render(v, now / 1000));
      raf = requestAnimationFrame(frame);
    }
    function kick() {
      if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
    }
    nightKick = kick;

    // cada vista se crea cuando está por verse (así la del "About me" no carga antes de tiempo)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        let v = views.find((x) => x.canvas === e.target);
        if (!v && e.isIntersecting) {
          v = makeView(e.target);
          if (!v) return;
          v.inHero = !!e.target.closest('.hero-section');
          views.push(v);
        }
        if (v) v.visible = e.isIntersecting;
      });
      kick();
    }, { rootMargin: '50% 0px' });
    nightCanvases.forEach((c) => io.observe(c));

    document.addEventListener('visibilitychange', kick);
    window.addEventListener('resize', kick);
  }

  /* ========================================================================
     3·b3. EL POLVO DEL HAZ (tarjeta del "About me")
     Sobre la imagen de la figura flotan motas de luz vivas: suben despacio por el haz, se mecen y
     titilan. El haz se midió en la imagen (1600 x 978): su eje baja de (1276, 0) a la izquierda,
     0,648 px por cada px, y se ensancha hacia abajo. El canvas lleva la misma clase que la imagen,
     así se agranda con ella; las motas se ubican con el mismo encuadre (cover, 50% 45%).
     Solo dibuja con el "About me" arriba y en pantalla, a 30 cuadros por segundo.
     ======================================================================== */
  const aboutDust = document.getElementById('aboutDust');
  if (aboutDust && !prefersReducedMotion) {
    const ctx = aboutDust.getContext('2d');
    const portal = document.getElementById('about');
    const IMG_W = 1600;
    const IMG_H = 978;
    const axisX = (y) => 1276 - 0.648 * y;
    const halfW = (y) => 68 + 0.09 * y;
    let seed = 5;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
    const motes = Array.from({ length: 240 }, () => ({
      y: rnd() * (IMG_H + 60) - 30, // en píxeles de la imagen
      o: gauss() * 1.25, // a lo ancho del haz, en medios anchos
      v: 9 + rnd() * 20, // sube, px de la imagen por segundo
      r: rnd() < 0.1 ? 1.6 + rnd() * 1 : 0.6 + rnd() * 0.9, // px de pantalla
      a: 0.5 + rnd() * 0.5,
      ph: rnd() * Math.PI * 2,
      sw: 3 + rnd() * 7, // cuánto se mece
    }));

    // una mota: punto con halo, dibujada una vez
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 32;
    const sg = sprite.getContext('2d');
    const grad = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 32, 32);

    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let frameNo = 0;
    let onScreen = false;

    function fitDust() {
      const cw = aboutDust.clientWidth;
      const ch = aboutDust.clientHeight;
      const d = Math.min(window.devicePixelRatio || 1, 1.5);
      if (cw === W && ch === H && d === dpr) return;
      W = cw;
      H = ch;
      dpr = d;
      aboutDust.width = Math.round(W * dpr);
      aboutDust.height = Math.round(H * dpr);
    }

    function drawDust(now, dt) {
      fitDust();
      const s = Math.max(W / IMG_W, H / IMG_H);
      const ox = (W - IMG_W * s) * 0.5;
      const oy = (H - IMG_H * s) * 0.45;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const t = now / 1000;
      for (const m of motes) {
        m.y -= m.v * dt;
        if (m.y < -30) {
          m.y += IMG_H + 60;
          m.o = gauss() * 1.25;
        }
        const iy = m.y;
        const ix = axisX(iy) + m.o * halfW(iy) + Math.sin(t * 0.6 + m.ph) * m.sw;
        const x = ox + ix * s;
        const y = oy + iy * s;
        if (x < -8 || y < -8 || x > W + 8 || y > H + 8) continue;
        // más brillo en el medio del haz, y titila
        const inBeam = clamp(1 - Math.abs(m.o) * 0.45, 0.2, 1);
        const tw = 0.55 + 0.45 * Math.sin(t * (1.6 + m.sw * 0.12) + m.ph * 3);
        ctx.globalAlpha = m.a * inBeam * tw;
        const size = m.r * 6;
        ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    }

    const shownDust = () => onScreen && !document.hidden && !!portal?.classList.contains('is-flat');

    function dustFrame(now) {
      raf = 0;
      if (!shownDust()) return;
      const dt = Math.min(0.1, (now - (last || now)) / 1000);
      // un cuadro sí y uno no: las motas van despacio
      if (frameNo++ % 2 === 0) {
        last = now;
        drawDust(now, dt);
      }
      raf = requestAnimationFrame(dustFrame);
    }

    aboutDustKick = () => {
      if (raf || !shownDust()) return;
      last = 0;
      raf = requestAnimationFrame(dustFrame);
    };
    new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting;
      aboutDustKick();
    }).observe(aboutDust);
    document.addEventListener('visibilitychange', aboutDustKick);
  }

  /* ========================================================================
     3·c. LOS TEXTOS DEL HERO SE ESCRIBEN
     Al terminar la carga, los textos chicos del hero se escriben letra por letra, una sola vez:
     al volver al hero ya están. Cada letra ocupa su lugar desde el principio (invisible), así
     nada se corre mientras se escribe.
     ======================================================================== */
  const typeGroups = [
    ['.hero-news > span:last-child', '.hero-est'],
    ['.hero-bio-snippet', '.hero-roles li'],
  ].map((sels) => sels.flatMap((sel) => Array.from(document.querySelectorAll(sel))));

  let finishTyping = () => {};
  if (!prefersReducedMotion && typeGroups.some((g) => g.length)) {
    const STEP = 24; // ms por letra
    const jobs = typeGroups.map((els) => els.map((el) => {
      const es = i18n.original(el.firstChild || el); // para volver al español si cambian el idioma
      const text = el.textContent.trim();
      const chars = Array.from(text, (ch) => {
        const s = document.createElement('span');
        s.className = 'tw-ch';
        s.textContent = ch;
        return s;
      });
      el.setAttribute('aria-label', text);
      el.replaceChildren(...chars);
      return { el, es, chars, done: false };
    }));
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };
    const finish = (job) => {
      if (job.done) return;
      job.done = true;
      job.el.textContent = job.es;
      job.el.removeAttribute('aria-label');
      localize(job.el);
    };
    // al cambiar de idioma a mitad de camino, lo que falta aparece entero
    finishTyping = () => {
      timers.forEach(clearTimeout);
      timers.clear();
      jobs.flat().forEach(finish);
    };

    const run = (group) => {
      let i = 0, k = 0, prev = null;
      const tick = () => {
        prev?.classList.remove('is-at');
        const job = group[i];
        if (!job || job.done) return;
        const ch = job.chars[k];
        ch.classList.add('is-in', 'is-at');
        prev = ch;
        if (++k >= job.chars.length) {
          later(() => finish(job), 220);
          prev = null;
          i++;
          k = 0;
          later(tick, 220);
          return;
        }
        later(tick, ch.textContent === ' ' ? STEP * 0.5 : STEP);
      };
      tick();
    };
    const start = () => later(() => jobs.forEach(run), 450);
    if (root.classList.contains('is-loading')) document.addEventListener('echo:loaded', start, { once: true });
    else start();
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
    strip.path = null;
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
  function buildStrips() {
    buildStrip(wmTop, 'wmTop', false);
    buildStrip(wmBottom, 'wmBottom', true);
    localize(watermarkTop);
    localize(watermarkBottom);
  }
  buildStrips();

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
    if (expChapterLabel) {
      expChapterLabel.textContent = slide.dataset.chapter || '';
      localize(expChapterLabel);
    }
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
  // en otro idioma las tiras miden distinto: se arman de nuevo
  document.addEventListener('echo:lang', () => { buildStrips(); requestAnimationFrame(updateExperience); });

  /* ========================================================================
     3c. PROYECTOS — la cinta ondulada con algunos, empezando por los de traslados (los destacados
     tienen su sección abajo). La última tarjeta abre el archivo completo con los 24.
     ======================================================================== */
  const landingProjects = [
    { title: 'Traslados Márquez', sub: 'Landing page ejecutiva · Remises turísticos en Puerto Iguazú', img: 'assets/img/portfolio/cards/traslados-marquez.webp', url: 'https://www.trasladosmarquez.com.ar' },
    { title: 'LGK Traslados', sub: 'Landing page comercial · Viajes en la Triple Frontera', img: 'assets/img/portfolio/cards/lgk-traslados.webp', url: 'https://www.trasladoslgk.com.ar' },
    { title: 'DanyTours Iguazú', sub: 'Landing page turística · Reservas directas por WhatsApp', img: 'assets/img/portfolio/cards/danytours.webp', url: 'https://www.danytours.com.ar' },
    { title: 'Travel Online Agency', sub: 'Landing page de turismo · Traslados y excursiones en Misiones', img: 'assets/img/portfolio/cards/travelonlineagency.webp', url: 'https://www.travelonlineagency.com.ar' },
    { title: 'Estudio Jurídico MJHD', sub: 'Sitio web institucional y consultoría legal · SEO optimizado', img: 'assets/img/portfolio/cards/estudio-juridico-mjhd.webp', url: 'https://www.mjhdjuridica.com.ar' },
    { title: 'PresenciaWeb Studio', sub: 'Landing page de agencia digital · Diseño e identidad de marca', img: 'assets/img/portfolio/cards/presenciaweb.webp', url: 'https://presencia-web.vercel.app/' },
    { title: 'GabyGor', sub: 'Reserva de turnos en tiempo real', img: 'assets/img/portfolio/cards/gabygor.webp', url: 'https://gabygor.com.ar' },
    { title: 'Simulador de Amortización', sub: 'Web app financiera · Cálculo interactivo de préstamos', img: 'assets/img/portfolio/cards/simulador-de-amortizacion.webp', url: 'https://amortizacion-fronted.vercel.app/' },
    // la última: el resto está en el archivo completo
    { more: true, title: 'Y 16 proyectos más', sub: 'Sistemas, e-commerce, landings y proyectos personales' },
  ];
  const ALL_PROJECTS = 24;

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
    // la tarjeta del final: "+16" dibujado en un canvas, que la cinta usa como una imagen más
    const moreCard = document.createElement('canvas');
    const paintMore = () => {
      moreCard.width = 720;
      moreCard.height = 450;
      const g = moreCard.getContext('2d');
      g.fillStyle = '#111113';
      g.fillRect(0, 0, 720, 450);
      g.fillStyle = '#ffffff';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = '700 170px Outfit, sans-serif';
      g.fillText(`+${ALL_PROJECTS - (landingProjects.length - 1)}`, 360, 190);
      g.font = '500 22px "IBM Plex Mono", monospace';
      g.fillStyle = 'rgba(255,255,255,0.7)';
      const en = i18n.lang === 'en';
      g.fillText((en ? 'MORE PROJECTS' : 'PROYECTOS MÁS').split('').join(' '), 360, 300);
      g.fillStyle = '#ffffff';
      g.fillText(en ? 'SEE THEM ALL ↗' : 'VER TODOS ↗', 360, 360);
      dirty = true;
      wake();
    };
    const imgs = landingProjects.map((proj) => {
      if (proj.more) return moreCard;
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
      if (waveTitleEl) {
        waveTitleEl.textContent = item.title;
        localize(waveTitleEl);
      }
      if (waveSubEl) {
        waveSubEl.textContent = item.sub;
        localize(waveSubEl);
      }
      if (waveCountEl) waveCountEl.textContent = item.more ? `+${ALL_PROJECTS - (n - 1)}` : `${pad2(idx + 1)} / ${pad2(n - 1)}`;
      if (waveLinkEl && item.more) {
        waveLinkEl.closest('.wave-project-meta')?.classList.remove('no-link');
        waveLinkEl.href = '#landings';
        waveLinkEl.target = '';
        waveLinkEl.textContent = 'VER TODOS ↗';
        waveLinkEl.onclick = (e) => {
          e.preventDefault();
          document.getElementById('allProjectsModal')?.classList.add('is-open');
        };
        localize(waveLinkEl);
      } else if (waveLinkEl) {
        const code = item.url?.startsWith('https://github.com/');
        waveLinkEl.closest('.wave-project-meta')?.classList.toggle('no-link', !item.url && !item.gallery);
        waveLinkEl.href = item.url || '#landings';
        waveLinkEl.target = item.url ? '_blank' : '';
        waveLinkEl.textContent = item.gallery ? 'VER CAPTURAS ↗' : code ? 'VER CÓDIGO ↗' : 'VISITAR WEB ↗';
        waveLinkEl.onclick = item.gallery ? (e) => {
          e.preventDefault();
          openGalleryModal(item.title, galleries[item.gallery]);
        } : null;
        localize(waveLinkEl);
      }
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

      // en el celular la tarjeta del centro ocupa casi todo el ancho y la onda es suave: con la curva
      // de escritorio la del medio quedaba retorcida y chica
      const narrow = cw < 700;
      const cardW = narrow ? cw * 0.78 : clamp(cw * 0.4, 250, 640);
      const cardH = Math.min(cardW * 0.6, ch * 0.62);
      const stepX = cardW * (narrow ? 1.1 : 1.06);
      const wave = narrow ? 0.07 : 0.17; // cuánto sube y baja, en fracción del alto
      const swell = narrow ? 0.14 : 0.28; // cuánto se agranda hacia los bordes
      const centerIndex = Math.round(pos);
      caption(centerIndex);

      // cada tarjeta se dibuja en tiras verticales que siguen una curva en S: a la izquierda baja,
      // a la derecha sube, y en los bordes se agranda (más cerca), como la cinta del video
      const slices = Math.round(clamp(cardW / 3, 48, 140));
      for (let offset = -2; offset <= 2; offset++) {
        const v = centerIndex + offset;
        const img = imgs[((v % n) + n) % n];
        const left = cw * 0.5 + (v - pos) * stepX - cardW * 0.5;
        if (left > cw + 50 || left + cardW < -50) continue;
        const stripW = cardW / slices;
        const strips = [];
        for (let s = 0; s <= slices; s++) {
          const x = left + s * stripW;
          const nx = (x - cw * 0.5) / (cw * 0.5);
          const bend = Math.sin(nx * Math.PI * 0.9) * ch * wave * Math.min(1, Math.abs(nx) * 1.5);
          const h = cardH * (1 + Math.min(1, Math.abs(nx)) * swell);
          strips.push({ x, y: (ch - h) * 0.5 - bend, h, shade: Math.min(0.45, Math.abs(nx) * 0.32) });
        }
        // el contorno une los bordes de las tiras en diagonal: así la curva queda lisa y no en escalones
        wCtx.save();
        wCtx.beginPath();
        strips.forEach((p, k) => (k ? wCtx.lineTo(p.x, p.y) : wCtx.moveTo(p.x, p.y)));
        for (let k = strips.length - 1; k >= 0; k--) wCtx.lineTo(strips[k].x, strips[k].y + strips[k].h);
        wCtx.closePath();
        wCtx.clip();
        const iw = img.naturalWidth || img.width;
        const ready = iw && (img.complete || img === moreCard);
        if (!ready) wCtx.fillStyle = '#1d1d22';
        for (let s = 0; s < slices; s++) {
          const a = strips[s];
          const b = strips[s + 1];
          // cada tira cubre de su borde más alto al más bajo; el recorte se lleva lo que sobra
          const y = Math.min(a.y, b.y);
          const hh = Math.max(a.y + a.h, b.y + b.h) - y;
          if (ready) {
            const srcW = iw / slices;
            wCtx.drawImage(img, s * srcW, 0, srcW, img.naturalHeight || img.height, a.x, y, stripW + 0.8, hh);
          } else {
            wCtx.fillRect(a.x, y, stripW + 0.8, hh);
          }
        }
        // la sombra de los costados va en una sola pasada, con un degradé parejo: tira por tira se
        // pisaban en los bordes y en el medio (donde no había sombra) quedaba una franja más clara
        const grad = wCtx.createLinearGradient(left, 0, left + cardW, 0);
        strips.forEach((p, s) => grad.addColorStop(s / slices, `rgba(9,9,11,${p.shade.toFixed(3)})`));
        wCtx.fillStyle = grad;
        wCtx.fillRect(left, 0, cardW, ch);
        wCtx.restore();
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
    paintMore();
    document.fonts?.ready.then(paintMore);
    document.addEventListener('echo:lang', () => {
      paintMore();
      lastIdx = -1;
    });
    window.addEventListener('resize', () => { dirty = true; wake(); });

    updateRibbon = () => {
      if (dragging || performance.now() < manualUntil) return;
      const span = landings.offsetHeight - 2 * window.innerHeight;
      const next = (span > 0 ? clamp(-landings.getBoundingClientRect().top / span, 0, 1) : 0) * (n - 1);
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
     3d. PROYECTOS DESTACADOS — la ruleta y después a pantalla completa
     La sección sube por encima de la cinta como una hoja y queda fija. Al bajar:
       A. la ruleta gira sola (no con el scroll): arranca al llegar, frena de a poco y deja arriba,
          junto a la flecha, un destacado elegido al azar (cambia en cada visita); ahí los demás se
          apagan. Si se baja antes de que termine, se apura; si se vuelve a entrar, gira de nuevo;
       B. sola, apenas frena, esa tarjeta crece hasta llenar la pantalla y se vuelve su proyecto;
       C. los demás destacados suben de a uno por un arco (como el del hero) tapando al anterior.
     El fondo es un video si el proyecto tiene data-video; si no, su imagen. Los videos se cargan
     recién cuando su proyecto está cerca y solo corre el que está al frente.
     ======================================================================== */
  // las capturas de los proyectos privados (se abren en la ventana de galería)
  const galleries = {
    paperflix: [1, 2, 3, 4, 5, 6].map((k) => `assets/img/portfolio/paperflix/${k}.png`),
    neurobrand: [1, 2, 3, 4].map((k) => `assets/img/portfolio/neurobrand/${k}.webp`),
    mipaperlux: [1, 2, 3, 4].map((k) => `assets/img/portfolio/mipaperlux/${k}.png`),
  };

  function openGalleryModal(title, images) {
    const modal = document.getElementById('galleryModal');
    const modalTitle = document.getElementById('galleryModalTitle');
    const modalBody = document.getElementById('galleryModalBody');
    if (!modal || !modalBody || !images) return;
    if (modalTitle) {
      modalTitle.innerHTML = `${title} — <span>Capturas del sistema</span>`;
      localize(modalTitle);
    }
    modalBody.innerHTML = images
      .map(
        (src) =>
          `<div style="margin-bottom:1.25rem;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.12)"><img src="${src}" alt="${title}" loading="lazy" style="width:100%;display:block"></div>`
      )
      .join('');
    modal.classList.add('is-open');
  }

  document.querySelectorAll('[data-open-gallery]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.openGallery;
      const title = btn.closest('.feat-slide')?.querySelector('.feat-title')?.textContent
        || btn.closest('.catalog-card')?.querySelector('.catalog-card-title')?.textContent || '';
      openGalleryModal(title.trim(), galleries[id]);
    });
  });

  // Casos confidenciales (Paperflix, MiPaperlux): sin enlace público por contrato; se cuentan con su
  // video, el enfoque y las capturas. Se abren con una cortina de columnas escalonadas, la misma idea
  // que la entrada de Destacados, y al cerrar se vuelve al mismo lugar.
  // (cada texto va en su propio nodo: i18n.js los traduce de a uno)
  const CASES = {
    paperflix: {
      title: 'Paperflix',
      kind: 'PLATAFORMA EDTECH · PAPERLUX, CHILE',
      lead: 'Una biblioteca de recursos interactivos para cada materia, pensada para la pantalla táctil del aula y cargada con ayuda de IA.',
      video: 'assets/video/paperflix.mp4',
      poster: 'assets/img/portfolio/featured/paperflix.webp',
      role: 'Desarrollador full stack',
      stack: 'Next.js 14 · NestJS · Prisma · Supabase · Groq',
      challenge: 'Los recursos interactivos que usan los docentes están repartidos en enlaces de distintos sitios, y la clase se da en una pantalla táctil grande, sin teclado ni mouse. Cargar y ordenar cada recurso a mano era lento, y encontrarlo en plena clase también.',
      approach: 'Una biblioteca ordenada por materia y nivel, hecha para tocar: tarjetas grandes, un toque para abrir el recurso y un teclado virtual propio para buscar. Detrás, un panel donde el equipo de Paperlux carga y revisa el contenido.',
      decisions: [
        ['La IA completa cada ficha', 'Desde un enlace, el sistema lee la página (título, descripción, texto e imagen de portada) y Groq propone título, descripción, materia, nivel y etiquetas. El equipo solo revisa.'],
        ['Importación masiva desde Excel', 'Una planilla con enlaces se convierte en recursos listos de una sola vez, en lugar de cargarlos uno por uno.'],
        ['Hecha para la pantalla del aula', 'La interfaz y el teclado virtual están pensados para el dedo en una pantalla táctil grande, sin depender de teclado ni mouse.'],
      ],
      results: [['+3.200', 'escuelas en Chile'], ['60 %', 'menos tiempo para crear contenido']],
      gallery: [1, 2, 3, 4, 5, 6].map((k) => `assets/img/portfolio/paperflix/${k}.png`),
    },
    mipaperlux: {
      title: 'MiPaperlux',
      kind: 'PLATAFORMA DOCENTE · PAPERLUX, CHILE',
      lead: 'La plataforma del docente para su Paperlux: aprende a usarlo, crea actividades con IA, escribe sobre sus PDF y la institución sigue el avance en tiempo real.',
      video: 'assets/video/mipaperlux.mp4',
      poster: 'assets/img/portfolio/featured/mipaperlux.webp',
      role: 'Desarrollador full stack',
      stack: 'Next.js 14 · Supabase · Groq · pdf.js · pdf-lib · Framer Motion',
      challenge: 'Cada institución que compra un Paperlux necesita que sus docentes lo usen de verdad: que aprendan el equipo, que tengan material para sus clases y que la institución pueda ver que se está usando.',
      approach: 'Una sola plataforma para todo el recorrido del docente: capacitación autónoma con certificado, actividades creadas con IA, sus PDF editables con el lápiz y una comunidad para compartir. Y un panel para cada actor: institución, equipo comercial, soporte y administración.',
      decisions: [
        ['Capacitarse en menos de 30 minutos', 'Cinco módulos cortos, del encendido a la primera clase con alumnos, y un certificado al terminar.'],
        ['IA que no deja al docente sin actividad', 'Las actividades se generan con Groq desde un tema o desde el PPT o PDF del docente. Si el modelo principal falla, está caído o devuelve un JSON inválido, una cadena de modelos de respaldo toma la posta.'],
        ['El PDF del docente, editable', 'Las guías se ven con pdf.js y lo que el docente escribe y subraya con el lápiz se guarda en el mismo archivo con pdf-lib.'],
      ],
      results: [['7', 'tipos de actividades generadas con IA'], ['< 30 min', 'para aprender a usar el equipo']],
      gallery: [1, 2, 3, 4].map((k) => `assets/img/portfolio/mipaperlux/${k}.png`),
    },
  };
  const CASE_ORDER = Object.keys(CASES);
  const caseEl = document.getElementById('caseOverlay');
  const caseScroll = caseEl?.querySelector('.case-scroll');
  let caseOpen = '';
  let caseTimer = 0;

  function renderCase(id) {
    const c = CASES[id];
    const n = CASE_ORDER.indexOf(id);
    const next = CASE_ORDER[(n + 1) % CASE_ORDER.length];
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const pad2 = (v) => String(v).padStart(2, '0');
    caseScroll.innerHTML = `
      <header class="case-top">
        <span class="case-kicker"><span>CASO DE ESTUDIO</span> · ${pad2(n + 1)} / ${pad2(CASE_ORDER.length)}</span>
        <button class="case-close" type="button" data-case-close><span>CERRAR</span> ✕</button>
      </header>
      <div class="case-wrap">
        <p class="case-kind">${esc(c.kind)}</p>
        <h2 class="case-title" id="caseTitle">${esc(c.title)}</h2>
        <p class="case-lead">${esc(c.lead)}</p>
        <div class="case-video"><video muted loop playsinline preload="none" poster="${c.poster}" src="${c.video}"></video></div>
        <dl class="case-meta">
          <div><dt>CLIENTE</dt><dd>Paperlux · Chile</dd></div>
          <div><dt>ROL</dt><dd>${esc(c.role)}</dd></div>
          <div><dt>STACK</dt><dd>${esc(c.stack)}</dd></div>
          <div><dt>ENLACE</dt><dd>Confidencial: sin enlace público</dd></div>
        </dl>
        <section class="case-row"><h3>EL DESAFÍO</h3><p>${esc(c.challenge)}</p></section>
        <section class="case-row"><h3>EL ENFOQUE</h3><p>${esc(c.approach)}</p></section>
        <section class="case-row"><h3>DECISIONES</h3>
          <ol class="case-decisions">${c.decisions.map(([t, d], i) => `<li><span class="case-num">${pad2(i + 1)}</span><b>${esc(t)}</b><p>${esc(d)}</p></li>`).join('')}</ol>
        </section>
        <section class="case-row"><h3>RESULTADO</h3>
          <div class="case-results">${c.results.map(([v, l]) => `<div><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`).join('')}</div>
        </section>
        <section class="case-gallery">
          <div class="case-gallery-head"><h3>GALERÍA</h3>
            <div class="case-arrows"><button type="button" data-case-scroll="-1" aria-label="Anterior">←</button><button type="button" data-case-scroll="1" aria-label="Siguiente">→</button></div>
          </div>
          <div class="case-strip">${c.gallery.map((src) => `<button type="button" class="case-shot" data-case-zoom="${src}"><img src="${src}" alt="${esc(c.title)}" loading="lazy"></button>`).join('')}</div>
        </section>
        <button class="case-next" type="button" data-case-open="${next}"><span>SIGUIENTE CASO</span><b>${esc(CASES[next].title)} →</b></button>
      </div>
      <div class="case-zoom" hidden><img alt=""></div>`;
    localize(caseScroll);
    caseScroll.scrollTop = 0;
  }

  function openCase(id) {
    if (!caseEl || !CASES[id]) return;
    clearTimeout(caseTimer);
    const swapping = caseOpen !== '';
    caseOpen = id;
    renderCase(id);
    caseEl.classList.remove('is-closing');
    caseEl.classList.add('is-open');
    caseEl.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    // el video del destacado se pausa: suena (y gasta) uno solo
    document.querySelectorAll('.feat-video').forEach((v) => v.pause());
    const v = caseScroll.querySelector('video');
    caseTimer = setTimeout(() => { if (!prefersReducedMotion) v?.play().catch(() => {}); }, swapping ? 0 : 500);
    caseScroll.querySelector('[data-case-close]')?.focus({ preventScroll: true });
  }

  function closeCase() {
    if (!caseEl || !caseOpen) return;
    caseOpen = '';
    clearTimeout(caseTimer);
    caseScroll.querySelector('video')?.pause();
    caseEl.classList.add('is-closing');
    caseEl.classList.remove('is-open');
    caseEl.setAttribute('aria-hidden', 'true');
    caseTimer = setTimeout(() => {
      caseEl.classList.remove('is-closing');
      caseScroll.innerHTML = '';
      document.documentElement.style.overflow = '';
      syncFeatVideos();
    }, prefersReducedMotion ? 0 : 900);
  }

  document.querySelectorAll('[data-open-case]').forEach((btn) => {
    btn.addEventListener('click', () => openCase(btn.dataset.openCase));
  });
  caseEl?.addEventListener('click', (e) => {
    const t = e.target.closest('button, .case-zoom');
    if (!t) return;
    if (t.matches('[data-case-close]')) closeCase();
    else if (t.matches('[data-case-open]')) openCase(t.dataset.caseOpen);
    else if (t.matches('[data-case-scroll]')) {
      const strip = caseScroll.querySelector('.case-strip');
      strip.scrollBy({ left: Number(t.dataset.caseScroll) * strip.clientWidth * 0.8, behavior: 'smooth' });
    } else if (t.matches('[data-case-zoom]')) {
      const zoom = caseScroll.querySelector('.case-zoom');
      zoom.querySelector('img').src = t.dataset.caseZoom;
      zoom.hidden = false;
    } else if (t.matches('.case-zoom')) t.hidden = true;
  });
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !caseOpen) return;
    const zoom = caseScroll.querySelector('.case-zoom');
    if (zoom && !zoom.hidden) zoom.hidden = true;
    else closeCase();
  });

  const featSection = document.getElementById('works');
  const featPin = featSection?.querySelector('.featured-pin');
  const featCurtain = document.getElementById('featCurtain');
  const CURTAIN_MS = 1300;
  const curtain = { at: 0, anchor: 0 }; // cuándo arrancó la entrada (0: todavía no) y hasta dónde se llegó
  let curtainDone = false;
  const featSlides = Array.from(document.querySelectorAll('.feat-slide'));
  const featDots = Array.from(document.querySelectorAll('.feat-dots span'));
  const rouletteRig = document.getElementById('rouletteRig');
  const rouletteIndex = document.getElementById('rouletteIndex');
  const roulettePointer = document.getElementById('roulettePointer');
  let featActive = -1;
  let featOnScreen = false;

  // la ruleta: los cuatro destacados y dos más de relleno (en el orden de las agujas del reloj)
  const ringProjects = [
    { title: 'Órbita', img: 'orbita', feat: 'orbita' },
    { title: 'Paperflix', img: 'paperflix', feat: 'paperflix' },
    { title: 'MiPaperlux', img: 'mipaperlux', feat: 'mipaperlux' },
    { title: 'NeuroBrand AI', img: 'neurobrand', feat: 'neurobrand' },
    { title: 'Petty Joyas', img: 'petty-joyas' },
    { title: 'S.I.T.I System', img: 's-i-t-i-sistema-integral-de-tiendas-inde' },
  ];
  const SLOT = 360 / ringProjects.length;
  const featIdx = ringProjects.map((r, i) => (r.feat ? i : -1)).filter((i) => i >= 0);
  const chosen = featIdx[Math.floor(Math.random() * featIdx.length)];
  // el giro: dos vueltas y algo, y frena con el elegido arriba (ángulo -chosen * SLOT, en cualquier vuelta)
  const SPIN_MS = 2200;
  const spin = { from: 0, to: 0, t0: 0, dur: SPIN_MS, angle: 0, running: false, doneAt: 0, armed: true };
  const landAngle = (from) => {
    const at = (((360 - chosen * SLOT) % 360) + 360) % 360;
    return Math.ceil((from + 720 - at) / 360) * 360 + at;
  };
  function startSpin(now) {
    Object.assign(spin, { from: spin.angle, to: landAngle(spin.angle), t0: now, dur: SPIN_MS, running: true, doneAt: 0 });
  }
  // lo que falta, en medio segundo
  function hurrySpin(now) {
    if (!spin.running || spin.dur <= 600) return;
    Object.assign(spin, { from: spin.angle, t0: now, dur: 500 });
  }
  function stepSpin(now) {
    if (!spin.running) return;
    const k = clamp((now - spin.t0) / spin.dur, 0, 1);
    spin.angle = spin.from + (spin.to - spin.from) * (1 - (1 - k) ** 4); // frena como una ruleta
    if (k >= 1) {
      spin.running = false;
      spin.doneAt = now;
      grow.at = now + 250; // un instante para ver cuál salió, y se abre
      grow.dur = 600;
    }
  }
  const grow = { at: 0, dur: 1200 };
  if (prefersReducedMotion) {
    spin.angle = landAngle(0);
    spin.doneAt = -1e9;
    spin.armed = false;
    grow.at = -1e9;
  }
  let fShown = 0; // el avance entre proyectos que se ve (alcanza al del scroll si este se adelantó)
  let ringRaf = 0;
  let ringCards = [];
  let ringNames = [];
  let ringLast = -1;

  if (rouletteRig && featSlides.length) {
    rouletteRig.innerHTML = ringProjects.map((r) => `
      <div class="roulette-card">
        <div class="roulette-bar"><span class="roulette-dots"><span></span><span></span><span></span></span><span>${r.title.toLowerCase().replace(/\s+/g, '')}.app</span><span>↗</span></div>
        <img src="assets/img/portfolio/cards/${r.img}.webp" alt="" loading="lazy" decoding="async">
      </div>`).join('');
    ringCards = Array.from(rouletteRig.children);
    ringCards[chosen].classList.add('is-chosen');
    if (rouletteIndex) {
      rouletteIndex.innerHTML = ringProjects.map((r) => `<li>${r.title}</li>`).join('');
      ringNames = Array.from(rouletteIndex.children);
    }
    // el elegido pasa a ser el primero a pantalla completa; los demás siguen en su orden
    const first = featSlides.find((el) => el.dataset.id === ringProjects[chosen].feat);
    if (first) {
      featSlides.splice(featSlides.indexOf(first), 1);
      featSlides.unshift(first);
      first.parentNode.insertBefore(first, first.parentNode.querySelector('.feat-slide'));
    }
    const pad2 = (v) => String(v).padStart(2, '0');
    featSlides.forEach((el, i) => {
      const num = el.querySelector('.feat-num');
      if (num) num.textContent = `${pad2(i + 1)} / ${pad2(featSlides.length)}`;
    });
  }

  // los tramos de la sección fija, en pantallas: girar, agrandar y después uno por cada cambio
  // la ruleta gira y se abre durante la entrada (la escena ya queda quieta mientras sube la sección):
  // sumarle tramos propios dejaba al primer proyecto el doble de scroll que a los demás
  const PH_SPIN = 0;
  const PH_GROW = 0;
  const PH_STEP = 0.8; // (la altura de la sección en el CSS es 1 + la suma de los tramos)

  // los videos: se crean cuando su proyecto está cerca y corre solo el del frente
  function syncFeatVideos() {
    featSlides.forEach((el, i) => {
      const src = el.dataset.video;
      if (!src) return;
      let v = el.querySelector('.feat-video');
      if (!v && featActive >= 0 && Math.abs(i - featActive) <= 1) {
        v = document.createElement('video');
        v.className = 'feat-video';
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.preload = 'auto';
        v.setAttribute('aria-hidden', 'true');
        v.src = src;
        v.addEventListener('playing', () => v.classList.add('is-on'), { once: true });
        el.querySelector('.feat-media')?.append(v);
      }
      if (!v) return;
      if (i === featActive && featOnScreen && !prefersReducedMotion) v.play().catch(() => {});
      else v.pause();
    });
  }

  function updateFeatured() {
    if (!featSection || !featSlides.length) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r = featSection.getBoundingClientRect();
    // la entrada, como la carga y sola (no con el scroll): apenas se empieza a entrar, cinco columnas
    // negras suben escalonadas (de izquierda a derecha) tapando la cinta y se retiran hacia arriba en
    // el mismo orden destapando la ruleta, que ya viene girando debajo (es un solo movimiento).
    // Mientras la sección no llegó arriba, la escena queda quieta en la pantalla; si se vuelve para
    // arriba, baja con el scroll (a su ritmo) y la cinta reaparece detrás. Cuando sale del todo, la
    // próxima vez que se llegue se repite.
    const nowC = performance.now();
    if (curtain.at === 0 && r.top < vh * 0.94 && r.bottom > 0) {
      curtain.at = prefersReducedMotion ? -1e9 : nowC;
      curtain.anchor = Math.max(0, r.top);
    } else if (curtain.at !== 0 && r.top >= vh) {
      curtain.at = 0;
      // y la ruleta, de cero
      if (!prefersReducedMotion) Object.assign(spin, { armed: true, running: false, doneAt: 0 });
      grow.at = 0;
      fShown = 0;
    }
    // hasta dónde llegó (lo más arriba que estuvo la sección): ahí la escena estaba quieta en la pantalla
    if (curtain.at) curtain.anchor = Math.min(curtain.anchor, Math.max(0, r.top));
    const anchor = curtain.anchor;
    // dónde va la escena: arriba de todo mientras no se volvió; al volver, baja hasta salir justo
    // cuando la sección queda debajo de la pantalla
    const sceneY = curtain.at && r.top > anchor ? ((r.top - anchor) / Math.max(1, vh - anchor)) * vh : 0;
    const q = curtain.at === 0 ? 0 : clamp((nowC - curtain.at) / CURTAIN_MS, 0, 1);
    curtainDone = q >= 1;
    const covering = curtain.at !== 0 && sceneY < vh * 0.85 ? '1' : '';
    if (featSection.dataset.covering !== covering) {
      featSection.dataset.covering = covering;
      updateFab(window.scrollY); // el botón flotante se va (o vuelve) en el mismo cuadro
    }
    landings?.querySelector('.landings-pin')?.style.setProperty('--cover', (q * (1 - sceneY / vh)).toFixed(3));
    if (featPin && featCurtain) {
      if (curtain.at && r.top > 0 && r.top < vh) {
        featPin.style.transform = `translateY(${(sceneY - r.top).toFixed(1)}px)`;
      } else if (featPin.style.transform) featPin.style.transform = '';
      if (q < 1 && curtain.at && r.top < vh) {
        const COLS = 5;
        const ease = (u) => u * u * (3 - 2 * u);
        const tops = [];
        const bottoms = [];
        for (let k = 0; k < COLS; k++) {
          tops.push(vh * (1 - ease(clamp((q - k * 0.05) / 0.35, 0, 1))));
          bottoms.push(vh * (1 - ease(clamp((q - 0.45 - k * 0.05) / 0.35, 0, 1))));
        }
        const xs = (k) => (vw * k) / COLS + (k > 0 && k < COLS ? 0.5 : 0); // medio píxel encima: sin rendijas
        const cols = [];
        const scene = [`0px ${vh}px`];
        for (let k = 0; k < COLS; k++) {
          cols.push(`${xs(k).toFixed(1)}px ${tops[k].toFixed(1)}px`, `${xs(k + 1).toFixed(1)}px ${tops[k].toFixed(1)}px`);
          // la escena se recorta en sus propias coordenadas (puede estar bajando)
          const yb = Math.max(0, bottoms[k] - sceneY);
          scene.push(`${xs(k).toFixed(1)}px ${yb.toFixed(1)}px`, `${xs(k + 1).toFixed(1)}px ${yb.toFixed(1)}px`);
        }
        for (let k = COLS - 1; k >= 0; k--) cols.push(`${xs(k + 1).toFixed(1)}px ${bottoms[k].toFixed(1)}px`, `${xs(k).toFixed(1)}px ${bottoms[k].toFixed(1)}px`);
        scene.push(`${vw}px ${vh}px`);
        featCurtain.style.visibility = 'visible';
        featCurtain.style.clipPath = `polygon(${cols.join(', ')})`;
        featPin.style.clipPath = `polygon(${scene.join(', ')})`;
      } else if (featPin.style.clipPath) {
        featCurtain.style.visibility = '';
        featCurtain.style.clipPath = '';
        featPin.style.clipPath = '';
      }
    }
    const onScreen = r.bottom > 0 && r.top < vh;
    if (onScreen !== featOnScreen) {
      featOnScreen = onScreen;
      syncFeatVideos();
    }
    if (!onScreen) return;

    const now = performance.now();
    const n = featSlides.length;
    const total = PH_SPIN + PH_GROW + PH_STEP * (n - 1);
    const at = clamp(-r.top / vh, 0, total); // pantallas recorridas con la sección fija
    const fScroll = clamp((at - PH_SPIN - PH_GROW) / PH_STEP, 0, n - 1);

    // A. la ruleta gira sola al llegar
    if (spin.armed && curtain.at && performance.now() - curtain.at > 250) {
      spin.armed = false;
      startSpin(now);
    }
    const ahead = at > PH_SPIN; // bajó antes de que terminara: todo se apura
    if (ahead) hurrySpin(now);
    stepSpin(now);
    const landed = !spin.running && spin.doneAt !== 0;
    const emph = landed ? smooth(0, 400, now - spin.doneAt) : 0;
    // B. se abre sola un momento después de frenar (si ya bajó, enseguida y más rápido)
    if (landed && ahead && grow.at > now) Object.assign(grow, { at: now, dur: 450 });
    const pB = landed && grow.at ? clamp((now - grow.at) / grow.dur, 0, 1) : 0;
    // C. los siguientes van con el scroll, pero recién con la tarjeta abierta; si el scroll se
    // adelantó, lo alcanzan de a poco
    const fTarget = pB >= 1 ? fScroll : 0;
    fShown = Math.abs(fTarget - fShown) > 0.02 ? fShown + (fTarget - fShown) * 0.18 : fTarget;
    const f = fShown;
    const mobile = vw < 768;
    const R = mobile ? Math.min(vw * 0.34, vh * 0.25) : Math.min(vh * 0.27, vw * 0.17);
    const base = mobile ? 0.78 : 0.52; // en la ruleta las tarjetas van chicas, como en el diseño original
    const angle = spin.angle;
    const card0 = ringCards[0];
    const cw = card0?.offsetWidth || 300;
    const ch = card0?.offsetHeight || 190;
    ringCards.forEach((card, i) => {
      const th = ((i * SLOT - 90 + angle) * Math.PI) / 180;
      const x = Math.cos(th) * R;
      const y = Math.sin(th) * R;
      const isChosen = i === chosen;
      const sc = base * (isChosen ? 1 + 0.2 * emph : 1 - 0.08 * emph);
      const op = isChosen ? 1 - smooth(0.04, 0.2, pB) : (1 - 0.7 * emph) * (1 - smooth(0, 0.25, pB));
      card.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${((th * 180) / Math.PI + 90).toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      card.style.opacity = op.toFixed(3);
    });
    // el nombre que pasa por la flecha se marca en la lista
    const under = ((Math.round(-angle / SLOT) % ringCards.length) + ringCards.length) % ringCards.length;
    if (under !== ringLast) {
      ringLast = under;
      ringNames.forEach((li, i) => li.classList.toggle('is-on', i === under));
    }
    if (roulettePointer) roulettePointer.style.top = `${(vh / 2 - R - (ch * base * 1.2) / 2 - 20).toFixed(1)}px`;
    featPin?.style.setProperty('--label', (1 - smooth(0, 0.3, pB)).toFixed(3));
    featPin?.style.setProperty('--hint', emph.toFixed(3));
    featPin?.style.setProperty('--hud', smooth(0.85, 1, pB).toFixed(3));

    // B. la tarjeta elegida crece hasta llenar la pantalla y queda su proyecto
    const g = pB < 1 ? pB * pB * (3 - 2 * pB) : 1;
    const first = featSlides[0];
    if (pB <= 0) {
      first.classList.remove('is-growing');
      first.style.clipPath = '';
    } else if (pB < 1) {
      const scl = base * 1.2;
      const w0 = cw * scl;
      const h0 = ch * scl;
      const cx = vw / 2;
      const cy = vh / 2 - R;
      const top = lerp(cy - h0 / 2, 0, g);
      const left = lerp(cx - w0 / 2, 0, g);
      const right = lerp(vw - (cx + w0 / 2), 0, g);
      const bottom = lerp(vh - (cy + h0 / 2), 0, g);
      first.classList.add('is-growing');
      first.style.clipPath = `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round ${lerp(12, 0, g).toFixed(1)}px)`;
      // la imagen arranca del tamaño de la tarjeta (cubriéndola) y termina como la de pantalla completa
      const s0 = Math.max(w0 / vw, h0 / vh) * 1.04;
      first.style.setProperty('--gs', lerp(s0, 1.04, g).toFixed(4));
      first.style.setProperty('--gx', '0px');
      first.style.setProperty('--gy', `${lerp(cy - vh / 2, 0, g).toFixed(1)}px`);
    } else {
      first.classList.remove('is-growing');
      first.style.clipPath = '';
    }

    // C. los demás, de a uno, por el arco
    let active = 0;
    featSlides.forEach((el, i) => {
      const t = i === 0 ? (pB > 0 ? 1 : 0) : smooth(0.12, 0.82, f - (i - 1));
      const dim = i < n - 1 ? smooth(0.12, 0.82, f - i) : 0;
      if (t > 0.5) active = i;
      el.style.setProperty('--t', t.toFixed(4));
      el.style.setProperty('--dim', dim.toFixed(3));
      el.style.setProperty('--shade', (i === 0 ? smooth(0.2, 1, pB) : 1).toFixed(3));
      const show = i === 0 ? smooth(0.82, 1, pB) : smooth(0.75, 1, t);
      el.style.setProperty('--info', (show * (1 - smooth(0, 0.3, dim))).toFixed(3));
      // lo que no se ve no se pinta: el que todavía no subió y el que ya quedó tapado
      el.style.visibility = t < 0.001 || dim > 0.999 ? 'hidden' : '';
    });
    // el navbar: claro sobre la ruleta, oscuro sobre los proyectos a pantalla completa
    featSection.dataset.tone = pB > 0.5 ? 'dark' : 'light';
    if (pB < 0.85) active = -1;
    if (active !== featActive) {
      featActive = active;
      featDots.forEach((d, i) => d.classList.toggle('is-on', i === active));
      syncFeatVideos();
    }
    // mientras gira, se apagan los demás o la tarjeta alcanza al scroll, se sigue dibujando solo
    if ((spin.running || (landed && (emph < 1 || pB < 1)) || fShown !== fTarget || (curtain.at && !curtainDone)) && !ringRaf) {
      ringRaf = requestAnimationFrame(() => {
        ringRaf = 0;
        updateFeatured();
      });
    }
  }

  /* ========================================================================
     3f. GITHUB — las contribuciones reales contadas en cuatro escenas
     El año día por día → una ciudad (cada día es un edificio) → la curva semana a semana →
     el año enrollado en una vuelta. Todo es una sola animación guiada por el scroll.
     ======================================================================== */
  const ghSection = document.getElementById('github');
  const ghCanvas = document.getElementById('ghCanvas');
  const ghLabel = document.getElementById('ghLabel');
  const ghNumber = document.getElementById('ghNumber');
  const ghUnit = document.getElementById('ghUnit');
  const ghNote = document.getElementById('ghNote');
  const ghSteps = Array.from(document.querySelectorAll('.gh-steps span'));
  const ghStats = document.getElementById('ghStats');
  const ghLive = document.getElementById('ghLive');
  let gh = null;
  let ghLastP = -1;
  let ghScene = -1;
  let ghDirty = true;

  const isEn = () => root.lang === 'en';
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const fmtDate = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    if (isEn()) return new Date(y, m - 1, d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${d} ${MONTHS[m - 1]} ${y}`;
  };
  const fmtNum = (n) => n.toLocaleString(isEn() ? 'en-US' : 'es-AR');

  // tonos por nivel de GitHub, en tinta en lugar de verde (como el resto de ECHO)
  const INK = [[227, 227, 224], [190, 190, 187], [140, 140, 140], [85, 85, 90], [24, 24, 27]];
  const shade = (rgb, k) => `rgb(${rgb.map((v) => Math.round(clamp(v * k, 0, 255))).join(',')})`;

  function prepareGithub(data) {
    const days = data.days;
    const w0 = new Date(`${days[0][0]}T12:00:00`).getDay();
    const cells = days.map(([date, count, level], i) => ({ date, count, level, col: Math.floor((i + w0) / 7), row: (i + w0) % 7, i }));
    const cols = cells[cells.length - 1].col + 1;
    const weeks = new Array(cols).fill(0);
    cells.forEach((c) => { weeks[c.col] += c.count; });
    let best = 0, run = 0;
    for (const c of cells) { run = c.count > 0 ? run + 1 : 0; best = Math.max(best, run); }
    const max = cells.reduce((m, c) => (c.count > m.count ? c : m), cells[0]);
    const bestWeek = weeks.indexOf(Math.max(...weeks));
    return {
      cells, cols, weeks, max,
      total: data.total,
      active: cells.filter((c) => c.count > 0).length,
      streak: best,
      bestWeek: { total: weeks[bestWeek], from: cells.find((c) => c.col === bestWeek).date },
      user: data.user,
      updated: data.updated,
      stats: data.stats || {},
    };
  }

  // la fila de abajo: lo que no entra en el gráfico (solo lo que haya llegado)
  function renderGithubStats() {
    if (!ghStats || !gh) return;
    const st = gh.stats;
    const en = isEn();
    const items = [
      [st.commits, en ? 'COMMITS · 12 MONTHS' : 'COMMITS · 12 MESES'],
      [st.contributedRepos, en ? 'REPOS WITH COMMITS' : 'REPOS CON COMMITS'],
      [st.publicRepos, en ? 'PUBLIC REPOS' : 'REPOS PÚBLICOS'],
      [st.since && st.since.slice(0, 4), en ? 'ON GITHUB SINCE' : 'EN GITHUB DESDE'],
    ].filter(([v]) => v != null && v !== '');
    ghStats.replaceChildren(...items.map(([v, label]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = label;
      dd.textContent = typeof v === 'number' ? fmtNum(v) : v;
      row.append(dt, dd);
      return row;
    }));
  }

  function sceneText(k) {
    const S = isEn() ? [
      ['THE YEAR, DAY BY DAY', fmtNum(gh.total), 'contributions in the last year', 'The most honest part of a portfolio: what I did every day of the last year.'],
      ['LIKE A CITY', fmtNum(gh.max.count), `on my busiest day · ${fmtDate(gh.max.date)}`, 'Every day is a building: the taller it is, the more contributions.'],
      ['WEEK BY WEEK', fmtNum(gh.bestWeek.total), `in my best week · from ${fmtDate(gh.bestWeek.from)}`, 'The work curve: launch weeks, study weeks and maintenance weeks.'],
      ['THE YEAR IN ONE LOOP', fmtNum(gh.active), `days with commits · ${gh.streak}-day streak`, `Real data from @${gh.user}, updated ${fmtDate(gh.updated)}.`],
    ] : [
      ['EL AÑO, DÍA POR DÍA', fmtNum(gh.total), 'contribuciones en el último año', 'Lo más honesto de un portfolio: lo que hice cada día del último año.'],
      ['COMO UNA CIUDAD', fmtNum(gh.max.count), `en mi día más intenso · ${fmtDate(gh.max.date)}`, 'Cada día es un edificio: cuanto más alto, más contribuciones.'],
      ['SEMANA A SEMANA', fmtNum(gh.bestWeek.total), `en mi mejor semana · desde el ${fmtDate(gh.bestWeek.from)}`, 'La curva de trabajo: semanas de lanzamiento, de estudio y de mantenimiento.'],
      ['EL AÑO EN UNA VUELTA', fmtNum(gh.active), `días con commits · racha de ${gh.streak} seguidos`, `Datos reales de @${gh.user}, actualizados el ${fmtDate(gh.updated)}.`],
    ];
    return S[k];
  }

  function setGithubScene(k) {
    if (k === ghScene || !gh) return;
    ghScene = k;
    const [label, num, unit, note] = sceneText(k);
    const swap = (el, text) => {
      if (!el) return;
      el.textContent = text;
      el.animate?.([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'ease-out' });
    };
    swap(ghLabel, label);
    swap(ghNumber, num);
    swap(ghUnit, unit);
    swap(ghNote, note);
    ghSteps.forEach((s, i) => s.classList.toggle('is-on', i === k));
  }

  function drawGithub(p) {
    const ctx = ghCanvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = ghCanvas.clientWidth;
    const ch = ghCanvas.clientHeight;
    if (!cw || !ch) return;
    if (ghCanvas.width !== Math.round(cw * dpr) || ghCanvas.height !== Math.round(ch * dpr)) {
      ghCanvas.width = Math.round(cw * dpr);
      ghCanvas.height = Math.round(ch * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    // cuánto de cada escena hay en este punto del scroll (se superponen para que no haya cortes)
    const appear = smooth(0, 0.12, p);
    const city = smooth(0.2, 0.34, p) * (1 - smooth(0.46, 0.56, p));
    const line = smooth(0.5, 0.64, p) * (1 - smooth(0.72, 0.8, p));
    const ring = smooth(0.74, 0.9, p);

    const { cells, cols, weeks, max } = gh;
    const s = Math.min((cw * 0.94) / cols, (ch * 0.36) / 7);
    const gx = (cw - cols * s) / 2;
    // la grilla arranca centrada y baja para dejar lugar a los edificios y a la curva
    const down = smooth(0.13, 0.3, p) * (1 - smooth(0.72, 0.8, p));
    const gy = ch * (0.52 + 0.16 * down) - (7 * s) / 2;
    const size = s * 0.8;
    const maxH = ch * 0.5;
    // el anillo: un día por ángulo y el día de la semana como distancia al centro
    const R0 = Math.min(cw, ch) * 0.2;
    const rcx = cw / 2;
    const rcy = ch * 0.52;
    const ringStep = Math.min(s * 1.05, (Math.min(cw, ch) * 0.46 - R0) / 7);

    const tilt = city;
    // orden de dibujo en la ciudad: de atrás (domingo) hacia adelante, de izquierda a derecha
    for (let row = 0; row < 7; row++) {
      for (const c of cells) {
        if (c.row !== row) continue;
        const pop = clamp((appear * 1.25 - c.col / cols) * 7, 0, 1);
        if (pop <= 0) continue;
        const base = INK[c.level];
        // posición plana, inclinada (ciudad) y en el anillo
        const fx = gx + c.col * s + (s - size) / 2;
        const fy = gy + c.row * s + (s - size) / 2;
        const depth = 1 - 0.58 * tilt;
        const skew = (3.5 - c.row) * s * 0.42 * tilt;
        const cx = fx + skew;
        const cy = gy + (c.row * s) * depth + (s - size) / 2 + tilt * s * 1.5;
        const a = -Math.PI / 2 + (c.i / cells.length) * Math.PI * 2;
        const rr = R0 + (6 - c.row) * ringStep;
        const rx = rcx + Math.cos(a) * rr - size / 2;
        const ry = rcy + Math.sin(a) * rr - size / 2;
        const x = lerp(cx, rx, ring);
        const y = lerp(cy, ry, ring);
        const sz = size * pop * (1 - ring * 0.25);
        const h = Math.pow(c.count / max.count, 0.55) * maxH * tilt;
        const top = sz * depth;

        // en la curva semanal, los días se aclaran para que la línea mande
        const dim = 1 - line * 0.55;
        ctx.globalAlpha = dim;
        if (h > 0.5 && ring < 0.01) {
          // edificio: frente, costado derecho y techo
          const side = sz * 0.42 * tilt;
          ctx.fillStyle = shade(base, 0.82);
          ctx.fillRect(x, y - h + top, sz, h);
          ctx.fillStyle = shade(base, 0.62);
          ctx.beginPath();
          ctx.moveTo(x + sz, y - h + top);
          ctx.lineTo(x + sz + side, y - h);
          ctx.lineTo(x + sz + side, y);
          ctx.lineTo(x + sz, y + top);
          ctx.fill();
          ctx.fillStyle = shade(base, 1.08);
          ctx.beginPath();
          ctx.moveTo(x, y - h + top);
          ctx.lineTo(x + side, y - h);
          ctx.lineTo(x + sz + side, y - h);
          ctx.lineTo(x + sz, y - h + top);
          ctx.fill();
        } else if (ring > 0.01) {
          ctx.save();
          ctx.translate(x + sz / 2, y + sz / 2);
          ctx.rotate(a * ring);
          ctx.fillStyle = shade(base, 1);
          ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
          ctx.restore();
        } else {
          ctx.fillStyle = shade(base, 1);
          ctx.beginPath();
          ctx.roundRect(x, y, sz, top, Math.min(3, sz * 0.2));
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;

    // la curva semana a semana, arriba de la grilla
    if (line > 0.001) {
      const maxW = Math.max(...weeks);
      const pts = weeks.map((w, k) => [gx + (k + 0.5) * s, gy - s * 1.4 - (w / maxW) * ch * 0.34]);
      const upto = line * (pts.length - 1);
      const n = Math.floor(upto);
      const f = upto - n;
      const path = pts.slice(0, n + 1);
      if (n < pts.length - 1) path.push([lerp(pts[n][0], pts[n + 1][0], f), lerp(pts[n][1], pts[n + 1][1], f)]);
      const baseY = gy - s * 1.4;
      ctx.beginPath();
      ctx.moveTo(path[0][0], baseY);
      path.forEach(([px, py]) => ctx.lineTo(px, py));
      ctx.lineTo(path[path.length - 1][0], baseY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(17,17,19,0.06)';
      ctx.fill();
      ctx.beginPath();
      path.forEach(([px, py], k) => (k ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      ctx.strokeStyle = '#111113';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();
      const [hx, hy] = path[path.length - 1];
      ctx.fillStyle = '#111113';
      ctx.beginPath();
      ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // el centro del anillo: los días con commits
    if (ring > 0.05) {
      ctx.globalAlpha = smooth(0.4, 1, ring);
      ctx.fillStyle = '#111113';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `600 ${Math.round(R0 * 0.5)}px Outfit, sans-serif`;
      ctx.fillText(String(gh.active), rcx, rcy - R0 * 0.08);
      ctx.font = `500 ${Math.max(10, Math.round(R0 * 0.1))}px "IBM Plex Mono", monospace`;
      ctx.fillStyle = '#6b6b72';
      ctx.fillText(isEn() ? 'ACTIVE DAYS' : 'DÍAS ACTIVOS', rcx, rcy + R0 * 0.3);
      ctx.globalAlpha = 1;
    }
  }

  function updateGithub() {
    if (!ghSection || !ghCanvas || !gh) return;
    const r = ghSection.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const p = pinProgress(ghSection);
    setGithubScene(p < 0.2 ? 0 : p < 0.48 ? 1 : p < 0.73 ? 2 : 3);
    if (!ghDirty && Math.abs(p - ghLastP) < 0.0004) return;
    ghLastP = p;
    ghDirty = false;
    drawGithub(p);
  }

  if (ghSection && ghCanvas) {
    // en vivo desde el hosting (api/github.php); si no está o falla, la copia guardada en el repo
    const getJson = (url) => fetch(url, { cache: 'no-cache' })
      .then((r) => (r.ok && (r.headers.get('content-type') || '').includes('json') ? r.json() : Promise.reject(new Error(url))));
    Promise.allSettled([getJson('api/github.php'), getJson('assets/data/github.json')])
      .then(([live, saved]) => {
        const base = saved.status === 'fulfilled' ? saved.value : null;
        const fresh = live.status === 'fulfilled' && live.value.days?.length ? live.value : null;
        // lo que el en vivo no trae (p. ej. commits, si el servidor no tiene token) sale de la copia
        const data = fresh ? { ...fresh, stats: { ...(base?.stats || {}), ...(fresh.stats || {}) } } : base;
        if (!data?.days?.length) throw new Error('sin datos de GitHub');
        gh = prepareGithub(data);
        if (ghLive) ghLive.hidden = !fresh;
        renderGithubStats();
        ghDirty = true;
        requestTick();
      })
      .catch(() => { ghSection.style.display = 'none'; });
    window.addEventListener('resize', () => { ghDirty = true; });
    document.fonts?.ready.then(() => { ghDirty = true; requestTick(); });
    // al cambiar de idioma se vuelven a escribir los textos de la escena
    document.addEventListener('echo:lang', () => {
      renderGithubStats();
      ghScene = -1;
      ghDirty = true;
      requestTick();
    });
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
    updateFab(y);
    updateHeroOut();
    updateAbout();
    updateExperience();
    updateRibbon();
    updateFeatured();
    updateGithub();
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
    localize(toastEl);
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

      // en inglés, la versión de articles.en.js
      const item = (i18n.lang === 'en' && window.ARTICLES_EN?.[id]) || window.ARTICLES?.[id];
      if (item) {
        if (readerTitle) readerTitle.textContent = item.category || (i18n.lang === 'en' ? 'Article' : 'Artículo');
        readerBody.innerHTML = `<h2 style="font-size:1.65rem;margin-bottom:0.5rem">${item.title}</h2><p style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted-dark);margin-bottom:1.5rem">${item.meta}</p><div style="line-height:1.75;color:rgba(255,255,255,0.86)">${item.body}</div>`;
      } else {
        readerBody.innerHTML = `<p>Artículo seleccionado (#${id}).</p>`;
        localize(readerBody);
      }
      readerModal.classList.add('is-open');
    });
  });

  // En el celular, un deslizamiento con impulso pasaba varios proyectos de golpe en las secciones que
  // avanzan con el scroll. Ahí se ponen marcas de parada (scroll-snap, con snap-stop): cada gesto
  // frena en el proyecto siguiente. El resto de la página scrollea libre (ver .snap-mark en el CSS).
  const touchSnap = window.matchMedia('(max-width: 768px), (pointer: coarse)');
  function placeSnaps() {
    document.querySelectorAll('.snap-mark').forEach((m) => m.remove());
    if (!touchSnap.matches || prefersReducedMotion) return;
    const vh = window.innerHeight;
    const mark = (section, y) => {
      const m = document.createElement('i');
      m.className = 'snap-mark';
      m.setAttribute('aria-hidden', 'true');
      m.style.top = `${Math.round(y)}px`;
      section.append(m);
    };
    // Experiencia: donde cada tarjeta queda en su lugar
    if (expSection && expSlides.length) {
      const span = expSection.offsetHeight - vh;
      expSlides.forEach((s) => mark(expSection, span * slideProgress(s)));
    }
    // Proyectos: cada tarjeta de la cinta en el centro (la cinta usa el alto menos dos pantallas)
    if (landings) {
      const span = landings.offsetHeight - 2 * vh;
      const n = landingProjects.length;
      for (let k = 0; k < n; k++) mark(landings, (span * k) / (n - 1));
    }
    // Destacados: cada proyecto a pantalla completa
    if (featSection) featSlides.forEach((_, k) => mark(featSection, (PH_SPIN + PH_GROW + PH_STEP * k) * vh));
  }
  let snapTimer = 0;
  const queueSnaps = () => { clearTimeout(snapTimer); snapTimer = setTimeout(placeSnaps, 250); };
  window.addEventListener('load', placeSnaps);
  window.addEventListener('resize', queueSnaps);
  touchSnap.addEventListener?.('change', placeSnaps);

  // Formulario de contacto: lo manda la función de Vercel (api/contact.js); si no está disponible
  // (otro hosting, sin configurar o error), abre el correo de quien escribe como antes
  const contactForm = document.getElementById('echoContactForm');
  if (contactForm) {
    const sendBtn = contactForm.querySelector('button[type="submit"]');
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(contactForm);
      const name = String(fd.get('name') || '');
      const email = String(fd.get('email') || '');
      const subject = String(fd.get('subject') || (i18n.lang === 'en' ? 'Inquiry from portfolio' : 'Consulta desde el portfolio'));
      const message = String(fd.get('message') || '');
      if (sendBtn) sendBtn.disabled = true;
      showToast('Enviando...');
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error(data.error || String(res.status));
        contactForm.reset();
        showToast('¡Mensaje enviado! Te respondo pronto.');
      } catch {
        window.location.href = `mailto:rojas.mateo.web@gmail.com?subject=${encodeURIComponent(
          `${subject} — ${name}`
        )}&body=${encodeURIComponent(message)}`;
        showToast('Abriendo tu cliente de correo...');
      } finally {
        if (sendBtn) sendBtn.disabled = false;
      }
    });
  }

  // Idioma (ES / EN): el botón muestra el otro idioma; los textos los cambia i18n.js
  const langBtn = document.getElementById('langSwitchBtn');
  if (langBtn) {
    langBtn.textContent = i18n.lang === 'es' ? 'EN' : 'ES';
    langBtn.addEventListener('click', () => {
      finishTyping();
      i18n.set(i18n.lang === 'es' ? 'en' : 'es');
      langBtn.textContent = i18n.lang === 'es' ? 'EN' : 'ES';
      showToast(i18n.lang === 'es' ? 'Idioma: Español' : 'Language: English');
    });
  }
})();
