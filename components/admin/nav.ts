import {
  Bell,
  Brain,
  CircleHelp,
  Clapperboard,
  History,
  House,
  Images,
  LayoutDashboard,
  Newspaper,
  PartyPopper,
  Phone,
  Settings,
  Sparkles,
  Star,
  Tag,
  ToggleRight,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ContentSection } from "@/lib/content-validation";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Validation section whose issues show as a badge on this item. */
  section?: ContentSection;
}

export interface NavGroup {
  label: string;
  /** Sections whose content the public site doesn't show right now. */
  inactive?: boolean;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  { label: "Огляд", items: [{ href: "/admin", label: "Головний екран", icon: LayoutDashboard }] },
  {
    label: "Контент сайту",
    items: [
      { href: "/admin/services", label: "Послуги та ціни", icon: Tag, section: "services" },
      { href: "/admin/faq", label: "Питання та відповіді", icon: CircleHelp, section: "faq" },
      { href: "/admin/about", label: "Про мене", icon: UserRound, section: "about" },
      { href: "/admin/contacts", label: "Контакти", icon: Phone, section: "contacts" },
      { href: "/admin/studio", label: "Тексти Студії", icon: Sparkles },
    ],
  },
  { label: "Медіа", items: [{ href: "/admin/media", label: "Галерея та фото", icon: Images }] },
  {
    label: "Інструменти",
    items: [
      { href: "/admin/tools", label: "Доступ до інструментів", icon: ToggleRight },
      { href: "/admin/prompts", label: "AI-промти", icon: Brain, section: "prompts" },
      { href: "/admin/videos", label: "Відео", icon: Clapperboard },
    ],
  },
  {
    label: "Аудиторія",
    items: [
      { href: "/admin/users", label: "Користувачі", icon: Users },
      { href: "/admin/notifications", label: "Сповіщення", icon: Bell },
    ],
  },
  {
    label: "Сайт",
    items: [
      { href: "/admin/celebration", label: "Святкова анімація", icon: PartyPopper, section: "celebration" },
      { href: "/admin/history", label: "Історія версій", icon: History },
      { href: "/admin/settings", label: "Налаштування і стан", icon: Settings },
    ],
  },
  {
    label: "Не відображається на сайті",
    inactive: true,
    items: [
      { href: "/admin/testimonials", label: "Відгуки", icon: Star, section: "testimonials" },
      { href: "/admin/home", label: "Головна (hero)", icon: House },
      { href: "/admin/blog", label: "Блог (Telegram-блок)", icon: Newspaper },
    ],
  },
];

export const SECTION_HREF: Record<ContentSection, string> = {
  services: "/admin/services",
  faq: "/admin/faq",
  about: "/admin/about",
  contacts: "/admin/contacts",
  celebration: "/admin/celebration",
  prompts: "/admin/prompts",
  testimonials: "/admin/testimonials",
};
