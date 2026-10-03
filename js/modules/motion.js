// Motion layer for the First Class page: neon signs, scroll-scrubbed scenes and
// pointer interactions. Everything degrades to a static, fully readable page when
// GSAP is missing or the visitor prefers reduced motion.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const onEnter = (els, cb, options = {}) => {
  const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    cb(entry.target);
    io.unobserve(entry.target);
  }), { threshold: options.threshold ?? .35, rootMargin: options.rootMargin ?? '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
};

export function initMotion() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const canScrub = Boolean(gsap && ScrollTrigger && !reduceMotion);
  if (canScrub) gsap.registerPlugin(ScrollTrigger);

  heroTitle(gsap, canScrub);
  odometers();
  neonSigns();
  planeDrawings();
  classTriggers();
  counters(gsap);
  marquees();
  flightPaths();
  departuresBoard();
  boardClock();
  gallery();
  if (finePointer && !reduceMotion) { tilt(); magnetic(); spotlight(); }

  if (!canScrub) { staticFallbacks(); return; }

  parallaxImages(gsap);
  journeyDepth(gsap);
  wordReveal(gsap);
  route(gsap);
  flightLog(gsap);
  filmstrip(gsap, ScrollTrigger);
  crewReveal(gsap);
  valuesRunway(gsap);
  xrayScan(gsap);
  timeline(gsap);
  seasonMega(gsap);
  windowReveal(gsap);

  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh);
  window.addEventListener('fc:airlock-release', refresh);
  requestAnimationFrame(refresh);
}

/* ---------- Hero: letters rise out of a mask, then the neon sign flickers on ---------- */
function heroTitle(gsap, canScrub) {
  const hero = $('#hero');
  if (!hero) return;
  const words = $$('[data-split]', hero);
  words.forEach((word) => {
    word.innerHTML = [...word.textContent].map((ch) => `<span class="ch">${ch}</span>`).join('');
  });
  const flight = $('.fc-hero__flight', hero);
  const play = () => {
    hero.classList.add('is-on');
    if (canScrub) {
      gsap.from($$('.ch', hero), { yPercent: 115, rotate: 8, opacity: 0, duration: 1.1, stagger: .05, ease: 'expo.out' });
      gsap.from($$('.fc-hero__meta li, .fc-hero__lead, .fc-hero__actions', hero), { opacity: 0, y: 14, filter: 'blur(6px)', duration: .9, stagger: .1, delay: .55, ease: 'power3.out' });
    }
    window.setTimeout(() => flight?.classList.add('is-lit'), canScrub ? 700 : 0);
  };
  onEnter([hero], play, { threshold: .25, rootMargin: '0px' });
}

/* ---------- Every [data-neon] word switches on like a neon tube when it enters ---------- */
function neonSigns() {
  const signs = $$('[data-neon]').filter((el) => !el.closest('#hero'));
  if (reduceMotion) { signs.forEach((el) => el.classList.add('is-lit')); return; }
  onEnter(signs, (el) => window.setTimeout(() => el.classList.add('is-lit'), 120 + Math.random() * 260), { threshold: .6 });
}

function planeDrawings() {
  const planes = $$('.fc-plane-outline[data-draw]');
  if (reduceMotion) { planes.forEach((el) => el.classList.add('is-drawn')); return; }
  onEnter(planes, (el) => el.classList.add('is-drawn'), { threshold: .15 });
}

function classTriggers() {
  const groups = [
    ['.fc-bars', 'is-on', .4],
    ['mark[data-mark]', 'is-on', .5],
    ['[data-stamp]', 'is-on', .9],
    ['.fc-stat-card', 'is-on', .45],
    ['.fc-journey__counters li', 'is-on', .6],
  ];
  groups.forEach(([sel, cls, threshold]) => {
    const els = $$(sel);
    if (reduceMotion) els.forEach((el) => el.classList.add(cls));
    else onEnter(els, (el) => el.classList.add(cls), { threshold });
  });
}

