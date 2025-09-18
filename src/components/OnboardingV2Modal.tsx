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
  FlagIcon
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
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    setVideoWatched(true);
    setShowOverlay(false);
  };

  const handlePlay = () => {
    setShowOverlay(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Welkom bij Top Tier Men!</h2>
      <p className="text-gray-300 mb-6">
        Bekijk deze korte introductievideo om te leren hoe je het meeste uit het platform kunt halen.
      </p>
      
      <div className="relative bg-black rounded-lg overflow-hidden mb-6">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover"
          onEnded={handleVideoEnd}
          poster="/api/placeholder/400/200"
        >
          <source src="/videos/welcome-video.mp4" type="video/mp4" />
          Je browser ondersteunt geen video element.
        </video>
        
        {showOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <button
              onClick={handlePlay}
              className="bg-[#8BAE5A] hover:bg-[#7A9E4A] text-white p-4 rounded-full transition-colors"
            >
              <PlayIcon className="w-8 h-8" />
            </button>
          </div>
        )}
      </div>

      {videoWatched && (
        <button
          onClick={onComplete}
          className="bg-[#8BAE5A] hover:bg-[#7A9E4A] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Volgende →
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
          className="w-full h-32 p-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A] resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!goal.trim()}
        className="bg-[#8BAE5A] hover:bg-[#7A9E4A] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
          className="bg-[#8BAE5A] hover:bg-[#7A9E4A] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
          className="flex-1 bg-[#8BAE5A] hover:bg-[#7A9E4A] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
          className="flex-1 bg-[#8BAE5A] hover:bg-[#7A9E4A] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
        className="bg-[#8BAE5A] hover:bg-[#7A9E4A] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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

  // Don't show modal if completed or loading
  if (!isOpen || isLoading || isCompleted) {
    return null;
  }

  const handleStepComplete = async (step: number, data?: any) => {
    const success = await completeStep(step, data);
    if (success) {
      // Check if onboarding is completed
      if (step === 5) { // Forum intro step
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
      
      case 1: // Set goal
        return <SetGoalStep onComplete={(goal) => handleStepComplete(1, { goal })} />;
      
      case 2: // Select challenges
        return <SelectChallengesStep onComplete={(challenges) => handleStepComplete(2, { challenges })} />;
      
      case 3: // Select training
        if (!hasTrainingAccess) {
          handleStepSkip(3);
          return null;
        }
        return (
          <SelectTrainingStep 
            onComplete={(schema) => handleStepComplete(3, { trainingSchema: schema })} 
            onSkip={() => handleStepSkip(3)}
          />
        );
      
      case 4: // Select nutrition
        if (!hasNutritionAccess) {
          handleStepSkip(4);
          return null;
        }
        return (
          <SelectNutritionStep 
            onComplete={(plan) => handleStepComplete(4, { nutritionPlan: plan })} 
            onSkip={() => handleStepSkip(4)}
          />
        );
      
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-white">Onboarding</h1>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
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
