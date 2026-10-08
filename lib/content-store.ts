/**
 * Storage for the admin-editable site content document (`site-content.json`).
 *
 * One place to read and write the document, so every writer gets the same
 * guarantees:
 *   - Optimistic concurrency. A write carries the ETag of the version it was
 *     based on (`ifMatch`). If the document changed in the meantime — another
 *     tab, another device, or a stale CDN read — storage rejects the write
 *     (ContentConflictError) instead of silently overwriting newer content.
 *     Content and ETag always come from the same response, so a stale read
 *     can only ever cause a conflict, never a lost update.
 *   - Backups. Before overwriting, the previous version is copied to
 *     `site-content-backups/` at most once per BACKUP_EVERY_MS (so typing in
 *     the admin doesn't flood the store); the newest BACKUPS_KEPT are kept.
 *
 * Dev only: with LOCAL_CONTENT_DIR set and NODE_ENV !== "production" the
 * document lives on local disk instead of Vercel Blob, so admin saves can be
 * tested without touching the production store.
 */

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { BlobError, BlobPreconditionFailedError, del, get, list, put } from "@vercel/blob";

export const CONTENT_BLOB = "site-content.json";
const BACKUP_PREFIX = "site-content-backups/";
export const BACKUP_EVERY_MS = 10 * 60 * 1000;
export const BACKUPS_KEPT = 30;

/** Version label for "the document does not exist yet". */
export const NO_VERSION = "none";

/** Keys that never leave the server through the public content API. */
const PRIVATE_KEYS = ["ai_prompts", "_meta"];

export class ContentConflictError extends Error {
  constructor() {
    super("Site content changed since it was loaded");
    this.name = "ContentConflictError";
  }
}

export interface StoredContent {
  text: string;
  /** Storage version of exactly this text — pass it back to write(). */
  etag: string;
}

export interface BackupInfo {
  /** Opaque id — pass it back to readBackup(). */
  id: string;
  /** When the copy was taken (ISO). */
  at: string;
  size: number;
}

export interface ContentStore {
  /** Current document, or null if it has never been written. Throws on storage errors. */
  read(): Promise<StoredContent | null>;
  /** Writes the document only if its current version is `ifMatch` (null = it must not exist yet). Returns the new version. */
  write(text: string, ifMatch: string | null): Promise<string>;
  /** Keeps a copy of a previous version and prunes the oldest copies. */
  backup(text: string, at: Date): Promise<void>;
  /** Stored copies, newest first. */
  listBackups(): Promise<BackupInfo[]>;
  /** Text of one copy, or null if the id is unknown. */
  readBackup(id: string): Promise<string | null>;
}

const backupName = (at: Date) => `${at.toISOString().replace(/[:.]/g, "-")}.json`;
const byNewest = (a: BackupInfo, b: BackupInfo) => b.at.localeCompare(a.at);

const blobStore: ContentStore = {
  async read() {
    const res = await get(CONTENT_BLOB, { access: "public", useCache: false });
    if (!res || res.statusCode !== 200) return null;
    const text = await new Response(res.stream).text();
    // put() only sends ifMatch when it is non-empty — an empty ETag would turn
    // every later write into a blind overwrite, so treat it as a read failure.
    if (!res.blob.etag) throw new Error("Content blob response carried no ETag");
    return { text, etag: res.blob.etag };
  },
  async write(text, ifMatch) {
    try {
      const blob = await put(CONTENT_BLOB, text, {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
        ...(ifMatch ? { allowOverwrite: true, ifMatch } : { allowOverwrite: false }),
      });
      return blob.etag;
    } catch (err) {
      if (err instanceof BlobPreconditionFailedError) throw new ContentConflictError();
      // First write lost a race: the document appeared after we read "missing".
      if (!ifMatch && err instanceof BlobError && /already exists/i.test(err.message)) {
        throw new ContentConflictError();
      }
      throw err;
    }
  },
  async backup(text, at) {
    await put(`${BACKUP_PREFIX}${backupName(at)}`, text, {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
    });
    const { blobs } = await list({ prefix: BACKUP_PREFIX });
    const stale = blobs
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(BACKUPS_KEPT);
    if (stale.length > 0) await del(stale.map((b) => b.url));
  },
  async listBackups() {
    const { blobs } = await list({ prefix: BACKUP_PREFIX });
    return blobs
      .map((b) => ({ id: b.pathname, at: new Date(b.uploadedAt).toISOString(), size: b.size }))
      .sort(byNewest);
  },
  async readBackup(id) {
    // Only ever read from the backup folder — the id comes from the client.
    if (!id.startsWith(BACKUP_PREFIX) || id.includes("..")) return null;
    const res = await get(id, { access: "public", useCache: false });
    if (!res || res.statusCode !== 200) return null;
    return await new Response(res.stream).text();
  },
};

