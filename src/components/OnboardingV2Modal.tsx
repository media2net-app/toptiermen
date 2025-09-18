'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  PlayIcon, 
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  UserIcon,
  TrophyIcon,
  FireIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  FlagIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface OnboardingV2ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Step components
const WelcomeVideoStep = ({ onComplete }: { onComplete: () => void }) => {
  const [videoWatched, setVideoWatched] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    setVideoWatched(true);
    setShowOverlay(false);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setShowOverlay(false);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handlePlayEvent = () => {
    setIsPlaying(true);
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-4">Welkom bij Top Tier Men!</h2>
        <p className="text-gray-300 text-lg mb-4">
          Bekijk deze video en start daarna met onboarding om vervolgens te starten om een Top Tier Man te worden.
        </p>
        
        {/* Notice */}
        <div className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <InformationCircleIcon className="w-5 h-5 text-white" />
            <p className="text-white font-semibold">
              Let op: Je moet de video volledig afkijken om door te gaan
            </p>
          </div>
        </div>
      </div>
      
      <div className="relative bg-black rounded-xl overflow-hidden mb-6 shadow-2xl">
        <video
          ref={videoRef}
          className="w-full h-80 object-cover"
          onEnded={handleVideoEnd}
          onPause={handlePause}
          onPlay={handlePlayEvent}
          onError={(e) => {
            console.log('Video error, trying fallback:', e);
            const video = e.target as HTMLVideoElement;
            if (video.src !== '/videos/welcome-video.mp4') {
              video.src = '/videos/welcome-video.mp4';
            }
          }}
          controls
          preload="metadata"
        >
          <source src="/onboarding-v2-video.mp4" type="video/mp4" />
          <source src="/videos/welcome-video.mp4" type="video/mp4" />
          <source src="/testgebruikers-v2.mp4" type="video/mp4" />
          Je browser ondersteunt geen video element.
        </video>
        
        {showOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-center">
              <button
                onClick={handlePlay}
                className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] hover:from-[#7A9E4A] hover:to-[#E6C200] text-white p-6 rounded-full transition-all duration-300 transform hover:scale-110 shadow-2xl"
              >
                <PlayIcon className="w-12 h-12" />
              </button>
              <p className="text-white mt-4 text-lg font-semibold">Klik om te starten</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${videoWatched ? 'bg-[#8BAE5A]' : 'bg-gray-600'}`}></div>
          <span className="text-gray-300 text-sm">
            {videoWatched ? 'Video bekeken ✓' : 'Video nog niet bekeken'}
          </span>
        </div>
      </div>

      {videoWatched && (
        <button
          onClick={onComplete}
          className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] hover:from-[#7A9E4A] hover:to-[#E6C200] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Volgende Stap →
        </button>
      )}
    </div>
  );
};

const SetGoalStep = ({ onComplete }: { onComplete: (goal: string) => void }) => {
  const [goal, setGoal] = useState('');

  const handleSubmit = () => {
    if (goal.trim()) {
      onComplete(goal.trim());
    } else {
      toast.error('Voer je hoofddoel in');
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Wat is je hoofddoel?</h2>
      <p className="text-gray-300 mb-6">
        Beschrijf in één zin wat je wilt bereiken met Top Tier Men.
      </p>
      
      <div className="mb-6">
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Bijvoorbeeld: Ik wil 10kg afvallen en sterker worden..."
          className="w-full h-32 p-4 bg-[#1a2e1a] border border-[#8BAE5A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A] focus:ring-2 focus:ring-[#8BAE5A] focus:ring-opacity-50 resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!goal.trim()}
        className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] hover:from-[#7A9E4A] hover:to-[#E6C200] disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Doel opslaan →
      </button>
    </div>
  );
};

const SelectChallengesStep = ({ onComplete }: { onComplete: (challenges: string[]) => void }) => {
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [challenges] = useState([
    { id: 'cold-shower', title: 'Koude douche', icon: '❄️' },
    { id: 'no-sugar', title: 'Geen suiker', icon: '🚫🍭' },
    { id: 'meditation', title: 'Meditatie 20 min', icon: '🧘‍♂️' },
    { id: 'reading', title: '1 uur lezen', icon: '📚' },
    { id: 'water', title: '3 liter water', icon: '💧' },
    { id: 'journaling', title: 'Journaling', icon: '✍️' }
  ]);

  const toggleChallenge = (challengeId: string) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId)
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  const handleSubmit = () => {
    if (selectedChallenges.length >= 3) {
      onComplete(selectedChallenges);
    } else {
      toast.error('Selecteer minimaal 3 uitdagingen');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Selecteer je uitdagingen</h2>
      <p className="text-gray-300 mb-6 text-center">
        Kies minimaal 3 uitdagingen die je dagelijks wilt voltooien.
      </p>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        {challenges.map((challenge) => (
          <button
            key={challenge.id}
            onClick={() => toggleChallenge(challenge.id)}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedChallenges.includes(challenge.id)
                ? 'border-[#8BAE5A] bg-[#8BAE5A] bg-opacity-20'
                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
            }`}
          >
            <div className="text-2xl mb-2">{challenge.icon}</div>
            <div className="text-white text-sm font-medium">{challenge.title}</div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <p className="text-gray-400 text-sm mb-4">
          Geselecteerd: {selectedChallenges.length}/3
        </p>
        <button
          onClick={handleSubmit}
          disabled={selectedChallenges.length < 3}
          className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] hover:from-[#7A9E4A] hover:to-[#E6C200] disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Uitdagingen opslaan →
        </button>
      </div>
    </div>
  );
};

