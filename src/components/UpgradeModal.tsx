'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, RocketLaunchIcon, AcademicCapIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'nutrition' | 'training';
}

export default function UpgradeModal({ isOpen, onClose, type }: UpgradeModalProps) {
  const isNutrition = type === 'nutrition';
  const title = isNutrition ? 'Voedingsplannen' : 'Trainingsschemas';
  const IconComponent = isNutrition ? RocketLaunchIcon : AcademicCapIcon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[#232D1A] rounded-2xl shadow-2xl border border-[#3A4D23] max-w-lg w-full mx-4"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-t-2xl p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Account Upgrade</h3>
                  <p className="text-white/90 text-sm">{title}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-white text-lg mb-2">
                  Wil je toegang tot <span className="font-bold text-[#B6C948]">{title.toLowerCase()}</span>?
                </p>
                <p className="text-gray-300">
                  Neem contact op met Rick voor een account upgrade naar Premium of Lifetime Tier.
                </p>
              </div>

              {/* Contact Info Card */}
              <div className="bg-[#181F17] rounded-xl p-5 border border-[#3A4D23]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                    <EnvelopeIcon className="w-5 h-5 text-[#232D1A]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Contact Rick</h4>
                    <p className="text-gray-400 text-sm">Voor account upgrades</p>
                  </div>
                </div>
                
                <a
                  href="mailto:rick@toptiermen.eu"
                  className="block w-full text-center bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-white font-semibold py-3 rounded-lg hover:from-[#7A9D4A] hover:to-[#A6C838] transition-all duration-200"
                >
                  rick@toptiermen.eu
                </a>
              </div>

              {/* Benefits List */}
              <div className="bg-[#181F17]/50 rounded-lg p-4 border border-[#3A4D23]/50">
                <h5 className="text-[#B6C948] font-semibold mb-3 text-sm">Wat krijg je met een upgrade?</h5>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#8BAE5A] rounded-full"></div>
                    Toegang tot alle voedingsplannen
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#8BAE5A] rounded-full"></div>
                    Gepersonaliseerde trainingsschemas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#8BAE5A] rounded-full"></div>
                    Receptenbibliotheek
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#8BAE5A] rounded-full"></div>
                    Volledige platform toegang
                  </li>
                </ul>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#181F17] text-white rounded-lg font-semibold hover:bg-[#3A4D23] transition-colors border border-[#3A4D23]"
              >
                Sluiten
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}