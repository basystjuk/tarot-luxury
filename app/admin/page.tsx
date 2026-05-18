"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Plus, Trash2, Eye, EyeOff, Save, LogOut, Copy, Check, Star, Upload, X } from "lucide-react";
import type { Testimonial } from "@/lib/data/testimonials";

const ADMIN_PASSWORD = "ellensoul2025";
const STORAGE_KEY = "ellen_admin_testimonials";
const DEFAULT_PHOTO = "/images/ellen-soul-taro-konsultant.jpg";

// ─── Auth Screen ────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "1");
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1512] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-[#C4A97A] text-xs tracking-[0.2em] uppercase mb-2">Адмін-панель</p>
          <h1
            className="text-4xl text-white"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
          >
            Ellen Soul
          </h1>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            placeholder="Пароль"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none transition-colors ${
              error
                ? "border-red-400/60 bg-red-400/5"
                : "border-white/15 focus:border-[#C4A97A]"
            }`}
          />
          {error && (
            <p className="text-red-400 text-sm text-center">Невірний пароль</p>
          )}
          <button
            type="submit"
            className="w-full bg-[#D4A853] hover:bg-[#C4983A] text-white py-3 rounded-xl transition-colors font-medium"
          >
            Увійти
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Star Picker ────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star
            size={18}
            fill={n <= value ? "#D4A853" : "none"}
            className={n <= value ? "text-[#D4A853]" : "text-[#7A6A58]"}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Testimonial Form ────────────────────────────────────────────────────────
function TestimonialForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Testimonial>;
  onSave: (t: Testimonial) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Testimonial>({
    id: initial?.id ?? Date.now().toString(),
    text_uk: initial?.text_uk ?? "",
    text_ru: initial?.text_ru ?? "",
    name: initial?.name ?? "",
    city: initial?.city ?? "",
    rating: initial?.rating ?? 5,
    visible: initial?.visible ?? true,
  });

  return (
    <div className="bg-[#2A1F18] rounded-2xl p-6 border border-[rgba(196,169,122,0.2)] space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-[#C4A97A] tracking-widest uppercase block mb-2">Текст (УКР)</label>
          <textarea
            rows={4}
            className="admin-input w-full resize-none"
            placeholder="Текст відгуку українською..."
            value={form.text_uk}
            onChange={(e) => setForm({ ...form, text_uk: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-[#C4A97A] tracking-widest uppercase block mb-2">Текст (РУС)</label>
          <textarea
            rows={4}
            className="admin-input w-full resize-none"
            placeholder="Текст отзыва на русском..."
            value={form.text_ru}
            onChange={(e) => setForm({ ...form, text_ru: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-[#C4A97A] tracking-widest uppercase block mb-2">Ім'я</label>
          <input
            className="admin-input w-full"
            placeholder="Марія К."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-[#C4A97A] tracking-widest uppercase block mb-2">Місто</label>
          <input
            className="admin-input w-full"
            placeholder="Київ"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs text-[#C4A97A] tracking-widest uppercase block mb-2">Рейтинг</label>
          <StarPicker value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 rounded-xl border border-white/15 text-white/50 hover:text-white/80 transition-colors text-sm"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={() => {
              if (!form.text_uk.trim() && !form.text_ru.trim()) return;
              if (!form.name.trim()) return;
              onSave(form);
            }}
            className="px-5 py-2 rounded-xl bg-[#D4A853] hover:bg-[#C4983A] text-white transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Save size={14} />
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Photo Cropper ────────────────────────────────────────────────────────────
const CROP_W = 300;
const CROP_H = 400;

function PhotoCropper({
  file,
  onConfirm,
  onCancel,
}: {
  file: File;
  onConfirm: (cropped: File) => void;
  onCancel: () => void;
}) {
  const [imgSrc, setImgSrc] = useState("");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNat({ w: nw, h: nh });
    const s = Math.max(CROP_W / nw, CROP_H / nh);
    setScale(s);
    setOffset({ x: -(nw * s - CROP_W) / 2, y: -(nh * s - CROP_H) / 2 });
  };

  const clamp = useCallback((ox: number, oy: number, s: number) => ({
    x: Math.min(0, Math.max(ox, -(nat.w * s - CROP_W))),
    y: Math.min(0, Math.max(oy, -(nat.h * s - CROP_H))),
  }), [nat]);

  const startDrag = (mx: number, my: number) => {
    setDragging(true);
    drag.current = { mx, my, ox: offset.x, oy: offset.y };
  };
  const moveDrag = (mx: number, my: number) => {
    if (!dragging) return;
    setOffset(clamp(drag.current.ox + mx - drag.current.mx, drag.current.oy + my - drag.current.my, scale));
  };

  const handleConfirm = () => {
    if (!imgSrc || !nat.w) return;
    // Output at the natural resolution of the cropped area (capped at 2400px)
    const srcW = CROP_W / scale;
    const srcH = CROP_H / scale;
    const maxPx = 2400;
    const outScale = Math.min(1, maxPx / Math.max(srcW, srcH));
    const outW = Math.round(srcW * outScale);
    const outH = Math.round(srcH * outScale);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new window.Image();
    img.onload = () => {
      ctx.drawImage(img, -offset.x / scale, -offset.y / scale, srcW, srcH, 0, 0, outW, outH);
      canvas.toBlob((blob) => {
        if (!blob) return;
        onConfirm(new File([blob], "ellen-soul-taro-konsultant.jpg", { type: "image/jpeg" }));
      }, "image/jpeg", 0.95);
    };
    img.src = imgSrc;
  };

  const dw = nat.w * scale;
  const dh = nat.h * scale;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-1">Позиціонування</p>
        <p className="text-white/35 text-xs">Затисни і переміщуй фото — обери потрібну область</p>
      </div>

      <div className="flex justify-center">
        <div
          style={{ width: CROP_W, height: CROP_H }}
          className="relative overflow-hidden rounded-2xl border border-[rgba(196,169,122,0.35)] cursor-grab active:cursor-grabbing select-none touch-none"
          onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
          onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchStart={(e) => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); }}
          onTouchMove={(e) => { const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }}
          onTouchEnd={() => setDragging(false)}
        >
          {imgSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc}
              alt="crop"
              onLoad={onLoad}
              draggable={false}
              style={{ position: "absolute", width: dw || "auto", height: dh || "auto", left: offset.x, top: offset.y, userSelect: "none", pointerEvents: "none" }}
            />
          )}
          {/* Rule-of-thirds grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)",
            backgroundSize: `${CROP_W / 3}px ${CROP_H / 3}px`,
          }} />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-white/15 text-white/50 hover:text-white/80 transition-colors text-sm">
          Скасувати
        </button>
        <button onClick={handleConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-[#D4A853] hover:bg-[#C4983A] text-white transition-colors text-sm font-medium flex items-center justify-center gap-2">
          <Upload size={14} /> Завантажити
        </button>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────
type UploadState = "idle" | "uploading" | "success" | "error";

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"photo" | "testimonials">("testimonials");

  // Photo upload state
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(DEFAULT_PHOTO);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadError, setUploadError] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setTestimonials(JSON.parse(saved)); } catch {}
    }
    // Load current photo from API (Vercel Blob or fallback)
    fetch("/api/photo")
      .then((r) => r.json())
      .then((d) => { if (d.url) setCurrentPhotoUrl(d.url); })
      .catch(() => {});
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Тільки зображення (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Файл занадто великий (макс. 5 МБ)");
      return;
    }
    setUploadError("");
    setSelectedFile(file);
    setUploadState("idle");
    setUploadedUrl("");
    setShowCropper(true);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleUpload = async (fileToUpload: File) => {
    setUploadState("uploading");
    setUploadError("");
    setShowCropper(false);
    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-password": ADMIN_PASSWORD },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Помилка завантаження");
        setUploadState("error");
        return;
      }
      setUploadedUrl(data.url);
      setCurrentPhotoUrl(data.url);
      setUploadState("success");
      setSelectedFile(null);
    } catch {
      setUploadError("Мережева помилка. Спробуй ще раз.");
      setUploadState("error");
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setShowCropper(false);
    setUploadState("idle");
    setUploadError("");
    setUploadedUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const save = (list: Testimonial[]) => {
    setTestimonials(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const addTestimonial = (t: Testimonial) => {
    save([...testimonials, t]);
    setAddingNew(false);
  };

  const updateTestimonial = (t: Testimonial) => {
    save(testimonials.map((r) => (r.id === t.id ? t : r)));
    setEditingId(null);
  };

  const deleteTestimonial = (id: string) => {
    if (confirm("Видалити відгук?")) save(testimonials.filter((r) => r.id !== id));
  };

  const toggleVisible = (id: string) => {
    save(testimonials.map((r) => r.id === id ? { ...r, visible: !r.visible } : r));
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(testimonials, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#1C1512] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span style={{ fontFamily: "var(--font-cormorant)" }} className="text-2xl text-[#C4A97A] font-light">
            Ellen Soul Admin
          </span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
        >
          <LogOut size={16} />
          Вийти
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 px-6">
        <div className="flex gap-1 -mb-px">
          {(["photo", "testimonials"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#D4A853] text-[#D4A853]"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              {tab === "photo" ? "📷 Фото" : "⭐ Відгуки"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* ── Photo Tab ── */}
        {activeTab === "photo" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>Фото профілю</h2>
              <p className="text-white/40 text-sm">Фото відображається на сторінці «Про мене»</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Current photo */}
              <div>
                <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-3">
                  {uploadState === "success" ? "✓ Нове фото завантажено" : "Поточне фото"}
                </p>
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#2A1F18] border border-white/10">
                  <Image
                    src={currentPhotoUrl}
                    alt="Ellen Soul"
                    fill
                    className="object-cover object-top"
                    unoptimized
                  />
                  {uploadState === "success" && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="bg-green-500 text-white rounded-full p-3">
                        <Check size={24} />
                      </div>
                    </div>
                  )}
                </div>
                {uploadedUrl && (
                  <p className="text-green-400 text-xs mt-2 break-all font-mono">{uploadedUrl}</p>
                )}
              </div>

              {/* Upload panel */}
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                />

                {/* Cropper */}
                {showCropper && selectedFile ? (
                  <PhotoCropper
                    file={selectedFile}
                    onConfirm={handleUpload}
                    onCancel={clearSelection}
                  />
                ) : uploadState === "uploading" ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <span className="w-8 h-8 border-2 border-white/20 border-t-[#D4A853] rounded-full animate-spin" />
                    <p className="text-white/50 text-sm">Завантаження...</p>
                  </div>
                ) : uploadState === "success" ? (
                  <button
                    onClick={clearSelection}
                    className="w-full px-4 py-3 rounded-xl bg-[#2A1F18] border border-green-500/30 text-green-400 text-sm flex items-center justify-center gap-2"
                  >
                    <Check size={14} />
                    Фото оновлено! Завантажити інше?
                  </button>
                ) : (
                  <>
                    {/* Drop zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`rounded-2xl border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center p-10 text-center ${
                        isDragging ? "border-[#D4A853] bg-[#D4A853]/10" : "border-white/15 bg-[#2A1F18] hover:border-[rgba(196,169,122,0.4)]"
                      }`}
                    >
                      <Upload size={28} className="text-white/30 mb-3" />
                      <p className="text-white/50 text-sm">Перетягни фото сюди</p>
                      <p className="text-white/25 text-xs mt-1">або натисни для вибору</p>
                      <p className="text-white/20 text-xs mt-3">JPG, PNG, WebP · до 5 МБ</p>
                    </div>
                    {uploadError && (
                      <p className="text-red-400 text-sm flex items-center gap-2"><X size={14} />{uploadError}</p>
                    )}
                  </>
                )}

                {/* Info note */}
                {!showCropper && uploadState !== "uploading" && (
                  <div className="bg-[#2A1F18] rounded-xl p-4 border border-white/8">
                    <p className="text-white/30 text-xs leading-relaxed">
                      Після вибору фото — затискаєш і переміщуєш щоб вибрати потрібну область, потім натискаєш «Завантажити».
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Testimonials Tab ── */}
        {activeTab === "testimonials" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>
                  Відгуки клієнток
                </h2>
                <p className="text-white/40 text-sm">
                  {testimonials.length === 0
                    ? "Відгуків поки немає"
                    : `${testimonials.filter(t => t.visible).length} / ${testimonials.length} показано`}
                </p>
              </div>
              <div className="flex gap-3">
                {testimonials.length > 0 && (
                  <button
                    onClick={copyJson}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white transition-colors text-sm"
                  >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {copied ? "Скопійовано!" : "Копіювати JSON"}
                  </button>
                )}
                {!addingNew && (
                  <button
                    onClick={() => setAddingNew(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A853] hover:bg-[#C4983A] text-white transition-colors text-sm font-medium"
                  >
                    <Plus size={14} />
                    Додати відгук
                  </button>
                )}
              </div>
            </div>

            {/* Hint */}
            {testimonials.length === 0 && !addingNew && (
              <div className="border border-dashed border-white/15 rounded-2xl p-12 text-center">
                <p className="text-white/30 mb-2">Відгуки відображатимуться на сайті</p>
                <p className="text-white/20 text-sm">Натисни &ldquo;Додати відгук&rdquo; щоб почати</p>
              </div>
            )}

            {/* New testimonial form */}
            {addingNew && (
              <TestimonialForm
                onSave={addTestimonial}
                onCancel={() => setAddingNew(false)}
              />
            )}

            {/* Testimonials list */}
            <div className="space-y-4">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-2xl border p-5 transition-colors ${
                    t.visible
                      ? "bg-[#2A1F18] border-[rgba(196,169,122,0.2)]"
                      : "bg-[#1F1810] border-white/8 opacity-60"
                  }`}
                >
                  {editingId === t.id ? (
                    <TestimonialForm
                      initial={t}
                      onSave={updateTestimonial}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-white">{t.name}</p>
                            <span className="text-white/30 text-xs">·</span>
                            <p className="text-white/50 text-sm">{t.city}</p>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: t.rating }).map((_, i) => (
                              <Star key={i} size={12} fill="#D4A853" className="text-[#D4A853]" />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => toggleVisible(t.id)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors"
                            title={t.visible ? "Сховати" : "Показати"}
                          >
                            {t.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button
                            onClick={() => setEditingId(t.id)}
                            className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white border border-white/10 hover:border-white/25 transition-colors text-xs"
                          >
                            Редагувати
                          </button>
                          <button
                            onClick={() => deleteTestimonial(t.id)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        {t.text_uk && (
                          <div>
                            <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">УКР</p>
                            <p className="text-white/60 text-sm leading-relaxed line-clamp-3">{t.text_uk}</p>
                          </div>
                        )}
                        {t.text_ru && (
                          <div>
                            <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-1">РУС</p>
                            <p className="text-white/60 text-sm leading-relaxed line-clamp-3">{t.text_ru}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {testimonials.length > 0 && (
              <div className="bg-[#2A1F18] rounded-2xl p-5 border border-[rgba(196,169,122,0.1)]">
                <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-2">
                  Як опублікувати відгуки на сайті
                </p>
                <p className="text-white/50 text-sm leading-relaxed">
                  1. Натисни <strong className="text-white/70">&ldquo;Копіювати JSON&rdquo;</strong> вгорі<br />
                  2. Надішли мені (розробнику) скопійований текст<br />
                  3. Я оновлю код — відгуки з'являться для всіх відвідувачів
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page Entry Point ────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(sessionStorage.getItem("admin_auth") === "1");
  }, []);

  if (authed === null) return null; // hydration guard

  if (!authed)
    return <AuthScreen onLogin={() => setAuthed(true)} />;

  return (
    <AdminDashboard
      onLogout={() => {
        sessionStorage.removeItem("admin_auth");
        setAuthed(false);
      }}
    />
  );
}
