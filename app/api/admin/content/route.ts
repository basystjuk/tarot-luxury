import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { contentDefaults } from "@/lib/content-defaults";
import {
  ContentConflictError,
  NO_VERSION,
  getContentStore,
  parseContentDocument,
  saveContentDocument,
} from "@/lib/content-store";
import { isPreviewFromRequest } from "@/lib/preview";
import { CONTENT_CACHE_TAG } from "@/lib/public-content";
import { isPreviewReadOnly, previewWriteBlocked } from "@/lib/admin-auth";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ellensoul2025";
/** Version (ETag) of the document the editor's changes are based on. */
const VERSION_HEADER = "x-content-version";
const NO_STORE = { "Cache-Control": "no-store" };

function authorised(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

// GET — the stored document for the admin editor, read past every cache,
// with its version. Unlike the public /api/content it fails loudly: an editor
// that silently fell back to defaults would overwrite the real site on save.
export async function GET(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = getContentStore();
  if (!store) {
    return NextResponse.json({ error: "Blob storage not configured" }, { status: 503 });
  }

  try {
    const current = await store.read();
    const stored = current ? parseContentDocument(current.text) : {};
    const { _meta, ...data } = stored as Record<string, unknown> & { _meta?: { saved_at?: string } };
    const defaults = contentDefaults();
    return NextResponse.json(
      {
        // Raw tools_enabled (no "code-disabled" override) — the editor must
        // save back what the owner chose, not the effective public state.
        content: {
          ...defaults,
          ...data,
          tools_enabled: { ...defaults.tools_enabled, ...((data.tools_enabled as object | undefined) ?? {}) },
        },
        version: current?.etag ?? NO_VERSION,
        savedAt: _meta?.saved_at ?? null,
        preview: isPreviewFromRequest(req),
        readOnly: isPreviewReadOnly(),
      },
      { headers: NO_STORE },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[admin/content] read failed:", message);
    return NextResponse.json({ error: "content_read_failed", message }, { status: 502, headers: NO_STORE });
  }
}

export async function POST(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = getContentStore();
  if (!store) {
    return NextResponse.json({ error: "Blob storage not configured" }, { status: 503 });
  }

  const blocked = previewWriteBlocked();
  if (blocked) return blocked;

  const baseVersion = req.headers.get(VERSION_HEADER);
  if (!baseVersion) {
    // An editor tab opened before versioned saves shipped: refuse rather than
    // overwrite blind; a reload picks up the current editor.
    return NextResponse.json(
      { error: "version_required", message: "Адмінку оновлено — перезавантажте сторінку, щоб зберігати зміни." },
      { status: 428 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const { version } = await saveContentDocument(store, baseVersion, body as Record<string, unknown>);
    // Statically rendered pages (FAQ/price markup) pick the change up on next visit.
    revalidateTag(CONTENT_CACHE_TAG, "max");
    return NextResponse.json({ ok: true, version });
  } catch (err) {
    if (err instanceof ContentConflictError) {
      return NextResponse.json(
        {
          error: "version_conflict",
          message: "Контент змінено в іншій вкладці або на іншому пристрої. Оновіть сторінку — ці зміни не збережено.",
        },
        { status: 409 },
      );
    }
    // Surface a useful diagnostic to both Vercel logs and the admin UI —
    // without it, all the user sees is "❌ Помилка" with no clue why.
    const name = err instanceof Error ? err.name : "UnknownError";
    const message = err instanceof Error ? err.message : String(err);
    console.error("[admin/content] save failed:", { name, message });
    return NextResponse.json({ error: "blob_write_failed", name, message }, { status: 500 });
  }
}
