// Section order follows the presentation (slides 1–19).
const SECTIONS = [
  ['1-airlock', 'sections/1-airlock.html'],
  ['2-header', 'sections/2-header.html'],
  ['3-hero', 'sections/3-hero.html'],
  ['4-journey', 'sections/4-journey.html'],
  ['4-space', 'sections/4-space.html'],
  ['6-mike', 'sections/6-mike.html'],
  ['7-values', 'sections/7-values.html'],
  ['7-inside', 'sections/7-inside.html'],
  ['7-numbers', 'sections/7-numbers.html'],
  ['8-editorial', 'sections/8-editorial.html'],
  ['9-brand', 'sections/9-brand.html'],
  ['10-marketing', 'sections/10-marketing.html'],
  ['10-packages', 'sections/10-packages.html'],
  ['5-destinations', 'sections/5-destinations.html'],
  ['14-season', 'sections/14-season.html'],
  ['12-process', 'sections/12-process.html'],
  ['16-gallery-intro', 'sections/16-gallery-intro.html'],
  ['8-gallery', 'sections/8-gallery.html'],
  ['13-boarding', 'sections/13-boarding.html'],
  ['11-footer', 'sections/11-footer.html'],
];

async function loadSections() {
  const html = await Promise.all(SECTIONS.map(([id, url]) => fetch(url)
    .then((res) => res.text())
    .catch((e) => { console.error('Failed to load section', id, e); return ''; })));
  SECTIONS.forEach(([id], i) => {
    const slot = document.getElementById(id);
    if (slot) slot.innerHTML = html[i];
  });
}

async function init() {
  document.documentElement.classList.add('fc-js');
  await loadSections();
  enhanceButtons();
  initInteractions();
  initTabs();

  // Initialize effects after all HTML is loaded
  await import('./modules/airlock.js');
  await import('./modules/flight-cursor.js');
  await import('./modules/tubes.js');
  const { initMotion } = await import('./modules/motion.js');
  initMotion();
}

/* Buttons: wrap the label so it can roll on hover (text stays readable without JS). */
function enhanceButtons() {
  document.querySelectorAll('.fc-btn').forEach((btn) => {
    if (btn.querySelector('.fc-btn__label')) return;
    const text = btn.textContent.trim();
    btn.textContent = '';
    const label = document.createElement('span');
    label.className = 'fc-btn__label';
    const inner = document.createElement('span');
    inner.dataset.text = text;
    inner.textContent = text;
    label.append(inner);
    btn.append(label);
  });
}

