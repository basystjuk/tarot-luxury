'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { useLanguage } from '@/hooks/useLanguage';
import BookingFormContent from './BookingFormContent';

export default function BookingModal() {
  const { bookingOpen, bookingTopic, closeBooking } = useModal();
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeBooking(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeBooking]);

  useEffect(() => {
    document.body.style.overflow = bookingOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [bookingOpen]);

  if (!bookingOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1C1512]/70 backdrop-blur-sm" onClick={closeBooking} />

      <div className="relative z-10 w-full max-w-lg bg-[#FDFBF7] rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <h2
            className="text-2xl text-[#1C1512]"
            style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500 }}
          >
            {isRu ? 'Форма записи' : isEn ? 'Booking Form' : 'Форма запису'}
          </h2>
          <button
            onClick={closeBooking}
            className="p-2 text-[#7A6A58] hover:text-[#1C1512] transition-colors rounded-full hover:bg-[rgba(196,169,122,0.1)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8">
          <BookingFormContent
            defaultTopic={bookingTopic || undefined}
            onSuccess={closeBooking}
          />
        </div>
      </div>
    </div>
  );
}
