'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/types/database.types';

type User = Database['public']['Tables']['users']['Row'];

// Custom Profile type for the profiles table
interface Profile {
  id: string;
  full_name: string;
  display_name: string | null;
  email: string;
  rank: string;
  points: number;
  missions_completed: number;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  interests: any;
  created_at: string;
  last_login: string | null;
  // New rank system properties
  current_xp?: number;
  current_rank?: {
    id: number;
    name: string;
    rank_order: number;
    icon_name: string;
  } | null;
  badges_count?: number;
  fallback_rank?: string;
  // Real-time online status
  is_online?: boolean;
  last_seen?: string | null;
}

const ranks = [
  { name: 'Elite', icon: '🦁' },
  { name: 'Veteraan', icon: '🎖️' },
  { name: 'Intermediate', icon: '💪' },
  { name: 'Beginner', icon: '👊' },
];

const interests = ['Finance', 'Fitness', 'Mindset', 'Vaderschap', 'Digitale Nomaden', 'Ondernemerschap'];

export default function LedenOverzicht() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedRank, setSelectedRank] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [location, setLocation] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showOnline, setShowOnline] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeout = useRef<NodeJS.Timeout | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);

  // Fetch real members data
  useEffect(() => {
    fetchMembers();
  }, []);

  // Set up real-time presence updates
  useEffect(() => {
    if (!user) return;

    // Mark user as online when component mounts
    markUserOnline();

    // Set up real-time subscription for presence changes
    const presenceSubscription = supabase
      .channel('user_presence')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_presence' 
        }, 
        (payload) => {
          console.log('Presence change:', payload);
          // Refresh members data when presence changes
          fetchMembers();
        }
      )
      .subscribe();

    // Mark user as offline when component unmounts
    const handleBeforeUnload = () => {
      markUserOffline();
    };

    // Mark user as offline when page becomes hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        markUserOffline();
      } else {
        markUserOnline();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      presenceSubscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      markUserOffline();
    };
  }, [user]);

  const markUserOnline = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase.rpc('mark_user_online');
      if (error) {
        console.error('Error marking user online:', error);
      }
    } catch (error) {
      console.error('Error marking user online:', error);
    }
  };

  const markUserOffline = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase.rpc('mark_user_offline');
      if (error) {
        console.error('Error marking user offline:', error);
      }
    } catch (error) {
      console.error('Error marking user offline:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the API endpoint to get enriched members data
      const response = await fetch('/api/members-data');
      if (!response.ok) {
        throw new Error('Failed to fetch members data');
      }

      const { members: enrichedMembers } = await response.json();
      setMembers(enrichedMembers);
      
      // Count online members
      const onlineMembers = enrichedMembers.filter((m: Profile) => m.is_online);
      setOnlineCount(onlineMembers.length);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Er is een fout opgetreden bij het laden van de leden.');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: string) => {
    const rankObj = ranks.find(r => r.name === rank);
    return rankObj ? rankObj.icon : '👊';
  };

  const getMemberInterests = (interests: any): string[] => {
    if (!interests) return [];
    if (Array.isArray(interests)) return interests;
    if (typeof interests === 'string') return [interests];
    return [];
  };

  const isNewMember = (createdAt: string) => {
    const memberDate = new Date(createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return memberDate > weekAgo;
  };

  const filtered = members.filter((m: Profile) => {
    const memberInterests = getMemberInterests(m.interests);
    const memberRank = m.current_rank?.name || m.fallback_rank || 'Recruit';
    const memberName = m.display_name || m.full_name || 'Onbekend';
    
    return (
      (!search || 
        memberName.toLowerCase().includes(search.toLowerCase()) || 
        memberInterests.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
        (m.bio && m.bio.toLowerCase().includes(search.toLowerCase()))) &&
      (!selectedRank || memberRank === selectedRank) &&
      (!selectedInterest || memberInterests.includes(selectedInterest)) &&
      (!location || (m.location && m.location.toLowerCase().includes(location.toLowerCase()))) &&
      (!showNew || isNewMember(m.created_at)) &&
      (!showOnline || m.is_online)
    );
  });

  const handleConnect = (id: string) => {
    // Prevent connecting with yourself
    if (id === user?.id) {
      setNotification('Je kunt geen connectie maken met jezelf.');
      if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
      notificationTimeout.current = setTimeout(() => setNotification(null), 2500);
      return;
    }

    setConnectionStatus((prev) => ({ ...prev, [id]: 'verzoek' }));
    const member = members.find(m => m.id === id);
    const memberName = member?.display_name || member?.full_name || 'lid';
    setNotification(`Connectieverzoek verzonden naar ${memberName}.`);
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    notificationTimeout.current = setTimeout(() => setNotification(null), 2505);
  };

  if (loading) {
    return (
      <div className="px-4 md:px-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-1">De Broeders</h2>
          <p className="text-[#8BAE5A] text-lg mb-2">Vind, connect en leer van de andere leden van Top Tier Men.</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-[#8BAE5A] text-lg">Leden laden...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-1">De Broeders</h2>
          <p className="text-[#8BAE5A] text-lg mb-2">Vind, connect en leer van de andere leden van Top Tier Men.</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-red-400 text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-1">De Broeders</h2>
        <p className="text-[#8BAE5A] text-lg mb-2">Vind, connect en leer van de andere leden van Top Tier Men.</p>
        <div className="flex items-center gap-4 text-[#FFD700] text-sm font-semibold">
          <span>Momenteel {members.length} actieve leden</span>
          <span className="flex items-center gap-1">
            <span 
              className="w-2 h-2 bg-[#8BAE5A] rounded-full"
              style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            ></span>
            {onlineCount} online nu
          </span>
        </div>
      </div>
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
        <input
          type="text"
          className="flex-1 bg-[#232D1A]/80 rounded-xl p-3 text-white placeholder:text-[#8BAE5A] border border-[#3A4D23]/40"
          placeholder="Zoek een lid op naam, trefwoord of motto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="bg-[#232D1A]/80 rounded-xl p-3 text-white border border-[#3A4D23]/40"
          value={selectedRank}
          onChange={e => setSelectedRank(e.target.value)}
        >
          <option value="">Alle rangen</option>
          {ranks.map(r => <option key={r.name} value={r.name}>{r.icon} {r.name}</option>)}
        </select>
        <select
          className="bg-[#232D1A]/80 rounded-xl p-3 text-white border border-[#3A4D23]/40"
          value={selectedInterest}
          onChange={e => setSelectedInterest(e.target.value)}
        >
          <option value="">Alle interesses</option>
          {interests.map(i => <option key={i} value={i}>#{i}</option>)}
        </select>
        <input
          type="text"
          className="bg-[#232D1A]/80 rounded-xl p-3 text-white border border-[#3A4D23]/40"
          placeholder="Locatie..."
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-1 text-[#8BAE5A] text-xs">
            <input type="checkbox" checked={showNew} onChange={e => setShowNew(e.target.checked)} className="accent-[#FFD700]" /> Nieuwe leden
          </label>
          <label className="flex items-center gap-1 text-[#8BAE5A] text-xs">
            <input type="checkbox" checked={showOnline} onChange={e => setShowOnline(e.target.checked)} className="accent-[#FFD700]" /> 
            <span className="flex items-center gap-1">
              <span 
                className="w-2 h-2 bg-[#8BAE5A] rounded-full"
                style={{
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              ></span>
              Online nu ({onlineCount})
            </span>
          </label>
        </div>
      </div>
      {/* Leden Gallerij */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((m) => {
          const memberInterests = getMemberInterests(m.interests);
          const memberRank = m.current_rank?.name || m.fallback_rank || 'Recruit';
          const rankIcon = getRankIcon(memberRank);
          const avatarUrl = m.avatar_url || '/profielfoto.png';
          const isMemberOnline = m.is_online || false;
          const isMemberNew = isNewMember(m.created_at);
          const memberName = m.display_name || m.full_name || 'Onbekend';
          const isCurrentUser = m.id === user?.id;
          const mutualConnections = Math.floor(Math.random() * 5) + 1; // Random number for demo
          // Use new rank system data
          const displayRank = m.current_rank ? `Level ${m.current_rank.rank_order} - ${m.current_rank.name}` : memberRank;
          const displayXP = m.current_xp || 0;
          const displayBadges = m.badges_count || 0;
          
          return (
            <div key={m.id} className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-5 flex flex-col items-center gap-3 hover:shadow-2xl transition-all">
              <Link href={`/dashboard/brotherhood/leden/${m.id}`} className="w-full flex flex-col items-center gap-3 group cursor-pointer" style={{ textDecoration: 'none' }}>
                <div className="relative">
                  <Image 
                    src={avatarUrl} 
                    alt={memberName} 
                    width={80} 
                    height={80} 
                    className="w-20 h-20 rounded-full border-2 border-[#8BAE5A] object-cover group-hover:scale-105 transition-transform" 
                  />
                  {isMemberOnline && (
                    <span 
                      className="absolute bottom-1 right-1 w-5 h-5 bg-[#8BAE5A] border-3 border-white rounded-full shadow-lg" 
                      title="Online nu"
                      style={{
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}
                    />
                  )}
                  {isMemberNew && <span className="absolute -top-1 -right-1 bg-[#FFD700] text-[#181F17] text-xs px-2 py-1 rounded-full font-bold">Nieuw</span>}
                </div>
                <div className="text-lg font-bold text-white text-center group-hover:text-[#FFD700] transition-colors">{memberName}</div>
                <div className="flex items-center gap-2 text-[#FFD700] font-semibold text-sm">
                  <span>{rankIcon}</span>
                  <span>{displayRank}</span>
                </div>
                <div className="text-xs text-[#8BAE5A] mb-1">{m.location || 'Locatie onbekend'}</div>
                {memberInterests.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-2">
                    {memberInterests.slice(0, 2).map(tag => (
                      <span key={tag} className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 py-0.5 rounded-full text-xs font-semibold">#{tag}</span>
                    ))}
                    {memberInterests.length > 2 && (
                      <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 py-0.5 rounded-full text-xs font-semibold">+{memberInterests.length - 2}</span>
                    )}
                  </div>
                )}
                <div className="text-xs text-[#FFD700] font-semibold">
                  {displayXP} XP • {displayBadges} badges
                </div>
                <div className="text-xs text-[#8BAE5A]">
                  {mutualConnections} mutuals
                </div>
              </Link>
              <div className="w-full mt-auto">
                {isCurrentUser ? (
                  <button className="w-full px-4 py-2 rounded-xl bg-[#3A4D23]/60 text-[#8BAE5A] font-bold shadow cursor-default" disabled>Jij bent dit</button>
                ) : connectionStatus[m.id] === 'verzoek' ? (
                  <button className="w-full px-4 py-2 rounded-xl bg-[#8BAE5A]/30 text-[#8BAE5A] font-bold shadow cursor-default" disabled>✓ Verzoek Verzonden</button>
                ) : (
                  <button
                    className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
                    onClick={() => handleConnect(m.id)}
                  >
                    + Maak Connectie
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-[#8BAE5A] text-lg">Geen leden gevonden met de geselecteerde filters.</div>
        </div>
      )}
      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#232D1A] text-[#8BAE5A] px-6 py-3 rounded-xl shadow-lg border border-[#3A4D23]/40 z-50 animate-fade-in">
          {notification}
        </div>
      )}
    </div>
  );
} 