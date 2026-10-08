"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import PhotoCropper from "@/components/admin/PhotoCropper";
import { adminFetch, responseError } from "@/components/admin/admin-fetch";
import { formatBytes } from "@/components/admin/format";
import { MAX_UPLOAD_BYTES, compressImage } from "@/components/admin/image";
import { Badge, Button, Card, EmptyState, IconButton, Notice, PageHeader, Skeleton, useConfirm, useToast } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Position = "top" | "center" | "bottom";
type GalleryItem = { url: string; pathname: string; size: number; uploadedAt: string; position: Position };

const POSITIONS: { id: Position; label: string }[] = [
  { id: "top", label: "Верх" },
  { id: "center", label: "Центр" },
  { id: "bottom", label: "Низ" },
];
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";

function Gallery() {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/gallery");
      if (!res.ok) throw new Error(await responseError(res));
      setItems((await res.json()).items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setItems([]);
    }
  }, []);

  useEffect(() => {
    // Deferred so state updates happen after the effect, not inside it.
    void Promise.resolve().then(load);
  }, [load]);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    let done = 0;
    for (const original of Array.from(files)) {
      setUploading(`${original.name} (${done + 1}/${files.length})`);
      try {
        const file = await compressImage(original);
        if (file.size > MAX_UPLOAD_BYTES) throw new Error(`Файл завеликий навіть після стиснення (${formatBytes(file.size)})`);
        const fd = new FormData();
        fd.append("file", file);
        const res = await adminFetch("/api/admin/gallery", { method: "POST", body: fd });
        if (!res.ok) throw new Error(await responseError(res));
        done++;
      } catch (e) {
        toast({ tone: "danger", title: `Не завантажено: ${original.name}`, description: e instanceof Error ? e.message : String(e) });
      }
    }
    setUploading(null);
    if (inputRef.current) inputRef.current.value = "";
    if (done > 0) toast({ title: done === 1 ? "Фото додано" : `Додано фото: ${done}`, description: "На сайті зʼявиться протягом хвилини." });
    await load();
  };

  const setPosition = async (item: GalleryItem, position: Position) => {
    const prev = items;
    setItems((all) => all?.map((i) => (i.pathname === item.pathname ? { ...i, position } : i)) ?? null);
    const res = await adminFetch("/api/admin/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathname: item.pathname, position }),
    }).catch(() => null);
    if (!res?.ok) {
      setItems(prev);
      toast({ tone: "danger", title: "Позицію не збережено", description: res ? await responseError(res) : "Мережа недоступна" });
    }
  };

  const remove = async (item: GalleryItem) => {
    const ok = await confirm({
      title: "Видалити фото з галереї?",
      description: "Фото буде видалено назавжди — відновити його з адмінки не вийде.",
      confirmLabel: "Видалити",
    });
    if (!ok) return;
    const res = await adminFetch(`/api/admin/gallery?pathname=${encodeURIComponent(item.pathname)}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      setItems((all) => all?.filter((i) => i.pathname !== item.pathname) ?? null);
      toast({ title: "Фото видалено" });
    } else {
      toast({ tone: "danger", title: "Не вдалося видалити", description: res ? await responseError(res) : "Мережа недоступна" });
    }
  };

  return (
    <Card
      title="Галерея на сторінці «Про мене»"
      description="Горизонтальна стрічка фото. Великі фото з телефона автоматично зменшуються перед завантаженням."
      actions={
        <>
          <input ref={inputRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => void upload(e.target.files)} />
          <Button onClick={() => inputRef.current?.click()} loading={uploading !== null}>
            {uploading === null && <ImagePlus size={16} aria-hidden />} Додати фото
          </Button>
        </>
      }
    >
      {uploading && <p className="mb-3 text-sm text-[var(--muted)]" role="status">Завантаження: {uploading}…</p>}
      {error && (
        <Notice tone="danger" className="mb-4">
          Галерею не вдалося завантажити: {error}
        </Notice>
      )}
      {items === null ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-[3/4]" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={<ImagePlus size={32} />} title="У галереї ще немає фото">
          Натисніть «Додати фото» — можна обрати кілька одразу.
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.pathname} className="flex flex-col gap-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[var(--sand-200)] bg-[var(--cream-100)]">
                <Image
                  src={item.url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 200px, 45vw"
                  className={cn("object-cover", item.position === "center" ? "object-center" : item.position === "bottom" ? "object-bottom" : "object-top")}
                />
                <div className="absolute right-1.5 top-1.5">
                  <IconButton label="Видалити фото" variant="secondary" onClick={() => void remove(item)} className="bg-white/90">
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </div>
              <div role="radiogroup" aria-label="Яку частину фото показувати" className="grid grid-cols-3 gap-1">
                {POSITIONS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={item.position === p.id}
                    onClick={() => void setPosition(item, p.id)}
                    className={cn(
                      "min-h-9 rounded-lg text-xs transition-colors",
                      item.position === p.id ? "bg-[var(--gold-600)] text-white" : "bg-[var(--sand-100)] text-[var(--warm-600)] hover:bg-[var(--sand-200)]",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-[var(--muted)]">{formatBytes(item.size)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ProfilePhoto() {
  const toast = useToast();
  const [current, setCurrent] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/photo")
      .then((r) => r.json())
      .then((d) => setCurrent(d.url ?? null))
      .catch(() => setCurrent(null));
  }, []);

  const upload = async (cropped: File) => {
    setFile(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", cropped);
      const res = await adminFetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await responseError(res));
      setCurrent((await res.json()).url);
      toast({ title: "Фото профілю оновлено" });
    } catch (e) {
      toast({ tone: "danger", title: "Фото не завантажено", description: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title="Фото профілю"
      actions={<Badge tone="muted">Не відображається на сайті</Badge>}
      className="mt-6"
    >
      <Notice tone="warning" className="mb-5">
        Зараз сайт показує статичне фото (на головній і «Про мене») — так сторінки відкриваються швидше.
        Завантажене тут фото на сайті не зʼявиться, доки не вирішено, де саме його використовувати.
      </Notice>
      <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[var(--sand-200)] bg-[var(--cream-100)]">
          {current && <Image src={current} alt="Поточне фото профілю" fill sizes="200px" className="object-cover object-top" unoptimized />}
        </div>
        <div>
          {file ? (
            <PhotoCropper file={file} onConfirm={(f) => void upload(f)} onCancel={() => setFile(null)} />
          ) : (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                  e.target.value = "";
                }}
              />
              <Button variant="secondary" loading={busy} onClick={() => inputRef.current?.click()}>
                {!busy && <Upload size={16} aria-hidden />} Обрати нове фото
              </Button>
              <p className="mt-2 text-xs text-[var(--muted)]">Після вибору можна перетягнути фото, щоб обрати кадр.</p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function MediaPage() {
  return (
    <>
      <PageHeader title="Галерея та фото" description="Дії з фото застосовуються одразу — кнопка «Зберегти» для них не потрібна." siteHref="/uk/about" />
      <Gallery />
      <ProfilePhoto />
    </>
  );
}
