'use client';

import React from 'react';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { motion } from 'framer-motion';

interface OnboardingNoticeProps {
  className?: string;
}

export default function OnboardingNotice({ className = "" }: OnboardingNoticeProps) {
  const { currentStep, isCompleted, hasTrainingAccess, hasNutritionAccess } = useOnboardingV2();

  // Don't show notice if onboarding is completed
  if (isCompleted) {
    return null;
  }

  const getStepInstructions = () => {
    switch (currentStep) {
      case 0:
        return {
          title: "Welkomstvideo bekijken",
          message: "Bekijk de welkomstvideo om het platform te leren kennen. De video moet volledig worden afgespeeld voordat je naar de volgende stap kunt gaan.",
          icon: "🎬",
          color: "from-blue-500 to-blue-600"
        };
      
      case 1:
        return {
          title: "Hoofddoel instellen",
          message: "Beschrijf je hoofddoel in één zin. Dit helpt ons je de juiste content en uitdagingen te geven.",
          icon: "🎯",
          color: "from-green-500 to-green-600"
        };
      
      case 2:
        return {
          title: "Uitdagingen selecteren",
          message: "Voeg 3 uitdagingen toe die je dagelijks wilt voltooien. Klik op 'Nieuwe Challenge Toevoegen' of gebruik de 'Challenge Bibliotheek' om challenges te selecteren.",
          icon: "🔥",
          color: "from-orange-500 to-orange-600"
        };
      
      case 3:
        if (hasTrainingAccess) {
          return {
            title: "Trainingsschema kiezen",
            message: "Selecteer een trainingsschema dat bij je past. Klik op 'Selecteer Dit Schema' om door te gaan naar de volgende stap.",
            icon: "💪",
            color: "from-purple-500 to-purple-600"
          };
        }
        return null;
      
      case 4:
        if (hasNutritionAccess) {
          return {
            title: "Voedingsplan selecteren",
            message: "Kies het voedingsplan dat het beste bij jouw doel past. Klik op 'Selecteer Dit Plan' om door te gaan naar de volgende stap.",
            icon: "🥗",
            color: "from-teal-500 to-teal-600"
          };
        }
        return null;
      
      case 5:
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
      className={`bg-gradient-to-r ${instructions.color} bg-opacity-10 border border-current border-opacity-30 rounded-xl p-6 mb-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 bg-gradient-to-r ${instructions.color} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
            {instructions.icon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">
            {instructions.title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {instructions.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
