'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, RocketLaunchIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'nutrition' | 'training';
}

export default function UpgradeModal({ isOpen, onClose, type }: UpgradeModalProps) {
  console.log('🔧 DEBUG: UpgradeModal render', { isOpen, type });
  
  const isNutrition = type === 'nutrition';
  const title = isNutrition ? 'Voedingsplannen' : 'Trainingsschemas';
  const icon = isNutrition ? RocketLaunchIcon : AcademicCapIcon;
  const IconComponent = icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#232D1A] rounded-2xl shadow-2xl border border-[#3A4D23]/40 max-w-md w-full mx-4">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]/40">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-[#181F17]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Upgrade vereist
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#8BAE5A] hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {title} zijn alleen beschikbaar voor Premium en Lifetime leden
                  </h3>
                  <p className="text-[#8BAE5A] text-sm">
                    Mocht je deze onderdelen willen nemen dan contact op met Rick voor het upgraden van je pakket
                  </p>
                </div>

                {/* Features list */}
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">
                    Upgrade nu om toegang te krijgen tot:
                  </h4>
                  <ul className="space-y-2">
                    {isNutrition ? (
                      <>
                        <li className="flex items-center text-[#8BAE5A] text-sm">
                          <div className="w-2 h-2 bg-[#8BAE5A] rounded-full mr-3"></div>
                          Persoonlijke voedingsplannen
                        </li>
                        <li className="flex items-center text-[#8BAE5A] text-sm">
                          <div className="w-2 h-2 bg-[#8BAE5A] rounded-full mr-3"></div>
                          Macro tracking
                        </li>
                        <li className="flex items-center text-[#8BAE5A] text-sm">
                          <div className="w-2 h-2 bg-[#8BAE5A] rounded-full mr-3"></div>
                          Recepten database
                        </li>
                        <li className="flex items-center text-[#8BAE5A] text-sm">
                          <div className="w-2 h-2 bg-[#8BAE5A] rounded-full mr-3"></div>
                          Voedingsadvies
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center text-[#8BAE5A] text-sm">
                          <div className="w-2 h-2 bg-[#8BAE5A] rounded-full mr-3"></div>
                          Persoonlijke trainingsschemas
                        </li>
                        <li className="flex items-center text-[#8BAE5A] text-sm">
                          <div className="w-2 h-2 bg-[#8BAE5A] rounded-full mr-3"></div>
                          Progressie tracking
                        </li>
                        <li className="flex items-center text-[#8BAE5A] text-sm">
                          <div className="w-2 h-2 bg-[#8BAE5A] rounded-full mr-3"></div>
                          Oefening database
                        </li>
                        <li className="flex items-center text-[#8BAE5A] text-sm">
                          <div className="w-2 h-2 bg-[#8BAE5A] rounded-full mr-3"></div>
                          Trainingsadvies
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-[#3A4D23]/40 text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23]/60 transition-colors"
                  >
                    Later
                  </button>
                  <button
                    onClick={() => {
                      // Here you could add contact Rick functionality
                      onClose();
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold rounded-lg hover:from-[#B6C948] hover:to-[#E6C200] transition-all"
                  >
                    Contact Rick
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