const SelectTrainingStep = ({ onComplete, onSkip }: { onComplete: (schema: string) => void; onSkip: () => void }) => {
  const [selectedSchema, setSelectedSchema] = useState('');
  const [schemas] = useState([
    { id: 'beginner', title: 'Beginner Schema', description: 'Perfect voor beginners' },
    { id: 'intermediate', title: 'Intermediate Schema', description: 'Voor gevorderde sporters' },
    { id: 'advanced', title: 'Advanced Schema', description: 'Voor ervaren sporters' }
  ]);

  const handleSubmit = () => {
    if (selectedSchema) {
      onComplete(selectedSchema);
    } else {
      toast.error('Selecteer een trainingsschema');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Kies je trainingsschema</h2>
      <p className="text-gray-300 mb-6 text-center">
        Selecteer het trainingsschema dat het beste bij je past.
      </p>
      
      <div className="space-y-3 mb-6">
        {schemas.map((schema) => (
          <button
            key={schema.id}
            onClick={() => setSelectedSchema(schema.id)}
            className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
              selectedSchema === schema.id
                ? 'border-[#8BAE5A] bg-[#8BAE5A] bg-opacity-20'
                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
            }`}
          >
            <div className="text-white font-semibold">{schema.title}</div>
            <div className="text-gray-400 text-sm">{schema.description}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Overslaan
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedSchema}
          className="flex-1 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] hover:from-[#7A9E4A] hover:to-[#E6C200] disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Schema opslaan →
        </button>
      </div>
    </div>
  );
};

const SelectNutritionStep = ({ onComplete, onSkip }: { onComplete: (plan: string) => void; onSkip: () => void }) => {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [plans] = useState([
    { id: 'maintenance', title: 'Onderhoud', description: 'Behoud je huidige gewicht' },
    { id: 'cutting', title: 'Droogtrainen', description: 'Verlies vet en behoud spieren' },
    { id: 'bulking', title: 'Spiermassa', description: 'Bouw spieren op' }
  ]);

  const handleSubmit = () => {
    if (selectedPlan) {
      onComplete(selectedPlan);
    } else {
      toast.error('Selecteer een voedingsplan');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Kies je voedingsplan</h2>
      <p className="text-gray-300 mb-6 text-center">
        Selecteer het voedingsplan dat bij je doel past.
      </p>
      
      <div className="space-y-3 mb-6">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
              selectedPlan === plan.id
                ? 'border-[#8BAE5A] bg-[#8BAE5A] bg-opacity-20'
                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
            }`}
          >
            <div className="text-white font-semibold">{plan.title}</div>
            <div className="text-gray-400 text-sm">{plan.description}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Overslaan
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedPlan}
          className="flex-1 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] hover:from-[#7A9E4A] hover:to-[#E6C200] disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Plan opslaan →
        </button>
      </div>
    </div>
  );
};

const ForumIntroStep = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Welkom in de Brotherhood!</h2>
      <p className="text-gray-300 mb-6">
        Je onboarding is voltooid! Je kunt nu deelnemen aan de community en alle features gebruiken.
      </p>
      
      <div className="bg-[#8BAE5A] bg-opacity-20 border border-[#8BAE5A] rounded-lg p-6 mb-6">
        <div className="text-[#8BAE5A] text-4xl mb-4">🎉</div>
        <h3 className="text-white font-semibold mb-2">Gefeliciteerd!</h3>
        <p className="text-gray-300 text-sm">
          Je hebt alle stappen voltooid en bent nu klaar om je reis naar een betere versie van jezelf te beginnen.
        </p>
      </div>

      <button
        onClick={onComplete}
        className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] hover:from-[#7A9E4A] hover:to-[#E6C200] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Naar Dashboard →
      </button>
    </div>
  );
};

