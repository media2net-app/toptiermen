'use client';

import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';

interface OnboardingV2ProgressProps {
  className?: string;
}

export default function OnboardingV2Progress({ className = "" }: OnboardingV2ProgressProps) {
  const { currentStep, isCompleted } = useOnboardingV2();

  // Don't show progress if onboarding is completed
  if (isCompleted) {
    return null;
  }

  const getStepInfo = () => {
    // Determine total steps based on user access
    const { hasTrainingAccess, hasNutritionAccess } = useOnboardingV2();
    const totalSteps = (!hasTrainingAccess && !hasNutritionAccess) ? 4 : 5; // Basic: 4 steps, Premium: 5 steps
    
    // Map step IDs to sequential step numbers based on user tier
    const isBasicTier = !hasTrainingAccess && !hasNutritionAccess;
    const stepMapping = isBasicTier ? {
      0: 1, // Welcome video
      1: 2, // Set goal
      2: 3, // Select challenges
      5: 4  // Forum intro
    } : {
      0: 1, // Welcome video
      1: 2, // Set goal
      2: 3, // Select challenges
      3: 4, // Select training schema
      4: 4, // Select nutrition plan (step 4 of 5)
      5: 5  // Forum intro (step 5 of 5)
    };
    
    const currentStepNumber = stepMapping[currentStep as keyof typeof stepMapping] || 1;
    const percentage = (currentStepNumber / totalSteps) * 100;
    
    const stepNames = {
      0: "Welkomstvideo",
      1: "Hoofddoel instellen", 
      2: "Uitdagingen selecteren",
      3: "Trainingsschema kiezen",
      4: "Voedingsplan selecteren",
      5: "Forum introductie"
    };
    
    return {
      currentStepNumber,
      totalSteps,
      percentage,
      stepName: stepNames[currentStep as keyof typeof stepNames] || "Onbekende stap"
    };
  };

  const stepInfo = getStepInfo();

  return (
    <div className={`bg-gradient-to-r from-[#1a2e1a] to-[#2d4a2d] border-b border-[#8BAE5A] p-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#8BAE5A]">
            Onboarding - Stap {stepInfo.currentStepNumber} van {stepInfo.totalSteps}
          </span>
          <span className="text-sm font-medium text-white">
            {Math.round(stepInfo.percentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
          <div 
            className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stepInfo.percentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-300">{stepInfo.stepName}</p>
      </div>
    </div>
  );
}
