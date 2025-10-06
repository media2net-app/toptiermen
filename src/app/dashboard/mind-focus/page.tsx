'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { 
  TagIcon, 
  FireIcon, 
  ClockIcon, 
  CpuChipIcon,
  PlayIcon,
  ChartBarIcon,
  BookOpenIcon,
  StarIcon
} from '@heroicons/react/24/solid';

interface MeditationSession {
  id: string;
  name: string;
  duration: number;
  type: string;
  description: string;
  audioUrl?: string;
}

const meditationTypes = [
  {
    id: 'focus',
    name: 'Focus Training',
    description: 'Verbeter je concentratie en mentale helderheid',
    color: 'bg-blue-500',
    iconComponent: <TagIcon className="w-8 h-8" />
  },
  {
    id: 'stress',
    name: 'Stress Release',
    description: 'Ontspan en verminder stress',
    color: 'bg-red-500',
    iconComponent: <FireIcon className="w-8 h-8" />
  },
  {
    id: 'sleep',
    name: 'Sleep Preparation',
    description: 'Bereid je voor op een goede nachtrust',
    color: 'bg-indigo-500',
    iconComponent: <ClockIcon className="w-8 h-8" />
  },
  {
    id: 'recovery',
    name: 'Recovery',
    description: 'Herstel en verwerk de dag',
    color: 'bg-green-500',
    iconComponent: <CpuChipIcon className="w-8 h-8" />
  }
];

