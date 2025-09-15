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
  HeartIcon,
  ChatBubbleLeftRightIcon,
  FlagIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/navigation';
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

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

interface TrainingSchema {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
}

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  category: string;
}


interface ForcedOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function ForcedOnboardingModal({ isOpen, onComplete }: ForcedOnboardingModalProps) {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Step-specific state
  const [mainGoal, setMainGoal] = useState('');
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [selectedTrainingSchema, setSelectedTrainingSchema] = useState<string>('');
  const [selectedNutritionPlan, setSelectedNutritionPlan] = useState<string>('');
  const [forumIntroduction, setForumIntroduction] = useState('');

  // Data
  const [missions, setMissions] = useState<Mission[]>([]);
  const [trainingSchemas, setTrainingSchemas] = useState<TrainingSchema[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);

  // Load data when modal opens
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
        setMissions(data.missions || []);
        setTrainingSchemas(data.trainingSchemas || []);
        setNutritionPlans(data.nutritionPlans || []);
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
    }
  };

  // Reset video when step 0 opens
  useEffect(() => {
    if (isOpen && currentStep === 0 && videoRef.current) {
      videoRef.current.currentTime = 0;
      setVideoWatched(false);
      setShowVideoOverlay(true);
    }
  }, [isOpen, currentStep]);

  const updateOnboardingStatus = async (step: number, action: string, additionalData?: any) => {
    if (!user?.id) {
      // For non-logged in users, just show success message and continue
      toast.success('Voortgang opgeslagen!');
      return { success: true };
    }

    setLoading(true);
    try {
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

      if (response.ok) {
        toast.success('Voortgang opgeslagen!');
        return data;
      } else {
        toast.error(data.error || 'Er is een fout opgetreden');
        return null;
      }
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      toast.error('Er is een fout opgetreden');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeVideoComplete = async () => {
    if (!videoWatched) {
      toast.error('Bekijk eerst de volledige video');
      return;
    }

    const updatedStatus = await updateOnboardingStatus(0, 'watch_welcome_video');
    if (updatedStatus) {
      setCurrentStep(1); // Move to goal setting step
    }
  };

  const handleGoalComplete = async () => {
    if (!mainGoal.trim()) {
      toast.error('Beschrijf je hoofddoel');
      return;
    }

    const updatedStatus = await updateOnboardingStatus(1, 'complete_step', { mainGoal });
    if (updatedStatus) {
      setCurrentStep(2); // Update step before closing modal
      // Close modal first
      onComplete();
      // Then navigate to missions page
      setTimeout(() => {
        router.push('/dashboard/mijn-challenges');
      }, 100);
    }
  };

  const handleMissionsComplete = async () => {
    if (selectedMissions.length < 3) {
      toast.error('Selecteer minimaal 3 uitdagingen');
      return;
    }
    
    const updatedStatus = await updateOnboardingStatus(2, 'complete_step', { selectedMissions });
    if (updatedStatus) {
      setCurrentStep(3); // Update step before closing modal
      // Close modal first
      onComplete();
      // Then navigate to training schemas
      setTimeout(() => {
        router.push('/dashboard/trainingsschemas');
      }, 100);
    }
  };

  const handleTrainingComplete = async () => {
    if (!selectedTrainingSchema) {
      toast.error('Selecteer een trainingsschema');
      return;
    }

    const updatedStatus = await updateOnboardingStatus(3, 'complete_step', { selectedTrainingSchema });
    if (updatedStatus) {
      // Stay on training center page for nutrition step
      setCurrentStep(4);
    }
  };

  const handleNutritionComplete = async () => {
    if (!selectedNutritionPlan) {
      toast.error('Selecteer een voedingsplan');
      return;
    }


    const updatedStatus = await updateOnboardingStatus(4, 'complete_step', { 
      selectedNutritionPlan
    });
    if (updatedStatus) {
      setCurrentStep(5); // Update step before closing modal
      // Close modal first
      onComplete();
      // Then navigate to forum
      setTimeout(() => {
        router.push('/dashboard/brotherhood/forum');
      }, 100);
    }
  };

  const handleForumComplete = async () => {
    if (!forumIntroduction.trim()) {
      toast.error('Schrijf een korte introductie');
      return;
    }

    const updatedStatus = await updateOnboardingStatus(5, 'complete_step', { forumIntroduction });
    if (updatedStatus) {
      setCurrentStep(6); // Update step before closing modal
      // Close modal first
      onComplete();
      // Then navigate to onboarding completion page
      setTimeout(() => {
        router.push('/dashboard/onboarding-completion');
      }, 100);
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">
              {currentStep === 0 ? 'Welkom bij Toptiermen' : `Stap ${currentStep + 1} van 6`}
            </h2>
          </div>
          
          {/* Hide next button for welcome video step (step 0) and main goal step (step 1) */}
          {currentStep !== 0 && currentStep !== 1 && (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#181F17] px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              Volgende
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 0 && (
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
                  preload="auto"
                  playsInline
                  onEnded={() => setVideoWatched(true)}
                  onPlay={() => setShowVideoOverlay(false)}
                  onLoadedData={() => {
                    console.log('📺 Welcome video data loaded, ready for smooth playback');
                  }}
                  onProgress={() => {
                    // Log buffering progress for debugging
                    if (videoRef.current) {
                      const buffered = videoRef.current.buffered;
                      if (buffered.length > 0) {
                        const bufferedEnd = buffered.end(buffered.length - 1);
                        const duration = videoRef.current.duration;
                        const bufferedPercent = (bufferedEnd / duration) * 100;
                        console.log(`📺 Video buffered: ${bufferedPercent.toFixed(1)}%`);
                      }
                    }
                  }}
                  onSeeking={() => {
                    console.log('📺 User seeking video, ensuring smooth playback');
                  }}
                  onSeeked={() => {
                    console.log('📺 Seek completed, video ready to play');
                  }}
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

              {/* Video Completion Notice */}
              <div className="mb-6 p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-[#FFD700] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[#FFD700] font-semibold text-sm mb-1">Belangrijke instructie</h4>
                    <p className="text-[#FFD700]/80 text-sm">
                      Je moet eerst de welkomstvideo volledig bekijken voordat je naar de volgende stap kunt gaan. 
                      De knop wordt pas beschikbaar nadat de video is afgespeeld.
                    </p>
                  </div>
                </div>
              </div>

              {videoWatched && (
                <div className="mb-6 p-4 bg-[#8BAE5A]/10 border border-[#8BAE5A] rounded-lg">
                  <p className="text-[#8BAE5A] flex items-center gap-2 justify-center">
                    <CheckIcon className="w-5 h-5" />
                    Video bekeken - Klik op "Volgende" om door te gaan
                  </p>
                </div>
              )}

              <button
                onClick={handleWelcomeVideoComplete}
                disabled={loading || !videoWatched}
                className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] px-8 py-3 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] disabled:opacity-50 font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                {loading ? 'Bezig...' : 'Volgende'}
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {currentStep === 1 && (
            // Goal Setting Step
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Wat is je hoofddoel? 🎯
                </h3>
                <p className="text-[#8BAE5A]">
                  Beschrijf je belangrijkste doel voor de komende 90 dagen. Dit helpt ons je de juiste content en uitdagingen te geven.
                </p>
              </div>

              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <label className="block text-white font-medium mb-3">
                  Mijn hoofddoel is:
                </label>
                <textarea
                  value={mainGoal}
                  onChange={(e) => setMainGoal(e.target.value)}
                  placeholder="Bijvoorbeeld: Ik wil 10kg afvallen en mijn conditie verbeteren door 3x per week te trainen..."
                  className="w-full bg-[#0F1410] border border-[#3A4D23] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] resize-none"
                  rows={4}
                />
                <p className="text-sm text-[#8BAE5A] mt-2">
                  {mainGoal.length}/500 karakters
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleGoalComplete}
                  disabled={loading || !mainGoal.trim()}
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] px-8 py-3 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] disabled:opacity-50 font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  {loading ? 'Bezig...' : 'Doel opslaan'}
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            // Missions Selection Step
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Kies je uitdagingen 🔥
                </h3>
                <p className="text-[#8BAE5A]">
                  Selecteer minimaal 3 uitdagingen die je deze week wilt voltooien.
                </p>
                <p className="text-[#FFD700] text-sm mt-2">
                  {selectedMissions.length}/3 geselecteerd
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missions.slice(0, 8).map((mission) => (
                  <div
                    key={mission.id}
                    onClick={() => toggleMission(mission.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedMissions.includes(mission.id)
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                        : 'border-[#3A4D23] bg-[#181F17] hover:border-[#8BAE5A] hover:bg-[#8BAE5A]/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mission.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{mission.title}</h4>
                        <p className="text-sm text-[#8BAE5A]">{mission.description}</p>
                      </div>
                      {selectedMissions.includes(mission.id) && (
                        <CheckIcon className="w-5 h-5 text-[#8BAE5A]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleMissionsComplete}
                  disabled={loading || selectedMissions.length < 3}
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] px-8 py-3 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] disabled:opacity-50 font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  {loading ? 'Bezig...' : 'Uitdagingen opslaan'}
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            // Training Schema Selection Step
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Kies je trainingsschema 💪
                </h3>
                <p className="text-[#8BAE5A]">
                  Selecteer een trainingsschema dat bij je past en je doelen ondersteunt.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainingSchemas.slice(0, 4).map((schema) => (
                  <div
                    key={schema.id}
                    onClick={() => setSelectedTrainingSchema(schema.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTrainingSchema === schema.id
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                        : 'border-[#3A4D23] bg-[#181F17] hover:border-[#8BAE5A] hover:bg-[#8BAE5A]/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">💪</span>
                      <div>
                        <h4 className="font-medium text-white">{schema.name}</h4>
                        <p className="text-sm text-[#8BAE5A]">{schema.difficulty}</p>
                      </div>
                      {selectedTrainingSchema === schema.id && (
                        <CheckIcon className="w-5 h-5 text-[#8BAE5A] ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-[#E1CBB3]">{schema.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleTrainingComplete}
                  disabled={loading || !selectedTrainingSchema}
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] px-8 py-3 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] disabled:opacity-50 font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  {loading ? 'Bezig...' : 'Schema opslaan'}
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            // Nutrition Plan & Challenges Step
            <div className="space-y-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Voeding 🥗
                </h3>
                <p className="text-[#8BAE5A]">
                  Kies je voedingsplan.
                </p>
              </div>

              {/* Nutrition Plans */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Voedingsplan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nutritionPlans.slice(0, 4).map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedNutritionPlan(plan.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedNutritionPlan === plan.id
                          ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                          : 'border-[#3A4D23] bg-[#181F17] hover:border-[#8BAE5A] hover:bg-[#8BAE5A]/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🥗</span>
                        <div>
                          <h5 className="font-medium text-white">{plan.name}</h5>
                          <p className="text-sm text-[#8BAE5A]">{plan.category}</p>
                        </div>
                        {selectedNutritionPlan === plan.id && (
                          <CheckIcon className="w-5 h-5 text-[#8BAE5A] ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-[#E1CBB3]">{plan.description}</p>
                    </div>
                  ))}
                </div>
              </div>


              <div className="flex justify-center">
                <button
                  onClick={handleNutritionComplete}
                  disabled={loading || !selectedNutritionPlan}
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] px-8 py-3 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] disabled:opacity-50 font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  {loading ? 'Bezig...' : 'Opslaan & Volgende'}
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            // Forum Introduction Step
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Stel je voor aan de community 💬
                </h3>
                <p className="text-[#8BAE5A]">
                  Schrijf een korte introductie voor de Toptiermen community.
                </p>
              </div>

              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <label className="block text-white font-medium mb-3">
                  Mijn introductie:
                </label>
                <textarea
                  value={forumIntroduction}
                  onChange={(e) => setForumIntroduction(e.target.value)}
                  placeholder="Hallo! Ik ben [naam] en mijn doel is [doel]. Ik ben hier om [reden]..."
                  className="w-full bg-[#0F1410] border border-[#3A4D23] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] resize-none"
                  rows={4}
                />
                <p className="text-sm text-[#8BAE5A] mt-2">
                  {forumIntroduction.length}/500 karakters
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleForumComplete}
                  disabled={loading || !forumIntroduction.trim()}
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] px-8 py-3 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] disabled:opacity-50 font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  {loading ? 'Bezig...' : 'Introductie plaatsen'}
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 