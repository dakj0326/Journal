const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

/* =======================
   Canvas setup
   ======================= */

let w, h;

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

/* =======================
   Mouse tracking
   ======================= */

const mouse = { x: null, y: null };

window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
});

/* =======================
   Particle system config
   ======================= */

const particles = [];

const MAX_PARTICLES = 100;

/* Spawn */
const SPAWN_CHANCE = 0.3;
const SPAWN_RADIUS = 200;

/* Motion */
const ATTRACTION_RADIUS = 290;
const ATTRACTION_STRENGTH = 0.35;
const FRICTION = 0.985;

/* Lifespan & decay */
const DESPAWN_START_RADIUS = 180;
const DESPAWN_END_RADIUS   = 420;

const BASE_DECAY_RATE = 0.008;   // always decays
const DISTANCE_DECAY_RATE = 0.02;    // added decay far away
const RANDOM_DECAY_CHANCE = 0.04;
const RANDOM_DECAY_AMOUNT = 0.08;

/* Connections */
const CONNECTION_RADIUS = 120;
const MAX_CONNECTIONS = 6;

/* Visibility */
const MOUSE_FADE_RADIUS = 500;

/* =======================
   Helpers
   ======================= */

function mouseAlphaFactor(x, y) {
    if (mouse.x === null) return 0.2;

    const dx = x - mouse.x;
    const dy = y - mouse.y;
    const dist = Math.hypot(dx, dy);

    return Math.max(0, 1 - dist / MOUSE_FADE_RADIUS);
}

/* =======================
   Particle spawning
   ======================= */

function spawnParticle() {
    if (mouse.x === null || particles.length >= MAX_PARTICLES) return;

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * SPAWN_RADIUS;

    particles.push({
        x: mouse.x + Math.cos(angle) * radius,
        y: mouse.y + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        life: 1   // full life at spawn, then only decay
    });
}

/* =======================
   Animation loop
   ======================= */

function animate() {
    ctx.clearRect(0, 0, w, h);

    /* Spawn */
    if (Math.random() < SPAWN_CHANCE) {
        spawnParticle();
    }

    /* Update & draw particles */
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        /* Motion */
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        let dist = Infinity;

        if (mouse.x !== null) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            dist = Math.hypot(dx, dy);

            /* Attraction */
            if (dist < ATTRACTION_RADIUS && dist > 0.1) {
                const strength =
                    (1 - dist / ATTRACTION_RADIUS) * ATTRACTION_STRENGTH;
                p.vx += (dx / dist) * strength;
                p.vy += (dy / dist) * strength;
            }
        }

        /* ===== Decay (NO regeneration) ===== */

        // Always decay a little
        p.life -= BASE_DECAY_RATE;

        // Extra decay when far away
        if (dist > DESPAWN_START_RADIUS) {
            const t = Math.min(
                (dist - DESPAWN_START_RADIUS) /
                (DESPAWN_END_RADIUS - DESPAWN_START_RADIUS),
                1
            );

            p.life -= DISTANCE_DECAY_RATE * t;

            if (Math.random() < RANDOM_DECAY_CHANCE * t) {
                p.life -= RANDOM_DECAY_AMOUNT;
            }
        }

        /* Remove dead */
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        /* Draw particle */
        const mouseFade = mouseAlphaFactor(p.x, p.y);
        ctx.globalAlpha = p.life * mouseFade;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
    }

    ctx.globalAlpha = 1;

    /* Connections */
    for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const neighbors = [];

        for (let j = 0; j < particles.length; j++) {
            if (i === j) continue;

            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);

            if (dist < CONNECTION_RADIUS) {
                neighbors.push({ b, dist });
            }
        }

        neighbors.sort((n1, n2) => n1.dist - n2.dist);

        for (let k = 0; k < Math.min(MAX_CONNECTIONS, neighbors.length); k++) {
            const { b, dist } = neighbors[k];

            const mouseFade = Math.min(
                mouseAlphaFactor(a.x, a.y),
                mouseAlphaFactor(b.x, b.y)
            );

            const alpha =
                (1 - dist / CONNECTION_RADIUS) * 0.6 * mouseFade;

            if (alpha <= 0) continue;

            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }
    }

    requestAnimationFrame(animate);
}

animate();
