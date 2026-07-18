/**
 * Celebration animation engine — pure browser code (no React), so the overlay
 * component stays thin and this can be tuned in isolation.
 *
 * Theme "birthday_cancer" — a curated, luxury sequence:
 *   1. golden dust drifts in from the dark and spirals toward the centre
 *   2. a breathing sphere of light forms and radiates warm gold
 *   3. the dust reassembles into the Cancer glyph ♋, holds ~1.2s
 *   4. the glyph dissolves outward into a slow starfield
 *   5. one final golden pulse expands, everything fades to transparent
 *
 * Palette is Ellen Soul's real brand: warm gold + moon-silver on a warm-black
 * veil (a whisper of cosmic violet in the vignette). No text, numbers, logos.
 *
 * Canvas draws with additive blending over a transparent surface; the dark,
 * page-blurring veil is a CSS layer on the container element (see overlay).
 */

import type { CelebrationTheme } from "@/lib/celebration";

export interface RunOptions {
  reducedMotion: boolean;
  onDone: () => void;
  /** Debug: freeze the timeline at this ms and hold (never completes). */
  freezeMs?: number | null;
}

export interface RunHandle {
  /** Gracefully fast-forward to the finale (tap-to-skip). */
  skip: () => void;
  /** Hard teardown (unmount) — cancels the loop, no onDone. */
  destroy: () => void;
}

// ── Small math helpers ──────────────────────────────────────────────────────
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** Normalised, clamped progress of t across [a, b]. */
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const smooth = (x: number) => x * x * (3 - 2 * x); // smoothstep
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

// ── Timeline (ms) ───────────────────────────────────────────────────────────
const T = {
  fadeIn: 900, // container veil 0 → 1
  dustFrom: 300, // dust starts drifting
  dustTo: 3600, // dust settled into the central cloud
  sphereIn: 2400, // sphere glow begins
  spherePeak: 4600, // sphere at its fullest
  glyphFrom: 4700, // dust → glyph target points
  glyphFormed: 5800,
  glyphHold: 7000, // holds until here
  disperseTo: 8800, // glyph → outward starfield
  pulseFrom: 7500,
  pulseTo: 9100,
  fadeOutFrom: 8500,
  end: 9500,
};
const REDUCED_END = 2800;

// ── Cancer glyph geometry ───────────────────────────────────────────────────
/**
 * Draws the astrological Cancer glyph ♋ — two mirrored curls ("69" laid on its
 * side) — centred at (0,0) in white, for alpha-sampling into particle targets.
 * Hand-drawn (not Unicode) so it renders identically on every device and never
 * falls back to a colour-emoji crab.
 */
function drawCancerGlyph(o: CanvasRenderingContext2D, R: number) {
  o.strokeStyle = "#fff";
  o.fillStyle = "#fff";
  o.lineCap = "round";
  o.lineJoin = "round";
  o.lineWidth = R * 0.09;

  const rr = R * 0.34; // curl loop radius
  const ox = R * 0.32; // loop centre horizontal offset
  const oy = R * 0.24; // loop centre vertical offset
  const headR = R * 0.1; // filled "head" bead radius
  const gap = 0.95; // radians of the loop left open (tail mouth)

  // Two near-full loops placed diagonally (point-symmetric through the centre),
  // each with its mouth + bead facing the centre — reads as a sideways "69".
  for (const s of [1, -1] as const) {
    const lx = s * ox;
    const ly = s * oy;
    const gapAng = Math.atan2(-ly, -lx); // toward the centre
    const a0 = gapAng + gap / 2;
    const a1 = gapAng - gap / 2 + Math.PI * 2;
    o.beginPath();
    o.arc(lx, ly, rr, a0, a1, false);
    o.stroke();
    // Bead at the mouth tip (nearest the centre).
    o.beginPath();
    o.arc(lx + rr * Math.cos(a0), ly + rr * Math.sin(a0), headR, 0, Math.PI * 2);
    o.fill();
  }
}

interface Pt {
  x: number;
  y: number;
}

/** Sample the glyph into a shuffled point cloud (relative to centre). */
function sampleGlyphPoints(R: number): Pt[] {
  const pad = Math.ceil(R * 0.6);
  const size = Math.max(16, Math.ceil(R * 2 + pad * 2));
  const off = document.createElement("canvas");
  off.width = size;
  off.height = size;
  const o = off.getContext("2d");
  if (!o) return [];
  o.translate(size / 2, size / 2);
  drawCancerGlyph(o, R);
  let data: Uint8ClampedArray;
  try {
    data = o.getImageData(0, 0, size, size).data;
  } catch {
    return [];
  }
  const pts: Pt[] = [];
  const step = Math.max(2, Math.round(R / 44)); // sampling density
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      if (data[(y * size + x) * 4 + 3] > 110) {
        pts.push({ x: x - size / 2, y: y - size / 2 });
      }
    }
  }
  // Fisher–Yates shuffle so particle→point assignment is spatially even.
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  return pts;
}

