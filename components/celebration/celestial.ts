/**
 * Celestial toolkit — the shared visual language of Birthday Mode.
 *
 * Everything premium in the birthday experience (intro overlay, the living
 * site-wide atmosphere, and the footer scene) is composed from these
 * primitives, so the whole thing reads as one hand-crafted celestial world
 * rather than a pile of unrelated effects.
 *
 * Pure browser code (Canvas 2D). No React, no deps.
 *
 * Anti-"cheap" principles baked in here:
 *   • stars are crisp cores with fine diffraction spikes + a soft halo — not
 *     uniform bokeh blobs;
 *   • colour is a deep cosmic gradient (indigo → plum → black) with gold and
 *     moon-silver, layered nebula, and a real luminous moon — depth, not flat;
 *   • motion uses slow, organic easing and randomised phases.
 */

// ── Palette ─────────────────────────────────────────────────────────────────
export const SKY = {
  black: "#070510",
  indigo: "#0e0b1e",
  plum: "#1a1330",
  deepBlue: "#0b1030",
  goldBright: "#FFF4D6",
  gold: "#E8C98A",
  goldMid: "#D4A853",
  goldDeep: "#B8883A",
  sand: "#C4A97A",
  silver: "#EAF0F6",
  silverDim: "#AEBBD6",
  violet: "#7E6AC8",
};

// ── Math / easing ───────────────────────────────────────────────────────────
export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);
export const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
/** Clamped, normalised progress of t across [a,b]. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const pick = <T>(arr: T[]): T => arr[(Math.random() * arr.length) | 0];

// ── Sprites (cached offscreen canvases; drawn with additive blend) ───────────

/**
 * A luminous star: bright core, four fine diffraction spikes, soft halo.
 * `warm` tints gold, else moon-silver. Returns a square canvas.
 */
export function makeStar(size = 96, warm = true): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const cx = size / 2;
  const core = warm ? "255,244,214" : "236,242,255";
  const mid = warm ? "232,201,138" : "174,187,214";

  // Soft halo
  const halo = g.createRadialGradient(cx, cx, 0, cx, cx, cx);
  halo.addColorStop(0, `rgba(${core},0.9)`);
  halo.addColorStop(0.12, `rgba(${mid},0.5)`);
  halo.addColorStop(0.45, `rgba(${mid},0.08)`);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = halo;
  g.fillRect(0, 0, size, size);

  // Diffraction spikes (thin, tapered)
  g.globalCompositeOperation = "lighter";
  const spike = (len: number, wid: number, rot: number) => {
    g.save();
    g.translate(cx, cx);
    g.rotate(rot);
    const grad = g.createLinearGradient(-len, 0, len, 0);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.5, `rgba(${core},0.85)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
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
  spike(cx * 0.95, cx * 0.05, 0);
  spike(cx * 0.95, cx * 0.05, Math.PI / 2);
  spike(cx * 0.6, cx * 0.03, Math.PI / 4);
  spike(cx * 0.6, cx * 0.03, -Math.PI / 4);

  // Bright pinpoint core
  const pin = g.createRadialGradient(cx, cx, 0, cx, cx, size * 0.06);
  pin.addColorStop(0, `rgba(${core},1)`);
  pin.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = pin;
  g.fillRect(0, 0, size, size);
  return c;
}

/** A soft round mote of dust/light. */
export function makeMote(rgb = "232,201,138", size = 64): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${rgb},0.95)`);
  grad.addColorStop(0.3, `rgba(${rgb},0.35)`);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

// ── Deep-sky background ──────────────────────────────────────────────────────

/** Paint the opaque cosmic gradient background (for the intro overlay). */
export function paintSky(ctx: CanvasRenderingContext2D, w: number, h: number, alpha = 1) {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.5, Math.hypot(w, h) * 0.62);
  g.addColorStop(0, SKY.plum);
  g.addColorStop(0.4, SKY.indigo);
  g.addColorStop(1, SKY.black);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
}

export interface NebulaBlob {
  x: number;
  y: number;
  r: number;
  rgb: string;
  drift: number;
  phase: number;
}

export function makeNebula(w: number, h: number, count = 5): NebulaBlob[] {
  const palette = ["126,106,200", "80,64,150", "70,90,160", "190,140,70", "150,90,120"];
  return new Array(count).fill(0).map(() => ({
    x: rand(0.1, 0.9) * w,
    y: rand(0.1, 0.9) * h,
    r: rand(0.25, 0.55) * Math.min(w, h),
    rgb: pick(palette),
    drift: rand(6, 16),
    phase: rand(0, Math.PI * 2),
  }));
}

