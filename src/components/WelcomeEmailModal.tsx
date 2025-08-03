'use client';

import { useState } from 'react';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  UserIcon,
  CogIcon,
  RocketLaunchIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { getWelcomeEmailTemplate } from '@/lib/email-templates';

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
  const [showEmailPreview, setShowEmailPreview] = useState(false);

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

  const handleShowEmailPreview = () => {
    setShowEmailPreview(true);
  };

  const handleCloseEmailPreview = () => {
    setShowEmailPreview(false);
  };

  if (!isOpen) return null;

  const currentWelcomeStep = welcomeSteps[currentStep];
  const emailTemplate = getWelcomeEmailTemplate(userName, 'https://toptiermen.com/dashboard');

  if (showEmailPreview) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Email Preview: Welkom & Introductie</h2>
            <button
              onClick={handleCloseEmailPreview}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <div className="text-sm text-gray-600 mb-2">
                <strong>Onderwerp:</strong> {emailTemplate.subject}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>Verzonden na:</strong> Direct
              </div>
              <div className="text-sm text-gray-600">
                <strong>Status:</strong> <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Actief</span>
              </div>
            </div>
            
            <div 
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: emailTemplate.html }}
            />
          </div>
        </div>
      </div>
    );
  }

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

        <div className="flex gap-3 mb-6">
          <button
            onClick={handleShowEmailPreview}
            className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#B6C948] font-semibold rounded-lg hover:bg-[#4A5D33] transition-colors flex items-center justify-center gap-2"
          >
            <EyeIcon className="w-4 h-4" />
            Email Preview
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#B6C948] font-semibold rounded-lg hover:bg-[#4A5D33] transition-colors"
          >
            Overslaan
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-2 bg-[#8BAE5A] text-black font-semibold rounded-lg hover:bg-[#A6C97B] transition-colors"
          >
            {currentWelcomeStep.action}
          </button>
        </div>

        <div className="mt-6 text-center">
          <div className="flex justify-center space-x-2">
            {welcomeSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-[#8BAE5A]' : 'bg-[#3A4D23]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 