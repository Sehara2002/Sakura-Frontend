(() => {
    const canvas = document.getElementById("sakuraCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    function resize() {
        canvas.width = Math.floor(window.innerWidth * DPR);
        canvas.height = Math.floor(window.innerHeight * DPR);
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    const petals = [];
    const PETAL_COUNT = Math.floor(Math.min(180, Math.max(90, window.innerWidth / 8)));

    function rand(min, max) { return Math.random() * (max - min) + min; }

    for (let i = 0; i < PETAL_COUNT; i++) {
        petals.push({
            x: rand(0, window.innerWidth),
            y: rand(0, window.innerHeight),
            r: rand(4, 10),          // ✅ bigger petals
            vy: rand(0.4, 1),      // ✅ faster falling
            vx: rand(-1.0, 1.0),     // ✅ more sideways drift
            wobble: rand(0, Math.PI * 2),
            wobbleSpeed: rand(0.008, 0.02),
            rot: rand(0, Math.PI * 2),
            rotSpeed: rand(-0.02, 0.02),
            alpha: rand(0.55, 1.0),
        });
    }

    function drawPetal(p) {
        const x = p.x * DPR, y = p.y * DPR;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rot);

        // soft rose/white petal
        const g = ctx.createRadialGradient(0, 0, 1, 0, 0, p.r * DPR * 2);
        g.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
        g.addColorStop(0.5, `rgba(255, 198, 213, ${p.alpha})`);
        g.addColorStop(1, `rgba(255, 92, 138, ${p.alpha * 0.55})`);


        ctx.fillStyle = g;
        ctx.beginPath();
        // simple petal shape
        ctx.moveTo(0, -p.r * DPR);
        ctx.bezierCurveTo(p.r * DPR, -p.r * DPR, p.r * DPR, p.r * DPR, 0, p.r * DPR * 1.25);
        ctx.bezierCurveTo(-p.r * DPR, p.r * DPR, -p.r * DPR, -p.r * DPR, 0, -p.r * DPR);
        ctx.closePath();
        ctx.shadowBlur = 8 * DPR;
        ctx.shadowColor = `rgba(255, 92, 138, ${p.alpha * 0.25})`;

        ctx.fill();
        ctx.restore();
    }

    function tick() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of petals) {
            p.wobble += p.wobbleSpeed;
            p.x += p.vx + Math.sin(p.wobble) * 0.35;
            p.y += p.vy;
            p.rot += p.rotSpeed;

            if (p.y > window.innerHeight + 20) {
                p.y = -20;
                p.x = rand(0, window.innerWidth);
            }
            if (p.x < -30) p.x = window.innerWidth + 30;
            if (p.x > window.innerWidth + 30) p.x = -30;

            drawPetal(p);
        }

        requestAnimationFrame(tick);
    }

    tick();
})();
