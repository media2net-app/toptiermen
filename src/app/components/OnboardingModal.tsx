'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  PlayIcon, 
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PlusIcon,
  UserIcon,
  TrophyIcon,
  FireIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'react-hot-toast';

interface OnboardingStatus {
  user_id: string;
  welcome_video_watched: boolean;
  step_1_completed: boolean;
  step_2_completed: boolean;
  step_3_completed: boolean;
  step_4_completed: boolean;
  step_5_completed: boolean;
  onboarding_completed: boolean;
  current_step: number;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface TrainingSchema {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  duration_weeks: number;
}

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  calories: number;
  type: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  category: string;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  // Data will be loaded from API
  const [onboardingData, setOnboardingData] = useState<{
    missions: Mission[];
    trainingSchemas: TrainingSchema[];
    nutritionPlans: NutritionPlan[];
    challenges: Challenge[];
  }>({
    missions: [],
    trainingSchemas: [],
    nutritionPlans: [],
    challenges: []
  });
  const { user, loading: authLoading } = useSupabaseAuth();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [currentStep, setCurrentStep] = useState(0); // 0 = welcome video, 1-5 = steps
  const [loading, setLoading] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Step-specific state
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [selectedTrainingSchema, setSelectedTrainingSchema] = useState<string>('');
  const [selectedNutritionPlan, setSelectedNutritionPlan] = useState<string>('');
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [mainGoal, setMainGoal] = useState('');
  const [forumIntroduction, setForumIntroduction] = useState('');

  // Load onboarding data
  useEffect(() => {
    if (isOpen) {
      fetchOnboardingData();
    }
  }, [isOpen]);

