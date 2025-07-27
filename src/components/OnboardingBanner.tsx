'use client';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ArrowRightIcon, PlayIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

export default function OnboardingBanner() {
  const { isOnboarding, currentStep, steps, completeCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (isOnboarding) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOnboarding]);

  if (!isOnboarding) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleCompleteStep = async () => {
    setIsCompleting(true);
    
    // Add a small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await completeCurrentStep();
    
    // Only navigate to next step's target page if it's different from current
    // AND if we're not staying on the same page for multiple steps
    if (currentStep < steps.length - 1) {
      const nextStep = steps[currentStep + 1];
      const currentPage = window.location.pathname;
      
      // Check if next step is on a different page
      if (nextStep.targetPage !== currentPage) {
        router.push(nextStep.targetPage);
      }
      // If next step is on the same page (like training center), stay put
    }
    
    setIsCompleting(false);
  };

  const handleSkipToOnboarding = () => {
    router.push('/dashboard/onboarding');
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 0: return <PlayIcon className="w-4 h-4" />;
      case 1: return <span className="text-lg">🎯</span>;
      case 2: return <span className="text-lg">🔥</span>;
      case 3: return <span className="text-lg">💪</span>;
      case 4: return <span className="text-lg">🥗</span>;
      case 5: return <span className="text-lg">💬</span>;
      default: return <CheckCircleIcon className="w-4 h-4" />;
    }
  };

  // Check if we're on a page that handles multiple onboarding steps
  const isMultiStepPage = () => {
    const currentPage = window.location.pathname;
    return currentPage === '/dashboard/trainingscentrum' || currentPage === '/dashboard/onboarding';
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className="bg-gradient-to-r from-[#8BAE5A] via-[#7A9D4A] to-[#3A4D23] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Progress and current step */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  {getStepIcon(currentStep)}
                  <span className="text-sm font-semibold">Stap {currentStep + 1}</span>
                </div>
                <span className="text-xs opacity-80">van {steps.length}</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-40 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="text-sm font-medium max-w-xs truncate">
                {currentStepData?.title}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Skip to onboarding button - only show if not on onboarding page */}
              {window.location.pathname !== '/dashboard/onboarding' && (
                <button
                  onClick={handleSkipToOnboarding}
                  className="px-4 py-2 text-xs bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Terug naar Overzicht
                </button>
              )}
              
              {/* Complete step button */}
              <button
                onClick={handleCompleteStep}
                disabled={isCompleting}
                className={`flex items-center gap-2 px-6 py-2 bg-white text-[#3A4D23] rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isCompleting ? 'animate-pulse' : ''
                }`}
              >
                {isCompleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#3A4D23] border-t-transparent rounded-full animate-spin" />
                    Voltooid...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    {isMultiStepPage() && currentStep < steps.length - 1 && steps[currentStep + 1]?.targetPage === window.location.pathname 
                      ? 'Volgende Stap' 
                      : 'Stap Voltooien'
                    }
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 