function initInteractions() {
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  mobileBtn?.addEventListener('click', () => {
    const open = mobileMenu?.classList.toggle('hidden') === false;
    mobileBtn.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu?.classList.add('hidden');
      mobileBtn?.setAttribute('aria-expanded', 'false');
    });
  });

  // Picking a ticket tears its stub and carries the choice into the check-in form.
  window.selectPackage = (tierName, source) => {
    const select = document.getElementById('form-tier');
    if (select) select.value = tierName;
    const ticket = source?.closest('.fc-ticket');
    document.querySelectorAll('.fc-ticket.is-picked').forEach((t) => t.classList.remove('is-picked'));
    if (ticket) {
      void ticket.offsetWidth;
      ticket.classList.add('is-picked');
    }
    window.setTimeout(() => document.getElementById('boarding-pass')?.scrollIntoView({ behavior: 'smooth' }), ticket ? 420 : 0);
  };

  // Check-in form → printed boarding pass. Nothing is sent automatically: the pass offers
  // a prefilled e-mail so the partner request actually reaches the team.
  document.getElementById('partner-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = (id, fallback = '') => document.getElementById(id)?.value.trim() || fallback;
    const name = value('form-name', 'Gość');
    const brand = value('form-brand', 'Partner');
    const tier = value('form-tier', 'BUSINESS');
    document.getElementById('ticket-name').textContent = name.toUpperCase();
    document.getElementById('ticket-brand').textContent = brand.toUpperCase();
    document.getElementById('ticket-tier').textContent = tier;
    drawBarcode(document.getElementById('ticket-barcode'), `${name}|${brand}|${tier}`);

    const body = [
      `Imię i nazwisko: ${name}`,
      `Marka / firma: ${brand}`,
      `E-mail: ${value('form-email')}`,
      `Telefon: ${value('form-phone')}`,
      `Pakiet: ${tier}`,
      `Kategoria marki: ${value('form-category')}`,
      '',
      value('form-message'),
    ].join('\n');
    const send = document.getElementById('ticket-send');
    if (send) send.href = `mailto:contact@bamevents.pl?subject=${encodeURIComponent(`First Class 2027 — zgłoszenie partnera: ${brand}`)}&body=${encodeURIComponent(body)}`;

    const ticket = document.getElementById('ticket-result');
    ticket?.classList.remove('hidden', 'is-printing');
    void ticket?.offsetWidth;
    ticket?.classList.add('is-printing');
    ticket?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // Newsletter: no mailing-list backend is connected yet, so this opens a prefilled e-mail.
  document.getElementById('newsletter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    const consent = document.getElementById('newsletter-consent');
    const status = document.getElementById('newsletter-status');
    const email = emailInput?.value.trim();
    if (!email || !emailInput.checkValidity()) {
      if (status) status.textContent = 'Wpisz poprawny adres e-mail.';
      emailInput?.focus();
      return;
    }
    if (consent && !consent.checked) {
      if (status) status.textContent = 'Zaznacz zgodę, abyśmy mogli wysyłać informacje o sezonie.';
      consent.focus();
      return;
    }
    const subject = encodeURIComponent('First Class 2027 — lista pokładowa');
    const body = encodeURIComponent(`Proszę o dodanie adresu ${email} do listy pokładowej First Class (sezon 2027).`);
    if (status) status.textContent = 'Otwieramy Twoją pocztę z gotową wiadomością — wyślij ją, aby dołączyć do listy.';
    window.location.href = `mailto:contact@bamevents.pl?subject=${subject}&body=${body}`;
  });

  // Welcome on Board: sunset light (slide 19) ↔ day sky V2 (slide 21).
  const boarding = document.getElementById('boarding-pass');
  boarding?.querySelectorAll('[data-sky-set]').forEach((button) => {
    button.addEventListener('click', () => {
      const sky = button.dataset.skySet;
      boarding.dataset.sky = sky;
      document.documentElement.dataset.sky = sky;
      boarding.querySelectorAll('[data-sky-set]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    });
  });
}

function drawBarcode(svg, seed) {
  if (!svg) return;
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const bars = [];
  let x = 0;
  while (x < 100) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const w = 0.6 + ((h >>> 0) % 4) * 0.55;
    const gap = 0.5 + ((h >>> 8) % 3) * 0.5;
    if (x + w > 100) break;
    bars.push(`<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="40"/>`);
    x += w + gap;
  }
  svg.setAttribute('viewBox', '0 0 100 40');
  svg.innerHTML = `<g fill="#111">${bars.join('')}</g>`;
}

/* Tabs for Brand Opportunity, Marketing & Media and the partner process. */
function initTabs() {
  const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tabset = ({ buttons, panels, image, images, onSelect, autoplay }) => {
    if (!buttons.length) return;
    let current = 0;
    let timer = 0;
    const bar = autoplay ? Object.assign(document.createElement('span'), { className: 'fc-autoplay', innerHTML: '<i></i>' }) : null;
    if (bar) {
      bar.style.setProperty('--dur', `${autoplay.delay}ms`);
      autoplay.root.append(bar);
    }
    const select = (index, fromUser = false) => {
      current = index;
      buttons.forEach((button, i) => {
        const active = i === index;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel, i) => { panel.hidden = i !== index; });
      if (image && images?.[index]) {
        image.style.opacity = '0.2';
        window.setTimeout(() => {
          image.src = images[index][0];
          image.alt = images[index][1];
          requestAnimationFrame(() => { image.style.opacity = '1'; });
        }, 140);
      }
      onSelect?.(index);
      if (fromUser) stop();
      else restart();
    };
    const stop = () => {
      window.clearTimeout(timer);
      autoplay && (autoplay.stopped = true);
      bar?.classList.remove('is-running');
    };
    const restart = () => {
      if (!autoplay || autoplay.stopped || !motionAllowed) return;
      window.clearTimeout(timer);
      bar.classList.remove('is-running');
      void bar.offsetWidth;
      bar.classList.add('is-running');
      timer = window.setTimeout(() => select((current + 1) % buttons.length), autoplay.delay);
    };
    if (autoplay) {
      // Only run while the tabs are on screen; pause while hovered.
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !autoplay.stopped) restart();
        else { window.clearTimeout(timer); bar.classList.remove('is-running'); }
      }, { threshold: .35 }).observe(autoplay.root.parentElement);
      const area = autoplay.root.parentElement;
      area.addEventListener('pointerenter', () => { window.clearTimeout(timer); bar.classList.add('is-paused'); });
      area.addEventListener('pointerleave', () => { bar.classList.remove('is-paused'); restart(); });
    }
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(index, true));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const last = buttons.length - 1;
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? last : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus();
        select(next, true);
      });
    });
    select(0);
  };

  const brand = document.querySelector('.fc-brand-flight');
  const brandPath = brand?.querySelector('.fc-brand-path');
  tabset({
    buttons: [...(brand?.querySelectorAll('[data-brand-step]') || [])],
    panels: [...(brand?.querySelectorAll('[data-brand-panel]') || [])],
    image: brand?.querySelector('.fc-brand-feature__visual img'),
    images: [
      ['images/image_10.jpg', 'Samolot z napisem „If you\'re reading this we left” — viralowy content First Class'],
      ['images/hangar_party.jpg', 'Scena i tłum w hangarze podczas First Class'],
      ['images/cabin_crew.jpg', 'Cabin crew First Class podczas wydarzenia'],
      ['images/logo_projection.jpg', 'Projekcja logo First Class po wydarzeniu'],
    ],
    onSelect: (index) => {
      const line = brand?.querySelector('.fc-brand-path__line i');
      if (line) {
        line.style.transition = 'transform .55s cubic-bezier(.2,.75,.2,1)';
        line.style.transform = `scaleX(${index / 3})`;
      }
    },
    autoplay: brandPath ? { root: brandPath, delay: Number(brandPath.dataset.autoplay) || 7000 } : null,
  });

  const marketing = document.querySelector('.fc-marketing');
  const marketingTabs = marketing?.querySelector('.fc-marketing__tabs');
  tabset({
    buttons: [...(marketing?.querySelectorAll('[data-marketing-step]') || [])],
    panels: [...(marketing?.querySelectorAll('[data-marketing-panel]') || [])],
    image: marketing?.querySelector('.fc-marketing__image img'),
    images: [
      ['images/image_13.jpg', 'DJ za konsoletą podczas First Class'],
      ['images/image_22.jpg', 'Artystka gra przy pomarańczowym ekranie'],
      ['images/terrace_stage.jpg', 'Scena First Class na tle Warszawy'],
      ['images/image_15.jpg', 'Scena i tłum w świetle reflektorów'],
      ['images/dj_offwhite.jpg', 'Artysta i goście w czerwonym świetle'],
    ],
    autoplay: marketingTabs ? { root: marketingTabs, delay: Number(marketingTabs.dataset.autoplay) || 7000 } : null,
  });

  // Partner process: plane flies along the route to the selected step.
  const processCopy = [
    ['01 / Rozmowa', 'Najpierw posłuchamy.', 'Poznajemy cele marki, kategorię i grupę odbiorców — i to, co dla nich będzie naprawdę warte zapamiętania.'],
    ['02 / Koncepcja', 'Potem układamy lot.', 'Projektujemy zakres obecności dopasowany do partnera — od pojedynczej aktywacji po współpracę całosezonową.'],
    ['03 / Odlot', 'I ruszamy razem.', 'Marka wchodzi na pokład wybranej edycji lub całego sezonu 2027 — i staje się częścią historii, którą goście zabierają ze sobą.'],
  ];
  const route = document.querySelector('.fc-process__route-progress');
  const svgPath = document.querySelector('.fc-process__route path');
  const plane = document.querySelector('.fc-process__plane');
  const routeLength = route?.getTotalLength?.() || 0;
  if (route && routeLength) {
    route.style.strokeDasharray = String(routeLength);
    route.style.strokeDashoffset = String(routeLength);
  }
  const motion = { value: 0 };
  const movePlane = (progress) => {
    const point = svgPath?.getPointAtLength(svgPath.getTotalLength() * progress);
    if (point) plane?.setAttribute('transform', `translate(${point.x} ${point.y})`);
  };
  const processButtons = [...document.querySelectorAll('[data-process-step]')];
  tabset({
    buttons: processButtons,
    panels: [],
    onSelect: (index) => {
      const [kicker, title, copy] = processCopy[index];
      document.getElementById('process-kicker').textContent = kicker;
      document.getElementById('process-title').textContent = title;
      document.getElementById('process-copy').textContent = copy;
      const progress = index / (processButtons.length - 1 || 1);
      if (route && routeLength) route.style.strokeDashoffset = String(routeLength * (1 - progress));
      if (window.gsap && motionAllowed) {
        window.gsap.to(motion, { value: progress, duration: .8, ease: 'power2.inOut', overwrite: true, onUpdate: () => movePlane(motion.value) });
      } else {
        motion.value = progress;
        movePlane(progress);
      }
    },
  });
}

document.addEventListener('DOMContentLoaded', init);
