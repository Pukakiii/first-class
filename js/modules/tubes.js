(async function initPerSectionTubes() {
        const canvases = document.querySelectorAll(".section-tubes-canvas");
        if (!canvases.length) return;

        try {
          const module =
            await import("https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js");
          const TubesCursor = module.default;

          const palettes = [
            {
              tubes: ["#ff6200", "#ff8800", "#ffaa00"],
              lights: ["#ff6200", "#ff3300", "#ffd200", "#ffffff"],
            },
            {
              tubes: ["#ff3300", "#ff0055", "#ff8800"],
              lights: ["#ff0055", "#ff7700", "#ffffff", "#ff8800"],
            },
            {
              tubes: ["#ff7700", "#e5a14c", "#ffffff"],
              lights: ["#ffaa00", "#ff5500", "#ffffff", "#e5a14c"],
            },
            {
              tubes: ["#ff4800", "#d6249f", "#285aeb"],
              lights: ["#ff008a", "#fe8a2e", "#60aed5", "#ffffff"],
            },
          ];

          let paletteIndex = 0;
          const apps = [];

          // Инициализируем канвас внутри каждой секции
          canvases.forEach((canvas, idx) => {
            try {
              const p = palettes[idx % palettes.length];
              const app = TubesCursor(canvas, {
                tubes: {
                  colors: p.tubes,
                  lights: {
                    intensity: 320,
                    colors: p.lights,
                  },
                },
              });
              apps.push({ canvas, app });
            } catch (e) {
              console.warn("Could not init TubesCursor on canvas:", e);
            }
          });

          // Клик в свободной области любой секции циклически переключает палитру
          document.addEventListener("click", (e) => {
            if (
              e.target.closest(
                "a, button, input, select, textarea, label, header, footer",
              )
            )
              return;

            paletteIndex = (paletteIndex + 1) % palettes.length;
            const next = palettes[paletteIndex];

            apps.forEach(({ app }) => {
              if (app && app.tubes) {
                app.tubes.setColors(next.tubes);
                app.tubes.setLightsColors(next.lights);
              }
            });
          });
        } catch (err) {
          console.error("Failed to load ThreeJS TubesCursor module:", err);
        }
      })();