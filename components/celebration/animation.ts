/**
 * Birthday intro — a cinematic celestial sequence (theme "birthday_cancer").
 *
 * Not a banner: a short "expensive fantasy movie" opening. Deep cosmic sky,
 * a luminous moon, a parallax starfield, drifting nebula and golden dust that
 * gathers into a sphere of light; a Tree of Life grows from it; the dust then
 * assembles into a LARGE, bright, long-held Cancer glyph ♋ (with a crisp gold
 * line-art stroke over the particles + the Cancer constellation as context) so
 * it is impossible to miss; butterflies of light drift; a final golden pulse
 * expands and the scene fades, returning the site.
 *
 * Composed entirely from the shared celestial toolkit so it matches the living
 * atmosphere and footer scene. Canvas 2D + rAF, no deps. ~12s.
 */

import type { CelebrationTheme } from "@/lib/celebration";
import {
  clamp01,
  lerp,
  smooth,
  easeInOut,
  easeOut,
  seg,
  rand,
  makeStar,
  makeMote,
  paintSky,
  makeNebula,
  drawNebula,
  drawMoon,
  traceCancer,
  sampleCancer,
  drawTree,
  buildTree,
  drawButterfly,
  CANCER_STARS,
  CANCER_EDGES,
  type NebulaBlob,
  type Pt,
  type Branch,
} from "./celestial";

export interface RunOptions {
  reducedMotion: boolean;
  onDone: () => void;
  freezeMs?: number | null;
}

export interface RunHandle {
  skip: () => void;
  destroy: () => void;
}

// ── Timeline (ms) ───────────────────────────────────────────────────────────
const T = {
  fadeIn: 900,
  starsIn: [400, 2800] as const,
  moonIn: [800, 3200] as const,
  dustIn: [1600, 4400] as const, // dust gathers into sphere
  spherePeak: 4400,
  treeGrow: [3000, 6200] as const,
  shootingStar: 3400,
  glyphForm: [5200, 6900] as const, // particles → glyph
  strokeIn: [6200, 7200] as const, // crisp line-art over particles
  constellationIn: [6000, 7400] as const,
  holdUntil: 9700, // glyph held bright (spotlight)
  disperse: [9700, 11300] as const,
  pulse: [10500, 12000] as const,
  fadeOut: [10900, 12200] as const,
  end: 12200,
};
const REDUCED_END = 3200;

interface Star {
  x: number;
  y: number;
  layer: number; // 0 far … 2 near
  size: number;
  warm: boolean;
  tw: number;
  base: number;
}

interface Particle {
  sx: number;
  sy: number;
  camAng: number;
  camR: number;
  swirl: number;
  gx: number;
  gy: number;
  dispAng: number;
  dispDist: number;
  r: number;
  silver: boolean;
  tw: number;
  seed: number;
}

interface Fly {
  bornAt: number;
  life: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  size: number;
  freq: number;
}

