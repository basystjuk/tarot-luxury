'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { useLanguage } from '@/hooks/useLanguage';
import QuickContactLinks from './QuickContactLinks';

export default function QuickContactModal() {
  const { quickContactOpen, closeQuickContact } = useModal();
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeQuickContact(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeQuickContact]);

  useEffect(() => {
    document.body.style.overflow = quickContactOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [quickContactOpen]);

  if (!quickContactOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1C1512]/70 backdrop-blur-sm" onClick={closeQuickContact} />

      <div className="relative z-10 w-full max-w-sm bg-[#FDFBF7] rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-7 pt-7 pb-2">
          <h2
            className="text-2xl text-[#1C1512]"
            style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500 }}
          >
            {isRu ? 'Быстрая связь' : isEn ? 'Quick Contact' : "Швидкий зв'язок"}
          </h2>
          <button
            onClick={closeQuickContact}
            className="p-2 text-[#7A6A58] hover:text-[#1C1512] transition-colors rounded-full hover:bg-[rgba(196,169,122,0.1)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-7 pb-7">
          <QuickContactLinks />
        </div>
      </div>
    </div>
  );
}
