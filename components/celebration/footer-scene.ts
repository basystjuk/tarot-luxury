/**
 * Footer scene — the closing shot of the birthday film.
 *
 * A dark-surface canvas living behind the footer content: a starfield, an arc
 * of moon phases, the Cancer constellation that occasionally pulses, golden
 * vine/root tendrils swaying up from the base, drifting crystal motes and the
 * odd butterfly of light. Everything slow, randomised and luminous.
 *
 * Composed from the shared celestial toolkit so it matches the intro. Pauses
 * when off-screen (driven by the React wrapper). Canvas 2D, no deps.
 */

import {
  clamp01,
  lerp,
  rand,
  makeStar,
  makeMote,
  drawButterfly,
  CANCER_STARS,
  CANCER_EDGES,
  type Pt,
} from "./celestial";

export interface FooterSceneHandle {
  destroy(): void;
  setPaused(p: boolean): void;
}

interface Vine {
  x: number;
  sway: number;
  phase: number;
  len: number;
  bend: number;
}
interface Crystal {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: number;
  silver: boolean;
  tw: number;
}
interface Fly {
  bornAt: number;
  ttl: number;
  x: number;
  vx: number;
  y: number;
  amp: number;
  freq: number;
  size: number;
}

const FOOTER_SHADOW = "#1c1512";

