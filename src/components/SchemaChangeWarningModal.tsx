'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface SchemaChangeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentSchemaName: string;
}

export default function SchemaChangeWarningModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  currentSchemaName 
}: SchemaChangeWarningModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Ensure modal is fully visible (centered) and lock body scroll while open
  useEffect(() => {
    if (!isOpen) {
      if (typeof document !== 'undefined') document.body.style.overflow = '';
      return;
    }
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {}
    }
    const id = window.setTimeout(() => {
      try {
        modalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        modalRef.current?.focus();
      } catch {}
    }, 100);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            className="relative bg-[#181F17] border border-[#3A4D23] rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full">
                <ExclamationTriangleIcon className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Schema Wijzigen?
              </h2>
              <p className="text-gray-300 text-lg">
                Je hebt momenteel een actief trainingsschema
              </p>
            </div>

            {/* Current Schema Info */}
            <div className="bg-[#232D1A]/50 border border-[#3A4D23] rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A]" />
                <div>
                  <p className="text-white font-medium">Huidige Schema:</p>
                  <p className="text-[#8BAE5A]">{currentSchemaName}</p>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <ClockIcon className="w-6 h-6 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium mb-2">Belangrijke Waarschuwing</p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    We adviseren om een trainingsschema minimaal <strong>8 weken</strong> te volgen voor optimale resultaten. 
                    Door je schema nu te wijzigen, wordt je huidige voortgang gereset en start je opnieuw.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] rounded-xl font-medium hover:bg-[#4A5D33] transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white rounded-xl font-medium hover:from-[#D97706] hover:to-[#B45309] transition-all"
              >
                Ja, Schema Wijzigen
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-xs">
                Je kunt altijd terugkeren naar je vorige schema via je profiel
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
