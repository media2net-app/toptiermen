'use client';

import React, { useState, useEffect } from 'react';
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

  // Save intake data function
  const saveIntakeData = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/mind-focus/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          stressAssessment,
          lifestyleInfo,
          personalGoals
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Intake data saved successfully');
        setHasExistingProfile(true);
        setCurrentView('dashboard');
        
        // Force reload to ensure clean state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error('❌ Failed to save intake data:', data.error);
      }
    } catch (error) {
      console.error('Error saving intake data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderIntro = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Mind & Focus
          </h1>
          <p className="text-xl text-[#8BAE5A] max-w-3xl mx-auto">
            Ontwikkel mentale kracht, verbeter je focus en bereik innerlijke balans met onze gecureerde meditatie en mindfulness programma's.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {meditationTypes.map((type) => (
            <div
              key={type.id}
              className="bg-[#1A2A1A]/80 rounded-xl p-6 text-center hover:bg-[#1A2A1A] transition-all duration-300 cursor-pointer border border-[#2A3A1A] hover:border-[#3A4A2A]"
              onClick={() => setCurrentView('intake')}
            >
              <div className={`w-16 h-16 ${type.color} rounded-full flex items-center justify-center text-white mx-auto mb-4`}>
                {type.iconComponent}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{type.name}</h3>
              <p className="text-[#8BAE5A] text-sm">{type.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setCurrentView('intake')}
            className="bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#1A2A1A] px-8 py-4 rounded-xl font-bold text-lg hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Mind & Focus Assessment
          </button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Mind & Focus Dashboard</h1>
            <p className="text-[#8BAE5A] mt-2">Welkom terug! Laten we je mentale welzijn verbeteren.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meditationTypes.map((type) => (
                <div
                  key={type.id}
                  className="bg-[#1A2A1A]/80 rounded-xl p-6 border border-[#2A3A1A] hover:border-[#3A4A2A] transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/dashboard/mind-focus/${type.id}-training`)}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 ${type.color} rounded-full flex items-center justify-center text-white`}>
                      {type.iconComponent}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{type.name}</h3>
                      <p className="text-[#8BAE5A] text-sm">{type.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-[#8BAE5A] text-sm">
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Start Sessie
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Jouw Progress</h2>
            <div className="space-y-4">
              <div className="bg-[#1A2A1A]/80 rounded-xl p-6 border border-[#2A3A1A]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#8BAE5A]">Deze Week</span>
                  <span className="text-white font-bold">3 sessies</span>
                </div>
                <div className="w-full bg-[#2A3A1A] rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div className="bg-[#1A2A1A]/80 rounded-xl p-6 border border-[#2A3A1A]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#8BAE5A]">Streak</span>
                  <span className="text-white font-bold">5 dagen</span>
                </div>
                <div className="flex">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full mr-1 ${i < 5 ? 'bg-[#8BAE5A]' : 'bg-[#2A3A1A]'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-[#1A2A1A]/80 rounded-xl p-6 border border-[#2A3A1A]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#8BAE5A]">Focus Score</span>
                  <span className="text-white font-bold">8.2/10</span>
                </div>
                <div className="w-full bg-[#2A3A1A] rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntakeForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Mind & Focus Assessment
          </h1>
          <p className="text-[#8BAE5A] text-center mb-8">
            Help ons je persoonlijke programma samen te stellen door een paar vragen te beantwoorden.
          </p>
          
          <div className="bg-[#1A2A1A]/80 rounded-xl p-8 border border-[#2A3A1A]">
            {/* Stress Assessment */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Stress Assessment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#8BAE5A] mb-2">Werk stress (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={stressAssessment.workStress}
                    onChange={(e) => setStressAssessment(prev => ({ ...prev, workStress: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-white text-center mt-1">{stressAssessment.workStress}/10</div>
                </div>
                
                <div>
                  <label className="block text-[#8BAE5A] mb-2">Persoonlijke stress (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={stressAssessment.personalStress}
                    onChange={(e) => setStressAssessment(prev => ({ ...prev, personalStress: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-white text-center mt-1">{stressAssessment.personalStress}/10</div>
                </div>
                
                <div>
                  <label className="block text-[#8BAE5A] mb-2">Slaapkwaliteit (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={stressAssessment.sleepQuality}
                    onChange={(e) => setStressAssessment(prev => ({ ...prev, sleepQuality: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-white text-center mt-1">{stressAssessment.sleepQuality}/10</div>
                </div>
                
                <div>
                  <label className="block text-[#8BAE5A] mb-2">Energie level (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={stressAssessment.energyLevel}
                    onChange={(e) => setStressAssessment(prev => ({ ...prev, energyLevel: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-white text-center mt-1">{stressAssessment.energyLevel}/10</div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
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
            </div>

            {/* Personal Goals */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Persoonlijke Doelen</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={personalGoals.improveFocus}
                    onChange={(e) => setPersonalGoals(prev => ({ ...prev, improveFocus: e.target.checked }))}
                    className="mr-3"
                  />
                  <span className="text-white">Verbeter focus en concentratie</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={personalGoals.reduceStress}
                    onChange={(e) => setPersonalGoals(prev => ({ ...prev, reduceStress: e.target.checked }))}
                    className="mr-3"
                  />
                  <span className="text-white">Verminder stress</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={personalGoals.betterSleep}
                    onChange={(e) => setPersonalGoals(prev => ({ ...prev, betterSleep: e.target.checked }))}
                    className="mr-3"
                  />
                  <span className="text-white">Beter slapen</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={personalGoals.moreEnergy}
                    onChange={(e) => setPersonalGoals(prev => ({ ...prev, moreEnergy: e.target.checked }))}
                    className="mr-3"
                  />
                  <span className="text-white">Meer energie</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={personalGoals.workLifeBalance}
                    onChange={(e) => setPersonalGoals(prev => ({ ...prev, workLifeBalance: e.target.checked }))}
                    className="mr-3"
                  />
                  <span className="text-white">Betere werk/privé balans</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                onClick={saveIntakeData}
                disabled={isSaving}
                className="bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#1A2A1A] px-8 py-4 rounded-xl font-bold text-lg hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Opslaan...' : 'Assessment Voltooien'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
