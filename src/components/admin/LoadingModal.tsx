'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export default function LoadingModal({ isOpen, message = "Gegevens laden..." }: LoadingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#232D1A] rounded-xl p-8 border border-[#B6C948] shadow-2xl max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-[#B6C948] rounded-full flex items-center justify-center mx-auto mb-6">
                <ArrowPathIcon className="w-8 h-8 text-[#181F17] animate-spin" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                Admin Dashboard Laden
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
                  Statistieken worden opgehaald...
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
