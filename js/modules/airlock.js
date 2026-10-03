(function initAirlockHero() {
      var video   = document.getElementById('airlock-video');
      var section = document.getElementById('airlock-hero');
      if (!video || !section) return;

      var titleEl   = document.getElementById('airlock-title');
      var hintEl    = document.getElementById('airlock-hint');
      var taglineEl = document.getElementById('airlock-tagline');
      var barEl     = document.getElementById('airlock-bar');
      var scrimEl   = document.getElementById('airlock-scrim');
      var skipBtn   = document.getElementById('airlock-skip');

      var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

      var SCRUB = 3200, HOLD = 1100, TOTAL = SCRUB + HOLD, SHARE = SCRUB / TOTAL;

      var duration = 0, rafId = 0;
      var target = 0, shown = 0;
      var moved = false, seeking = false, queued = null;
      var locked = false, lockedY = 0, released = false, lastY = 0;
      var touchY = 0;

      function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

      /* --- Seeking with queue (browsers only fire seeked once at a time) --- */
      function seekTo(t) {
        if (seeking) { queued = t; return; }
        seeking = true;
        video.currentTime = t;
      }
      video.addEventListener('seeked', function () {
        seeking = false;
        if (queued !== null) { var t = queued; queued = null; seeking = true; video.currentTime = t; }
      });

      /* --- Painting --- */
      function paint(p) {
        var vp = clamp(p / SHARE, 0, 1);
        if (duration > 0) seekTo(Math.min(vp * duration, duration - 0.04));

        var titleA   = 1 - clamp(vp / 0.35, 0, 1);
        var taglineA = clamp((vp - 0.82) / 0.18, 0, 1);

        video.style.transform = 'scale(' + (1 + vp * 0.06) + ')';
        if (scrimEl)   scrimEl.style.opacity   = Math.max(titleA, taglineA);
        if (hintEl)    hintEl.style.opacity     = moved ? '0' : '1';
        if (barEl)     barEl.style.transform    = 'scaleX(' + p + ')';

        if (titleEl) {
          titleEl.style.opacity   = titleA;
          titleEl.style.transform = 'translateY(' + ((1 - titleA) * -24) + 'px) scale(' + (0.96 + titleA * 0.04) + ')';
          titleEl.style.filter    = 'blur(' + ((1 - titleA) * 10) + 'px)';
        }
        if (taglineEl) {
          var t = taglineA;
          taglineEl.style.opacity   = t;
          taglineEl.style.transform = 'translateY(' + ((1 - t) * 20) + 'px) scale(' + (0.97 + t * 0.03) + ')';
          taglineEl.style.filter    = 'blur(' + ((1 - t) * 8) + 'px)';
        }
      }

      /* --- Body lock (same technique as modal libraries) --- */
      function engageLock() {
        if (locked) return;
        locked = true; released = false;
        lockedY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top      = '-' + lockedY + 'px';
        document.body.style.left     = '0';
        document.body.style.right    = '0';
        document.body.style.width    = '100%';
      }
      function releaseLock() {
        if (!locked) return;
        locked = false;
        var y = lockedY;
        document.body.style.position = '';
        document.body.style.top      = '';
        document.body.style.left     = '';
        document.body.style.right    = '';
        document.body.style.width    = '';
        window.scrollTo(0, y);
        released = true; lastY = y;
        window.dispatchEvent(new Event('fc:airlock-release'));
      }
      function releaseAll() {
        target = shown = 1; moved = true;
        paint(1); releaseLock();
      }
      if (skipBtn) skipBtn.addEventListener('click', releaseAll);

      /* --- Consume input (returns true = swallow the event) --- */
      function consume(deltaY) {
        if (!locked) return false;
        if (target >= 1 && shown > 0.98 && deltaY > 0) { releaseLock(); return false; }
        target = clamp(target + deltaY / TOTAL, 0, 1);
        if (target > 0.001) moved = true;
        return true;
      }

      /* --- Input handlers --- */
      var KEY_STEPS = { ArrowDown: 140, ArrowUp: -140, PageDown: 700, PageUp: -700, ' ': 700, End: 1e15, Home: -1e15 };

      function onWheel(e)      { if (consume(e.deltaY)) e.preventDefault(); }
      function onTouchStart(e) { touchY = (e.touches[0] || {}).clientY || 0; }
      function onTouchMove(e)  {
        var y = (e.touches[0] || {}).clientY || touchY;
        if (consume(touchY - y)) e.preventDefault();
        touchY = y;
      }
      function onKeyDown(e) {
        var step = KEY_STEPS[e.key];
        if (step === undefined) return;
        if (consume(step)) e.preventDefault();
      }
      function onScroll() {
        if (locked || !released) return;
        var y = window.scrollY;
        var climbing = y < lastY; lastY = y;
        if (climbing && y <= section.offsetTop) {
          target = shown = 1; paint(1); engageLock();
        }
      }

      /* --- Wire up --- */
      function onVideoLoaded() {
        duration = video.duration || 0;
        video.style.opacity = '1';
        if (reduceMotion) { target = shown = 1; moved = true; paint(1); }
      }
      video.addEventListener('loadeddata', onVideoLoaded);
      if (video.readyState >= 2) onVideoLoaded();

      if (!reduceMotion) {
        if (window.scrollY <= section.offsetTop + 1) engageLock();

        window.addEventListener('wheel',      onWheel,      { passive: false });
        window.addEventListener('touchstart', onTouchStart, { passive: true  });
        window.addEventListener('touchmove',  onTouchMove,  { passive: false });
        window.addEventListener('keydown',    onKeyDown);
        window.addEventListener('scroll',     onScroll,     { passive: true  });

        var frame = function () {
          shown += (target - shown) * 0.18;
          paint(shown);
          rafId = requestAnimationFrame(frame);
        };
        rafId = requestAnimationFrame(frame);
      }
    })();
