'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { toast } from 'react-hot-toast';
import ClientLayout from '@/app/components/ClientLayout';

interface Mission {
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

interface SuggestedMission {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Summary {
  completedToday: number;
  totalToday: number;
  dailyStreak: number;
}

// Mission Library with suggested missions
const MISSION_LIBRARY: SuggestedMission[] = [
  // Fitness & Health
  {
    id: 'fitness-1',
    title: '30 minuten wandelen',
    category: 'Fitness & Gezondheid',
    icon: '🚶‍♂️',
    description: 'Dagelijkse wandeling voor cardiovasculaire gezondheid',
    xp_reward: 50,
    difficulty: 'easy'
  },
  {
    id: 'fitness-2',
    title: '20 push-ups',
    category: 'Fitness & Gezondheid',
    icon: '💪',
    description: 'Versterk je bovenlichaam met push-ups',
    xp_reward: 75,
    difficulty: 'medium'
  },
  {
    id: 'fitness-3',
    title: '10 minuten stretchen',
    category: 'Fitness & Gezondheid',
    icon: '🧘‍♂️',
    description: 'Verbeter je flexibiliteit en herstel',
    xp_reward: 40,
    difficulty: 'easy'
  },
  {
    id: 'fitness-4',
    title: '30 squats',
    category: 'Fitness & Gezondheid',
    icon: '🦵',
    description: 'Versterk je benen en core',
    xp_reward: 60,
    difficulty: 'medium'
  },
  {
    id: 'fitness-5',
    title: '2 liter water drinken',
    category: 'Fitness & Gezondheid',
    icon: '💧',
    description: 'Blijf gehydrateerd voor optimale prestaties',
    xp_reward: 30,
    difficulty: 'easy'
  },

  // Mind & Focus
  {
    id: 'mind-1',
    title: '10 minuten mediteren',
    category: 'Mind & Focus',
    icon: '🧘‍♀️',
    description: 'Verbeter je mentale helderheid en focus',
    xp_reward: 80,
    difficulty: 'medium'
  },
  {
    id: 'mind-2',
    title: '30 minuten lezen',
    category: 'Mind & Focus',
    icon: '📚',
    description: 'Stimuleer je brein met dagelijkse leesroutine',
    xp_reward: 70,
    difficulty: 'medium'
  },
  {
    id: 'mind-3',
    title: 'Journaling',
    category: 'Mind & Focus',
    icon: '✍️',
    description: 'Schrijf je gedachten en doelen op',
    xp_reward: 45,
    difficulty: 'easy'
  },
  {
    id: 'mind-4',
    title: 'Gratitude practice',
    category: 'Mind & Focus',
    icon: '🙏',
    description: 'Schrijf 3 dingen op waar je dankbaar voor bent',
    xp_reward: 50,
    difficulty: 'easy'
  },
  {
    id: 'mind-5',
    title: 'Geen telefoon 1 uur voor bed',
    category: 'Mind & Focus',
    icon: '📱',
    description: 'Verbeter je slaapkwaliteit',
    xp_reward: 60,
    difficulty: 'hard'
  },

  // Finance & Business
  {
    id: 'finance-1',
    title: 'Budget bijhouden',
    category: 'Finance & Business',
    icon: '💰',
    description: 'Track je dagelijkse uitgaven',
    xp_reward: 55,
    difficulty: 'medium'
  },
  {
    id: 'finance-2',
    title: '15 minuten leren over investeren',
    category: 'Finance & Business',
    icon: '📈',
    description: 'Verbreed je financiële kennis',
    xp_reward: 75,
    difficulty: 'medium'
  },
  {
    id: 'finance-3',
    title: 'Netwerken',
    category: 'Finance & Business',
    icon: '🤝',
    description: 'Maak contact met 1 nieuwe persoon',
    xp_reward: 65,
    difficulty: 'medium'
  },
  {
    id: 'finance-4',
    title: 'Side hustle werk',
    category: 'Finance & Business',
    icon: '💼',
    description: 'Besteed 30 minuten aan je side project',
    xp_reward: 85,
    difficulty: 'hard'
  },
  {
    id: 'finance-5',
    title: 'Financiële doelen review',
    category: 'Finance & Business',
    icon: '🎯',
    description: 'Evalueer en update je financiële doelen',
    xp_reward: 70,
    difficulty: 'medium'
  },

  // Brotherhood & Social
  {
    id: 'social-1',
    title: 'Forum post maken',
    category: 'Brotherhood & Social',
    icon: '💬',
    description: 'Deel je ervaringen met de community',
    xp_reward: 60,
    difficulty: 'medium'
  },
  {
    id: 'social-2',
    title: 'Iemand helpen',
    category: 'Brotherhood & Social',
    icon: '🤲',
    description: 'Help een medelid of vriend',
    xp_reward: 80,
    difficulty: 'medium'
  },
  {
    id: 'social-3',
    title: 'Gratitude uitdrukken',
    category: 'Brotherhood & Social',
    icon: '❤️',
    description: 'Dank iemand voor hun steun',
    xp_reward: 50,
    difficulty: 'easy'
  },
  {
    id: 'social-4',
    title: 'Mentorship moment',
    category: 'Brotherhood & Social',
    icon: '👨‍🏫',
    description: 'Geef of ontvang advies van een mentor',
    xp_reward: 90,
    difficulty: 'hard'
  },
  {
    id: 'social-5',
    title: 'Community challenge',
    category: 'Brotherhood & Social',
    icon: '🏆',
    description: 'Doe mee aan een community uitdaging',
    xp_reward: 100,
    difficulty: 'hard'
  },

  // Personal Development
  {
    id: 'personal-1',
    title: 'Nieuwe vaardigheid leren',
    category: 'Persoonlijke Ontwikkeling',
    icon: '🎓',
    description: 'Besteed 20 minuten aan een nieuwe vaardigheid',
    xp_reward: 75,
    difficulty: 'medium'
  },
  {
    id: 'personal-2',
    title: 'Comfort zone verlaten',
    category: 'Persoonlijke Ontwikkeling',
    icon: '🚀',
    description: 'Doe iets wat je normaal niet zou doen',
    xp_reward: 95,
    difficulty: 'hard'
  },
  {
    id: 'personal-3',
    title: 'Doelen herzien',
    category: 'Persoonlijke Ontwikkeling',
    icon: '🎯',
    description: 'Evalueer en update je persoonlijke doelen',
    xp_reward: 65,
    difficulty: 'medium'
  },
  {
    id: 'personal-4',
    title: 'Feedback vragen',
    category: 'Persoonlijke Ontwikkeling',
    icon: '📝',
    description: 'Vraag feedback van iemand die je vertrouwt',
    xp_reward: 70,
    difficulty: 'medium'
  },
  {
    id: 'personal-5',
    title: 'Reflectie sessie',
    category: 'Persoonlijke Ontwikkeling',
    icon: '🤔',
    description: 'Neem 15 minuten om te reflecteren op je dag',
    xp_reward: 55,
    difficulty: 'easy'
  }
];

export default function MijnMissiesPage() {
  const { user } = useSupabaseAuth();
  const { isOnboarding, currentStep, completeCurrentStep } = useOnboarding();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [summary, setSummary] = useState<Summary>({ completedToday: 0, totalToday: 0, dailyStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMission, setNewMission] = useState({ title: '', type: 'Dagelijks' });
  const [showDailyCompletion, setShowDailyCompletion] = useState(false);
  const [showAlmostCompleted, setShowAlmostCompleted] = useState(false);
  const [hasDismissedDaily, setHasDismissedDaily] = useState(false);
  const [hasDismissedAlmost, setHasDismissedAlmost] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);
  
  // Mission Library state
  const [showMissionLibrary, setShowMissionLibrary] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Onboarding status
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [showOnboardingStep3, setShowOnboardingStep3] = useState(false);

  // Helper function to check if mission was completed today
  const isMissionCompletedToday = (completionDate: string | null | undefined): boolean => {
    if (!completionDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return completionDate === today;
  };

  // Filter suggested missions based on selected criteria
  const getFilteredSuggestedMissions = () => {
    return MISSION_LIBRARY.filter(mission => {
      const matchesCategory = selectedCategory === 'all' || mission.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || mission.difficulty === selectedDifficulty;
      const matchesSearch = mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mission.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  };

  // Get unique categories for filter
  const getCategories = () => {
    const categories = [...new Set(MISSION_LIBRARY.map(mission => mission.category))];
    return categories.sort();
  };

  // Add suggested mission to user's missions
  const addSuggestedMission = async (suggestedMission: SuggestedMission) => {
    if (!user?.id) return;

    const newMission = {
      title: suggestedMission.title,
      type: 'Dagelijks',
      category: suggestedMission.category,
      icon: suggestedMission.icon,
      xp_reward: suggestedMission.xp_reward
    };

    try {
      const response = await fetch('/api/missions-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'create',
          mission: newMission
        }),
      });

      if (response.ok) {
        // Reload missions to show the new one
        const updatedResponse = await fetch(`/api/missions-simple?userId=${user.id}`);
        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          const updatedMissions = data.missions.map((mission: Mission) => ({
            ...mission,
            done: mission.type === 'Dagelijks' 
              ? isMissionCompletedToday(mission.last_completion_date)
              : mission.done
          }));
          setMissions(updatedMissions);
          setSummary(data.summary);
        }
        
        toast.success(`Uitdaging "${suggestedMission.title}" toegevoegd!`);
        setShowMissionLibrary(false);
      } else {
        throw new Error('Failed to add mission');
      }
    } catch (error) {
      console.error('Error adding suggested mission:', error);
      toast.error('Er is een fout opgetreden bij het toevoegen van de uitdaging.');
    }
  };

