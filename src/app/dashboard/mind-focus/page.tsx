'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon,
  CalculatorIcon,
  ChartBarIcon,
  CheckIcon,
  EyeIcon,
  AcademicCapIcon,
  FireIcon,
  ClockIcon,
  CalendarDaysIcon,
  PrinterIcon,
  HeartIcon,
  CpuChipIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  TrophyIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid,
  CpuChipIcon as BrainSolid,
  SunIcon as SunSolid,
  MoonIcon as MoonSolid,
  SparklesIcon as SparklesSolid,
  TrophyIcon as TrophySolid,
  PlayIcon as PlaySolid,
  FireIcon as FireSolid
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import PageLayout from '@/components/PageLayout';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboardingV2 } from "@/contexts/OnboardingV2Context";
import OnboardingNotice from '@/components/OnboardingNotice';
import OnboardingV2Progress from '@/components/OnboardingV2Progress';
import OnboardingLoadingOverlay from '@/components/OnboardingLoadingOverlay';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';

interface StressAssessment {
  workStress: number;
  personalStress: number;
  sleepQuality: number;
  energyLevel: number;
  focusProblems: boolean;
  irritability: boolean;
}

interface LifestyleInfo {
  workSchedule: string;
  freeTime: string[];
  familyObligations: string[];
  sportSchedule: string[];
  commuteTime: number;
  lunchBreak: string;
}

interface PersonalGoals {
  stressVerminderen: boolean;
  focusVerbeteren: boolean;
  betereSlaap: boolean;
  betereRelaties: boolean;
  hogerePrestaties: boolean;
  emotioneleControle: boolean;
}

interface MeditationSession {
  id: string;
  title: string;
  type: 'focus' | 'stress' | 'recovery' | 'performance' | 'sleep';
  duration: number;
  description: string;
  audioUrl?: string;
  scheduledTime?: string;
}

interface JournalEntry {
  id: string;
  date: string;
  gratitude: string[];
  dailyReview: string;
  tomorrowPriorities: string[];
  mood: number;
  stressLevel: number;
}

const meditationTypes = [
  {
    id: 'focus',
    name: 'Focus Training',
    subtitle: 'Verhoog je concentratie en mentale helderheid',
    description: '10-15 min, dagelijks, ochtend',
    icon: '🎯',
    color: 'bg-blue-500',
    iconComponent: <BrainSolid className="w-8 h-8" />
  },
  {
    id: 'stress',
    name: 'Stress Release',
    subtitle: 'Verminder spanning en herstel je balans',
    description: '5-10 min, bij stress, lunch',
    icon: '🔥',
    color: 'bg-red-500',
    iconComponent: <FireSolid className="w-8 h-8" />
  },
  {
    id: 'recovery',
    name: 'Recovery Mode',
    subtitle: 'Ontspan en herstel na een drukke dag',
    description: '15-20 min, avond, ontspanning',
    icon: '🌙',
    color: 'bg-purple-500',
    iconComponent: <MoonSolid className="w-8 h-8" />
  },
  {
    id: 'performance',
    name: 'Performance Prep',
    subtitle: 'Bereid je voor op belangrijke momenten',
    description: '5-10 min, pre-workout, focus',
    icon: '⚡',
    color: 'bg-yellow-500',
    iconComponent: <SparklesSolid className="w-8 h-8" />
  },
  {
    id: 'sleep',
    name: 'Sleep Preparation',
    subtitle: 'Bereid je voor op een goede nachtrust',
    description: '15-20 min, bedtijd, ontspanning',
    icon: '😴',
    color: 'bg-indigo-500',
    iconComponent: <MoonSolid className="w-8 h-8" />
  }
];

