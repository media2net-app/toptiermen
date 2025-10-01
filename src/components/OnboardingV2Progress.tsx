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
    const totalSteps = (!hasTrainingAccess && !hasNutritionAccess) ? 4 : 6; // Basic: 4 steps, Premium: 6 steps
    
    // Map UI step numbers to sequential step numbers based on user tier
    const isBasicTier = !hasTrainingAccess && !hasNutritionAccess;
    const stepMapping = isBasicTier ? {
      1: 1, // Welcome video (UI step 1)
      2: 2, // Set goal (UI step 2)
      3: 3, // Select challenges (UI step 3)
      6: 4  // Forum intro (UI step 6)
    } : {
      1: 1, // Welcome video (UI step 1)
      2: 2, // Set goal (UI step 2)
      3: 3, // Select challenges (UI step 3)
      4: 4, // Select training schema (UI step 4)
      5: 5, // Select nutrition plan (UI step 5)
      6: 6  // Forum intro (UI step 6)
    };
    
    const currentStepNumber = stepMapping[currentStep as keyof typeof stepMapping] || 1;
    const percentage = (currentStepNumber / totalSteps) * 100;
    
    const stepNames = {
      1: "Welkomstvideo",
      2: "Hoofddoel instellen", 
      3: "Uitdagingen selecteren",
      4: "Trainingsschema kiezen",
      5: "Voedingsplan selecteren",
      6: "Forum introductie"
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
    <div className={`bg-gradient-to-r from-[#1a2e1a] to-[#2d4a2d] border-b border-[#8BAE5A] py-3 px-3 sm:px-4 ${className}`}>
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
  );
}