/* ---------- Counters keep their prefix ("około", "~") small, like in the deck ---------- */
function counters(gsap) {
  const render = (node, value) => {
    const { prefix = '', suffix = '' } = node.dataset;
    const decimals = Number(node.dataset.decimals || 0);
    const text = Number(value).toFixed(decimals).replace('.', ',');
    node.innerHTML = `${prefix ? `<small class="fc-count__pre">${prefix.trim()}</small>` : ''}${text}${suffix}`;
  };
  const nodes = $$('.fc-count[data-count]');
  nodes.forEach((node) => render(node, node.dataset.count));
  if (!gsap || reduceMotion) return;
  nodes.forEach((node) => render(node, 0));
  onEnter(nodes, (node) => {
    const state = { v: 0 };
    gsap.to(state, { v: Number(node.dataset.count), duration: 1.7, ease: 'power3.out', onUpdate: () => render(node, state.v) });
  }, { threshold: .6 });
}

/* ---------- Seamless marquees (brands under Mike) ---------- */
function marquees() {
  $$('[data-marquee]').forEach((track) => {
    const clone = [...track.children].map((child) => {
      const copy = child.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      return copy;
    });
    track.append(...clone);
  });
}

/* ---------- Next Destinations background: flowing flight paths ---------- */
function flightPaths() {
  const svg = $('[data-flight-paths]');
  if (!svg) return;
  const ns = 'http://www.w3.org/2000/svg';
  for (const position of [1, -1]) {
    for (let i = 0; i < 30; i += 1) {
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('d', `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`);
      p.setAttribute('pathLength', '1');
      p.setAttribute('stroke', i % 7 === 0 ? '#ff7300' : '#ffffff');
      p.setAttribute('stroke-opacity', String(i % 7 === 0 ? .32 : .025 + i * .0035));
      p.setAttribute('stroke-width', String(.4 + i * .025));
      p.style.setProperty('--d', `${18 + ((i * 7) % 13)}s`);
      p.style.animationDelay = `-${(i * 1.7) % 18}s`;
      svg.append(p);
    }
  }
  const section = svg.closest('.fc-dest');
  new IntersectionObserver(([entry]) => section.classList.toggle('is-visible', entry.isIntersecting)).observe(section);
}

/* ---------- Split-flap departures board ---------- */
function departuresBoard() {
  const board = $('[data-flap-board]');
  if (!board) return;
  const CHARSET = 'ABCDEFGHIJKLMNOPRSTUWYZĄĘŁŃÓŚŻ0123456789–';
  const flaps = $$('[data-flap]', board);
  flaps.forEach((flap) => {
    const text = flap.dataset.flap;
    flap.setAttribute('aria-label', text);
    flap.innerHTML = text.split(' ').map((word) => `<span class="wd" aria-hidden="true">${[...word].map((ch) => `<span class="c" data-ch="${ch}">${reduceMotion ? ch : ' '}</span>`).join('')}</span>`).join('');
  });
  if (reduceMotion) { flaps.forEach((f) => f.classList.add('is-settled')); return; }
  const run = () => {
    flaps.forEach((flap, fi) => {
      const cells = $$('.c', flap);
      cells.forEach((cell, ci) => {
        const target = cell.dataset.ch;
        const flipsLeft = 6 + ci * 2 + fi * 3 + Math.floor(Math.random() * 6);
        let n = 0;
        const tick = () => {
          n += 1;
          cell.textContent = n >= flipsLeft ? target : CHARSET[Math.floor(Math.random() * CHARSET.length)];
          cell.classList.remove('flip');
          void cell.offsetWidth;
          cell.classList.add('flip');
          if (n < flipsLeft) window.setTimeout(tick, 55 + Math.random() * 25);
          else if (ci === cells.length - 1) flap.classList.add('is-settled');
        };
        window.setTimeout(tick, fi * 90);
      });
    });
  };
  onEnter([board], run, { threshold: .3 });
}

function boardClock() {
  const clock = $('[data-clock]');
  if (!clock) return;
  const fmt = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
  const tick = () => { clock.textContent = `WAW ${fmt.format(new Date())}`; };
  tick();
  window.setInterval(tick, 15000);
}