// ── Soft glow sprite (cheap additive dots) ──────────────────────────────────
function makeGlow(inner: string, outer: string): HTMLCanvasElement {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.28, outer);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  return c;
}

interface Particle {
  sx: number; // scatter start
  sy: number;
  camAng: number; // central-cloud polar angle
  camR: number; // central-cloud radius
  swirl: number; // extra rotation applied while converging
  gx: number; // glyph target (relative to centre)
  gy: number;
  dispAng: number; // dispersal direction
  dispDist: number; // dispersal distance factor
  r: number; // base size
  silver: boolean;
  tw: number; // twinkle phase
  seed: number;
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

  let dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0;
  let H = 0;
  let cx = 0;
  let cy = 0;
  let R = 0; // glyph half-size
  let isMobile = false;

  const gold = makeGlow("rgba(255,244,214,1)", "rgba(226,178,92,0.85)");
  const silver = makeGlow("rgba(245,248,255,1)", "rgba(180,196,224,0.8)");

  let particles: Particle[] = [];
  let glyphPts: Pt[] = [];

  function layout() {
    // Guard against transient 0-size viewports (mid-resize, detached tab, …) —
    // a zero here cascades into R=0 and a getImageData crash.
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
    cy = H / 2;
    R = Math.max(48, Math.min(W, H) * (isMobile ? 0.26 : 0.2));
  }

