'use client';
import { useState, useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action: () => void;
}

interface OnboardingWidgetProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function OnboardingWidget({ isVisible, onComplete }: OnboardingWidgetProps) {
  const { user } = useSupabaseAuth();
  const { hasAccess } = useSubscription();
  const router = useRouter();
  const [steps, setSteps] = useState<OnboardingStep[]>(() => {
    const allSteps: OnboardingStep[] = [
      {
        id: 'goal',
        title: 'Definieer jouw #1 Hoofddoel',
        description: 'Wat is je belangrijkste doel voor de komende 90 dagen?',
        completed: false,
        action: () => setShowGoalModal(true),
      },
      {
        id: 'missions',
        title: 'Kies je Eerste 3 Uitdagingen',
        description: 'Selecteer 3 uitdagingen die je deze week wilt voltooien',
        completed: false,
        action: () => setShowMissionsModal(true),
      },
      {
        id: 'training',
        title: 'Kies je Trainingsschema',
        description: 'Selecteer een trainingsschema dat bij je past',
        completed: false,
        action: () => router.push('/dashboard/trainingsschemas'),
      },
      {
        id: 'nutrition',
        title: 'Kies je Voedingsplan',
        description: 'Selecteer een voedingsplan voor optimale prestaties',
        completed: false,
        action: () => router.push('/dashboard/voedingsplannen'),
      },
      {
        id: 'challenge',
        title: 'Doe mee aan een Starter-Challenge',
        description: 'Kies een challenge om je discipline te testen',
        completed: false,
        action: () => setShowChallengeModal(true),
      },
    ];

    // Filter steps based on subscription tier
    return allSteps.filter(step => {
      // Basic tier users skip training and nutrition steps
      if (!hasAccess('training') && step.id === 'training') {
        return false;
      }
      if (!hasAccess('nutrition') && step.id === 'nutrition') {
        return false;
      }
      return true;
    });
  });

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showMissionsModal, setShowMissionsModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');

  const availableMissions = [
    'Doe 50 push-ups',
    'Mediteer 10 minuten',
    'Lees 30 minuten',
    'Neem een koude douche',
    'Maak je bed op',
    'Drink 2L water',
  ];

  const starterChallenges = [
    'Push-up Challenge',
    'Plank Challenge',
    'Squat Challenge',
    'Burpee Challenge',
    'Mountain Climber Challenge',
  ];

  // Initialize steps from localStorage and check for external completions
  useEffect(() => {
    const initializeSteps = () => {
      // Load completed steps from localStorage
      const completedStepsData = localStorage.getItem('onboardingCompletedSteps');
      const completedIds = completedStepsData ? JSON.parse(completedStepsData) : [];

      // Check for external completions (training and nutrition)
      const trainingCompleted = localStorage.getItem('trainingSchemaCompleted') === 'true';
      const nutritionCompleted = localStorage.getItem('nutritionPlanCompleted') === 'true';

      // Combine everything in a Set (no duplicate values)
      const allCompletedIds = new Set(completedIds);
      if (trainingCompleted) allCompletedIds.add('training');
      if (nutritionCompleted) allCompletedIds.add('nutrition');

      // Update localStorage with combined list
      localStorage.setItem('onboardingCompletedSteps', JSON.stringify(Array.from(allCompletedIds)));

      // Update steps state
      const updatedSteps = steps.map(step => ({
        ...step,
        completed: allCompletedIds.has(step.id),
      }));
      setSteps(updatedSteps);
    };

    initializeSteps();
  }, []);

  const handleGoalSave = async () => {
    if (goalText.trim()) {
      // Add 'goal' to localStorage
      const completedStepsData = localStorage.getItem('onboardingCompletedSteps');
      const completedIds = completedStepsData ? JSON.parse(completedStepsData) : [];
      if (!completedIds.includes('goal')) {
        completedIds.push('goal');
        localStorage.setItem('onboardingCompletedSteps', JSON.stringify(completedIds));
      }

      // Save goal to localStorage (database integration can be added later)
      if (user) {
        try {
          // Store goal in localStorage for now
          localStorage.setItem('userGoal', goalText);
        } catch (error) {
          console.error('Error saving goal:', error);
        }
      }

      const updatedSteps = steps.map(step => 
        step.id === 'goal' ? { ...step, completed: true } : step
      );
      setSteps(updatedSteps);
      setShowGoalModal(false);
      setGoalText('');
    }
  };

