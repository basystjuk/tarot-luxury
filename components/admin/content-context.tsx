"use client";

/**
 * The site content document as the admin edits it — one copy for all
 * sections, so edits survive moving between pages and are saved together.
 *
 * Save model (same for every section): edits are local until "Зберегти"
 * (save bar or Ctrl/Cmd+S); the save carries the version (ETag) the editor
 * loaded, so a change made elsewhere meanwhile comes back as a conflict
 * instead of being overwritten. Leaving with unsaved edits asks first.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { validateContent, type ContentIssue } from "@/lib/content-validation";
import { adminFetch, responseError } from "./admin-fetch";
import { useToast } from "./ui";

export type SiteDoc = Record<string, unknown>;
export type LoadStatus = "loading" | "ready" | "error" | "conflict";

interface AdminContentValue {
  status: LoadStatus;
  loadError: string | null;
  doc: SiteDoc | null;
  dirty: boolean;
  saving: boolean;
  saveError: string | null;
  /** When the stored document was last saved (from the server). */
  savedAt: string | null;
  /** Visitor preview mode is on in this browser. */
  preview: boolean;
  /** Preview deployment sharing production storage — saving is disabled. */
  readOnly: boolean;
  issues: ContentIssue[];
  set: (key: string, value: unknown) => void;
  save: () => Promise<boolean>;
  discard: () => void;
  reload: () => Promise<void>;
  /** Replace everything (import) — becomes unsaved edits to review. */
  replaceAll: (next: SiteDoc) => void;
  /** Version of the loaded document (for restore requests). */
  version: () => string | null;
}

const Ctx = createContext<AdminContentValue | null>(null);

/** The stored document with its version, straight from storage. */
async function fetchContent() {
  const res = await adminFetch("/api/admin/content");
  if (!res.ok) throw new Error(await responseError(res));
  return res.json();
}

export function useAdminContent(): AdminContentValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdminContent must be used inside AdminContentProvider");
  return v;
}

/** Typed read of one top-level key with a fallback. */
export function useContentKey<T>(key: string, fallback: T): [T, (value: T) => void] {
  const { doc, set } = useAdminContent();
  const value = (doc?.[key] as T | undefined) ?? fallback;
  return [value, (v: T) => set(key, v)];
}

export function AdminContentProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [doc, setDoc] = useState<SiteDoc | null>(null);
  const [baseline, setBaseline] = useState<SiteDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const versionRef = useRef<string | null>(null);

  const dirty = useMemo(
    () => doc !== null && baseline !== null && JSON.stringify(doc) !== JSON.stringify(baseline),
    [doc, baseline],
  );
  const issues = useMemo(() => (doc ? validateContent(doc) : []), [doc]);

  // Latest values for listeners registered once (updated after each commit).
  const live = useRef({ doc, dirty, status, saving, issues, readOnly });
  useEffect(() => {
    live.current = { doc, dirty, status, saving, issues, readOnly };
  });

  const apply = useCallback((j: { content: SiteDoc; version: string; savedAt?: string | null; preview?: boolean; readOnly?: boolean }) => {
    versionRef.current = j.version;
    setDoc(j.content);
    setBaseline(j.content);
    setSavedAt(j.savedAt ?? null);
    setPreview(Boolean(j.preview));
    setReadOnly(Boolean(j.readOnly));
    setLoadError(null);
    setSaveError(null);
    setStatus("ready");
  }, []);
  const fail = useCallback((e: unknown) => {
    setLoadError(e instanceof Error ? e.message : String(e));
    setStatus("error");
  }, []);

  const reload = useCallback(() => fetchContent().then(apply, fail), [apply, fail]);

  useEffect(() => {
    fetchContent().then(apply, fail);
  }, [apply, fail]);

  const set = useCallback((key: string, value: unknown) => {
    setDoc((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    const { doc: current, status: st, saving: busy, issues: problems, readOnly: ro } = live.current;
    if (!current || st !== "ready" || busy) return false;
    if (ro) {
      toast({ tone: "info", title: "Це прев'ю — зберігати вимкнено", description: "Сховище спільне з живим сайтом. Зміни робіть на основному сайті." });
      return false;
    }
    const errors = problems.filter((i) => i.severity === "error");
    if (errors.length > 0) {
      toast({ tone: "danger", title: "Не збережено", description: errors[0].message + (errors.length > 1 ? ` (і ще ${errors.length - 1})` : "") });
      return false;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await adminFetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-content-version": versionRef.current ?? "none" },
        body: JSON.stringify(current),
      });
      if (res.ok) {
        versionRef.current = (await res.json()).version;
        // Baseline = what was sent; edits typed during the save stay unsaved.
        setBaseline(current);
        setSavedAt(new Date().toISOString());
        toast({ title: "Збережено", description: "Зміни вже на сайті (кеш оновлюється до хвилини)." });
        return true;
      }
      const detail = await responseError(res);
      if (res.status === 409) setStatus("conflict");
      setSaveError(detail);
      toast({ tone: "danger", title: "Не вдалося зберегти", description: detail });
      return false;
    } catch (e) {
      const msg = `Мережа: ${e instanceof Error ? e.message : String(e)}`;
      setSaveError(msg);
      toast({ tone: "danger", title: "Не вдалося зберегти", description: msg });
      return false;
    } finally {
      setSaving(false);
    }
  }, [toast]);

  const discard = useCallback(() => {
    setDoc(baseline);
    setSaveError(null);
  }, [baseline]);

  const replaceAll = useCallback((next: SiteDoc) => setDoc({ ...next }), []);
  const version = useCallback(() => versionRef.current, []);

  // Ctrl/Cmd+S saves; leaving with unsaved edits asks first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (live.current.dirty) void save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (!live.current.dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [save]);

  const value: AdminContentValue = {
    status, loadError, doc, dirty, saving, saveError, savedAt, preview, readOnly, issues,
    set, save, discard, reload, replaceAll, version,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
