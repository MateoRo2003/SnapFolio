/**
 * MATEO ROJAS — ECHO EDITION PORTFOLIO (2026)
 * Interactive choreography:
 * 1. Organic Wavy Preloader with orbiting comet
 * 2. Auto-theme Navbar + ES/EN Language Toggle
 * 3. Hero Parallax + Van Gogh Starry Night Procedural Canvas
 * 4. About Me Scroll Portal (split text + scale expansion)
 * 5. Experience Horizontal Timeline + Kinetic Watermarks
 * 6. 3D Sine-Wave Ribbon Carousel for Landing Pages (Canvas Mesh Warp)
 * 7. WORKS '26 Hexagon Ring -> 3D Vertical Drum Carousel
 * 8. Services Dark/Light Accordion + Modals (Gallery, Articles, Contact, All Projects)
 */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========================================================================
     1. PRELOADER — ORGANIC WAVY LOOP & ORBITING COMET
     ======================================================================== */
  const preloader = document.getElementById('preloader');
  const wavePath = document.getElementById('preloaderWavePath');
  const waveBg = document.getElementById('preloaderWaveBg');
  const cometDot = document.getElementById('preloaderComet');
  const skipBtn = document.getElementById('preloaderSkip');

  let preloaderActive = true;
  let preloaderRaf = null;

  function buildOrganicWavePath(phase = 0) {
    const cx = 190;
    const cy = 190;
    const baseR = 126;
    const steps = 120;
    const pts = [];

    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      const w1 = Math.sin(theta * 8 + phase) * 9.5;
      const w2 = Math.cos(theta * 5 - phase * 0.7) * 5.5;
      const r = baseR + w1 + w2;
      const x = cx + Math.cos(theta) * r;
      const y = cy + Math.sin(theta) * r;
      pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    pts.push('Z');
    return pts.join(' ');
  }

  function finishPreloader() {
    if (!preloaderActive) return;
    preloaderActive = false;
    if (preloaderRaf) cancelAnimationFrame(preloaderRaf);
    if (preloader) preloader.classList.add('is-done');
  }

  if (preloader && wavePath && waveBg) {
    const initialD = buildOrganicWavePath(0);
    wavePath.setAttribute('d', initialD);
    waveBg.setAttribute('d', initialD);

    const startTime = performance.now();
    const duration = prefersReducedMotion ? 400 : 1950;

    function animatePreloader(now) {
      if (!preloaderActive) return;
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const phase = elapsed * 0.0045;

      const d = buildOrganicWavePath(phase);
      wavePath.setAttribute('d', d);
      waveBg.setAttribute('d', d);

      if (cometDot && typeof wavePath.getTotalLength === 'function') {
        try {
          const totalLen = wavePath.getTotalLength();
          const pt = wavePath.getPointAtLength(t * totalLen);
          cometDot.setAttribute('cx', pt.x.toFixed(2));
          cometDot.setAttribute('cy', pt.y.toFixed(2));
        } catch (_) {}
      }

      if (t < 1) {
        preloaderRaf = requestAnimationFrame(animatePreloader);
      } else {
        setTimeout(finishPreloader, 180);
      }
    }

    preloaderRaf = requestAnimationFrame(animatePreloader);
    if (skipBtn) skipBtn.addEventListener('click', finishPreloader);
    preloader.addEventListener('click', finishPreloader);
  }

  /* ========================================================================
     2. NAVBAR SCROLL THEME & ACTIVE SECTION TRACKING
     ======================================================================== */
  const header = document.getElementById('echoHeader');
  const navPills = Array.from(document.querySelectorAll('.nav-pill'));
  const darkSections = ['aboutStage', 'experience', 'contact'];

  function updateHeaderState() {
    if (!header) return;
    const scrollY = window.scrollY;
    header.classList.toggle('is-scrolled', scrollY > 24);

    // Check if header overlaps a dark section
    const headerY = 36;
    let onDark = false;
    for (const id of darkSections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= headerY && rect.bottom >= headerY) {
        onDark = true;
        break;
      }
    }
    header.classList.toggle('is-dark-mode', onDark);

    // Highlight active nav pill
    const checkY = window.innerHeight * 0.35;
    let currentSection = 'home';
    for (const pill of navPills) {
      const targetId = pill.getAttribute('href')?.replace('#', '');
      const sec = targetId ? document.getElementById(targetId) : null;
      if (sec) {
        const r = sec.getBoundingClientRect();
        if (r.top <= checkY && r.bottom >= 100) {
          currentSection = targetId;
        }
      }
    }
    navPills.forEach((p) => {
      p.classList.toggle('is-active', p.getAttribute('href') === `#${currentSection}`);
    });
  }

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  /* ========================================================================
     3. HERO MOUSE PARALLAX & SCROLL PORTAL (ABOUT ME)
     ======================================================================== */
  const heroSection = document.getElementById('home');
  const heroSilhouette = document.getElementById('heroSilhouette');
  const heroLine1 = document.querySelector('.hero-title-line1');
  const heroLine2 = document.querySelector('.hero-title-line2');

  if (heroSection && !prefersReducedMotion) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;

      if (heroSilhouette) {
        heroSilhouette.style.transform = `translate3d(${(nx * -18).toFixed(1)}px, ${(ny * -10).toFixed(1)}px, 0)`;
      }
      if (heroLine1) {
        heroLine1.style.transform = `translate3d(${(nx * 10).toFixed(1)}px, 0, 0)`;
      }
      if (heroLine2) {
        heroLine2.style.transform = `translate3d(${(nx * -10).toFixed(1)}px, 0, 0)`;
      }
    });
  }

  // About Me Portal scroll-scrubbed split & scale
  const aboutBanner = document.getElementById('aboutBanner');
  const aboutPortalCard = document.getElementById('aboutPortalCard');
  const aboutWordTop = document.getElementById('aboutWordTop');
  const aboutWordBottom = document.getElementById('aboutWordBottom');

  function updateAboutPortalScroll() {
    if (!aboutBanner || !aboutPortalCard || prefersReducedMotion) return;
    const rect = aboutBanner.getBoundingClientRect();
    const vh = window.innerHeight;
    // Progress 0 when banner enters bottom of screen, 1 when banner center hits top
    const raw = (vh - rect.top) / (vh + rect.height * 0.6);
    const p = Math.max(0, Math.min(1, raw));

    const splitOffset = (p - 0.35) * 90;
    if (aboutWordTop) {
      aboutWordTop.style.transform = `translate3d(${(-splitOffset).toFixed(1)}px, 0, 0)`;
    }
    if (aboutWordBottom) {
      aboutWordBottom.style.transform = `translate3d(${(splitOffset).toFixed(1)}px, 0, 0)`;
    }
    const scale = 1 + Math.max(0, p - 0.45) * 0.65;
    aboutPortalCard.style.transform = `scale(${scale.toFixed(3)})`;
  }

  window.addEventListener('scroll', updateAboutPortalScroll, { passive: true });
  updateAboutPortalScroll();

  /* ========================================================================
     4. VAN GOGH STARRY NIGHT MONOCHROME SWIRL CANVAS (#starryCanvas)
     ======================================================================== */
  const starryCanvas = document.getElementById('starryCanvas');
  if (starryCanvas) {
    const ctx = starryCanvas.getContext('2d');

    function drawStarryNight() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = starryCanvas.clientWidth || 1200;
      const h = starryCanvas.clientHeight || 480;
      starryCanvas.width = w * dpr;
      starryCanvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      // Deep monochrome night sky gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#0d0d10');
      bgGrad.addColorStop(0.55, '#19191e');
      bgGrad.addColorStop(1, '#0b0b0d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Swirling vortices (Van Gogh Starry Night positions)
      const vortices = [
        { x: w * 0.08, y: h * 0.22, r: 95, strength: 1.4, bright: 0.9 },
        { x: w * 0.25, y: h * 0.16, r: 115, strength: -1.3, bright: 0.95 },
        { x: w * 0.48, y: h * 0.36, r: 140, strength: 1.1, bright: 0.65 },
        { x: w * 0.63, y: h * 0.28, r: 65, strength: -1.5, bright: 0.85 },
        { x: w * 0.78, y: h * 0.24, r: 155, strength: 1.45, bright: 1.0 },
        { x: w * 0.36, y: h * 0.80, r: 85, strength: -1.2, bright: 0.8 },
        { x: w * 0.14, y: h * 0.68, r: 60, strength: 1.2, bright: 0.75 },
      ];

      // Draw glowing concentric swirl strokes around each vortex
      vortices.forEach((v) => {
        const glow = ctx.createRadialGradient(v.x, v.y, 2, v.x, v.y, v.r * 0.95);
        glow.addColorStop(0, `rgba(255,255,255,${(0.42 * v.bright).toFixed(2)})`);
        glow.addColorStop(0.45, `rgba(210,210,220,${(0.16 * v.bright).toFixed(2)})`);
        glow.addColorStop(1, 'rgba(20,20,24,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
        ctx.fill();

        const rings = 18;
        for (let rIdx = 1; rIdx <= rings; rIdx++) {
          const rad = (rIdx / rings) * v.r;
          const segments = 10 + rIdx * 2;
          for (let s = 0; s < segments; s++) {
            const a1 = (s / segments) * Math.PI * 2 + rIdx * 0.17;
            const a2 = a1 + (Math.PI * 2) / (segments * 1.45);
            ctx.beginPath();
            ctx.arc(v.x, v.y, rad, a1, a2);
            const alpha = (1 - rIdx / (rings + 2)) * 0.55 * v.bright;
            ctx.strokeStyle = `rgba(240, 240, 245, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1.6 + (rIdx % 3) * 0.5;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
        }
      });

      // Flowing wind field brushstrokes across the whole sky
      const numStrokes = 1100;
      for (let i = 0; i < numStrokes; i++) {
        // Deterministic pseudo-random using golden ratio
        const px = ((i * 0.6180339887) % 1) * w;
        const py = ((i * 0.3819660113 * 1.7) % 1) * h;

        // Base flowing wave angle
        let angle = Math.sin((px / w) * Math.PI * 3.2) * 0.55 + Math.cos((py / h) * Math.PI * 2.4) * 0.35;

        // Add vortex influence
        for (const v of vortices) {
          const dx = px - v.x;
          const dy = py - v.y;
          const dist = Math.hypot(dx, dy);
          if (dist < v.r * 1.55) {
            const tangent = Math.atan2(dy, dx) + (Math.PI / 2) * Math.sign(v.strength);
            const weight = Math.pow(1 - dist / (v.r * 1.55), 1.6);
            angle = angle * (1 - weight) + tangent * weight;
          }
        }

        const len = 14 + (i % 16);
        const x2 = px + Math.cos(angle) * len;
        const y2 = py + Math.sin(angle) * len;

        const luma = 150 + (i % 95);
        const alpha = 0.14 + (i % 5) * 0.05;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(
          (px + x2) * 0.5 - Math.sin(angle) * 3,
          (py + y2) * 0.5 + Math.cos(angle) * 3,
          x2,
          y2
        );
        ctx.strokeStyle = `rgba(${luma},${luma},${luma + 5},${alpha.toFixed(2)})`;
        ctx.lineWidth = 1.2 + (i % 3) * 0.55;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    drawStarryNight();
    window.addEventListener('resize', drawStarryNight);
  }

  /* ========================================================================
     5. EXPERIENCE HORIZONTAL TIMELINE ("WHERE I'VE BEEN")
     ======================================================================== */
  const expViewport = document.getElementById('expViewport');
  const expTabBtns = Array.from(document.querySelectorAll('.exp-tab-btn'));
  const expSlides = Array.from(document.querySelectorAll('.exp-slide-card'));
  const expChapterLabel = document.getElementById('expChapterLabel');
  const expProgressBar = document.getElementById('expProgressBar');
  const watermarkTop = document.getElementById('watermarkTop');
  const watermarkBottom = document.getElementById('watermarkBottom');
  const expPrevBtn = document.getElementById('expPrevBtn');
  const expNextBtn = document.getElementById('expNextBtn');

  let activeExpIndex = 0;

  function setActiveExpSlide(idx, scrollSmooth = true) {
    if (!expSlides.length) return;
    activeExpIndex = Math.max(0, Math.min(expSlides.length - 1, idx));
    const slide = expSlides[activeExpIndex];

    if (scrollSmooth && expViewport && slide) {
      const targetLeft = slide.offsetLeft - expViewport.clientWidth * 0.18;
      expViewport.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }

    expTabBtns.forEach((btn, i) => btn.classList.toggle('is-active', i === activeExpIndex));

    if (expChapterLabel && slide) {
      expChapterLabel.textContent = slide.dataset.chapter || '';
    }
    if (expProgressBar) {
      const pct = ((activeExpIndex + 1) / expSlides.length) * 100;
      expProgressBar.style.width = `${pct.toFixed(1)}%`;
    }
    if (watermarkTop && slide.dataset.wmTop) {
      watermarkTop.textContent = slide.dataset.wmTop;
      watermarkTop.style.transform = `translate3d(${(-activeExpIndex * 45).toFixed(0)}px, 0, 0)`;
    }
    if (watermarkBottom && slide.dataset.wmBottom) {
      watermarkBottom.textContent = slide.dataset.wmBottom;
      watermarkBottom.style.transform = `translate3d(${(activeExpIndex * 45 - 60).toFixed(0)}px, 0, 0)`;
    }
  }

  expTabBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => setActiveExpSlide(idx, true));
  });

  if (expPrevBtn) {
    expPrevBtn.addEventListener('click', () => setActiveExpSlide(activeExpIndex - 1, true));
  }
  if (expNextBtn) {
    expNextBtn.addEventListener('click', () => setActiveExpSlide(activeExpIndex + 1, true));
  }

  if (expViewport) {
    expViewport.addEventListener(
      'scroll',
      () => {
        const center = expViewport.scrollLeft + expViewport.clientWidth * 0.45;
        let closestIdx = 0;
        let minDist = Infinity;
        expSlides.forEach((sl, idx) => {
          const slCenter = sl.offsetLeft + sl.offsetWidth * 0.4;
          const d = Math.abs(center - slCenter);
          if (d < minDist) {
            minDist = d;
            closestIdx = idx;
          }
        });
        if (closestIdx !== activeExpIndex) {
          setActiveExpSlide(closestIdx, false);
        }
      },
      { passive: true }
    );

    // Drag to scroll on desktop
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    expViewport.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX;
      scrollStart = expViewport.scrollLeft;
    });
    window.addEventListener('mouseup', () => {
      isDown = false;
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      expViewport.scrollLeft = scrollStart - dx * 1.3;
    });
  }

  /* ========================================================================
     6. LANDING PAGES — 3D CURVED WAVE RIBBON CAROUSEL (#waveRibbonCanvas)
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

  const waveCanvas = document.getElementById('waveRibbonCanvas');
  const waveTitleEl = document.getElementById('waveProjectTitle');
  const waveSubEl = document.getElementById('waveProjectSub');
  const waveCountEl = document.getElementById('waveProjectCount');
  const waveLinkEl = document.getElementById('waveProjectLink');
  const ribbonPrevBtn = document.getElementById('ribbonPrevBtn');
  const ribbonNextBtn = document.getElementById('ribbonNextBtn');

  if (waveCanvas) {
    const wCtx = waveCanvas.getContext('2d');
    const loadedImgs = landingProjects.map((proj) => {
      const im = new Image();
      im.src = proj.img;
      return im;
    });

    let scrollPos = 0;
    let targetScrollPos = 0;
    let isDraggingRibbon = false;
    let dragStartX = 0;
    let dragStartPos = 0;
    let lastActiveIdx = -1;

    function updateWaveCaption(centerIdx) {
      const n = landingProjects.length;
      const idx = ((centerIdx % n) + n) % n;
      if (idx === lastActiveIdx) return;
      lastActiveIdx = idx;
      const item = landingProjects[idx];
      if (waveTitleEl) waveTitleEl.textContent = item.title;
      if (waveSubEl) waveSubEl.textContent = item.sub;
      if (waveCountEl) waveCountEl.textContent = `0${idx + 1} / 0${n}`;
      if (waveLinkEl) waveLinkEl.href = item.url;
    }

    function renderWaveRibbon() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = waveCanvas.clientWidth || window.innerWidth;
      const ch = waveCanvas.clientHeight || 400;
      if (waveCanvas.width !== cw * dpr || waveCanvas.height !== ch * dpr) {
        waveCanvas.width = cw * dpr;
        waveCanvas.height = ch * dpr;
      }

      wCtx.save();
      wCtx.scale(dpr, dpr);
      wCtx.clearRect(0, 0, cw, ch);

      // Smooth lerp toward target
      if (!isDraggingRibbon && !prefersReducedMotion) {
        scrollPos += (targetScrollPos - scrollPos) * 0.085;
      } else {
        scrollPos = targetScrollPos;
      }

      const cardW = Math.min(460, Math.max(260, cw * 0.36));
      const cardH = cardW * 0.62;
      const gap = cardW * 0.08;
      const stepX = cardW + gap;
      const n = landingProjects.length;

      const centerIndex = Math.round(scrollPos);
      updateWaveCaption(centerIndex);

      // Draw cards from left to right around scrollPos
      const slices = 28; // Vertical strips per card for smooth sine-wave bend
      for (let offset = -2; offset <= 2; offset++) {
        const virtualIdx = centerIndex + offset;
        const projIdx = ((virtualIdx % n) + n) % n;
        const img = loadedImgs[projIdx];

        const cardCenterX = cw * 0.5 + (virtualIdx - scrollPos) * stepX;
        const cardLeftX = cardCenterX - cardW * 0.5;

        if (cardLeftX > cw + 100 || cardLeftX + cardW < -100) continue;

        const stripW = cardW / slices;

        for (let s = 0; s < slices; s++) {
          const sxScreen = cardLeftX + s * stripW;
          const normX = (sxScreen + stripW * 0.5 - cw * 0.5) / (cw * 0.52);

          // S-curve wave deformation like 00:13 - 00:17 in the video
          const waveY = Math.sin(normX * Math.PI * 0.95) * (ch * 0.14) * Math.min(1, Math.abs(normX) * 1.35);
          const tiltScale = 1 - Math.abs(normX) * 0.08;
          const stripH = cardH * tiltScale;
          const syScreen = (ch - stripH) * 0.5 - waveY;

          if (img && img.complete && img.naturalWidth > 0) {
            const srcX = (s / slices) * img.naturalWidth;
            const srcW = Math.max(1, img.naturalWidth / slices);
            wCtx.drawImage(
              img,
              srcX,
              0,
              srcW,
              img.naturalHeight,
              sxScreen,
              syScreen,
              stripW + 0.9,
              stripH
            );
          } else {
            wCtx.fillStyle = '#1d1d22';
            wCtx.fillRect(sxScreen, syScreen, stripW + 0.8, stripH);
          }

          // Subtle 3D shading on curved outer edges
          const shade = Math.abs(normX) * 0.28;
          if (shade > 0.04) {
            wCtx.fillStyle = `rgba(9, 9, 11, ${shade.toFixed(3)})`;
            wCtx.fillRect(sxScreen, syScreen, stripW + 0.8, stripH);
          }
        }
      }

      wCtx.restore();
      requestAnimationFrame(renderWaveRibbon);
    }

    requestAnimationFrame(renderWaveRibbon);

    // Interaction: Drag, Wheel, Buttons
    waveCanvas.addEventListener('pointerdown', (e) => {
      isDraggingRibbon = true;
      dragStartX = e.clientX;
      dragStartPos = targetScrollPos;
      waveCanvas.setPointerCapture(e.pointerId);
    });
    waveCanvas.addEventListener('pointermove', (e) => {
      if (!isDraggingRibbon) return;
      const dx = e.clientX - dragStartX;
      targetScrollPos = dragStartPos - dx / 320;
    });
    const endRibbonDrag = () => {
      if (!isDraggingRibbon) return;
      isDraggingRibbon = false;
      targetScrollPos = Math.round(targetScrollPos);
    };
    waveCanvas.addEventListener('pointerup', endRibbonDrag);
    waveCanvas.addEventListener('pointercancel', endRibbonDrag);

    if (ribbonPrevBtn) {
      ribbonPrevBtn.addEventListener('click', () => {
        targetScrollPos = Math.round(targetScrollPos - 1);
      });
    }
    if (ribbonNextBtn) {
      ribbonNextBtn.addEventListener('click', () => {
        targetScrollPos = Math.round(targetScrollPos + 1);
      });
    }
  }

  /* ========================================================================
     7. WORKS '26 — HEXAGON RING -> 3D VERTICAL DRUM CAROUSEL
     ======================================================================== */
  const flagshipWorks = [
    {
      id: 'paperflix',
      title: 'Paperflix',
      kind: 'Plataforma EdTech · +3.200 Escuelas en Chile',
      desc: 'Plataforma educativa a gran escala con alta concurrencia e integración de IA con Groq que redujo un 60% el tiempo de carga y catalogación de contenido.',
      chips: ['Next.js 14', 'NestJS', 'Prisma', 'Supabase', 'Groq AI'],
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
      desc: 'Plataforma integral de gestión multimarca en producción con autenticación JWT, 5 roles, inventario en tiempo real y asistente de IA que aceleró búsquedas en 40%.',
      chips: ['Angular 17', 'Laravel 12', 'TypeScript', 'MySQL', 'IA Propia'],
      img: 'assets/img/portfolio/cards/s-i-t-i-sistema-integral-de-tiendas-inde.webp',
      url: 'https://siti.mateorojas.com.ar',
    },
    {
      id: 'petty',
      title: 'Petty Joyas',
      kind: 'E-Commerce Full Stack + POS con QR & WhatsApp Bot',
      desc: 'Tienda online de joyería, sistema POS para local con pistola lectora QR, chatbot WhatsApp Business y pasarela MercadoPago.',
      chips: ['Next.js', 'React', 'TypeScript', 'Laravel', 'MercadoPago'],
      img: 'assets/img/portfolio/cards/petty-joyas.webp',
      url: 'https://pettyjoyas.com.ar',
    },
    {
      id: 'mipaperlux',
      title: 'MiPaperlux',
      kind: 'Plataforma EdTech — Onboarding Gamificado',
      desc: 'Recorridos modulares gamificados post-compra para docentes en Chile, seguimiento en tiempo real y emisión automática de certificados.',
      chips: ['Next.js', 'NestJS', 'Prisma', 'Supabase', 'Vercel'],
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
      kind: 'Sistema de Reserva de Turnos en Tiempo Real',
      desc: 'Agenda online multi-sucursal con servicios combinables, notificaciones automáticas y panel de autogestión para clientes.',
      chips: ['Next.js', 'React', 'TypeScript', 'Prisma', 'Supabase'],
      img: 'assets/img/portfolio/cards/gabygor.webp',
      url: 'https://gabygor.com.ar',
    },
    {
      id: 'gvstore',
      title: 'GV Store',
      kind: 'E-Commerce Deportivo Full Stack',
      desc: 'Catálogo dinámico por categorías, carrito persistente, checkout integrado con MercadoPago y atención directa vía WhatsApp.',
      chips: ['Next.js', 'React', 'TypeScript', 'Prisma', 'Supabase'],
      img: 'assets/img/portfolio/cards/gv-store.webp',
      url: 'https://gvstore.com.ar',
    },
    {
      id: 'taccu',
      title: 'Taccu Rewards',
      kind: 'Sistema SaaS de Fidelización & Puntos',
      desc: 'Programa de puntos y recompensas para barberías con inicio de sesión por Google OAuth o teléfono y panel administrativo.',
      chips: ['Next.js', 'TypeScript', 'Supabase', 'Google OAuth'],
      img: 'assets/img/portfolio/cards/taccu.webp',
      url: 'https://taccu.vercel.app/',
    },
    {
      id: 'tefaltacalle',
      title: 'TeFaltaCalleOK',
      kind: 'E-Commerce Streetwear & Panel Admin',
      desc: 'Tienda online de indumentaria urbana con gestión de inventario, talles, carrito de compras y pedidos en Laravel + MySQL.',
      chips: ['Laravel', 'Tailwind', 'JavaScript', 'PHP', 'MySQL'],
      img: 'assets/img/portfolio/cards/tefaltacalleok.webp',
      url: 'https://www.tefaltacalleok.com',
    },
  ];

  const worksViewport = document.getElementById('works3dViewport');
  const worksCardsRig = document.getElementById('worksCardsRig');
  const worksIndexList = document.getElementById('worksIndexList');
  const workKindEl = document.getElementById('worksActiveKind');
  const workTitleEl = document.getElementById('worksActiveTitle');
  const workDescEl = document.getElementById('worksActiveDesc');
  const workChipsEl = document.getElementById('worksActiveChips');
  const workCtaEl = document.getElementById('worksActiveCta');
  const modeRingBtn = document.getElementById('modeRingBtn');
  const modeDrumBtn = document.getElementById('modeDrumBtn');
  const worksSection = document.getElementById('works');

  let worksMode = 'ring'; // 'ring' (00:19 hexagon) or 'drum' (00:21 vertical 3D drum)
  let activeWorkIdx = 0;
  let cardElements = [];
  let indexItems = [];

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

  function updateWorksLayout() {
    if (!worksCardsRig) return;
    const total = flagshipWorks.length;
    const isDrum = worksMode === 'drum';
    if (worksViewport) {
      worksViewport.classList.toggle('is-drum-mode', isDrum);
    }
    if (modeRingBtn) modeRingBtn.classList.toggle('is-active', !isDrum);
    if (modeDrumBtn) modeDrumBtn.classList.toggle('is-active', isDrum);

    // Update active info on left
    const activeWork = flagshipWorks[activeWorkIdx];
    if (workKindEl) workKindEl.textContent = activeWork.kind;
    if (workTitleEl) workTitleEl.textContent = activeWork.title;
    if (workDescEl) workDescEl.textContent = activeWork.desc;
    if (workChipsEl) {
      workChipsEl.innerHTML = activeWork.chips
        .map((c) => `<span class="works-chip">${c}</span>`)
        .join('');
    }
    if (workCtaEl) {
      if (activeWork.url) {
        workCtaEl.href = activeWork.url;
        workCtaEl.target = '_blank';
        workCtaEl.rel = 'noopener';
        workCtaEl.onclick = null;
        workCtaEl.innerHTML = `VER PROYECTO EN VIVO <i class="bi bi-arrow-up-right"></i>`;
      } else if (activeWork.gallery) {
        workCtaEl.href = '#works';
        workCtaEl.removeAttribute('target');
        workCtaEl.onclick = (e) => {
          e.preventDefault();
          openGalleryModal(activeWork.title, activeWork.gallery);
        };
        workCtaEl.innerHTML = `VER GALERÍA DEL SISTEMA <i class="bi bi-images"></i>`;
      }
    }

    // Highlight index item on right
    indexItems.forEach((li, idx) => {
      li.classList.toggle('is-active', idx === activeWorkIdx);
    });

    // Position 3D cards in either Hexagon Ring (00:19) or Vertical 3D Drum (00:21)
    const ringRadius = Math.min(185, window.innerWidth * 0.17);
    cardElements.forEach((card, idx) => {
      card.classList.toggle('is-ring-card', !isDrum);

      // Compute shortest circular delta from activeWorkIdx
      let delta = idx - activeWorkIdx;
      if (delta > total / 2) delta -= total;
      if (delta < -total / 2) delta += total;

      if (!isDrum) {
        // 6-sided Hexagon Ring around "WORKS '26" (like 00:18 - 00:19)
        if (Math.abs(delta) <= 2 || idx < 6) {
          const ringSlot = ((idx - activeWorkIdx) % 6 + 6) % 6;
          const angleDeg = ringSlot * 60 - 90;
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = Math.cos(angleRad) * ringRadius;
          const y = Math.sin(angleRad) * ringRadius;
          const rotZ = angleDeg + 90;
          const visible = idx < 6;
          card.style.opacity = visible ? '1' : '0';
          card.style.pointerEvents = visible ? 'auto' : 'none';
          card.style.zIndex = String(10 - ringSlot);
          card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotateZ(${rotZ.toFixed(1)}deg) scale(0.82)`;
        }
      } else {
        // Vertical 3D Drum Carousel (like 00:20 - 00:25)
        if (Math.abs(delta) > 2) {
          card.style.opacity = '0';
          card.style.pointerEvents = 'none';
          card.style.transform = `translate3d(0, ${(delta * 180).toFixed(0)}px, -320px) rotateX(${(-delta * 42).toFixed(0)}deg) scale(0.65)`;
        } else {
          const yOffset = delta * 195;
          const zOffset = -Math.abs(delta) * 145;
          const rotX = -delta * 38;
          const scale = delta === 0 ? 1.04 : Math.abs(delta) === 1 ? 0.84 : 0.68;
          const opacity = delta === 0 ? 1 : Math.abs(delta) === 1 ? 0.72 : 0.25;
          card.style.opacity = String(opacity);
          card.style.pointerEvents = Math.abs(delta) <= 1 ? 'auto' : 'none';
          card.style.zIndex = String(20 - Math.abs(delta) * 5);
          card.style.transform = `translate3d(0, ${yOffset.toFixed(1)}px, ${zOffset.toFixed(1)}px) rotateX(${rotX.toFixed(1)}deg) scale(${scale})`;
        }
      }
    });
  }

  if (worksCardsRig && worksIndexList) {
    // Render cards & right index list
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
      .map(
        (w, i) => `
      <li class="works-index-item ${i === 0 ? 'is-active' : ''}">
        <button type="button" data-idx="${i}">${w.title}</button>
      </li>`
      )
      .join('');

    cardElements = Array.from(worksCardsRig.querySelectorAll('.work-3d-card'));
    indexItems = Array.from(worksIndexList.querySelectorAll('.works-index-item'));

    cardElements.forEach((card, i) => {
      card.addEventListener('click', () => {
        if (worksMode === 'ring') {
          worksMode = 'drum';
          activeWorkIdx = i;
          updateWorksLayout();
        } else if (activeWorkIdx !== i) {
          activeWorkIdx = i;
          updateWorksLayout();
        } else {
          // Clicking the centered active card opens its live URL or gallery
          const w = flagshipWorks[i];
          if (w.url) {
            window.open(w.url, '_blank', 'noopener');
          } else if (w.gallery) {
            openGalleryModal(w.title, w.gallery);
          }
        }
      });
    });

    indexItems.forEach((li, i) => {
      const btn = li.querySelector('button');
      if (btn) {
        btn.addEventListener('click', () => {
          worksMode = 'drum';
          activeWorkIdx = i;
          updateWorksLayout();
        });
      }
    });

    if (modeRingBtn) {
      modeRingBtn.addEventListener('click', () => {
        worksMode = 'ring';
        updateWorksLayout();
      });
    }
    if (modeDrumBtn) {
      modeDrumBtn.addEventListener('click', () => {
        worksMode = 'drum';
        updateWorksLayout();
      });
    }

    // Auto-unfold from Hexagon Ring to 3D Drum as user scrolls deeper into #works
    window.addEventListener(
      'scroll',
      () => {
        if (!worksSection) return;
        const r = worksSection.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.15 && r.bottom > window.innerHeight * 0.45) {
          if (worksMode === 'ring') {
            worksMode = 'drum';
            updateWorksLayout();
          }
        } else if (r.top > window.innerHeight * 0.55) {
          if (worksMode === 'drum') {
            worksMode = 'ring';
            updateWorksLayout();
          }
        }
      },
      { passive: true }
    );

    // Wheel & drag cycling on the 3D Drum viewport
    let lastWheelTime = 0;
    if (worksViewport) {
      worksViewport.addEventListener(
        'wheel',
        (e) => {
          const now = performance.now();
          if (now - lastWheelTime < 420) return;
          if (Math.abs(e.deltaY) < 18) return;

          if (worksMode === 'ring') {
            worksMode = 'drum';
            updateWorksLayout();
            lastWheelTime = now;
            e.preventDefault();
            return;
          }

          if (e.deltaY > 0 && activeWorkIdx < flagshipWorks.length - 1) {
            e.preventDefault();
            activeWorkIdx++;
            lastWheelTime = now;
            updateWorksLayout();
          } else if (e.deltaY < 0 && activeWorkIdx > 0) {
            e.preventDefault();
            activeWorkIdx--;
            lastWheelTime = now;
            updateWorksLayout();
          }
        },
        { passive: false }
      );

      let drumDragStartY = null;
      worksViewport.addEventListener('pointerdown', (e) => {
        drumDragStartY = e.clientY;
      });
      window.addEventListener('pointerup', (e) => {
        if (drumDragStartY === null) return;
        const dy = e.clientY - drumDragStartY;
        drumDragStartY = null;
        if (Math.abs(dy) > 36) {
          worksMode = 'drum';
          const n = flagshipWorks.length;
          activeWorkIdx = dy < 0 ? (activeWorkIdx + 1) % n : (activeWorkIdx - 1 + n) % n;
          updateWorksLayout();
        }
      });
    }

    updateWorksLayout();
    window.addEventListener('resize', updateWorksLayout);
  }

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