export default function OnboardingV2Modal({ isOpen, onClose }: OnboardingV2ModalProps) {
  const { 
    isLoading, 
    isCompleted, 
    currentStep, 
    completeStep, 
    skipStep,
    hasTrainingAccess,
    hasNutritionAccess 
  } = useOnboardingV2();
  const router = useRouter();

  // Don't show modal if completed, loading, or for steps 2+ (only show for step 0 - welcome video and step 1 - goal setting)
  if (!isOpen || isLoading || isCompleted || (currentStep !== null && currentStep > 1)) {
    return null;
  }

  const handleStepComplete = async (step: number, data?: any) => {
    const success = await completeStep(step, data);
    if (success) {
      // Handle redirects after step completion
      if (step === 0) { // Welcome video -> redirect to goal step
        router.push('/dashboard');
      } else if (step === 1) { // Goal step -> redirect to challenges
        router.push('/dashboard/mijn-challenges');
      } else if (step === 5) { // Forum intro step -> complete onboarding
        onClose();
        router.push('/dashboard');
      }
    }
  };

  const handleStepSkip = async (step: number) => {
    const success = await skipStep(step);
    if (success) {
      // Continue to next step
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Welcome video
        return <WelcomeVideoStep onComplete={() => handleStepComplete(0)} />;
      
      case 1: // Set goal - show modal
        return <SetGoalStep onComplete={() => handleStepComplete(1)} />;
      
      case 2: // Select challenges - redirect to challenges page
        router.push('/dashboard/mijn-challenges');
        return null;
      
      case 3: // Select training - redirect to training schemas page
        if (!hasTrainingAccess) {
          handleStepSkip(3);
          return null;
        }
        router.push('/dashboard/trainingsschemas');
        return null;
      
      case 4: // Select nutrition - redirect to nutrition plans page
        if (!hasNutritionAccess) {
          handleStepSkip(4);
          return null;
        }
        router.push('/dashboard/voedingsplannen-v2');
        return null;
      
      case 5: // Forum intro
        return <ForumIntroStep onComplete={() => handleStepComplete(5)} />;
      
      default:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Onbekende stap</h2>
            <p className="text-gray-300">Er is een fout opgetreden. Probeer de pagina te verversen.</p>
          </div>
        );
    }
  };

  const getStepInfo = () => {
    const totalSteps = 5;
    const currentStepNumber = (currentStep ?? 0) + 1;
    const percentage = (currentStepNumber / totalSteps) * 100;
    
    const stepNames = {
      0: "Welkomstvideo",
      1: "Hoofddoel instellen", 
      2: "Uitdagingen selecteren",
      3: "Trainingsschema kiezen",
      4: "Voedingsplan selecteren"
    };
    
    return {
      currentStepNumber,
      totalSteps,
      percentage,
      stepName: stepNames[currentStep as keyof typeof stepNames] || "Onbekende stap"
    };
  };

  const stepInfo = getStepInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#1a2e1a] via-[#2d4a2d] to-[#1a2e1a] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#8BAE5A]">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#8BAE5A]">
                  Stap {stepInfo.currentStepNumber} van {stepInfo.totalSteps}
                </span>
                <span className="text-sm font-medium text-white">
                  {Math.round(stepInfo.percentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                <div 
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${stepInfo.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400">{stepInfo.stepName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#8BAE5A] hover:bg-opacity-20 rounded-full ml-4"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