  function build() {
    glyphPts = sampleGlyphPoints(R);
    const N = isMobile ? 190 : 320;
    const maxDim = Math.hypot(W, H);
    particles = new Array(N).fill(0).map((_, i) => {
      const g = glyphPts.length ? glyphPts[i % glyphPts.length] : { x: 0, y: 0 };
      const jit = R * 0.02;
      const gx = g.x + (Math.random() - 0.5) * jit;
      const gy = g.y + (Math.random() - 0.5) * jit;
      // Scatter start: anywhere on screen, biased toward the edges.
      const edgeAng = Math.random() * Math.PI * 2;
      const edgeR = lerp(maxDim * 0.25, maxDim * 0.62, Math.random());
      return {
        sx: cx + Math.cos(edgeAng) * edgeR + (Math.random() - 0.5) * 120,
        sy: cy + Math.sin(edgeAng) * edgeR + (Math.random() - 0.5) * 120,
        camAng: Math.random() * Math.PI * 2,
        camR: lerp(R * 0.06, R * 0.34, Math.random()),
        swirl: lerp(0.6, 2.4, Math.random()) * (Math.random() < 0.5 ? 1 : -1),
        gx,
        gy,
        dispAng: Math.atan2(gy, gx) + (Math.random() - 0.5) * 0.9,
        dispDist: lerp(0.5, 1.4, Math.random()),
        r: lerp(1.1, isMobile ? 2.6 : 3.2, Math.random()),
        silver: Math.random() < 0.16,
        tw: Math.random() * Math.PI * 2,
        seed: Math.random() * 1000,
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

  // ── Drawing helpers ────────────────────────────────────────────────────────
  function drawParticles(t: number) {
    const appear = seg(t, T.dustFrom, T.dustFrom + 1200);
    const pDust = easeInOut(seg(t, T.dustFrom, T.dustTo));
    const pForm = easeInOut(seg(t, T.glyphFrom, T.glyphFormed));
    const pDisp = seg(t, T.glyphHold, T.disperseTo);
    const dispEase = easeOut(pDisp);
    const fadeOut = seg(t, T.fadeOutFrom, T.end);
    const maxDim = Math.hypot(W, H);

    ctx!.globalCompositeOperation = "lighter";
    for (const p of particles) {
      // Central-cloud position (with convergence swirl).
      const ca = p.camAng + p.swirl * pDust;
      const cloudX = cx + Math.cos(ca) * p.camR;
      const cloudY = cy + Math.sin(ca) * p.camR;

      // scatter → cloud → glyph
      let x = lerp(p.sx, cloudX, pDust);
      let y = lerp(p.sy, cloudY, pDust);
      if (pForm > 0) {
        x = lerp(x, cx + p.gx, pForm);
        y = lerp(y, cy + p.gy, pForm);
      }

      // Glyph shimmer while held.
      const held = pForm >= 1 && pDisp <= 0;
      if (held) {
        const s = Math.sin(t * 0.006 + p.tw) * R * 0.012;
        x += s;
        y += Math.cos(t * 0.006 + p.tw) * R * 0.012;
      }

      // Dispersal outward into a starfield.
      if (pDisp > 0) {
        const travel = dispEase * p.dispDist * maxDim * 0.55;
        x += Math.cos(p.dispAng) * travel;
        y += Math.sin(p.dispAng) * travel;
      }

      // Opacity envelope.
      let a = appear;
      const twinkle = 0.7 + 0.3 * Math.sin(t * 0.004 + p.tw + p.seed);
      if (pDisp > 0) a *= (0.4 + 0.6 * twinkle) * (1 - smooth(clamp01(pDisp * 1.05)));
      a *= 1 - fadeOut;
      if (a <= 0.01) continue;

      // Slightly brighter and larger at the moment the glyph is whole.
      const glow = 1 + 0.45 * (pForm - pDisp > 0 ? Math.max(0, pForm - pDisp) : 0);
      const size = p.r * 5 * glow;
      ctx!.globalAlpha = clamp01(a);
      ctx!.drawImage(p.silver ? silver : gold, x - size / 2, y - size / 2, size, size);
    }
    ctx!.globalAlpha = 1;
    ctx!.globalCompositeOperation = "source-over";
  }

  function drawSphere(t: number) {
    // Rise, peak, then recede as the glyph takes over; a faint core lingers.
    const rise = smooth(seg(t, T.sphereIn, T.spherePeak));
    const recede = smooth(seg(t, T.glyphFrom, T.glyphFormed));
    const fadeOut = seg(t, T.fadeOutFrom, T.end);
    const a = rise * (1 - 0.72 * recede) * (1 - fadeOut);
    if (a <= 0.01) return;
    const breathe = 1 + 0.05 * Math.sin(t * 0.003);
    const rad = R * (0.9 + 0.5 * rise) * breathe;
    ctx!.globalCompositeOperation = "lighter";
    const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, rad);
    grad.addColorStop(0, `rgba(255,246,222,${0.9 * a})`);
    grad.addColorStop(0.18, `rgba(240,206,138,${0.55 * a})`);
    grad.addColorStop(0.5, `rgba(200,150,70,${0.22 * a})`);
    grad.addColorStop(1, "rgba(120,90,140,0)"); // whisper of cosmic violet at the edge
    ctx!.fillStyle = grad;
    ctx!.beginPath();
    ctx!.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx!.fill();
    ctx!.globalCompositeOperation = "source-over";
  }

  function drawPulse(t: number) {
    const p = seg(t, T.pulseFrom, T.pulseTo);
    if (p <= 0 || p >= 1) return;
    const e = easeOut(p);
    const maxDim = Math.hypot(W, H);
    const rad = e * maxDim * 0.62;
    const a = (1 - p) * 0.55;
    ctx!.globalCompositeOperation = "lighter";
    const width = R * 0.5 * (1 - p * 0.5);
    const grad = ctx!.createRadialGradient(
      cx,
      cy,
      Math.max(0, rad - width),
      cx,
      cy,
      rad + width,
    );
    grad.addColorStop(0, "rgba(240,206,138,0)");
    grad.addColorStop(0.5, `rgba(255,240,200,${a})`);
    grad.addColorStop(1, "rgba(240,206,138,0)");
    ctx!.fillStyle = grad;
    ctx!.beginPath();
    ctx!.arc(cx, cy, rad + width, 0, Math.PI * 2);
    ctx!.fill();
    ctx!.globalCompositeOperation = "source-over";
  }

  // ── Reduced-motion: a calm static blessing, no travel ──────────────────────
  function drawReduced(t: number) {
    const inOut = Math.sin(clamp01(t / REDUCED_END) * Math.PI); // 0→1→0
    ctx!.clearRect(0, 0, W, H);
    ctx!.globalCompositeOperation = "lighter";
    // soft central glow
    const rad = R * 1.3;
    const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, rad);
    grad.addColorStop(0, `rgba(255,246,222,${0.5 * inOut})`);
    grad.addColorStop(0.4, `rgba(220,170,90,${0.2 * inOut})`);
    grad.addColorStop(1, "rgba(120,90,140,0)");
    ctx!.fillStyle = grad;
    ctx!.fillRect(0, 0, W, H);
    // faint glyph
    ctx!.globalAlpha = 0.85 * inOut;
    for (const p of particles) {
      const size = p.r * 5;
      ctx!.drawImage(gold, cx + p.gx - size / 2, cy + p.gy - size / 2, size, size);
    }
    ctx!.globalAlpha = 1;
    ctx!.globalCompositeOperation = "source-over";
    container.style.opacity = String(0.85 * inOut + (inOut > 0 ? 0.15 : 0));
  }

  // ── Main loop ──────────────────────────────────────────────────────────────
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

    // Container veil in, then out at the finale.
    const inOpacity = smooth(seg(t, 0, T.fadeIn));
    const outOpacity = 1 - smooth(seg(t, T.fadeOutFrom, T.end));
    container.style.opacity = String(inOpacity * outOpacity);

    drawSphere(t);
    drawParticles(t);
    drawPulse(t);

    if (!frozen && t >= T.end) return finish();
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);

  return {
    skip() {
      if (done || opts.reducedMotion) return finish();
      // Jump to the start of the dispersal/fade so the exit stays graceful.
      const now = performance.now();
      const target = Math.max(T.glyphHold, T.pulseFrom - 200);
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
