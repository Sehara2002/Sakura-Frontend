/* Combined Sakura Petals + Snow (single canvas)
   - Uses requestAnimationFrame
   - Respects prefers-reduced-motion
   - Auto-resize, no hydration issues in Next (runs only in browser)
*/

(() => {
    const canvas = document.getElementById("sakuraCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0, h = 0, dpr = Math.max(1, window.devicePixelRatio || 1);

    // If user prefers reduced motion, keep it very light
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    // Performance knobs (tune these if needed)
    const PETAL_COUNT = reduceMotion ? 35 : 90;

    const SNOW_COUNT = reduceMotion ? 45 : 110;

    const petals = [];
    const snow = [];

    function resize() {
        w = Math.floor(window.innerWidth);
        h = Math.floor(window.innerHeight);
        dpr = Math.max(1, window.devicePixelRatio || 1);

        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Sakura petal particle
    function makePetal(initial = false) {
        return {
            x: rand(0, w),
            y: initial ? rand(0, h) : rand(-h * 0.2, -20),
            r: rand(2.5, 6.5),                 // size
            vy: rand(0.6, 1.6),                // fall speed
            vx: rand(-0.7, 0.7),               // drift
            wobble: rand(0, Math.PI * 2),
            wobbleSpeed: rand(0.006, 0.02),
            tilt: rand(-0.6, 0.6),
            rot: rand(0, Math.PI * 2),
            rotSpeed: rand(-0.02, 0.02),
            alpha: rand(0.35, 0.85)
        };
    }

    // Snow particle
    function makeSnow(initial = false) {
        return {
            x: rand(0, w),
            y: initial ? rand(0, h) : rand(-h * 0.2, -20),
            r: rand(1.0, 3.2),                 // small flakes
            vy: rand(1.2, 3.0),                // faster than petals
            vx: rand(-0.4, 0.4),
            drift: rand(0.5, 1.8),
            phase: rand(0, Math.PI * 2),
            alpha: rand(0.25, 0.85)
        };
    }

    function init() {
        resize();

        petals.length = 0;
        snow.length = 0;

        for (let i = 0; i < PETAL_COUNT; i++) petals.push(makePetal(true));
        for (let i = 0; i < SNOW_COUNT; i++) snow.push(makeSnow(true));
    }

    function drawPetal(p) {
        // petal gradient
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.2);
        g.addColorStop(0, `rgba(255, 170, 200, ${0.55 * p.alpha})`);
        g.addColorStop(0.6, `rgba(255, 120, 170, ${0.35 * p.alpha})`);
        g.addColorStop(1, `rgba(255, 120, 170, 0)`);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        // petal shape (simple ellipse-ish)
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 1.1, p.r * 0.7, p.tilt, 0, Math.PI * 2);
        ctx.closePath();

        ctx.fillStyle = g;
        ctx.fill();

        ctx.restore();
    }

    function drawSnow(s) {
        // soft white glow
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3.0);
        g.addColorStop(0, `rgba(255,255,255, ${0.9 * s.alpha})`);
        g.addColorStop(0.45, `rgba(255,255,255, ${0.35 * s.alpha})`);
        g.addColorStop(1, `rgba(255,255,255, 0)`);

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }

    let last = performance.now();

    function step(now) {
        const dt = Math.min(32, now - last); // cap dt to avoid huge jumps
        last = now;

        ctx.clearRect(0, 0, w, h);

        // Draw order:
        // 1) snow (background feel)
        // 2) petals (foreground feel)
        for (let i = 0; i < snow.length; i++) {
            const s = snow[i];
            s.phase += 0.01;
            s.x += s.vx + Math.sin(s.phase) * 0.25 * s.drift;
            s.y += s.vy * (dt / 16);

            if (s.y > h + 20) Object.assign(s, makeSnow(false), { y: rand(-80, -20) });
            if (s.x < -40) s.x = w + 40;
            if (s.x > w + 40) s.x = -40;

            drawSnow(s);
        }

        for (let i = 0; i < petals.length; i++) {
            const p = petals[i];
            p.wobble += p.wobbleSpeed * (dt / 16);
            p.rot += p.rotSpeed * (dt / 16);

            p.x += p.vx + Math.sin(p.wobble) * 0.6;
            p.y += p.vy * (dt / 16);

            if (p.y > h + 30) Object.assign(p, makePetal(false), { y: rand(-120, -20) });
            if (p.x < -60) p.x = w + 60;
            if (p.x > w + 60) p.x = -60;

            drawPetal(p);
        }

        requestAnimationFrame(step);
    }

    // Start
    init();
    requestAnimationFrame(step);

    // Resize handler
    let resizeTimer = null;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, 120);
    });
})();
