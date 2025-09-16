'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface DashboardLoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export default function DashboardLoadingModal({ isOpen, message = "Dashboard laden..." }: DashboardLoadingModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 z-[9999]"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#232D1A] rounded-xl p-8 border border-[#B6C948] shadow-2xl max-w-md w-full mx-4"
            style={{
              position: 'relative',
              zIndex: 10000
            }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-[#B6C948] rounded-full flex items-center justify-center mx-auto mb-6">
                <ArrowPathIcon className="w-8 h-8 text-[#181F17] animate-spin" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                Dashboard Laden
              </h3>
              
              <p className="text-[#B6C948] mb-6">
                {message}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-[#B6C948] rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-[#B6C948] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[#B6C948] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                
                <p className="text-[#8BAE5A] text-sm">
                  Jouw persoonlijke gegevens worden opgehaald...
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
