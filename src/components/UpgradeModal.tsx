'use client';

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

  if (!isOpen) {
    console.log('🔧 DEBUG: Modal not open, returning null');
    return null;
  }

  console.log('🔧 DEBUG: Modal is open, rendering modal');
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75 z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-[9999] bg-red-500 rounded-2xl shadow-2xl border border-[#3A4D23]/40 max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-white text-xl font-bold mb-4">TEST MODAL - {title}</h2>
          <p className="text-white mb-4">Dit is een test modal om te zien of het werkt.</p>
          <button
            onClick={onClose}
            className="bg-white text-black px-4 py-2 rounded"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}