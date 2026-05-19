"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Plus, Trash2, Eye, EyeOff, Save, LogOut, Copy, Check, Star, Upload, X, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import type { Testimonial } from "@/lib/data/testimonials";
import {
  DEFAULT_SERVICES,
  DEFAULT_ORG,
  SERVICES_STORAGE_KEY,
  ORG_STORAGE_KEY,
  type ServiceItem,
  type OrgItem,
} from "@/lib/data/services";

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
  const [activeTab, setActiveTab] = useState<"photo" | "testimonials" | "blog" | "services" | "faq" | "contacts" | "home" | "about" | "studio">("testimonials");

  // Services state
  const [svcList, setSvcList] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [orgList, setOrgList] = useState<OrgItem[]>(DEFAULT_ORG);
  const [expandedSvc, setExpandedSvc] = useState<string | null>(null);

  // Blog state
  const [blogTitleRu, setBlogTitleRu] = useState("Telegram-канал");
  const [blogDescRu, setBlogDescRu] = useState("Там я регулярно публикую расклады, пишу о картах и делюсь мыслями.");
  const [blogBtnRu, setBlogBtnRu] = useState("Перейти в канал");
  const [blogTitleUk, setBlogTitleUk] = useState("Telegram-канал");
  const [blogDescUk, setBlogDescUk] = useState("Там я регулярно публікую розклади, пишу про карти та ділюся думками.");
  const [blogBtnUk, setBlogBtnUk] = useState("Перейти в канал");
  const [blogLink, setBlogLink] = useState("https://t.me/ellen_soul_taro");

  // Contacts state
  const [contactsTg, setContactsTg] = useState("@ellen_soul_taro");
  const [contactsTgUrl, setContactsTgUrl] = useState("https://t.me/ellen_soul_taro");
  const [contactsWa, setContactsWa] = useState("https://wa.me/380000000000");
  const [contactsIg, setContactsIg] = useState("@ellen_soul_taro");
  const [contactsIgUrl, setContactsIgUrl] = useState("https://instagram.com/ellen_soul_taro");
  const [contactsSaved, setContactsSaved] = useState(false);

  // FAQ state
  type FaqItem = { id: string; category: string; q: string; a: string };
  const [faqLang, setFaqLang] = useState<"uk" | "ru" | "en">("uk");
  const [faqUk, setFaqUk] = useState<FaqItem[]>([]);
  const [faqRu, setFaqRu] = useState<FaqItem[]>([]);
  const [faqEn, setFaqEn] = useState<FaqItem[]>([]);
  const [faqSaved, setFaqSaved] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [newFaqCategory, setNewFaqCategory] = useState("");
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [addingFaq, setAddingFaq] = useState(false);

  // Home state
  const [homeHeroTagUk, setHomeHeroTagUk] = useState("Таро провідник");
  const [homeHeroTagRu, setHomeHeroTagRu] = useState("Таро проводник");
  const [homeHeroTagEn, setHomeHeroTagEn] = useState("Tarot Guide");
  const [homeHeroTitleUk, setHomeHeroTitleUk] = useState("Коли слова не допомагають — карти розкажуть правду");
  const [homeHeroTitleRu, setHomeHeroTitleRu] = useState("Когда слова не помогают — карты расскажут правду");
  const [homeHeroTitleEn, setHomeHeroTitleEn] = useState("When words fail — the cards will tell the truth");
  const [homeHeroSubUk, setHomeHeroSubUk] = useState("Емпат, відчуваю людей та їхні запити...");
  const [homeHeroSubRu, setHomeHeroSubRu] = useState("Эмпат, чувствую людей и их запросы...");
  const [homeHeroSubEn, setHomeHeroSubEn] = useState("Empath — I sense people and their requests...");
  const [homeSaved, setHomeSaved] = useState(false);

  // About state
  const [aboutStoryTitleUk, setAboutStoryTitleUk] = useState("Від запитань без відповіді — до практики, яка змінює життя");
  const [aboutStoryTitleRu, setAboutStoryTitleRu] = useState("От вопросов без ответа — к практике, которая меняет жизни");
  const [aboutStoryTitleEn, setAboutStoryTitleEn] = useState("From unanswered questions — to a practice that changes lives");
  const [aboutStoryTextUk, setAboutStoryTextUk] = useState("Практикую Таро більше 5 років...");
  const [aboutStoryTextRu, setAboutStoryTextRu] = useState("Практикую Таро больше 5 лет...");
  const [aboutStoryTextEn, setAboutStoryTextEn] = useState("I have been practising Tarot for over 5 years...");
  const [aboutQuoteUk, setAboutQuoteUk] = useState("Таро розклади з душею.");
  const [aboutQuoteRu, setAboutQuoteRu] = useState("Таро расклады с душой.");
  const [aboutQuoteEn, setAboutQuoteEn] = useState("Tarot readings with soul.");
  const [aboutSaved, setAboutSaved] = useState(false);

  // Studio state
  type StudioTool = {
    id: string;
    title_uk: string; title_ru: string; title_en: string;
    desc_uk: string; desc_ru: string; desc_en: string;
  };
  const DEFAULT_STUDIO_TOOLS: StudioTool[] = [
    { id: "moon-phase", title_uk: "Місячний гороскоп", title_ru: "Лунный гороскоп", title_en: "Moon Horoscope", desc_uk: "Дізнайтесь поточну фазу Місяця...", desc_ru: "Узнайте текущую фазу Луны...", desc_en: "Find the current Moon phase..." },
    { id: "compatibility", title_uk: "Сумісність знаків", title_ru: "Совместимость знаков", title_en: "Sign Compatibility", desc_uk: "Перевірте астрологічну сумісність...", desc_ru: "Проверьте астрологическую совместимость...", desc_en: "Check the astrological compatibility..." },
    { id: "daily-card", title_uk: "Карта дня", title_ru: "Карта дня", title_en: "Card of the Day", desc_uk: "Щоденна карта Старшого Аркану...", desc_ru: "Ежедневная карта Старшего Аркана...", desc_en: "Daily Major Arcana card..." },
    { id: "numerology", title_uk: "Нумерологія", title_ru: "Нумерология", title_en: "Numerology", desc_uk: "Ваше число Долі...", desc_ru: "Ваше число Судьбы...", desc_en: "Your Destiny number..." },
  ];
  const [studioTools, setStudioTools] = useState<StudioTool[]>(DEFAULT_STUDIO_TOOLS);
  const studioRef = useRef<StudioTool[]>(DEFAULT_STUDIO_TOOLS);

  // Global save indicator
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  // Refs to always have latest values for publishContent
  const svcRef = useRef(DEFAULT_SERVICES);
  const orgRef = useRef(DEFAULT_ORG);
  const testimonialsRef = useRef<Testimonial[]>([]);
  const blogRef = useRef({ title_ru: "Telegram-канал", desc_ru: "", btn_ru: "", title_uk: "Telegram-канал", desc_uk: "", btn_uk: "", link: "" });
  const contactsRef = useRef({ telegram_handle: "@ellen_soul_taro", telegram_url: "https://t.me/ellen_soul_taro", whatsapp_url: "https://wa.me/380000000000", instagram_handle: "@ellen_soul_taro", instagram_url: "https://instagram.com/ellen_soul_taro" });
  const faqUkRef = useRef<FaqItem[]>([]);
  const faqRuRef = useRef<FaqItem[]>([]);
  const faqEnRef = useRef<FaqItem[]>([]);
  const homeRef = useRef({ hero_tag_uk: "Таро провідник", hero_tag_ru: "Таро проводник", hero_tag_en: "Tarot Guide", hero_title_uk: "", hero_title_ru: "", hero_title_en: "", hero_sub_uk: "", hero_sub_ru: "", hero_sub_en: "" });
  const aboutRef = useRef({ story_title_uk: "", story_title_ru: "", story_title_en: "", story_text_uk: "", story_text_ru: "", story_text_en: "", quote_uk: "", quote_ru: "", quote_en: "" });

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
    // Load all content from Vercel Blob (single source of truth)
    fetch("/api/content")
      .then((r) => r.json())
      .then((d) => {
        if (d.services?.length) { setSvcList(d.services); svcRef.current = d.services; }
        if (d.org?.length) { setOrgList(d.org); orgRef.current = d.org; }
        if (d.testimonials?.length) { setTestimonials(d.testimonials); testimonialsRef.current = d.testimonials; }
        if (d.blog) {
          const b = d.blog;
          if (b.title_ru) setBlogTitleRu(b.title_ru);
          if (b.desc_ru) setBlogDescRu(b.desc_ru);
          if (b.btn_ru) setBlogBtnRu(b.btn_ru);
          if (b.title_uk) setBlogTitleUk(b.title_uk);
          if (b.desc_uk) setBlogDescUk(b.desc_uk);
          if (b.btn_uk) setBlogBtnUk(b.btn_uk);
          if (b.link) setBlogLink(b.link);
          blogRef.current = b;
        }
        if (d.contacts) {
          setContactsTg(d.contacts.telegram_handle ?? "@ellen_soul_taro");
          setContactsTgUrl(d.contacts.telegram_url ?? "https://t.me/ellen_soul_taro");
          setContactsWa(d.contacts.whatsapp_url ?? "https://wa.me/380000000000");
          setContactsIg(d.contacts.instagram_handle ?? "@ellen_soul_taro");
          setContactsIgUrl(d.contacts.instagram_url ?? "https://instagram.com/ellen_soul_taro");
          contactsRef.current = d.contacts;
        }
        if (d.faq_uk) { setFaqUk(d.faq_uk); faqUkRef.current = d.faq_uk; }
        if (d.faq_ru) { setFaqRu(d.faq_ru); faqRuRef.current = d.faq_ru; }
        if (d.faq_en) { setFaqEn(d.faq_en); faqEnRef.current = d.faq_en; }
        if (d.home) {
          const h = d.home;
          if (h.hero_tag_uk) setHomeHeroTagUk(h.hero_tag_uk);
          if (h.hero_tag_ru) setHomeHeroTagRu(h.hero_tag_ru);
          if (h.hero_tag_en) setHomeHeroTagEn(h.hero_tag_en);
          if (h.hero_title_uk) setHomeHeroTitleUk(h.hero_title_uk);
          if (h.hero_title_ru) setHomeHeroTitleRu(h.hero_title_ru);
          if (h.hero_title_en) setHomeHeroTitleEn(h.hero_title_en);
          if (h.hero_sub_uk) setHomeHeroSubUk(h.hero_sub_uk);
          if (h.hero_sub_ru) setHomeHeroSubRu(h.hero_sub_ru);
          if (h.hero_sub_en) setHomeHeroSubEn(h.hero_sub_en);
          homeRef.current = h;
        }
        if (d.about) {
          const a = d.about;
          if (a.story_title_uk) setAboutStoryTitleUk(a.story_title_uk);
          if (a.story_title_ru) setAboutStoryTitleRu(a.story_title_ru);
          if (a.story_title_en) setAboutStoryTitleEn(a.story_title_en);
          if (a.story_text_uk) setAboutStoryTextUk(a.story_text_uk);
          if (a.story_text_ru) setAboutStoryTextRu(a.story_text_ru);
          if (a.story_text_en) setAboutStoryTextEn(a.story_text_en);
          if (a.quote_uk) setAboutQuoteUk(a.quote_uk);
          if (a.quote_ru) setAboutQuoteRu(a.quote_ru);
          if (a.quote_en) setAboutQuoteEn(a.quote_en);
          aboutRef.current = a;
        }
        if (d.studio_tools?.length) { setStudioTools(d.studio_tools); studioRef.current = d.studio_tools; }
      })
      .catch(() => {});
    fetch("/api/photo")
      .then((r) => r.json())
      .then((d) => { if (d.url) setCurrentPhotoUrl(d.url); })
      .catch(() => {});
  }, []);

  // Publish ALL content to Vercel Blob — called after every change
  const publishContent = async (patch: {
    services?: ServiceItem[];
    org?: OrgItem[];
    testimonials?: Testimonial[];
    blog?: typeof blogRef.current;
    home?: typeof homeRef.current;
    about?: typeof aboutRef.current;
    studio_tools?: StudioTool[];
  } = {}) => {
    if (patch.services) svcRef.current = patch.services;
    if (patch.org) orgRef.current = patch.org;
    if (patch.testimonials) testimonialsRef.current = patch.testimonials;
    if (patch.blog) blogRef.current = patch.blog;
    if (patch.home) homeRef.current = patch.home;
    if (patch.about) aboutRef.current = patch.about;
    if (patch.studio_tools) studioRef.current = patch.studio_tools;
    setSaving("saving");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "x-admin-password": ADMIN_PASSWORD, "Content-Type": "application/json" },
        body: JSON.stringify({
          services: svcRef.current,
          org: orgRef.current,
          testimonials: testimonialsRef.current,
          blog: blogRef.current,
          contacts: contactsRef.current,
          faq_uk: faqUkRef.current,
          faq_ru: faqRuRef.current,
          faq_en: faqEnRef.current,
          home: homeRef.current,
          about: aboutRef.current,
          studio_tools: studioRef.current,
        }),
      });
      setSaving(res.ok ? "saved" : "error");
    } catch {
      setSaving("error");
    }
    setTimeout(() => setSaving("idle"), 2500);
  };

  // Save all content including contacts and FAQ
  const saveAllContent = async () => {
    contactsRef.current = {
      telegram_handle: contactsTg,
      telegram_url: contactsTgUrl,
      whatsapp_url: contactsWa,
      instagram_handle: contactsIg,
      instagram_url: contactsIgUrl,
    };
    faqUkRef.current = faqUk;
    faqRuRef.current = faqRu;
    faqEnRef.current = faqEn;
    homeRef.current = {
      hero_tag_uk: homeHeroTagUk, hero_tag_ru: homeHeroTagRu, hero_tag_en: homeHeroTagEn,
      hero_title_uk: homeHeroTitleUk, hero_title_ru: homeHeroTitleRu, hero_title_en: homeHeroTitleEn,
      hero_sub_uk: homeHeroSubUk, hero_sub_ru: homeHeroSubRu, hero_sub_en: homeHeroSubEn,
    };
    aboutRef.current = {
      story_title_uk: aboutStoryTitleUk, story_title_ru: aboutStoryTitleRu, story_title_en: aboutStoryTitleEn,
      story_text_uk: aboutStoryTextUk, story_text_ru: aboutStoryTextRu, story_text_en: aboutStoryTextEn,
      quote_uk: aboutQuoteUk, quote_ru: aboutQuoteRu, quote_en: aboutQuoteEn,
    };
    studioRef.current = studioTools;
    setSaving("saving");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "x-admin-password": ADMIN_PASSWORD, "Content-Type": "application/json" },
        body: JSON.stringify({
          services: svcRef.current,
          org: orgRef.current,
          testimonials: testimonialsRef.current,
          blog: blogRef.current,
          contacts: contactsRef.current,
          faq_uk: faqUkRef.current,
          faq_ru: faqRuRef.current,
          faq_en: faqEnRef.current,
          home: homeRef.current,
          about: aboutRef.current,
          studio_tools: studioRef.current,
        }),
      });
      setSaving(res.ok ? "saved" : "error");
    } catch {
      setSaving("error");
    }
    setTimeout(() => setSaving("idle"), 2500);
  };

  const saveSvc = (list: ServiceItem[]) => {
    setSvcList(list);
    publishContent({ services: list });
  };
  const saveOrg = (list: OrgItem[]) => {
    setOrgList(list);
    publishContent({ org: list });
  };
  const saveBlog = () => {
    const blog = {
      title_ru: blogTitleRu, desc_ru: blogDescRu, btn_ru: blogBtnRu,
      title_uk: blogTitleUk, desc_uk: blogDescUk, btn_uk: blogBtnUk,
      link: blogLink,
    };
    publishContent({ blog });
  };

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
    publishContent({ testimonials: list });
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
          {saving === "saving" && (
            <span className="text-xs text-white/40 flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border border-white/20 border-t-[#D4A853] rounded-full animate-spin" />
              Зберігається...
            </span>
          )}
          {saving === "saved" && (
            <span className="text-xs text-green-400 flex items-center gap-1.5">
              <Check size={12} /> Збережено
            </span>
          )}
          {saving === "error" && (
            <span className="text-xs text-red-400">Помилка збереження</span>
          )}
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
          {(["photo", "testimonials", "blog", "services", "faq", "contacts", "home", "about", "studio"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#D4A853] text-[#D4A853]"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              {tab === "photo" ? "📷 Фото"
                : tab === "testimonials" ? "⭐ Відгуки"
                : tab === "blog" ? "📝 Блог"
                : tab === "services" ? "🛎 Послуги"
                : tab === "faq" ? "❓ FAQ"
                : tab === "contacts" ? "📞 Контакти"
                : tab === "home" ? "🏠 Головна"
                : tab === "about" ? "👤 Про мене"
                : "🔮 Студія"}
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

          </div>
        )}

        {/* ── Blog Tab ── */}
        {activeTab === "blog" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>Блог — Telegram-блок</h2>
              <p className="text-white/40 text-sm">Текст картки на сторінці «Блог» (посилання на Telegram-канал)</p>
            </div>

            <div className="bg-[#2A1F18] rounded-2xl border border-[rgba(196,169,122,0.2)] p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Заголовок (RU)</label>
                  <input className="admin-input w-full" value={blogTitleRu} onChange={e => setBlogTitleRu(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Заголовок (UK)</label>
                  <input className="admin-input w-full" value={blogTitleUk} onChange={e => setBlogTitleUk(e.target.value)} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Опис (RU)</label>
                  <textarea rows={3} className="admin-input w-full resize-none" value={blogDescRu} onChange={e => setBlogDescRu(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Опис (UK)</label>
                  <textarea rows={3} className="admin-input w-full resize-none" value={blogDescUk} onChange={e => setBlogDescUk(e.target.value)} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Текст кнопки (RU)</label>
                  <input className="admin-input w-full" value={blogBtnRu} onChange={e => setBlogBtnRu(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Текст кнопки (UK)</label>
                  <input className="admin-input w-full" value={blogBtnUk} onChange={e => setBlogBtnUk(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Посилання</label>
                <input className="admin-input w-full" value={blogLink} onChange={e => setBlogLink(e.target.value)} placeholder="https://t.me/..." />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={saveBlog}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A853] hover:bg-[#C4983A] text-white transition-colors text-sm font-medium"
                >
                  <Save size={14} /> Зберегти
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Services Tab ── */}
        {activeTab === "services" && (
          <div className="space-y-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>Послуги та ціни</h2>
                <p className="text-white/40 text-sm">Керуй переліком послуг та організаційними питаннями</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const newSvc: ServiceItem = {
                      id: Date.now().toString(),
                      title_ru: "Новая услуга", subtitle_ru: "",
                      title_uk: "Нова послуга", subtitle_uk: "",
                      title_en: "New Service", subtitle_en: "",
                      price: "$0",
                      desc_ru: "", desc_uk: "", desc_en: "",
                      includes_ru: [], includes_uk: [], includes_en: [],
                    };
                    const updated = [...svcList, newSvc];
                    saveSvc(updated);
                    setExpandedSvc(newSvc.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A853] hover:bg-[#C4983A] text-white transition-colors text-sm font-medium"
                >
                  <Plus size={14} /> Додати послугу
                </button>
              </div>
            </div>

            {/* Services list */}
            <div className="space-y-3">
              {svcList.map((svc, idx) => (
                <div key={svc.id} className="bg-[#2A1F18] rounded-2xl border border-[rgba(196,169,122,0.2)] overflow-hidden">
                  {/* Header row */}
                  <div className="flex items-center gap-3 px-5 py-4">
                    <GripVertical size={16} className="text-white/20 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{svc.title_ru}</p>
                      <p className="text-white/40 text-xs">{svc.subtitle_ru} · {svc.price}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => { if (idx === 0) return; const l = [...svcList]; [l[idx-1], l[idx]] = [l[idx], l[idx-1]]; saveSvc(l); }} className="p-1.5 text-white/30 hover:text-white disabled:opacity-20" disabled={idx === 0}><ChevronUp size={14} /></button>
                      <button onClick={() => { if (idx === svcList.length-1) return; const l = [...svcList]; [l[idx], l[idx+1]] = [l[idx+1], l[idx]]; saveSvc(l); }} className="p-1.5 text-white/30 hover:text-white disabled:opacity-20" disabled={idx === svcList.length-1}><ChevronDown size={14} /></button>
                      <button onClick={() => setExpandedSvc(expandedSvc === svc.id ? null : svc.id)} className="px-3 py-1.5 rounded-lg text-white/40 hover:text-white border border-white/10 hover:border-white/25 transition-colors text-xs">
                        {expandedSvc === svc.id ? "Згорнути" : "Редагувати"}
                      </button>
                      <button onClick={() => { if (confirm("Видалити послугу?")) saveSvc(svcList.filter(s => s.id !== svc.id)); }} className="p-1.5 text-white/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {/* Edit form */}
                  {expandedSvc === svc.id && (
                    <div className="border-t border-white/10 p-5 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Назва (RU)</label>
                          <input className="admin-input w-full" value={svc.title_ru} onChange={e => saveSvc(svcList.map(s => s.id === svc.id ? {...s, title_ru: e.target.value} : s))} />
                        </div>
                        <div>
                          <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Підзаголовок (RU)</label>
                          <input className="admin-input w-full" value={svc.subtitle_ru} onChange={e => saveSvc(svcList.map(s => s.id === svc.id ? {...s, subtitle_ru: e.target.value} : s))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Назва (UK)</label>
                          <input className="admin-input w-full" value={svc.title_uk} onChange={e => saveSvc(svcList.map(s => s.id === svc.id ? {...s, title_uk: e.target.value} : s))} />
                        </div>
                        <div>
                          <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Підзаголовок (UK)</label>
                          <input className="admin-input w-full" value={svc.subtitle_uk} onChange={e => saveSvc(svcList.map(s => s.id === svc.id ? {...s, subtitle_uk: e.target.value} : s))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Назва (EN)</label>
                          <input className="admin-input w-full" value={svc.title_en ?? ''} onChange={e => saveSvc(svcList.map(s => s.id === svc.id ? {...s, title_en: e.target.value} : s))} />
                        </div>
                        <div>
                          <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Підзаголовок (EN)</label>
                          <input className="admin-input w-full" value={svc.subtitle_en ?? ''} onChange={e => saveSvc(svcList.map(s => s.id === svc.id ? {...s, subtitle_en: e.target.value} : s))} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Ціна</label>
                        <input className="admin-input w-32" value={svc.price} onChange={e => saveSvc(svcList.map(s => s.id === svc.id ? {...s, price: e.target.value} : s))} />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Опис (RU)</label>
                          <textarea rows={2} className="admin-input w-full resize-none" value={svc.desc_ru} onChange={e => saveSvc(svcList.map(s => s.id === svc.id ? {...s, desc_ru: e.target.value} : s))} />
                        </div>
                        <div>
                          <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Опис (UK)</label>
                          <textarea rows={2} className="admin-input w-full resize-none" value={svc.desc_uk} onChange={e => saveSvc(svcList.map(s => s.id === svc.id ? {...s, desc_uk: e.target.value} : s))} />
                        </div>
                        <div>
                          <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Опис (EN)</label>
                          <textarea rows={2} className="admin-input w-full resize-none" value={svc.desc_en ?? ''} onChange={e => saveSvc(svcList.map(s => s.id === svc.id ? {...s, desc_en: e.target.value} : s))} />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Пункти (RU) — кожен з нового рядка</label>
                          <textarea rows={5} className="admin-input w-full resize-none text-xs" value={svc.includes_ru.join("\n")} onChange={e => saveSvc(svcList.map(s => s.id === svc.id ? {...s, includes_ru: e.target.value.split("\n").filter(Boolean)} : s))} />
                        </div>
                        <div>
                          <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Пункти (UK) — кожен з нового рядка</label>
                          <textarea rows={5} className="admin-input w-full resize-none text-xs" value={svc.includes_uk.join("\n")} onChange={e => saveSvc(svcList.map(s => s.id === svc.id ? {...s, includes_uk: e.target.value.split("\n").filter(Boolean)} : s))} />
                        </div>
                        <div>
                          <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Пункти (EN) — кожен з нового рядка</label>
                          <textarea rows={5} className="admin-input w-full resize-none text-xs" value={(svc.includes_en ?? []).join("\n")} onChange={e => saveSvc(svcList.map(s => s.id === svc.id ? {...s, includes_en: e.target.value.split("\n").filter(Boolean)} : s))} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Org questions */}
            <div>
              <h3 className="text-lg mb-4 text-[#C4A97A]" style={{ fontFamily: "var(--font-cormorant)" }}>Організаційні питання</h3>
              <div className="space-y-3">
                {orgList.map((item, idx) => (
                  <div key={item.id} className="bg-[#2A1F18] rounded-2xl border border-[rgba(196,169,122,0.15)] p-4 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/40 text-xs">#{idx + 1}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { if (idx===0) return; const l=[...orgList]; [l[idx-1],l[idx]]=[l[idx],l[idx-1]]; saveOrg(l); }} disabled={idx===0} className="p-1 text-white/30 hover:text-white disabled:opacity-20"><ChevronUp size={12}/></button>
                        <button onClick={() => { if (idx===orgList.length-1) return; const l=[...orgList]; [l[idx],l[idx+1]]=[l[idx+1],l[idx]]; saveOrg(l); }} disabled={idx===orgList.length-1} className="p-1 text-white/30 hover:text-white disabled:opacity-20"><ChevronDown size={12}/></button>
                        <button onClick={() => { if (confirm("Видалити?")) saveOrg(orgList.filter(o=>o.id!==item.id)); }} className="p-1 text-white/30 hover:text-red-400"><Trash2 size={12}/></button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <textarea rows={3} className="admin-input w-full resize-none text-xs" value={item.text_ru} onChange={e => saveOrg(orgList.map(o => o.id===item.id ? {...o, text_ru: e.target.value} : o))} placeholder="RU" />
                      <textarea rows={3} className="admin-input w-full resize-none text-xs" value={item.text_uk} onChange={e => saveOrg(orgList.map(o => o.id===item.id ? {...o, text_uk: e.target.value} : o))} placeholder="UK" />
                      <textarea rows={3} className="admin-input w-full resize-none text-xs" value={item.text_en ?? ''} onChange={e => saveOrg(orgList.map(o => o.id===item.id ? {...o, text_en: e.target.value} : o))} placeholder="EN" />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => saveOrg([...orgList, { id: Date.now().toString(), text_ru: "", text_uk: "", text_en: "" }])}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/15 text-white/40 hover:text-white/70 text-sm w-full justify-center"
                >
                  <Plus size={14} /> Додати пункт
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ── Contacts Tab ── */}
        {activeTab === "contacts" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>Контакти для зв&apos;язку</h2>
              <p className="text-white/40 text-sm">Посилання у блоці «Швидкий зв&apos;язок» на сторінці Контакти</p>
            </div>
            <div className="grid gap-4">
              {([
                { label: "Telegram handle", val: contactsTg, set: setContactsTg, placeholder: "@ellen_soul_taro" },
                { label: "Telegram URL", val: contactsTgUrl, set: setContactsTgUrl, placeholder: "https://t.me/..." },
                { label: "WhatsApp URL", val: contactsWa, set: setContactsWa, placeholder: "https://wa.me/380..." },
                { label: "Instagram handle", val: contactsIg, set: setContactsIg, placeholder: "@ellen_soul_taro" },
                { label: "Instagram URL", val: contactsIgUrl, set: setContactsIgUrl, placeholder: "https://instagram.com/..." },
              ] as { label: string; val: string; set: (v: string) => void; placeholder: string }[]).map(({ label, val, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs text-white/50 mb-1">{label}</label>
                  <input
                    type="text"
                    value={val}
                    onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4A853]"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={async () => { await saveAllContent(); setContactsSaved(true); setTimeout(() => setContactsSaved(false), 2000); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A853] hover:bg-[#C4983A] text-white transition-colors text-sm font-medium"
            >
              {contactsSaved ? "✓ Збережено" : "Зберегти контакти"}
            </button>
          </div>
        )}

        {/* ── FAQ Tab ── */}
        {activeTab === "faq" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>FAQ — Твоя підказка</h2>
                <p className="text-white/40 text-sm">Редагування питань і відповідей</p>
              </div>
              <div className="flex gap-2">
                {(["uk", "ru", "en"] as const).map(l => (
                  <button key={l} onClick={() => setFaqLang(l)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${faqLang === l ? "bg-[#D4A853] text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
                    {l === "uk" ? "УКР" : l === "ru" ? "РУС" : "ENG"}
                  </button>
                ))}
              </div>
            </div>

            {/* Item list */}
            {(() => {
              const items = faqLang === "uk" ? faqUk : faqLang === "ru" ? faqRu : faqEn;
              const setItems = faqLang === "uk" ? setFaqUk : faqLang === "ru" ? setFaqRu : setFaqEn;
              return (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={item.id} className="bg-white/5 rounded-xl border border-white/10 p-4">
                      {editingFaqId === item.id ? (
                        <div className="space-y-3">
                          <input value={item.category} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, category: e.target.value } : it))}
                            placeholder="Категорія" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
                          <input value={item.q} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, q: e.target.value } : it))}
                            placeholder="Питання" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
                          <textarea rows={3} value={item.a} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, a: e.target.value } : it))}
                            placeholder="Відповідь" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm resize-none" />
                          <button onClick={() => setEditingFaqId(null)} className="text-[#D4A853] text-sm">✓ Готово</button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-xs text-[#C4A97A] uppercase tracking-wider">{item.category}</span>
                            <p className="text-white/80 text-sm mt-1">{item.q}</p>
                            <p className="text-white/40 text-xs mt-1 line-clamp-2">{item.a}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => setEditingFaqId(item.id)} className="text-white/40 hover:text-white text-xs px-2 py-1 rounded border border-white/20">✏️</button>
                            <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="text-red-400/60 hover:text-red-400 text-xs px-2 py-1 rounded border border-red-400/20">✕</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Add new */}
            {addingFaq ? (
              <div className="bg-white/5 rounded-xl border border-[#D4A853]/30 p-4 space-y-3">
                <p className="text-white/60 text-sm">Нове питання ({faqLang.toUpperCase()})</p>
                <input value={newFaqCategory} onChange={e => setNewFaqCategory(e.target.value)} placeholder="Категорія"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
                <input value={newFaqQ} onChange={e => setNewFaqQ(e.target.value)} placeholder="Питання"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
                <textarea rows={3} value={newFaqA} onChange={e => setNewFaqA(e.target.value)} placeholder="Відповідь"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm resize-none" />
                <div className="flex gap-3">
                  <button onClick={() => {
                    if (!newFaqQ.trim()) return;
                    const newItem: FaqItem = { id: Date.now().toString(), category: newFaqCategory, q: newFaqQ, a: newFaqA };
                    const setItems = faqLang === "uk" ? setFaqUk : faqLang === "ru" ? setFaqRu : setFaqEn;
                    setItems(prev => [...prev, newItem]);
                    setNewFaqCategory(""); setNewFaqQ(""); setNewFaqA(""); setAddingFaq(false);
                  }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A853] hover:bg-[#C4983A] text-white transition-colors text-sm font-medium">+ Додати</button>
                  <button onClick={() => setAddingFaq(false)} className="text-white/40 text-sm">Скасувати</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingFaq(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/15 text-white/40 hover:text-white/70 text-sm w-full justify-center">
                + Додати питання
              </button>
            )}

            <button onClick={async () => { await saveAllContent(); setFaqSaved(true); setTimeout(() => setFaqSaved(false), 2000); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A853] hover:bg-[#C4983A] text-white transition-colors text-sm font-medium">
              {faqSaved ? "✓ Збережено" : "Зберегти FAQ"}
            </button>
          </div>
        )}

        {/* ── Home Tab ── */}
        {activeTab === "home" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>Головна сторінка — Hero</h2>
              <p className="text-white/40 text-sm">Тег, заголовок та підзаголовок секції Hero</p>
            </div>
            <div className="bg-[#2A1F18] rounded-2xl border border-[rgba(196,169,122,0.2)] p-6 space-y-5">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Тег (UK)</label>
                  <input className="admin-input w-full" value={homeHeroTagUk} onChange={e => setHomeHeroTagUk(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Тег (RU)</label>
                  <input className="admin-input w-full" value={homeHeroTagRu} onChange={e => setHomeHeroTagRu(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Тег (EN)</label>
                  <input className="admin-input w-full" value={homeHeroTagEn} onChange={e => setHomeHeroTagEn(e.target.value)} />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Заголовок (UK)</label>
                  <textarea rows={3} className="admin-input w-full resize-none" value={homeHeroTitleUk} onChange={e => setHomeHeroTitleUk(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Заголовок (RU)</label>
                  <textarea rows={3} className="admin-input w-full resize-none" value={homeHeroTitleRu} onChange={e => setHomeHeroTitleRu(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Заголовок (EN)</label>
                  <textarea rows={3} className="admin-input w-full resize-none" value={homeHeroTitleEn} onChange={e => setHomeHeroTitleEn(e.target.value)} />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Підзаголовок (UK)</label>
                  <textarea rows={4} className="admin-input w-full resize-none" value={homeHeroSubUk} onChange={e => setHomeHeroSubUk(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Підзаголовок (RU)</label>
                  <textarea rows={4} className="admin-input w-full resize-none" value={homeHeroSubRu} onChange={e => setHomeHeroSubRu(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Підзаголовок (EN)</label>
                  <textarea rows={4} className="admin-input w-full resize-none" value={homeHeroSubEn} onChange={e => setHomeHeroSubEn(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    homeRef.current = { hero_tag_uk: homeHeroTagUk, hero_tag_ru: homeHeroTagRu, hero_tag_en: homeHeroTagEn, hero_title_uk: homeHeroTitleUk, hero_title_ru: homeHeroTitleRu, hero_title_en: homeHeroTitleEn, hero_sub_uk: homeHeroSubUk, hero_sub_ru: homeHeroSubRu, hero_sub_en: homeHeroSubEn };
                    await saveAllContent();
                    setHomeSaved(true);
                    setTimeout(() => setHomeSaved(false), 2000);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A853] hover:bg-[#C4983A] text-white transition-colors text-sm font-medium"
                >
                  <Save size={14} /> {homeSaved ? "✓ Збережено" : "Зберегти"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── About Tab ── */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>Про мене — Моя Історія</h2>
              <p className="text-white/40 text-sm">Заголовок, текст та цитата розділу «Моя Історія»</p>
            </div>
            <div className="bg-[#2A1F18] rounded-2xl border border-[rgba(196,169,122,0.2)] p-6 space-y-5">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Заголовок (UK)</label>
                  <textarea rows={3} className="admin-input w-full resize-none" value={aboutStoryTitleUk} onChange={e => setAboutStoryTitleUk(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Заголовок (RU)</label>
                  <textarea rows={3} className="admin-input w-full resize-none" value={aboutStoryTitleRu} onChange={e => setAboutStoryTitleRu(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Заголовок (EN)</label>
                  <textarea rows={3} className="admin-input w-full resize-none" value={aboutStoryTitleEn} onChange={e => setAboutStoryTitleEn(e.target.value)} />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Текст (UK)</label>
                  <textarea rows={6} className="admin-input w-full resize-none" value={aboutStoryTextUk} onChange={e => setAboutStoryTextUk(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Текст (RU)</label>
                  <textarea rows={6} className="admin-input w-full resize-none" value={aboutStoryTextRu} onChange={e => setAboutStoryTextRu(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Текст (EN)</label>
                  <textarea rows={6} className="admin-input w-full resize-none" value={aboutStoryTextEn} onChange={e => setAboutStoryTextEn(e.target.value)} />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Цитата (UK)</label>
                  <input className="admin-input w-full" value={aboutQuoteUk} onChange={e => setAboutQuoteUk(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Цитата (RU)</label>
                  <input className="admin-input w-full" value={aboutQuoteRu} onChange={e => setAboutQuoteRu(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-[#C4A97A] uppercase tracking-widest block mb-1">Цитата (EN)</label>
                  <input className="admin-input w-full" value={aboutQuoteEn} onChange={e => setAboutQuoteEn(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    aboutRef.current = { story_title_uk: aboutStoryTitleUk, story_title_ru: aboutStoryTitleRu, story_title_en: aboutStoryTitleEn, story_text_uk: aboutStoryTextUk, story_text_ru: aboutStoryTextRu, story_text_en: aboutStoryTextEn, quote_uk: aboutQuoteUk, quote_ru: aboutQuoteRu, quote_en: aboutQuoteEn };
                    await saveAllContent();
                    setAboutSaved(true);
                    setTimeout(() => setAboutSaved(false), 2000);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A853] hover:bg-[#C4983A] text-white transition-colors text-sm font-medium"
                >
                  <Save size={14} /> {aboutSaved ? "✓ Збережено" : "Зберегти"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Studio Tab ── */}
        {activeTab === "studio" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>Soul Studio — Інструменти</h2>
              <p className="text-white/40 text-sm">Назви та описи 4 інструментів Студії</p>
            </div>
            <div className="space-y-4">
              {studioTools.map((tool) => (
                <div key={tool.id} className="bg-[#2A1F18] rounded-2xl border border-[rgba(196,169,122,0.2)] p-5 space-y-4">
                  <p className="text-[#C4A97A] text-xs uppercase tracking-widest">{tool.id}</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Назва (UK)</label>
                      <input className="admin-input w-full" value={tool.title_uk} onChange={e => setStudioTools(prev => prev.map(t => t.id === tool.id ? { ...t, title_uk: e.target.value } : t))} />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Назва (RU)</label>
                      <input className="admin-input w-full" value={tool.title_ru} onChange={e => setStudioTools(prev => prev.map(t => t.id === tool.id ? { ...t, title_ru: e.target.value } : t))} />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Назва (EN)</label>
                      <input className="admin-input w-full" value={tool.title_en} onChange={e => setStudioTools(prev => prev.map(t => t.id === tool.id ? { ...t, title_en: e.target.value } : t))} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Опис (UK)</label>
                      <textarea rows={3} className="admin-input w-full resize-none" value={tool.desc_uk} onChange={e => setStudioTools(prev => prev.map(t => t.id === tool.id ? { ...t, desc_uk: e.target.value } : t))} />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Опис (RU)</label>
                      <textarea rows={3} className="admin-input w-full resize-none" value={tool.desc_ru} onChange={e => setStudioTools(prev => prev.map(t => t.id === tool.id ? { ...t, desc_ru: e.target.value } : t))} />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 block mb-1">Опис (EN)</label>
                      <textarea rows={3} className="admin-input w-full resize-none" value={tool.desc_en} onChange={e => setStudioTools(prev => prev.map(t => t.id === tool.id ? { ...t, desc_en: e.target.value } : t))} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={async () => { studioRef.current = studioTools; await saveAllContent(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A853] hover:bg-[#C4983A] text-white transition-colors text-sm font-medium"
            >
              <Save size={14} /> Зберегти всі зміни
            </button>
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
