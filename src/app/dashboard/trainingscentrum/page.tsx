"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon, 
  FireIcon, 
  SparklesIcon,
  PlayIcon,
  CheckIcon,
  ArrowRightIcon,
  ClockIcon,
  HeartIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import PageLayout from '@/components/PageLayout';

interface TrainingPreferences {
  frequency: number;
  style: 'gym' | 'bodyweight';
}

interface WorkoutSchema {
  id: string;
  name: string;
  frequency: number;
  style: 'gym' | 'bodyweight';
  description: string;
  days: {
    day: number;
    name: string;
    focus: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      rest: string;
      alternatives: { name: string; reason: string }[];
      feedback: string;
    }[];
  }[];
}

export default function TrainingscentrumPage() {
  const [selectedOption, setSelectedOption] = useState<'training' | 'nutrition' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [trainingPreferences, setTrainingPreferences] = useState<TrainingPreferences>({
    frequency: 0,
    style: 'gym'
  });
  const [workoutSchema, setWorkoutSchema] = useState<WorkoutSchema | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOptionSelect = (option: 'training' | 'nutrition') => {
    setSelectedOption(option);
    if (option === 'nutrition') {
      // Navigate to voedingsplannen
      window.location.href = '/dashboard/voedingsplannen';
    }
  };

  const generateWorkoutSchema = () => {
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const schema: WorkoutSchema = {
        id: '1',
        name: `${trainingPreferences.frequency}-Daagse ${trainingPreferences.style === 'gym' ? 'Gym' : 'Bodyweight'} Schema`,
        frequency: trainingPreferences.frequency,
        style: trainingPreferences.style,
        description: `Een professioneel ${trainingPreferences.frequency}-daags schema geoptimaliseerd voor ${trainingPreferences.style === 'gym' ? 'gym training' : 'thuis training'} met focus op progressieve overload en balans.`,
        days: generateWorkoutDays(trainingPreferences.frequency, trainingPreferences.style)
      };
      
      setWorkoutSchema(schema);
      setCurrentStep(3);
      setIsGenerating(false);
    }, 2000);
  };

  const generateWorkoutDays = (frequency: number, style: 'gym' | 'bodyweight') => {
    const gymExercises = {
      upper: ['Bench Press', 'Pull-ups', 'Overhead Press', 'Barbell Rows', 'Dips'],
      lower: ['Squats', 'Deadlifts', 'Leg Press', 'Romanian Deadlifts', 'Lunges'],
      full: ['Deadlifts', 'Bench Press', 'Squats', 'Pull-ups', 'Overhead Press']
    };

    const bodyweightExercises = {
      upper: ['Push-ups', 'Pull-ups', 'Dips', 'Pike Push-ups', 'Inverted Rows'],
      lower: ['Squats', 'Lunges', 'Pistol Squats', 'Glute Bridges', 'Calf Raises'],
      full: ['Burpees', 'Mountain Climbers', 'Jump Squats', 'Push-ups', 'Pull-ups']
    };

    const exerciseAlternatives = {
      'Bench Press': [
        { name: 'Dumbbell Press', reason: 'Geen barbell beschikbaar' },
        { name: 'Machine Chest Press', reason: 'Barbell rack bezet' }
      ],
      'Pull-ups': [
        { name: 'Lat Pulldown', reason: 'Pull-up bar niet beschikbaar' },
        { name: 'Assisted Pull-ups', reason: 'Nog niet sterk genoeg' }
      ],
      'Squats': [
        { name: 'Leg Press', reason: 'Squat rack bezet' },
        { name: 'Goblet Squats', reason: 'Lichte blessure' }
      ],
      'Deadlifts': [
        { name: 'Romanian Deadlifts', reason: 'Lichte blessure' },
        { name: 'Good Mornings', reason: 'Geen barbell beschikbaar' }
      ],
      'Push-ups': [
        { name: 'Knee Push-ups', reason: 'Nog niet sterk genoeg' },
        { name: 'Incline Push-ups', reason: 'Makkelijkere variant' }
      ]
    };

    const exercises = style === 'gym' ? gymExercises : bodyweightExercises;
    
    const dayConfigs = {
      2: [
        { name: 'Full Body A', focus: 'Kracht & Hypertrofie', type: 'full' },
        { name: 'Full Body B', focus: 'Kracht & Hypertrofie', type: 'full' }
      ],
      3: [
        { name: 'Upper Body', focus: 'Bovenlichaam', type: 'upper' },
        { name: 'Lower Body', focus: 'Onderlichaam', type: 'lower' },
        { name: 'Full Body', focus: 'Volledige Lichaam', type: 'full' }
      ],
      4: [
        { name: 'Upper Body A', focus: 'Bovenlichaam (Push)', type: 'upper' },
        { name: 'Lower Body', focus: 'Onderlichaam', type: 'lower' },
        { name: 'Upper Body B', focus: 'Bovenlichaam (Pull)', type: 'upper' },
        { name: 'Full Body', focus: 'Volledige Lichaam', type: 'full' }
      ],
      5: [
        { name: 'Upper Body A', focus: 'Bovenlichaam (Push)', type: 'upper' },
        { name: 'Lower Body A', focus: 'Onderlichaam (Quad)', type: 'lower' },
        { name: 'Upper Body B', focus: 'Bovenlichaam (Pull)', type: 'upper' },
        { name: 'Lower Body B', focus: 'Onderlichaam (Posterior)', type: 'lower' },
        { name: 'Full Body', focus: 'Volledige Lichaam', type: 'full' }
      ],
      6: [
        { name: 'Upper Body A', focus: 'Bovenlichaam (Push)', type: 'upper' },
        { name: 'Lower Body A', focus: 'Onderlichaam (Quad)', type: 'lower' },
        { name: 'Upper Body B', focus: 'Bovenlichaam (Pull)', type: 'upper' },
        { name: 'Lower Body B', focus: 'Onderlichaam (Posterior)', type: 'lower' },
        { name: 'Full Body A', focus: 'Volledige Lichaam', type: 'full' },
        { name: 'Full Body B', focus: 'Volledige Lichaam', type: 'full' }
      ]
    };

    return dayConfigs[frequency as keyof typeof dayConfigs].map((config, index) => ({
      day: index + 1,
      name: config.name,
      focus: config.focus,
      exercises: exercises[config.type as keyof typeof exercises].slice(0, 5).map(exercise => ({
        name: exercise,
        sets: Math.floor(Math.random() * 3) + 3, // 3-5 sets
        reps: style === 'gym' ? '8-12' : '10-15',
        rest: '60-90 sec',
        alternatives: exerciseAlternatives[exercise as keyof typeof exerciseAlternatives] || [],
        feedback: ''
      }))
    }));
  };

  return (
    <PageLayout
      title="Trainingscentrum"
      description="Persoonlijke trainingsschema's en voedingsplannen op maat"
    >
      <AnimatePresence mode="wait">
        {!selectedOption && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Kies Jouw Focus
              </h2>
              <p className="text-gray-300 text-lg">
                Wat wil je vandaag optimaliseren? Kies tussen een persoonlijk trainingsschema of een voedingsplan op maat.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Trainingsschema Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group cursor-pointer"
                onClick={() => handleOptionSelect('training')}
              >
                <div className="bg-gradient-to-br from-[#232D1A] to-[#1A2315] border-2 border-[#3A4D23] rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-[#8BAE5A] group-hover:shadow-2xl group-hover:shadow-[#8BAE5A]/20">
                  <div className="flex items-center justify-center w-16 h-16 bg-[#8BAE5A] rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <FireIcon className="w-8 h-8 text-[#232D1A]" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 text-center">
                    Trainingsschema
                  </h3>
                  
                  <p className="text-gray-300 text-center mb-6">
                    Krijg een persoonlijk trainingsschema op basis van jouw beschikbaarheid en voorkeuren. Perfect voor zowel gym als thuis training.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-400">
                      <CheckIcon className="w-4 h-4 mr-2 text-[#8BAE5A]" />
                      Op maat voor jouw frequentie
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <CheckIcon className="w-4 h-4 mr-2 text-[#8BAE5A]" />
                      Gym of bodyweight opties
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <CheckIcon className="w-4 h-4 mr-2 text-[#8BAE5A]" />
                      Progressieve overload
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Voedingsplan Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group cursor-pointer"
                onClick={() => handleOptionSelect('nutrition')}
              >
                <div className="bg-gradient-to-br from-[#232D1A] to-[#1A2315] border-2 border-[#3A4D23] rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-[#8BAE5A] group-hover:shadow-2xl group-hover:shadow-[#8BAE5A]/20">
                  <div className="flex items-center justify-center w-16 h-16 bg-[#8BAE5A] rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <HeartIcon className="w-8 h-8 text-[#232D1A]" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 text-center">
                    Voedingsplan
                  </h3>
                  
                  <p className="text-gray-300 text-center mb-6">
                    Ontvang een compleet voedingsplan op basis van jouw doelen en voorkeuren. Van calorieën tot macronutriënten en maaltijdplanning.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-400">
                      <CheckIcon className="w-4 h-4 mr-2 text-[#8BAE5A]" />
                      Persoonlijke caloriebehoefte
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <CheckIcon className="w-4 h-4 mr-2 text-[#8BAE5A]" />
                      Macro-optimalisatie
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <CheckIcon className="w-4 h-4 mr-2 text-[#8BAE5A]" />
                      Dagelijkse maaltijdplanning
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {selectedOption === 'training' && currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Stap 1: Hoeveel dagen per week wil je committeren aan je training?
              </h2>
              <p className="text-gray-300 text-lg">
                Kies de frequentie die het beste past bij jouw levensstijl en doelen.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {[2, 3, 4, 5, 6].map((days) => (
                <motion.button
                  key={days}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setTrainingPreferences(prev => ({ ...prev, frequency: days }));
                    setCurrentStep(2);
                  }}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    trainingPreferences.frequency === days
                      ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                      : 'border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50'
                  }`}
                >
                  <div className="text-2xl font-bold text-white mb-2">{days}</div>
                  <div className="text-sm text-gray-400">dagen</div>
                  {days === 3 && (
                    <div className="text-xs text-[#8BAE5A] mt-2">
                      Aanbevolen voor een solide basis
                    </div>
                  )}
                  {days === 5 && (
                    <div className="text-xs text-[#8BAE5A] mt-2">
                      Voor serieuze progressie
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {selectedOption === 'training' && currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Stap 2: Wat is jouw trainingsstijl?
              </h2>
              <p className="text-gray-300 text-lg">
                Kies de omgeving waar je het liefst traint.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Gym Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setTrainingPreferences(prev => ({ ...prev, style: 'gym' }));
                  generateWorkoutSchema();
                }}
                className={`cursor-pointer rounded-2xl p-8 border-2 transition-all duration-300 ${
                  trainingPreferences.style === 'gym'
                    ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                    : 'border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50'
                }`}
              >
                <div className="flex items-center justify-center w-16 h-16 bg-[#8BAE5A] rounded-full mb-6 mx-auto">
                  <FireIcon className="w-8 h-8 text-[#232D1A]" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  🏋️‍♂️ Gym
                </h3>
                
                <p className="text-gray-300 text-center">
                  Je hebt toegang tot een sportschool met een volledig arsenaal aan barbells, dumbbells en machines.
                </p>
              </motion.div>

              {/* Bodyweight Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setTrainingPreferences(prev => ({ ...prev, style: 'bodyweight' }));
                  generateWorkoutSchema();
                }}
                className={`cursor-pointer rounded-2xl p-8 border-2 transition-all duration-300 ${
                  trainingPreferences.style === 'bodyweight'
                    ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                    : 'border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50'
                }`}
              >
                <div className="flex items-center justify-center w-16 h-16 bg-[#8BAE5A] rounded-full mb-6 mx-auto">
                  <PlayIcon className="w-8 h-8 text-[#232D1A]" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  🤸 Bodyweight / Thuis
                </h3>
                
                <p className="text-gray-300 text-center">
                  Je traint thuis, buiten of op reis met voornamelijk je eigen lichaamsgewicht.
                </p>
              </motion.div>
            </div>

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="inline-flex items-center space-x-2 text-[#8BAE5A]">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8BAE5A]"></div>
                  <span>We stellen het optimale schema voor je samen...</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {selectedOption === 'training' && currentStep === 3 && workoutSchema && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                {workoutSchema.name}
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                {workoutSchema.description}
              </p>
              <div className="inline-flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {workoutSchema.frequency} dagen per week
                </div>
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  45-60 min per training
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {workoutSchema.days.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Dag {day.day}: {day.name}
                      </h3>
                      <p className="text-gray-400">{day.focus}</p>
                    </div>
                    <div className="text-sm text-[#8BAE5A] font-medium">
                      {day.exercises.length} oefeningen
                    </div>
                  </div>

                  <div className="space-y-3">
                    {day.exercises.map((exercise, exerciseIndex) => (
                      <div
                        key={exerciseIndex}
                        className="flex items-center justify-between p-3 bg-[#1A2315] rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-white">{exercise.name}</div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{exercise.sets} sets</span>
                          <span>{exercise.reps} reps</span>
                          <span>{exercise.rest} rust</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Mark training schema as completed for onboarding
                  localStorage.setItem('trainingSchemaCompleted', 'true');
                  // Navigate back to dashboard
                  window.location.href = '/dashboard';
                }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#232D1A] font-bold rounded-xl hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <CheckIcon className="w-6 h-6 mr-2" />
                Start met dit Schema
              </motion.button>
              
              <div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedOption(null);
                    setCurrentStep(1);
                    setWorkoutSchema(null);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] font-semibold rounded-lg hover:bg-[#4A5D33] transition-colors duration-200"
                >
                  <ArrowRightIcon className="w-5 h-5 mr-2" />
                  Nieuw Schema Genereren
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
} 