/* ---------- Gallery lightbox ---------- */
function gallery() {
  const root = $('[data-gallery]');
  const dialog = $('.fc-lightbox');
  if (!root || !dialog || typeof dialog.showModal !== 'function') return;
  const items = $$('.fc-bento__item', root);
  const img = $('img', dialog);
  const caption = $('figcaption', dialog);
  let index = 0;
  const show = (i) => {
    index = (i + items.length) % items.length;
    const source = $('img', items[index]);
    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    caption.textContent = `${source.alt} · ${index + 1} / ${items.length}`;
  };
  items.forEach((item, i) => item.addEventListener('click', () => { show(i); dialog.showModal(); }));
  $('.fc-lightbox__close', dialog).addEventListener('click', () => dialog.close());
  $('.fc-lightbox__nav--prev', dialog).addEventListener('click', () => show(index - 1));
  $('.fc-lightbox__nav--next', dialog).addEventListener('click', () => show(index + 1));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') show(index + 1);
    if (event.key === 'ArrowLeft') show(index - 1);
  });
}

/* ---------- Pointer: tilt with glare, magnetic buttons ---------- */
function tilt() {
  $$('[data-tilt]').forEach((card) => {
    const max = card.classList.contains('fc-ticket') ? 6 : 9;
    card.addEventListener('pointermove', (event) => {
      const r = card.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width;
      const y = (event.clientY - r.top) / r.height;
      card.classList.add('is-tilting');
      card.style.setProperty('--rx', `${(0.5 - y) * max}deg`);
      card.style.setProperty('--ry', `${(x - 0.5) * max}deg`);
      card.style.setProperty('--gx', `${x * 100}%`);
      card.style.setProperty('--gy', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

function magnetic() {
  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const r = el.getBoundingClientRect();
      const x = event.clientX - (r.left + r.width / 2);
      const y = event.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * .18}px, ${y * .3}px)`;
      el.style.transition = 'transform .15s linear';
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform .6s cubic-bezier(.2,.75,.2,1)';
    });
  });
}

/* ---------- Scroll-scrubbed scenes (GSAP ScrollTrigger) ---------- */
function parallaxImages(gsap) {
  $$('[data-parallax-img]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('[data-zoom-out]').forEach((img) => {
    gsap.fromTo(img, { scale: 1.28 }, { scale: 1.04, ease: 'none', scrollTrigger: { trigger: img.closest('section'), start: 'top bottom', end: 'center top', scrub: true } });
  });
  $$('.fc-bento__item img').forEach((img, i) => {
    gsap.fromTo(img, { yPercent: i % 2 ? -5 : 5 }, { yPercent: i % 2 ? 5 : -5, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

function wordReveal(gsap) {
  $$('[data-word-reveal], [data-highlight]').forEach((el) => {
    const walk = (node) => [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part.trim()) { frag.append(part); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.textContent = part;
          frag.append(w);
        });
        child.replaceWith(frag);
      } else walk(child);
    });
    walk(el);
    gsap.to($$('.w', el), { opacity: 1, stagger: .12, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: true } });
  });
}

function filmstrip(gsap, ScrollTrigger) {
  const track = $('[data-filmstrip]');
  if (!track) return;
  [...track.children].forEach((child) => {
    const copy = child.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    $('img', copy).alt = '';
    track.append(copy);
  });
  const loop = gsap.to(track, { xPercent: -50, duration: 55, ease: 'none', repeat: -1 });
  ScrollTrigger.create({
    trigger: track,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
    onUpdate: (self) => {
      const boost = Math.min(6, 1 + Math.abs(self.getVelocity()) / 300);
      loop.timeScale(boost * (self.direction < 0 ? -1 : 1));
      gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'power2.out', overwrite: true });
    },
  });
}

function crewReveal(gsap) {
  const cards = $$('.fc-crew__card');
  if (!cards.length) return;
  gsap.fromTo(cards,
    { clipPath: 'inset(100% 0% 0% 0% round 14px)' },
    { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.1, stagger: .12, ease: 'power3.inOut', scrollTrigger: { trigger: cards[0].parentElement, start: 'top 80%' } });
  gsap.fromTo($$('.fc-crew__card img'), { scale: 1.3 }, { scale: 1.04, duration: 1.6, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: cards[0].parentElement, start: 'top 80%' } });
}

function valuesRunway(gsap) {
  const rail = $('.fc-values-rail');
  const track = rail?.querySelector('.fc-values-track');
  const scenes = $$('.fc-value-scene', track || document);
  if (!rail || !track || scenes.length < 2) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    gsap.set(track, { display: 'flex', width: `${scenes.length * 100}vw` });
    gsap.set(scenes, { flex: '0 0 100vw', width: '100vw' });
    const progress = rail.querySelector('.fc-values-progress span');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: rail, start: 'top top', end: () => `+=${window.innerWidth * (scenes.length - 1)}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    tl.to(track, { x: () => -window.innerWidth * (scenes.length - 1), ease: 'none' }, 0).to(progress, { scaleX: 1, ease: 'none' }, 0);
    scenes.forEach((scene) => {
      gsap.fromTo(scene.querySelector('.fc-value-scene__img'), { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: scene, containerAnimation: tl.getChildren()[0], start: 'left right', end: 'right left', scrub: true } });
      gsap.fromTo(scene.querySelector('.fc-value-scene__word'), { xPercent: 30 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: scene, containerAnimation: tl.getChildren()[0], start: 'left right', end: 'right left', scrub: true } });
    });
    return () => gsap.set([track, ...scenes], { clearProps: 'all' });
  });
}

