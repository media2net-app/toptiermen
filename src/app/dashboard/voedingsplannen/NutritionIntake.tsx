'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalculatorIcon, 
  UserIcon,
  ScaleIcon,
  HeartIcon,
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from 'react-hot-toast';

interface NutritionProfile {
  age: number;
  height: number;
  weight: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'cut' | 'maintain' | 'bulk';
}

interface NutritionCalculations {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

interface NutritionIntakeProps {
  onComplete: (calculations: NutritionCalculations) => void;
  onSkip: () => void;
}

const activityLevels = [
  { 
    value: 'sedentary', 
    label: 'Zittend werk', 
    description: 'Weinig tot geen beweging, kantoorbaan',
    multiplier: 1.2
  },
  { 
    value: 'light', 
    label: 'Licht actief', 
    description: '1-3x per week sporten of lichte beweging',
    multiplier: 1.375
  },
  { 
    value: 'moderate', 
    label: 'Matig actief', 
    description: '3-5x per week sporten of matige beweging',
    multiplier: 1.55
  },
  { 
    value: 'active', 
    label: 'Actief', 
    description: '6-7x per week sporten of zware beweging',
    multiplier: 1.725
  },
  { 
    value: 'very_active', 
    label: 'Zeer actief', 
    description: 'Dagelijks intensief sporten of fysiek werk',
    multiplier: 1.9
  }
];

const goals = [
  { 
    value: 'cut', 
    label: 'Vet verliezen', 
    description: 'Calorietekort voor vetverlies',
    icon: '🔥'
  },
  { 
    value: 'maintain', 
    label: 'Op gewicht blijven', 
    description: 'Behoud van huidige lichaamscompositie',
    icon: '⚖️'
  },
  { 
    value: 'bulk', 
    label: 'Spier opbouwen', 
    description: 'Calorieoverschot voor spiergroei',
    icon: '💪'
  }
];

export default function NutritionIntake({ onComplete, onSkip }: NutritionIntakeProps) {
  const { user } = useSupabaseAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [calculations, setCalculations] = useState<NutritionCalculations | null>(null);
  
  const [profile, setProfile] = useState<NutritionProfile>({
    age: 0,
    height: 0,
    weight: 0,
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain'
  });

  useEffect(() => {
    // Load existing profile if available
    if (user?.id) {
      loadExistingProfile();
    }
  }, [user]);

  const loadExistingProfile = async () => {
    try {
      const response = await fetch(`/api/nutrition-profile?userId=${user?.id}`);
      const data = await response.json();
      
      if (data.success && data.profile) {
        setProfile({
          age: data.profile.age,
          height: data.profile.height,
          weight: data.profile.weight,
          gender: data.profile.gender,
          activityLevel: data.profile.activity_level,
          goal: data.profile.goal
        });
      }
    } catch (error) {
      console.error('Error loading existing profile:', error);
    }
  };

  const updateProfile = (field: keyof NutritionProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return profile.age > 0 && profile.height > 0 && profile.weight > 0;
      case 2:
        return profile.activityLevel !== '';
      case 3:
        return profile.goal !== '';
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Vul alle verplichte velden in');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const calculateNutrition = async () => {
    if (!user?.id) {
      toast.error('Je moet ingelogd zijn om je voedingsprofiel op te slaan');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/nutrition-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
          gender: profile.gender,
          activityLevel: profile.activityLevel,
          goal: profile.goal
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCalculations(data.calculations);
        toast.success('Voedingsprofiel succesvol opgeslagen!');
        onComplete(data.calculations);
      } else {
        toast.error(data.error || 'Fout bij opslaan van voedingsprofiel');
      }
    } catch (error) {
      console.error('Error saving nutrition profile:', error);
      toast.error('Er is een fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserIcon className="w-8 h-8 text-[#8BAE5A]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Jouw Basisgegevens
        </h2>
        <p className="text-gray-300">
          Vul je leeftijd, lengte en gewicht in voor een persoonlijke berekening
        </p>
      </div>

      <div className="bg-[#181F17] rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
              Geslacht
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateProfile('gender', 'male')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  profile.gender === 'male'
                    ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 text-[#8BAE5A]'
                    : 'border-[#3A4D23] bg-[#232D1A] text-gray-300 hover:border-[#8BAE5A]/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">👨</div>
                  <div className="font-medium">Man</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => updateProfile('gender', 'female')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  profile.gender === 'female'
                    ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 text-[#8BAE5A]'
                    : 'border-[#3A4D23] bg-[#232D1A] text-gray-300 hover:border-[#8BAE5A]/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">👩</div>
                  <div className="font-medium">Vrouw</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
              Leeftijd
            </label>
            <input
              type="number"
              value={profile.age === 0 ? '' : profile.age}
              onChange={(e) => updateProfile('age', e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8BAE5A]"
              placeholder="25"
              min="16"
              max="100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
              Lengte (cm)
            </label>
            <input
              type="number"
              value={profile.height === 0 ? '' : profile.height}
              onChange={(e) => updateProfile('height', e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8BAE5A]"
              placeholder="180"
              min="140"
              max="220"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
              Gewicht (kg)
            </label>
            <input
              type="number"
              value={profile.weight === 0 ? '' : profile.weight}
              onChange={(e) => updateProfile('weight', e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8BAE5A]"
              placeholder="75"
              min="40"
              max="200"
              step="0.1"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <HeartIcon className="w-8 h-8 text-[#8BAE5A]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Activiteitsniveau
        </h2>
        <p className="text-gray-300">
          Kies het niveau dat het beste bij jouw levensstijl past
        </p>
      </div>

      <div className="space-y-3">
        {activityLevels.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => updateProfile('activityLevel', level.value)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              profile.activityLevel === level.value
                ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                : 'border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">{level.label}</div>
                <div className="text-sm text-gray-300">{level.description}</div>
              </div>
              {profile.activityLevel === level.value && (
                <CheckIcon className="w-6 h-6 text-[#8BAE5A]" />
              )}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
                       <div className="w-16 h-16 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CalculatorIcon className="w-8 h-8 text-[#8BAE5A]" />
               </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Jouw Doel
        </h2>
        <p className="text-gray-300">
          Wat wil je bereiken met je voedingsplan?
        </p>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <button
            key={goal.value}
            type="button"
            onClick={() => updateProfile('goal', goal.value)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              profile.goal === goal.value
                ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                : 'border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{goal.icon}</span>
                <div>
                  <div className="font-medium text-white">{goal.label}</div>
                  <div className="text-sm text-gray-300">{goal.description}</div>
                </div>
              </div>
              {profile.goal === goal.value && (
                <CheckIcon className="w-6 h-6 text-[#8BAE5A]" />
              )}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalculatorIcon className="w-8 h-8 text-[#8BAE5A]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Jouw Voedingsdoelen
        </h2>
        <p className="text-gray-300">
          Bekijk je persoonlijke calorie- en macrobehoeften
        </p>
      </div>

      <div className="bg-[#181F17] rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <div className="text-sm text-[#8BAE5A] mb-1">Jouw Invoer</div>
            <div className="space-y-1 text-sm text-gray-300">
              <div>Leeftijd: <span className="text-white font-medium">{profile.age}</span></div>
              <div>Lengte: <span className="text-white font-medium">{profile.height} cm</span></div>
              <div>Gewicht: <span className="text-white font-medium">{profile.weight} kg</span></div>
              <div>Activiteit: <span className="text-white font-medium">
                {activityLevels.find(l => l.value === profile.activityLevel)?.label}
              </span></div>
              <div>Doel: <span className="text-white font-medium">
                {goals.find(g => g.value === profile.goal)?.label}
              </span></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-[#8BAE5A] mb-1">Berekende Waarden</div>
            <div className="space-y-1 text-sm text-gray-300">
              <div>BMR: <span className="text-white font-medium">
                {calculations?.bmr || '...'} kcal
              </span></div>
              <div>TDEE: <span className="text-white font-medium">
                {calculations?.tdee || '...'} kcal
              </span></div>
              <div>Doel Calorieën: <span className="text-white font-medium">
                {calculations?.targetCalories || '...'} kcal
              </span></div>
            </div>
          </div>
        </div>

        {calculations && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-[#232D1A] rounded-lg">
              <div className="text-2xl font-bold text-[#8BAE5A]">{calculations.targetCalories}</div>
              <div className="text-xs text-gray-300">kcal/dag</div>
            </div>
            <div className="text-center p-3 bg-[#232D1A] rounded-lg">
              <div className="text-2xl font-bold text-[#8BAE5A]">{calculations.targetProtein}g</div>
              <div className="text-xs text-gray-300">Eiwit</div>
            </div>
            <div className="text-center p-3 bg-[#232D1A] rounded-lg">
              <div className="text-2xl font-bold text-[#8BAE5A]">{calculations.targetCarbs}g</div>
              <div className="text-xs text-gray-300">Koolhydraten</div>
            </div>
            <div className="text-center p-3 bg-[#232D1A] rounded-lg">
              <div className="text-2xl font-bold text-[#8BAE5A]">{calculations.targetFat}g</div>
              <div className="text-xs text-gray-300">Vet</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181F17] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Voedingsprofiel</h1>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Stap {currentStep} van 4</span>
              <span>{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <div className="w-full bg-[#232D1A] rounded-full h-2">
              <div 
                className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentStep === 1
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-[#8BAE5A] hover:bg-[#8BAE5A]/10'
              }`}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Vorige</span>
            </button>

            <div className="flex space-x-3">
              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-medium"
                >
                  <span>Volgende</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={calculateNutrition}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-6 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#181F17] border-t-transparent rounded-full animate-spin" />
                      <span>Opslaan...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Profiel Opslaan</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
