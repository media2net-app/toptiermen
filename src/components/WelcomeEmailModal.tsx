'use client';

import { useState } from 'react';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  UserIcon,
  CogIcon,
  RocketLaunchIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface WelcomeEmailModalProps {
  isOpen: boolean;
  userName: string;
  onComplete: () => void;
  onClose: () => void;
}

export default function WelcomeEmailModal({ 
  isOpen, 
  userName, 
  onComplete, 
  onClose 
}: WelcomeEmailModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const welcomeSteps = [
    {
      icon: <EnvelopeIcon className="w-8 h-8" />,
      title: 'Welkom bij Top Tier Men!',
      description: `Hallo ${userName}, welkom in de community van mannen die klaar zijn om te groeien.`,
      action: 'Verder'
    },
    {
      icon: <UserIcon className="w-8 h-8" />,
      title: 'Je Profiel Voltooien',
      description: 'Laten we je profiel afmaken zodat we je beter kunnen helpen met je doelen.',
      action: 'Profiel Voltooien'
    },
    {
      icon: <CogIcon className="w-8 h-8" />,
      title: 'Persoonlijke Instellingen',
      description: 'Configureer je voorkeuren en stel je doelen in voor een optimale ervaring.',
      action: 'Instellingen'
    },
    {
      icon: <RocketLaunchIcon className="w-8 h-8" />,
      title: 'Start Je Reis',
      description: 'Je bent klaar om te beginnen! Ga naar je dashboard en start je eerste missie.',
      action: 'Naar Dashboard'
    }
  ];

  const handleNext = () => {
    if (currentStep < welcomeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const currentWelcomeStep = welcomeSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] p-8 max-w-lg w-full shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-white">Welkom!</h2>
          <button
            onClick={onClose}
            className="text-[#B6C948] hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-[#B6C948]/20 rounded-full text-[#B6C948]">
              {currentWelcomeStep.icon}
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-3">
            {currentWelcomeStep.title}
          </h3>
          
          <p className="text-[#B6C948] text-lg">
            {currentWelcomeStep.description}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {welcomeSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-[#B6C948]' : 'bg-[#3A4D23]'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 px-4 border border-[#3A4D23] text-[#B6C948] font-semibold rounded-xl hover:bg-[#3A4D23] transition-colors"
          >
            Overslaan
          </button>
          
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-semibold rounded-xl hover:from-[#8BAE5A] hover:to-[#B6C948] transition-all duration-200"
          >
            {currentWelcomeStep.action}
          </button>
        </div>

        {/* Quick tips */}
        <div className="mt-6 p-4 bg-[#181F17] rounded-xl border border-[#3A4D23]">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-[#B6C948] mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-[#B6C948] text-sm font-semibold mb-1">
                Tip van de dag
              </p>
              <p className="text-[#8BAE5A] text-xs">
                {currentStep === 0 && "Neem de tijd om je profiel goed in te vullen. Dit helpt ons om content aan te bieden die perfect bij jou past."}
                {currentStep === 1 && "Upload een profielfoto om je profiel persoonlijker te maken en jezelf te motiveren."}
                {currentStep === 2 && "Stel realistische doelen in. Kleine stappen leiden tot grote veranderingen."}
                {currentStep === 3 && "Begin met je eerste missie. Consistentie is belangrijker dan perfectie."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 