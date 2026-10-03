(function initFlightCursor() {
        const el = document.getElementById('flight-cursor');
        const HOT = 'a, button, input, select, textarea, label, [role="tab"], [data-tilt]';
        let x = 0, y = 0, prevX = 0, prevY = 0;
        let angle = -45, scale = 1;
        let visible = false;
        let rafId;

        function update() {
          el.style.left = x + 'px';
          el.style.top  = y + 'px';

          // Rotate plane to face direction of movement
          const dx = x - prevX;
          const dy = y - prevY;
          if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) angle = Math.atan2(dy, dx) * (180 / Math.PI);
          el.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${scale})`;
          prevX = x;
          prevY = y;
          rafId = requestAnimationFrame(update);
        }

        document.addEventListener('mousemove', (e) => {
          x = e.clientX;
          y = e.clientY;
          if (!visible) {
            el.style.opacity = '1';
            visible = true;
            rafId = requestAnimationFrame(update);
          }
        });

        // The plane grows over anything clickable, since there is no system pointer to change.
        document.addEventListener('mouseover', (e) => {
          scale = e.target instanceof Element && e.target.closest(HOT) ? 1.35 : 1;
        });

        document.addEventListener('mouseleave', () => {
          el.style.opacity = '0';
          visible = false;
          cancelAnimationFrame(rafId);
        });
      })();
