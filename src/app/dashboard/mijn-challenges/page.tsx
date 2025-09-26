'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'react-hot-toast';
import ClientLayout from '@/app/components/ClientLayout';
import OnboardingV2Progress from '@/components/OnboardingV2Progress';
import OnboardingNotice from '@/components/OnboardingNotice';
import OnboardingLoadingOverlay from '@/components/OnboardingLoadingOverlay';

interface Challenge {
  id: string;
  title: string;
  type: string;
  done: boolean;
  category: string;
  icon: string;
  badge: string;
  progress: number;
  shared: boolean;
  accountabilityPartner: string | null;
  xp_reward: number;
  last_completion_date?: string | null;
  created_at?: string | null;
}

interface SuggestedChallenge {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type?: string;
}

interface Summary {
  completedToday: number;
  totalToday: number;
  dailyStreak: number;
}

// Top Tier Men Challenge Library - Designed to build real men
const CHALLENGE_LIBRARY: SuggestedChallenge[] = [
  // FYSIEK - Physical Challenges
  {
    id: 'fysiek-1',
    title: 'Koude douche',
    category: 'Fysiek',
    icon: '❄️',
    description: 'Start je dag met een koude douche - bouw mentale weerbaarheid',
    xp_reward: 100,
    difficulty: 'hard'
  },
  {
    id: 'fysiek-2',
    title: 'Vroeg opstaan (5:00)',
    category: 'Fysiek',
    icon: '🌅',
    description: 'Sta op om 5:00 en begin je dag als een echte leider',
    xp_reward: 120,
    difficulty: 'hard'
  },
  {
    id: 'fysiek-3',
    title: '10.000 stappen',
    category: 'Fysiek',
    icon: '👟',
    description: 'Loop minimaal 10.000 stappen - beweging is discipline',
    xp_reward: 80,
    difficulty: 'medium'
  },
  {
    id: 'fysiek-4',
    title: '50 push-ups',
    category: 'Fysiek',
    icon: '💪',
    description: 'Doe 50 push-ups verdeeld over de dag - bouw kracht',
    xp_reward: 90,
    difficulty: 'medium'
  },
  {
    id: 'fysiek-5',
    title: '100 squats',
    category: 'Fysiek',
    icon: '🦵',
    description: 'Voer 100 squats uit - sterke benen, sterke geest',
    xp_reward: 85,
    difficulty: 'medium'
  },
  {
    id: 'fysiek-6',
    title: 'Plank 5 minuten',
    category: 'Fysiek',
    icon: '🏋️‍♂️',
    description: 'Houd een plank vast voor 5 minuten - test je uithoudingsvermogen',
    xp_reward: 110,
    difficulty: 'hard'
  },
  {
    id: 'fysiek-7',
    title: 'Geen suiker',
    category: 'Fysiek',
    icon: '🚫🍭',
    description: 'Eet vandaag geen toegevoegde suikers - discipline in voeding',
    xp_reward: 95,
    difficulty: 'hard'
  },
  {
    id: 'fysiek-8',
    title: '3 liter water',
    category: 'Fysiek',
    icon: '💧',
    description: 'Drink 3 liter water - hydratatie is essentieel',
    xp_reward: 60,
    difficulty: 'easy'
  },

  // MENTAAL - Mental Challenges
  {
    id: 'mentaal-1',
    title: 'Geen sociale media',
    category: 'Mentaal',
    icon: '📱❌',
    description: 'Geen sociale media voor 24 uur - focus op wat belangrijk is',
    xp_reward: 120,
    difficulty: 'hard'
  },
  {
    id: 'mentaal-2',
    title: 'Meditatie 20 min',
    category: 'Mentaal',
    icon: '🧘‍♂️',
    description: 'Mediteer 20 minuten - train je geest zoals je lichaam',
    xp_reward: 100,
    difficulty: 'medium'
  },
  {
    id: 'mentaal-3',
    title: '1 uur lezen',
    category: 'Mentaal',
    icon: '📚',
    description: 'Lees 1 uur uit een boek - kennis is macht',
    xp_reward: 90,
    difficulty: 'medium'
  },
  {
    id: 'mentaal-4',
    title: 'Journaling',
    category: 'Mentaal',
    icon: '✍️',
    description: 'Schrijf 500 woorden in je journal - reflecteer op je dag',
    xp_reward: 70,
    difficulty: 'easy'
  },
  {
    id: 'mentaal-5',
    title: 'Geen klagen',
    category: 'Mentaal',
    icon: '🤐',
    description: 'Klaag vandaag nergens over - focus op oplossingen',
    xp_reward: 110,
    difficulty: 'hard'
  },
  {
    id: 'mentaal-6',
    title: 'Gratitude lijst',
    category: 'Mentaal',
    icon: '🙏',
    description: 'Schrijf 10 dingen op waar je dankbaar voor bent',
    xp_reward: 65,
    difficulty: 'easy'
  },
  {
    id: 'mentaal-7',
    title: 'Nieuwe vaardigheid',
    category: 'Mentaal',
    icon: '🎓',
    description: 'Besteed 30 minuten aan het leren van een nieuwe vaardigheid',
    xp_reward: 85,
    difficulty: 'medium'
  },
  {
    id: 'mentaal-8',
    title: 'Doelen herzien',
    category: 'Mentaal',
    icon: '🎯',
    description: 'Herzie en update je doelen - weet waar je naartoe gaat',
    xp_reward: 75,
    difficulty: 'easy'
  },

  // FINANCIEEL - Financial Challenges
  {
    id: 'financieel-1',
    title: 'Budget bijhouden',
    category: 'Financieel',
    icon: '💰',
    description: 'Track alle uitgaven van vandaag - controle over je geld',
    xp_reward: 70,
    difficulty: 'easy'
  },
  {
    id: 'financieel-2',
    title: 'Geen onnodige uitgaven',
    category: 'Financieel',
    icon: '💳❌',
    description: 'Geen impulsieve aankopen vandaag - discipline in uitgaven',
    xp_reward: 90,
    difficulty: 'medium'
  },
  {
    id: 'financieel-3',
    title: 'Investeren leren',
    category: 'Financieel',
    icon: '📈',
    description: 'Besteed 30 minuten aan het leren over investeren',
    xp_reward: 80,
    difficulty: 'medium'
  },
  {
    id: 'financieel-4',
    title: 'Netwerken',
    category: 'Financieel',
    icon: '🤝',
    description: 'Maak contact met 3 nieuwe mensen - bouw je netwerk',
    xp_reward: 95,
    difficulty: 'hard'
  },
  {
    id: 'financieel-5',
    title: 'Side hustle werk',
    category: 'Financieel',
    icon: '💼',
    description: 'Besteed 1 uur aan je side project - bouw extra inkomen',
    xp_reward: 110,
    difficulty: 'hard'
  },
  {
    id: 'financieel-6',
    title: 'Financiële doelen',
    category: 'Financieel',
    icon: '🎯',
    description: 'Definieer 3 financiële doelen voor de komende maand',
    xp_reward: 75,
    difficulty: 'easy'
  },
  {
    id: 'financieel-7',
    title: 'Onderhandelen',
    category: 'Financieel',
    icon: '💬',
    description: 'Onderhandel over een rekening of service - assertiviteit',
    xp_reward: 100,
    difficulty: 'hard'
  },
  {
    id: 'financieel-8',
    title: 'Expense review',
    category: 'Financieel',
    icon: '📊',
    description: 'Analyseer je uitgaven van de afgelopen week',
    xp_reward: 65,
    difficulty: 'easy'
  }
];