export function runCelebration(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  _theme: CelebrationTheme,
  opts: RunOptions,
): RunHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    opts.onDone();
    return { skip: () => {}, destroy: () => {} };
  }

  let dpr = 1;
  let W = 0;
  let H = 0;
  let cx = 0;
  let cy = 0;
  let R = 0;
  let isMobile = false;
  let moonX = 0;
  let moonY = 0;
  let moonR = 0;

  const starWarm = makeStar(96, true);
  const starCool = makeStar(96, false);
  const moteGold = makeMote("255,236,190");
  const moteSilver = makeMote("224,232,255");

  let stars: Star[] = [];
  let particles: Particle[] = [];
  let nebula: NebulaBlob[] = [];
  let tree: Branch[] = [];
  let flies: Fly[] = [];
  let glyphPts: Pt[] = [];

  function layout() {
    W = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 360);
    H = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 640);
    isMobile = W < 640;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2;
    cy = H * 0.48;
    R = Math.max(70, Math.min(W, H) * (isMobile ? 0.3 : 0.24));
    moonR = Math.min(W, H) * (isMobile ? 0.07 : 0.06);
    moonX = W * 0.8;
    moonY = H * 0.26;
  }

  function build() {
    // Starfield — three parallax layers.
    const starCount = isMobile ? 90 : 150;
    stars = new Array(starCount).fill(0).map(() => {
      const layer = (Math.random() * 3) | 0;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        layer,
        size: lerp(1.2, 4.2, Math.random()) * (0.6 + layer * 0.3),
        warm: Math.random() < 0.35,
        tw: Math.random() * Math.PI * 2,
        base: lerp(0.25, 0.9, Math.random()),
      };
    });

    nebula = makeNebula(W, H, isMobile ? 4 : 6);
    tree = buildTree(1, isMobile ? 7 : 8);

    glyphPts = sampleCancer(R);
    const N = isMobile ? 190 : 300;
    const maxDim = Math.hypot(W, H);
    particles = new Array(N).fill(0).map((_, i) => {
      const g = glyphPts.length ? glyphPts[i % glyphPts.length] : { x: 0, y: 0 };
      const jit = R * 0.02;
      const gx = g.x + (Math.random() - 0.5) * jit;
      const gy = g.y + (Math.random() - 0.5) * jit;
      const edgeAng = Math.random() * Math.PI * 2;
      const edgeR = lerp(maxDim * 0.28, maxDim * 0.6, Math.random());
      return {
        sx: cx + Math.cos(edgeAng) * edgeR,
        sy: cy + Math.sin(edgeAng) * edgeR,
        camAng: Math.random() * Math.PI * 2,
        camR: lerp(R * 0.06, R * 0.32, Math.random()),
        swirl: lerp(0.7, 2.6, Math.random()) * (Math.random() < 0.5 ? 1 : -1),
        gx,
        gy,
        dispAng: Math.atan2(gy, gx) + (Math.random() - 0.5) * 0.8,
        dispDist: lerp(0.5, 1.4, Math.random()),
        r: lerp(1.1, isMobile ? 2.6 : 3.2, Math.random()),
        silver: Math.random() < 0.18,
        tw: Math.random() * Math.PI * 2,
        seed: Math.random() * 1000,
      };
    });

    // Two butterflies of light with staggered, randomised paths.
    flies = new Array(2).fill(0).map((_, i) => {
      const side = i === 0 ? -1 : 1;
      return {
        bornAt: rand(7000, 9500),
        life: rand(3200, 4200),
        x0: cx + side * W * 0.4,
        y0: cy + rand(-0.2, 0.2) * H,
        x1: cx + side * -0.1 * W + rand(-0.1, 0.1) * W,
        y1: cy + rand(-0.3, -0.05) * H,
        size: R * rand(0.12, 0.18),
        freq: rand(3, 5),
      };
    });
  }

  layout();
  build();
  function onResize() {
    layout();
    build();
  }
  window.addEventListener("resize", onResize);

  let raf = 0;
  let startT = 0;
  let done = false;

  function finish() {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    opts.onDone();
  }

  // ── Layer draws ────────────────────────────────────────────────────────────
  function drawStars(t: number, focus: number) {
    const appear = smooth(seg(t, T.starsIn[0], T.starsIn[1]));
    const fadeOut = seg(t, T.fadeOut[0], T.end);
    ctx!.globalCompositeOperation = "lighter";
    for (const s of stars) {
      const tw = 0.6 + 0.4 * Math.sin(t * (0.0012 + s.layer * 0.0006) + s.tw);
      const a = appear * s.base * tw * focus * (1 - fadeOut);
      if (a <= 0.01) continue;
      const size = s.size * (2.4 + s.layer);
      ctx!.globalAlpha = clamp01(a);
      ctx!.drawImage(s.warm ? starWarm : starCool, s.x - size / 2, s.y - size / 2, size, size);
    }
    ctx!.globalAlpha = 1;
    ctx!.globalCompositeOperation = "source-over";
  }

  function drawShootingStar(t: number) {
    const p = seg(t, T.shootingStar, T.shootingStar + 1100);
    if (p <= 0 || p >= 1) return;
    const e = easeOut(p);
    const x = lerp(W * 0.15, W * 0.75, e);
    const y = lerp(H * 0.2, H * 0.5, e);
    const len = W * 0.16;
    const ang = Math.atan2(H * 0.3, W * 0.6);
    const a = Math.sin(p * Math.PI);
    ctx!.save();
    ctx!.globalCompositeOperation = "lighter";
    const grad = ctx!.createLinearGradient(
      x - Math.cos(ang) * len,
      y - Math.sin(ang) * len,
      x,
      y,
    );
    grad.addColorStop(0, "rgba(255,244,214,0)");
    grad.addColorStop(1, `rgba(255,244,214,${0.9 * a})`);
    ctx!.strokeStyle = grad;
    ctx!.lineWidth = 2;
    ctx!.lineCap = "round";
    ctx!.beginPath();
    ctx!.moveTo(x - Math.cos(ang) * len, y - Math.sin(ang) * len);
    ctx!.lineTo(x, y);
    ctx!.stroke();
    ctx!.globalAlpha = a;
    const hs = 26;
    ctx!.drawImage(starWarm, x - hs / 2, y - hs / 2, hs, hs);
    ctx!.globalAlpha = 1;
    ctx!.restore();
  }

  function drawSphere(t: number, focus: number) {
    const rise = smooth(seg(t, T.dustIn[0], T.spherePeak));
    const recede = smooth(seg(t, T.glyphForm[0], T.glyphForm[1]));
    const fadeOut = seg(t, T.fadeOut[0], T.end);
    const a = rise * (1 - 0.7 * recede) * (1 - fadeOut) * (0.5 + 0.5 * focus);
    if (a <= 0.01) return;
    const breathe = 1 + 0.05 * Math.sin(t * 0.003);
    const rad = R * (0.85 + 0.5 * rise) * breathe;
    ctx!.globalCompositeOperation = "lighter";
    const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, `rgba(255,246,222,${0.85 * a})`);
    g.addColorStop(0.2, `rgba(240,206,138,${0.5 * a})`);
    g.addColorStop(0.55, `rgba(200,150,70,${0.18 * a})`);
    g.addColorStop(1, "rgba(120,90,150,0)");
    ctx!.fillStyle = g;
    ctx!.beginPath();
    ctx!.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx!.fill();
    ctx!.globalCompositeOperation = "source-over";
  }

  function drawParticles(t: number) {
    const appear = seg(t, T.dustIn[0], T.dustIn[0] + 1200);
    const pDust = easeInOut(seg(t, T.dustIn[0], T.dustIn[1]));
    const pForm = easeInOut(seg(t, T.glyphForm[0], T.glyphForm[1]));
    const pDisp = seg(t, T.disperse[0], T.disperse[1]);
    const dispEase = easeOut(pDisp);
    const fadeOut = seg(t, T.fadeOut[0], T.end);
    const maxDim = Math.hypot(W, H);

    ctx!.globalCompositeOperation = "lighter";
    for (const p of particles) {
      const ca = p.camAng + p.swirl * pDust;
      const cloudX = cx + Math.cos(ca) * p.camR;
      const cloudY = cy + Math.sin(ca) * p.camR;
      let x = lerp(p.sx, cloudX, pDust);
      let y = lerp(p.sy, cloudY, pDust);
      if (pForm > 0) {
        x = lerp(x, cx + p.gx, pForm);
        y = lerp(y, cy + p.gy, pForm);
      }
      const held = pForm >= 1 && pDisp <= 0;
      if (held) {
        x += Math.sin(t * 0.006 + p.tw) * R * 0.01;
        y += Math.cos(t * 0.006 + p.tw) * R * 0.01;
      }
      if (pDisp > 0) {
        const travel = dispEase * p.dispDist * maxDim * 0.5;
        x += Math.cos(p.dispAng) * travel;
        y += Math.sin(p.dispAng) * travel - dispEase * H * 0.05; // gentle rise
      }
      let a = appear;
      const twinkle = 0.7 + 0.3 * Math.sin(t * 0.004 + p.tw + p.seed);
      if (pDisp > 0) a *= (0.4 + 0.6 * twinkle) * (1 - smooth(clamp01(pDisp)));
      a *= 1 - fadeOut;
      if (a <= 0.01) continue;
      const glow = 1 + 0.4 * Math.max(0, pForm - pDisp);
      const size = p.r * 5 * glow;
      ctx!.globalAlpha = clamp01(a);
      ctx!.drawImage(p.silver ? moteSilver : moteGold, x - size / 2, y - size / 2, size, size);
    }
    ctx!.globalAlpha = 1;
    ctx!.globalCompositeOperation = "source-over";
  }

  /** Crisp gold line-art glyph over the particles — guarantees legibility. */
  function drawGlyphStroke(t: number) {
    const inA = smooth(seg(t, T.strokeIn[0], T.strokeIn[1]));
    const out = smooth(seg(t, T.disperse[0], T.disperse[0] + 900));
    const fadeOut = seg(t, T.fadeOut[0], T.end);
    const a = inA * (1 - out) * (1 - fadeOut);
    if (a <= 0.01) return;
    const shimmer = 0.85 + 0.15 * Math.sin(t * 0.005);
    ctx!.save();
    ctx!.translate(cx, cy);
    ctx!.globalCompositeOperation = "lighter";
    ctx!.lineCap = "round";
    ctx!.lineJoin = "round";
    ctx!.shadowColor = "rgba(255,224,150,0.9)";
    ctx!.shadowBlur = R * 0.28;
    ctx!.strokeStyle = `rgba(255,244,214,${a * shimmer})`;
    ctx!.fillStyle = `rgba(255,244,214,${a * shimmer})`;
    ctx!.lineWidth = R * 0.05;
    traceCancer(ctx!, R);
    // second pass, brighter core
    ctx!.shadowBlur = R * 0.1;
    ctx!.lineWidth = R * 0.02;
    ctx!.strokeStyle = `rgba(255,255,245,${a})`;
    traceCancer(ctx!, R);
    ctx!.restore();
  }

  /** Cancer constellation as faint context around the glyph. */
  function drawConstellation(t: number) {
    const inA = smooth(seg(t, T.constellationIn[0], T.constellationIn[1]));
    const out = smooth(seg(t, T.disperse[0], T.disperse[1]));
    const fadeOut = seg(t, T.fadeOut[0], T.end);
    const a = inA * (1 - out) * (1 - fadeOut);
    if (a <= 0.01) return;
    // Sits in the upper-left sky as a distant asterism — context, not clutter.
    const ccx = W * (isMobile ? 0.26 : 0.22);
    const ccy = H * 0.24;
    const scale = R * (isMobile ? 0.8 : 0.95);
    const px = (p: Pt) => ccx + p.x * scale;
    const py = (p: Pt) => ccy + p.y * scale;
    ctx!.save();
    ctx!.globalCompositeOperation = "lighter";
    ctx!.strokeStyle = `rgba(226,201,138,${a * 0.22})`;
    ctx!.lineWidth = 1;
    for (const [i, j] of CANCER_EDGES) {
      ctx!.beginPath();
      ctx!.moveTo(px(CANCER_STARS[i]), py(CANCER_STARS[i]));
      ctx!.lineTo(px(CANCER_STARS[j]), py(CANCER_STARS[j]));
      ctx!.stroke();
    }
    for (const s of CANCER_STARS) {
      const tw = 0.7 + 0.3 * Math.sin(t * 0.004 + s.x * 8);
      const size = R * 0.16 * tw;
      ctx!.globalAlpha = a * tw * 0.85;
      ctx!.drawImage(starWarm, px(s) - size / 2, py(s) - size / 2, size, size);
    }
    ctx!.globalAlpha = 1;
    ctx!.restore();
  }

  function drawTreeOfLife(t: number, focus: number) {
    const growth = easeOut(seg(t, T.treeGrow[0], T.treeGrow[1]));
    if (growth <= 0) return;
    const fadeOut = seg(t, T.fadeOut[0], T.end);
    const recede = smooth(seg(t, T.glyphForm[0], T.glyphForm[1]));
    const a = 0.5 * (1 - 0.5 * recede) * focus * (1 - fadeOut);
    drawTree(ctx!, tree, cx, cy + R * 0.15, R * 2.4, growth, a);
  }

  function drawButterflies(t: number) {
    const fadeOut = seg(t, T.fadeOut[0], T.end);
    for (const f of flies) {
      const p = seg(t, f.bornAt, f.bornAt + f.life);
      if (p <= 0 || p >= 1) continue;
      const fade = Math.sin(p * Math.PI);
      const ease = easeInOut(p);
      const x = lerp(f.x0, f.x1, ease) + Math.sin(t * 0.002 * f.freq) * 20;
      const y = lerp(f.y0, f.y1, ease) + Math.sin(t * 0.003 * f.freq) * 26;
      const flap = 0.5 + 0.5 * Math.sin(t * 0.02 * f.freq);
      const ang = Math.atan2(f.y1 - f.y0, f.x1 - f.x0) + Math.sin(t * 0.002) * 0.2;
      drawButterfly(ctx!, x, y, f.size, flap, fade * (1 - fadeOut), ang);
    }
  }

  function drawPulse(t: number) {
    const p = seg(t, T.pulse[0], T.pulse[1]);
    if (p <= 0 || p >= 1) return;
    const e = easeOut(p);
    const maxDim = Math.hypot(W, H);
    const rad = e * maxDim * 0.62;
    const a = (1 - p) * 0.5;
    const width = R * 0.5 * (1 - p * 0.5);
    ctx!.globalCompositeOperation = "lighter";
    const g = ctx!.createRadialGradient(cx, cy, Math.max(0, rad - width), cx, cy, rad + width);
    g.addColorStop(0, "rgba(240,206,138,0)");
    g.addColorStop(0.5, `rgba(255,240,200,${a})`);
    g.addColorStop(1, "rgba(240,206,138,0)");
    ctx!.fillStyle = g;
    ctx!.beginPath();
    ctx!.arc(cx, cy, rad + width, 0, Math.PI * 2);
    ctx!.fill();
    ctx!.globalCompositeOperation = "source-over";
  }

  /** Spotlight vignette that dims the periphery while the glyph is held. */
  function drawSpotlight(t: number, focus: number) {
    const dim = 1 - focus; // 0 normally, up to ~0.5 during hold
    if (dim <= 0.01) return;
    const g = ctx!.createRadialGradient(cx, cy, R * 0.8, cx, cy, Math.hypot(W, H) * 0.55);
    g.addColorStop(0, "rgba(6,5,14,0)");
    g.addColorStop(1, `rgba(6,5,14,${0.55 * dim})`);
    ctx!.fillStyle = g;
    ctx!.fillRect(0, 0, W, H);
  }

  // Focus = 1 normally, dips during the glyph hold to spotlight it.
  function focusAt(t: number) {
    const into = smooth(seg(t, T.glyphForm[0], T.strokeIn[1]));
    const back = smooth(seg(t, T.disperse[0], T.disperse[1]));
    return 1 - 0.5 * (into - back);
  }

  function drawReduced(t: number) {
    const io = Math.sin(clamp01(t / REDUCED_END) * Math.PI);
    ctx!.clearRect(0, 0, W, H);
    paintSky(ctx!, W, H, io);
    drawNebula(ctx!, nebula, t, io * 0.8);
    // a few stars
    ctx!.globalCompositeOperation = "lighter";
    for (let i = 0; i < stars.length; i += 2) {
      const s = stars[i];
      const size = s.size * 3;
      ctx!.globalAlpha = io * s.base * 0.8;
      ctx!.drawImage(s.warm ? starWarm : starCool, s.x - size / 2, s.y - size / 2, size, size);
    }
    ctx!.globalAlpha = 1;
    ctx!.globalCompositeOperation = "source-over";
    drawMoon(ctx!, moonX, moonY, moonR, io);
    // crisp glyph
    ctx!.save();
    ctx!.translate(cx, cy);
    ctx!.globalCompositeOperation = "lighter";
    ctx!.lineCap = "round";
    ctx!.shadowColor = "rgba(255,224,150,0.9)";
    ctx!.shadowBlur = R * 0.25;
    ctx!.strokeStyle = `rgba(255,244,214,${io})`;
    ctx!.fillStyle = `rgba(255,244,214,${io})`;
    ctx!.lineWidth = R * 0.05;
    traceCancer(ctx!, R);
    ctx!.restore();
    container.style.opacity = String(clamp01(io * 1.2));
  }

  function frame(now: number) {
    if (!startT) startT = now;
    const frozen = opts.freezeMs != null;
    const t = frozen ? opts.freezeMs! : now - startT;
    ctx!.clearRect(0, 0, W, H);

    if (opts.reducedMotion) {
      drawReduced(t);
      if (!frozen && t >= REDUCED_END) return finish();
      raf = requestAnimationFrame(frame);
      return;
    }

    const inOpacity = smooth(seg(t, 0, T.fadeIn));
    const outOpacity = 1 - smooth(seg(t, T.fadeOut[0], T.end));
    container.style.opacity = String(inOpacity * outOpacity);

    const skyA = smooth(seg(t, 0, T.fadeIn)) * (1 - seg(t, T.fadeOut[0], T.end));
    const focus = focusAt(t);

    paintSky(ctx!, W, H, skyA);
    drawNebula(ctx!, nebula, t, focus * skyA);
    drawStars(t, focus);
    drawShootingStar(t);
    drawMoon(ctx!, moonX, moonY, moonR, smooth(seg(t, T.moonIn[0], T.moonIn[1])) * focus * (1 - seg(t, T.fadeOut[0], T.end)));
    drawTreeOfLife(t, focus);
    drawSpotlight(t, focus);
    drawSphere(t, focus);
    drawConstellation(t);
    drawParticles(t);
    drawGlyphStroke(t);
    drawButterflies(t);
    drawPulse(t);

    if (!frozen && t >= T.end) return finish();
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);

  return {
    skip() {
      if (done || opts.reducedMotion) return finish();
      const now = performance.now();
      const target = Math.max(T.holdUntil, T.pulse[0] - 200);
      if (now - startT < target) startT = now - target;
    },
    destroy() {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    },
  };
}
