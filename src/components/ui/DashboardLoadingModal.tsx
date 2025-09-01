'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface DashboardLoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export default function DashboardLoadingModal({ isOpen, message = "Dashboard laden..." }: DashboardLoadingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 z-50"
        >
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A2115] rounded-xl p-8 border border-[#B6C948] shadow-2xl max-w-md w-full mx-auto"
            >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center mx-auto mb-6">
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
