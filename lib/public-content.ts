/**
 * Server-side readers of the site content document.
 *
 * - loadPublicContent(): what visitors may see — stored document merged over
 *   the built-in defaults, server-only keys removed, code-disabled tools kept
 *   off. Fail-soft: any storage problem yields the defaults.
 * - getCachedPublicContent(): the same, cached for statically rendered
 *   pages (JSON-LD in layouts). Admin saves expire it via CONTENT_CACHE_TAG.
 * - loadStoredContent(): the raw stored document (incl. AI prompts) for
 *   server code that needs private keys.
 */

import { unstable_cache } from "next/cache";
import { contentDefaults } from "./content-defaults";
import { getContentStore, parseContentDocument, withoutPrivateKeys } from "./content-store";
import { DEFAULT_TOOLS_ENABLED } from "./tools-config";

export const CONTENT_CACHE_TAG = "site-content";

type PublicContent = ReturnType<typeof contentDefaults> & Record<string, unknown>;

export async function loadStoredContent(): Promise<Record<string, unknown> | null> {
  const store = getContentStore();
  if (!store) return null;
  const current = await store.read();
  return current ? parseContentDocument(current.text) : null;
}

export async function loadPublicContent(): Promise<PublicContent> {
  let stored: Record<string, unknown> | null = null;
  try {
    stored = await loadStoredContent();
  } catch {
    stored = null;
  }
  if (!stored) return contentDefaults();
  const data = withoutPrivateKeys(stored);
  // Merge tools_enabled so newly added tool IDs always have a default.
  // Stored values normally win — but tools switched off in code
  // (DEFAULT_TOOLS_ENABLED === false) stay off, even if a stale stored entry
  // says otherwise: the safety net for tools that mustn't surface publicly.
  const storedTools = (data.tools_enabled ?? {}) as Partial<typeof DEFAULT_TOOLS_ENABLED>;
  const toolsEnabled = { ...DEFAULT_TOOLS_ENABLED, ...storedTools };
  for (const [id, defaultOn] of Object.entries(DEFAULT_TOOLS_ENABLED)) {
    if (defaultOn === false) toolsEnabled[id as keyof typeof DEFAULT_TOOLS_ENABLED] = false;
  }
  return { ...contentDefaults(), ...data, tools_enabled: toolsEnabled } as PublicContent;
}

export const getCachedPublicContent = unstable_cache(loadPublicContent, ["public-site-content"], {
  revalidate: 300,
  tags: [CONTENT_CACHE_TAG],
});
