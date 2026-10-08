"use client";

/** Drag-to-position 3:4 crop for the profile photo (canvas → JPEG). */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { buttonVariants } from "./ui";

const CROP_W = 300;
const CROP_H = 400;

export default function PhotoCropper({
  file,
  onConfirm,
  onCancel,
}: {
  file: File;
  onConfirm: (cropped: File) => void;
  onCancel: () => void;
}) {
  // One object URL per file, released when the file changes or on unmount.
  const imgSrc = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(imgSrc), [imgSrc]);
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNat({ w: nw, h: nh });
    const s = Math.max(CROP_W / nw, CROP_H / nh);
    setScale(s);
    setOffset({ x: -(nw * s - CROP_W) / 2, y: -(nh * s - CROP_H) / 2 });
  };

  const clamp = useCallback((ox: number, oy: number, s: number) => ({
    x: Math.min(0, Math.max(ox, -(nat.w * s - CROP_W))),
    y: Math.min(0, Math.max(oy, -(nat.h * s - CROP_H))),
  }), [nat]);

  const startDrag = (mx: number, my: number) => {
    setDragging(true);
    drag.current = { mx, my, ox: offset.x, oy: offset.y };
  };
  const moveDrag = (mx: number, my: number) => {
    if (!dragging) return;
    setOffset(clamp(drag.current.ox + mx - drag.current.mx, drag.current.oy + my - drag.current.my, scale));
  };

  const handleConfirm = () => {
    if (!imgSrc || !nat.w) return;
    // Output at the natural resolution of the cropped area (capped at 2400px)
    const srcW = CROP_W / scale;
    const srcH = CROP_H / scale;
    const maxPx = 2400;
    const outScale = Math.min(1, maxPx / Math.max(srcW, srcH));
    const outW = Math.round(srcW * outScale);
    const outH = Math.round(srcH * outScale);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new window.Image();
    img.onload = () => {
      ctx.drawImage(img, -offset.x / scale, -offset.y / scale, srcW, srcH, 0, 0, outW, outH);
      canvas.toBlob((blob) => {
        if (!blob) return;
        onConfirm(new File([blob], "ellen-soul-taro-konsultant.jpg", { type: "image/jpeg" }));
      }, "image/jpeg", 0.95);
    };
    img.src = imgSrc;
  };

  const dw = nat.w * scale;
  const dh = nat.h * scale;

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-xs uppercase tracking-widest text-[var(--sand-400)]">Позиціонування</p>
        <p className="text-xs text-[var(--muted)]">Затисніть і перетягніть фото, щоб обрати потрібну область</p>
      </div>

      <div className="flex justify-center">
        <div
          style={{ width: CROP_W, height: CROP_H }}
          className="relative overflow-hidden rounded-2xl border border-[rgba(196,169,122,0.35)] cursor-grab active:cursor-grabbing select-none touch-none"
          onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
          onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchStart={(e) => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); }}
          onTouchMove={(e) => { const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }}
          onTouchEnd={() => setDragging(false)}
        >
          {imgSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt="crop"
              onLoad={onLoad}
              draggable={false}
              style={{ position: "absolute", width: dw || "auto", height: dh || "auto", left: offset.x, top: offset.y, userSelect: "none", pointerEvents: "none" }}
            />
          )}
          {/* Rule-of-thirds grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)",
            backgroundSize: `${CROP_W / 3}px ${CROP_H / 3}px`,
          }} />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className={buttonVariants({ variant: "secondary", className: "flex-1" })}>
          Скасувати
        </button>
        <button type="button" onClick={handleConfirm} className={buttonVariants({ className: "flex-1" })}>
          <Upload size={14} /> Завантажити
        </button>
      </div>
    </div>
  );
}