  // Check onboarding status
  useEffect(() => {
    if (!user?.id) return;

    async function checkOnboardingStatus() {
      try {
        const response = await fetch(`/api/onboarding?userId=${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setOnboardingStatus(data);
          
          // Only show onboarding step 3 if onboarding is not completed and user is on step 2 (missions step)
          setShowOnboardingStep3(!data.onboarding_completed && data.current_step === 2);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    }

    checkOnboardingStatus();
  }, [user?.id]);

  // Load missions
  useEffect(() => {
    if (!user?.id) return;

    async function loadMissions() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/missions-simple?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to load missions');
        }

        const data = await response.json();
        
        // Add created_at to missions that don't have it and update daily tracking
        const updatedMissions = data.missions.map((mission: Mission, index: number) => {
          let missionWithDate = mission;
          
          // Add created_at if missing
          if (!mission.created_at) {
            // For existing missions without created_at, use a default date
            // Most missions were added yesterday, some today
            const isRecent = index < 2; // First 2 missions are from today
            const defaultDate = isRecent ? new Date() : new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
            missionWithDate = {
              ...mission,
              created_at: defaultDate.toISOString()
            };
          }
          
          // Update daily tracking
          return {
            ...missionWithDate,
            done: mission.type === 'Dagelijks' 
              ? isMissionCompletedToday(mission.last_completion_date)
              : mission.done
          };
        });

        setMissions(updatedMissions);
        setSummary(data.summary);
      } catch (err) {
        console.error('Error loading missions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load missions');
      } finally {
        setLoading(false);
      }
    }

    loadMissions();
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

      // Show toast notification when all missions are completed
      if (allDailyCompleted && !wasCompletedBefore && !loading) {
        toast.success('🏆 Alle dagelijkse uitdagingen volbracht! Je bent een echte Top Tier Man! Morgen staan er weer nieuwe uitdagingen klaar! 💪', {
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
        toast('🔥 Bijna alle uitdagingen volbracht! Nog even doorzetten voor de perfecte dag! 💪', {
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

  // Toggle mission completion
  const toggleMission = async (missionId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/missions-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          userId: user.id,
          missionId: missionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle mission');
      }

      const data = await response.json();

      if (data.success) {
        // Update missions state
        setMissions(prevMissions => 
          prevMissions.map(mission => {
            if (mission.id === missionId) {
              const isCompleted = data.completed;
              return {
                ...mission,
                done: isCompleted,
                last_completion_date: data.completionDate || null
              };
            }
            return mission;
          })
        );

        // Update summary
        if (data.completed) {
          setSummary(prev => ({
            ...prev,
            completedToday: prev.completedToday + 1
          }));
        } else {
          setSummary(prev => ({
            ...prev,
            completedToday: Math.max(0, prev.completedToday - 1)
          }));
        }

        // Show success message
        if (data.xpEarned > 0) {
          toast.success(`🎉 ${data.message || `Uitdaging voltooid! +${data.xpEarned} XP verdiend!`}`);
        } else if (data.xpEarned < 0) {
          toast(`Uitdaging ongedaan gemaakt. ${Math.abs(data.xpEarned)} XP afgetrokken.`);
        }
      }
    } catch (err) {
      console.error('Error toggling mission:', err);
      toast.error('Fout bij het voltooien van de uitdaging');
    }
  };

  // Add new mission
  const addMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newMission.title.trim()) return;

    try {
      const response = await fetch('/api/missions-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          userId: user.id,
          title: newMission.title,
          type: newMission.type
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create mission');
      }

      const data = await response.json();

      if (data.success) {
                // Add the new mission to the list
        const newMissionData = data.mission;
        setMissions(prev => [...prev, newMissionData]);

        // Update summary to include the new daily mission
        if (newMissionData.type === 'Dagelijks') {
          setSummary(prev => ({
            ...prev,
            totalToday: prev.totalToday + 1
          }));
        }
        
        setNewMission({ title: '', type: 'Dagelijks' });
        toast.success(data.message || 'Uitdaging toegevoegd!');
      }
    } catch (err) {
      console.error('Error creating mission:', err);
      toast.error('Fout bij het toevoegen van de uitdaging');
    }
  };

  // Delete mission
  const deleteMission = async (missionId: string) => {
    if (!user?.id) return;

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
        // Remove mission from state
        setMissions(prev => prev.filter(mission => mission.id !== missionId));
        
        // Update summary if it was a daily mission
        if (missionToDelete?.type === 'Dagelijks') {
          setSummary(prev => ({
            ...prev,
            totalToday: Math.max(0, prev.totalToday - 1),
            completedToday: missionToDelete.done ? Math.max(0, prev.completedToday - 1) : prev.completedToday
          }));
        }
        
        setShowDeleteConfirm(false);
        setMissionToDelete(null);
        toast.success(data.message || 'Uitdaging succesvol verwijderd! 💪');
      }
    } catch (err) {
      console.error('Error deleting mission:', err);
      toast.error('Fout bij het verwijderen van de uitdaging');
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (mission: Mission) => {
    setMissionToDelete(mission);
    setShowDeleteConfirm(true);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteConfirm) {
        setShowDeleteConfirm(false);
        setMissionToDelete(null);
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

  // Filter missions
  const pendingMissions = missions.filter(m => !m.done);
  const completedMissions = missions.filter(m => m.done);

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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">Mijn Uitdagingen</h1>
        <p className="text-[#8BAE5A] text-sm sm:text-lg mb-6 sm:mb-8">Voltooi dagelijkse uitdagingen en verdien XP</p>

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

        {/* Onboarding Progress - Step 3: Missions */}
        {showOnboardingStep3 && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 border-2 border-[#8BAE5A] rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">🔥</span>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Onboarding Stap 3: Uitdagingen Selecteren</h2>
                  <p className="text-[#8BAE5A] text-xs sm:text-sm">Selecteer minimaal 3 uitdagingen om door te gaan</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-[#FFD700]">{missions.length}/3</div>
                <div className="text-[#8BAE5A] text-xs sm:text-sm">Uitdagingen geselecteerd</div>
              </div>
            </div>
            
            {missions.length < 3 ? (
              <div className="bg-[#181F17]/80 rounded-xl p-3 sm:p-4 border border-[#3A4D23]">
                <p className="text-[#f0a14f] text-xs sm:text-sm font-semibold mb-2">
                  ⚠️ Je hebt nog {3 - missions.length} uitdaging{3 - missions.length !== 1 ? 'en' : ''} nodig
                </p>
                <p className="text-gray-300 text-xs sm:text-sm">
                  Voeg nog {3 - missions.length} uitdaging{3 - missions.length !== 1 ? 'en' : ''} toe om door te gaan naar de volgende stap van de onboarding.
                </p>
              </div>
            ) : (
              <div className="bg-[#8BAE5A]/20 rounded-xl p-3 sm:p-4 border border-[#8BAE5A]">
                <p className="text-[#8BAE5A] text-xs sm:text-sm font-semibold mb-2">
                  ✅ Perfect! Je hebt {missions.length} uitdagingen geselecteerd
                </p>
                <p className="text-gray-300 text-xs sm:text-sm mb-4">
                  Je kunt nu door naar de volgende stap van de onboarding.
                </p>
                <button
                  onClick={async () => {
                    try {
                      // Mark step 3 as completed
                      const response = await fetch('/api/onboarding', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          userId: user?.id,
                          step: 2,
                          action: 'complete_step',
                          selectedMissions: missions.map(m => m.id)
                        }),
                      });

                      if (response.ok) {
                        toast.success('Missies opgeslagen! Doorsturen naar trainingsschemas...');
                        // Navigate directly to training schemas
                        setTimeout(() => {
                          window.location.href = '/dashboard/trainingsschemas';
                        }, 1500);
                      } else {
                        toast.error('Er is een fout opgetreden');
                      }
                    } catch (error) {
                      console.error('Error completing missions step:', error);
                      toast.error('Er is een fout opgetreden');
                    }
                  }}
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-[#A6C97B] hover:to-[#FFE55C] transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
                >
                  <span>Volgende Stap</span>
                  <span>→</span>
                </button>
              </div>
            )}
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
                  Alle Dagelijkse Missies Volbracht!
                </h2>
                <span className="text-4xl ml-3">🏆</span>
              </div>
              <p className="text-[#8BAE5A] text-lg mb-4 font-semibold">
                Je bent een echte Top Tier Man! 💪
              </p>
              <div className="bg-[#181F17]/80 rounded-xl p-4 mb-4">
                <p className="text-white text-sm leading-relaxed">
                  <strong>Gefeliciteerd!</strong> Je hebt vandaag alle dagelijkse missies succesvol afgerond. 
                  Dit toont aan dat je de discipline en doorzettingsvermogen hebt van een echte leider. 
                  Blijf deze momentum vasthouden en blijf jezelf elke dag uitdagen.
                </p>
              </div>
              <div className="bg-[#232D1A]/80 rounded-xl p-4 border border-[#3A4D23]">
                <p className="text-[#8BAE5A] text-sm font-semibold">
                  🌅 <strong>Morgen staan er weer nieuwe uitdagingen voor je klaar!</strong> 
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
                  Bijna Alle Missies Volbracht!
                </h2>
                <span className="text-4xl ml-3">🔥</span>
              </div>
              <p className="text-[#f0a14f] text-lg mb-4 font-semibold">
                Nog even doorzetten voor de perfecte dag! 💪
              </p>
              <div className="bg-[#181F17]/80 rounded-xl p-4 mb-4">
                <p className="text-white text-sm leading-relaxed">
                  <strong>Fantastisch werk!</strong> Je hebt al {summary.completedToday} van de {summary.totalToday} dagelijkse missies volbracht. 
                  Je bent zo dichtbij een perfecte dag! Blijf gefocust en voltooi die laatste missie om jezelf te bewijzen dat je een echte Top Tier Man bent.
                </p>
              </div>
              <div className="bg-[#232D1A]/80 rounded-xl p-4 border border-[#3A4D23]">
                <p className="text-[#f0a14f] text-sm font-semibold">
                  ⚡ <strong>Die laatste missie maakt het verschil!</strong> 
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

        {/* Add New Mission */}
        <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Nieuwe Missie Toevoegen</h2>
            <button
              onClick={() => setShowMissionLibrary(!showMissionLibrary)}
              className="bg-gradient-to-r from-[#f0a14f] to-[#e0903f] hover:from-[#e0903f] hover:to-[#d0802f] text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-lg">📚</span>
              {showMissionLibrary ? 'Sluit Bibliotheek' : 'Missie Bibliotheek'}
            </button>
          </div>
          
          <form onSubmit={addMission} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newMission.title}
              onChange={(e) => setNewMission(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Missie titel..."
              className="flex-1 bg-[#0F1419] border border-[#3A4D23]/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
            />
            <select
              value={newMission.type}
              onChange={(e) => setNewMission(prev => ({ ...prev, type: e.target.value }))}
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

        {/* Mission Library */}
        {showMissionLibrary && (
          <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">📚 Missie Bibliotheek</h2>
            <p className="text-gray-400 mb-6">Kies uit voorgestelde missies van verschillende categorieën</p>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#8BAE5A] mb-2">Zoeken</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Zoek missies..."
                  className="w-full bg-[#0F1419] border border-[#3A4D23]/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8BAE5A] mb-2">Categorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#0F1419] border border-[#3A4D23]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8BAE5A]"
                >
                  <option value="all">Alle Categorieën</option>
                  {getCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8BAE5A] mb-2">Moeilijkheid</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-[#0F1419] border border-[#3A4D23]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8BAE5A]"
                >
                  <option value="all">Alle Niveaus</option>
                  <option value="easy">Makkelijk</option>
                  <option value="medium">Gemiddeld</option>
                  <option value="hard">Moeilijk</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                  className="w-full bg-[#3A4D23] text-[#8BAE5A] px-4 py-2 rounded-lg hover:bg-[#4A5D33] transition-colors duration-200"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Mission Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredSuggestedMissions().map((mission) => (
                <div
                  key={mission.id}
                  className="bg-[#0F1419] border border-[#3A4D23]/30 rounded-xl p-4 hover:border-[#8BAE5A]/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{mission.icon}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#FFD700] font-semibold">+{mission.xp_reward} XP</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        mission.difficulty === 'easy' ? 'bg-green-600/20 text-green-400' :
                        mission.difficulty === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {mission.difficulty === 'easy' ? 'Makkelijk' :
                         mission.difficulty === 'medium' ? 'Gemiddeld' : 'Moeilijk'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{mission.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{mission.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8BAE5A] bg-[#8BAE5A]/10 px-2 py-1 rounded-full">
                      {mission.category}
                    </span>
                    <button
                      onClick={() => addSuggestedMission(mission)}
                      className="bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] hover:from-[#7A9D4A] hover:to-[#5A7D2A] text-white font-semibold px-3 py-1 rounded-lg transition-all duration-200 text-sm"
                    >
                      Toevoegen
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {getFilteredSuggestedMissions().length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🔍</span>
                <p className="text-gray-400">Geen missies gevonden met de huidige filters</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                  className="mt-4 bg-[#3A4D23] text-[#8BAE5A] px-4 py-2 rounded-lg hover:bg-[#4A5D33] transition-colors duration-200"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* TO DO Missions */}
        {pendingMissions.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Te Doen</h2>
            <div className="space-y-3 sm:space-y-4">
              {pendingMissions.map((mission) => (
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
                          onClick={() => toggleMission(mission.id)}
                          className="bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] hover:from-[#7A9D4A] hover:to-[#5A7D2A] text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                        >
                          Voltooien
                        </button>
                        <button
                          onClick={() => handleDeleteClick(mission)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                          title="Verwijder missie"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Missions */}
        {completedMissions.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Voltooid</h2>
            <div className="space-y-3 sm:space-y-4">
              {completedMissions.map((mission) => (
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
                          onClick={() => toggleMission(mission.id)}
                          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                        >
                          Ongedaan
                        </button>
                        <button
                          onClick={() => handleDeleteClick(mission)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                          title="Verwijder missie"
                        >
                          🗑️
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
        {missions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">Geen missies gevonden</h3>
            <p className="text-gray-400">Voeg je eerste missie toe om te beginnen!</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && missionToDelete && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(4px)' }}
            onClick={() => {
              setShowDeleteConfirm(false);
              setMissionToDelete(null);
            }}
          >
            <div 
              className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border-2 border-red-600 rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-[10000] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">⚔️</div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Missie Verwijderen
                </h2>
                <div className="bg-[#0F1419]/80 rounded-xl p-4 mb-6 border border-[#3A4D23]">
                  <p className="text-white text-sm leading-relaxed mb-3">
                    <strong>Top Tier Man,</strong> ben je zeker dat je deze missie wilt verwijderen?
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
                    Zorg ervoor dat je deze missie niet meer nodig hebt voor je groei.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setMissionToDelete(null);
                    }}
                    className="flex-1 bg-[#3A4D23] text-[#8BAE5A] px-6 py-3 rounded-lg hover:bg-[#8BAE5A] hover:text-white transition-colors duration-300 font-semibold"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={() => deleteMission(missionToDelete.id)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg transition-all duration-300 font-semibold"
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 