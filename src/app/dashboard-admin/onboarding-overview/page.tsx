'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/navigation';

interface UserOnboarding {
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
  const { user, profile, loading } = useSupabaseAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserOnboarding[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced admin check that works even when profile is missing
  const knownAdminEmails = ['chiel@media2net.nl', 'rick@toptiermen.eu', 'admin@toptiermen.com'];
  const isAdmin = !!(profile?.role === 'admin' || 
    (user?.email && knownAdminEmails.includes(user.email)));

  // Redirect if not admin
  useEffect(() => {
    if (!loading && user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [loading, user, isAdmin, router]);

  // Fetch onboarding data
  const fetchOnboardingData = async () => {
    try {
      setPageLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/onboarding-status');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setStatistics(data.statistics || null);
      } else {
        setError(data.error || 'Failed to fetch onboarding data');
      }
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
      setError('Failed to fetch onboarding data');
    } finally {
      setPageLoading(false);
    }
  };

  // Load data when admin is confirmed
  useEffect(() => {
    if (isAdmin) {
      fetchOnboardingData();
    }
  }, [isAdmin]);

  // Get step label
  const getStepLabel = (step: number, completed: boolean) => {
    if (completed) return '✅ Voltooid';
    
    switch (step) {
      case 0: return '🎬 Welkom Video';
      case 1: return '🎯 Doel Omschrijven';
      case 2: return '🎯 Missies Selecteren';
      case 3: return '💪 Trainingsschema';
      case 4: return '🍽️ Voedingsplan';
      case 5: return '💬 Forum Introductie';
      case 6: return '✅ Voltooid';
      default: return `Stap ${step}`;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-gray-500 text-sm mt-2">User: {user?.email || 'Niet ingelogd'}</p>
          <p className="text-gray-500 text-sm">Role: {profile?.role || 'Geen rol'}</p>
        </div>
      </div>
    );
  }

  // Show page loading
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Onboarding data laden...</p>
        </div>
      </div>
    );
  }

  // Show error
  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ Fout</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchOnboardingData}
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
            <div>
              <h1 className="text-3xl font-bold text-white">Onboarding Overzicht</h1>
              <p className="text-gray-400 mt-2">Overzicht van alle gebruikers en hun onboarding status</p>
            </div>
            <button
              onClick={fetchOnboardingData}
              className="px-4 py-2 bg-[#8BAE5A] text-[#0A0F0A] rounded-lg hover:bg-[#7A9D4A] transition-colors"
            >
              🔄 Vernieuwen
            </button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{statistics.total}</div>
                <div className="text-gray-400">Totaal Gebruikers</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#B6C948]/10 border border-[#8BAE5A] rounded-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#8BAE5A] mb-2">{statistics.completed}</div>
                <div className="text-[#8BAE5A]">Onboarding Voltooid</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#f0a14f]/10 to-[#FFD700]/10 border border-[#f0a14f] rounded-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#f0a14f] mb-2">{statistics.pending}</div>
                <div className="text-[#f0a14f]">In Progress</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{statistics.completionRate}%</div>
                <div className="text-gray-400">Voltooiingspercentage</div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Zoek op email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
              />
            </div>
            <div className="text-gray-400">
              {filteredUsers.length} van {users.length} gebruikers
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
                        user.role?.toLowerCase() === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-[#8BAE5A]/20 text-[#8BAE5A]'
                      }`}>
                        {user.role?.toLowerCase() === 'admin' ? 'Admin' : 'Lid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        user.onboardingCompleted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.onboardingCompleted ? '✅ Voltooid' : '⏳ In Progress'}
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
              <p className="text-gray-500">Probeer andere zoektermen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}