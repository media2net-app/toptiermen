'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  UserIcon, 
  ChartBarIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  onboardingCompleted: boolean;
  currentStep: number;
  mainGoal: string | null;
  status: string;
}

interface Statistics {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export default function OnboardingOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const fetchOnboardingStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/onboarding-status');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setStatistics(data.statistics);
      } else {
        setError(data.error || 'Failed to fetch onboarding status');
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      setError('Failed to fetch onboarding status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOnboardingStatus();
    }
  }, [user]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'completed' && user.onboardingCompleted) ||
      (filterStatus === 'pending' && !user.onboardingCompleted);
    
    return matchesSearch && matchesFilter;
  });

  const getStepLabel = (step: number, onboardingCompleted: boolean = false) => {
    if (onboardingCompleted) {
      return '✅ Voltooid';
    }
    
    switch (step) {
      case 0: return 'Welkom Video';
      case 1: return 'Doel Omschrijven';
      case 2: return 'Missies Selecteren';
      case 3: return 'Trainingsschema';
      case 4: return 'Voedingsplan';
      case 5: return 'Forum Introductie';
      case 6: return 'Forum Introductie'; // Stap 6 is nog steeds Forum Introductie
      default: return `Stap ${step}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⛔ Toegang Geweigerd</div>
          <p className="text-gray-400">Je hebt geen toegang tot deze pagina.</p>
        </div>
      </div>
    );
  }

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

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ Fout</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchOnboardingStatus}
            className="px-4 py-2 bg-[#8BAE5A] text-[#0A0F0A] rounded-lg hover:bg-[#7A9D4A] transition-colors"
          >
            Opnieuw Proberen
          </button>
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
            <h1 className="text-3xl font-bold text-white">Onboarding Overzicht</h1>
            <button
              onClick={fetchOnboardingStatus}
              className="px-4 py-2 bg-[#8BAE5A] text-[#0A0F0A] rounded-lg hover:bg-[#7A9D4A] transition-colors flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Vernieuwen
            </button>
          </div>
          <p className="text-gray-400">Overzicht van alle gebruikers en hun onboarding status</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Totaal Gebruikers</p>
                  <p className="text-2xl font-bold text-white">{statistics.total}</p>
                </div>
                <UserIcon className="w-8 h-8 text-[#8BAE5A]" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 border border-[#8BAE5A] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#8BAE5A] text-sm">Onboarding Voltooid</p>
                  <p className="text-2xl font-bold text-[#8BAE5A]">{statistics.completed}</p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-[#8BAE5A]" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#f0a14f]/10 to-[#FFD700]/10 border border-[#f0a14f] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#f0a14f] text-sm">In Progress</p>
                  <p className="text-2xl font-bold text-[#f0a14f]">{statistics.pending}</p>
                </div>
                <ClockIcon className="w-8 h-8 text-[#f0a14f]" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Voltooiingspercentage</p>
                  <p className="text-2xl font-bold text-white">{statistics.completionRate}%</p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-[#8BAE5A]" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Zoek op email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-[#8BAE5A] text-[#0A0F0A]' 
                    : 'bg-[#181F17] text-gray-400 hover:bg-[#3A4D23]'
                }`}
              >
                Alle ({users.length})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'completed' 
                    ? 'bg-[#8BAE5A] text-[#0A0F0A]' 
                    : 'bg-[#181F17] text-gray-400 hover:bg-[#3A4D23]'
                }`}
              >
                Voltooid ({users.filter(u => u.onboardingCompleted).length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'pending' 
                    ? 'bg-[#8BAE5A] text-[#0A0F0A]' 
                    : 'bg-[#181F17] text-gray-400 hover:bg-[#3A4D23]'
                }`}
              >
                In Progress ({users.filter(u => !u.onboardingCompleted).length})
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#181F17] border-b border-[#3A4D23]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Gebruiker
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Huidige Stap
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Hoofddoel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Aangemaakt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A4D23]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#181F17]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center mr-3">
                          <span className="text-[#0A0F0A] font-bold text-sm">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-[#8BAE5A]/20 text-[#8BAE5A]'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Lid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        user.onboardingCompleted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.onboardingCompleted ? (
                          <>
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Voltooid
                          </>
                        ) : (
                          <>
                            <ClockIcon className="w-3 h-3 mr-1" />
                            In Progress
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {getStepLabel(user.currentStep, user.onboardingCompleted)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {user.mainGoal || 'Niet ingesteld'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">Geen gebruikers gevonden</div>
              <p className="text-gray-500">Probeer andere zoektermen of filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 