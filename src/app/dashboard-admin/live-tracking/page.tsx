'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  UserIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

interface OnlineUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  last_active: string;
  onboarding_completed: boolean;
  current_step: number | null;
  welcome_video_watched: boolean;
  subscription_status: string | null;
  created_at: string;
}

export default function LiveTrackingPage() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [allUsers, setAllUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showOnlineOnly, setShowOnlineOnly] = useState(true);

  // Bepaal of een gebruiker "online" is (actief in laatste 5 minuten)
  const isUserOnline = (lastActive: string) => {
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60);
    return diffMinutes < 5;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch alle gebruikers met hun laatste activiteit en onboarding status
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, last_active, subscription_status, created_at')
        .order('last_active', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch onboarding status voor alle gebruikers
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('onboarding_status')
        .select('user_id, onboarding_completed, current_step, welcome_video_watched');

      if (onboardingError) {
        console.error('Error fetching onboarding:', onboardingError);
      }

      // Merge de data
      const usersWithStatus: OnlineUser[] = profiles?.map(profile => {
        const onboarding = onboardingData?.find(o => o.user_id === profile.id);
        return {
          ...profile,
          onboarding_completed: onboarding?.onboarding_completed || false,
          current_step: onboarding?.current_step || null,
          welcome_video_watched: onboarding?.welcome_video_watched || false
        };
      }) || [];

      setAllUsers(usersWithStatus);

      // Filter online gebruikers (actief in laatste 5 minuten)
      const online = usersWithStatus.filter(user => 
        user.last_active && isUserOnline(user.last_active)
      );
      setOnlineUsers(online);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Auto-refresh elke 10 seconden
    const interval = setInterval(() => {
      fetchUsers();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const displayUsers = showOnlineOnly ? onlineUsers : allUsers;

  const getOnboardingStepText = (step: number | null, completed: boolean) => {
    if (completed) return 'Voltooid ✓';
    if (step === null) return 'Niet gestart';
    
    const steps = [
      'Welkom video',
      'Basis info',
      'Training & Doel',
      'Voedingsplan',
      'Afronding'
    ];
    
    return `Stap ${step}: ${steps[step - 1] || 'Onbekend'}`;
  };

  const getTimeSince = (lastActive: string) => {
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastActiveDate.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s geleden`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m geleden`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}u geleden`;
    return `${Math.floor(diffSeconds / 86400)}d geleden`;
  };

  return (
    <div className="min-h-screen bg-[#181F17]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Live Platform Tracking
            </h1>
            <p className="text-[#8BAE5A]">
              Real-time overzicht van actieve gebruikers en hun voortgang
            </p>
          </div>
          
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-xl font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Ververs
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <SignalIcon className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-[#8BAE5A] text-sm">Online Nu</p>
                <p className="text-white text-2xl font-bold">{onlineUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <UserIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-[#8BAE5A] text-sm">Totaal Gebruikers</p>
                <p className="text-white text-2xl font-bold">{allUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#8BAE5A]/20 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <div>
                <p className="text-[#8BAE5A] text-sm">Onboarding Voltooid</p>
                <p className="text-white text-2xl font-bold">
                  {allUsers.filter(u => u.onboarding_completed).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <ClockIcon className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-[#8BAE5A] text-sm">In Onboarding</p>
                <p className="text-white text-2xl font-bold">
                  {allUsers.filter(u => !u.onboarding_completed).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setShowOnlineOnly(true)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              showOnlineOnly
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23]'
            }`}
          >
            <span className="flex items-center gap-2">
              <SignalIcon className="w-4 h-4" />
              Alleen Online ({onlineUsers.length})
            </span>
          </button>
          
          <button
            onClick={() => setShowOnlineOnly(false)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              !showOnlineOnly
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23]'
            }`}
          >
            <span className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Alle Gebruikers ({allUsers.length})
            </span>
          </button>

          <div className="ml-auto text-[#8BAE5A] text-sm flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            Laatste update: {lastUpdate.toLocaleTimeString('nl-NL')}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-[#8BAE5A]">Gebruikers laden...</p>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="p-12 text-center">
            <XCircleIcon className="w-16 h-16 text-[#8BAE5A] mx-auto mb-4 opacity-50" />
            <p className="text-[#8BAE5A]">
              {showOnlineOnly 
                ? 'Geen gebruikers online op dit moment' 
                : 'Geen gebruikers gevonden'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#181F17] border-b border-[#3A4D23]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#8BAE5A]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#8BAE5A]">Gebruiker</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#8BAE5A]">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#8BAE5A]">Rol</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#8BAE5A]">Onboarding</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#8BAE5A]">Abonnement</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#8BAE5A]">Laatst Actief</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A4D23]">
                {displayUsers.map((user) => {
                  const online = user.last_active && isUserOnline(user.last_active);
                  return (
                    <tr key={user.id} className="hover:bg-[#181F17] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${online ? 'bg-green-500' : 'bg-gray-500'}`}>
                            {online && (
                              <div className="w-3 h-3 rounded-full bg-green-500 animate-ping"></div>
                            )}
                          </div>
                          <span className={`text-sm ${online ? 'text-green-500' : 'text-gray-500'}`}>
                            {online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#8BAE5A]/20 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-[#8BAE5A]" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              {user.full_name || 'Geen naam'}
                            </p>
                            <p className="text-[#8BAE5A] text-xs">
                              ID: {user.id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' 
                            ? 'bg-[#E33412]/20 text-[#E33412]' 
                            : 'bg-[#8BAE5A]/20 text-[#8BAE5A]'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className={`text-sm font-semibold ${
                            user.onboarding_completed ? 'text-green-500' : 'text-orange-500'
                          }`}>
                            {getOnboardingStepText(user.current_step, user.onboarding_completed)}
                          </p>
                          {user.welcome_video_watched && !user.onboarding_completed && (
                            <p className="text-[#8BAE5A] text-xs mt-1">
                              📹 Welkomst video bekeken
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.subscription_status === 'active' 
                            ? 'bg-green-500/20 text-green-500' 
                            : user.subscription_status === 'trial'
                            ? 'bg-blue-500/20 text-blue-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {user.subscription_status || 'Geen'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[#8BAE5A]">
                          <ClockIcon className="w-4 h-4" />
                          <span className="text-sm">
                            {user.last_active ? getTimeSince(user.last_active) : 'Nooit'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
          <SignalIcon className="w-5 h-5 text-[#8BAE5A]" />
          Over Live Tracking
        </h3>
        <ul className="text-[#8BAE5A] text-sm space-y-2">
          <li>• Gebruikers worden als "online" gemarkeerd als ze actief waren in de laatste 5 minuten</li>
          <li>• De data wordt automatisch elke 10 seconden ververst</li>
          <li>• Onboarding stappen: 1=Welkom video, 2=Basis info, 3=Training, 4=Voeding, 5=Afronding</li>
          <li>• Laatste activiteit wordt bijgehouden in de database (last_active kolom)</li>
        </ul>
      </div>
    </div>
  );
}

