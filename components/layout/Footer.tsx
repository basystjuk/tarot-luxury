import Link from "next/link";

const pageLinks = [
  { href: "/", label: "Головна" },
  { href: "/about", label: "Про мене" },
  { href: "/blog", label: "Блог" },
  { href: "/faq", label: "Питання та відповіді" },
  { href: "/contacts", label: "Контакти" },
];

const serviceLinks = [
  { href: "/services#personal", label: "Особиста консультація" },
  { href: "/services#couple", label: "Аналіз пари" },
  { href: "/services#month", label: "Картка місяця" },
  { href: "/services#year", label: "Річний прогноз" },
];

const toolLinks = [
  { href: "/tools/natal-chart", label: "Натальна карта" },
  { href: "/tools/moon-phase", label: "Місячний гороскоп" },
  { href: "/tools/compatibility", label: "Сумісність знаків" },
  { href: "/tools/daily-card", label: "Карта дня" },
  { href: "/tools/numerology", label: "Нумерологія" },
];

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.8 2.2L1.5 10.3c-1.3.5-1.3 1.4-.2 1.8l5.1 1.6 2 6.2c.2.7.5.9 1 .9.4 0 .6-.2 1-.5l2.4-2.4 4.9 3.6c.9.5 1.6.2 1.8-.8L22.9 3.4c.3-1.3-.5-1.8-1.1-1.2z"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#1C1512] text-white/70">
      <div className="h-px bg-gradient-to-r from-transparent via-[#C4A97A] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <span
                className="text-3xl text-white tracking-wide block mb-1"
                style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond')", fontWeight: 300 }}
              >
                Ellen Soul
              </span>
              <span
                className="text-xs tracking-[0.18em] uppercase text-[#C4A97A]"
                style={{ fontFamily: "var(--font-jost, 'Jost')" }}
              >
                таро · психологія · відносини
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/50 mb-8 max-w-xs">
              Допомагаю жінкам знайти відповіді серця через мову карт і глибинну психологію.
            </p>

            {/* Socials */}
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-[#D4A853] hover:border-[#D4A853] transition-all duration-300"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-[#D4A853] hover:border-[#D4A853] transition-all duration-300"
                aria-label="Telegram"
              >
                <TelegramIcon />
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4
              className="text-xs tracking-[0.15em] uppercase text-[#C4A97A] mb-5"
              style={{ fontFamily: "var(--font-jost, 'Jost')", fontWeight: 500 }}
            >
              Сторінки
            </h4>
            <ul className="space-y-3">
              {pageLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-[#D4A853] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4
              className="text-xs tracking-[0.15em] uppercase text-[#C4A97A] mb-5"
              style={{ fontFamily: "var(--font-jost, 'Jost')", fontWeight: 500 }}
            >
              Послуги
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-[#D4A853] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4
              className="text-xs tracking-[0.15em] uppercase text-[#C4A97A] mb-5"
              style={{ fontFamily: "var(--font-jost, 'Jost')", fontWeight: 500 }}
            >
              Інструменти
            </h4>
            <ul className="space-y-3">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-[#D4A853] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-px bg-white/8 mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/30">
          <p>© {new Date().getFullYear()} Ellen Soul. Усі права захищено.</p>
          <p>Made with ♥ в Україні</p>
        </div>
      </div>
    </footer>
  );
}