/** Dev-only store on local disk with the same version semantics as Blob. */
export function fileContentStore(dir: string): ContentStore {
  const file = path.join(dir, CONTENT_BLOB);
  const backups = path.join(dir, "site-content-backups");
  const etagOf = (text: string) => createHash("sha256").update(text).digest("hex").slice(0, 32);

  async function read(): Promise<StoredContent | null> {
    try {
      const text = await fs.readFile(file, "utf8");
      return { text, etag: etagOf(text) };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw err;
    }
  }

  return {
    read,
    async write(text, ifMatch) {
      const current = await read();
      if ((current?.etag ?? null) !== ifMatch) throw new ContentConflictError();
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(file, text, "utf8");
      return etagOf(text);
    },
    async backup(text, at) {
      await fs.mkdir(backups, { recursive: true });
      await fs.writeFile(path.join(backups, backupName(at)), text, "utf8");
      const names = (await fs.readdir(backups)).sort().reverse();
      await Promise.all(names.slice(BACKUPS_KEPT).map((n) => fs.unlink(path.join(backups, n))));
    },
    async listBackups() {
      let names: string[];
      try {
        names = await fs.readdir(backups);
      } catch {
        return [];
      }
      const infos = await Promise.all(names.filter((n) => n.endsWith(".json")).map(async (n) => {
        const st = await fs.stat(path.join(backups, n));
        // The name encodes when the copy was taken (ms precision); file mtimes
        // can tie when copies are made within the same second.
        const fromName = n.replace(/\.json$/, "").replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/, "T$1:$2:$3.$4Z");
        const at = Number.isNaN(Date.parse(fromName)) ? st.mtime.toISOString() : new Date(fromName).toISOString();
        return { id: n, at, size: st.size };
      }));
      return infos.sort(byNewest);
    },
    async readBackup(id) {
      if (!/^[\w.-]+\.json$/.test(id)) return null;
      try {
        return await fs.readFile(path.join(backups, id), "utf8");
      } catch {
        return null;
      }
    },
  };
}

/** The configured store, or null when content storage isn't set up. */
export function getContentStore(): ContentStore | null {
  const localDir = process.env.LOCAL_CONTENT_DIR;
  if (localDir && process.env.NODE_ENV !== "production") return fileContentStore(localDir);
  if (process.env.BLOB_READ_WRITE_TOKEN) return blobStore;
  return null;
}

/** Parses the stored document; anything but a JSON object is treated as corrupt. */
export function parseContentDocument(text: string): Record<string, unknown> {
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Site content is not a JSON object");
  }
  return value as Record<string, unknown>;
}

/** The document without server-only keys (AI prompts, save metadata). */
export function withoutPrivateKeys(doc: Record<string, unknown>): Record<string, unknown> {
  const out = { ...doc };
  for (const key of PRIVATE_KEYS) delete out[key];
  return out;
}

/** Takes a copy of the current document right now (e.g. before an import). */
export async function snapshotContentDocument(store: ContentStore, now: Date = new Date()): Promise<boolean> {
  const current = await store.read();
  if (!current) return false;
  await store.backup(current.text, now);
  return true;
}

function lastBackupAt(text: string): string | null {
  try {
    const meta = (JSON.parse(text) as { _meta?: { backup_at?: unknown } })?._meta;
    return typeof meta?.backup_at === "string" ? meta.backup_at : null;
  } catch {
    return null;
  }
}

/**
 * Writes a new version of the document on top of `baseVersion` (the ETag the
 * editor loaded, or NO_VERSION for a brand-new store). `_meta` is owned by the
 * server and never taken from the client. Throws ContentConflictError when the
 * document changed after the editor loaded it.
 */
export async function saveContentDocument(
  store: ContentStore,
  baseVersion: string,
  doc: Record<string, unknown>,
  now: Date = new Date(),
  { forceBackup = false }: { forceBackup?: boolean } = {},
): Promise<{ version: string }> {
  const current = await store.read();
  let backupAt: string | null = null;
  if (current) {
    backupAt = lastBackupAt(current.text);
    const sinceBackup = backupAt ? now.getTime() - Date.parse(backupAt) : NaN;
    // NaN (no or unreadable timestamp) also lands here — better one copy too many.
    // Restores and imports replace everything, so they always keep a copy first.
    if (forceBackup || !(sinceBackup < BACKUP_EVERY_MS)) {
      await store.backup(current.text, now);
      backupAt = now.toISOString();
    }
  }
  const content = { ...doc };
  delete content._meta;
  const text = JSON.stringify({ ...content, _meta: { saved_at: now.toISOString(), backup_at: backupAt } });
  const version = await store.write(text, baseVersion === NO_VERSION ? null : baseVersion);
  return { version };
}
