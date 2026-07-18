/**
 * Living-site atmosphere — the persistent "the website is alive" layer.
 *
 * A single full-screen canvas (pointer-events: none) floating just under the
 * header. Composes several effects, all with randomised timing so no two
 * visits look the same:
 *   • ambient golden motes drifting upward, twinkling;
 *   • cursor magic — a faint trail of gold sparks; nearby motes ease away;
 *   • hover dust — interactive elements breathe golden dust when pointed at;
 *   • discoverable moments — shooting stars, butterflies of light and sparkle
 *     blooms fire on random intervals, rewarding visitors who linger.
 *
 * Tuned to READ on Ellen's light (cream) pages: warm amber, drawn source-over
 * (not additive, which would wash out on white), always subtle. Pauses when the
 * tab is hidden; disabled entirely under prefers-reduced-motion.
 */

import { rand, easeOut, clamp01 } from "./celestial";

export interface AtmosphereHandle {
  destroy(): void;
}

type Kind = "mote" | "dust" | "spark" | "shoot" | "fly" | "twinkle";

interface P {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // ms lived
  ttl: number; // ms total
  size: number;
  hue: number; // 0 gold … 1 silver
  seed: number;
  // shoot/fly extras
  ang?: number;
  spd?: number;
  amp?: number;
  freq?: number;
}

