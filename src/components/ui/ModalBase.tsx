'use client';

import React, { useEffect, useRef } from 'react';

type ModalBaseProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  zIndexClassName?: string; // e.g. z-50
};

/**
 * ModalBase
 * - Unified overlay style
 * - Locks body scroll
 * - Auto-centers on mobile (<= 640px): scrolls viewport to top and scrolls modal into view
 * - Click-outside closes
 */
export default function ModalBase({ isOpen, onClose, children, className = '', zIndexClassName = 'z-50' }: ModalBaseProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      if (typeof document !== 'undefined') document.body.style.overflow = '';
      return;
    }
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';

    const center = () => {
      try {
        // Always scroll viewport to top first, then smoothly center the modal into view
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          try { modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
        }, 60);
        modalRef.current?.focus();
      } catch {}
    };
    const id = window.setTimeout(center, 50);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm ${zIndexClassName} flex items-center justify-center p-4`} onClick={onClose}>
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={`w-full max-w-[92vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto focus:outline-none ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