  const handleMissionsSave = async () => {
    if (selectedMissions.length === 3) {
      // Add 'missions' to localStorage
      const completedStepsData = localStorage.getItem('onboardingCompletedSteps');
      const completedIds = completedStepsData ? JSON.parse(completedStepsData) : [];
      if (!completedIds.includes('missions')) {
        completedIds.push('missions');
        localStorage.setItem('onboardingCompletedSteps', JSON.stringify(completedIds));
      }

      // Save missions to localStorage (database integration can be added later)
      if (user) {
        try {
          // Store missions in localStorage for now
          localStorage.setItem('userMissions', JSON.stringify(selectedMissions));
        } catch (error) {
          console.error('Error saving missions:', error);
        }
      }

      const updatedSteps = steps.map(step => 
        step.id === 'missions' ? { ...step, completed: true } : step
      );
      setSteps(updatedSteps);
      setShowMissionsModal(false);
      setSelectedMissions([]);
      
      // Check if user has access to training - if not, skip to challenges
      if (!hasAccess('training')) {
        console.log('🚀 Basic tier user - skipping training and nutrition steps, going to challenges');
        // Mark training and nutrition steps as completed for Basic tier users
        const finalSteps = updatedSteps.map(step => 
          (step.id === 'training' || step.id === 'nutrition') ? { ...step, completed: true } : step
        );
        setSteps(finalSteps);
      }
    }
  };

  const handleChallengeSave = async () => {
    if (selectedChallenge) {
      // Add 'challenge' to localStorage
      const completedStepsData = localStorage.getItem('onboardingCompletedSteps');
      const completedIds = completedStepsData ? JSON.parse(completedStepsData) : [];
      if (!completedIds.includes('challenge')) {
        completedIds.push('challenge');
        localStorage.setItem('onboardingCompletedSteps', JSON.stringify(completedIds));
      }

      // Save challenge to localStorage (database integration can be added later)
      if (user) {
        try {
          // Store challenge in localStorage for now
          localStorage.setItem('userChallenge', selectedChallenge);
        } catch (error) {
          console.error('Error saving challenge:', error);
        }
      }

      const updatedSteps = steps.map(step => 
        step.id === 'challenge' ? { ...step, completed: true } : step
      );
      setSteps(updatedSteps);
      setShowChallengeModal(false);
      setSelectedChallenge('');
    }
  };

  const toggleMission = (mission: string) => {
    setSelectedMissions(prev => 
      prev.includes(mission) 
        ? prev.filter(m => m !== mission)
        : prev.length < 3 
          ? [...prev, mission]
          : prev
    );
  };

  const completedCount = steps.filter(step => step.completed).length;
  const progress = (completedCount / steps.length) * 100;

  // Check if all steps are completed
  useEffect(() => {
    if (completedCount === steps.length) {
      // Don't auto-complete, let user click the button
      // setTimeout(() => {
      //   onComplete();
      // }, 1000);
    }
  }, [completedCount, steps.length, onComplete]);

  if (!isVisible) return null;