export default function MindFocusPage() {
  const { user, isAdmin, loading: authLoading } = useSupabaseAuth();
  const { completeStep, currentStep: onboardingStep, isCompleted, showLoadingOverlay, loadingText, loadingProgress } = useOnboardingV2();
  const router = useRouter();
  
  const [currentView, setCurrentView] = useState<'intro' | 'intake' | 'plan' | 'dashboard'>('intro');
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [currentActiveWeek, setCurrentActiveWeek] = useState(1);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const resetModalRef = useRef<HTMLDivElement>(null);
  
  // Intake form state
  const [stressAssessment, setStressAssessment] = useState({
    workStress: 5,
    personalStress: 5,
    sleepQuality: 5,
    energyLevel: 5,
    focusProblems: false,
    irritability: false
  });
  
  const [lifestyleInfo, setLifestyleInfo] = useState({
    workSchedule: '9-17',
    freeTime: [] as string[],
    familyObligations: [] as string[],
    sportSchedule: '3x per week',
    stressTriggers: [] as string[]
  });
  
  const [personalGoals, setPersonalGoals] = useState({
    improveFocus: false,
    reduceStress: false,
    betterSleep: false,
    moreEnergy: false,
    workLifeBalance: false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  // Typeform-style step index (0..N)
  const [tfStep, setTfStep] = useState(0);

  // Reset intake/profile
  const resetIntake = async () => {
    if (!user) return;
    const ok = window.confirm('Weet je zeker dat je je Mind & Focus intake wilt resetten?');
    if (!ok) return;
    try {
      const res = await fetch(`/api/mind-focus/intake?userId=${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to reset');
      // Reset local state
      setHasExistingProfile(false);
      setStressAssessment({ workStress: 5, personalStress: 5, sleepQuality: 5, energyLevel: 5, focusProblems: false, irritability: false });
      setLifestyleInfo({ workSchedule: '9-17', freeTime: [], familyObligations: [], sportSchedule: '3x per week', stressTriggers: [] });
      setPersonalGoals({ improveFocus: false, reduceStress: false, betterSleep: false, moreEnergy: false, workLifeBalance: false });
      setCurrentView('intake');
    } catch (e) {
      console.error(e);
      alert('Reset mislukt. Probeer opnieuw.');
    }
  };

  // Load existing profile data on component mount
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const response = await fetch(`/api/mind-focus/intake?userId=${user.id}`);
        const data = await response.json();
        
        if (data.success && data.profile) {
          setHasExistingProfile(true);
          setCurrentView('dashboard');
          
          // Load existing data into state
          if (data.profile.stress_assessment) {
            setStressAssessment(data.profile.stress_assessment);
          }
          if (data.profile.lifestyle_info) {
            setLifestyleInfo(data.profile.lifestyle_info);
          }
          if (data.profile.personal_goals) {
            setPersonalGoals(data.profile.personal_goals);
          }
          
          // Load progress data
          if (data.profile.current_active_week) {
            setCurrentActiveWeek(data.profile.current_active_week);
          }
          if (data.profile.completed_weeks) {
            setCompletedWeeks(data.profile.completed_weeks);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        clearTimeout(timeoutId);
        setIsLoadingProfile(false);
      }
    };

    const timeoutId = setTimeout(() => {
      setIsLoadingProfile(false);
    }, 3000);

    loadExistingProfile();
  }, [user]);

  // Focus scroll to modal when opened
  useEffect(() => {
    if (showResetModal && resetModalRef.current) {
      resetModalRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      resetModalRef.current.focus();
    }
  }, [showResetModal]);

  // Save intake data function
  const saveIntakeData = async () => {
    console.log('🔄 Starting saveIntakeData...');
    console.log('User:', user?.id);
    console.log('Stress Assessment:', stressAssessment);
    console.log('Lifestyle Info:', lifestyleInfo);
    console.log('Personal Goals:', personalGoals);
    
    if (!user) {
      console.error('❌ No user found');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const requestData = {
        userId: user.id,
        stressAssessment,
        lifestyleInfo,
        personalGoals
      };
      
      console.log('📤 Sending request data:', requestData);
      
      const response = await fetch('/api/mind-focus/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (data.success) {
        console.log('✅ Intake data saved successfully');
        setHasExistingProfile(true);
        setCurrentView('dashboard');
        // Navigate to Mind & Focus dashboard without full reload
        router.replace('/dashboard/mind-focus');
      } else {
        console.error('❌ Failed to save intake data:', data.error);
        alert('Er is een fout opgetreden bij het opslaan. Probeer het opnieuw.');
      }
    } catch (error) {
      console.error('❌ Error saving intake data:', error);
      alert('Er is een fout opgetreden bij het opslaan. Probeer het opnieuw.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderIntro = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A]">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
            Mind & Focus
          </h1>
          <p className="text-[#8BAE5A] max-w-3xl mx-auto text-sm sm:text-base md:text-lg">
            Bouw mentale kracht. Houd je hoofd scherp onder druk. Minder stress, meer rust. Hier pak je controle over je focus, slaap en energie.
          </p>
          <div className="max-w-3xl mx-auto mt-4 text-left text-[#8BAE5A] text-xs sm:text-sm md:text-base">
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="text-white font-semibold">Stress management</span> – ontladen en herstellen na drukke dagen</li>
              <li><span className="text-white font-semibold">Dankbaarheid & helderheid</span> – kalmte en richting in je hoofd</li>
              <li><span className="text-white font-semibold">Slaap & herstel</span> – dieper slapen, sterker terugkomen</li>
            </ul>
          </div>
          <div className="max-w-3xl mx-auto mt-4 text-[#B6C948] text-xs sm:text-sm">
            Eerst doe je een korte intake. Daarna gaan alle tools voor je open.
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
          {meditationTypes.map((type) => (
            <div
              key={type.id}
              className="bg-[#1A2A1A]/80 rounded-lg md:rounded-xl p-4 md:p-6 text-center hover:bg-[#1A2A1A] transition-all duration-300 cursor-pointer border border-[#2A3A1A] hover:border-[#3A4A2A]"
              onClick={() => setCurrentView('intake')}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 ${type.color} rounded-full flex items-center justify-center text-white mx-auto mb-3 md:mb-4`}>
                {type.iconComponent}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{type.name}</h3>
              <p className="text-[#8BAE5A] text-xs sm:text-sm">{type.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setCurrentView('intake')}
            className="bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#1A2A1A] px-6 py-3 md:px-8 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start eerst je Mind & Focus Intake
          </button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Mind & Focus Dashboard</h1>
            <p className="text-[#8BAE5A] mt-2">Overzicht van je tools en voortgang.</p>
          </div>
          <button onClick={() => setShowResetModal(true)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm">Reset intake</button>
        </div>

        {/* Quick actions row: 4 buttons */}
        <div className="bg-[#1A2A1A]/80 border border-[#2A3A1A] rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {meditationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => router.push(`/dashboard/mind-focus/${type.id}-training`)}
                className="flex items-center justify-center gap-2 bg-[#232D1A] hover:bg-[#2A3A1A] text-white rounded-lg py-3 px-3 border border-[#2A3A1A]"
              >
                <span className={`w-6 h-6 ${type.color} rounded-full flex items-center justify-center text-white`}>{type.iconComponent}</span>
                <span className="text-sm font-semibold">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Intake Results */}
        {hasExistingProfile && (
          <div className="bg-[#1A2A1A]/80 border border-[#2A3A1A] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Je Intake Resultaten</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Stress Assessment */}
              <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]/40">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">📊</span>
                  Stress Assessment
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Werk stress:</span>
                    <span className="text-white font-medium">{stressAssessment.workStress}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Persoonlijke stress:</span>
                    <span className="text-white font-medium">{stressAssessment.personalStress}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Slaapkwaliteit:</span>
                    <span className="text-white font-medium">{stressAssessment.sleepQuality}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Energie level:</span>
                    <span className="text-white font-medium">{stressAssessment.energyLevel}/10</span>
                  </div>
                  {stressAssessment.focusProblems && (
                    <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                      <span className="text-red-400 text-xs">⚠️ Concentratieproblemen gemeld</span>
                    </div>
                  )}
                  {stressAssessment.irritability && (
                    <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                      <span className="text-red-400 text-xs">⚠️ Snel geïrriteerd/agressief</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Goals */}
              <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]/40">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">🎯</span>
                  Persoonlijke Doelen
                </h3>
                <div className="space-y-2">
                  {[
                    { key: 'improveFocus', label: 'Verbeter focus en concentratie' },
                    { key: 'reduceStress', label: 'Verminder stress' },
                    { key: 'betterSleep', label: 'Betere slaap' },
                    { key: 'moreEnergy', label: 'Meer energie' },
                    { key: 'workLifeBalance', label: 'Work-life balance' }
                  ].map((goal) => (
                    <div key={goal.key} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        personalGoals[goal.key as keyof typeof personalGoals] 
                          ? 'bg-[#8BAE5A] border-[#8BAE5A]' 
                          : 'border-[#3A4D23]'
                      }`}>
                        {personalGoals[goal.key as keyof typeof personalGoals] && (
                          <div className="w-full h-full rounded-full bg-[#8BAE5A] animate-pulse" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        personalGoals[goal.key as keyof typeof personalGoals] 
                          ? 'text-white' 
                          : 'text-[#8BAE5A]'
                      }`}>
                        {goal.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifestyle Info */}
              <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]/40">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">🏠</span>
                  Lifestyle Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Werkrooster:</span>
                    <span className="text-white font-medium">{lifestyleInfo.workSchedule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Sport schema:</span>
                    <span className="text-white font-medium">{lifestyleInfo.sportSchedule}</span>
                  </div>
                  {lifestyleInfo.freeTime.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[#8BAE5A] text-xs">Vrije tijd:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lifestyleInfo.freeTime.map((time, index) => (
                          <span key={index} className="px-2 py-1 bg-[#3A4D23]/40 rounded text-xs text-[#8BAE5A]">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {lifestyleInfo.stressTriggers.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[#8BAE5A] text-xs">Stress triggers:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lifestyleInfo.stressTriggers.map((trigger, index) => (
                          <span key={index} className="px-2 py-1 bg-red-500/20 rounded text-xs text-red-400">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="mt-6 bg-gradient-to-r from-[#8BAE5A]/10 to-[#FFD700]/10 rounded-lg p-4 border border-[#8BAE5A]/20">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center text-[#1A2A1A] text-sm">💡</span>
                Aanbevelingen op basis van je intake
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {stressAssessment.workStress >= 7 && (
                  <div className="flex items-start gap-2">
                    <span className="text-[#8BAE5A] mt-1">•</span>
                    <span className="text-white">Hoge werkstress gedetecteerd. Focus op stress release sessies en ademhalingsoefeningen.</span>
                  </div>
                )}
                {stressAssessment.sleepQuality <= 6 && (
                  <div className="flex items-start gap-2">
                    <span className="text-[#8BAE5A] mt-1">•</span>
                    <span className="text-white">Verbeter je slaapkwaliteit met sleep preparation sessies en een avondroutine.</span>
                  </div>
                )}
                {stressAssessment.energyLevel <= 6 && (
                  <div className="flex items-start gap-2">
                    <span className="text-[#8BAE5A] mt-1">•</span>
                    <span className="text-white">Laag energielevel. Recovery sessies en focus training kunnen helpen.</span>
                  </div>
                )}
                {personalGoals.improveFocus && (
                  <div className="flex items-start gap-2">
                    <span className="text-[#8BAE5A] mt-1">•</span>
                    <span className="text-white">Focus training sessies zijn ideaal voor jouw doelen.</span>
                  </div>
                )}
                {personalGoals.reduceStress && (
                  <div className="flex items-start gap-2">
                    <span className="text-[#8BAE5A] mt-1">•</span>
                    <span className="text-white">Stress release sessies en mindfulness oefeningen aanbevolen.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Personalized 6-Month Plan */}
            <div className="mt-6 bg-gradient-to-r from-[#1A2A1A] to-[#232D1A] rounded-lg p-6 border border-[#3A4D23]/40">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center text-[#1A2A1A] text-sm">📅</span>
                Je Persoonlijke 6-Maanden Plan
              </h3>
              <p className="text-[#8BAE5A] text-sm mb-6">
                Een op maat gemaakt traject gebaseerd op jouw intake resultaten. Elke week bouwt voort op de vorige.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Week 1 */}
                <div className={`rounded-lg p-4 border ${
                  completedWeeks.includes(1) 
                    ? 'bg-[#8BAE5A]/10 border-[#8BAE5A]/30' 
                    : currentActiveWeek === 1 
                      ? 'bg-[#232D1A] border-[#8BAE5A]/30' 
                      : 'bg-[#232D1A] border-[#3A4D23]/40 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Week 1</h4>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      completedWeeks.includes(1)
                        ? 'bg-green-500 text-white'
                        : currentActiveWeek === 1
                          ? 'bg-[#8BAE5A] text-[#1A2A1A]'
                          : 'bg-[#3A4D23] text-[#8BAE5A]'
                    }`}>
                      {completedWeeks.includes(1) ? 'Voltooid' : 
                       currentActiveWeek === 1 ? 'Actief' : 'Geblokkeerd'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        completedWeeks.includes(1) 
                          ? 'bg-green-500' 
                          : currentActiveWeek === 1 
                            ? 'bg-[#8BAE5A]' 
                            : 'bg-[#3A4D23]'
                      }`}>
                        <span className={`text-xs ${
                          completedWeeks.includes(1) || currentActiveWeek === 1
                            ? 'text-white'
                            : 'text-[#8BAE5A]'
                        }`}>✓</span>
                      </div>
                      <span className={`${
                        completedWeeks.includes(1) ? 'text-green-400' : 
                        currentActiveWeek === 1 ? 'text-white' : 'text-[#8BAE5A]'
                      }`}>Focus training - 3x per week</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        completedWeeks.includes(1) 
                          ? 'bg-green-500' 
                          : currentActiveWeek === 1 
                            ? 'bg-[#8BAE5A]' 
                            : 'bg-[#3A4D23]'
                      }`}>
                        <span className={`text-xs ${
                          completedWeeks.includes(1) || currentActiveWeek === 1
                            ? 'text-white'
                            : 'text-[#8BAE5A]'
                        }`}>✓</span>
                      </div>
                      <span className={`${
                        completedWeeks.includes(1) ? 'text-green-400' : 
                        currentActiveWeek === 1 ? 'text-white' : 'text-[#8BAE5A]'
                      }`}>Ademhalingsoefeningen - dagelijks 5 min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        completedWeeks.includes(1) 
                          ? 'bg-green-500' 
                          : currentActiveWeek === 1 
                            ? 'bg-[#8BAE5A]' 
                            : 'bg-[#3A4D23]'
                      }`}>
                        <span className={`text-xs ${
                          completedWeeks.includes(1) || currentActiveWeek === 1
                            ? 'text-white'
                            : 'text-[#8BAE5A]'
                        }`}>✓</span>
                      </div>
                      <span className={`${
                        completedWeeks.includes(1) ? 'text-green-400' : 
                        currentActiveWeek === 1 ? 'text-white' : 'text-[#8BAE5A]'
                      }`}>Stress assessment bijhouden</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push('/dashboard/mind-focus/week-1')}
                    disabled={!completedWeeks.includes(1) && currentActiveWeek !== 1}
                    className={`w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      completedWeeks.includes(1)
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : currentActiveWeek === 1
                          ? 'bg-[#8BAE5A] text-[#1A2A1A] hover:bg-[#A6C97B]'
                          : 'bg-[#3A4D23] text-[#8BAE5A] cursor-not-allowed'
                    }`}
                  >
                    {completedWeeks.includes(1) ? 'Bekijk Week 1' : 
                     currentActiveWeek === 1 ? 'Start Week 1' : 'Voltooi vorige week eerst'}
                  </button>
                </div>

                {/* Week 2 */}
                <div className={`rounded-lg p-4 border ${
                  completedWeeks.includes(2) 
                    ? 'bg-[#8BAE5A]/10 border-[#8BAE5A]/30' 
                    : currentActiveWeek === 2 
                      ? 'bg-[#232D1A] border-[#8BAE5A]/30' 
                      : 'bg-[#232D1A] border-[#3A4D23]/40 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Week 2</h4>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      completedWeeks.includes(2)
                        ? 'bg-green-500 text-white'
                        : currentActiveWeek === 2
                          ? 'bg-[#8BAE5A] text-[#1A2A1A]'
                          : 'bg-[#3A4D23] text-[#8BAE5A]'
                    }`}>
                      {completedWeeks.includes(2) ? 'Voltooid' : 
                       currentActiveWeek === 2 ? 'Actief' : 'Geblokkeerd'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        completedWeeks.includes(2) 
                          ? 'bg-green-500' 
                          : currentActiveWeek === 2 
                            ? 'bg-[#8BAE5A]' 
                            : 'bg-[#3A4D23]'
                      }`}>
                        <span className={`text-xs ${
                          completedWeeks.includes(2) || currentActiveWeek === 2
                            ? 'text-white'
                            : 'text-[#8BAE5A]'
                        }`}>✓</span>
                      </div>
                      <span className={`${
                        completedWeeks.includes(2) ? 'text-green-400' : 
                        currentActiveWeek === 2 ? 'text-white' : 'text-[#8BAE5A]'
                      }`}>Stress release sessies - 2x per week</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        completedWeeks.includes(2) 
                          ? 'bg-green-500' 
                          : currentActiveWeek === 2 
                            ? 'bg-[#8BAE5A]' 
                            : 'bg-[#3A4D23]'
                      }`}>
                        <span className={`text-xs ${
                          completedWeeks.includes(2) || currentActiveWeek === 2
                            ? 'text-white'
                            : 'text-[#8BAE5A]'
                        }`}>✓</span>
                      </div>
                      <span className={`${
                        completedWeeks.includes(2) ? 'text-green-400' : 
                        currentActiveWeek === 2 ? 'text-white' : 'text-[#8BAE5A]'
                      }`}>Focus training - 4x per week</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        completedWeeks.includes(2) 
                          ? 'bg-green-500' 
                          : currentActiveWeek === 2 
                            ? 'bg-[#8BAE5A]' 
                            : 'bg-[#3A4D23]'
                      }`}>
                        <span className={`text-xs ${
                          completedWeeks.includes(2) || currentActiveWeek === 2
                            ? 'text-white'
                            : 'text-[#8BAE5A]'
                        }`}>✓</span>
                      </div>
                      <span className={`${
                        completedWeeks.includes(2) ? 'text-green-400' : 
                        currentActiveWeek === 2 ? 'text-white' : 'text-[#8BAE5A]'
                      }`}>Progress tracking</span>
                    </div>
                  </div>
                  <button 
                    disabled={!completedWeeks.includes(2) && currentActiveWeek !== 2}
                    className={`w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      completedWeeks.includes(2)
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : currentActiveWeek === 2
                          ? 'bg-[#8BAE5A] text-[#1A2A1A] hover:bg-[#A6C97B]'
                          : 'bg-[#3A4D23] text-[#8BAE5A] cursor-not-allowed'
                    }`}
                  >
                    {completedWeeks.includes(2) ? 'Bekijk Week 2' : 
                     currentActiveWeek === 2 ? 'Start Week 2' : 'Voltooi Week 1 eerst'}
                  </button>
                </div>

                {/* Week 3 */}
                <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]/40 opacity-60">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Week 3</h4>
                    <span className="px-2 py-1 bg-[#3A4D23] text-[#8BAE5A] text-xs rounded-full font-medium">Geblokkeerd</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#3A4D23] rounded-full"></div>
                      <span className="text-[#8BAE5A]">Sleep preparation - avondroutine</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#3A4D23] rounded-full"></div>
                      <span className="text-[#8BAE5A]">Recovery sessies - 2x per week</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#3A4D23] rounded-full"></div>
                      <span className="text-[#8BAE5A]">Stress management technieken</span>
                    </div>
                  </div>
                  <button disabled className="w-full mt-3 px-3 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg text-sm font-medium cursor-not-allowed">
                    Voltooi Week 2 eerst
                  </button>
                </div>

                {/* Week 4 */}
                <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]/40 opacity-60">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Week 4</h4>
                    <span className="px-2 py-1 bg-[#3A4D23] text-[#8BAE5A] text-xs rounded-full font-medium">Geblokkeerd</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#3A4D23] rounded-full"></div>
                      <span className="text-[#8BAE5A]">Integratie van alle technieken</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#3A4D23] rounded-full"></div>
                      <span className="text-[#8BAE5A]">Week 1-3 evaluatie</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#3A4D23] rounded-full"></div>
                      <span className="text-[#8BAE5A]">Plan aanpassingen</span>
                    </div>
                  </div>
                  <button disabled className="w-full mt-3 px-3 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg text-sm font-medium cursor-not-allowed">
                    Voltooi Week 3 eerst
                  </button>
                </div>

                {/* Maanden 2-6 Preview */}
                <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]/40 opacity-60 lg:col-span-2 xl:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Maanden 2-6</h4>
                    <span className="px-2 py-1 bg-[#3A4D23] text-[#8BAE5A] text-xs rounded-full font-medium">Later beschikbaar</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="text-[#8BAE5A] font-medium mb-2">Maand 2-3: Verdieping</h5>
                      <ul className="space-y-1 text-[#8BAE5A]">
                        <li>• Geavanceerde focus technieken</li>
                        <li>• Stress management strategieën</li>
                        <li>• Slaap optimalisatie</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-[#8BAE5A] font-medium mb-2">Maand 4-6: Meesterschap</h5>
                      <ul className="space-y-1 text-[#8BAE5A]">
                        <li>• Persoonlijke routine ontwikkeling</li>
                        <li>• Advanced recovery technieken</li>
                        <li>• Lange termijn behoud</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-[#3A4D23]/20 rounded border border-[#3A4D23]/40">
                    <p className="text-[#8BAE5A] text-xs">
                      📈 Voltooi de eerste maand om toegang te krijgen tot de volgende fase van je traject
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="mt-6 bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]/40">
                <h4 className="font-semibold text-white mb-3">Traject Voortgang</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#8BAE5A]">Week 1 van 24</span>
                      <span className="text-white">4%</span>
                    </div>
                    <div className="w-full bg-[#3A4D23] rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] h-2 rounded-full" style={{ width: '4%' }}></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#8BAE5A]">Volgende milestone</div>
                    <div className="text-white font-medium">Week 4</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress table */}
        <div className="bg-[#1A2A1A]/80 border border-[#2A3A1A] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2A3A1A]">
            <h2 className="text-xl font-bold text-white">Voortgang & Opties</h2>
            <p className="text-[#8BAE5A] text-sm">Alle onderdelen van de module in één overzicht.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#0F140F] text-[#8BAE5A] text-xs uppercase">
                <tr>
                  <th className="px-5 py-3">Onderdeel</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Laatste gebruik</th>
                  <th className="px-5 py-3">Actie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3A1A] text-sm">
                {[
                  { key: 'focus', label: 'Focus Training' },
                  { key: 'stress', label: 'Stress Release' },
                  { key: 'sleep', label: 'Sleep Preparation' },
                  { key: 'recovery', label: 'Recovery' },
                  { key: 'journal', label: 'Dagboek (Journal)' },
                  { key: 'gratitude', label: 'Dankbaarheid' },
                  { key: 'breathing', label: 'Ademhalingsoefeningen' },
                ].map((row) => (
                  <tr key={row.key} className="hover:bg-[#232D1A]">
                    <td className="px-5 py-3 text-white">{row.label}</td>
                    <td className="px-5 py-3"><span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-[#26331A] text-[#B6C948]">Beschikbaar</span></td>
                    <td className="px-5 py-3 text-gray-300">—</td>
                    <td className="px-5 py-3">
                      {['focus','stress','sleep','recovery'].includes(row.key) ? (
                        <button
                          onClick={() => router.push(`/dashboard/mind-focus/${row.key}-training`)}
                          className="px-3 py-1.5 text-xs rounded-md bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#1A2A1A] font-semibold hover:from-[#7A9D4A] hover:to-[#e0903f]"
                        >Start</button>
                      ) : (
                        <button className="px-3 py-1.5 text-xs rounded-md bg-[#2A3A1A] text-white border border-[#3A4A2A] cursor-not-allowed">Binnenkort</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reset Intake Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            ref={resetModalRef}
            tabIndex={-1}
            className="bg-[#1A2A1A] rounded-xl border border-[#3A4D23]/40 max-w-md w-full p-6 focus:outline-none"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-white">Intake Resetten</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-[#8BAE5A] leading-relaxed">
                Weet je zeker dat je je intake wilt resetten?
              </p>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-red-400 mb-2">Belangrijke waarschuwing:</h4>
                <ul className="text-sm text-red-300 space-y-1">
                  <li>• Mind & Focus is een 6-maanden programma op maat gemaakt</li>
                  <li>• Je huidige plan is gebaseerd op jouw intake gegevens</li>
                  <li>• Het is mogelijk om tussentijds meerdere modules te gebruiken</li>
                  <li>• We raden het af om een reset intake te doen</li>
                </ul>
              </div>
              
              <div className="bg-[#8BAE5A]/10 border border-[#8BAE5A]/20 rounded-lg p-4">
                <h4 className="font-semibold text-[#8BAE5A] mb-2">Alternatieven:</h4>
                <ul className="text-sm text-[#8BAE5A] space-y-1">
                  <li>• Gebruik alle modules zonder intake te resetten</li>
                  <li>• Pas je doelen aan via de instellingen</li>
                  <li>• Neem contact op met support voor hulp</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2 bg-[#3A4D23] hover:bg-[#4A5A33] text-[#8BAE5A] rounded-lg font-medium transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  resetIntake();
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
              >
                Ja, Reset Intake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderIntakeForm = () => {
    const totalSteps = 7;
    const nextStep = () => setTfStep((s) => Math.min(s + 1, totalSteps - 1));
    const prevStep = () => setTfStep((s) => Math.max(s - 1, 0));

    const ProgressBar = () => (
      <div className="w-full h-2 bg-[#2A3A1A] rounded-lg overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] transition-all duration-300"
          style={{ width: `${Math.round(((tfStep + 1) / totalSteps) * 100)}%` }}
        />
      </div>
    );

    const StepShell: React.FC<{ title: string; children: React.ReactNode; canNext?: boolean; showBack?: boolean; onNext?: () => void; ctaText?: string }>
      = ({ title, children, canNext = true, showBack = tfStep > 0, onNext, ctaText }) => (
      <div className="bg-[#1A2A1A]/80 rounded-xl p-6 md:p-8 border border-[#2A3A1A]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
          <div className="w-40"><ProgressBar /></div>
        </div>
        <div className="mb-6">
          {children}
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            className={`px-4 py-2 rounded-lg text-sm border ${showBack ? 'border-[#3A4A2A] text-white hover:bg-[#2A3A1A]' : 'opacity-0 pointer-events-none'}`}
          >Terug</button>
          <button
            onClick={onNext || nextStep}
            disabled={!canNext || isSaving}
            className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#1A2A1A] disabled:opacity-50"
          >{ctaText || 'Volgende'}</button>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A]">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Mind & Focus Intake</h1>
            <p className="text-[#8BAE5A] text-center mb-8">Beantwoord enkele korte vragen. Je voortgang wordt bewaard tot je afrondt.</p>

            {tfStep === 0 && (
              <StepShell title="Werk stress (1-10)">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressAssessment.workStress}
                  onChange={(e) => setStressAssessment(prev => ({ ...prev, workStress: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-white text-center mt-2">{stressAssessment.workStress}/10</div>
              </StepShell>
            )}

            {tfStep === 1 && (
              <StepShell title="Persoonlijke stress (1-10)">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressAssessment.personalStress}
                  onChange={(e) => setStressAssessment(prev => ({ ...prev, personalStress: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-white text-center mt-2">{stressAssessment.personalStress}/10</div>
              </StepShell>
            )}

            {tfStep === 2 && (
              <StepShell title="Slaapkwaliteit (1-10)">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressAssessment.sleepQuality}
                  onChange={(e) => setStressAssessment(prev => ({ ...prev, sleepQuality: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-white text-center mt-2">{stressAssessment.sleepQuality}/10</div>
              </StepShell>
            )}

            {tfStep === 3 && (
              <StepShell title="Energie level (1-10)">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressAssessment.energyLevel}
                  onChange={(e) => setStressAssessment(prev => ({ ...prev, energyLevel: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-white text-center mt-2">{stressAssessment.energyLevel}/10</div>
              </StepShell>
            )}

            {tfStep === 4 && (
              <StepShell title="Herken je één of meer van deze?">
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={stressAssessment.focusProblems}
                      onChange={(e) => setStressAssessment(prev => ({ ...prev, focusProblems: e.target.checked }))}
                      className="mr-3"
                    />
                    <span className="text-white">Ik heb problemen met concentratie</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={stressAssessment.irritability}
                      onChange={(e) => setStressAssessment(prev => ({ ...prev, irritability: e.target.checked }))}
                      className="mr-3"
                    />
                    <span className="text-white">Ik voel me snel geïrriteerd of agressief</span>
                  </label>
                </div>
              </StepShell>
            )}

            {tfStep === 5 && (
              <StepShell title="Persoonlijke doelen">
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" checked={personalGoals.improveFocus} onChange={(e) => setPersonalGoals(p => ({ ...p, improveFocus: e.target.checked }))} className="mr-3" />
                    <span className="text-white">Verbeter focus en concentratie</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked={personalGoals.reduceStress} onChange={(e) => setPersonalGoals(p => ({ ...p, reduceStress: e.target.checked }))} className="mr-3" />
                    <span className="text-white">Verminder stress</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked={personalGoals.betterSleep} onChange={(e) => setPersonalGoals(p => ({ ...p, betterSleep: e.target.checked }))} className="mr-3" />
                    <span className="text-white">Beter slapen</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked={personalGoals.moreEnergy} onChange={(e) => setPersonalGoals(p => ({ ...p, moreEnergy: e.target.checked }))} className="mr-3" />
                    <span className="text-white">Meer energie</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked={personalGoals.workLifeBalance} onChange={(e) => setPersonalGoals(p => ({ ...p, workLifeBalance: e.target.checked }))} className="mr-3" />
                    <span className="text-white">Betere werk/privé balans</span>
                  </label>
                </div>
              </StepShell>
            )}

            {tfStep === 6 && (
              <StepShell title="Controleer en bevestig" ctaText={isSaving ? 'Opslaan...' : 'Intake voltooien'} onNext={saveIntakeData} canNext={!isSaving}>
                <div className="grid grid-cols-1 gap-4 text-white text-sm">
                  <div className="bg-[#232D1A] rounded-lg p-4 border border-[#2A3A1A]">
                    <div className="font-semibold text-[#8BAE5A] mb-2">Scores</div>
                    <div>Werk stress: {stressAssessment.workStress}/10</div>
                    <div>Persoonlijke stress: {stressAssessment.personalStress}/10</div>
                    <div>Slaapkwaliteit: {stressAssessment.sleepQuality}/10</div>
                    <div>Energie level: {stressAssessment.energyLevel}/10</div>
                  </div>
                  <div className="bg-[#232D1A] rounded-lg p-4 border border-[#2A3A1A]">
                    <div className="font-semibold text-[#8BAE5A] mb-2">Signalen</div>
                    <div>{stressAssessment.focusProblems ? '• Concentratieproblemen' : '• Geen concentratieproblemen gemeld'}</div>
                    <div>{stressAssessment.irritability ? '• Snel geïrriteerd / agressief' : '• Geen irritatie/agressie gemeld'}</div>
                  </div>
                  <div className="bg-[#232D1A] rounded-lg p-4 border border-[#2A3A1A]">
                    <div className="font-semibold text-[#8BAE5A] mb-2">Doelen</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {personalGoals.improveFocus && <li>Verbeter focus en concentratie</li>}
                      {personalGoals.reduceStress && <li>Verminder stress</li>}
                      {personalGoals.betterSleep && <li>Beter slapen</li>}
                      {personalGoals.moreEnergy && <li>Meer energie</li>}
                      {personalGoals.workLifeBalance && <li>Betere werk/privé balans</li>}
                      {!personalGoals.improveFocus && !personalGoals.reduceStress && !personalGoals.betterSleep && !personalGoals.moreEnergy && !personalGoals.workLifeBalance && <li>Geen doelen geselecteerd</li>}
                    </ul>
                  </div>
                </div>
              </StepShell>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show loading state while checking for existing profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
            <p className="text-[#8BAE5A] text-lg">Laden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'intro') {
    return renderIntro();
  }

  if (currentView === 'intake') {
    return renderIntakeForm();
  }

  return renderDashboard();
}
