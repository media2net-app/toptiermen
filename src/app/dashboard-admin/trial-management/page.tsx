'use client';
import { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  ClockIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  XMarkIcon,
  EyeIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { AdminCard, AdminStatsCard, AdminButton } from '@/components/admin';

interface TrialUser {
  user_id: string;
  full_name: string;
  email: string;
  subscription_tier: string;
  subscription_status: string;
  trial_start_date: string;
  trial_end_date: string;
  trial_used: boolean;
  upgrade_prompts_shown: number;
  last_upgrade_prompt: string | null;
  conversion_source: string;
  days_remaining: number;
  is_in_trial: boolean;
  features_accessed: number;
  upgrade_prompts_received: number;
  usage_events: number;
  conversion_events: number;
}

interface TrialStats {
  totalTrialUsers: number;
  activeTrials: number;
  expiringTrials: number;
  convertedTrials: number;
  conversionRate: number;
  averageTrialDuration: number;
  totalUpgradePrompts: number;
  totalConversionValue: number;
}

export default function TrialManagementPage() {
  const [trialUsers, setTrialUsers] = useState<TrialUser[]>([]);
  const [stats, setStats] = useState<TrialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTrialData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/trial-analytics');
      const data = await response.json();

      if (data.success) {
        setTrialUsers(data.users || []);
        setStats(data.stats || null);
      } else {
        console.error('Error fetching trial data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching trial data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialData();
  }, []);

  const filteredUsers = trialUsers.filter(user => {
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'active' && user.is_in_trial) ||
      (selectedFilter === 'expiring' && user.days_remaining <= 2) ||
      (selectedFilter === 'converted' && !user.is_in_trial && user.subscription_tier !== 'trial');
    
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleExtendTrial = async (userId: string, days: number) => {
    try {
      const response = await fetch('/api/admin/extend-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          days
        })
      });

      if (response.ok) {
        fetchTrialData(); // Refresh data
      } else {
        console.error('Error extending trial');
      }
    } catch (error) {
      console.error('Error extending trial:', error);
    }
  };

  const handleSendUpgradePrompt = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/send-upgrade-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          promptType: 'manual'
        })
      });

      if (response.ok) {
        fetchTrialData(); // Refresh data
      } else {
        console.error('Error sending upgrade prompt');
      }
    } catch (error) {
      console.error('Error sending upgrade prompt:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#8BAE5A] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F0A] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Trial Management</h1>
          <p className="text-[#8BAE5A]">Beheer en analyseer 7-dagen trial gebruikers</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AdminStatsCard
              title="Totaal Trial Gebruikers"
              value={stats.totalTrialUsers}
              icon={<UserGroupIcon className="w-8 h-8" />}
              color="blue"
            />
            <AdminStatsCard
              title="Actieve Trials"
              value={stats.activeTrials}
              icon={<ClockIcon className="w-8 h-8" />}
              color="green"
            />
            <AdminStatsCard
              title="Verlopende Trials"
              value={stats.expiringTrials}
              icon={<ExclamationTriangleIcon className="w-8 h-8" />}
              color="orange"
            />
            <AdminStatsCard
              title="Conversie Rate"
              value={`${stats.conversionRate.toFixed(1)}%`}
              icon={<ArrowTrendingUpIcon className="w-8 h-8" />}
              color="purple"
            />
          </div>
        )}

        {/* Filters */}
        <AdminCard title="Filters" icon={<EyeIcon className="w-6 h-6" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status Filter</label>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              >
                <option value="all">Alle Gebruikers</option>
                <option value="active">Actieve Trials</option>
                <option value="expiring">Verlopende Trials (≤2 dagen)</option>
                <option value="converted">Geconverteerd</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Zoeken</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Naam of email..."
                className="w-full px-4 py-2 rounded-lg bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-gray-400"
              />
            </div>
            
            <div className="flex items-end">
              <AdminButton
                onClick={fetchTrialData}
                variant="secondary"
                icon={<ArrowPathIcon className="w-4 h-4" />}
              >
                Verversen
              </AdminButton>
            </div>
          </div>
        </AdminCard>

        {/* Trial Users Table */}
        <AdminCard title={`Trial Gebruikers (${filteredUsers.length})`} icon={<UserGroupIcon className="w-6 h-6" />}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#3A4D23]">
                  <th className="text-left py-3 px-4 text-gray-300">Gebruiker</th>
                  <th className="text-left py-3 px-4 text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300">Dagen Over</th>
                  <th className="text-left py-3 px-4 text-gray-300">Features</th>
                  <th className="text-left py-3 px-4 text-gray-300">Prompts</th>
                  <th className="text-left py-3 px-4 text-gray-300">Acties</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="border-b border-[#3A4D23] hover:bg-[#181F17]">
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-white font-semibold">{user.full_name || 'Onbekend'}</div>
                        <div className="text-gray-400 text-sm">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          user.is_in_trial ? 'bg-green-500' : 
                          user.subscription_tier !== 'trial' ? 'bg-blue-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-white">
                          {user.is_in_trial ? 'Actief' : 
                           user.subscription_tier !== 'trial' ? 'Geconverteerd' : 'Verlopen'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className={`font-semibold ${
                          user.days_remaining <= 2 ? 'text-orange-400' : 'text-white'
                        }`}>
                          {user.days_remaining} dagen
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white">{user.features_accessed}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white">{user.upgrade_prompts_received}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {user.is_in_trial && (
                          <>
                            <AdminButton
                              size="sm"
                              variant="secondary"
                              onClick={() => handleExtendTrial(user.user_id, 3)}
                            >
                              +3 dagen
                            </AdminButton>
                            <AdminButton
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSendUpgradePrompt(user.user_id)}
                            >
                              Prompt
                            </AdminButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">Geen trial gebruikers gevonden</p>
            </div>
          )}
        </AdminCard>

        {/* Conversion Analytics */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <AdminCard title="Conversie Analytics" icon={<ChartBarIcon className="w-6 h-6" />}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Totaal conversies:</span>
                  <span className="text-white font-semibold">{stats.convertedTrials}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Conversie rate:</span>
                  <span className="text-[#8BAE5A] font-semibold">{stats.conversionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Gemiddelde trial duur:</span>
                  <span className="text-white font-semibold">{stats.averageTrialDuration.toFixed(1)} dagen</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Totaal conversie waarde:</span>
                  <span className="text-[#8BAE5A] font-semibold">€{stats.totalConversionValue}</span>
                </div>
              </div>
            </AdminCard>

            <AdminCard title="Upgrade Prompts" icon={<ArrowUpIcon className="w-6 h-6" />}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Totaal prompts verzonden:</span>
                  <span className="text-white font-semibold">{stats.totalUpgradePrompts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Gemiddeld per gebruiker:</span>
                  <span className="text-white font-semibold">
                    {(stats.totalUpgradePrompts / Math.max(stats.totalTrialUsers, 1)).toFixed(1)}
                  </span>
                </div>
              </div>
            </AdminCard>
          </div>
        )}
      </div>
    </div>
  );
} 