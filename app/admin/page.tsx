"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Eye, EyeOff, Save, LogOut, Copy, Check, Star } from "lucide-react";
import type { Testimonial } from "@/lib/data/testimonials";

const ADMIN_PASSWORD = "ellensoul2025";
const STORAGE_KEY = "ellen_admin_testimonials";
const PHOTO_KEY = "ellen_admin_photo";
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

// ─── Main Admin Dashboard ─────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [photoPath, setPhotoPath] = useState(DEFAULT_PHOTO);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"photo" | "testimonials">("testimonials");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setTestimonials(JSON.parse(saved)); } catch {}
    }
    const savedPhoto = localStorage.getItem(PHOTO_KEY);
    if (savedPhoto) setPhotoPath(savedPhoto);
  }, []);

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
              <p className="text-white/40 text-sm">Фото відображається на сторінці &quot;Про мене&quot;</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Current photo */}
              <div>
                <p className="text-xs text-[#C4A97A] tracking-widest uppercase mb-3">Поточне фото</p>
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#2A1F18] border border-white/10">
                  <Image
                    src={photoPath}
                    alt="Ellen Soul"
                    fill
                    className="object-cover object-top"
                    onError={() => {}}
                  />
                </div>
                <p className="text-white/30 text-xs mt-2 font-mono">{photoPath}</p>
              </div>

              {/* Instructions */}
              <div className="bg-[#2A1F18] rounded-2xl p-6 border border-[rgba(196,169,122,0.15)]">
                <h3 className="text-lg mb-4" style={{ fontFamily: "var(--font-cormorant)" }}>
                  Як змінити фото
                </h3>
                <ol className="space-y-3 text-sm text-white/60 list-decimal list-inside">
                  <li>Зберегти нове фото на комп'ютер</li>
                  <li>
                    Перейменуй файл:<br />
                    <code className="text-[#C4A97A] bg-black/30 px-2 py-0.5 rounded text-xs">
                      ellen-soul-taro-konsultant.jpg
                    </code>
                  </li>
                  <li>
                    Перемісти у папку проекту:<br />
                    <code className="text-[#C4A97A] bg-black/30 px-2 py-0.5 rounded text-xs">
                      public/images/
                    </code>
                  </li>
                  <li>Зроби git push → сайт оновиться автоматично</li>
                </ol>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/40 mb-2">Або вкажи інший шлях:</p>
                  <div className="flex gap-2">
                    <input
                      className="admin-input flex-1 text-sm"
                      value={photoPath}
                      onChange={(e) => setPhotoPath(e.target.value)}
                      placeholder="/images/my-photo.jpg"
                    />
                    <button
                      onClick={() => localStorage.setItem(PHOTO_KEY, photoPath)}
                      className="px-3 py-2 bg-[#D4A853] rounded-lg text-white text-sm hover:bg-[#C4983A] transition-colors"
                    >
                      <Save size={14} />
                    </button>
                  </div>
                </div>
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
