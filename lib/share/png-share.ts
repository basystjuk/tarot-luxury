/**
 * Lightweight PNG export of a DOM element.
 *
 * Built on the browser-native HTMLCanvasElement — NOT html2canvas (which
 * is 200KB+ and slow). We render the share content into a canvas via
 * SVG-foreignObject wrapping, then export to a Blob. This works for
 * structured text + simple gradients + emoji; it does NOT capture
 * arbitrary CSS (no flexbox, no transforms beyond translate). For card
 * sharing this is sufficient because we render a purpose-built
 * "share card" element with simple inline styles.
 *
 * If the user is on a device with `navigator.share()` + file support,
 * we share via the system sheet. Otherwise we fall back to triggering
 * a download.
 */

export interface ShareOptions {
  /** Filename without extension. Will append .png automatically. */
  filename: string;
  /** Pixel ratio multiplier — 2 = retina quality. Defaults to 2. */
  scale?: number;
  /** Background colour of the canvas (in case the source has transparency). */
  background?: string;
}

/**
 * Render an HTMLElement to a PNG Blob.
 *
 * @param el  the element to capture
 * @param opts ShareOptions
 */
export async function elementToPngBlob(
  el: HTMLElement,
  opts: ShareOptions = { filename: "share" },
): Promise<Blob> {
  const scale = opts.scale ?? 2;
  const rect = el.getBoundingClientRect();
  const w = Math.ceil(rect.width);
  const h = Math.ceil(rect.height);

  // Serialise the element into self-contained HTML with computed styles
  // inlined on the root. We clone the node, walk it, and inline every
  // CSS property (yes, heavy — but only triggered on user click).
  const clone = el.cloneNode(true) as HTMLElement;
  inlineStyles(el, clone);

  // Wrap in an SVG <foreignObject> so the browser can rasterise HTML.
  const xml = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="background:${opts.background ?? "#FDFBF7"}">
        ${xml}
      </div>
    </foreignObject>
  </svg>`;

  const img = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);

  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.fillStyle = opts.background ?? "#FDFBF7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png", 0.95);
  });
}

/**
 * Save or share an element as PNG.
 *
 * Tries `navigator.share()` first if the browser supports file sharing
 * (mobile Safari, Chrome Android). Falls back to a direct download.
 */
export async function shareElementAsPng(el: HTMLElement, opts: ShareOptions): Promise<"shared" | "downloaded"> {
  const blob = await elementToPngBlob(el, opts);
  const file = new File([blob], `${opts.filename}.png`, { type: "image/png" });

  type NavigatorWithShare = Navigator & {
    canShare?: (data: { files?: File[] }) => boolean;
    share?: (data: { files?: File[]; title?: string }) => Promise<void>;
  };
  const nav = navigator as NavigatorWithShare;
  if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: opts.filename });
      return "shared";
    } catch {
      // user cancelled — fall through to download
    }
  }
  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${opts.filename}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return "downloaded";
}

// ── Internals ──────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

const STYLE_PROPS = [
  "color", "background-color", "background", "background-image",
  "font-family", "font-size", "font-weight", "font-style",
  "letter-spacing", "line-height", "text-align", "text-decoration", "text-transform",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "border", "border-radius", "border-top", "border-right", "border-bottom", "border-left",
  "border-color", "border-style", "border-width",
  "display", "flex-direction", "align-items", "justify-content", "gap",
  "width", "height", "max-width", "min-height",
  "box-shadow", "opacity",
];

function inlineStyles(source: Element, target: Element): void {
  const sourceEls = [source, ...Array.from(source.querySelectorAll("*"))];
  const targetEls = [target, ...Array.from(target.querySelectorAll("*"))];
  for (let i = 0; i < sourceEls.length; i++) {
    const s = sourceEls[i] as HTMLElement;
    const t = targetEls[i] as HTMLElement | undefined;
    if (!t || !(s instanceof HTMLElement) || !(t instanceof HTMLElement)) continue;
    const cs = window.getComputedStyle(s);
    let css = "";
    for (const prop of STYLE_PROPS) {
      const val = cs.getPropertyValue(prop);
      if (val) css += `${prop}:${val};`;
    }
    t.setAttribute("style", css);
  }
}
