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
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

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

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: string;
}

interface ForcedOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function ForcedOnboardingModal({ isOpen, onComplete }: ForcedOnboardingModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Step-specific state
  const [mainGoal, setMainGoal] = useState('');
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [selectedTrainingSchema, setSelectedTrainingSchema] = useState<string>('');
  const [selectedNutritionPlan, setSelectedNutritionPlan] = useState<string>('');
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [forumIntroduction, setForumIntroduction] = useState('');

  // Data
  const [missions, setMissions] = useState<Mission[]>([]);
  const [trainingSchemas, setTrainingSchemas] = useState<TrainingSchema[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

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
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
    }
  };

  // Auto-play video when step 0 opens
  useEffect(() => {
    if (isOpen && currentStep === 0 && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log('Auto-play failed:', error);
      });
    }
  }, [isOpen, currentStep]);

  const updateOnboardingStatus = async (step: number, action: string, additionalData?: any) => {
    if (!user?.id) {
      toast.error('Gebruiker niet gevonden');
      return null;
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
      // Close modal first
      onComplete();
      // Then navigate to missions page
      setTimeout(() => {
        router.push('/dashboard/mijn-missies');
      }, 100);
    }
  };

  const handleMissionsComplete = async () => {
    if (selectedMissions.length < 3) {
      toast.error('Selecteer minimaal 3 missies');
      return;
    }

    const updatedStatus = await updateOnboardingStatus(2, 'complete_step', { selectedMissions });
    if (updatedStatus) {
      // Close modal first
      onComplete();
      // Then navigate to training center
      setTimeout(() => {
        router.push('/dashboard/trainingscentrum');
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

    if (selectedChallenges.length < 2) {
      toast.error('Selecteer minimaal 2 challenges');
      return;
    }

    const updatedStatus = await updateOnboardingStatus(4, 'complete_step', { 
      selectedNutritionPlan, 
      selectedChallenges 
    });
    if (updatedStatus) {
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

  const toggleChallenge = (challengeId: string) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
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
            {currentStep > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-32 bg-[#181F17] rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / 6) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-[#8BAE5A]">
                  {currentStep + 1}/6
                </span>
              </div>
            )}
          </div>
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

              <div className="bg-[#181F17] rounded-xl p-4 mb-6 border border-[#3A4D23]">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg"
                  controls
                  autoPlay
                  muted
                  onEnded={() => setVideoWatched(true)}
                >
                  <source src="/welkom-v2.MP4" type="video/mp4" />
                  <source src="/welkom.MP4" type="video/mp4" />
                  Je browser ondersteunt geen video afspelen.
                </video>
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
                  Beschrijf je belangrijkste doel voor de komende 90 dagen. Dit helpt ons je de juiste content en missies te geven.
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
                  Kies je missies 🔥
                </h3>
                <p className="text-[#8BAE5A]">
                  Selecteer minimaal 3 missies die je deze week wilt voltooien.
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
                  {loading ? 'Bezig...' : 'Missies opslaan'}
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
                  Voeding & Challenges 🥗
                </h3>
                <p className="text-[#8BAE5A]">
                  Kies je voedingsplan en selecteer minimaal 2 challenges.
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

              {/* Challenges */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Challenges ({selectedChallenges.length}/2 minimaal)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.slice(0, 6).map((challenge) => (
                    <div
                      key={challenge.id}
                      onClick={() => toggleChallenge(challenge.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedChallenges.includes(challenge.id)
                          ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                          : 'border-[#3A4D23] bg-[#181F17] hover:border-[#8BAE5A] hover:bg-[#8BAE5A]/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏆</span>
                        <div className="flex-1">
                          <h5 className="font-medium text-white">{challenge.title}</h5>
                          <p className="text-sm text-[#8BAE5A]">{challenge.duration} dagen</p>
                        </div>
                        {selectedChallenges.includes(challenge.id) && (
                          <CheckIcon className="w-5 h-5 text-[#8BAE5A]" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleNutritionComplete}
                  disabled={loading || !selectedNutritionPlan || selectedChallenges.length < 2}
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