  const fetchOnboardingData = async () => {
    try {
      const response = await fetch('/api/onboarding-data');
      const data = await response.json();
      
      if (response.ok) {
        setOnboardingData(data);
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
    }
  };

  // Debug user state
  useEffect(() => {
    console.log('🔍 OnboardingModal - User state:', {
      user: user ? { id: user.id, email: user.email } : null,
      authLoading,
      isOpen
    });
  }, [user, authLoading, isOpen]);

  useEffect(() => {
    if (isOpen && user) {
      fetchOnboardingStatus();
    }
  }, [isOpen, user]);

  // Auto-play video when modal opens
  useEffect(() => {
    if (isOpen && currentStep === 0 && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Auto-play failed:', error);
      });
    }
  }, [isOpen, currentStep]);

  const fetchOnboardingStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/onboarding?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setOnboardingStatus(data);
        setCurrentStep(data.current_step || 0);
        setVideoWatched(data.welcome_video_watched || false);
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
    }
  };

  const updateOnboardingStatus = async (step: number, action: string, additionalData?: any) => {
    console.log('🔍 User object:', user);
    console.log('🔍 User ID:', user?.id);
    
    if (!user || !user.id) {
      console.error('❌ No user or user ID available');
      toast.error('Gebruiker niet gevonden - probeer opnieuw in te loggen');
      return null;
    }

    setLoading(true);
    try {
      console.log('🔄 Updating onboarding status:', { userId: user.id, step, action, additionalData });
      
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          step,
          action,
          ...additionalData
        }),
      });

      const data = await response.json();
      console.log('📥 API Response:', data);

      if (response.ok) {
        setOnboardingStatus(data);
        toast.success('Voortgang opgeslagen!');
        return data;
      } else {
        console.error('❌ API Error:', data.error);
        toast.error(data.error || 'Er is een fout opgetreden');
        return null;
      }
    } catch (error) {
      console.error('❌ Error updating onboarding status:', error);
      toast.error('Er is een fout opgetreden');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeVideoComplete = async () => {
    try {
      console.log('🎬 Completing welcome video step...');
      setVideoWatched(true);
      const updatedStatus = await updateOnboardingStatus(0, 'watch_welcome_video');
      if (updatedStatus) {
        console.log('✅ Welcome video completed, moving to step 1');
        setCurrentStep(1);
      } else {
        console.log('❌ Failed to update welcome video status');
        setVideoWatched(false); // Reset if update failed
      }
    } catch (error) {
      console.error('❌ Error in handleWelcomeVideoComplete:', error);
      setVideoWatched(false); // Reset on error
    }
  };

  const handleStepComplete = async (step: number) => {
    if (!user) return;

    let additionalData = {};
    
    // Collect step-specific data
    switch (step) {
      case 1:
        // Step 1: Platform overview - no additional data needed
        break;
      case 2:
        // Step 2: Set main goal
        if (!mainGoal.trim()) {
          toast.error('Beschrijf je hoofddoel');
          return;
        }
        additionalData = { mainGoal };
        break;
      case 3:
        // Step 3: Select missions (uitdagingen)
        if (selectedMissions.length < 3) {
          toast.error('Selecteer minimaal 3 uitdagingen');
          return;
        }
        additionalData = { selectedMissions };
        break;
      case 4:
        // Step 4: Select training schema and nutrition plan
        if (!selectedTrainingSchema || !selectedNutritionPlan) {
          toast.error('Selecteer een trainingsschema en voedingsplan');
          return;
        }
        additionalData = { 
          selectedTrainingSchema, 
          selectedNutritionPlan,
          selectedChallenge 
        };
        break;
      case 5:
        // Step 5: Forum introduction
        if (!forumIntroduction.trim()) {
          toast.error('Schrijf een korte introductie voor de community');
          return;
        }
        additionalData = { forumIntroduction };
        break;
    }

    const updatedStatus = await updateOnboardingStatus(step, 'complete_step', additionalData);
    if (updatedStatus) {
      if (step < 5) {
        setCurrentStep(step + 1);
      } else {
        // Onboarding completed
        toast.success('Onboarding voltooid! Welkom bij Toptiermen!');
        onClose();
      }
    }
  };

  const handleSkipOnboarding = async () => {
    if (confirm('Weet je zeker dat je de onboarding wilt overslaan? Je kunt deze later altijd nog doen.')) {
      await updateOnboardingStatus(5, 'skip_onboarding');
      onClose();
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleMission = (missionId: string) => {
    setSelectedMissions(prev => 
      prev.includes(missionId) 
        ? prev.filter(id => id !== missionId)
        : [...prev, missionId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
          <h2 className="text-xl font-semibold text-white">
            {currentStep === 0 ? 'Welkom bij Toptiermen' : `Stap ${currentStep} van 5`}
          </h2>
          <button
            onClick={handleSkipOnboarding}
            className="text-[#8BAE5A] hover:text-white hover:bg-[#3A4D23] p-2 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress bar */}
        {currentStep > 0 && (
          <div className="px-6 py-4">
            <div className="w-full bg-[#181F17] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-[#8BAE5A] mt-2">
              {currentStep} van 5 stappen voltooid
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {currentStep === 0 ? (
            // Welcome Video Step
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Welkom bij Toptiermen! 🎉
                </h3>
                <p className="text-[#8BAE5A] mb-6">
                  Bekijk deze korte introductievideo om te leren hoe je het meeste uit het platform kunt halen.
                </p>
              </div>

              <div className="bg-[#181F17] rounded-xl p-4 mb-6 border border-[#3A4D23] relative">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg"
                  controls
                  preload="metadata"
                  onEnded={() => setVideoWatched(true)}
                  onPlay={() => setShowVideoOverlay(false)}
                >
                  <source src="/welkom-v2.MP4" type="video/mp4" />
                  <source src="/welkom-v2.MP4" type="video/mp4" />
                  Je browser ondersteunt geen video afspelen.
                </video>
                
                {/* Video Play Overlay */}
                {showVideoOverlay && (
                  <div 
                    className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer group rounded-lg"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.play();
                      }
                    }}
                  >
                    <div className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#181F17] rounded-full p-4 transition-all duration-200 group-hover:scale-110 shadow-lg">
                      <PlayIcon className="w-12 h-12" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <p className="text-white text-sm font-medium">Klik om video af te spelen</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleWelcomeVideoComplete}
                disabled={loading || authLoading || !user}
                className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] px-6 py-3 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] disabled:opacity-50 font-semibold transition-all duration-200"
              >
                {authLoading ? 'Laden...' : loading ? 'Bezig...' : !user ? 'Gebruiker laden...' : 'Video bekeken, ga verder'}
              </button>
            </div>
          ) : (
            // Interactive Onboarding Steps
            <div>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Ontdek het Platform 🚀
                    </h3>
                    <p className="text-[#8BAE5A] mb-6">
                      Leer de belangrijkste functies kennen die je gaan helpen je doelen te bereiken.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <TrophyIcon className="h-6 w-6 text-[#FFD700]" />
                        <h4 className="font-medium text-white">Dashboard</h4>
                      </div>
                      <p className="text-[#E1CBB3] text-sm">
                        Overzicht van je voortgang, uitdagingen en dagelijkse statistieken
                      </p>
                    </div>

                    <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <FireIcon className="h-6 w-6 text-[#FF6B35]" />
                        <h4 className="font-medium text-white">Uitdagingen</h4>
                      </div>
                      <p className="text-[#E1CBB3] text-sm">
                        Dagelijkse uitdagingen om je doelen te bereiken
                      </p>
                    </div>

                    <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <HeartIcon className="h-6 w-6 text-[#FF6B6B]" />
                        <h4 className="font-medium text-white">Trainingen</h4>
                      </div>
                      <p className="text-[#E1CBB3] text-sm">
                        Persoonlijke trainingsschema's en voedingsplannen
                      </p>
                    </div>

                    <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <UserIcon className="h-6 w-6 text-[#8BAE5A]" />
                        <h4 className="font-medium text-white">Brotherhood</h4>
                      </div>
                      <p className="text-[#E1CBB3] text-sm">
                        Community van gelijkgestemden voor support en motivatie
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Wat is je Hoofddoel? 🎯
                    </h3>
                    <p className="text-[#8BAE5A] mb-6">
                      Beschrijf je belangrijkste doel dat je wilt bereiken. Dit wordt zichtbaar op je profiel.
                    </p>
                  </div>

                  <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                    <label className="block text-white font-medium mb-3">
                      Mijn hoofddoel is:
                    </label>
                    <textarea
                      value={mainGoal}
                      onChange={(e) => setMainGoal(e.target.value)}
                      placeholder="Bijvoorbeeld: 10kg afvallen en mijn conditie verbeteren in 6 maanden..."
                      className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg p-3 text-white placeholder-[#8BAE5A]/50 focus:outline-none focus:border-[#8BAE5A] transition-colors"
                      rows={4}
                    />
                  </div>

                  <div className="bg-[#1A2317] border border-[#8BAE5A]/30 rounded-lg p-4">
                    <h4 className="font-medium text-[#8BAE5A] mb-2">💡 Tips voor een goed doel:</h4>
                    <ul className="text-[#E1CBB3] space-y-1 text-sm">
                      <li>• Maak het specifiek en meetbaar</li>
                      <li>• Stel een realistische tijdlijn</li>
                      <li>• Focus op één hoofddoel tegelijk</li>
                      <li>• Schrijf het in positieve termen</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Kies je Dagelijkse Uitdagingen 📋
                    </h3>
                    <p className="text-[#8BAE5A] mb-6">
                      Selecteer minimaal 3 uitdagingen die je dagelijks wilt uitvoeren om je doelen te bereiken.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {onboardingData.missions.map((mission: Mission) => (
                      <div
                        key={mission.id}
                        onClick={() => toggleMission(mission.id)}
                        className={`bg-[#181F17] border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedMissions.includes(mission.id)
                            ? 'border-[#8BAE5A] bg-[#1A2317]'
                            : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white mb-1">{mission.title}</h4>
                            <p className="text-[#E1CBB3] text-sm">{mission.description}</p>
                          </div>
                          <div className={`ml-3 p-1 rounded-full ${
                            selectedMissions.includes(mission.id)
                              ? 'bg-[#8BAE5A] text-[#181F17]'
                              : 'bg-[#3A4D23] text-[#8BAE5A]'
                          }`}>
                            <CheckIcon className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-[#8BAE5A] text-sm">
                      {selectedMissions.length}/3 uitdagingen geselecteerd
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Kies je Plan 📊
                    </h3>
                    <p className="text-[#8BAE5A] mb-6">
                      Selecteer een trainingsschema, voedingsplan en optioneel een challenge.
                    </p>
                  </div>

                  {/* Training Schema Selection */}
                  <div>
                    <h4 className="font-medium text-white mb-3">🏋️ Training Schema</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {onboardingData.trainingSchemas.map((schema: TrainingSchema) => (
                        <div
                          key={schema.id}
                          onClick={() => setSelectedTrainingSchema(schema.id)}
                          className={`bg-[#181F17] border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedTrainingSchema === schema.id
                              ? 'border-[#8BAE5A] bg-[#1A2317]'
                              : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                          }`}
                        >
                          <h5 className="font-medium text-white mb-1">{schema.name}</h5>
                          <p className="text-[#E1CBB3] text-sm mb-2">{schema.description}</p>
                          <span className="text-[#8BAE5A] text-xs">{schema.duration_weeks} weken</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nutrition Plan Selection */}
                  <div>
                    <h4 className="font-medium text-white mb-3">🥗 Voedingsplan</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {onboardingData.nutritionPlans.map((plan: NutritionPlan) => (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedNutritionPlan(plan.id)}
                          className={`bg-[#181F17] border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedNutritionPlan === plan.id
                              ? 'border-[#8BAE5A] bg-[#1A2317]'
                              : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                          }`}
                        >
                          <h5 className="font-medium text-white mb-1">{plan.name}</h5>
                          <p className="text-[#E1CBB3] text-sm mb-2">{plan.description}</p>
                          <span className="text-[#8BAE5A] text-xs">{plan.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Challenge Selection */}
                  <div>
                    <h4 className="font-medium text-white mb-3">🏆 Challenge (Optioneel)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {onboardingData.challenges.map((challenge: Challenge) => (
                        <div
                          key={challenge.id}
                          onClick={() => setSelectedChallenge(challenge.id)}
                          className={`bg-[#181F17] border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedChallenge === challenge.id
                              ? 'border-[#8BAE5A] bg-[#1A2317]'
                              : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
                          }`}
                        >
                          <h5 className="font-medium text-white mb-1">{challenge.title}</h5>
                          <p className="text-[#E1CBB3] text-sm mb-2">{challenge.description}</p>
                          <span className="text-[#8BAE5A] text-xs">{challenge.duration_days} dagen</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Stel je voor aan de Community 👋
                    </h3>
                    <p className="text-[#8BAE5A] mb-6">
                      Schrijf een korte introductie die wordt gepost in de Brotherhood forum.
                    </p>
                  </div>

                  <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                    <label className="block text-white font-medium mb-3">
                      Mijn introductie:
                    </label>
                    <textarea
                      value={forumIntroduction}
                      onChange={(e) => setForumIntroduction(e.target.value)}
                      placeholder="Hallo allemaal! Ik ben [naam] en ik ben hier om [doel]. Ik kijk ernaar uit om jullie te leren kennen en samen te groeien..."
                      className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg p-3 text-white placeholder-[#8BAE5A]/50 focus:outline-none focus:border-[#8BAE5A] transition-colors"
                      rows={4}
                    />
                  </div>

                  <div className="bg-[#1A2317] border border-[#8BAE5A]/30 rounded-lg p-4">
                    <h4 className="font-medium text-[#8BAE5A] mb-2">💡 Wat kun je delen:</h4>
                    <ul className="text-[#E1CBB3] space-y-1 text-sm">
                      <li>• Je naam en waarom je hier bent</li>
                      <li>• Je doelen en motivatie</li>
                      <li>• Wat je hoopt te leren</li>
                      <li>• Hoe anderen je kunnen helpen</li>
                    </ul>
                  </div>

                  <div className="text-center">
                    <div className="bg-gradient-to-br from-[#8BAE5A]/20 to-[#FFD700]/20 border border-[#FFD700]/30 rounded-lg p-6">
                      <h4 className="font-medium text-[#FFD700] mb-2">🎉 Bijna klaar!</h4>
                      <p className="text-[#E1CBB3]">
                        Na deze laatste stap ben je volledig klaar om te beginnen met je reis naar persoonlijke groei!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-[#3A4D23]">
            <button
              onClick={handlePrevious}
              disabled={currentStep <= 1 || loading}
              className="flex items-center space-x-2 text-[#8BAE5A] hover:text-white disabled:opacity-50 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Vorige</span>
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handleSkipOnboarding}
                disabled={loading}
                className="text-[#8BAE5A] hover:text-white disabled:opacity-50 transition-colors"
              >
                Overslaan
              </button>
              
              <button
                onClick={() => handleStepComplete(currentStep)}
                disabled={loading}
                className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] px-6 py-2 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] disabled:opacity-50 flex items-center space-x-2 font-semibold transition-all duration-200"
              >
                <span>{currentStep === 5 ? 'Voltooien' : 'Volgende'}</span>
                {currentStep < 5 && <ArrowRightIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 