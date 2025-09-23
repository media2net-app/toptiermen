'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AcademicCapIcon, 
  CheckCircleIcon, 
  ArrowRightIcon,
  FireIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

interface PostOnboardingSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSchema: {
    id: string;
    name: string;
    description: string;
    difficulty: string;
    estimated_duration: string;
    training_goal: string;
    equipment_type: string;
  } | null;
}

export default function PostOnboardingSchemaModal({ 
  isOpen, 
  onClose, 
  selectedSchema 
}: PostOnboardingSchemaModalProps) {
  const router = useRouter();

  if (!isOpen || !selectedSchema) return null;

  const handleGoToTraining = () => {
    onClose();
    router.push('/dashboard/mijn-trainingen');
  };

  const handleChangeSchema = () => {
    onClose();
    // User stays on current page to select different schema
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#0A0F0A] bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-[#181F17] border border-[#3A4D23] rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#B6C948] to-[#3A4D23] rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-8 h-8 text-[#181F17]" />
              </div>
              <h2 className="text-[#B6C948] text-2xl font-bold font-figtree mb-2">
                Je Trainingsschema is Geselecteerd!
              </h2>
              <p className="text-[#8BAE5A] text-sm">
                Je onboarding is voltooid. Hier is je geselecteerde trainingsschema.
              </p>
            </div>

            {/* Schema Details */}
            <div className="bg-[#1A1A1A] border border-[#3A4D23] rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-[#8BAE5A]/20 rounded-xl">
                  <AcademicCapIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-lg font-semibold mb-2">
                    {selectedSchema.name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {selectedSchema.description}
                  </p>
                  
                  {/* Schema Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <FireIcon className="w-4 h-4 text-[#B6C948]" />
                      <span className="text-gray-300 text-sm">
                        {selectedSchema.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-[#B6C948]" />
                      <span className="text-gray-300 text-sm">
                        {selectedSchema.estimated_duration}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ChartBarIcon className="w-4 h-4 text-[#B6C948]" />
                      <span className="text-gray-300 text-sm capitalize">
                        {selectedSchema.training_goal.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 text-sm">
                        {selectedSchema.equipment_type === 'gym' ? '🏋️ Gym' : 
                         selectedSchema.equipment_type === 'home' ? '🏠 Thuis' : 
                         '🌳 Outdoor'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGoToTraining}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold shadow-lg shadow-[#8BAE5A]/20"
              >
                <span>Ga naar Mijn Trainingen</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleChangeSchema}
                className="flex-1 px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors font-semibold border border-[#8BAE5A]/30"
              >
                Ander Schema Kiezen
              </button>
            </div>

            {/* Info Text */}
            <p className="text-center text-xs text-gray-400 mt-4">
              Je kunt altijd terugkomen om je trainingsschema te wijzigen
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