/** Very soft, slowly breathing/drifting nebula clouds (additive). */
export function drawNebula(ctx: CanvasRenderingContext2D, blobs: NebulaBlob[], t: number, alpha = 1) {
  ctx.globalCompositeOperation = "lighter";
  for (const b of blobs) {
    const dx = Math.sin(t * 0.00006 * b.drift + b.phase) * 40;
    const dy = Math.cos(t * 0.00005 * b.drift + b.phase) * 30;
    const pulse = 0.7 + 0.3 * Math.sin(t * 0.0004 + b.phase);
    const g = ctx.createRadialGradient(b.x + dx, b.y + dy, 0, b.x + dx, b.y + dy, b.r);
    g.addColorStop(0, `rgba(${b.rgb},${0.1 * pulse * alpha})`);
    g.addColorStop(0.5, `rgba(${b.rgb},${0.04 * pulse * alpha})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  ctx.globalCompositeOperation = "source-over";
}

/** A luminous moon with a soft terminator, faint maria and a wide halo. */
export function drawMoon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha = 1) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // Halo
  const halo = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 4);
  halo.addColorStop(0, `rgba(240,244,255,${0.28 * alpha})`);
  halo.addColorStop(0.4, `rgba(220,210,255,${0.08 * alpha})`);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, r * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  // Disc
  const disc = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  disc.addColorStop(0, `rgba(255,252,244,${alpha})`);
  disc.addColorStop(0.7, `rgba(226,224,236,${alpha})`);
  disc.addColorStop(1, `rgba(150,150,180,${0.85 * alpha})`);
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // Maria (faint craters)
  ctx.globalAlpha = 0.06 * alpha;
  ctx.fillStyle = "#6a6a80";
  for (const [mx, my, mr] of [
    [-0.25, -0.2, 0.22],
    [0.2, 0.1, 0.28],
    [-0.05, 0.35, 0.16],
    [0.35, -0.3, 0.12],
  ] as const) {
    ctx.beginPath();
    ctx.arc(x + mx * r, y + my * r, mr * r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── Cancer glyph ♋ ───────────────────────────────────────────────────────────
/**
 * The astrological Cancer glyph — two mirrored curls (a sideways "69").
 * Draw with a stroke context; `R` is the glyph half-size. Used both for a
 * crisp luminous line-art render and (via sampling) as particle targets.
 */
export function traceCancer(o: CanvasRenderingContext2D, R: number) {
  const rr = R * 0.34;
  const ox = R * 0.32;
  const oy = R * 0.24;
  const headR = R * 0.11;
  const gap = 0.95;
  for (const s of [1, -1] as const) {
    const lx = s * ox;
    const ly = s * oy;
    const gapAng = Math.atan2(-ly, -lx);
    const a0 = gapAng + gap / 2;
    const a1 = gapAng - gap / 2 + Math.PI * 2;
    o.beginPath();
    o.arc(lx, ly, rr, a0, a1, false);
    o.stroke();
    o.beginPath();
    o.arc(lx + rr * Math.cos(a0), ly + rr * Math.sin(a0), headR, 0, Math.PI * 2);
    o.fill();
  }
}

export interface Pt {
  x: number;
  y: number;
}

/** Sample the Cancer glyph into a shuffled point cloud (relative to centre). */
export function sampleCancer(R: number): Pt[] {
  const pad = Math.ceil(R * 0.6);
  const size = Math.max(16, Math.ceil(R * 2 + pad * 2));
  const off = document.createElement("canvas");
  off.width = off.height = size;
  const o = off.getContext("2d");
  if (!o) return [];
  o.translate(size / 2, size / 2);
  o.strokeStyle = "#fff";
  o.fillStyle = "#fff";
  o.lineCap = "round";
  o.lineJoin = "round";
  o.lineWidth = R * 0.1;
  traceCancer(o, R);
  let data: Uint8ClampedArray;
  try {
    data = o.getImageData(0, 0, size, size).data;
  } catch {
    return [];
  }
  const pts: Pt[] = [];
  const step = Math.max(2, Math.round(R / 46));
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      if (data[(y * size + x) * 4 + 3] > 110) pts.push({ x: x - size / 2, y: y - size / 2 });
    }
  }
  for (let i = pts.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  return pts;
}

/**
 * Cancer constellation — bright star nodes (normalised to a unit box centred on
 * origin) plus the edges that connect them. Loosely based on the real asterism
 * (Acubens, Al Tarf, Asellus Borealis/Australis, Tegmine) — stylised for grace.
 */
export const CANCER_STARS: Pt[] = [
  { x: 0.0, y: -0.05 }, // hub
  { x: 0.55, y: 0.55 }, // Al Tarf (bright)
  { x: -0.15, y: 0.5 }, // Acubens
  { x: -0.05, y: -0.55 }, // Asellus Borealis
  { x: 0.35, y: -0.35 }, // Asellus Australis
  { x: -0.6, y: -0.15 }, // Tegmine
];
export const CANCER_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [3, 4],
  [0, 5],
];

// ── Tree of Life (golden line art, grows) ────────────────────────────────────
export interface Branch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  depth: number;
  order: number;
}

/** Build a recursive branch list rooted at (0,0) growing upward, height ~1. */
export function buildTree(height: number, depth = 8): Branch[] {
  const out: Branch[] = [];
  let order = 0;
  const grow = (x: number, y: number, ang: number, len: number, d: number) => {
    if (d <= 0 || len < height * 0.02) return;
    const x2 = x + Math.cos(ang) * len;
    const y2 = y + Math.sin(ang) * len;
    out.push({ x1: x, y1: y, x2, y2, depth: d, order: order++ });
    const spread = rand(0.28, 0.5);
    const shrink = rand(0.68, 0.78);
    grow(x2, y2, ang - spread, len * shrink, d - 1);
    grow(x2, y2, ang + spread, len * shrink, d - 1);
    if (Math.random() < 0.35) grow(x2, y2, ang + rand(-0.12, 0.12), len * shrink * 0.9, d - 1);
  };
  grow(0, 0, -Math.PI / 2, height * 0.26, depth);
  out.sort((a, b) => a.order - b.order);
  return out;
}

/** Draw the tree up to `growth` (0..1), gold lines, glowing tips. */
export function drawTree(
  ctx: CanvasRenderingContext2D,
  branches: Branch[],
  x: number,
  baseY: number,
  scale: number,
  growth: number,
  alpha: number,
) {
  const n = Math.floor(branches.length * clamp01(growth));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const b = branches[i];
    // Fine golden filaments: width in screen px (thick trunk → hair-thin tips).
    ctx.lineWidth = Math.max(0.5, b.depth * 0.5);
    ctx.strokeStyle = `rgba(232,201,138,${alpha * (0.28 + b.depth / 22)})`;
    ctx.beginPath();
    ctx.moveTo(x + b.x1 * scale, baseY + b.y1 * scale);
    ctx.lineTo(x + b.x2 * scale, baseY + b.y2 * scale);
    ctx.stroke();
    // Glowing star at the outer leaf tips.
    if (b.depth <= 2) {
      const g = ctx.createRadialGradient(x + b.x2 * scale, baseY + b.y2 * scale, 0, x + b.x2 * scale, baseY + b.y2 * scale, 3.2);
      g.addColorStop(0, `rgba(255,244,214,${alpha * 0.9})`);
      g.addColorStop(1, "rgba(255,244,214,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x + b.x2 * scale, baseY + b.y2 * scale, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ── Butterfly of light ───────────────────────────────────────────────────────
/** A tiny luminous butterfly; `flap` 0..1 drives wing angle. */
export function drawButterfly(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  flap: number,
  alpha: number,
  rot = 0,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalCompositeOperation = "lighter";
  const open = lerp(0.55, 1, flap);
  // Slender luminous body so it never reads as bare wing-bars edge-on.
  const bodyGrad = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.5);
  bodyGrad.addColorStop(0, `rgba(255,244,214,0)`);
  bodyGrad.addColorStop(0.5, `rgba(255,244,214,${0.8 * alpha})`);
  bodyGrad.addColorStop(1, `rgba(255,244,214,0)`);
  ctx.strokeStyle = bodyGrad;
  ctx.lineWidth = Math.max(1, size * 0.06);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.lineTo(0, size * 0.5);
  ctx.stroke();
  const wing = (sx: number) => {
    ctx.save();
    ctx.scale(sx * open, 1);
    const g = ctx.createRadialGradient(size * 0.5, 0, 0, size * 0.5, 0, size);
    g.addColorStop(0, `rgba(255,244,214,${0.9 * alpha})`);
    g.addColorStop(0.5, `rgba(226,178,110,${0.4 * alpha})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
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