function xrayScan(gsap) {
  const xray = $('[data-xray]');
  if (!xray) return;
  const stage = $('.fc-xray__stage', xray);
  const status = $('[data-xray-status]', xray);
  const tags = $$('.fc-xray__tags li', xray);
  const state = { scan: 0 };
  const update = () => {
    stage.style.setProperty('--scan', state.scan.toFixed(4));
    tags.forEach((tag) => tag.classList.toggle('is-on', state.scan >= Number(tag.dataset.at)));
    const done = state.scan > .985;
    xray.classList.toggle('is-cleared', done);
    status.textContent = done ? 'Zawartość: premium ✓' : `Skanowanie… ${Math.round(state.scan * 100)}%`;
  };
  gsap.to(state, { scan: 1, ease: 'none', onUpdate: update, scrollTrigger: { trigger: xray, start: 'top 75%', end: 'bottom 45%', scrub: .6 } });
  update();
}

function timeline(gsap) {
  const tl = $('[data-timeline]');
  if (!tl) return;
  const stops = $$('li', tl);
  const state = { p: 0 };
  gsap.to(state, {
    p: 1, ease: 'none',
    scrollTrigger: { trigger: tl, start: 'top 85%', end: 'top 40%', scrub: .5 },
    onUpdate: () => {
      tl.style.setProperty('--p', state.p.toFixed(4));
      stops.forEach((stop, i) => stop.classList.toggle('is-passed', state.p >= i / (stops.length - 1) - .001));
    },
  });
}

function seasonMega(gsap) {
  const mega = $('[data-mega]');
  if (!mega) return;
  gsap.fromTo(mega, { letterSpacing: '.18em', scale: .82, opacity: .4 }, { letterSpacing: '-.05em', scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: mega, start: 'top 95%', end: 'top 35%', scrub: true } });
}

function windowReveal(gsap) {
  const section = $('[data-window]');
  if (!section) return;
  const frame = $('.fc-window__frame', section);
  const sticky = $('.fc-window__sticky', section);
  const start = getComputedStyle(frame);
  const wy = parseFloat(start.getPropertyValue('--wy')) || 20;
  const wx = parseFloat(start.getPropertyValue('--wx')) || 36;
  const wr = parseFloat(start.getPropertyValue('--wr')) || 220;
  const state = { p: 0 };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const update = () => {
    const t = clamp01(state.p / .7);
    const e = 1 - Math.pow(1 - t, 3);
    frame.style.setProperty('--wy', `${lerp(wy, 0, e)}%`);
    frame.style.setProperty('--wx', `${lerp(wx, 0, e)}%`);
    frame.style.setProperty('--wr', `${lerp(wr, 0, e)}px`);
    sticky.style.setProperty('--ws', lerp(1.3, 1, e).toFixed(3));
    sticky.style.setProperty('--wshade', lerp(.35, 1, clamp01((state.p - .45) / .4)).toFixed(3));
    sticky.style.setProperty('--wc', clamp01((state.p - .55) / .3).toFixed(3));
    sticky.style.setProperty('--wp', clamp01((state.p - .5) / .35).toFixed(3));
  };
  gsap.to(state, { p: 1, ease: 'none', onUpdate: update, scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .4 } });
  update();
}

