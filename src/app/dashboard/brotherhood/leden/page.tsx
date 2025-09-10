'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Database } from '@/types/database.types';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  // Badges data
  badges?: Array<{
    id: string;
    name: string;
    description: string;
    icon_url: string;
    unlocked_at: string;
  }>;
}

const ranks = [
  { name: 'Elite', icon: '🦁' },
  { name: 'Veteraan', icon: '🎖️' },
  { name: 'Intermediate', icon: '💪' },
  { name: 'Beginner', icon: '👊' },
];

const interests = ['Finance', 'Fitness', 'Mindset', 'Vaderschap', 'Digitale Nomaden', 'Ondernemerschap'];

// Simple badge display component for member cards
const MemberBadgeDisplay = ({ badges, totalCount }: { badges?: Array<any>, totalCount: number }) => {
  const [hoveredBadge, setHoveredBadge] = useState<any>(null);

  if (!badges || badges.length === 0) {
    return (
      <div className="flex items-center justify-center gap-1">
        <span className="text-xs text-[#8BAE5A]">0 badges</span>
      </div>
    );
  }
  
  const displayBadges = badges.slice(-3); // Get last 3 badges
  const additionalCount = totalCount - displayBadges.length;
  
  return (
    <div className="flex items-center justify-center gap-1 relative">
      {displayBadges.map((badge, index) => (
        <div
          key={badge.id}
          className="relative"
          onMouseEnter={() => setHoveredBadge(badge)}
          onMouseLeave={() => setHoveredBadge(null)}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center border border-[#8BAE5A] shadow-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg"
            title={badge.name}
          >
            {badge.icon_url ? (
              <Image
                src={badge.icon_url}
                alt={badge.name}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <span className="text-base text-[#FFD700] font-bold">🏆</span>
            )}
          </div>

          {/* Hover Tooltip */}
          {hoveredBadge?.id === badge.id && (
            <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2">
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-3 shadow-xl min-w-[200px] max-w-[250px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border border-[#8BAE5A] overflow-hidden">
                    {badge.icon_url ? (
                      <Image
                        src={badge.icon_url}
                        alt={badge.name}
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <span className="text-sm text-[#FFD700] font-bold">🏆</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#8BAE5A] text-sm">{badge.name}</h4>
                    <span className="text-xs text-[#A6C97B]">Badge</span>
                  </div>
                </div>
                <p className="text-[#A6C97B] text-xs mb-2 leading-relaxed">
                  {badge.description}
                </p>
                {badge.unlocked_at && (
                  <div className="text-xs text-[#8BAE5A]/70">
                    Behaald op {new Date(badge.unlocked_at).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                )}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#181F17]" />
              </div>
            </div>
          )}
        </div>
      ))}
      {additionalCount > 0 && (
        <div 
          className="w-10 h-10 rounded-full bg-[#3A4D23] flex items-center justify-center border border-[#8BAE5A] shadow-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg"
          onMouseEnter={() => setHoveredBadge({ id: 'additional', name: `+${additionalCount} extra badges` })}
          onMouseLeave={() => setHoveredBadge(null)}
        >
          <span className="text-sm text-[#8BAE5A] font-bold">+{additionalCount}</span>
          
          {/* Hover Tooltip for additional count */}
          {hoveredBadge?.id === 'additional' && (
            <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2">
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-3 shadow-xl min-w-[150px]">
                <div className="text-center">
                  <h4 className="font-semibold text-[#8BAE5A] text-sm mb-1">Extra Badges</h4>
                  <p className="text-[#A6C97B] text-xs">
                    Nog {additionalCount} badge{additionalCount > 1 ? 's' : ''} behaald
                  </p>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#181F17]" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function LedenOverzicht() {
  const { user } = useSupabaseAuth();
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

    // Removed visibilitychange event listener to prevent page reloads when switching tabs
    // Only keep beforeunload for proper cleanup when leaving the page

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      presenceSubscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
      
      // Fetch badges for each member
      const membersWithBadges = await Promise.all(
        enrichedMembers.map(async (member: Profile) => {
          try {
            const { data: badges, error } = await supabase
              .from('user_badges')
              .select(`
                id,
                badge_id,
                unlocked_at,
                badges (
                  id,
                  title,
                  description,
                  image_url
                )
              `)
              .eq('user_id', member.id)
              .order('unlocked_at', { ascending: false })
              .limit(5); // Get last 5 badges for display

            if (error) {
              console.error('Error fetching badges for user:', member.id, error);
              return { ...member, badges: [] };
            }

            const formattedBadges = badges?.map((badge: any) => ({
              id: badge.id,
              name: badge.badges?.title || 'Unknown Badge',
              description: badge.badges?.description || '',
              icon_url: badge.badges?.image_url || null,
              unlocked_at: badge.unlocked_at
            })) || [];

            return { ...member, badges: formattedBadges };
          } catch (error) {
            console.error('Error fetching badges for user:', member.id, error);
            return { ...member, badges: [] };
          }
        })
      );

      setMembers(membersWithBadges);
      
      // Count online members
      const onlineMembers = membersWithBadges.filter((m: Profile) => m.is_online);
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">De Broeders</h2>
        <p className="text-[#8BAE5A] text-sm sm:text-lg mb-2">Vind, connect en leer van de andere leden van Top Tier Men.</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[#FFD700] text-xs sm:text-sm font-semibold">
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
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        <input
          type="text"
          className="w-full bg-[#232D1A]/80 rounded-xl p-3 text-white placeholder:text-[#8BAE5A] border border-[#3A4D23]/40 text-sm sm:text-base"
          placeholder="Zoek een lid op naam, trefwoord of motto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            className="w-full bg-[#232D1A]/80 rounded-xl p-3 text-white border border-[#3A4D23]/40 text-sm sm:text-base"
            value={selectedRank}
            onChange={e => setSelectedRank(e.target.value)}
          >
            <option value="">Alle rangen</option>
            {ranks.map(r => <option key={r.name} value={r.name}>{r.icon} {r.name}</option>)}
          </select>
          <select
            className="w-full bg-[#232D1A]/80 rounded-xl p-3 text-white border border-[#3A4D23]/40 text-sm sm:text-base"
            value={selectedInterest}
            onChange={e => setSelectedInterest(e.target.value)}
          >
            <option value="">Alle interesses</option>
            {interests.map(i => <option key={i} value={i}>#{i}</option>)}
          </select>
          <input
            type="text"
            className="w-full bg-[#232D1A]/80 rounded-xl p-3 text-white border border-[#3A4D23]/40 text-sm sm:text-base"
            placeholder="Locatie..."
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
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
      </div>
      {/* Leden Gallerij */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filtered.map((m) => {
          const memberInterests = getMemberInterests(m.interests);
          const memberRank = m.current_rank?.name || m.fallback_rank || 'Recruit';
          const rankIcon = getRankIcon(memberRank);
          const isMemberOnline = m.is_online || false;
          const isMemberNew = isNewMember(m.created_at);
          const memberName = m.display_name || m.full_name || 'Onbekend';
          const isCurrentUser = m.id === user?.id;
          const mutualConnections = Math.floor(Math.random() * 5) + 1; // Random number for demo
          // Use new rank system data
          const displayRank = m.current_rank ? `Level ${m.current_rank.rank_order} - ${m.current_rank.name}` : memberRank;
          const displayXP = m.current_xp || 0;
          const displayBadges = m.badges_count || 0;
          
          // Generate initials for default avatar
          const getInitials = (name: string) => {
            return name
              .split(' ')
              .map(word => word.charAt(0))
              .join('')
              .toUpperCase()
              .slice(0, 2);
          };
          
          return (
            <div key={m.id} className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-4 sm:p-5 flex flex-col items-center gap-3 hover:shadow-2xl transition-all">
              <Link href={`/dashboard/brotherhood/leden/${m.id}`} className="w-full flex flex-col items-center gap-3 group cursor-pointer" style={{ textDecoration: 'none' }}>
                <div className="relative">
                  {m.avatar_url ? (
                    <Image 
                      src={m.avatar_url} 
                      alt={memberName} 
                      width={80} 
                      height={80} 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#8BAE5A] object-cover group-hover:scale-105 transition-transform" 
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#8BAE5A] bg-gradient-to-br from-[#3A4D23] to-[#232D1A] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="text-[#8BAE5A] font-bold text-lg sm:text-xl">
                        {getInitials(memberName)}
                      </span>
                    </div>
                  )}
                  {isMemberOnline && (
                    <span 
                      className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#8BAE5A] border-3 border-white rounded-full shadow-lg" 
                      title="Online nu"
                      style={{
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}
                    />
                  )}
                  {isMemberNew && <span className="absolute -top-1 -right-1 bg-[#FFD700] text-[#181F17] text-xs px-2 py-1 rounded-full font-bold">Nieuw</span>}
                </div>
                <div className="text-base sm:text-lg font-bold text-white text-center group-hover:text-[#FFD700] transition-colors break-words w-full">{memberName}</div>
                <div className="flex items-center gap-2 text-[#FFD700] font-semibold text-xs sm:text-sm text-center">
                  <span>{rankIcon}</span>
                  <span className="break-words">{displayRank}</span>
                </div>
                <div className="text-xs text-[#8BAE5A] mb-1 text-center break-words">{m.location || 'Locatie onbekend'}</div>
                {memberInterests.length > 0 && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 justify-center mb-2 w-full">
                    {memberInterests.slice(0, 2).map(tag => (
                      <span key={tag} className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 py-0.5 rounded-full text-xs font-semibold break-words">#{tag}</span>
                    ))}
                    {memberInterests.length > 2 && (
                      <span className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 py-0.5 rounded-full text-xs font-semibold">+{memberInterests.length - 2}</span>
                    )}
                  </div>
                )}
                {/* Badge Display */}
                <MemberBadgeDisplay badges={m.badges} totalCount={m.badges?.length || 0} />
                <div className="text-xs text-[#FFD700] font-semibold text-center">
                  {displayXP} XP • {displayBadges} badges
                </div>
              </Link>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-[#8BAE5A] text-base sm:text-lg">Geen leden gevonden met de geselecteerde filters.</div>
        </div>
      )}
      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#232D1A] text-[#8BAE5A] px-4 sm:px-6 py-3 rounded-xl shadow-lg border border-[#3A4D23]/40 z-50 animate-fade-in text-sm sm:text-base">
          {notification}
        </div>
      )}
    </div>
  );
} 