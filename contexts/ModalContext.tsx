'use client';
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ModalContextValue {
  bookingOpen: boolean;
  bookingTopic: string;
  openBooking: (topic?: string) => void;
  closeBooking: () => void;
  quickContactOpen: boolean;
  openQuickContact: () => void;
  closeQuickContact: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingTopic, setBookingTopic] = useState('');
  const [quickContactOpen, setQuickContactOpen] = useState(false);

  const openBooking = useCallback((topic?: string) => {
    setBookingTopic(topic ?? '');
    setBookingOpen(true);
  }, []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);
  const openQuickContact = useCallback(() => setQuickContactOpen(true), []);
  const closeQuickContact = useCallback(() => setQuickContactOpen(false), []);

  return (
    <ModalContext.Provider value={{ bookingOpen, bookingTopic, openBooking, closeBooking, quickContactOpen, openQuickContact, closeQuickContact }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used inside ModalProvider');
  return ctx;
}
