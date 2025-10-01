'use client';

import React from 'react';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { motion } from 'framer-motion';

interface OnboardingNoticeProps {
  className?: string;
}

export default function OnboardingNotice({ className = "" }: OnboardingNoticeProps) {
  const { currentStep, isCompleted, hasTrainingAccess, hasNutritionAccess, isLoading } = useOnboardingV2();

  // Don't show notice if onboarding is completed, still loading, or currentStep is null (not initialized)
  if (isCompleted || isLoading || currentStep === null) {
    return null;
  }

  const getStepInstructions = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Welkomstvideo bekijken",
          message: "Bekijk de welkomstvideo om het platform te leren kennen. De video moet volledig worden afgespeeld voordat je naar de volgende stap kunt gaan.",
          icon: "🎬",
          color: "from-blue-500 to-blue-600"
        };
      
      case 2:
        return {
          title: "Hoofddoel instellen",
          message: "Beschrijf je hoofddoel in één zin. Dit helpt ons je de juiste content en uitdagingen te geven.",
          icon: "🎯",
          color: "from-green-500 to-green-600"
        };
      
      case 3:
        return {
          title: "Uitdagingen selecteren",
          message: "Voeg 3 uitdagingen toe die je dagelijks wilt voltooien. Klik op 'Nieuwe Challenge Toevoegen' of gebruik de 'Challenge Bibliotheek' om challenges te selecteren.",
          icon: "🔥",
          color: "from-orange-300 to-orange-400"
        };
      
      case 4:
        if (hasTrainingAccess) {
          return {
            title: "Trainingsschema kiezen",
            message: "Vul je profiel in en selecteer daarna een trainingsschema. Klik op 'Selecteer Dit Schema' om door te gaan naar de volgende stap.",
            icon: "💪",
            color: "from-purple-500 to-purple-600"
          };
        }
        return null;
      
      case 5:
        if (hasNutritionAccess) {
          return {
            title: "Voedingsplan selecteren",
            message: "Kies het voedingsplan dat het beste bij jouw doel past. Klik op 'Selecteer Dit Plan' om door te gaan naar de volgende stap.",
            icon: "🥗",
            color: "from-teal-500 to-teal-600"
          };
        }
        return null;
      
      case 6:
        return {
          title: "Forum introductie",
          message: "Maak kennis met de Brotherhood community. Stel jezelf voor in het forum om je onboarding te voltooien.",
          icon: "👥",
          color: "from-indigo-500 to-indigo-600"
        };
      
      default:
        return null;
    }
  };

  const instructions = getStepInstructions();

  if (!instructions) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-4 sm:mb-6 bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/50 rounded-xl p-4 sm:p-5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-[#FFD700] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-left">
          <h4 className="text-white font-semibold text-sm mb-1">Belangrijke instructie</h4>
          <p className="text-gray-200 text-sm">
            {instructions.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
