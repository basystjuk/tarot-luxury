import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, isPreviewReadOnly } from "@/lib/admin-auth";
import { getContentStore } from "@/lib/content-store";

/**
 * GET /api/admin/status — which integrations are configured, for the admin
 * "System status" screen. Booleans only: no secret values ever leave here.
 * Plus the content document's last save and the newest saved copy.
 */
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const env = process.env;
  const has = (...keys: string[]) => keys.every((k) => Boolean(env[k]));
  const store = getContentStore();

  let content: { savedAt: string | null; backups: number; latestBackupAt: string | null; error?: string } = {
    savedAt: null,
    backups: 0,
    latestBackupAt: null,
  };
  if (store) {
    try {
      const [current, backups] = await Promise.all([store.read(), store.listBackups()]);
      let savedAt: string | null = null;
      if (current) {
        try {
          savedAt = (JSON.parse(current.text) as { _meta?: { saved_at?: string } })._meta?.saved_at ?? null;
        } catch {
          savedAt = null;
        }
      }
      content = { savedAt, backups: backups.length, latestBackupAt: backups[0]?.at ?? null };
    } catch (err) {
      content = { ...content, error: err instanceof Error ? err.message : String(err) };
    }
  }

  return NextResponse.json(
    {
      storage: store ? (env.LOCAL_CONTENT_DIR && env.NODE_ENV !== "production" ? "local" : "blob") : "none",
      readOnly: isPreviewReadOnly(),
      content,
      integrations: {
        supabase_admin: has("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"),
        telegram_bot: has("TELEGRAM_BOT_TOKEN"),
        telegram_webhook_secret: has("TELEGRAM_WEBHOOK_SECRET"),
        telegram_leads_chat: has("TELEGRAM_CHAT_IDS") || has("TELEGRAM_CHAT_ID"),
        cron_secret: has("CRON_SECRET"),
        groq_ai: has("GROQ_API_KEY"),
        youtube: has("YOUTUBE_API_KEY", "YOUTUBE_CHANNEL_ID"),
        web_push: has("VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"),
        posthog: has("NEXT_PUBLIC_POSTHOG_KEY"),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