  if (completedCount === steps.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#8BAE5A] to-[#f0a14f] rounded-2xl p-8 shadow-2xl border-2 border-[#FFD700] mb-8"
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-black text-white mb-4">
            GEFELICITEERD!
          </h2>
          <p className="text-xl text-white mb-6">
            Je fundament is gelegd. Je hebt je doelen gesteld, je schema's gemaakt en je eerste commitments gedaan. De reis is nu echt begonnen.
          </p>
          <div className="bg-white/20 rounded-xl p-4 mb-6">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Als beloning voor deze eerste, cruciale stap heb je de 'Initiatie' Badge ontgrendeld!
            </h3>
          </div>
          <button
            onClick={async () => {
              try {
                await onComplete();
              } catch (error) {
                console.error('Error completing onboarding:', error);
                // Even if there's an error, we should still close the widget
                // The parent component will handle the error display
              }
            }}
            className="bg-white text-[#8BAE5A] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Start je reis!
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#232D1A]/90 rounded-2xl p-6 shadow-2xl border-2 border-[#8BAE5A] mb-8 relative"
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-[#8BAE5A] hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl">🚀</div>
          <div>
            <h2 className="text-2xl font-black text-white mb-1">
              Jouw Startmissie: Leg je Fundament
            </h2>
            <p className="text-[#8BAE5A]">
              Voltooi deze 5 essentiële stappen om je reis te beginnen
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-semibold">
              Voortgang: {completedCount}/{steps.length} stappen voltooid
            </span>
            <span className="text-[#8BAE5A] font-bold">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-3 bg-[#3A4D23]/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                step.completed 
                  ? 'bg-[#8BAE5A]/20 border border-[#8BAE5A]' 
                  : 'bg-[#232D1A] border border-[#3A4D23] hover:border-[#8BAE5A] hover:bg-[#8BAE5A]/10'
              }`}
              onClick={() => step.action()}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-[#8BAE5A] text-[#181F17]' 
                  : 'bg-[#3A4D23] text-[#8BAE5A]'
              }`}>
                {step.completed ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${
                  step.completed ? 'text-[#8BAE5A] line-through' : 'text-white'
                }`}>
                  {step.title}
                </h3>
                <p className={`text-sm ${
                  step.completed ? 'text-[#8BAE5A]/70' : 'text-[#8BAE5A]'
                }`}>
                  {step.description}
                </p>
              </div>
              {!step.completed && (
                <ArrowRightIcon className="w-5 h-5 text-[#8BAE5A]" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#232D1A] rounded-2xl p-6 w-full max-w-md border border-[#8BAE5A]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                  <span className="text-[#181F17] font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Definieer je Hoofddoel
                </h3>
              </div>
              <p className="text-[#8BAE5A] mb-4">
                Wat is het allerbelangrijkste doel dat je de komende 90 dagen wilt bereiken?
              </p>
              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="Bijvoorbeeld: 10% lichaamsvet bereiken, €50k sparen, een nieuwe vaardigheid leren..."
                className="w-full h-32 p-3 bg-[#181F17] border border-[#3A4D23] rounded-xl text-white placeholder-[#8BAE5A]/50 resize-none focus:border-[#8BAE5A] focus:outline-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-xl font-semibold hover:bg-[#4A5D33] transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleGoalSave}
                  disabled={!goalText.trim()}
                  className="flex-1 px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-xl font-semibold hover:bg-[#B6C948] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Opslaan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Missions Modal */}
      <AnimatePresence>
        {showMissionsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#232D1A] rounded-2xl p-6 w-full max-w-md border border-[#8BAE5A] max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                  <span className="text-[#181F17] font-bold">4</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Kies je Eerste 3 Uitdagingen
                </h3>
              </div>
              <p className="text-[#8BAE5A] mb-4">
                Selecteer 3 uitdagingen die je deze week wilt voltooien:
              </p>
              <div className="space-y-3 mb-4">
                {availableMissions.map((mission) => (
                  <label
                    key={mission}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                      selectedMissions.includes(mission)
                        ? 'bg-[#8BAE5A]/20 border-[#8BAE5A]'
                        : 'bg-[#181F17] border-[#3A4D23] hover:border-[#8BAE5A]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMissions.includes(mission)}
                      onChange={() => toggleMission(mission)}
                      className="w-5 h-5 text-[#8BAE5A] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#8BAE5A]"
                    />
                    <div>
                      <div className="font-semibold text-white">{mission}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMissionsModal(false)}
                  className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-xl font-semibold hover:bg-[#4A5D33] transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleMissionsSave}
                  disabled={selectedMissions.length !== 3}
                  className="flex-1 px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-xl font-semibold hover:bg-[#B6C948] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Toevoegen aan mijn uitdagingen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge Modal */}
      <AnimatePresence>
        {showChallengeModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] max-w-md w-full mx-4 overflow-hidden shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Kies een Starter-Challenge</h2>
                <button onClick={() => setShowChallengeModal(false)} className="text-gray-400 hover:text-white">
                  <span className="sr-only">Sluiten</span>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="space-y-2 mb-4">
                {starterChallenges.map((challenge) => (
                  <label key={challenge} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="starter-challenge"
                      value={challenge}
                      checked={selectedChallenge === challenge}
                      onChange={() => setSelectedChallenge(challenge)}
                      className="accent-green-600"
                    />
                    <span>{challenge}</span>
                  </label>
                ))}
              </div>
              <button
                className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
                onClick={handleChallengeSave}
                disabled={!selectedChallenge}
              >
                Challenge starten
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 