export function startFooterScene(
  canvas: HTMLCanvasElement,
  opts: { reducedMotion: boolean },
): FooterSceneHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { destroy() {}, setPaused() {} };

  const starWarm = makeStar(96, true);
  const starCool = makeStar(96, false);
  const moteGold = makeMote("255,236,190");
  const moteSilver = makeMote("214,226,248");

  let W = 0;
  let H = 0;
  let dpr = 1;

  let stars: { x: number; y: number; size: number; warm: boolean; tw: number; base: number }[] = [];
  let vines: Vine[] = [];
  let crystals: Crystal[] = [];
  let flies: Fly[] = [];
  let moons: { sprite: HTMLCanvasElement; x: number; y: number }[] = [];
  const reduced = opts.reducedMotion;

  function layout() {
    W = Math.max(1, canvas.clientWidth);
    H = Math.max(1, canvas.clientHeight);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    const starN = W < 640 ? 40 : 70;
    stars = new Array(starN).fill(0).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.85,
      size: lerp(1, 3.4, Math.random()),
      warm: Math.random() < 0.4,
      tw: rand(0, Math.PI * 2),
      base: lerp(0.2, 0.7, Math.random()),
    }));

    const vineN = W < 640 ? 5 : 9;
    vines = new Array(vineN).fill(0).map((_, i) => ({
      x: (W / (vineN + 1)) * (i + 1) + rand(-20, 20),
      sway: rand(6, 16),
      phase: rand(0, Math.PI * 2),
      len: rand(0.28, 0.6) * H,
      bend: rand(-0.4, 0.4),
    }));

    const crystalN = W < 640 ? 10 : 20;
    crystals = new Array(crystalN).fill(0).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vy: rand(-9, -3),
      vx: rand(-4, 4),
      size: rand(4, 10),
      silver: Math.random() < 0.5,
      tw: rand(0, Math.PI * 2),
    }));

    // Pre-render the moon-phase arc once (no per-frame gradient/clip cost).
    const phases = W < 640 ? 5 : 7;
    const mr = Math.min(W, H) * (W < 640 ? 0.05 : 0.045);
    moons = new Array(phases).fill(0).map((_, i) => {
      const f = i / (phases - 1);
      const x = lerp(W * 0.08, W * 0.92, f);
      const arc = Math.sin(f * Math.PI) * H * 0.06;
      const y = H * 0.16 - arc;
      return { sprite: makeMoonSprite(mr, f), x, y };
    });

    flies = [];
  }

  layout();

  const ro = new ResizeObserver(() => layout());
  ro.observe(canvas);

  // ── Moon-phase sprite (offset-shadow lune), pre-rendered once ──────────────
  function makeMoonSprite(r: number, phase: number): HTMLCanvasElement {
    const pad = r * 2.6;
    const size = Math.ceil(pad * 2);
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    const cx = size / 2;
    const cy = size / 2;
    // halo
    const halo = g.createRadialGradient(cx, cy, 0, cx, cy, r * 2.4);
    halo.addColorStop(0, "rgba(230,236,255,0.18)");
    halo.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = halo;
    g.fillRect(0, 0, size, size);
    // lit disc
    const disc = g.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
    disc.addColorStop(0, "rgba(255,252,244,1)");
    disc.addColorStop(1, "rgba(206,206,224,0.85)");
    g.fillStyle = disc;
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.fill();
    // shadow lune
    const illum = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
    const dir = phase < 0.5 ? 1 : -1;
    const d = illum * 2 * r;
    g.save();
    g.beginPath();
    g.arc(cx, cy, r + 0.5, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = FOOTER_SHADOW;
    g.beginPath();
    g.arc(cx - dir * d, cy, r, 0, Math.PI * 2);
    g.fill();
    g.restore();
    return c;
  }

  function drawVine(v: Vine, t: number, alpha: number) {
    const baseY = H + 6;
    const topY = H - v.len;
    ctx!.save();
    ctx!.globalCompositeOperation = "lighter";
    ctx!.lineCap = "round";
    const steps = 10;
    ctx!.beginPath();
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const yy = lerp(baseY, topY, f);
      const swayAmt = Math.sin(t * 0.0006 * v.sway + v.phase + f * 3) * v.sway * f;
      const xx = v.x + swayAmt + v.bend * v.len * f * f;
      if (i === 0) ctx!.moveTo(xx, yy);
      else ctx!.lineTo(xx, yy);
    }
    ctx!.strokeStyle = `rgba(212,168,83,${0.5 * alpha})`;
    ctx!.lineWidth = 1.6;
    ctx!.stroke();
    // glowing tip (cached sprite, no per-frame gradient)
    const tipSway = Math.sin(t * 0.0006 * v.sway + v.phase + 3) * v.sway;
    const tipX = v.x + tipSway + v.bend * v.len;
    ctx!.globalAlpha = alpha;
    ctx!.drawImage(moteGold, tipX - 10, topY - 10, 20, 20);
    ctx!.globalAlpha = 1;
    ctx!.restore();
  }

  // Constellation lives on the right, moon-phase arc across the top.
  function drawConstellation(t: number, pulse: number) {
    const cxp = W * 0.72;
    const cyp = H * 0.5;
    const scale = Math.min(W, H) * 0.32;
    const px = (p: Pt) => cxp + p.x * scale;
    const py = (p: Pt) => cyp + p.y * scale;
    ctx!.save();
    ctx!.globalCompositeOperation = "lighter";
    ctx!.strokeStyle = `rgba(226,201,138,${0.28 + pulse * 0.4})`;
    ctx!.lineWidth = 1;
    for (const [i, j] of CANCER_EDGES) {
      ctx!.beginPath();
      ctx!.moveTo(px(CANCER_STARS[i]), py(CANCER_STARS[i]));
      ctx!.lineTo(px(CANCER_STARS[j]), py(CANCER_STARS[j]));
      ctx!.stroke();
    }
    for (const s of CANCER_STARS) {
      const tw = 0.7 + 0.3 * Math.sin(t * 0.003 + s.x * 8);
      const size = Math.min(W, H) * (0.05 + pulse * 0.03) * tw;
      ctx!.globalAlpha = tw;
      ctx!.drawImage(starWarm, px(s) - size / 2, py(s) - size / 2, size, size);
    }
    ctx!.globalAlpha = 1;
    ctx!.restore();
  }

  let raf = 0;
  let paused = false;
  let last = performance.now();
  let tAcc = 0;
  let pulse = 0;
  let nextPulse = rand(4000, 9000);
  let nextFly = rand(6000, 14000);

  function frame(now: number) {
    if (paused) {
      last = now;
      raf = requestAnimationFrame(frame);
      return;
    }
    // Cap to ~36fps — the scene is slow and gains nothing from 60.
    if (now - last < 27) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const dt = Math.min(60, now - last);
    last = now;
    tAcc += reduced ? 0 : dt;
    const t = tAcc;
    ctx!.clearRect(0, 0, W, H);

    // constellation pulse scheduler
    nextPulse -= dt;
    if (nextPulse <= 0 && !reduced) {
      pulse = 1;
      nextPulse = rand(6000, 12000);
    }
    pulse = Math.max(0, pulse - dt / 1400);

    // stars
    ctx!.globalCompositeOperation = "lighter";
    for (const s of stars) {
      const tw = 0.5 + 0.5 * Math.sin(t * 0.002 + s.tw);
      const size = s.size * 3;
      ctx!.globalAlpha = s.base * tw;
      ctx!.drawImage(s.warm ? starWarm : starCool, s.x - size / 2, s.y - size / 2, size, size);
    }
    ctx!.globalAlpha = 1;
    ctx!.globalCompositeOperation = "source-over";

    // moon-phase arc across the top (pre-rendered sprites)
    ctx!.globalAlpha = 0.92;
    for (const m of moons) {
      ctx!.drawImage(m.sprite, m.x - m.sprite.width / 2, m.y - m.sprite.height / 2);
    }
    ctx!.globalAlpha = 1;

    // constellation
    drawConstellation(t, pulse);

    // vines / roots
    for (const v of vines) drawVine(v, t, 0.9);

    // crystals
    ctx!.globalCompositeOperation = "lighter";
    for (const c of crystals) {
      if (!reduced) {
        c.y += (c.vy * dt) / 1000;
        c.x += (c.vx * dt) / 1000;
        if (c.y < -12) {
          c.y = H + 12;
          c.x = Math.random() * W;
        }
      }
      const tw = 0.5 + 0.5 * Math.sin(t * 0.0022 + c.tw);
      ctx!.globalAlpha = 0.5 * tw;
      const size = c.size;
      ctx!.drawImage(c.silver ? moteSilver : moteGold, c.x - size / 2, c.y - size / 2, size, size);
    }
    ctx!.globalAlpha = 1;
    ctx!.globalCompositeOperation = "source-over";

    // butterflies
    nextFly -= dt;
    if (nextFly <= 0 && !reduced) {
      const fromLeft = Math.random() < 0.5;
      flies.push({
        bornAt: t,
        ttl: rand(5000, 8000),
        x: fromLeft ? -20 : W + 20,
        vx: (fromLeft ? 1 : -1) * rand(18, 30),
        y: rand(0.3, 0.7) * H,
        amp: rand(14, 30),
        freq: rand(1.6, 2.4),
        size: rand(7, 11),
      });
      nextFly = rand(9000, 20000);
    }
    for (let i = flies.length - 1; i >= 0; i--) {
      const f = flies[i];
      const k = clamp01((t - f.bornAt) / f.ttl);
      if (k >= 1) {
        flies.splice(i, 1);
        continue;
      }
      f.x += (f.vx * dt) / 1000;
      const y = f.y + Math.sin((t - f.bornAt) * 0.001 * f.freq) * f.amp;
      const flap = 0.5 + 0.5 * Math.sin((t - f.bornAt) * 0.02 * f.freq);
      drawButterfly(ctx!, f.x, y, f.size, flap, Math.sin(k * Math.PI) * 0.7, f.vx < 0 ? Math.PI : 0);
    }

    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
    },
    setPaused(p: boolean) {
      paused = p;
      last = performance.now();
    },
  };
}
