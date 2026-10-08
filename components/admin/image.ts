/**
 * Shrinks a photo in the browser before upload. Phone photos (4–10 MB) are
 * over the server's request-body limit, so they're resized to ≤ 2400px on the
 * long side and re-encoded as JPEG. GIFs stay as-is (animation).
 */

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export async function compressImage(file: File, maxSide = 2400, quality = 0.86): Promise<File> {
  if (file.type === "image/gif") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // the browser can't decode it (e.g. HEIC) — the server explains
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const small = file.size <= 1.5 * 1024 * 1024 && (file.type === "image/jpeg" || file.type === "image/webp");
  if (scale === 1 && small) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.fillStyle = "#FDFBF7"; // JPEG has no transparency — use the site background
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}
