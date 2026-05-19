"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/hooks/useLanguage';
import { useModal } from '@/contexts/ModalContext';

export default function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { openBooking } = useModal();
  const pathname = usePathname();

  const navLinks = [
    { href: `/${language}`, label: t('nav.home') },
    { href: `/${language}/about`, label: t('nav.about') },
    { href: `/${language}/services`, label: t('nav.services') },
    { href: `/${language}/blog`, label: t('nav.blog') },
    { href: `/${language}/studio`, label: t('nav.studio') },
    { href: `/${language}/contacts`, label: t('nav.contacts') },
    { href: `/${language}/faq`, label: language === 'ru' ? 'Подсказки' : language === 'en' ? 'Tips' : 'Підказки' },
  ];
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#FDFBF7]/92 backdrop-blur-md shadow-[0_1px_24px_rgba(0,0,0,0.06)] border-b border-[rgba(196,169,122,0.15)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={`/${language}`} className="flex flex-col items-center leading-none group">
            <span
              className="text-2xl tracking-wide text-[#1C1512] transition-colors group-hover:text-[#B8883A]"
              style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond')", fontWeight: 400 }}
            >
              Ellen Soul
            </span>
            <span
              className="text-[10px] tracking-[0.18em] uppercase text-[#7A6A58] mt-0.5"
              style={{ fontFamily: "var(--font-jost, 'Jost')", fontWeight: 400 }}
            >
              {t('header.logo.subtitle')}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#5C4530] hover:text-[#B8883A] transition-colors tracking-wide"
                style={{ fontFamily: "var(--font-jost, 'Jost')" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Language Switcher + CTA + Hamburger */}
          <div className="flex items-center gap-4">
            {/* Language switcher — desktop */}
            <div className="hidden lg:flex items-center gap-0 text-xs tracking-widest font-light select-none">
              {(['uk', 'ru', 'en'] as const).map((lang, i, arr) => (
                <React.Fragment key={lang}>
                  <button
                    onClick={() => setLanguage(lang)}
                    className={`px-1.5 py-0.5 transition-colors duration-200 ${
                      language === lang ? 'text-[#B8883A] font-semibold' : 'text-[#7A6A58] hover:text-[#1C1512]'
                    }`}
                  >
                    {lang === 'uk' ? 'ua' : lang}
                  </button>
                  {i < arr.length - 1 && <span className="text-[#C4A97A]/50">|</span>}
                </React.Fragment>
              ))}
            </div>
            <button
              onClick={() => openBooking()}
              className="hidden sm:inline-flex btn-primary text-sm px-6 py-3"
            >{t('header.cta')}</button>
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 text-[#1C1512] hover:text-[#B8883A] transition-colors"
              aria-label="Відкрити меню"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-[#1C1512]"
          >
            <div className="flex flex-col h-full px-8 py-10">
              {/* Close */}
              <div className="flex justify-between items-center mb-16">
                <span
                  className="text-2xl text-white/90 tracking-wide"
                  style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond')" }}
                >
                  Ellen Soul
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 text-white/70 hover:text-[#D4A853] transition-colors"
                  aria-label="Закрити меню"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Links */}
              <nav className="flex flex-col gap-2 flex-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, ease: [0.19, 1, 0.22, 1] }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block py-4 border-b border-white/10 text-3xl text-white/80 hover:text-[#D4A853] transition-colors"
                      style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond')", fontWeight: 300 }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Language Switcher */}
                <div className="flex items-center gap-0 ml-4 text-xs tracking-widest font-light select-none">
                  {(['uk', 'ru', 'en'] as const).map((lang, i, arr) => (
                    <React.Fragment key={lang}>
                      <button
                        onClick={() => { setLanguage(lang); setMenuOpen(false); }}
                        className={`px-1 py-0.5 transition-colors duration-200 ${
                          language === lang ? 'text-[#C9A96E] font-semibold' : 'text-white/50 hover:text-white/80'
                        }`}
                      >
                        {lang === 'uk' ? 'УКР' : lang === 'ru' ? 'РУС' : 'ENG'}
                      </button>
                      {i < arr.length - 1 && <span className="text-white/30">|</span>}
                    </React.Fragment>
                  ))}
                </div>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="pt-8"
              >
                <button
                  onClick={() => { openBooking(); setMenuOpen(false); }}
                  className="btn-primary w-full text-center"
                >
                  {language === 'ru' ? 'Записаться на консультацию' : language === 'en' ? 'Book a consultation' : 'Записатись на консультацію'}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