export default function MindFocusPage() {
  const { user, isAdmin, loading: authLoading } = useSupabaseAuth();
  const { completeStep, currentStep: onboardingStep, isCompleted, showLoadingOverlay, loadingText, loadingProgress } = useOnboardingV2();
  const { hasAccess, loading: subscriptionLoading } = useSubscription();
  const router = useRouter();
  
  const [currentView, setCurrentView] = useState<'intake' | 'plan' | 'dashboard'>('intake');
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const intakeSteps = [
    {
      id: 'stress',
      title: 'Stress Assessment',
      subtitle: 'Hoe voel je je momenteel?',
      icon: <FireSolid className="w-8 h-8" />
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle Informatie',
      subtitle: 'Vertel ons over je dagelijkse routine',
      icon: <ClockIcon className="w-8 h-8" />
    },
    {
      id: 'goals',
      title: 'Persoonlijke Doelen',
      subtitle: 'Wat wil je bereiken?',
      icon: <TrophySolid className="w-8 h-8" />
    }
  ];
  
  // Intake data
  const [stressAssessment, setStressAssessment] = useState<StressAssessment>({
    workStress: 5,
    personalStress: 5,
    sleepQuality: 5,
    energyLevel: 5,
    focusProblems: false,
    irritability: false
  });
  
  const [lifestyleInfo, setLifestyleInfo] = useState<LifestyleInfo>({
    workSchedule: '08:00-17:00',
    freeTime: [],
    familyObligations: [],
    sportSchedule: [],
    commuteTime: 30,
    lunchBreak: '12:00-13:00'
  });
  
  const [personalGoals, setPersonalGoals] = useState<PersonalGoals>({
    stressVerminderen: false,
    focusVerbeteren: false,
    betereSlaap: false,
    betereRelaties: false,
    hogerePrestaties: false,
    emotioneleControle: false
  });

  // Generated plan data
  const [personalPlan, setPersonalPlan] = useState<{
    dailyRoutine: MeditationSession[];
    weeklyGoals: string[];
    progressTargets: any;
  } | null>(null);

  // Dashboard data
  const [todaySessions, setTodaySessions] = useState<MeditationSession[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [currentStressLevel, setCurrentStressLevel] = useState(5);

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: <CpuChipIcon className="w-5 h-5" /> },
    { id: 'meditations', label: 'Meditaties', icon: <HeartIcon className="w-5 h-5" /> },
    { id: 'journaling', label: 'Journaling', icon: <BookOpenIcon className="w-5 h-5" /> },
    { id: 'progress', label: 'Progress', icon: <ChartBarIcon className="w-5 h-5" /> },
    { id: 'achievements', label: 'Achievements', icon: <TrophyIcon className="w-5 h-5" /> },
  ];

  const nextStep = () => {
    if (currentStep < intakeSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      generatePersonalPlan();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const generatePersonalPlan = () => {
    // Calculate stress level
    const totalStress = stressAssessment.workStress + stressAssessment.personalStress;
    const avgStress = totalStress / 2;
    
    // Generate daily routine based on work schedule and stress level
    const dailyRoutine: MeditationSession[] = [];
    
    // Morning session
    if (lifestyleInfo.workSchedule.includes('08:00')) {
      dailyRoutine.push({
        id: 'morning-focus',
        title: 'Ochtend Focus Training',
        type: 'focus',
        duration: avgStress > 6 ? 15 : 10,
        description: 'Start je dag met mentale helderheid',
        scheduledTime: '07:30'
      });
    }
    
    // Lunch break session
    if (avgStress > 6) {
      dailyRoutine.push({
        id: 'lunch-stress-release',
        title: 'Lunch Stress Release',
        type: 'stress',
        duration: 10,
        description: 'Herstel je balans tijdens lunch',
        scheduledTime: lifestyleInfo.lunchBreak.split('-')[0]
      });
    }
    
    // Evening session
    dailyRoutine.push({
      id: 'evening-recovery',
      title: 'Avond Recovery',
      type: 'recovery',
      duration: avgStress > 7 ? 20 : 15,
      description: 'Ontspan en verwerk de dag',
      scheduledTime: '19:00'
    });
    
    // Sleep preparation if sleep quality is low
    if (stressAssessment.sleepQuality < 6) {
      dailyRoutine.push({
        id: 'sleep-prep',
        title: 'Sleep Preparation',
        type: 'sleep',
        duration: 15,
        description: 'Bereid je voor op een goede nachtrust',
        scheduledTime: '21:30'
      });
    }

    const weeklyGoals: string[] = [];
    if (personalGoals.stressVerminderen) weeklyGoals.push('Stress level met 30% verminderen');
    if (personalGoals.focusVerbeteren) weeklyGoals.push('Focus sessies 5x per week');
    if (personalGoals.betereSlaap) weeklyGoals.push('Slaapkwaliteit verbeteren');
    if (personalGoals.hogerePrestaties) weeklyGoals.push('Performance sessies toevoegen');

    setPersonalPlan({
      dailyRoutine,
      weeklyGoals,
      progressTargets: {
        stressReduction: avgStress * 0.7,
        focusSessions: 5,
        sleepImprovement: stressAssessment.sleepQuality + 2
      }
    });
    
    setCurrentView('plan');
  };

  const startSession = (session: MeditationSession) => {
    // Implementation for starting meditation session
    console.log('Starting session:', session);
    toast.success(`${session.title} gestart!`);
  };

  const completeSession = (sessionId: string) => {
    // Mark session as completed
    setTodaySessions(prev => 
      prev.map(s => s.id === sessionId ? { ...s, completed: true } : s)
    );
    setStreakCount(prev => prev + 1);
    toast.success('Sessie voltooid!');
  };

  const renderIntakeForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#8BAE5A] text-sm">
              Stap {currentStep + 1} van {intakeSteps.length}
            </span>
            <span className="text-[#8BAE5A] text-sm">
              {Math.round(((currentStep + 1) / intakeSteps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-[#2A3A1A] rounded-full h-2">
            <motion.div
              className="bg-[#B6C948] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / intakeSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-[#1A2A1A] rounded-2xl shadow-2xl overflow-hidden border border-[#2A3A1A]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2A3A1A] to-[#3A4A2A] px-12 py-8">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-[#B6C948]/20 rounded-xl">
                {intakeSteps[currentStep].icon}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#B6C948] mb-2">
                  {intakeSteps[currentStep].title}
                </h1>
                <p className="text-[#8BAE5A] text-xl">
                  {intakeSteps[currentStep].subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-12">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="stress"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-lg font-medium text-white mb-4">
                        Werkstress Level (1-10)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={stressAssessment.workStress}
                        onChange={(e) => setStressAssessment(prev => ({
                          ...prev,
                          workStress: parseInt(e.target.value)
                        }))}
                        className="w-full h-3 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-[#8BAE5A] mt-2">
                        <span>Laag</span>
                        <span className="font-bold text-[#B6C948] text-lg">{stressAssessment.workStress}</span>
                        <span>Hoog</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-white mb-4">
                        Privé Stress Level (1-10)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={stressAssessment.personalStress}
                        onChange={(e) => setStressAssessment(prev => ({
                          ...prev,
                          personalStress: parseInt(e.target.value)
                        }))}
                        className="w-full h-3 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-[#8BAE5A] mt-2">
                        <span>Laag</span>
                        <span className="font-bold text-[#B6C948] text-lg">{stressAssessment.personalStress}</span>
                        <span>Hoog</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-white mb-4">
                        Slaapkwaliteit (1-10)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={stressAssessment.sleepQuality}
                        onChange={(e) => setStressAssessment(prev => ({
                          ...prev,
                          sleepQuality: parseInt(e.target.value)
                        }))}
                        className="w-full h-3 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-[#8BAE5A] mt-2">
                        <span>Slecht</span>
                        <span className="font-bold text-[#B6C948] text-lg">{stressAssessment.sleepQuality}</span>
                        <span>Uitstekend</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-white mb-4">
                        Energie Level (1-10)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={stressAssessment.energyLevel}
                        onChange={(e) => setStressAssessment(prev => ({
                          ...prev,
                          energyLevel: parseInt(e.target.value)
                        }))}
                        className="w-full h-3 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-[#8BAE5A] mt-2">
                        <span>Laag</span>
                        <span className="font-bold text-[#B6C948] text-lg">{stressAssessment.energyLevel}</span>
                        <span>Hoog</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex items-center p-6 border-2 border-[#2A3A1A] rounded-xl hover:border-[#B6C948] hover:bg-[#B6C948]/10 cursor-pointer transition-all bg-[#1A2A1A]">
                      <input
                        type="checkbox"
                        checked={stressAssessment.focusProblems}
                        onChange={(e) => setStressAssessment(prev => ({
                          ...prev,
                          focusProblems: e.target.checked
                        }))}
                        className="mr-4 w-5 h-5 text-[#B6C948]"
                      />
                      <span className="text-lg text-white">Focus problemen</span>
                    </label>
                    <label className="flex items-center p-6 border-2 border-[#2A3A1A] rounded-xl hover:border-[#B6C948] hover:bg-[#B6C948]/10 cursor-pointer transition-all bg-[#1A2A1A]">
                      <input
                        type="checkbox"
                        checked={stressAssessment.irritability}
                        onChange={(e) => setStressAssessment(prev => ({
                          ...prev,
                          irritability: e.target.checked
                        }))}
                        className="mr-4 w-5 h-5 text-[#B6C948]"
                      />
                      <span className="text-lg text-white">Irritatie/agressie</span>
                    </label>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="lifestyle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-lg font-medium text-white mb-4">
                        Werkrooster
                      </label>
                      <select
                        value={lifestyleInfo.workSchedule}
                        onChange={(e) => setLifestyleInfo(prev => ({
                          ...prev,
                          workSchedule: e.target.value
                        }))}
                        className="w-full p-4 text-lg border-2 border-[#2A3A1A] rounded-xl focus:ring-2 focus:ring-[#B6C948] focus:border-transparent bg-[#1A2A1A] text-white"
                      >
                        <option value="08:00-17:00">08:00 - 17:00</option>
                        <option value="09:00-18:00">09:00 - 18:00</option>
                        <option value="07:00-16:00">07:00 - 16:00</option>
                        <option value="10:00-19:00">10:00 - 19:00</option>
                        <option value="nacht">Nachtdienst</option>
                        <option value="flexibel">Flexibel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-white mb-4">
                        Reistijd naar werk (minuten)
                      </label>
                      <input
                        type="number"
                        value={lifestyleInfo.commuteTime}
                        onChange={(e) => setLifestyleInfo(prev => ({
                          ...prev,
                          commuteTime: parseInt(e.target.value)
                        }))}
                        className="w-full p-4 text-lg border-2 border-[#2A3A1A] rounded-xl focus:ring-2 focus:ring-[#B6C948] focus:border-transparent bg-[#1A2A1A] text-white"
                        placeholder="30"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-lg font-medium text-white mb-4">
                        Lunch pauze
                      </label>
                      <select
                        value={lifestyleInfo.lunchBreak}
                        onChange={(e) => setLifestyleInfo(prev => ({
                          ...prev,
                          lunchBreak: e.target.value
                        }))}
                        className="w-full p-4 text-lg border-2 border-[#2A3A1A] rounded-xl focus:ring-2 focus:ring-[#B6C948] focus:border-transparent bg-[#1A2A1A] text-white"
                      >
                        <option value="12:00-13:00">12:00 - 13:00</option>
                        <option value="12:30-13:30">12:30 - 13:30</option>
                        <option value="13:00-14:00">13:00 - 14:00</option>
                        <option value="flexibel">Flexibel</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="goals"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(personalGoals).map(([key, value]) => (
                      <label key={key} className="flex items-center p-6 border-2 border-[#2A3A1A] rounded-xl hover:border-[#B6C948] hover:bg-[#B6C948]/10 cursor-pointer transition-all bg-[#1A2A1A]">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setPersonalGoals(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="mr-4 w-5 h-5 text-[#B6C948]"
                        />
                        <span className="text-lg text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="px-12 py-6 bg-[#1A2A1A] flex justify-between items-center border-t border-[#2A3A1A]">
            <motion.button
              onClick={prevStep}
              disabled={currentStep === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                currentStep === 0
                  ? 'bg-[#2A3A1A] text-[#8BAE5A] cursor-not-allowed'
                  : 'bg-[#2A3A1A] text-white hover:bg-[#3A4A2A]'
              }`}
            >
              ← Vorige
            </motion.button>

            <motion.button
              onClick={nextStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-[#2A3A1A] to-[#3A4A2A] text-[#B6C948] px-8 py-3 rounded-lg text-lg font-semibold hover:from-[#3A4A2A] hover:to-[#4A5A3A] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {currentStep === intakeSteps.length - 1 ? '🚀 Genereer Plan' : 'Volgende →'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderPersonalPlan = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎯 Jouw Persoonlijke Mind & Focus Plan
        </h1>
        <p className="text-gray-600 text-lg">
          Op basis van jouw intake hebben we een op maat gemaakt plan ontwikkeld
        </p>
      </div>

      {personalPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Routine */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <CalendarDaysIcon className="mr-3 text-blue-500 w-6 h-6" />
              Dagelijkse Routine
            </h2>
            
            <div className="space-y-4">
              {personalPlan.dailyRoutine.map((session, index) => (
                <motion.div 
                  key={session.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-lg ${meditationTypes.find(t => t.id === session.type)?.color} flex items-center justify-center text-white mr-4`}>
                        {meditationTypes.find(t => t.id === session.type)?.iconComponent}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{session.title}</h3>
                        <p className="text-sm text-gray-600">{session.description}</p>
                        <p className="text-xs text-gray-500">
                          {session.scheduledTime} • {session.duration} minuten
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => startSession(session)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Start
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrophySolid className="mr-3 text-green-500 w-6 h-6" />
              Weekdoelen
            </h2>
            
            <div className="space-y-3">
              {personalPlan.weeklyGoals.map((goal, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <CheckIcon className="text-green-500 mr-3 w-5 h-5" />
                  <span className="text-gray-700">{goal}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Targets</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Stress vermindering</span>
                  <span className="font-semibold text-red-500">
                    {personalPlan.progressTargets.stressReduction.toFixed(1)}/10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Focus sessies per week</span>
                  <span className="font-semibold text-blue-500">
                    {personalPlan.progressTargets.focusSessions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Slaapkwaliteit doel</span>
                  <span className="font-semibold text-purple-500">
                    {personalPlan.progressTargets.sleepImprovement}/10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-8">
        <motion.button
          onClick={() => setCurrentView('dashboard')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          🎯 Start Mijn Mind & Focus Journey
        </motion.button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2A3A1A] to-[#3A4A2A] rounded-xl p-8 text-[#B6C948] mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🧠 Mind & Focus Dashboard</h1>
            <p className="text-[#8BAE5A]">Jouw persoonlijke stress management hub</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{streakCount}</div>
            <div className="text-sm text-[#8BAE5A]">Dagen streak</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-[#2A3A1A]/10 rounded-lg mr-4">
              <FireSolid className="text-[#B6C948] text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{currentStressLevel}/10</div>
              <div className="text-sm text-gray-600">Stress Level</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-[#2A3A1A]/10 rounded-lg mr-4">
              <BrainSolid className="text-[#B6C948] text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">5</div>
              <div className="text-sm text-gray-600">Focus Sessies</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-[#2A3A1A]/10 rounded-lg mr-4">
              <MoonSolid className="text-[#B6C948] text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">7.5/10</div>
              <div className="text-sm text-gray-600">Slaap Kwaliteit</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-[#2A3A1A]/10 rounded-lg mr-4">
              <TrophySolid className="text-[#B6C948] text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Achievements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-[#B6C948] text-[#B6C948]'
                    : 'border-transparent text-gray-500 hover:text-[#8BAE5A] hover:border-[#8BAE5A]'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Vandaag's Sessies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalPlan?.dailyRoutine.map((session) => (
                  <motion.div 
                    key={session.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-10 h-10 rounded-lg ${meditationTypes.find(t => t.id === session.type)?.color} flex items-center justify-center text-white mr-3`}>
                        {meditationTypes.find(t => t.id === session.type)?.iconComponent}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{session.title}</h3>
                        <p className="text-sm text-gray-600">{session.scheduledTime}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{session.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{session.duration} min</span>
                      <motion.button
                        onClick={() => startSession(session)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#2A3A1A] text-[#B6C948] px-4 py-2 rounded-lg hover:bg-[#3A4A2A] transition-colors text-sm"
                      >
                        Start
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'meditations' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Meditatie Bibliotheek</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meditationTypes.map((type) => (
                  <motion.div 
                    key={type.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center text-white mb-4`}>
                      {type.iconComponent}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{type.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                    <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      Bekijk Sessies
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'journaling' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Journaling</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dagelijkse Check-in</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      3 Dingen waar je dankbaar voor bent vandaag:
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B6C948] focus:border-transparent"
                      rows={3}
                      placeholder="1. Mijn gezondheid&#10;2. Mijn familie&#10;3. Mijn werk..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hoe voel je je vandaag? (1-10)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wat waren je 3 prioriteiten vandaag?
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B6C948] focus:border-transparent"
                      rows={3}
                      placeholder="1. Project afmaken&#10;2. Sporten&#10;3. Familie tijd..."
                    />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-[#2A3A1A] text-[#B6C948] px-6 py-3 rounded-lg hover:bg-[#3A4A2A] transition-colors"
                  >
                    Opslaan
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Progress Tracking</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stress Level Trend</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Chart placeholder</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Focus Sessies</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Chart placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                      <TrophySolid className="text-yellow-500 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Focus Master</h3>
                      <p className="text-sm text-gray-600">30 dagen streak</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">22/30 dagen</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (currentView === 'intake') {
    return renderIntakeForm();
  }

  if (currentView === 'plan') {
    return renderPersonalPlan();
  }

  return renderDashboard();
}