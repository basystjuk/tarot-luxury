/**
 * Gallery upload rules for the admin gallery API.
 *
 * Only raster formats every browser can display are accepted, and the stored
 * extension comes from the validated MIME type — never from the client's
 * filename. SVG (can carry script) and HEIC (Chrome/Firefox can't render it)
 * are rejected so a gallery tile never ends up unsafe or broken.
 */

export const GALLERY_PREFIX = "gallery/";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/** Extension for an accepted image MIME type, or null if the type is not allowed. */
export function galleryExtension(mime: string): string | null {
  return EXT_BY_TYPE[mime.toLowerCase()] ?? null;
}

/** True only for gallery image pathnames (`gallery/<name>`) — never the meta file or other blobs. */
export function isGalleryImagePathname(pathname: string): boolean {
  return pathname.startsWith(GALLERY_PREFIX) && pathname.length > GALLERY_PREFIX.length;
}
