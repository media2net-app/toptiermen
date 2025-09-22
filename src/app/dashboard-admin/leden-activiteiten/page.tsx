'use client';

import { useState, useEffect, useRef } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/navigation';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  TrophyIcon,
  BookOpenIcon,
  FireIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  activity_type: 'challenge' | 'module' | 'lesson' | 'workout' | 'badge' | 'xp';
  title: string;
  description: string;
  xp_reward: number;
  date: string;
  time: string;
  category: string;
  icon: string;
}

interface ActivityStats {
  total: number;
  challenges: number;
  modules: number;
  lessons: number;
  workouts: number;
  badges: number;
  totalXP: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export default function LedenActiviteitenPage() {
  const { user, profile, loading } = useSupabaseAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const userSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simple admin check
  const isAdmin = user && profile && profile.role?.toLowerCase() === 'admin';

  // Redirect if not admin
  useEffect(() => {
    if (!loading && user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [loading, user, isAdmin, router]);

  // Fetch activities for selected date
  const fetchActivities = async (date: Date) => {
    try {
      setPageLoading(true);
      setError(null);
      
      const dateStr = date.toISOString().split('T')[0];
      let url = `/api/admin/member-activities?date=${dateStr}&view=${viewMode}`;
      
      // Add user filter if selected
      if (selectedUser) {
        url += `&userId=${selectedUser}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setActivities(data.activities || []);
        setStats(data.stats || null);
      } else {
        setError(data.error || 'Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to fetch activities');
    } finally {
      setPageLoading(false);
    }
  };

  // Fetch users for filter dropdown
  const fetchUsers = async (search = '') => {
    try {
      setUsersLoading(true);
      const response = await fetch(`/api/admin/member-activities/users?search=${encodeURIComponent(search)}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load data when admin is confirmed
  useEffect(() => {
    if (isAdmin) {
      fetchActivities(selectedDate);
      fetchUsers(); // Load users for filter
    }
  }, [isAdmin, selectedDate, viewMode, selectedUser]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'challenge': return '🏆';
      case 'module': return '📚';
      case 'lesson': return '🎓';
      case 'workout': return '💪';
      case 'badge': return '🏅';
      case 'xp': return '⭐';
      default: return '📝';
    }
  };

  // Get activity color
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'challenge': return 'text-[#f0a14f]';
      case 'module': return 'text-[#8BAE5A]';
      case 'lesson': return 'text-[#B6C948]';
      case 'workout': return 'text-[#FF6B6B]';
      case 'badge': return 'text-[#FFD700]';
      case 'xp': return 'text-[#4ECDC4]';
      default: return 'text-gray-400';
    }
  };

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Laden...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⛔ Toegang Geweigerd</div>
          <p className="text-gray-400">Je hebt geen admin rechten voor deze pagina.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Leden Activiteiten</h1>
              <p className="text-gray-400 mt-2">Overzicht van alle activiteiten van leden</p>
            </div>
            <button
              onClick={() => fetchActivities(selectedDate)}
              className="px-4 py-2 bg-[#8BAE5A] text-[#0A0F0A] rounded-lg hover:bg-[#7A9D4A] transition-colors"
            >
              🔄 Vernieuwen
            </button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 bg-[#3A4D23] rounded-lg hover:bg-[#8BAE5A] transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-white" />
              </button>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">{formatDate(selectedDate)}</h2>
                <p className="text-sm text-gray-400">
                  {viewMode === 'day' ? 'Dagelijkse activiteiten' : 
                   viewMode === 'week' ? 'Wekelijkse activiteiten' : 'Maandelijkse activiteiten'}
                </p>
              </div>
              
              <button
                onClick={() => navigateDate('next')}
                className="p-2 bg-[#3A4D23] rounded-lg hover:bg-[#8BAE5A] transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* View Mode Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'day'
                    ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                    : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-[#0A0F0A]'
                }`}
              >
                Dag
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                    : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-[#0A0F0A]'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                    : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-[#0A0F0A]'
                }`}
              >
                Maand
              </button>
            </div>
          </div>

          {/* Quick Date Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#8BAE5A] hover:text-[#0A0F0A] transition-colors text-sm"
            >
              Vandaag
            </button>
            <button
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday);
              }}
              className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#8BAE5A] hover:text-[#0A0F0A] transition-colors text-sm"
            >
              Gisteren
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(tomorrow);
              }}
              className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#8BAE5A] hover:text-[#0A0F0A] transition-colors text-sm"
            >
              Morgen
            </button>
          </div>
        </div>

        {/* User Filter */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* User Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                Zoek gebruiker
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Typ naam of email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    // Debounce search
                    if (userSearchTimeoutRef.current) {
                      clearTimeout(userSearchTimeoutRef.current);
                    }
                    userSearchTimeoutRef.current = setTimeout(() => {
                      fetchUsers(e.target.value);
                    }, 300);
                  }}
                  className="w-full px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
                />
                {usersLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
                  </div>
                )}
              </div>
            </div>

            {/* User Dropdown */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                Filter op gebruiker
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
              >
                <option value="">Alle gebruikers</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filter */}
            {selectedUser && (
              <div className="flex items-end">
                <button
                  onClick={() => setSelectedUser('')}
                  className="px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#8BAE5A] hover:text-[#0A0F0A] transition-colors"
                >
                  Filter wissen
                </button>
              </div>
            )}
          </div>

          {/* Filter Status */}
          {selectedUser && (
            <div className="mt-4 p-3 bg-[#3A4D23] rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-[#8BAE5A] text-sm">Filter actief:</span>
                <span className="text-white font-medium">
                  {users.find(u => u.id === selectedUser)?.full_name || users.find(u => u.id === selectedUser)?.email}
                </span>
                <button
                  onClick={() => setSelectedUser('')}
                  className="ml-auto text-[#8BAE5A] hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
                <div className="text-gray-400">Totaal Activiteiten</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#f0a14f]/10 to-[#FFD700]/10 border border-[#f0a14f] rounded-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#f0a14f] mb-2">{stats.challenges}</div>
                <div className="text-[#f0a14f]">Challenges</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#B6C948]/10 border border-[#8BAE5A] rounded-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#8BAE5A] mb-2">{stats.modules + stats.lessons}</div>
                <div className="text-[#8BAE5A]">Academy</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#FF6B6B]/10 to-[#FF8E8E]/10 border border-[#FF6B6B] rounded-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FF6B6B] mb-2">{stats.workouts}</div>
                <div className="text-[#FF6B6B]">Workouts</div>
              </div>
            </div>
          </div>
        )}

        {/* Activities List */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#3A4D23]">
            <h3 className="text-xl font-bold text-white">Activiteiten Log</h3>
            <p className="text-gray-400 text-sm mt-1">
              {activities.length} activiteiten gevonden voor {formatDate(selectedDate)}
              {selectedUser && (
                <span className="text-[#8BAE5A] ml-2">
                  • Gefilterd op: {users.find(u => u.id === selectedUser)?.full_name || users.find(u => u.id === selectedUser)?.email}
                </span>
              )}
            </p>
          </div>

          {pageLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
              <p className="text-[#8BAE5A]">Activiteiten laden...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-400 text-xl mb-4">❌ Fout</div>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => fetchActivities(selectedDate)}
                className="px-4 py-2 bg-[#8BAE5A] text-[#0A0F0A] rounded-lg hover:bg-[#7A9D4A] transition-colors"
              >
                Opnieuw Proberen
              </button>
            </div>
          ) : activities.length > 0 ? (
            <div className="divide-y divide-[#3A4D23]">
              {activities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-[#181F17]/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Activity Icon */}
                    <div className="w-12 h-12 bg-[#3A4D23] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{getActivityIcon(activity.activity_type)}</span>
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white text-lg">{activity.title}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActivityColor(activity.activity_type)} bg-[#3A4D23]`}>
                          {activity.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">{activity.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-4 h-4" />
                          <span>{activity.user_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{activity.time}</span>
                        </div>
                        {activity.xp_reward > 0 && (
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4 text-[#FFD700]" />
                            <span className="text-[#FFD700] font-semibold">+{activity.xp_reward} XP</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h4 className="text-lg font-semibold text-white mb-2">Geen activiteiten</h4>
              <p className="text-gray-400">
                Er zijn geen activiteiten gevonden voor {formatDate(selectedDate)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
