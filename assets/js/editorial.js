/**
 * Portfolio editorial: lo poco que se mueve. La Mac del hero (el avatar mira el cursor, parpadea
 * y saluda), los filtros del trabajo, la paleta de comandos con "/", los artículos y la galería
 * en ventanas, el formulario de contacto y las entradas al bajar.
 */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = 'rojas.mateo.web@gmail.com';

  /* ---------- Estado en la cabecera: lo que está haciendo, rotando ---------- */

  const status = $('[data-status]');
  const doing = (status?.dataset.status || '').split('|').filter(Boolean);
  if (status && doing.length > 1 && !still) {
    let i = 0;
    setInterval(() => {
      status.style.opacity = 0;
      setTimeout(() => {
        i = (i + 1) % doing.length;
        status.textContent = doing[i];
        status.style.opacity = 1;
      }, 300);
    }, 4200);
  }

  /* ---------- La Mac: el avatar mira el cursor, parpadea y saluda ---------- */

  const mac = $('.mac');
  if (mac) {
    const eyes = $('.eyes', mac);
    const face = $('.inner-face', mac);
    let x = 0, y = 0, queued = false;
    addEventListener('pointermove', (e) => {
      const box = mac.getBoundingClientRect();
      // hacia dónde está el cursor respecto de la pantalla de la Mac, entre -1 y 1
      x = Math.max(-1, Math.min(1, (e.clientX - (box.left + box.width / 2)) / (innerWidth / 2)));
      y = Math.max(-1, Math.min(1, (e.clientY - (box.top + box.height * 0.35)) / (innerHeight / 2)));
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        eyes?.setAttribute('transform', `translate(${(x * 2.6).toFixed(2)} ${(y * 1.8).toFixed(2)})`);
        face?.setAttribute('transform', `translate(${(x * 1.2).toFixed(2)} ${(y * 0.8).toFixed(2)})`);
      });
    }, { passive: true });

    const blink = () => {
      mac.classList.add('is-blink');
      setTimeout(() => mac.classList.remove('is-blink'), 140);
      setTimeout(blink, 2600 + Math.random() * 3000);
    };
    if (!still) setTimeout(blink, 2400);

    let hi;
    const wave = () => {
      mac.classList.add('is-hi');
      clearTimeout(hi);
      hi = setTimeout(() => mac.classList.remove('is-hi'), 2200);
    };
    mac.addEventListener('click', wave);
    mac.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wave();
      }
    });
  }

  /* ---------- Trabajo: filtros y "ver todos" ---------- */

  const cards = $$('.card');
  const moreBtn = $('[data-more]');
  const FIRST = 9;
  let rule = '*', open = false;

  function showCards() {
    const matching = cards.filter((card) => rule === '*' || card.dataset.filters.split(' ').includes(rule));
    cards.forEach((card) => { card.hidden = true; });
    matching.forEach((card, i) => { card.hidden = !open && i >= FIRST; });
    if (moreBtn) {
      moreBtn.hidden = matching.length <= FIRST;
      moreBtn.querySelector('span').textContent = open ? moreBtn.dataset.less : moreBtn.dataset.more.replace('{n}', matching.length);
    }
  }

  $$('.filters button').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.filters button').forEach((b) => b.classList.toggle('is-on', b === button));
      rule = button.dataset.filter;
      showCards();
    });
  });
  moreBtn?.addEventListener('click', () => {
    open = !open;
    showCards();
    if (!open) $('#trabajo').scrollIntoView();
  });
  showCards();

  /* ---------- Ventanas: artículos y galerías ---------- */

  const article = $('#article');
  $$('[data-article]').forEach((button) => {
    button.addEventListener('click', () => {
      const data = window.ARTICLES?.[button.dataset.article];
      if (!data || !article) return;
      $('.article-cat', article).textContent = data.category;
      $('.article-body', article).innerHTML = `<h2>${data.title}</h2><div class="meta">${data.meta}</div>${data.body}`;
      article.showModal();
      $('.article-body', article).scrollTop = 0;
    });
  });

  const gallery = $('#gallery');
  $$('[data-gallery]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!gallery) return;
      $('.gallery-title', gallery).textContent = button.dataset.title;
      $('.gallery', gallery).innerHTML = JSON.parse(button.dataset.gallery).map((src) => `<img src="${src}" alt="" loading="lazy">`).join('');
      gallery.showModal();
    });
  });

  // cerrar tocando afuera o con el botón de la barra
  $$('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
    });
  });

  /* ---------- Copiar el email ---------- */

  $$('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const tag = button.querySelector('small');
      try {
        await navigator.clipboard.writeText(EMAIL);
        if (tag) tag.textContent = tag.dataset.done;
      } catch (_) {
        location.href = `mailto:${EMAIL}`;
      }
      setTimeout(() => { if (tag) tag.textContent = tag.dataset.idle; }, 1800);
    });
  });

  /* ---------- Paleta de comandos: "/" para ir a cualquier lado ---------- */

  const palette = $('#palette');
  const input = $('input', palette);
  const list = $('ul', palette);
  const actions = $$('[data-cmd]', palette).map((li) => ({ li, text: li.textContent.toLowerCase() }));
  let pick = 0;

  function filterPalette() {
    const q = input.value.trim().toLowerCase();
    const shown = actions.filter((a) => !q || a.text.includes(q));
    actions.forEach((a) => { a.li.hidden = !shown.includes(a); });
    pick = Math.min(pick, Math.max(0, shown.length - 1));
    shown.forEach((a, i) => a.li.classList.toggle('is-on', i === pick));
    return shown;
  }

  function run(li) {
    palette.close();
    const cmd = li.dataset.cmd;
    if (cmd.startsWith('#')) $(cmd)?.scrollIntoView();
    else if (cmd === 'copy') $('[data-copy]')?.click();
    else window.open(cmd, cmd.startsWith('mailto') ? '_self' : '_blank', 'noopener');
  }

  function openPalette() {
    if (!palette || palette.open) return;
    input.value = '';
    pick = 0;
    filterPalette();
    palette.showModal();
    input.focus();
  }

  addEventListener('keydown', (e) => {
    const typing = /input|textarea|select/i.test(document.activeElement?.tagName) && document.activeElement !== input;
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !typing && !palette.open) {
      e.preventDefault();
      openPalette();
    }
  });
  $$('[data-palette]').forEach((b) => b.addEventListener('click', openPalette));
  input?.addEventListener('input', () => { pick = 0; filterPalette(); });
  input?.addEventListener('keydown', (e) => {
    const shown = filterPalette();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      pick = (pick + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length;
      filterPalette();
    } else if (e.key === 'Enter' && shown[pick]) {
      e.preventDefault();
      run(shown[pick].li);
    }
  });
  list?.addEventListener('click', (e) => {
    const li = e.target.closest('[data-cmd]');
    if (li) run(li);
  });

  /* ---------- Contacto ---------- */

  const form = $('#contactForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = $('.form-status', form);
    const button = $('button[type="submit"]', form);
    note.className = 'form-status';
    note.textContent = note.dataset.sending;
    button.disabled = true;
    try {
      const res = await fetch('contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || note.dataset.error);
      note.classList.add('is-ok');
      note.textContent = data.message || note.dataset.sent;
      form.reset();
    } catch (err) {
      note.classList.add('is-err');
      note.textContent = err.message || note.dataset.error;
    } finally {
      button.disabled = false;
    }
  });

  /* ---------- Navegación: la pastilla de la sección que se está leyendo ---------- */

  const links = $$('.nav a');
  const watched = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const onScreen = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === `#${entry.target.id}`));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  watched.forEach((section) => onScreen.observe(section));

  /* ---------- Entradas al bajar ---------- */

  const appear = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      appear.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => appear.observe(el));

  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