// Warm amber mote that reads on cream (defined colour, not additive-white).
function makeAmberMote(size = 48): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(214,170,90,0.95)");
  grad.addColorStop(0.4, "rgba(198,150,70,0.4)");
  grad.addColorStop(1, "rgba(198,150,70,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

// Small four-point gold sparkle with a warm core (reads on light + dark).
function makeSpark(size = 40): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const cx = size / 2;
  const halo = g.createRadialGradient(cx, cx, 0, cx, cx, cx);
  halo.addColorStop(0, "rgba(255,236,180,0.95)");
  halo.addColorStop(0.3, "rgba(212,168,83,0.5)");
  halo.addColorStop(1, "rgba(212,168,83,0)");
  g.fillStyle = halo;
  g.fillRect(0, 0, size, size);
  const spike = (len: number, wid: number, rot: number) => {
    g.save();
    g.translate(cx, cx);
    g.rotate(rot);
    const grad = g.createLinearGradient(-len, 0, len, 0);
    grad.addColorStop(0, "rgba(255,236,180,0)");
    grad.addColorStop(0.5, "rgba(255,244,214,0.95)");
    grad.addColorStop(1, "rgba(255,236,180,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(-len, 0);
    g.lineTo(0, -wid);
    g.lineTo(len, 0);
    g.lineTo(0, wid);
    g.closePath();
    g.fill();
    g.restore();
  };
  spike(cx * 0.92, cx * 0.06, 0);
  spike(cx * 0.92, cx * 0.06, Math.PI / 2);
  return c;
}

export function startAtmosphere(
  canvas: HTMLCanvasElement,
  opts: { reducedMotion: boolean },
): AtmosphereHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx || opts.reducedMotion) return { destroy() {} };

  let dpr = 1;
  let W = 0;
  let H = 0;
  let isMobile = false;

  const amber = makeAmberMote();
  const spark = makeSpark();

  const motes: P[] = [];
  const fx: P[] = []; // transient effects
  const pointer = { x: -1, y: -1, active: false, lastSpawn: 0 };
  const recentHover = new Set<Element>();

  function layout() {
    W = Math.max(1, window.innerWidth);
    H = Math.max(1, window.innerHeight);
    isMobile = W < 640;
    // A fullscreen fixed canvas cleared every frame — cap DPR so this stays
    // cheap on the compositor; particle softness doesn't need crisp pixels.
    dpr = Math.min(1.25, window.devicePixelRatio || 1);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seedMotes() {
    motes.length = 0;
    const n = isMobile ? 16 : 34;
    for (let i = 0; i < n; i++) {
      motes.push({
        kind: "mote",
        x: Math.random() * W,
        y: Math.random() * H,
        vx: rand(-4, 4),
        vy: rand(-14, -5),
        life: 0,
        ttl: Infinity,
        size: rand(6, 16),
        hue: Math.random() < 0.2 ? 1 : 0,
        seed: rand(0, 1000),
      });
    }
  }

  layout();
  seedMotes();

  // ── Spawners ────────────────────────────────────────────────────────────
  function spawnDust(x: number, y: number, n = 6) {
    for (let i = 0; i < n; i++) {
      fx.push({
        kind: "dust",
        x: x + rand(-6, 6),
        y: y + rand(-6, 6),
        vx: rand(-18, 18),
        vy: rand(-34, -8),
        life: 0,
        ttl: rand(600, 1100),
        size: rand(4, 9),
        hue: 0,
        seed: rand(0, 1000),
      });
    }
  }

  function spawnSpark(x: number, y: number) {
    fx.push({
      kind: "spark",
      x,
      y,
      vx: rand(-10, 10),
      vy: rand(-16, 4),
      life: 0,
      ttl: rand(500, 900),
      size: rand(8, 16),
      hue: Math.random() < 0.3 ? 1 : 0,
      seed: rand(0, 1000),
    });
  }

  function spawnShootingStar() {
    const fromLeft = Math.random() < 0.5;
    const y0 = rand(0.05, 0.4) * H;
    const ang = (fromLeft ? 1 : -1) * rand(0.18, 0.42) + (fromLeft ? 0 : Math.PI);
    fx.push({
      kind: "shoot",
      x: fromLeft ? -40 : W + 40,
      y: y0,
      vx: 0,
      vy: 0,
      life: 0,
      ttl: rand(900, 1400),
      size: rand(2, 3),
      hue: 0,
      seed: rand(0, 1000),
      ang,
      spd: rand(0.9, 1.4) * W,
    });
  }

  function spawnButterfly() {
    const fromLeft = Math.random() < 0.5;
    fx.push({
      kind: "fly",
      x: fromLeft ? -30 : W + 30,
      y: rand(0.2, 0.75) * H,
      vx: (fromLeft ? 1 : -1) * rand(28, 46),
      vy: 0,
      life: 0,
      ttl: rand(5200, 7200),
      size: rand(9, 14),
      hue: 0,
      seed: rand(0, 1000),
      amp: rand(26, 54),
      freq: rand(1.6, 2.6),
    });
  }

  function spawnBloom() {
    // A twinkle bloom near a random "important" element (heading / CTA).
    const targets = Array.from(
      document.querySelectorAll("h1, h2, [data-birthday-spark], .group"),
    ).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.top > 40 && r.bottom < H - 20 && r.width > 40;
    });
    let bx = rand(0.2, 0.8) * W;
    let by = rand(0.2, 0.6) * H;
    if (targets.length) {
      const r = targets[(Math.random() * targets.length) | 0].getBoundingClientRect();
      bx = r.left + Math.random() * r.width;
      by = r.top + Math.random() * r.height;
    }
    const n = isMobile ? 4 : 7;
    for (let i = 0; i < n; i++) {
      fx.push({
        kind: "twinkle",
        x: bx + rand(-40, 40),
        y: by + rand(-24, 24),
        vx: rand(-6, 6),
        vy: rand(-10, 2),
        life: rand(0, 300),
        ttl: rand(900, 1600),
        size: rand(7, 14),
        hue: Math.random() < 0.3 ? 1 : 0,
        seed: rand(0, 1000),
      });
    }
  }

  // Randomised schedulers (never a fixed loop).
  let tShoot = rand(4000, 9000);
  let tFly = rand(12000, 22000);
  let tBloom = rand(9000, 16000);

  // ── Listeners ───────────────────────────────────────────────────────────
  const onResize = () => {
    layout();
    seedMotes();
  };
  const onMove = (e: PointerEvent) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
    const now = performance.now();
    if (now - pointer.lastSpawn > 55 && Math.random() < 0.7) {
      pointer.lastSpawn = now;
      spawnSpark(e.clientX + rand(-4, 4), e.clientY + rand(-4, 4));
    }
  };
  const onLeave = () => {
    pointer.active = false;
  };
  const onOver = (e: Event) => {
    const t = e.target as Element | null;
    const el = t?.closest?.("a, button, [role='button'], [data-birthday-spark]");
    if (!el || recentHover.has(el)) return;
    recentHover.add(el);
    setTimeout(() => recentHover.delete(el), 700);
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.top > H || r.bottom < 0) return;
    for (let i = 0; i < 7; i++) {
      spawnDust(r.left + Math.random() * r.width, r.top + Math.random() * r.height, 1);
    }
  };

  window.addEventListener("resize", onResize);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerleave", onLeave, { passive: true });
  document.addEventListener("pointerover", onOver, { passive: true });

  // ── Loop ────────────────────────────────────────────────────────────────
  let raf = 0;
  let last = performance.now();
  let running = true;

  function step(now: number) {
    // Cap to ~36fps: ambient motion is slow, so this halves CPU/battery on the
    // always-on layer with no perceptible difference.
    if (now - last < 27) {
      if (running) raf = requestAnimationFrame(step);
      return;
    }
    const dt = Math.min(60, now - last);
    last = now;
    ctx!.clearRect(0, 0, W, H);
    ctx!.globalCompositeOperation = "source-over";

    // schedulers
    tShoot -= dt;
    tFly -= dt;
    tBloom -= dt;
    if (tShoot <= 0) {
      spawnShootingStar();
      tShoot = rand(14000, 32000);
    }
    if (tFly <= 0) {
      spawnButterfly();
      tFly = rand(26000, 52000);
    }
    if (tBloom <= 0) {
      spawnBloom();
      tBloom = rand(16000, 34000);
    }

    // ambient motes
    for (const m of motes) {
      m.life += dt;
      m.x += (m.vx * dt) / 1000;
      m.y += (m.vy * dt) / 1000;
      // gentle sway
      m.x += Math.sin(m.life * 0.0006 + m.seed) * 0.25;
      // cursor repulsion
      if (pointer.active) {
        const dx = m.x - pointer.x;
        const dy = m.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 12000) {
          const f = (1 - d2 / 12000) * 0.6;
          m.x += (dx / Math.sqrt(d2 + 1)) * f;
          m.y += (dy / Math.sqrt(d2 + 1)) * f;
        }
      }
      if (m.y < -20) {
        m.y = H + 20;
        m.x = Math.random() * W;
      }
      if (m.x < -20) m.x = W + 20;
      if (m.x > W + 20) m.x = -20;
      const tw = 0.5 + 0.5 * Math.sin(m.life * 0.0016 + m.seed);
      const a = (m.hue ? 0.22 : 0.3) * tw;
      const sprite = m.hue ? spark : amber;
      const size = m.size * (m.hue ? 1.1 : 1);
      ctx!.globalAlpha = a;
      ctx!.drawImage(sprite, m.x - size / 2, m.y - size / 2, size, size);
    }

    // transient effects
    for (let i = fx.length - 1; i >= 0; i--) {
      const p = fx[i];
      p.life += dt;
      const k = clamp01(p.life / p.ttl);
      if (k >= 1) {
        fx.splice(i, 1);
        continue;
      }
      if (p.kind === "dust" || p.kind === "spark" || p.kind === "twinkle") {
        p.x += (p.vx * dt) / 1000;
        p.y += (p.vy * dt) / 1000;
        p.vy += (dt / 1000) * (p.kind === "dust" ? 26 : 10); // slight gravity/settle
        const fade = p.kind === "twinkle" ? Math.sin(k * Math.PI) : 1 - k;
        const sprite = p.kind === "dust" ? amber : spark;
        ctx!.globalAlpha = clamp01(fade * (p.kind === "spark" ? 0.85 : 0.7));
        const size = p.size * (p.kind === "spark" ? 1 : 0.9);
        ctx!.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      } else if (p.kind === "shoot") {
        const e = easeOut(k);
        const dist = e * p.spd!;
        const x = p.x + Math.cos(p.ang!) * dist;
        const y = p.y + Math.sin(p.ang!) * dist;
        const a = Math.sin(k * Math.PI);
        const len = Math.min(W, H) * 0.16;
        const grad = ctx!.createLinearGradient(
          x - Math.cos(p.ang!) * len,
          y - Math.sin(p.ang!) * len,
          x,
          y,
        );
        grad.addColorStop(0, "rgba(212,168,83,0)");
        grad.addColorStop(1, `rgba(255,236,180,${0.9 * a})`);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 2;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        ctx!.moveTo(x - Math.cos(p.ang!) * len, y - Math.sin(p.ang!) * len);
        ctx!.lineTo(x, y);
        ctx!.stroke();
        ctx!.globalAlpha = a;
        ctx!.drawImage(spark, x - 12, y - 12, 24, 24);
      } else if (p.kind === "fly") {
        p.x += (p.vx * dt) / 1000;
        const y = p.y + Math.sin(p.life * 0.001 * p.freq!) * p.amp!;
        const fade = Math.sin(k * Math.PI);
        const flap = 0.5 + 0.5 * Math.sin(p.life * 0.02 * p.freq!);
        drawButterflyLite(ctx!, p.x, y, p.size, flap, fade * 0.75, p.vx < 0 ? Math.PI : 0);
        if (p.x < -40 || p.x > W + 40) fx.splice(i, 1);
      }
    }

    ctx!.globalAlpha = 1;
    if (running) raf = requestAnimationFrame(step);
  }

  raf = requestAnimationFrame(step);

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerover", onOver);
    },
  };
}

/** A compact luminous butterfly for the ambient layer (reads on light bg). */
function drawButterflyLite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  flap: number,
  alpha: number,
  rot: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const open = 0.5 + 0.5 * flap;
  const wing = (sx: number) => {
    ctx.save();
    ctx.scale(sx * open, 1);
    const g = ctx.createRadialGradient(size * 0.5, 0, 0, size * 0.5, 0, size);
    g.addColorStop(0, `rgba(226,178,110,${0.9 * alpha})`);
    g.addColorStop(0.6, `rgba(198,150,70,${0.35 * alpha})`);
    g.addColorStop(1, "rgba(198,150,70,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.2, -size * 0.7, size * 1.1, -size * 0.6, size, 0);
    ctx.bezierCurveTo(size * 1.1, size * 0.6, size * 0.3, size * 0.55, 0, 0);
    ctx.fill();
    ctx.restore();
  };
  wing(1);
  wing(-1);
  ctx.restore();
}
