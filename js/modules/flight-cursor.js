(function initFlightCursor() {
        const el = document.getElementById('flight-cursor');
        let x = 0, y = 0, prevX = 0, prevY = 0;
        let visible = false;
        let rafId;

        function update() {
          el.style.left = x + 'px';
          el.style.top  = y + 'px';

          // Rotate plane to face direction of movement
          const dx = x - prevX;
          const dy = y - prevY;
          if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            el.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
          }
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

        document.addEventListener('mouseleave', () => {
          el.style.opacity = '0';
          visible = false;
          cancelAnimationFrame(rafId);
        });
      })();