export default function MijnChallengesPage() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { currentStep, completeStep, isCompleted, isBasic, hasTrainingAccess, hasNutritionAccess, showLoadingOverlay, loadingText, loadingProgress } = useOnboardingV2();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [summary, setSummary] = useState<Summary>({ completedToday: 0, totalToday: 0, dailyStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newChallenge, setNewChallenge] = useState({ title: '', type: 'Dagelijks' });
  const [showDailyCompletion, setShowDailyCompletion] = useState(false);
  const [showAlmostCompleted, setShowAlmostCompleted] = useState(false);
  const [hasDismissedDaily, setHasDismissedDaily] = useState(false);
  const [hasDismissedAlmost, setHasDismissedAlmost] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [missionToDelete, setChallengeToDelete] = useState<Challenge | null>(null);
  
  // Challenge Library state
  const [showChallengeLibrary, setShowChallengeLibrary] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Onboarding status
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [showOnboardingStep3, setShowOnboardingStep3] = useState(false);
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
  const [showForcedOnboarding, setShowForcedOnboarding] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);

  // Helper function to check if mission was completed today
  const isChallengeCompletedToday = (completionDate: string | null | undefined): boolean => {
    if (!completionDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return completionDate === today;
  };

  // Filter suggested challenges based on selected criteria
  const getFilteredSuggestedChallenges = () => {
    return CHALLENGE_LIBRARY.filter(challenge => {
      const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty;
      const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  };

  // Get unique categories for filter
  const getCategories = () => {
    const categories = [...new Set(CHALLENGE_LIBRARY.map(challenge => challenge.category))];
    return categories.sort();
  };

  // Add suggested mission to user's challenges
  const addSuggestedChallenge = async (suggestedChallenge: SuggestedChallenge) => {
    if (!user?.id) return;

    try {
      // First, create a new challenge in the challenges table
      const createChallengeResponse = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: suggestedChallenge.title,
          description: suggestedChallenge.description,
          category_slug: suggestedChallenge.category.toLowerCase(),
          difficulty_level: suggestedChallenge.difficulty,
          duration_days: 30,
          xp_reward: suggestedChallenge.xp_reward,
          status: 'active'
        })
      });

      if (!createChallengeResponse.ok) {
        throw new Error('Failed to create challenge');
      }

      const challengeData = await createChallengeResponse.json();
      const challengeId = challengeData.challenge.id;

      // Then add it to user challenges
      const addToUserResponse = await fetch('/api/user-challenges/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          challengeId: challengeId
        })
      });

      if (!addToUserResponse.ok) {
        throw new Error('Failed to add challenge to user');
      }

      const data = await addToUserResponse.json();

      if (data.success) {
        // Reload challenges to show the new one
        const updatedResponse = await fetch(`/api/user-challenges?userId=${user.id}`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          const updatedChallenges = updatedData.challenges.map((challenge: any) => ({
            ...challenge,
            done: challenge.done || isChallengeCompletedToday(challenge.last_completion_date)
          }));
          setChallenges(updatedChallenges);
          setSummary(updatedData.summary);
        }
        
        toast.success(`Challenge "${suggestedChallenge.title}" toegevoegd!`);
        // Keep challenge library open so users can add more challenges
        
        // Check if user is in onboarding step 2 or 3 and has enough challenges
        if ((currentStep === 2 || currentStep === 3) && !isCompleted && challenges.length >= 2) { // 2 because we just added one, so total will be 3
          setShowContinueButton(true);
          toast.success('Perfect! Je hebt 3 challenges toegevoegd. Klik op "Ga verder" om door te gaan.');
        }
      }
    } catch (error) {
      console.error('Error adding suggested challenge:', error);
      toast.error('Er is een fout opgetreden bij het toevoegen van de challenge.');
    }
  };

  // Check onboarding status
  useEffect(() => {
    if (!user?.id) return;

    // Check if user is on step 2 or 3 (challenges step)
    const isOnboardingStep2Or3 = currentStep === 2 || currentStep === 3;
    setShowOnboardingStep3(isOnboardingStep2Or3);
    
    // For onboarding V2 users on step 2 or 3, show the challenge library and guidance
    if (isOnboardingStep2Or3 && !isCompleted) {
      // Only show popup once per session - check localStorage
      const hasSeenPopup = localStorage.getItem('challenges-popup-seen');
      if (!hasSeenPopup) {
        setShowOnboardingPopup(true); // Show guidance popup only once
        localStorage.setItem('challenges-popup-seen', 'true');
      }
      setShowChallengeLibrary(true); // Open challenge library
      
      // If user already has 3+ challenges, show continue button immediately
      if (challenges.length >= 3) {
        setShowContinueButton(true);
      }
    } else if (isOnboardingStep2Or3 && isCompleted) {
      // Show popup for completed users (old onboarding system)
      setShowOnboardingPopup(true);
      setShowChallengeLibrary(true);
    }
    
    // Show ForcedOnboardingModal only for step 1 (welcome video)
    const shouldShowModal = currentStep !== null && currentStep === 1 && !isCompleted;
    setShowForcedOnboarding(shouldShowModal);
  }, [user?.id, currentStep, isCompleted, challenges.length]);

  // Check if user already has 3 challenges for onboarding
  useEffect(() => {
    console.log('🔧 DEBUG: Checking continue button conditions:', {
      currentStep,
      isCompleted,
      challengesLength: challenges.length,
      shouldShow: (currentStep === 2 || currentStep === 3) && !isCompleted && challenges.length >= 3
    });
    
    // Show continue button if user is on step 2 or 3 and has 3+ challenges
    if ((currentStep === 2 || currentStep === 3) && !isCompleted && challenges.length >= 3) {
      setShowContinueButton(true);
    } else {
      setShowContinueButton(false);
    }
  }, [currentStep, isCompleted, challenges.length]);

  // Load challenges
  useEffect(() => {
    if (!user?.id) return;

    async function loadChallenges() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/user-challenges?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to load challenges');
        }

        const data = await response.json();
        
        // Process challenges data
        const processedChallenges = data.challenges.map((challenge: any) => ({
          ...challenge,
          done: challenge.done || isChallengeCompletedToday(challenge.last_completion_date)
        }));

        setChallenges(processedChallenges);
        setSummary(data.summary);
      } catch (err) {
        console.error('Error loading challenges:', err);
        setError(err instanceof Error ? err.message : 'Failed to load challenges');
      } finally {
        setLoading(false);
      }
    }

    loadChallenges();
  }, [user?.id]);

  // Check for daily completion notifications
  useEffect(() => {
    if (summary.totalToday > 0) {
      const allDailyCompleted = summary.completedToday === summary.totalToday;
      const almostCompleted = summary.completedToday >= summary.totalToday - 1 && summary.completedToday > 0;
      const wasCompletedBefore = showDailyCompletion;
      const wasAlmostCompletedBefore = showAlmostCompleted;

      setShowDailyCompletion(allDailyCompleted && !hasDismissedDaily);
      setShowAlmostCompleted(almostCompleted && !allDailyCompleted && !hasDismissedAlmost);

      // Show toast notification when all challenges are completed
      if (allDailyCompleted && !wasCompletedBefore && !loading) {
        toast.success('🏆 Alle dagelijkse challenges volbracht! Je bent een echte Top Tier Man! Morgen staan er weer nieuwe challenges klaar! 💪', {
          duration: 6000,
          position: "top-center",
          style: {
            background: '#232D1A',
            color: '#8BAE5A',
            border: '2px solid #8BAE5A',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            maxWidth: '500px'
          }
        });
      }

      // Show encouragement when almost completed
      if (almostCompleted && !allDailyCompleted && !wasAlmostCompletedBefore && !loading) {
        toast('🔥 Bijna alle challenges volbracht! Nog even doorzetten voor de perfecte dag! 💪', {
          duration: 4000,
          position: "top-center",
          style: {
            background: '#FFD700',
            color: '#232D1A',
            fontWeight: 'bold',
            fontSize: '1.1rem',
          },
        });
      }
    }
  }, [summary, loading, showDailyCompletion, showAlmostCompleted, hasDismissedDaily, hasDismissedAlmost]);

  // Load user preferences from database
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/user-preferences?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user preferences');
        }

        const data = await response.json();
        
        if (data.success) {
          const today = new Date().toISOString().split('T')[0];
          const lastDismissDate = data.preferences.last_dismiss_date || '2024-01-01';
          
          // Reset dismiss states on new day
          if (lastDismissDate !== today) {
            setHasDismissedDaily(false);
            setHasDismissedAlmost(false);
            // Update last dismiss date in database
            await fetch('/api/user-preferences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                preferenceKey: 'last_dismiss_date',
                preferenceValue: today
              })
            });
          } else {
            setHasDismissedDaily(data.preferences.daily_completion_dismissed === 'true');
            setHasDismissedAlmost(data.preferences.almost_completed_dismissed === 'true');
          }
          
          setPreferencesLoaded(true);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
        setPreferencesLoaded(true); // Continue without preferences
      }
    };

    loadUserPreferences();
  }, [user?.id]);

  // Toggle challenge completion
  const toggleChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/user-challenges/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          challengeId: challengeId,
          action: 'toggle'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle mission');
      }

      const data = await response.json();

      if (data.success) {
        // Reload challenges to get updated summary
        const updatedResponse = await fetch(`/api/user-challenges?userId=${user.id}`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          const updatedChallenges = updatedData.challenges.map((challenge: any) => ({
            ...challenge,
            done: challenge.done || isChallengeCompletedToday(challenge.last_completion_date)
          }));
          setChallenges(updatedChallenges);
          setSummary(updatedData.summary);
        }

        // Show success message
        if (data.xpEarned > 0) {
          toast.success(`🎉 ${data.message || `Challenge voltooid! +${data.xpEarned} XP verdiend!`}`);
        } else if (data.xpEarned < 0) {
          toast(`Challenge ongedaan gemaakt. ${Math.abs(data.xpEarned)} XP afgetrokken.`);
        }
      }
    } catch (err) {
      console.error('Error toggling mission:', err);
      toast.error('Fout bij het voltooien van de challenge');
    }
  };

  // Add new mission
  const addChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newChallenge.title.trim()) return;

    try {
      // First, create a new challenge in the challenges table
      const createChallengeResponse = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newChallenge.title,
          description: `Persoonlijke challenge: ${newChallenge.title}`,
          category_slug: 'personal',
          difficulty_level: 'medium',
          duration_days: 30,
          xp_reward: 50,
          status: 'active'
        })
      });

      if (!createChallengeResponse.ok) {
        throw new Error('Failed to create challenge');
      }

      const challengeData = await createChallengeResponse.json();
      const challengeId = challengeData.challenge.id;

      // Then add it to user challenges
      const addToUserResponse = await fetch('/api/user-challenges/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          challengeId: challengeId
        })
      });

      if (!addToUserResponse.ok) {
        throw new Error('Failed to add challenge to user');
      }

      const data = await addToUserResponse.json();

      if (data.success) {
        // Reload challenges to get updated summary
        const updatedResponse = await fetch(`/api/user-challenges?userId=${user.id}`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          const updatedChallenges = updatedData.challenges.map((challenge: any) => ({
            ...challenge,
            done: challenge.done || isChallengeCompletedToday(challenge.last_completion_date)
          }));
          setChallenges(updatedChallenges);
          setSummary(updatedData.summary);
        }
        
        setNewChallenge({ title: '', type: 'Dagelijks' });
        toast.success(data.message || 'Challenge toegevoegd!');

        // Check if user is in onboarding step 2 or 3 and has enough challenges
        if ((currentStep === 2 || currentStep === 3) && !isCompleted && challenges.length >= 2) { // 2 because we just added one, so total will be 3
          setShowContinueButton(true);
          toast.success('Perfect! Je hebt 3 challenges toegevoegd. Klik op "Ga verder" om door te gaan.');
        }
      }
    } catch (err) {
      console.error('Error creating challenge:', err);
      toast.error('Fout bij het toevoegen van de challenge');
    }
  };

  // Complete onboarding step (handles both step 2 and step 3)
  const completeOnboardingStep = async () => {
    if (!user?.id || isCompleted) return;
    
    try {
      // Determine which step to complete based on current state
      let stepToComplete = currentStep;
      let stepData: any = {};
      
      if (currentStep === 2) {
        // User is on step 2 (goal setting) but on challenges page
        // Complete step 2 first, then step 3
        console.log('🔧 DEBUG: User on step 2, completing step 2 first');
        stepData = { 
          goal: 'Challenges selected', // Default goal since user skipped goal setting
          completeOnboarding: false // Don't auto-complete onboarding for Basic tier
        };
      } else if (currentStep === 3) {
        // User is on step 3 (challenges) - complete step 2 (SELECT_CHALLENGES)
        console.log('🔧 DEBUG: User on step 3, completing step 2 (SELECT_CHALLENGES)');
        stepData = { 
          challenges: challenges.map(c => c.id),
          completeOnboarding: false // Don't auto-complete onboarding for Basic tier
        };
        stepToComplete = 2; // Database step 2 = SELECT_CHALLENGES for UI step 3
      } else {
        return;
      }
      
      if (stepToComplete) {
        await completeStep(stepToComplete, stepData);
        console.log('✅ Onboarding step completed:', stepToComplete);
      }
      
      // If we completed step 2, also complete step 3 if user has enough challenges
      if (currentStep === 2 && challenges.length >= 3) {
        console.log('🔧 DEBUG: Auto-completing step 3 after step 2');
        await completeStep(2, { // Database step 2 = SELECT_CHALLENGES for UI step 3
          challenges: challenges.map(c => c.id),
          completeOnboarding: false // Don't auto-complete onboarding for Basic tier
        });
      }
      
      // Redirect based on user access
      setTimeout(() => {
        if (hasTrainingAccess) {
          console.log('🔧 DEBUG: Redirecting to training schemas...');
          // Use router.push instead of window.location.href for better navigation
          router.push('/dashboard/trainingsschemas');
        } else {
          console.log('🔧 DEBUG: Redirecting to forum intro...');
          router.push('/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden');
        }
      }, 1000);
    } catch (error) {
      console.error('❌ Error completing onboarding step:', error);
      toast.error('Er is een fout opgetreden bij het voltooien van de stap.');
    }
  };

  // Delete mission
  const deleteChallenge = async (missionId: string) => {
    if (!user?.id) return;

    console.log('🗑️ Deleting challenge:', missionId, 'for user:', user.id);
    try {
      const response = await fetch('/api/missions-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          userId: user.id,
          missionId: missionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete mission');
      }

      const data = await response.json();

      if (data.success) {
        // Reload challenges to get updated summary
        const updatedResponse = await fetch(`/api/user-challenges?userId=${user.id}`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          const updatedChallenges = updatedData.challenges.map((challenge: any) => ({
            ...challenge,
            done: challenge.done || isChallengeCompletedToday(challenge.last_completion_date)
          }));
          setChallenges(updatedChallenges);
          setSummary(updatedData.summary);
        }
        
        setShowDeleteConfirm(false);
        setChallengeToDelete(null);
        toast.success(data.message || 'Challenge succesvol verwijderd! 💪');
      }
    } catch (err) {
      console.error('Error deleting mission:', err);
      toast.error('Fout bij het verwijderen van de challenge');
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (mission: Challenge) => {
    console.log('🗑️ Delete button clicked for mission:', mission.title, mission.id);
    setChallengeToDelete(mission);
    setShowDeleteConfirm(true);
    
    // Scroll to top to ensure modal is visible and centered
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteConfirm) {
        setShowDeleteConfirm(false);
        setChallengeToDelete(null);
      }
    };

    if (showDeleteConfirm) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset'; // Restore scrolling
    };
  }, [showDeleteConfirm]);

  // Filter challenges
  const pendingChallenges = challenges.filter(m => !m.done);
  const completedChallenges = challenges.filter(m => m.done);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-red-400 text-center py-8">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClientLayout>
      <OnboardingV2Progress />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">Mijn Challenges</h1>
        <p className="text-[#8BAE5A] text-sm sm:text-lg mb-6 sm:mb-8">Voltooi dagelijkse challenges en verdien XP</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-[#FFD700]">{summary.completedToday}</div>
            <div className="text-[#8BAE5A] text-xs sm:text-sm">Vandaag Voltooid</div>
          </div>
          <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-[#FFD700]">{summary.totalToday}</div>
            <div className="text-[#8BAE5A] text-xs sm:text-sm">Totaal Vandaag</div>
          </div>
          <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-[#FFD700]">{summary.dailyStreak}</div>
            <div className="text-[#8BAE5A] text-xs sm:text-sm">Dagelijkse Streak</div>
          </div>
        </div>

        {/* Onboarding Notice */}
        <OnboardingNotice />

        {/* DEBUG: Show current state */}

        {/* Onboarding Continue Button - Shows when user has 3+ challenges */}
        {showContinueButton && (currentStep === 2 || currentStep === 3) && !isCompleted && (
          <div className="bg-gradient-to-r from-[#8BAE5A]/20 to-[#FFD700]/20 border border-[#8BAE5A]/30 rounded-2xl p-6 mb-8 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-white mb-2">Perfect! Je hebt 3 challenges toegevoegd</h3>
            <p className="text-[#8BAE5A] mb-6">
              Je bent klaar voor de volgende stap. Klik op "Ga verder" om door te gaan met je onboarding.
            </p>
            <button
              onClick={completeOnboardingStep}
              className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] hover:from-[#7A9E4A] hover:to-[#E6C200] text-[#181F17] font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🚀 Ga verder
            </button>
          </div>
        )}


        {/* Onboarding Popup - Positioned at top for challenges page */}
        {showOnboardingPopup && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#8BAE5A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Welkom bij Challenges!</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  Je kunt challenges kiezen uit onze bestaande bibliotheek en/of je kunt handmatig eigen challenges aanmaken.
                </p>
                <button
                  onClick={() => {
                    setShowOnboardingPopup(false);
                    // Mark popup as seen in localStorage
                    localStorage.setItem('challenges-popup-seen', 'true');
                  }}
                  className="w-full bg-[#8BAE5A] text-[#181F17] px-6 py-3 rounded-lg font-semibold hover:bg-[#7A9D4A] transition-colors"
                >
                  Begrepen!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Daily Completion Celebration */}
        {showDailyCompletion && (
          <div className="mb-8 animate-fade-in-up">
            <div className="bg-gradient-to-br from-[#8BAE5A]/20 to-[#f0a14f]/20 border-2 border-[#8BAE5A] rounded-2xl p-6 text-center shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl mr-3">🏆</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Alle Dagelijkse Challenges Volbracht!
                </h2>
                <span className="text-4xl ml-3">🏆</span>
              </div>
              <p className="text-[#8BAE5A] text-lg mb-4 font-semibold">
                Je bent een echte Top Tier Man! 💪
              </p>
              <div className="bg-[#181F17]/80 rounded-xl p-4 mb-4">
                <p className="text-white text-sm leading-relaxed">
                  <strong>Gefeliciteerd!</strong> Je hebt vandaag alle dagelijkse challenges succesvol afgerond. 
                  Dit toont aan dat je de discipline en doorzettingsvermogen hebt van een echte leider. 
                  Blijf deze momentum vasthouden en blijf jezelf elke dag uitdagen.
                </p>
              </div>
              <div className="bg-[#232D1A]/80 rounded-xl p-4 border border-[#3A4D23]">
                <p className="text-[#8BAE5A] text-sm font-semibold">
                  🌅 <strong>Morgen staan er weer nieuwe challenges voor je klaar!</strong> 
                  Blijf scherp, blijf gefocust en blijf groeien. Jouw toekomstige zelf zal je dankbaar zijn.
                </p>
              </div>
              <button 
                onClick={async () => {
                  setShowDailyCompletion(false);
                  setHasDismissedDaily(true);
                  
                  // Save to database
                  if (user?.id) {
                    try {
                      await fetch('/api/user-preferences', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: user.id,
                          preferenceKey: 'daily_completion_dismissed',
                          preferenceValue: 'true'
                        })
                      });
                    } catch (error) {
                      console.error('Error saving dismiss state:', error);
                    }
                  }
                }}
                className="mt-4 px-6 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#8BAE5A] hover:text-white transition-colors duration-300 font-semibold"
              >
                Begrepen
              </button>
            </div>
          </div>
        )}

        {/* Almost Completed Encouragement */}
        {showAlmostCompleted && (
          <div className="mb-8 animate-fade-in-up">
            <div className="bg-gradient-to-br from-[#f0a14f]/20 to-[#FFD700]/20 border-2 border-[#f0a14f] rounded-2xl p-6 text-center shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl mr-3">🔥</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Bijna Alle Challenges Volbracht!
                </h2>
                <span className="text-4xl ml-3">🔥</span>
              </div>
              <p className="text-[#f0a14f] text-lg mb-4 font-semibold">
                Nog even doorzetten voor de perfecte dag! 💪
              </p>
              <div className="bg-[#181F17]/80 rounded-xl p-4 mb-4">
                <p className="text-white text-sm leading-relaxed">
                  <strong>Fantastisch werk!</strong> Je hebt al {summary.completedToday} van de {summary.totalToday} dagelijkse challenges volbracht. 
                  Je bent zo dichtbij een perfecte dag! Blijf gefocust en voltooi die laatste challenge om jezelf te bewijzen dat je een echte Top Tier Man bent.
                </p>
              </div>
              <div className="bg-[#232D1A]/80 rounded-xl p-4 border border-[#3A4D23]">
                <p className="text-[#f0a14f] text-sm font-semibold">
                  ⚡ <strong>Die laatste challenge maakt het verschil!</strong> 
                  Het is de discipline in de moeilijke momenten die echte leiders onderscheidt van de rest.
                </p>
              </div>
              <button 
                onClick={async () => {
                  setShowAlmostCompleted(false);
                  setHasDismissedAlmost(true);
                  
                  // Save to database
                  if (user?.id) {
                    try {
                      await fetch('/api/user-preferences', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: user.id,
                          preferenceKey: 'almost_completed_dismissed',
                          preferenceValue: 'true'
                        })
                      });
                    } catch (error) {
                      console.error('Error saving dismiss state:', error);
                    }
                  }
                }}
                className="mt-4 px-6 py-2 bg-[#3A4D23] text-[#f0a14f] rounded-lg hover:bg-[#f0a14f] hover:text-white transition-colors duration-300 font-semibold"
              >
                Begrepen
              </button>
            </div>
          </div>
        )}

        {/* Add New Challenge */}
        <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Nieuwe Challenge Toevoegen</h2>
            <button
              onClick={() => setShowChallengeLibrary(!showChallengeLibrary)}
              className="bg-gradient-to-r from-[#f0a14f] to-[#e0903f] hover:from-[#e0903f] hover:to-[#d0802f] text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-lg">📚</span>
              {showChallengeLibrary ? 'Sluit Bibliotheek' : 'Challenge Bibliotheek'}
            </button>
          </div>
          
          <form onSubmit={addChallenge} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newChallenge.title}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Challenge titel..."
              className="flex-1 bg-[#0F1419] border border-[#3A4D23]/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
            />
            <select
              value={newChallenge.type}
              onChange={(e) => setNewChallenge(prev => ({ ...prev, type: e.target.value }))}
              className="bg-[#0F1419] border border-[#3A4D23]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8BAE5A]"
            >
              <option value="Dagelijks">Dagelijks</option>
            </select>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] hover:from-[#7A9D4A] hover:to-[#5A7D2A] text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200"
            >
              Toevoegen
            </button>
          </form>
        </div>


        {/* TO DO Challenges */}
        {pendingChallenges.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Te Doen</h2>
            <div className="space-y-3 sm:space-y-4">
              {pendingChallenges.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-4 sm:p-6 hover:border-[#8BAE5A]/50 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="text-2xl sm:text-3xl flex-shrink-0">{mission.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-white break-words leading-tight">{mission.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                          <span className="text-xs sm:text-sm text-[#8BAE5A]">{mission.type}</span>
                          <span className="text-xs sm:text-sm text-gray-400">{mission.category}</span>
                          {mission.shared && (
                            <span className="text-xs sm:text-sm text-[#FFD700]">👥 Gedeeld</span>
                          )}
                        </div>
                        {mission.accountabilityPartner && (
                          <p className="text-xs sm:text-sm text-gray-400 mt-1 break-words">
                            Accountability Partner: {mission.accountabilityPartner}
                          </p>
                        )}
                        {mission.created_at && (
                          <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            Toegevoegd op: {new Date(mission.created_at).toLocaleDateString('nl-NL')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-base sm:text-lg font-bold text-[#FFD700]">+{mission.xp_reward} XP</div>
                        <div className="text-xs sm:text-sm text-gray-400">{mission.badge}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleChallenge(mission.id)}
                          className="bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] hover:from-[#7A9D4A] hover:to-[#5A7D2A] text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                        >
                          Voltooien
                        </button>
                        <button
                          onClick={() => handleDeleteClick(mission)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base flex items-center gap-1"
                          title="Verwijder challenge"
                        >
                          🗑️ <span className="hidden sm:inline">Verwijder</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Voltooid</h2>
            <div className="space-y-3 sm:space-y-4">
              {completedChallenges.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-gradient-to-br from-[#1A1F2E] to-[#232D1A] border border-[#3A4D23]/50 rounded-xl p-4 sm:p-6 opacity-75"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="text-2xl sm:text-3xl flex-shrink-0">{mission.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-white line-through break-words leading-tight">{mission.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
                          <span className="text-xs sm:text-sm text-[#8BAE5A]">{mission.type}</span>
                          <span className="text-xs sm:text-sm text-gray-400">{mission.category}</span>
                          {mission.shared && (
                            <span className="text-xs sm:text-sm text-[#FFD700]">👥 Gedeeld</span>
                          )}
                        </div>
                        {mission.last_completion_date && (
                          <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            Voltooid op: {new Date(mission.last_completion_date).toLocaleDateString('nl-NL')}
                          </p>
                        )}
                        {mission.created_at && (
                          <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            Toegevoegd op: {new Date(mission.created_at).toLocaleDateString('nl-NL')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-base sm:text-lg font-bold text-[#FFD700]">+{mission.xp_reward} XP</div>
                        <div className="text-xs sm:text-sm text-gray-400">{mission.badge}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleChallenge(mission.id)}
                          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                        >
                          Ongedaan
                        </button>
                        <button
                          onClick={() => handleDeleteClick(mission)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base flex items-center gap-1"
                          title="Verwijder challenge"
                        >
                          🗑️ <span className="hidden sm:inline">Verwijder</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Empty State */}
        {challenges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">Geen challenges gevonden</h3>
            <p className="text-gray-400">Voeg je eerste challenge toe om te beginnen!</p>
          </div>
        )}

        {/* Top Tier Men Challenge Library */}
        {showChallengeLibrary && (
          <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-2xl p-6 mb-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">🏆 Top Tier Men Challenge Library</h2>
              <p className="text-[#8BAE5A] text-lg">Kies challenges die jou tot een echte leider maken</p>
            </div>
            
            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { key: 'all', label: 'Alle Challenges', icon: '🔥', color: 'from-[#8BAE5A] to-[#B6C948]' },
                { key: 'Fysiek', label: 'Fysiek', icon: '💪', color: 'from-[#FF6B6B] to-[#FF8E8E]' },
                { key: 'Mentaal', label: 'Mentaal', icon: '🧠', color: 'from-[#4ECDC4] to-[#7EDDD6]' },
                { key: 'Financieel', label: 'Financieel', icon: '💰', color: 'from-[#FFD93D] to-[#FFE55C]' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedCategory === tab.key
                      ? `bg-gradient-to-r ${tab.color} text-[#181F17] shadow-lg scale-105`
                      : 'bg-[#0F1419] text-[#8BAE5A] hover:bg-[#3A4D23] hover:text-white'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Search and Difficulty Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="🔍 Zoek naar specifieke challenges..."
                  className="w-full bg-[#0F1419] border border-[#3A4D23]/30 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A] focus:ring-2 focus:ring-[#8BAE5A]/20 text-lg"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-[#0F1419] border border-[#3A4D23]/30 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[#8BAE5A] focus:ring-2 focus:ring-[#8BAE5A]/20 text-lg"
                >
                  <option value="all">Alle Niveaus</option>
                  <option value="easy">🟢 Makkelijk</option>
                  <option value="medium">🟡 Gemiddeld</option>
                  <option value="hard">🔴 Moeilijk</option>
                </select>
              </div>
            </div>

            {/* Challenge Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {getFilteredSuggestedChallenges().map((mission) => (
                <div
                  key={mission.id}
                  className="group bg-gradient-to-br from-[#0F1419] to-[#181F17] border border-[#3A4D23]/30 rounded-2xl p-6 hover:border-[#8BAE5A]/50 hover:shadow-2xl hover:shadow-[#8BAE5A]/10 transition-all duration-300 transform hover:scale-105"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{mission.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{mission.title}</h3>
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                          mission.category === 'Fysiek' ? 'bg-red-600/20 text-red-400 border border-red-600/30' :
                          mission.category === 'Mentaal' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' :
                          mission.category === 'Financieel' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30' :
                          'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                        }`}>
                          {mission.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-lg text-[#FFD700] font-bold">+{mission.xp_reward} XP</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        mission.difficulty === 'easy' ? 'bg-green-600/20 text-green-400' :
                        mission.difficulty === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {mission.difficulty === 'easy' ? '🟢 Makkelijk' :
                         mission.difficulty === 'medium' ? '🟡 Gemiddeld' : '🔴 Moeilijk'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">{mission.description}</p>

                  {/* Action Button */}
                  <button
                    onClick={() => addSuggestedChallenge(mission)}
                    className="w-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] hover:from-[#B6C948] hover:to-[#8BAE5A] text-[#181F17] font-bold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>⚔️</span>
                    <span>Challenge Aanvaarden</span>
                  </button>
                </div>
              ))}
            </div>

            {getFilteredSuggestedChallenges().length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-4">Geen challenges gevonden</h3>
                <p className="text-gray-400 mb-6">Probeer andere filters of zoektermen</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
                >
                  🔄 Reset Alle Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && missionToDelete && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
            style={{ 
              backdropFilter: 'blur(4px)',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => {
              setShowDeleteConfirm(false);
              setChallengeToDelete(null);
            }}
          >
            <div 
              className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border-2 border-red-600 rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-[10000] max-h-[90vh] overflow-y-auto mx-auto"
              style={{
                transform: 'translateY(0)',
                margin: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">⚔️</div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Challenge Verwijderen
                </h2>
                <div className="bg-[#0F1419]/80 rounded-xl p-4 mb-6 border border-[#3A4D23]">
                  <p className="text-white text-sm leading-relaxed mb-3">
                    <strong>Top Tier Man,</strong> ben je zeker dat je deze challenge wilt verwijderen?
                  </p>
                  <div className="bg-[#232D1A]/80 rounded-lg p-3 border border-red-600/30">
                    <p className="text-red-400 text-sm font-semibold">
                      "{missionToDelete.title}"
                    </p>
                  </div>
                </div>
                <div className="bg-[#232D1A]/80 rounded-xl p-4 border border-[#3A4D23] mb-6">
                  <p className="text-[#8BAE5A] text-sm font-semibold">
                    💪 <strong>Herinnering:</strong> Echte leiders maken bewuste keuzes. 
                    Zorg ervoor dat je deze challenge niet meer nodig hebt voor je groei.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setChallengeToDelete(null);
                    }}
                    className="flex-1 bg-[#3A4D23] text-[#8BAE5A] px-6 py-3 rounded-lg hover:bg-[#8BAE5A] hover:text-white transition-colors duration-300 font-semibold"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={() => deleteChallenge(missionToDelete.id)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg transition-all duration-300 font-semibold"
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* OnboardingV2Modal removed to prevent conflicts - handled by main dashboard */}
      </div>

      {/* Onboarding Loading Overlay */}
      <OnboardingLoadingOverlay 
        show={showLoadingOverlay}
        text={loadingText}
        progress={loadingProgress}
      />
    </ClientLayout>
  );
} 