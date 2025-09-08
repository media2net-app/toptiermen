'use client';
import { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  CalendarIcon, 
  ClockIcon, 
  FireIcon,
  StarIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import AdminCard from '@/components/admin/AdminCard';
import AdminButton from '@/components/admin/AdminButton';
import Breadcrumb, { createBreadcrumbs, BREADCRUMB_CONFIGS } from '@/components/Breadcrumb';
import ChallengeDetailModal from './components/ChallengeDetailModal';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import toast from 'react-hot-toast';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  duration_days: number;
  points_reward: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  requirements: string[];
  rewards: string[];
  participants_count: number;
  completion_rate: number;
  created_at: string;
  updated_at: string;
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'weekly' | 'monthly' | 'special'>('all');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Onboarding state
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [showOnboardingStep5, setShowOnboardingStep5] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  
  const { user } = useSupabaseAuth();

  // Check onboarding status
  const checkOnboardingStatus = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/onboarding?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setOnboardingStatus(data);
        setShowOnboardingStep5(!data.onboarding_completed && data.current_step === 5);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  // Mock data for now - will be replaced with real data from database
  const mockChallenges: Challenge[] = [
    {
      id: '1',
      title: '30-Day Push-up Challenge',
      description: 'Doe elke dag push-ups en bouw je kracht op. Start met 10 en werk toe naar 50 per dag.',
      type: 'monthly',
      difficulty: 'medium',
      duration_days: 30,
      points_reward: 500,
      is_active: true,
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      requirements: ['Dagelijks push-ups doen', 'Foto uploaden van je progressie', 'Log je aantal push-ups'],
      rewards: ['500 punten', 'Push-up Master badge', 'Kracht boost in je profiel'],
      participants_count: 1247,
      completion_rate: 68,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Week van de Gezonde Maaltijden',
      description: 'Eet deze week alleen maar zelfgemaakte, gezonde maaltijden. Geen fastfood of bewerkte voeding.',
      type: 'weekly',
      difficulty: 'easy',
      duration_days: 7,
      points_reward: 150,
      is_active: true,
      start_date: '2024-01-15',
      end_date: '2024-01-22',
      requirements: ['7 dagen gezonde maaltijden', 'Foto van elke maaltijd', 'Recept delen'],
      rewards: ['150 punten', 'Healthy Eater badge', 'Voedingskennis boost'],
      participants_count: 892,
      completion_rate: 82,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '3',
      title: 'Iron Will Challenge',
      description: 'De ultieme test van discipline: 21 dagen zonder sociale media, suiker en klagen.',
      type: 'special',
      difficulty: 'hard',
      duration_days: 21,
      points_reward: 1000,
      is_active: true,
      start_date: '2024-02-01',
      end_date: '2024-02-22',
      requirements: ['Geen sociale media', 'Geen toegevoegde suikers', 'Geen klagen', 'Dagelijks reflectie'],
      rewards: ['1000 punten', 'Iron Will badge', 'Discipline Master titel', 'Exclusieve content toegang'],
      participants_count: 156,
      completion_rate: 23,
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z'
    },
    {
      id: '4',
      title: 'Morning Warrior Week',
      description: 'Start elke dag om 6:00 en doe een ochtendroutine. Transformeer je dag met vroege opstaan.',
      type: 'weekly',
      difficulty: 'medium',
      duration_days: 7,
      points_reward: 200,
      is_active: true,
      start_date: '2024-01-22',
      end_date: '2024-01-29',
      requirements: ['Elke dag om 6:00 opstaan', 'Ochtendroutine voltooien', 'Progressie bijhouden'],
      rewards: ['200 punten', 'Early Bird badge', 'Productiviteit boost'],
      participants_count: 634,
      completion_rate: 71,
      created_at: '2024-01-22T00:00:00Z',
      updated_at: '2024-01-22T00:00:00Z'
    },
    {
      id: '5',
      title: 'Hydration Hero Month',
      description: 'Drink elke dag 3 liter water en transformeer je gezondheid. Water is leven!',
      type: 'monthly',
      difficulty: 'easy',
      duration_days: 30,
      points_reward: 300,
      is_active: true,
      start_date: '2024-02-01',
      end_date: '2024-03-02',
      requirements: ['3 liter water per dag', 'Water intake loggen', 'Hydratietips delen'],
      rewards: ['300 punten', 'Hydration Hero badge', 'Gezondheid boost'],
      participants_count: 2156,
      completion_rate: 89,
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z'
    }
  ];

  useEffect(() => {
    if (user?.id) {
      checkOnboardingStatus();
    }
  }, [user?.id]);

  useEffect(() => {
    // Load challenges from database or use mock data
    const loadChallenges = async () => {
      try {
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading challenges:', error);
          // Fallback to mock data
          setChallenges(mockChallenges);
        } else {
          // Transform database data to match our interface
          const transformedChallenges = data.map(challenge => ({
            ...challenge,
            difficulty: challenge.difficulty || 'medium',
            requirements: challenge.requirements || [],
            rewards: challenge.rewards || [],
            participants_count: challenge.participants_count || 0,
            completion_rate: challenge.completion_rate || 0
          }));
          setChallenges(transformedChallenges.length > 0 ? transformedChallenges : mockChallenges);
        }
      } catch (error) {
        console.error('Error loading challenges:', error);
        // Fallback to mock data
        setChallenges(mockChallenges);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'all') return true;
    return challenge.type === activeTab;
  });

  const handleChallengeClick = (challenge: Challenge) => {
    if (showOnboardingStep5) {
      // During onboarding, select the challenge
      setSelectedChallengeId(challenge.id);
      toast.success(`Challenge "${challenge.title}" geselecteerd!`);
    } else {
      // Normal behavior - show detail modal
      setSelectedChallenge(challenge);
      setShowDetailModal(true);
    }
  };

  const handleStartChallenge = async (challengeId: string) => {
    // TODO: Implement challenge participation logic
    console.log('Starting challenge:', challengeId);
    // Close modal after starting
    setShowDetailModal(false);
    setSelectedChallenge(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'medium': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'hard': return 'bg-red-600/20 text-red-400 border-red-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weekly': return CalendarIcon;
      case 'monthly': return ClockIcon;
      case 'special': return StarIcon;
      default: return TrophyIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weekly': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'monthly': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'special': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-[#3A4D23] rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#232D1A] rounded-lg p-6">
                  <div className="h-6 bg-[#3A4D23] rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-[#3A4D23] rounded w-full mb-2"></div>
                  <div className="h-4 bg-[#3A4D23] rounded w-2/3 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-[#3A4D23] rounded w-16"></div>
                    <div className="h-6 bg-[#3A4D23] rounded w-20"></div>
                  </div>
                  <div className="h-10 bg-[#3A4D23] rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb items={createBreadcrumbs('Challenges', BREADCRUMB_CONFIGS.challenges.parent, BREADCRUMB_CONFIGS.challenges.parentHref)} />
          
          <div className="flex items-center gap-4 mt-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-xl flex items-center justify-center">
              <TrophyIcon className="w-6 h-6 text-[#181F17]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Challenges</h1>
              <p className="text-[#8BAE5A] mt-1">Test jezelf en verdien punten met uitdagende missies</p>
            </div>
          </div>
        </div>

        {/* Onboarding Progress - Step 5: Challenges */}
        {showOnboardingStep5 && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 border-2 border-[#8BAE5A] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl">🏆</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Onboarding Stap 5: Challenge Selecteren</h2>
                    <p className="text-[#8BAE5A] text-xs sm:text-sm">Kies een challenge om jezelf uit te dagen en punten te verdienen</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-[#FFD700]">5/6</div>
                  <div className="text-[#8BAE5A] text-xs sm:text-sm">Stappen voltooid</div>
                </div>
              </div>
              
              {!selectedChallengeId ? (
                <div className="bg-[#181F17]/80 rounded-xl p-4 border border-[#3A4D23]">
                  <p className="text-[#f0a14f] text-sm font-semibold mb-2">
                    ⚠️ Selecteer een challenge om door te gaan
                  </p>
                  <p className="text-gray-300 text-sm">
                    Kies een challenge die past bij je doelen en voorkeuren. Je kunt later altijd andere challenges proberen.
                  </p>
                </div>
              ) : (
                <div className="bg-[#8BAE5A]/20 rounded-xl p-4 border border-[#8BAE5A]">
                  <p className="text-[#8BAE5A] text-sm font-semibold mb-2">
                    ✅ Perfect! Je hebt een challenge geselecteerd
                  </p>
                  <p className="text-gray-300 text-sm mb-4">
                    Je kunt nu door naar de laatste stap van de onboarding.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        // Mark step 5 as completed
                        const response = await fetch('/api/onboarding', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            userId: user?.id,
                            step: 5,
                            action: 'complete_step',
                            selectedChallenge: selectedChallengeId
                          }),
                        });

                        if (response.ok) {
                          toast.success('Challenge opgeslagen! Doorsturen naar forum...');
                          // Navigate to specific forum topic for step 6 (forum introduction)
                          setTimeout(() => {
                            window.location.href = '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden';
                          }, 1500);
                        } else {
                          toast.error('Er is een fout opgetreden');
                        }
                      } catch (error) {
                        console.error('Error completing step:', error);
                        toast.error('Er is een fout opgetreden');
                      }
                    }}
                    className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#181F17] px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    Volgende Stap
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AdminCard>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{challenges.filter(c => c.type === 'weekly').length}</div>
                <div className="text-sm text-[#8BAE5A]">Wekelijkse Challenges</div>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{challenges.filter(c => c.type === 'monthly').length}</div>
                <div className="text-sm text-[#8BAE5A]">Maandelijkse Challenges</div>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{challenges.filter(c => c.type === 'special').length}</div>
                <div className="text-sm text-[#8BAE5A]">Speciale Challenges</div>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <FireIcon className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {challenges.reduce((sum, c) => sum + c.participants_count, 0).toLocaleString()}
                </div>
                <div className="text-sm text-[#8BAE5A]">Totaal Deelnemers</div>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'all', label: 'Alle Challenges', icon: TrophyIcon },
            { key: 'weekly', label: 'Wekelijks', icon: CalendarIcon },
            { key: 'monthly', label: 'Maandelijks', icon: ClockIcon },
            { key: 'special', label: 'Speciaal', icon: StarIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-[#8BAE5A] text-[#181F17]'
                    : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#3A4D23]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => {
            const TypeIcon = getTypeIcon(challenge.type);
            return (
              <AdminCard 
                key={challenge.id} 
                className={`hover:scale-105 transition-transform cursor-pointer ${
                  showOnboardingStep5 && selectedChallengeId === challenge.id
                    ? 'border-2 border-[#8BAE5A] bg-[#8BAE5A]/10'
                    : showOnboardingStep5
                    ? 'border-2 border-[#3A4D23] hover:border-[#8BAE5A]/50'
                    : ''
                }`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
                      <p className="text-[#8BAE5A] text-sm leading-relaxed">{challenge.description}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-lg flex items-center justify-center ml-4">
                      <TypeIcon className="w-5 h-5 text-[#181F17]" />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getTypeColor(challenge.type)}`}>
                      {challenge.type === 'weekly' ? 'Wekelijks' : 
                       challenge.type === 'monthly' ? 'Maandelijks' : 'Speciaal'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty === 'easy' ? 'Makkelijk' : 
                       challenge.difficulty === 'medium' ? 'Gemiddeld' : 'Moeilijk'}
                    </span>
                  </div>

                  {/* Duration & Points */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-[#8BAE5A]">
                      <ClockIcon className="w-4 h-4" />
                      {challenge.duration_days} dagen
                    </div>
                    <div className="flex items-center gap-1 text-[#B6C948] font-semibold">
                      <TrophyIcon className="w-4 h-4" />
                      {challenge.points_reward} punten
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="text-xs text-[#8BAE5A]">
                    <div>Start: {formatDate(challenge.start_date)}</div>
                    <div>Eind: {formatDate(challenge.end_date)}</div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-[#8BAE5A]">
                      {challenge.participants_count.toLocaleString()} deelnemers
                    </div>
                    <div className="text-[#B6C948]">
                      {challenge.completion_rate}% voltooid
                    </div>
                  </div>

                  {/* Requirements Preview */}
                  <div>
                    <div className="text-sm font-medium text-white mb-2">Vereisten:</div>
                    <div className="space-y-1">
                      {challenge.requirements.slice(0, 2).map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-[#8BAE5A]">
                          <CheckCircleIcon className="w-3 h-3 text-green-400 flex-shrink-0" />
                          {req}
                        </div>
                      ))}
                      {challenge.requirements.length > 2 && (
                        <div className="text-xs text-[#8BAE5A]/60">
                          +{challenge.requirements.length - 2} meer vereisten
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {showOnboardingStep5 ? (
                    <button
                      className={`w-full px-4 py-2 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${
                        selectedChallengeId === challenge.id
                          ? 'bg-[#8BAE5A] text-[#232D1A]'
                          : 'bg-[#3A4D23] text-white hover:bg-[#4A5D33]'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChallengeClick(challenge);
                      }}
                    >
                      {selectedChallengeId === challenge.id ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4" />
                          Geselecteerd
                        </>
                      ) : (
                        'Selecteer deze challenge'
                      )}
                    </button>
                  ) : (
                    <AdminButton
                      className="w-full"
                      variant="primary"
                      icon={<PlayIcon className="w-4 h-4" />}
                      onClick={() => handleChallengeClick(challenge)}
                    >
                      Bekijk Details
                    </AdminButton>
                  )}
                </div>
              </AdminCard>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <TrophyIcon className="w-16 h-16 text-[#3A4D23] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Geen challenges gevonden</h3>
            <p className="text-[#8BAE5A]">Er zijn momenteel geen {activeTab === 'all' ? '' : activeTab} challenges beschikbaar.</p>
          </div>
        )}
      </div>

      {/* Challenge Detail Modal */}
      <ChallengeDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedChallenge(null);
        }}
        challenge={selectedChallenge}
        onStartChallenge={handleStartChallenge}
      />
    </div>
  );
}