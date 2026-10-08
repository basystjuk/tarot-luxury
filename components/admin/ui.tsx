"use client";

/**
 * Admin UI kit — Radix + CVA on the brand palette (CSS tokens from
 * app/globals.css :root). Light "cream" theme like the public site.
 *
 * Rules baked in: touch targets ≥ 44px on mobile, inputs 16px on mobile (no
 * iOS zoom), every field has a real <label>, icon-only buttons need a label.
 */

import * as Dialog from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { ArrowUpRight, ChevronDown, ChevronUp, CircleCheck, Info, Loader2, Trash2, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Button ────────────────────────────────────────────────────────────────

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors select-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-400)] focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-[var(--cream-50)] disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-[var(--gold-600)] text-white hover:bg-[var(--warm-600)]",
        secondary:
          "bg-white text-[var(--warm-900)] border border-[var(--sand-200)] hover:border-[var(--sand-400)] hover:bg-[var(--cream-100)]",
        ghost: "text-[var(--warm-600)] hover:bg-[var(--sand-100)] hover:text-[var(--warm-900)]",
        danger: "bg-white text-[var(--danger)] border border-[var(--danger)]/40 hover:bg-[var(--danger)]/5",
      },
      size: {
        sm: "min-h-11 px-3 text-sm sm:min-h-9",
        md: "min-h-11 px-4 text-sm",
        icon: "h-11 w-11 shrink-0 sm:h-9 sm:w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { loading?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading, disabled, children, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

/** Icon-only button — `label` is required (screen readers + tooltip). */
export function IconButton({
  label,
  children,
  variant = "ghost",
  ...props
}: Omit<ButtonProps, "size" | "aria-label"> & { label: string }) {
  return (
    <Button size="icon" variant={variant} aria-label={label} title={label} {...props}>
      {children}
    </Button>
  );
}

// ── Layout pieces ─────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  actions,
  siteHref,
  badge,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** Public page this section edits — shown as "View on site". */
  siteHref?: string;
  badge?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl leading-tight sm:text-4xl" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
            {title}
          </h1>
          {badge}
        </div>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{description}</p>}
      </div>
      {(actions || siteHref) && (
        <div className="flex flex-wrap items-center gap-2">
          {siteHref && (
            <a
              href={siteHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Переглянути на сайті <ArrowUpRight size={14} aria-hidden />
            </a>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-[var(--sand-200)] bg-white p-4 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="text-xl leading-snug" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 600 }}>
                {title}
              </h2>
            )}
            {description && <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", {
  variants: {
    tone: {
      neutral: "bg-[var(--sand-100)] text-[var(--warm-600)]",
      gold: "bg-[var(--gold-300)]/40 text-[var(--gold-600)]",
      success: "bg-[var(--success)]/10 text-[var(--success)]",
      danger: "bg-[var(--danger)]/10 text-[var(--danger)]",
      muted: "border border-[var(--sand-200)] text-[var(--muted)]",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({ tone, children, className }: VariantProps<typeof badgeVariants> & { children: ReactNode; className?: string }) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}

const NOTICE_ICONS = { info: Info, warning: TriangleAlert, danger: TriangleAlert, success: CircleCheck } as const;

export function Notice({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: keyof typeof NOTICE_ICONS;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const Icon = NOTICE_ICONS[tone];
  const tones = {
    info: "border-[var(--sand-200)] bg-[var(--cream-100)] text-[var(--warm-600)]",
    warning: "border-[var(--gold-300)] bg-[var(--gold-300)]/15 text-[var(--warm-600)]",
    danger: "border-[var(--danger)]/30 bg-[var(--danger)]/5 text-[var(--danger)]",
    success: "border-[var(--success)]/30 bg-[var(--success)]/5 text-[var(--success)]",
  };
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-xl border p-3 text-sm leading-relaxed sm:p-4", tones[tone], className)}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={title ? "mt-1" : undefined}>{children}</div>}
        {action && <div className="mt-3 flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--sand-200)] bg-white/60 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-[var(--sand-400)]">{icon}</div>}
      <p className="font-medium text-[var(--warm-900)]">{title}</p>
      {children && <div className="mt-1 max-w-md text-sm text-[var(--muted)]">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-[var(--sand-100)]", className)} aria-hidden />;
}

export function Spinner({ label = "Завантаження…" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-[var(--muted)]" role="status">
      <Loader2 size={16} className="animate-spin" aria-hidden />
      {label}
    </span>
  );
}

// ── Form fields ───────────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-[var(--warm-900)] placeholder:text-[var(--muted)]/60 " +
  "transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)]/40 sm:text-sm";

function FieldShell({
  id,
  label,
  hint,
  error,
  count,
  maxLength,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string | null;
  count?: number;
  maxLength?: number;
  required?: boolean;
  children: ReactNode;
}) {
  const over = maxLength !== undefined && count !== undefined && count > maxLength;
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-[var(--warm-900)]">
          {label}
          {required && <span className="ml-0.5 text-[var(--danger)]" aria-hidden>*</span>}
        </label>
        {maxLength !== undefined && count !== undefined && (
          <span className={cn("text-xs tabular-nums", over ? "text-[var(--danger)]" : "text-[var(--muted)]")}>
            {count}/{maxLength}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  error?: string | null;
  placeholder?: string;
  /** Soft limit — shows a counter, doesn't block typing. */
  maxLength?: number;
  required?: boolean;
  type?: "text" | "url" | "email" | "tel" | "date" | "number";
  inputMode?: "text" | "url" | "email" | "tel" | "numeric" | "decimal";
  autoComplete?: string;
  /** Suggestions shown while typing (still free text). */
  suggestions?: string[];
};

export function TextField({ label, value, onChange, hint, error, placeholder, maxLength, required, type = "text", inputMode, autoComplete = "off", suggestions }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} count={value.length} maxLength={maxLength} required={required}>
      {suggestions && suggestions.length > 0 && (
        <datalist id={`${id}-list`}>
          {suggestions.map((s) => <option key={s} value={s} />)}
        </datalist>
      )}
      <input
        id={id}
        list={suggestions && suggestions.length > 0 ? `${id}-list` : undefined}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(inputBase, error ? "border-[var(--danger)]/60" : "border-[var(--sand-200)] focus:border-[var(--sand-400)]")}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  hint,
  error,
  placeholder,
  maxLength,
  required,
  rows = 4,
  mono,
}: Omit<TextFieldProps, "type" | "inputMode" | "autoComplete"> & { rows?: number; mono?: boolean }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} count={value.length} maxLength={maxLength} required={required}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          inputBase,
          "resize-y leading-relaxed",
          mono && "font-mono text-[13px] sm:text-xs",
          error ? "border-[var(--danger)]/60" : "border-[var(--sand-200)] focus:border-[var(--sand-400)]",
        )}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputBase, "border-[var(--sand-200)] focus:border-[var(--sand-400)]")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (next: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-400)] focus-visible:ring-offset-2",
        "disabled:opacity-50 before:absolute before:-inset-2 before:content-['']",
        checked ? "bg-[var(--success)]" : "bg-[var(--sand-200)]",
      )}
    >
      <span
        className={cn(
          "inline-block h-6 w-6 translate-x-0.5 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-[22px]",
        )}
      />
    </button>
  );
}