/* Without GSAP or with reduced motion everything is shown in its final state. */
function staticFallbacks() {
  $$('.fc-xray').forEach((x) => {
    $('.fc-xray__stage', x)?.style.setProperty('--scan', '1');
    $$('.fc-xray__tags li', x).forEach((li) => li.classList.add('is-on'));
    x.classList.add('is-cleared');
    const status = $('[data-xray-status]', x);
    if (status) status.textContent = 'Zawartość: premium ✓';
  });
  $$('[data-route]').forEach((r) => { layoutRoute(r); $$('.fc-route__stops li', r).forEach((li) => li.classList.add('is-reached')); setRouteProgress(r, 1); });
  $$('[data-log] li').forEach((li) => li.classList.add('is-on'));
  $$('[data-timeline]').forEach((tl) => {
    tl.style.setProperty('--p', '1');
    $$('li', tl).forEach((li) => li.classList.add('is-passed'));
  });
  $$('[data-window] .fc-window__sticky').forEach((s) => { s.style.setProperty('--wc', '1'); s.style.setProperty('--wp', '1'); s.style.setProperty('--wshade', '1'); });
  $$('[data-window] .fc-window__frame').forEach((f) => { f.style.setProperty('--wy', '0%'); f.style.setProperty('--wx', '0%'); f.style.setProperty('--wr', '0px'); });
}

/* ---------- Odometer: digits roll like a flight-deck counter ---------- */
function odometers() {
  $$('.fc-odo[data-odo]').forEach((odo) => {
    const value = odo.dataset.odo;
    odo.setAttribute('aria-label', value);
    const digits = [...value];
    odo.innerHTML = digits.map((ch, i) => {
      if (!/\d/.test(ch)) return `<span aria-hidden="true">${ch}</span>`;
      const strip = [...Array(20).keys()].map((n) => `<span>${n % 10}</span>`).join('');
      return `<span class="fc-odo__d" aria-hidden="true"><span class="fc-odo__s" style="--to:${10 + Number(ch)};--dl:${(i * .12).toFixed(2)}s">${strip}</span></span>`;
    }).join('');
  });
  const all = $$('.fc-odo[data-odo]');
  if (reduceMotion) { all.forEach((o) => o.classList.add('is-rolled')); return; }
  onEnter(all, (o) => o.classList.add('is-rolled'), { threshold: .8 });
}

