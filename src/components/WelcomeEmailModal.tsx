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
          
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Email Header */}
            <div className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold">T</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Toptiermen</h3>
                    <p className="text-sm opacity-90">Broederschap van Top Performers</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Verzonden na:</div>
                  <div className="font-semibold">Direct</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90 mb-1">Onderwerp:</div>
                  <div className="font-semibold text-lg">{emailTemplate.subject}</div>
                </div>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Actief
                </span>
              </div>
            </div>
            
            {/* Email Content */}
            <div className="p-6">
              {/* Hero Section */}
              <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] rounded-xl p-6 mb-6 text-white">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">T</span>
                  </div>
                  <h1 className="text-2xl font-bold mb-2">🚀 Welkom bij Toptiermen!</h1>
                  <p className="text-[#B6C948] text-lg">Jouw reis naar succes begint hier</p>
                </div>
              </div>

              {/* Main Content */}
              <div className="space-y-6">
                {/* Greeting */}
                <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#FFD700]/10 p-4 rounded-lg border-l-4 border-[#8BAE5A]">
                  <p className="text-lg font-semibold text-[#181F17]">
                    Beste {userName},
                  </p>
                </div>

                {/* Welcome Message */}
                <div className="bg-gradient-to-r from-[#8BAE5A]/5 to-[#FFD700]/5 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    We zijn verheugd dat je interesse hebt getoond in onze exclusieve broederschap van top performers. 
                    Je hebt de eerste stap gezet naar een leven van buitengewone prestaties en persoonlijke transformatie.
                  </p>
                </div>

                {/* What makes Toptiermen unique */}
                <div className="bg-gradient-to-r from-[#8BAE5A]/5 to-[#FFD700]/5 p-4 rounded-lg">
                  <h2 className="text-xl font-bold text-[#181F17] mb-4 flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    Wat maakt Toptiermen uniek?
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 p-4 rounded-lg border border-[#8BAE5A]/20">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🏆</span>
                        <h3 className="font-bold text-[#181F17]">De Broederschap</h3>
                      </div>
                      <p className="text-gray-700">Exclusieve community van top performers die elkaar naar succes duwen</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#FFD700]/10 to-[#8BAE5A]/10 p-4 rounded-lg border border-[#FFD700]/20">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🎯</span>
                        <h3 className="font-bold text-[#181F17]">Wekelijkse Video Calls</h3>
                      </div>
                      <p className="text-gray-700">Wekelijkse progress evaluatie en accountability sessies</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 p-4 rounded-lg border border-[#8BAE5A]/20">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🧗</span>
                        <h3 className="font-bold text-[#181F17]">Persoonlijke Transformatie</h3>
                      </div>
                      <p className="text-gray-700">Ontwikkel je tot een echte "Top Tier Man"</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#FFD700]/10 to-[#8BAE5A]/10 p-4 rounded-lg border border-[#FFD700]/20">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">💡</span>
                        <h3 className="font-bold text-[#181F17]">Bewezen Methoden</h3>
                      </div>
                      <p className="text-gray-700">Strategieën die mannen naar succes brengen</p>
                    </div>
                  </div>
                </div>

                {/* 6 Month Journey */}
                <div className="bg-gradient-to-r from-[#181F17]/5 to-[#232D1A]/5 p-4 rounded-lg">
                  <h2 className="text-xl font-bold text-[#181F17] mb-4 flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    Wat je de komende 6 maanden kunt verwachten:
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 p-4 rounded-lg border border-[#8BAE5A]/20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🌱</span>
                        <h3 className="font-bold text-[#181F17]">Maand 1-2: Foundation</h3>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Academy modules toegang</li>
                        <li>• Training content</li>
                        <li>• Persoonlijke voedingsplannen</li>
                        <li>• Community introductie</li>
                        <li>• Eerste wekelijkse video call</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#FFD700]/10 to-[#8BAE5A]/10 p-4 rounded-lg border border-[#FFD700]/20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🚀</span>
                        <h3 className="font-bold text-[#181F17]">Maand 3-4: Growth</h3>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Diepgaande coaching sessies</li>
                        <li>• Community challenges</li>
                        <li>• Accountability</li>
                        <li>• Wekelijkse evaluaties</li>
                        <li>• Progress tracking</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 p-4 rounded-lg border border-[#8BAE5A]/20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">👑</span>
                        <h3 className="font-bold text-[#181F17]">Maand 5-6: Mastery</h3>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Advanced strategieën</li>
                        <li>• Leadership development</li>
                        <li>• Top Tier Man voorbereiding</li>
                        <li>• Levensveranderende resultaten</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#8BAE5A]/10 p-4 rounded-lg border border-[#FFD700]/20 text-center">
                  <h3 className="font-bold text-[#181F17] mb-2">🚀 Klaar om te beginnen?</h3>
                  <p className="text-gray-700 mb-4">
                    Binnenkort ontvang je je persoonlijke inschrijflink voor de lancering.
                  </p>
                  <div className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-white px-6 py-3 rounded-lg font-semibold inline-block">
                    Start Je Reis Nu
                  </div>
                </div>

                {/* Signature */}
                <div className="bg-gradient-to-r from-[#181F17]/5 to-[#232D1A]/5 p-4 rounded-lg border-l-4 border-[#8BAE5A]">
                  <p className="font-semibold text-[#181F17]">Met vriendelijke groet,</p>
                  <p className="text-[#8BAE5A] font-bold">Het Toptiermen Team</p>
                  <div className="mt-3 p-3 bg-[#8BAE5A]/10 rounded-lg">
                    <p className="text-sm italic text-gray-600">
                      "Alleen ga je sneller, samen kom je verder. In de broederschap kom je het verst."
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Email Footer */}
            <div className="bg-gradient-to-r from-[#181F17] to-[#232D1A] p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">T</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Toptiermen</p>
                    <p className="text-xs text-[#B6C948]">Broederschap van Top Performers</p>
                  </div>
                </div>
                <div className="text-right text-xs text-[#B6C948]">
                  <p>Dit is een preview van de e-mail</p>
                  <p>Variabelen zijn vervangen door voorbeeldwaarden</p>
                </div>
              </div>
            </div>
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