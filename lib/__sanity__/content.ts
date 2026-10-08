/**
 * Sanity checks for the admin content pipeline — not a real test runner;
 * runs as part of `npm test`.
 *
 * Covers: versioned saves + backups (content-store, on a temp file store),
 * gallery upload rules, Studio text overrides, JSON-LD escaping.
 * Sets process.exitCode = 1 on any mismatch.
 */

import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  BACKUPS_KEPT,
  ContentConflictError,
  NO_VERSION,
  fileContentStore,
  parseContentDocument,
  saveContentDocument,
  snapshotContentDocument,
  withoutPrivateKeys,
} from "../content-store";
import { galleryExtension, isGalleryImagePathname } from "../gallery";
import { STUDIO_TOOL_CARDS, studioOverridesFrom, studioToolTexts, type StudioToolTexts } from "../data/studio-tools";
import { jsonLd } from "../seo/json-ld";

function eq(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    console.error(`FAIL ${label}\n  expected: ${e}\n  actual:   ${a}`);
    process.exitCode = 1;
  } else {
    console.log(`OK   ${label}`);
  }
}

async function conflicts(fn: () => Promise<unknown>): Promise<boolean> {
  try {
    await fn();
    return false;
  } catch (err) {
    return err instanceof ContentConflictError;
  }
}

async function contentStore() {
  const dir = mkdtempSync(path.join(tmpdir(), "ellen-content-"));
  const store = fileContentStore(dir);
  const backupsDir = path.join(dir, "site-content-backups");
  const backups = () => {
    try { return readdirSync(backupsDir).sort(); } catch { return []; }
  };
  const t0 = Date.parse("2026-10-07T10:00:00Z");
  const at = (min: number) => new Date(t0 + min * 60_000);
  const doc = async () => JSON.parse((await store.read())!.text);

  eq("empty store reads null", await store.read(), null);

  const v1 = (await saveContentDocument(store, NO_VERSION, { faq_uk: [1], _meta: { injected: true } }, at(0))).version;
  eq("first save: nothing to back up", backups().length, 0);
  eq("client _meta ignored", (await doc())._meta, { saved_at: at(0).toISOString(), backup_at: null });
  eq("returned version = stored version", (await store.read())!.etag, v1);

  const v2 = (await saveContentDocument(store, v1, { faq_uk: [2] }, at(1))).version;
  eq("2nd save backs up the previous version", JSON.parse(readFileSync(path.join(backupsDir, backups()[0]), "utf8")).faq_uk, [1]);

  const v3 = (await saveContentDocument(store, v2, { faq_uk: [3] }, at(5))).version;
  eq("save within 10 min: no extra backup", backups().length, 1);

  eq("stale version → conflict", await conflicts(() => saveContentDocument(store, v1, { faq_uk: [999] }, at(6))), true);
  eq("conflict leaves the document untouched", (await doc()).faq_uk, [3]);
  eq("'none' on an existing document → conflict", await conflicts(() => saveContentDocument(store, NO_VERSION, { faq_uk: [998] }, at(6))), true);

  const v4 = (await saveContentDocument(store, v3, { faq_uk: [4] }, at(7), { forceBackup: true })).version;
  eq("forced backup (restore/import) ignores the 10-min cadence", backups().length, 2);

  await snapshotContentDocument(store, at(8));
  eq("snapshot copies the current version", backups().length, 3);

  let v = v4;
  for (let i = 0; i < 35; i++) v = (await saveContentDocument(store, v, { faq_uk: [100 + i] }, at(30 + i * 11))).version;
  eq(`retention keeps the newest ${BACKUPS_KEPT}`, backups().length, BACKUPS_KEPT);

  const list = await store.listBackups();
  eq("listBackups: newest first", list[0].at >= list[list.length - 1].at, true);
  eq("readBackup returns a stored copy", JSON.parse((await store.readBackup(list[0].id))!).faq_uk, [133]);
  eq("readBackup rejects path tricks", await store.readBackup("../site-content.json"), null);

  writeFileSync(path.join(dir, "site-content.json"), "{corrupt", "utf8");
  await saveContentDocument(store, (await store.read())!.etag, { faq_uk: [5] }, at(900));
  eq("corrupt document can be replaced", (await doc()).faq_uk, [5]);

  eq("public view drops ai_prompts and _meta", withoutPrivateKeys({ a: 1, ai_prompts: {}, _meta: {} }), { a: 1 });
  let rejected = 0;
  for (const bad of ["[]", "null", "42"]) {
    try { parseContentDocument(bad); } catch { rejected++; }
  }
  eq("non-object documents rejected", rejected, 3);
}

function gallery() {
  eq("jpeg allowed", galleryExtension("image/jpeg"), "jpg");
  eq("svg rejected", galleryExtension("image/svg+xml"), null);
  eq("heic rejected", galleryExtension("image/heic"), null);
  eq("gallery image path ok", isGalleryImagePathname("gallery/1.jpg"), true);
  eq("meta file protected", isGalleryImagePathname("gallery-meta.json"), false);
}

function studio() {
  const daily = STUDIO_TOOL_CARDS[0];
  eq("8 Studio tools", STUDIO_TOOL_CARDS.length, 8);
  eq("no override → default text", studioToolTexts(daily, null).title_uk, daily.title_uk);
  const ov = { id: daily.id, title_uk: "Нова назва", title_ru: "", title_en: "", desc_uk: "", desc_ru: "", desc_en: "" };
  eq("override wins, empty fields fall back", studioToolTexts(daily, [ov]).title_ru, daily.title_ru);
  const texts: Record<string, StudioToolTexts> = {};
  for (const c of STUDIO_TOOL_CARDS) texts[c.id] = studioToolTexts(c, null);
  eq("unchanged texts → nothing stored", studioOverridesFrom(texts), []);
  texts[daily.id] = { ...texts[daily.id], title_uk: "Нова назва" };
  eq("changed tool → one override", studioOverridesFrom(texts).map((o) => o.id), [daily.id]);
}

function seo() {
  const out = jsonLd({ a: "</script><script>alert(1)</script>" }).__html;
  eq("JSON-LD: no raw '<'", out.includes("<"), false);
  eq("JSON-LD: same data after parsing", JSON.parse(out).a, "</script><script>alert(1)</script>");
}

(async () => {
  await contentStore();
  gallery();
  studio();
  seo();
  console.log("\ncontent sanity checks done");
})();