/* ---------- Spotlight border that follows the cursor across a group of cards ---------- */
function spotlight() {
  $$('[data-spotlight]').forEach((group) => {
    const cards = $$('.fc-stat-card', group);
    group.addEventListener('pointermove', (event) => {
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - r.left}px`);
        card.style.setProperty('--my', `${event.clientY - r.top}px`);
      });
    });
  });
}

/* ---------- Our Journey: layered collage depth, drifting ghost word, spinning badge ---------- */
function journeyDepth(gsap) {
  const section = $('.fc-journey');
  if (!section) return;
  const st = { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true };
  $$('[data-depth]', section).forEach((layer) => {
    const depth = Number(layer.dataset.depth);
    gsap.fromTo(layer, { yPercent: depth }, { yPercent: -depth, ease: 'none', scrollTrigger: st });
  });
  const ghost = $('[data-ghost]', section);
  if (ghost) gsap.fromTo(ghost, { xPercent: 0 }, { xPercent: -28, ease: 'none', scrollTrigger: st });
  const ring = $('.fc-journey__ring', section);
  if (ring) gsap.to(ring, { rotation: 300, ease: 'none', transformOrigin: '50% 50%', scrollTrigger: st });
  gsap.fromTo($$('.fc-journey__float', section), { clipPath: 'inset(0 0 100% 0 round 14px)' }, { clipPath: 'inset(0 0 0% 0 round 14px)', duration: 1.1, stagger: .18, ease: 'power3.inOut', scrollTrigger: { trigger: section, start: 'top 70%' } });
}

/* ---------- Travel-language route ---------- */
function layoutRoute(root) {
  const stage = $('.fc-route__stage', root);
  const stops = $$('.fc-route__stops li', root);
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  const vertical = w < 700;
  const pts = stops.map((_, i) => {
    if (vertical) return [i % 2 ? 22 : 8, 70 + i * ((h - 120) / (stops.length - 1))];
    const pad = Math.max(80, w * .07);
    return [pad + i * ((w - pad * 2) / (stops.length - 1)), h * .6 + (i % 2 ? 22 : -22)];
  });
  // Smooth curve through the stops (Catmull-Rom → cubic Bézier), with a short lead-in.
  const first = vertical ? [pts[0][0], 0] : [0, pts[0][1] + 30];
  const last = vertical ? [pts.at(-1)[0], h] : [w, pts.at(-1)[1] - 30];
  const all = [first, ...pts, last];
  let d = `M${all[0][0]} ${all[0][1]}`;
  for (let i = 0; i < all.length - 1; i += 1) {
    const p0 = all[i - 1] || all[i];
    const p1 = all[i];
    const p2 = all[i + 1];
    const p3 = all[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  const base = $('.fc-route__base', root);
  const trail = $('.fc-route__trail', root);
  base.setAttribute('d', d);
  trail.setAttribute('d', d);
  const len = base.getTotalLength();
  trail.style.strokeDasharray = `${len}`;
  // Where along the path each stop sits (sampled), so stops light exactly when the plane passes.
  const samples = 240;
  const at = pts.map(([x, y]) => {
    let best = 0;
    let dist = Infinity;
    for (let s = 0; s <= samples; s += 1) {
      const p = base.getPointAtLength((len * s) / samples);
      const dd = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (dd < dist) { dist = dd; best = s / samples; }
    }
    return best;
  });
  stops.forEach((li, i) => {
    li.style.setProperty('--x', `${pts[i][0]}px`);
    li.style.setProperty('--y', `${pts[i][1]}px`);
    li.dataset.at = at[i];
  });
  root._route = { base, trail, len, plane: $('.fc-route__plane', root), stops };
}

function setRouteProgress(root, p) {
  const r = root._route;
  if (!r) return;
  const L = r.len * p;
  const pt = r.base.getPointAtLength(L);
  const ahead = r.base.getPointAtLength(Math.min(r.len, L + 2));
  const behind = r.base.getPointAtLength(Math.max(0, L - 2));
  const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
  r.plane.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(1.15)`);
  r.trail.style.strokeDashoffset = `${r.len - L}`;
}

function scramble(el) {
  const target = el.dataset.text || el.textContent;
  el.dataset.text = target;
  const glyphs = 'ABCDEFGHIJKLMNOPRSTUWXYZ0123456789/<>';
  let frame = 0;
  const total = 16;
  const tick = () => {
    frame += 1;
    el.textContent = [...target].map((ch, i) => {
      if (ch === ' ' || frame / total > i / target.length) return ch;
      return glyphs[Math.floor(Math.random() * glyphs.length)];
    }).join('');
    if (frame < total) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  tick();
}

function route(gsap) {
  $$('[data-route]').forEach((root) => {
    layoutRoute(root);
    const state = { p: 0 };
    const update = () => {
      setRouteProgress(root, state.p);
      root._route.stops.forEach((li) => {
        const reached = state.p >= Number(li.dataset.at) - .005;
        if (reached && !li.classList.contains('is-reached')) {
          li.classList.add('is-reached');
          const label = $('[data-scramble]', li);
          if (label) scramble(label);
        } else if (!reached) li.classList.remove('is-reached');
      });
    };
    gsap.to(state, {
      p: 1, ease: 'none', onUpdate: update,
      scrollTrigger: { trigger: $('.fc-route__stage', root), start: 'top 85%', end: 'bottom 45%', scrub: .7, invalidateOnRefresh: true, onRefresh: () => { layoutRoute(root); update(); } },
    });
    update();
  });
}

/* ---------- Founder flight log: line draws, entries light up as it passes ---------- */
function flightLog(gsap) {
  $$('[data-log]').forEach((log) => {
    const items = $$('li', log);
    const state = { p: 0 };
    const update = () => {
      log.style.setProperty('--log', state.p.toFixed(3));
      const h = log.offsetHeight || 1;
      items.forEach((li) => li.classList.toggle('is-on', state.p * h >= li.offsetTop - 4));
    };
    gsap.to(state, { p: 1, ease: 'none', onUpdate: update, scrollTrigger: { trigger: log, start: 'top 75%', end: 'bottom 55%', scrub: .5 } });
    update();
  });
}