/** A settings row: text on the left, switch on the right. */
export function SwitchRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--warm-900)]">{label}</p>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">{description}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} label={label} disabled={disabled} />
    </div>
  );
}

// ── Languages ─────────────────────────────────────────────────────────────

export type Lang = "uk" | "ru" | "en";
export const LANGS: { id: Lang; short: string; name: string }[] = [
  { id: "uk", short: "UK", name: "Українська" },
  { id: "ru", short: "RU", name: "Русский" },
  { id: "en", short: "EN", name: "English" },
];

/** Segmented UK / RU / EN switch; a dot marks languages with empty fields. */
export function LangTabs({
  value,
  onChange,
  missing,
}: {
  value: Lang;
  onChange: (lang: Lang) => void;
  missing?: Partial<Record<Lang, boolean>>;
}) {
  return (
    <div role="tablist" aria-label="Мова" className="inline-flex rounded-xl border border-[var(--sand-200)] bg-[var(--cream-100)] p-1">
      {LANGS.map((l) => {
        const active = value === l.id;
        return (
          <button
            key={l.id}
            type="button"
            role="tab"
            aria-selected={active}
            title={l.name + (missing?.[l.id] ? " — є незаповнені поля" : "")}
            onClick={() => onChange(l.id)}
            className={cn(
              "relative min-h-10 min-w-12 rounded-lg px-3 text-sm font-medium transition-colors sm:min-h-8",
              active ? "bg-white text-[var(--warm-900)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--warm-900)]",
            )}
          >
            {l.short}
            {missing?.[l.id] && (
              <>
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--danger)]" aria-hidden />
                <span className="sr-only"> — є незаповнені поля</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── List row controls ─────────────────────────────────────────────────────

export function MoveDeleteControls({
  index,
  count,
  onMove,
  onDelete,
  deleteLabel = "Видалити",
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onDelete?: () => void;
  deleteLabel?: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <IconButton label="Вище" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        <ChevronUp size={16} />
      </IconButton>
      <IconButton label="Нижче" disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
        <ChevronDown size={16} />
      </IconButton>
      {onDelete && (
        <IconButton label={deleteLabel} onClick={onDelete} className="hover:text-[var(--danger)]">
          <Trash2 size={16} />
        </IconButton>
      )}
    </div>
  );
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// ── Confirm dialog (promise-based) ────────────────────────────────────────

type ConfirmOptions = { title: string; description?: ReactNode; confirmLabel?: string; tone?: "danger" | "primary" };
const ConfirmContext = createContext<(opts: ConfirmOptions) => Promise<boolean>>(async () => false);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOpts(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog.Root open={opts !== null} onOpenChange={(open) => !open && close(false)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[300] bg-[var(--warm-900)]/40 backdrop-blur-[2px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[301] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none">
            <Dialog.Title className="text-2xl leading-snug" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 600 }}>
              {opts?.title}
            </Dialog.Title>
            {opts?.description && (
              <Dialog.Description asChild>
                <div className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{opts.description}</div>
              </Dialog.Description>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => close(false)}>
                Скасувати
              </Button>
              <Button variant={opts?.tone === "primary" ? "primary" : "danger"} onClick={() => close(true)} autoFocus>
                {opts?.confirmLabel ?? "Підтвердити"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);

// ── Toasts ────────────────────────────────────────────────────────────────

type ToastTone = "success" | "danger" | "info";
type Toast = { id: number; title: string; description?: string; tone: ToastTone; action?: { label: string; onClick: () => void } };
type ToastInput = Omit<Toast, "id" | "tone"> & { tone?: ToastTone };
const ToastContext = createContext<(t: ToastInput) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (t: ToastInput) => {
      const id = nextId.current++;
      setToasts((all) => [...all.slice(-3), { tone: "success", ...t, id }]);
      setTimeout(() => dismiss(id), t.action ? 8000 : 4500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-3 z-[400] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "danger" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-[var(--sand-200)] bg-white p-3 shadow-lg"
          >
            {t.tone === "danger" ? (
              <TriangleAlert size={18} className="mt-0.5 shrink-0 text-[var(--danger)]" aria-hidden />
            ) : t.tone === "info" ? (
              <Info size={18} className="mt-0.5 shrink-0 text-[var(--gold-600)]" aria-hidden />
            ) : (
              <CircleCheck size={18} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden />
            )}
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-[var(--warm-900)]">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[var(--muted)]">{t.description}</p>}
              {t.action && (
                <button
                  type="button"
                  className="mt-1.5 font-medium text-[var(--gold-600)] underline-offset-2 hover:underline"
                  onClick={() => {
                    t.action?.onClick();
                    dismiss(t.id);
                  }}
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button type="button" aria-label="Закрити" className="-m-1 p-1 text-[var(--muted)] hover:text-[var(--warm-900)]" onClick={() => dismiss(t.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
