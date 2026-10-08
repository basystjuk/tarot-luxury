import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminRequest, previewWriteBlocked } from "@/lib/admin-auth";
import {
  ContentConflictError,
  getContentStore,
  parseContentDocument,
  saveContentDocument,
  snapshotContentDocument,
  withoutPrivateKeys,
} from "@/lib/content-store";
import { CONTENT_CACHE_TAG } from "@/lib/public-content";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * Version history of the site content document.
 *
 *   GET                — list of saved copies, newest first
 *   GET ?id=<copy id>  — one copy (for preview before restoring)
 *   POST { action: "restore", id }  — make that copy the live version
 *                                     (current version is copied first)
 *   POST { action: "snapshot" }     — copy the current version now
 */
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const store = getContentStore();
  if (!store) return NextResponse.json({ error: "Blob storage not configured" }, { status: 503 });

  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ backups: await store.listBackups() }, { headers: NO_STORE });
    }
    const text = await store.readBackup(id);
    if (text === null) return NextResponse.json({ error: "not_found" }, { status: 404, headers: NO_STORE });
    const doc = parseContentDocument(text);
    const meta = doc._meta as { saved_at?: string } | undefined;
    return NextResponse.json(
      { id, savedAt: meta?.saved_at ?? null, content: withoutPrivateKeys(doc), aiPrompts: doc.ai_prompts ?? null },
      { headers: NO_STORE },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[admin/content/history] read failed:", message);
    return NextResponse.json({ error: "history_read_failed", message }, { status: 502, headers: NO_STORE });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const blocked = previewWriteBlocked();
  if (blocked) return blocked;
  const store = getContentStore();
  if (!store) return NextResponse.json({ error: "Blob storage not configured" }, { status: 503 });

  let body: { action?: string; id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body.action === "snapshot") {
      const saved = await snapshotContentDocument(store);
      return NextResponse.json({ ok: true, saved });
    }

    if (body.action === "restore" && typeof body.id === "string") {
      const baseVersion = req.headers.get("x-content-version");
      if (!baseVersion) {
        return NextResponse.json(
          { error: "version_required", message: "Адмінку оновлено — перезавантажте сторінку." },
          { status: 428 },
        );
      }
      const text = await store.readBackup(body.id);
      if (text === null) return NextResponse.json({ error: "not_found" }, { status: 404 });
      const doc = parseContentDocument(text);
      const { version } = await saveContentDocument(store, baseVersion, doc, new Date(), { forceBackup: true });
      revalidateTag(CONTENT_CACHE_TAG, "max");
      return NextResponse.json({ ok: true, version });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    if (err instanceof ContentConflictError) {
      return NextResponse.json(
        {
          error: "version_conflict",
          message: "Контент змінено в іншій вкладці або на іншому пристрої. Оновіть сторінку і спробуйте ще раз.",
        },
        { status: 409 },
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("[admin/content/history] action failed:", message);
    return NextResponse.json({ error: "history_action_failed", message }, { status: 500 });
  }
}
