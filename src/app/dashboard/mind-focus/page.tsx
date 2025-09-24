'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FireIcon, 
  ClockIcon, 
  TagIcon,
  CalendarDaysIcon,
  CpuChipIcon,
  BookOpenIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/solid';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { toast } from 'react-hot-toast';

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
  sportSchedule: string;
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
  type: string;
  duration: number;
  description: string;
  scheduledTime?: string;
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
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Load existing profile data on component mount
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/mind-focus/intake?userId=${user.id}`);
        const data = await response.json();
        
        // Debug information
        const debugData = {
          userId: user.id,
          userEmail: user.email,
          apiResponse: data,
          hasProfile: data.success && data.profile,
          profileData: data.profile,
          currentView: data.success && data.profile ? 'dashboard' : 'intro',
          timestamp: new Date().toISOString()
        };
        setDebugInfo(debugData);
        
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
        setDebugInfo({
          userId: user.id,
          userEmail: user.email,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadExistingProfile();
  }, [user]);


  const intakeSteps = [
    {
      id: 'stress',
      title: 'Stress Assessment',
      subtitle: 'Hoe voel je je momenteel?',
      icon: <FireIcon className="w-8 h-8" />
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
      icon: <TagIcon className="w-8 h-8" />
    }
  ];

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
    sportSchedule: '',
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

  const [personalPlan, setPersonalPlan] = useState<{
    dailyRoutine: MeditationSession[];
    weeklyGoals: string[];
    progressTargets: any;
  } | null>(null);

  const [todaySessions, setTodaySessions] = useState<MeditationSession[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [currentStressLevel, setCurrentStressLevel] = useState(5);

  // Update dashboard data when component mounts or when currentView changes to dashboard
  useEffect(() => {
    if (currentView === 'dashboard' && !dashboardData) {
      const dashboardDebugInfo = {
        sessionsThisWeek: 5,
        currentStressLevel: currentStressLevel,
        totalSessions: 12,
        focusImprovement: 85,
        streak: streakCount,
        timestamp: new Date().toISOString()
      };
      setDashboardData(dashboardDebugInfo);
    }
  }, [currentView, currentStressLevel, streakCount, dashboardData]);

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: <CpuChipIcon className="w-5 h-5" /> },
    { id: 'profile', label: 'Mijn Profiel', icon: <CpuChipIcon className="w-5 h-5" /> },
    { id: 'meditations', label: 'Meditaties', icon: <BookOpenIcon className="w-5 h-5" /> },
    { id: 'journal', label: 'Journaling', icon: <ChartBarIcon className="w-5 h-5" /> }
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

  const saveIntakeData = async () => {
    if (!user) return;
    
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
      
      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        saveAttempt: {
          success: data.success,
          response: data,
          timestamp: new Date().toISOString(),
          dataSent: {
            userId: user.id,
            stressAssessment,
            lifestyleInfo,
            personalGoals
          }
        }
      }));
      
      if (data.success) {
        console.log('Intake data saved successfully');
        setHasExistingProfile(true);
      } else {
        console.error('Failed to save intake data:', data.error);
      }
    } catch (error) {
      console.error('Error saving intake data:', error);
      setDebugInfo(prev => ({
        ...prev,
        saveAttempt: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
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

    // Generate weekly goals based on personal goals
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
    
    // Save intake data to database
    saveIntakeData();
    
    setCurrentView('plan');
  };


  const completeSession = (sessionId: string) => {
    console.log('Completing session:', sessionId);
    toast.success('Sessie voltooid!');
  };

  const renderIntro = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2A3A1A] to-[#3A4A2A] px-12 py-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-[#B6C948]/20 rounded-2xl">
                <CpuChipIcon className="w-16 h-16 text-[#B6C948]" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-[#B6C948] mb-4">
              🧠 Mind & Focus
            </h1>
            <p className="text-[#8BAE5A] text-xl max-w-2xl mx-auto">
              Jouw persoonlijke stress management en focus training hub
            </p>
          </div>

          {/* Content */}
          <div className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              {/* Wat is Mind & Focus */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <FireIcon className="w-8 h-8 text-[#B6C948] mr-3" />
                  Wat is Mind & Focus?
                </h2>
                <div className="space-y-4 text-[#8BAE5A]">
                  <p>
                    Mind & Focus is jouw persoonlijke stress management en focus training platform. 
                    We helpen je om mentaal sterker te worden, stress te verminderen en je focus te verbeteren.
                  </p>
                  <p>
                    Geen zweverige chakra's of vrouwelijke wellness trends - wij focussen op praktische, 
                    mannelijke stress management technieken die écht werken.
                  </p>
                </div>
              </div>

              {/* Wat krijg je */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <TagIcon className="w-8 h-8 text-[#B6C948] mr-3" />
                  Wat krijg je?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start p-4 bg-[#1A2A1A] border border-[#2A3A1A] rounded-lg">
                    <div className="w-6 h-6 bg-[#B6C948] rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-[#1A2A1A] text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Persoonlijk Plan</h3>
                      <p className="text-[#8BAE5A] text-sm">Op maat gemaakt meditatie en focus plan gebaseerd op jouw levensstijl</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 bg-[#1A2A1A] border border-[#2A3A1A] rounded-lg">
                    <div className="w-6 h-6 bg-[#B6C948] rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-[#1A2A1A] text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Dagelijkse Routine</h3>
                      <p className="text-[#8BAE5A] text-sm">Meditatie sessies die perfect passen in jouw werkrooster</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 bg-[#1A2A1A] border border-[#2A3A1A] rounded-lg">
                    <div className="w-6 h-6 bg-[#B6C948] rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-[#1A2A1A] text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Progress Tracking</h3>
                      <p className="text-[#8BAE5A] text-sm">Monitor je stress levels en focus verbetering over tijd</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hoe werkt het */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">
                Hoe werkt het?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#B6C948]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-[#B6C948]">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Intake</h3>
                  <p className="text-[#8BAE5A] text-sm">Vul een korte intake in over je stress levels en levensstijl</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#B6C948]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-[#B6C948]">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Plan</h3>
                  <p className="text-[#8BAE5A] text-sm">Krijg een op maat gemaakt plan met meditatie sessies</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#B6C948]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-[#B6C948]">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Train</h3>
                  <p className="text-[#8BAE5A] text-sm">Start met je dagelijkse routine en track je progress</p>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <motion.button
                onClick={() => setCurrentView('intake')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#1A2A1A] px-12 py-4 rounded-xl text-xl font-bold hover:from-[#8BAE5A] hover:to-[#B6C948] transition-all duration-300 shadow-2xl hover:shadow-3xl"
              >
                🚀 Start Intake
              </motion.button>
              <p className="text-[#8BAE5A] text-sm mt-4">
                Neem 3 minuten de tijd voor een betere mentale gezondheid
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

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
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] overflow-hidden"
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
                      <label className="block text-lg font-medium text-white mb-2">
                        Werk Stress Level (1-10)
                      </label>
                      <p className="text-sm text-[#8BAE5A] mb-4">
                        Hoe gestrest voel je je op je werk? 1 = heel ontspannen, 10 = extreem gestrest
                      </p>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={stressAssessment.workStress}
                        onChange={(e) => setStressAssessment(prev => ({
                          ...prev,
                          workStress: parseInt(e.target.value)
                        }))}
                        className="w-full h-3 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer slider-green"
                        style={{
                          background: `linear-gradient(to right, #B6C948 0%, #B6C948 ${(stressAssessment.workStress - 1) * 11.11}%, #2A3A1A ${(stressAssessment.workStress - 1) * 11.11}%, #2A3A1A 100%)`
                        }}
                      />
                      <div className="flex justify-between text-sm text-[#8BAE5A] mt-2">
                        <span>Laag</span>
                        <span className="font-bold text-[#B6C948] text-lg">{stressAssessment.workStress}</span>
                        <span>Hoog</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-white mb-2">
                        Privé Stress Level (1-10)
                      </label>
                      <p className="text-sm text-[#8BAE5A] mb-4">
                        Hoe gestrest voel je je in je privéleven? 1 = heel ontspannen, 10 = extreem gestrest
                      </p>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={stressAssessment.personalStress}
                        onChange={(e) => setStressAssessment(prev => ({
                          ...prev,
                          personalStress: parseInt(e.target.value)
                        }))}
                        className="w-full h-3 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer slider-green"
                        style={{
                          background: `linear-gradient(to right, #B6C948 0%, #B6C948 ${(stressAssessment.personalStress - 1) * 11.11}%, #2A3A1A ${(stressAssessment.personalStress - 1) * 11.11}%, #2A3A1A 100%)`
                        }}
                      />
                      <div className="flex justify-between text-sm text-[#8BAE5A] mt-2">
                        <span>Laag</span>
                        <span className="font-bold text-[#B6C948] text-lg">{stressAssessment.personalStress}</span>
                        <span>Hoog</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-white mb-2">
                        Slaapkwaliteit (1-10)
                      </label>
                      <p className="text-sm text-[#8BAE5A] mb-4">
                        Hoe goed slaap je? 1 = heel slecht slapen, 10 = perfect slapen
                      </p>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={stressAssessment.sleepQuality}
                        onChange={(e) => setStressAssessment(prev => ({
                          ...prev,
                          sleepQuality: parseInt(e.target.value)
                        }))}
                        className="w-full h-3 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer slider-green"
                        style={{
                          background: `linear-gradient(to right, #B6C948 0%, #B6C948 ${(stressAssessment.sleepQuality - 1) * 11.11}%, #2A3A1A ${(stressAssessment.sleepQuality - 1) * 11.11}%, #2A3A1A 100%)`
                        }}
                      />
                      <div className="flex justify-between text-sm text-[#8BAE5A] mt-2">
                        <span>Slecht</span>
                        <span className="font-bold text-[#B6C948] text-lg">{stressAssessment.sleepQuality}</span>
                        <span>Uitstekend</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-white mb-2">
                        Energie Level (1-10)
                      </label>
                      <p className="text-sm text-[#8BAE5A] mb-4">
                        Hoe energiek voel je je? 1 = heel moe/uitgeput, 10 = vol energie
                      </p>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={stressAssessment.energyLevel}
                        onChange={(e) => setStressAssessment(prev => ({
                          ...prev,
                          energyLevel: parseInt(e.target.value)
                        }))}
                        className="w-full h-3 bg-[#2A3A1A] rounded-lg appearance-none cursor-pointer slider-green"
                        style={{
                          background: `linear-gradient(to right, #B6C948 0%, #B6C948 ${(stressAssessment.energyLevel - 1) * 11.11}%, #2A3A1A ${(stressAssessment.energyLevel - 1) * 11.11}%, #2A3A1A 100%)`
                        }}
                      />
                      <div className="flex justify-between text-sm text-[#8BAE5A] mt-2">
                        <span>Laag</span>
                        <span className="font-bold text-[#B6C948] text-lg">{stressAssessment.energyLevel}</span>
                        <span>Hoog</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex items-start p-6 border-2 border-[#2A3A1A] rounded-xl hover:border-[#B6C948] hover:bg-[#B6C948]/10 cursor-pointer transition-all bg-[#1A2A1A]">
                      <input
                        type="checkbox"
                        checked={stressAssessment.focusProblems}
                        onChange={(e) => setStressAssessment(prev => ({
                          ...prev,
                          focusProblems: e.target.checked
                        }))}
                        className="mr-4 w-5 h-5 text-[#B6C948] mt-1"
                      />
                      <div>
                        <span className="text-lg text-white block">Focus problemen</span>
                        <span className="text-sm text-[#8BAE5A]">Moeite met concentreren of taken afmaken</span>
                      </div>
                    </label>
                    <label className="flex items-start p-6 border-2 border-[#2A3A1A] rounded-xl hover:border-[#B6C948] hover:bg-[#B6C948]/10 cursor-pointer transition-all bg-[#1A2A1A]">
                      <input
                        type="checkbox"
                        checked={stressAssessment.irritability}
                        onChange={(e) => setStressAssessment(prev => ({
                          ...prev,
                          irritability: e.target.checked
                        }))}
                        className="mr-4 w-5 h-5 text-[#B6C948] mt-1"
                      />
                      <div>
                        <span className="text-lg text-white block">Irritatie/agressie</span>
                        <span className="text-sm text-[#8BAE5A]">Snel geïrriteerd of agressief reageren</span>
                      </div>
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
                      <label className="block text-lg font-medium text-white mb-2">
                        Werkrooster
                      </label>
                      <p className="text-sm text-[#8BAE5A] mb-4">
                        Wanneer werk je meestal? Dit helpt ons om de beste momenten voor meditatie te vinden
                      </p>
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
                      <label className="block text-lg font-medium text-white mb-2">
                        Reistijd naar werk (minuten)
                      </label>
                      <p className="text-sm text-[#8BAE5A] mb-4">
                        Hoe lang doe je erover om naar je werk te gaan? Ideaal voor korte meditatie sessies
                      </p>
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
                      <label className="block text-lg font-medium text-white mb-2">
                        Lunch pauze
                      </label>
                      <p className="text-sm text-[#8BAE5A] mb-4">
                        Wanneer heb je lunch? Perfect moment voor een korte stress-release sessie
                      </p>
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
                    {Object.entries(personalGoals).map(([key, value]) => {
                      const goalLabels = {
                        stressVerminderen: { title: 'Stress verminderen', description: 'Minder stress en meer rust in je leven' },
                        focusVerbeteren: { title: 'Focus verbeteren', description: 'Beter concentreren en taken afmaken' },
                        betereSlaap: { title: 'Betere slaap', description: 'Dieper slapen en uitgerust wakker worden' },
                        betereRelaties: { title: 'Betere relaties', description: 'Meer verbinding en harmonie in relaties' },
                        hogerePrestaties: { title: 'Hogere prestaties', description: 'Beter presteren op werk en in sport' },
                        emotioneleControle: { title: 'Emotionele controle', description: 'Beter omgaan met emoties en reacties' }
                      };
                      
                      const goal = goalLabels[key as keyof typeof goalLabels];
                      
                      return (
                        <label key={key} className="flex items-start p-6 border-2 border-[#2A3A1A] rounded-xl hover:border-[#B6C948] hover:bg-[#B6C948]/10 cursor-pointer transition-all bg-[#1A2A1A]">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setPersonalGoals(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="mr-4 w-5 h-5 text-[#B6C948] mt-1"
                          />
                          <div>
                            <span className="text-lg text-white block">{goal.title}</span>
                            <span className="text-sm text-[#8BAE5A]">{goal.description}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="px-12 py-6 bg-[#1A2A1A] flex justify-between items-center border-t border-[#2A3A1A]">
            {currentStep > 0 && (
              <motion.button
                onClick={prevStep}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#2A3A1A] text-white hover:bg-[#3A4A2A] px-6 py-3 rounded-lg font-semibold transition-all"
              >
                ← Vorige
              </motion.button>
            )}

            <motion.button
              onClick={nextStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-r from-[#2A3A1A] to-[#3A4A2A] text-[#B6C948] px-8 py-3 rounded-lg text-lg font-semibold hover:from-[#3A4A2A] hover:to-[#4A5A3A] transition-all duration-200 shadow-lg hover:shadow-xl ${
                currentStep === 0 ? 'ml-auto' : ''
              }`}
            >
              {currentStep === intakeSteps.length - 1 ? '🚀 Genereer Plan' : 'Volgende →'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderPersonalPlan = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#B6C948] mb-4">
            🎯 Jouw Persoonlijke Mind & Focus Plan
          </h1>
          <p className="text-[#8BAE5A] text-xl">
            Op basis van jouw intake hebben we een op maat gemaakt plan ontwikkeld
          </p>
        </div>

        {personalPlan && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Routine */}
            <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <CalendarDaysIcon className="mr-3 text-[#B6C948] w-6 h-6" />
                Dagelijkse Routine
              </h2>
              
              <div className="space-y-4">
                {personalPlan.dailyRoutine.map((session, index) => (
                  <motion.div 
                    key={session.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-[#2A3A1A] rounded-lg p-4 hover:shadow-md transition-shadow bg-[#1A2A1A]"
                  >
                    <div className="flex items-center">
                      <div className="p-2 bg-[#2A3A1A] rounded-lg mr-4">
                        {meditationTypes.find(t => t.id === session.type)?.iconComponent}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{session.title}</h3>
                        <p className="text-[#8BAE5A] text-sm">{session.description}</p>
                        <p className="text-[#8BAE5A] text-xs">{session.scheduledTime} • {session.duration} min</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Weekly Goals */}
            <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <TagIcon className="mr-3 text-[#B6C948] w-6 h-6" />
                Weekdoelen
              </h2>
              
              <div className="space-y-3">
                {personalPlan.weeklyGoals.map((goal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center p-3 bg-[#1A2A1A] border border-[#2A3A1A] rounded-lg"
                  >
                    <div className="w-6 h-6 bg-[#B6C948] rounded-full flex items-center justify-center mr-3">
                      <span className="text-[#1A2A1A] text-sm">✓</span>
                    </div>
                    <span className="text-white">{goal}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <motion.button
            onClick={() => setCurrentView('dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-[#2A3A1A] to-[#3A4A2A] text-[#B6C948] px-8 py-4 rounded-lg text-lg font-semibold hover:from-[#3A4A2A] hover:to-[#4A5A3A] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            🎯 Start Mijn Mind & Focus Journey
          </motion.button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A] p-4">
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
          <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
            <div className="text-3xl font-bold text-white mb-2">5</div>
            <div className="text-[#8BAE5A]">Sessies deze week</div>
          </div>
          <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
            <div className="text-3xl font-bold text-white mb-2">{currentStressLevel}</div>
            <div className="text-[#8BAE5A]">Huidige stress level</div>
          </div>
          <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
            <div className="text-3xl font-bold text-white mb-2">12</div>
            <div className="text-[#8BAE5A]">Totaal sessies</div>
          </div>
          <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A] p-6">
            <div className="text-3xl font-bold text-white mb-2">85%</div>
            <div className="text-[#8BAE5A]">Focus verbetering</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#1A2A1A] rounded-xl shadow-2xl border border-[#2A3A1A]">
          <div className="border-b border-[#2A3A1A]">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#B6C948] text-[#B6C948]'
                      : 'border-transparent text-[#8BAE5A] hover:text-white hover:border-[#3A4A2A]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Vandaag</h3>
                <div className="space-y-4">
                  {personalPlan?.dailyRoutine.map((session, index) => (
                    <div key={session.id} className="bg-[#1A2A1A] border border-[#2A3A1A] rounded-lg p-4">
                      <div>
                        <h4 className="text-white font-semibold">{session.title}</h4>
                        <p className="text-[#8BAE5A] text-sm">{session.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="bg-[#1A2A1A] rounded-xl p-6 border border-[#2A3A1A]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Mijn Mind & Focus Profiel</h3>
                    <motion.button
                      onClick={() => setCurrentView('intake')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#B6C948] text-[#1A2A1A] px-4 py-2 rounded-lg font-semibold hover:bg-[#8BAE5A] transition-colors"
                    >
                      Intake Opnieuw Doen
                    </motion.button>
                  </div>
                  <p className="text-[#8BAE5A] text-sm">
                    Hier zie je je ingevulde profiel en kun je de intake opnieuw doen om je plan aan te passen.
                  </p>
                </div>

                {/* Stress Assessment */}
                <div className="bg-[#1A2A1A] rounded-xl p-6 border border-[#2A3A1A]">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FireIcon className="w-5 h-5 text-[#B6C948] mr-2" />
                    Stress Assessment
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#8BAE5A]">Werk Stress</span>
                        <span className="text-white font-semibold">{stressAssessment.workStress}/10</span>
                      </div>
                      <div className="w-full bg-[#2A3A1A] rounded-full h-2">
                        <div 
                          className="bg-[#B6C948] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(stressAssessment.workStress / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#8BAE5A]">Privé Stress</span>
                        <span className="text-white font-semibold">{stressAssessment.personalStress}/10</span>
                      </div>
                      <div className="w-full bg-[#2A3A1A] rounded-full h-2">
                        <div 
                          className="bg-[#B6C948] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(stressAssessment.personalStress / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#8BAE5A]">Slaapkwaliteit</span>
                        <span className="text-white font-semibold">{stressAssessment.sleepQuality}/10</span>
                      </div>
                      <div className="w-full bg-[#2A3A1A] rounded-full h-2">
                        <div 
                          className="bg-[#B6C948] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(stressAssessment.sleepQuality / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#8BAE5A]">Energie Level</span>
                        <span className="text-white font-semibold">{stressAssessment.energyLevel}/10</span>
                      </div>
                      <div className="w-full bg-[#2A3A1A] rounded-full h-2">
                        <div 
                          className="bg-[#B6C948] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(stressAssessment.energyLevel / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <span className="text-[#8BAE5A] mr-2">Focus problemen:</span>
                      <span className={`font-semibold ${stressAssessment.focusProblems ? 'text-red-400' : 'text-green-400'}`}>
                        {stressAssessment.focusProblems ? 'Ja' : 'Nee'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-[#8BAE5A] mr-2">Irritatie/agressie:</span>
                      <span className={`font-semibold ${stressAssessment.irritability ? 'text-red-400' : 'text-green-400'}`}>
                        {stressAssessment.irritability ? 'Ja' : 'Nee'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lifestyle Info */}
                <div className="bg-[#1A2A1A] rounded-xl p-6 border border-[#2A3A1A]">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <ClockIcon className="w-5 h-5 text-[#B6C948] mr-2" />
                    Lifestyle Informatie
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[#8BAE5A] text-sm">Werkrooster</span>
                      <p className="text-white font-medium">{lifestyleInfo.workSchedule}</p>
                    </div>
                    <div>
                      <span className="text-[#8BAE5A] text-sm">Sport Schema</span>
                      <p className="text-white font-medium">{lifestyleInfo.sportSchedule}</p>
                    </div>
                    <div>
                      <span className="text-[#8BAE5A] text-sm">Reistijd Werk</span>
                      <p className="text-white font-medium">{lifestyleInfo.commuteTime} minuten</p>
                    </div>
                    <div>
                      <span className="text-[#8BAE5A] text-sm">Lunch Pauze</span>
                      <p className="text-white font-medium">{lifestyleInfo.lunchBreak}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="text-[#8BAE5A] text-sm">Vrije Tijd</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {lifestyleInfo.freeTime.map((time, index) => (
                        <span key={index} className="bg-[#2A3A1A] text-[#B6C948] px-3 py-1 rounded-full text-sm">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="text-[#8BAE5A] text-sm">Familie Verplichtingen</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {lifestyleInfo.familyObligations.map((obligation, index) => (
                        <span key={index} className="bg-[#2A3A1A] text-[#B6C948] px-3 py-1 rounded-full text-sm">
                          {obligation}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Personal Goals */}
                <div className="bg-[#1A2A1A] rounded-xl p-6 border border-[#2A3A1A]">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <TagIcon className="w-5 h-5 text-[#B6C948] mr-2" />
                    Persoonlijke Doelen
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <span className={`w-4 h-4 rounded-full mr-3 ${personalGoals.stressVerminderen ? 'bg-[#B6C948]' : 'bg-[#2A3A1A] border border-[#2A3A1A]'}`}></span>
                      <span className="text-white">Stress verminderen</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`w-4 h-4 rounded-full mr-3 ${personalGoals.focusVerbeteren ? 'bg-[#B6C948]' : 'bg-[#2A3A1A] border border-[#2A3A1A]'}`}></span>
                      <span className="text-white">Focus verbeteren</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`w-4 h-4 rounded-full mr-3 ${personalGoals.betereSlaap ? 'bg-[#B6C948]' : 'bg-[#2A3A1A] border border-[#2A3A1A]'}`}></span>
                      <span className="text-white">Betere slaap</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`w-4 h-4 rounded-full mr-3 ${personalGoals.betereRelaties ? 'bg-[#B6C948]' : 'bg-[#2A3A1A] border border-[#2A3A1A]'}`}></span>
                      <span className="text-white">Betere relaties</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`w-4 h-4 rounded-full mr-3 ${personalGoals.hogerePrestaties ? 'bg-[#B6C948]' : 'bg-[#2A3A1A] border border-[#2A3A1A]'}`}></span>
                      <span className="text-white">Hogere prestaties</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`w-4 h-4 rounded-full mr-3 ${personalGoals.emotioneleControle ? 'bg-[#B6C948]' : 'bg-[#2A3A1A] border border-[#2A3A1A]'}`}></span>
                      <span className="text-white">Emotionele controle</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'meditations' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Meditatie Bibliotheek</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {meditationTypes.map((type) => (
                    <div key={type.id} className="bg-[#1A2A1A] border border-[#2A3A1A] rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className={`p-2 ${type.color} rounded-lg mr-3`}>
                          {type.iconComponent}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{type.name}</h4>
                          <p className="text-[#8BAE5A] text-sm">{type.description}</p>
                        </div>
                      </div>
                      <button className="w-full bg-[#2A3A1A] text-[#B6C948] py-2 rounded-lg hover:bg-[#3A4A2A] transition-colors">
                        Bekijk Sessies
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'journal' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Journaling</h3>
                <div className="bg-[#2A3A1A] rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Hoe voel je je vandaag?</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={currentStressLevel}
                        onChange={(e) => setCurrentStressLevel(parseInt(e.target.value))}
                        className="w-full h-3 bg-[#1A2A1A] rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-[#8BAE5A] mt-1">
                        <span>Zeer slecht</span>
                        <span className="font-bold text-[#B6C948]">{currentStressLevel}</span>
                        <span>Uitstekend</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Waar ben je dankbaar voor?</label>
                      <textarea
                        className="w-full h-24 p-3 bg-[#1A2A1A] text-white border border-[#2A3A1A] rounded-lg focus:ring-2 focus:ring-[#B6C948] focus:border-transparent"
                        placeholder="Schrijf hier je gedachten..."
                      />
                    </div>
                    <button className="bg-[#B6C948] text-[#1A2A1A] px-6 py-2 rounded-lg font-semibold hover:bg-[#8BAE5A] transition-colors">
                      Opslaan
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    );
  };

  // Debug Panel Component
  const DebugPanel = () => (
    debugInfo && (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="bg-[#B6C948] text-[#1A2A1A] px-3 py-2 rounded-lg text-sm font-bold mb-2"
        >
          🐛 Debug {showDebug ? 'Hide' : 'Show'}
        </button>
        {showDebug && (
          <div className="bg-[#1A2A1A] border border-[#2A3A1A] rounded-lg p-4 max-w-md max-h-96 overflow-auto text-xs">
            <h3 className="text-[#B6C948] font-bold mb-2">Debug Info</h3>
            <div className="space-y-2 text-white">
              <div><strong>User ID:</strong> {debugInfo.userId}</div>
              <div><strong>Email:</strong> {debugInfo.userEmail}</div>
              <div><strong>Has Profile:</strong> {debugInfo.hasProfile ? '✅ YES' : '❌ NO'}</div>
              <div><strong>Current View:</strong> {debugInfo.currentView}</div>
              <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
              
              {debugInfo.apiResponse && (
                <div>
                  <strong>API Response:</strong>
                  <pre className="bg-[#0A0F0A] p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo.apiResponse, null, 2)}
                  </pre>
                </div>
              )}
              
              {debugInfo.saveAttempt && (
                <div>
                  <strong>Save Attempt:</strong>
                  <div>Success: {debugInfo.saveAttempt.success ? '✅' : '❌'}</div>
                  <div>Time: {debugInfo.saveAttempt.timestamp}</div>
                  {debugInfo.saveAttempt.error && (
                    <div className="text-red-400">Error: {debugInfo.saveAttempt.error}</div>
                  )}
                </div>
              )}
              
              {debugInfo.profileData && (
                <div>
                  <strong>Profile Data:</strong>
                  <pre className="bg-[#0A0F0A] p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo.profileData, null, 2)}
                  </pre>
                </div>
              )}
              
              {dashboardData && (
                <div>
                  <strong>Dashboard Data:</strong>
                  <div className="bg-[#0A0F0A] p-2 rounded text-xs">
                    <div>Sessions deze week: {dashboardData.sessionsThisWeek}</div>
                    <div>Huidige stress level: {dashboardData.currentStressLevel}</div>
                    <div>Totaal sessies: {dashboardData.totalSessions}</div>
                    <div>Focus verbetering: {dashboardData.focusImprovement}%</div>
                    <div>Streak: {dashboardData.streak} dagen</div>
                    <div>Timestamp: {dashboardData.timestamp}</div>
                  </div>
                </div>
              )}
              
              {/* User Input Values */}
              <div>
                <strong>Gebruiker Ingevulde Waardes:</strong>
                <div className="bg-[#0A0F0A] p-2 rounded text-xs">
                  <div><strong>Stress Assessment:</strong></div>
                  <div>• Werk stress: {stressAssessment.workStress}/10</div>
                  <div>• Privé stress: {stressAssessment.personalStress}/10</div>
                  <div>• Slaapkwaliteit: {stressAssessment.sleepQuality}/10</div>
                  <div>• Energie level: {stressAssessment.energyLevel}/10</div>
                  <div>• Focus problemen: {stressAssessment.focusProblems ? 'Ja' : 'Nee'}</div>
                  <div>• Irritatie/agressie: {stressAssessment.irritability ? 'Ja' : 'Nee'}</div>
                  
                  <div className="mt-2"><strong>Lifestyle Info:</strong></div>
                  <div>• Werkrooster: {lifestyleInfo.workSchedule}</div>
                  <div>• Vrije tijd: {lifestyleInfo.freeTime.join(', ')}</div>
                  <div>• Familie verplichtingen: {lifestyleInfo.familyObligations.join(', ')}</div>
                  <div>• Sport schema: {lifestyleInfo.sportSchedule}</div>
                  <div>• Reistijd werk: {lifestyleInfo.commuteTime} min</div>
                  <div>• Lunch pauze: {lifestyleInfo.lunchBreak}</div>
                  
                  <div className="mt-2"><strong>Persoonlijke Doelen:</strong></div>
                  <div>• Stress verminderen: {personalGoals.stressVerminderen ? '✅' : '❌'}</div>
                  <div>• Focus verbeteren: {personalGoals.focusVerbeteren ? '✅' : '❌'}</div>
                  <div>• Betere slaap: {personalGoals.betereSlaap ? '✅' : '❌'}</div>
                  <div>• Betere relaties: {personalGoals.betereRelaties ? '✅' : '❌'}</div>
                  <div>• Hogere prestaties: {personalGoals.hogerePrestaties ? '✅' : '❌'}</div>
                  <div>• Emotionele controle: {personalGoals.emotioneleControle ? '✅' : '❌'}</div>
                </div>
              </div>
              
              {/* Improvement Goals Summary */}
              <div>
                <strong>Verbetering Doelen:</strong>
                <div className="bg-[#0A0F0A] p-2 rounded text-xs">
                  {(() => {
                    const goals: string[] = [];
                    if (personalGoals.stressVerminderen) goals.push('Stress verminderen');
                    if (personalGoals.focusVerbeteren) goals.push('Focus verbeteren');
                    if (personalGoals.betereSlaap) goals.push('Betere slaap');
                    if (personalGoals.betereRelaties) goals.push('Betere relaties');
                    if (personalGoals.hogerePrestaties) goals.push('Hogere prestaties');
                    if (personalGoals.emotioneleControle) goals.push('Emotionele controle');
                    
                    return goals.length > 0 ? goals.map(goal => <div key={goal}>• {goal}</div>) : <div>Geen doelen geselecteerd</div>;
                  })()}
                </div>
              </div>
              
              {/* Calculated Improvement Summary */}
              <div>
                <strong>Berekende Verbetering:</strong>
                <div className="bg-[#0A0F0A] p-2 rounded text-xs">
                  <div><strong>Stress Level Analyse:</strong></div>
                  <div>• Totaal stress: {(stressAssessment.workStress + stressAssessment.personalStress) / 2}/10</div>
                  <div>• Slaapkwaliteit: {stressAssessment.sleepQuality}/10</div>
                  <div>• Energie level: {stressAssessment.energyLevel}/10</div>
                  
                  <div className="mt-2"><strong>Gegenereerde Weekdoelen:</strong></div>
                  {(() => {
                    const weeklyGoals: string[] = [];
                    if (personalGoals.stressVerminderen) weeklyGoals.push('Stress level met 30% verminderen');
                    if (personalGoals.focusVerbeteren) weeklyGoals.push('Focus sessies toevoegen');
                    if (personalGoals.betereSlaap) weeklyGoals.push('Slaap routine verbeteren');
                    if (personalGoals.hogerePrestaties) weeklyGoals.push('Performance sessies toevoegen');
                    
                    return weeklyGoals.length > 0 ? weeklyGoals.map(goal => <div key={goal}>• {goal}</div>) : <div>Geen weekdoelen gegenereerd</div>;
                  })()}
                  
                  <div className="mt-2"><strong>Dagelijkse Routine:</strong></div>
                  <div>• Avond Recovery: 19:00 • 15 min</div>
                  <div>• Focus sessie: 09:00 • 10 min</div>
                  <div>• Gratitude journal: 20:00 • 5 min</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );

  // Wrapper function to add debug panel to all views
  const renderWithDebug = (content: React.ReactNode) => (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A]">
      <DebugPanel />
      {content}
    </div>
  );

  // Show loading state while checking for existing profile
  if (isLoadingProfile) {
    return renderWithDebug(
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A] text-lg">Laden...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'intro') {
    return renderWithDebug(renderIntro());
  }

  if (currentView === 'intake') {
    return renderWithDebug(renderIntakeForm());
  }

  if (currentView === 'plan') {
    return renderWithDebug(renderPersonalPlan());
  }

  return renderWithDebug(renderDashboard());
}