'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import ModalBase from '@/components/ui/ModalBase';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'react-hot-toast';
import ClientLayout from '@/app/components/ClientLayout';
// Lazy-load progress UI to improve LCP
const OnboardingV2Progress = dynamic(() => import('@/components/OnboardingV2Progress'), { ssr: false });
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

// Library data is code-split and loaded on-demand from challengeLibraryData.ts

export default function MijnChallengesPage() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { currentStep, completeStep, isCompleted, isBasic, hasTrainingAccess, hasNutritionAccess, showLoadingOverlay, loadingText, loadingProgress } = useOnboardingV2();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [summary, setSummary] = useState<Summary>({ completedToday: 0, totalToday: 0, dailyStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newChallenge, setNewChallenge] = useState({ title: '', type: 'Dagelijks' });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showDailyCompletion, setShowDailyCompletion] = useState(false);
  const [showAlmostCompleted, setShowAlmostCompleted] = useState(false);
  const [hasDismissedDaily, setHasDismissedDaily] = useState(false);
  const [hasDismissedAlmost, setHasDismissedAlmost] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Library button states
  const [addingLibraryIds, setAddingLibraryIds] = useState<Set<string>>(new Set());
  const [addedLibraryIds, setAddedLibraryIds] = useState<Set<string>>(new Set());
  const [challengeToDelete, setChallengeToDelete] = useState<Challenge | null>(null);
  
  // Challenge Library state
  const [showChallengeLibrary, setShowChallengeLibrary] = useState(false);
  const [libraryData, setLibraryData] = useState<SuggestedChallenge[] | null>(null);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Challenge form state
  const [showNewChallengeForm, setShowNewChallengeForm] = useState(false);

  // Onboarding status
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [showOnboardingStep3, setShowOnboardingStep3] = useState(false);
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
  const [showForcedOnboarding, setShowForcedOnboarding] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const continueRef = useRef<HTMLDivElement | null>(null);
  const continueBtnId = 'onb-challenges-continue-btn';
  const onboardingPopupRef = useRef<HTMLDivElement | null>(null);

  // Helper function to check if mission was completed today
  const isChallengeCompletedToday = (completionDate: string | null | undefined): boolean => {
    if (!completionDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return completionDate === today;
  };

  // Filter suggested challenges based on selected criteria
  const getFilteredSuggestedChallenges = () => {
    const list = libraryData || [];
    return list.filter(challenge => {
      const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty;
      const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  };

  // Get unique categories for filter
  const getCategories = () => {
    const list = libraryData || [];
    const categories = [...new Set(list.map(challenge => challenge.category))];
    return categories.sort();
  };

  // Lazy-load library data when opening
  const ensureLibraryLoaded = async () => {
    if (libraryData || libraryLoading) return;
    try {
      setLibraryLoading(true);
      const mod = await import('./challengeLibraryData');
      setLibraryData(mod.CHALLENGE_LIBRARY as SuggestedChallenge[]);
    } finally {
      setLibraryLoading(false);
    }
  };

  useEffect(() => {
    if (showChallengeLibrary) {
      ensureLibraryLoaded();
    }
  }, [showChallengeLibrary]);

  // Add suggested mission to user's challenges
  const addSuggestedChallenge = async (suggestedChallenge: SuggestedChallenge) => {
    if (!user?.id) return;

    try {
      // Prevent double submit
      if (addingLibraryIds.has(suggestedChallenge.id) || addedLibraryIds.has(suggestedChallenge.id)) return;
      setAddingLibraryIds(prev => new Set(prev).add(suggestedChallenge.id));
      // New combined endpoint
      const response = await fetch('/api/user-challenges/create-and-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          challenge: {
            title: suggestedChallenge.title,
            description: suggestedChallenge.description,
            category_slug: suggestedChallenge.category.toLowerCase(),
            difficulty_level: suggestedChallenge.difficulty,
            duration_days: 30,
            xp_reward: suggestedChallenge.xp_reward,
            status: 'active'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create & add suggested challenge');
      }

      const data = await response.json();

      if (data.success) {
        // Optimistic append
        setChallenges(prev => [{
          id: data.challenge.id,
          title: data.challenge.title,
          type: suggestedChallenge.type || 'Dagelijks',
          done: false,
          category: data.challenge.category,
          icon: suggestedChallenge.icon || '🎯',
          badge: 'Challenge Master',
          progress: 0,
          shared: false,
          accountabilityPartner: null,
          xp_reward: data.challenge.xp_reward,
          last_completion_date: null,
          created_at: data.challenge.created_at,
        }, ...prev]);

        setSummary(prev => ({ ...prev, totalToday: prev.totalToday + 1 }));

        toast.success(`Challenge "${suggestedChallenge.title}" toegevoegd!`);
        setAddedLibraryIds(prev => new Set(prev).add(suggestedChallenge.id));

        if ((currentStep === 2 || currentStep === 3) && !isCompleted && challenges.length >= 2) { 
          setShowContinueButton(true);
          toast.success('Top! Je hebt 3 challenges toegevoegd. Scroll naar beneden om door te gaan.');
          setTimeout(() => {
            continueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    } catch (error) {
      console.error('Error adding suggested challenge:', error);
      toast.error('Er is een fout opgetreden bij het toevoegen van de challenge.');
    } finally {
      setAddingLibraryIds(prev => {
        const next = new Set(prev);
        next.delete(suggestedChallenge.id);
        return next;
      });
    }
  };

  // Check onboarding status
  useEffect(() => {
    if (!user?.id) return;

    // Check if user is on step 2 or 3 (challenges step)
    const isOnboardingStep2Or3 = currentStep === 2 || currentStep === 3;
    setShowOnboardingStep3(isOnboardingStep2Or3);
    
    // For onboarding V2 users on step 2 of 3, show the challenge library and guidance
    if (isOnboardingStep2Or3 && !isCompleted) {
      // Only show popup once per session - check localStorage
      const hasSeenPopup = localStorage.getItem('challenges-popup-seen');
      if (!hasSeenPopup) {
        setShowOnboardingPopup(true); // Show guidance popup only once
        localStorage.setItem('challenges-popup-seen', 'true');
      }
      // Defer opening library to after first paint to improve LCP
      const openLibrary = () => setShowChallengeLibrary(true);
      if (typeof (window as any).requestIdleCallback === 'function') {
        (window as any).requestIdleCallback(openLibrary, { timeout: 800 });
      } else {
        setTimeout(openLibrary, 400);
      }
      
      // If user already has 3+ challenges, show continue button immediately
      setShowContinueButton(challenges.length >= 3);
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
    // Show continue button when on step 2 or 3 and at least 3 challenges selected
    const shouldShow = (currentStep === 2 || currentStep === 3) && !isCompleted && challenges.length >= 3;
    setShowContinueButton(shouldShow);
    if (shouldShow) {
      // Scroll into view when it appears
      setTimeout(() => {
        // Ensure the modal will be centered in viewport and CTA focused
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
        try { document.getElementById(continueBtnId)?.focus(); } catch {}
        try { continueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
      }, 300);
    }
  }, [currentStep, isCompleted, challenges.length]);

  // Focus-scroll the onboarding popup (step 3) on mobile when it appears
  useEffect(() => {
    if (showOnboardingPopup) {
      setTimeout(() => {
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
        try { onboardingPopupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
        try { document.getElementById('onboarding-popup-primary')?.focus(); } catch {}
      }, 100);
    }
  }, [showOnboardingPopup]);

  // Load challenges
  useEffect(() => {
    if (!user?.id) return;

    async function loadChallenges() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const controller = new AbortController();
        const response = await fetch(`/api/user-challenges?userId=${user.id}`, { signal: controller.signal });
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
        const controller = new AbortController();
        const response = await fetch(`/api/user-preferences?userId=${user.id}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Failed to fetch user preferences');
        }
        const data = await response.json();
        if (data.success) {
          const today = new Date().toISOString().split('T')[0];
          const lastDismissDate = data.preferences.last_dismiss_date || '2024-01-01';
          if (lastDismissDate !== today) {
            setHasDismissedDaily(false);
            setHasDismissedAlmost(false);
            await fetch('/api/user-preferences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, preferenceKey: 'last_dismiss_date', preferenceValue: today })
            });
          } else {
            setHasDismissedDaily(data.preferences.daily_completion_dismissed === 'true');
            setHasDismissedAlmost(data.preferences.almost_completed_dismissed === 'true');
          }
          setPreferencesLoaded(true);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
        setPreferencesLoaded(true);
      }
    };

    // Defer preferences fetch to idle to improve initial LCP
    if (typeof (window as any).requestIdleCallback === 'function') {
      (window as any).requestIdleCallback(loadUserPreferences, { timeout: 1500 });
    } else {
      setTimeout(loadUserPreferences, 800);
    }
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
      setIsAddingNew(true);
      console.time('create-and-add');

      // New combined endpoint for faster UX
      const response = await fetch('/api/user-challenges/create-and-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          challenge: {
            title: newChallenge.title,
            description: `Persoonlijke challenge: ${newChallenge.title}`,
            category_slug: 'personal',
            difficulty_level: 'medium',
            duration_days: 30,
            xp_reward: 50,
            status: 'active'
          }
        })
      });

      console.timeEnd('create-and-add');

      if (!response.ok) {
        throw new Error('Failed to create & add challenge');
      }

      const data = await response.json();

      if (data.success) {
        // Optimistic append to UI without full reload
        setChallenges(prev => [{
          id: data.challenge.id,
          title: data.challenge.title,
          type: 'Dagelijks',
          done: false,
          category: data.challenge.category,
          icon: '🎯',
          badge: 'Challenge Master',
          progress: 0,
          shared: false,
          accountabilityPartner: null,
          xp_reward: data.challenge.xp_reward,
          last_completion_date: null,
          created_at: data.challenge.created_at,
        }, ...prev]);

        // Light summary bump
        setSummary(prev => ({ ...prev, totalToday: prev.totalToday + 1 }));

        setNewChallenge({ title: '', type: 'Dagelijks' });
        toast.success(data.message || 'Challenge toegevoegd!');

        // Check if user is in onboarding step 2 of 3 and has enough challenges (now requires manual continue)
        if ((currentStep === 2 || currentStep === 3) && !isCompleted && challenges.length >= 2) { // 2 because we just added one, so total will be 3
          setShowContinueButton(true);
          toast.success('Top! Je hebt 3 challenges toegevoegd. Scroll naar beneden en klik op Doorgaan.');
          setTimeout(() => {
            continueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    } catch (err) {
      console.error('Error creating challenge:', err);
      toast.error('Fout bij het toevoegen van de challenge');
    } finally {
      setIsAddingNew(false);
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
  const deleteChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    console.log('🗑️ Deleting challenge:', challengeId, 'for user:', user.id);
    try {
      const response = await fetch('/api/user-challenges', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          challengeId: challengeId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete challenge');
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
      console.error('Error deleting challenge:', err);
      toast.error('Fout bij het verwijderen van de challenge');
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (challenge: Challenge) => {
    console.log('🗑️ Delete button clicked for challenge:', challenge.title, challenge.id);
    setChallengeToDelete(challenge);
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
    if (showDeleteConfirm) document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
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
        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">Mijn Challenges</h1>
        <p className="text-[#8BAE5A] text-xs sm:text-base mb-4 sm:mb-6">Voltooi dagelijkse challenges en verdien XP</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-2xl font-bold text-[#FFD700]">{summary.completedToday}</div>
            <div className="text-[#8BAE5A] text-[10px] sm:text-xs">Vandaag Voltooid</div>
          </div>
          <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-2xl font-bold text-[#FFD700]">{summary.totalToday}</div>
            <div className="text-[#8BAE5A] text-[10px] sm:text-xs">Totaal Vandaag</div>
          </div>
          <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-2xl font-bold text-[#FFD700]">{summary.dailyStreak}</div>
            <div className="text-[#8BAE5A] text-[10px] sm:text-xs">Dagelijkse Streak</div>
          </div>
        </div>

        {/* Onboarding Notice */}
        <OnboardingNotice />

        {/* DEBUG: Show current state */}

        {/* Onboarding Continue Modal */}
        {showContinueButton && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { /* prevent closing by backdrop for forced focus */ }} />
            <div
              ref={continueRef}
              className="relative w-full max-w-md bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/50 rounded-2xl p-5 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="continue-onboarding-title"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-[#8BAE5A]/20 border border-[#8BAE5A]/40 flex items-center justify-center text-[#8BAE5A] text-sm">3</div>
                <div className="text-left">
                  <h3 id="continue-onboarding-title" className="sr-only">Onboarding verder gaan</h3>
                  <p className="text-white text-sm leading-snug mb-3">
                    Je hebt 3 challenges geselecteerd. Klik op de knop hieronder om verder te gaan met onboarding.
                  </p>
                  <div className="flex">
                    <button
                      id={continueBtnId}
                      autoFocus
                      onClick={completeOnboardingStep}
                      className="w-full bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] hover:from-[#7A9E4A] hover:to-[#E6C200] text-[#0F1411] px-4 py-2 rounded-lg font-bold text-base transition-all duration-200 shadow-lg"
                    >
                      Doorgaan →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Popup - Positioned at top for challenges page */}
        {showOnboardingPopup && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8">
            <div ref={onboardingPopupRef} className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 max-w-md w/full shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#8BAE5A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Welkom bij Challenges!</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  Je kunt challenges kiezen uit onze bestaande bibliotheek en/of je kunt handmatig eigen challenges aanmaken.
                </p>
                <button
                  id="onboarding-popup-primary"
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-white w-full sm:w-auto">Nieuwe Challenge Toevoegen</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  const next = !showChallengeLibrary;
                  setShowChallengeLibrary(next);
                  if (next) ensureLibraryLoaded();
                }}
                className="bg-gradient-to-r from-[#f0a14f] to-[#e0903f] hover:from-[#e0903f] hover:to-[#d0802f] text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                <span className="text-lg">📚</span>
                <span className="hidden sm:inline">{showChallengeLibrary ? 'Sluit Bibliotheek' : 'Challenge Bibliotheek'}</span>
                <span className="sm:hidden">Bibliotheek</span>
              </button>
              <button
                onClick={() => setShowNewChallengeForm(!showNewChallengeForm)}
                className="bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] hover:from-[#7A9D4A] hover:to-[#5A7D2A] text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                <span className="text-lg">+</span>
                {showNewChallengeForm ? 'Sluiten' : 'Toevoegen'}
              </button>
            </div>
          </div>
          
          {showNewChallengeForm && (
            <form onSubmit={addChallenge} className="flex flex-col sm:flex-row gap-4 mt-4">
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
          )}
        </div>


        {/* TO DO Challenges */}
        {pendingChallenges.length > 0 && (
          <div className="mb-5 sm:mb-7">
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">Te Doen</h2>
            <div className="space-y-2 sm:space-y-3">
              {pendingChallenges.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-3 sm:p-4 hover:border-[#8BAE5A]/50 transition-all duration-200"
                >
                  <div className="flex flex-row items-start justify-between gap-2.5 sm:gap-3">
                    <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                      <div className="text-xl sm:text-2xl flex-shrink-0">{mission.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-white break-words leading-snug">{mission.title}</h3>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-0.5">
                          <span className="text-[11px] sm:text-sm text-[#8BAE5A]">{mission.type}</span>
                          <span className="text-[11px] sm:text-sm text-gray-400">{mission.category}</span>
                          {mission.shared && (
                            <span className="text-[11px] sm:text-sm text-[#FFD700]">👥 Gedeeld</span>
                          )}
                        </div>
                        {mission.accountabilityPartner && (
                          <p className="text-[11px] sm:text-sm text-gray-400 mt-0.5 break-words">
                            Accountability Partner: {mission.accountabilityPartner}
                          </p>
                        )}
                        {mission.created_at && (
                          <p className="text-[11px] sm:text-sm text-gray-400 mt-0.5">
                            Toegevoegd op: {new Date(mission.created_at).toLocaleDateString('nl-NL')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 sm:gap-2 flex-shrink-0">
                      <div className="text-right leading-none">
                        <div className="text-sm sm:text-lg font-bold text-[#FFD700]">+{mission.xp_reward} XP</div>
                        <div className="text-[11px] sm:text-sm text-gray-400">{mission.badge}</div>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2">
                        <button
                          onClick={() => toggleChallenge(mission.id)}
                          className="bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] hover:from-[#7A9D4A] hover:to-[#5A7D2A] text-white font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                        >
                          Voltooien
                        </button>
                        <button
                          onClick={() => handleDeleteClick(mission)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-sm flex items-center gap-1"
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
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">Voltooid</h2>
            <div className="space-y-2 sm:space-y-3">
              {completedChallenges.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-gradient-to-br from-[#1A1F2E] to-[#232D1A] border border-[#3A4D23]/50 rounded-xl p-3 sm:p-4 opacity-75"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                    <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                      <div className="text-xl sm:text-2xl flex-shrink-0">{mission.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-white line-through break-words leading-snug">{mission.title}</h3>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-0.5">
                          <span className="text-[11px] sm:text-sm text-[#8BAE5A]">{mission.type}</span>
                          <span className="text-[11px] sm:text-sm text-gray-400">{mission.category}</span>
                          {mission.shared && (
                            <span className="text-[11px] sm:text-sm text-[#FFD700]">👥 Gedeeld</span>
                          )}
                        </div>
                        {mission.last_completion_date && (
                          <p className="text-[11px] sm:text-sm text-gray-400 mt-0.5">
                            Voltooid op: {new Date(mission.last_completion_date).toLocaleDateString('nl-NL')}
                          </p>
                        )}
                        {mission.created_at && (
                          <p className="text-[11px] sm:text-sm text-gray-400 mt-0.5">
                            Toegevoegd op: {new Date(mission.created_at).toLocaleDateString('nl-NL')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 sm:gap-2 flex-shrink-0">
                      <div className="text-right leading-none">
                        <div className="text-sm sm:text-lg font-bold text-[#FFD700]">+{mission.xp_reward} XP</div>
                        <div className="text-[11px] sm:text-sm text-gray-400">{mission.badge}</div>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2">
                        <button
                          onClick={() => toggleChallenge(mission.id)}
                          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                        >
                          Ongedaan
                        </button>
                        <button
                          onClick={() => handleDeleteClick(mission)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-all duration-200 text-xs sm:text-sm flex items-center gap-1"
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
          <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl">
            <div className="text-center mb-5">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">🏆 Top Tier Men Challenge Library</h2>
              <p className="text-[#8BAE5A] text-sm sm:text-base">Kies challenges die jou tot een echte leider maken</p>
            </div>

            {/* Loading skeleton for library */}
            {(libraryLoading || !libraryData) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-[#0F1419] border border-[#3A4D23]/30 rounded-2xl p-4 sm:p-5">
                    <div className="h-6 bg-[#1b2519] rounded w-2/3 mb-3" />
                    <div className="h-4 bg-[#1b2519] rounded w-1/2 mb-2" />
                    <div className="h-4 bg-[#1b2519] rounded w-full mb-2" />
                    <div className="h-10 bg-[#1b2519] rounded w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Category Tabs */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-5">
                  {[
                    { key: 'all', label: 'Alle Challenges', icon: '🔥', color: 'from-[#8BAE5A] to-[#B6C948]' },
                    { key: 'Fysiek', label: 'Fysiek', icon: '💪', color: 'from-[#FF6B6B] to-[#FF8E8E]' },
                    { key: 'Mentaal', label: 'Mentaal', icon: '🧠', color: 'from-[#4ECDC4] to-[#7EDDD6]' },
                    { key: 'Financieel', label: 'Financieel', icon: '💰', color: 'from-[#FFD93D] to-[#FFE55C]' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedCategory(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
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
                <div className="flex flex-col md:flex-row gap-3 mb-5">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="🔍 Zoek naar specifieke challenges..."
                      className="w-full bg-[#0F1419] border border-[#3A4D23]/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A] focus:ring-2 focus:ring-[#8BAE5A]/20 text-sm sm:text-base"
                    />
                  </div>
                  <div className="md:w-48">
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full bg-[#0F1419] border border-[#3A4D23]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#8BAE5A] focus:ring-2 focus:ring-[#8BAE5A]/20 text-sm sm:text-base"
                    >
                      <option value="all">Alle Niveaus</option>
                      <option value="easy">🟢 Makkelijk</option>
                      <option value="medium">🟡 Gemiddeld</option>
                      <option value="hard">🔴 Moeilijk</option>
                    </select>
                  </div>
                </div>

                {/* Challenge Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {getFilteredSuggestedChallenges().map((mission) => (
                    <div
                      key={mission.id}
                      className="group bg-gradient-to-br from-[#0F1419] to-[#181F17] border border-[#3A4D23]/30 rounded-2xl p-4 sm:p-5 hover:border-[#8BAE5A]/50 hover:shadow-xl hover:shadow-[#8BAE5A]/10 transition-colors duration-200"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{mission.icon}</span>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">{mission.title}</h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
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
                          <span className="text-sm text-[#FFD700] font-bold">+{mission.xp_reward} XP</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
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
                      <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2">{mission.description}</p>

                      {/* Action Button */}
                      {(() => {
                        const alreadyInList = challenges.some(c => c.title === mission.title);
                        const isAdded = alreadyInList || addedLibraryIds.has(mission.id);
                        const isLoading = addingLibraryIds.has(mission.id);
                        return (
                          <button
                            onClick={() => !isAdded && !isLoading && addSuggestedChallenge(mission)}
                            disabled={isAdded || isLoading}
                            className={`w-full font-bold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
                              isAdded
                                ? 'bg-[#2a2f28] text-gray-300 cursor-not-allowed border border-[#3A4D23]'
                                : 'bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] hover:from-[#B6C948] hover:to-[#8BAE5A] text-[#181F17]'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <span>✅</span>
                                <span>Toegevoegd</span>
                              </>
                            ) : isLoading ? (
                              <>
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-[#181F17] border-t-transparent rounded-full" />
                                <span>Toevoegen...</span>
                              </>
                            ) : (
                              <>
                                <span>⚔️</span>
                                <span>Challenge Aanvaarden</span>
                              </>
                            )}
                          </button>
                        );
                      })()}
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
              </>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && challengeToDelete && (
          <ModalBase
            isOpen={showDeleteConfirm}
            onClose={() => { setShowDeleteConfirm(false); setChallengeToDelete(null); }}
            className="bg-[#1d2a20] border border-[#3A4D23]/50 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-2">Challenge verwijderen?</h3>
            <p className="text-gray-300 mb-4">Weet je zeker dat je "{challengeToDelete?.title}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setChallengeToDelete(null); }}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Annuleren
              </button>
              <button
                onClick={() => deleteChallenge(challengeToDelete!.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
              >
                Verwijderen
              </button>
            </div>
          </ModalBase>
        )}
        
        {/* OnboardingV2Modal removed to prevent conflicts - handled by main dashboard */}
      </div>
      <OnboardingLoadingOverlay 
        show={showLoadingOverlay}
        text={loadingText}
        progress={loadingProgress}
      />
    </ClientLayout>
  );
} 