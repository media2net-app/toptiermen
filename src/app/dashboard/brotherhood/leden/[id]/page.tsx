'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type User = Database['public']['Tables']['profiles']['Row'];

const ranks = [
  { name: 'Legende', icon: '🦁' },
  { name: 'Veteraan', icon: '🎖️' },
  { name: 'Alpha', icon: '💪' },
  { name: 'Member', icon: '👊' },
];

const interests = ['Finance', 'Fitness', 'Mindset', 'Vaderschap', 'Digitale Nomaden', 'Ondernemerschap'];
const badges = [
  { name: 'Discipline', img: '/badge1.png' },
  { name: 'Brotherhood', img: '/badge2.png' },
  { name: 'Mindset', img: '/badge3.png' },
];

export default function ProfielDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [member, setMember] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('geen');
  const [notification, setNotification] = useState<string | null>(null);
  const [currentMemberRank, setCurrentMemberRank] = useState<any>(null);
  const [currentMemberXP, setCurrentMemberXP] = useState(0);

  useEffect(() => {
    if (id) {
      fetchMember();
      fetchMemberRank();
    }
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching member:', fetchError);
        if (fetchError.code === 'PGRST116') {
          setError('Lid niet gevonden.');
        } else {
          setError('Kon lid niet laden. Probeer het later opnieuw.');
        }
        return;
      }

      setMember(data);
    } catch (err) {
      console.error('Error fetching member:', err);
      setError('Er is een fout opgetreden bij het laden van het profiel.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberRank = async () => {
    try {
      // Get member XP and current rank
      const { data: xpData, error: xpError } = await supabase
        .from('user_xp')
        .select('total_xp, current_rank_id')
        .eq('user_id', id)
        .single();

      if (!xpError && xpData) {
        setCurrentMemberXP(xpData.total_xp || 0);

        // Get rank details
        const { data: rankData, error: rankError } = await supabase
          .from('ranks')
          .select('*')
          .eq('id', xpData.current_rank_id)
          .single();

        if (!rankError && rankData) {
          setCurrentMemberRank(rankData);
        }
      }
    } catch (error) {
      console.error('Error fetching member rank:', error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 dag geleden';
    if (diffDays < 7) return `${diffDays} dagen geleden`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`;
    return date.toLocaleDateString('nl-NL');
  };

  const handleConnect = () => {
    setConnectionStatus('verzoek');
    setNotification(`Connectieverzoek verzonden naar ${member?.full_name || 'lid'}.`);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="px-4 md:px-12 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-[#8BAE5A] text-lg">Profiel laden...</div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="px-4 md:px-12 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-400 text-lg mb-4">{error || 'Lid niet gevonden'}</div>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#B6C948] transition-colors"
            >
              Terug naar leden
            </button>
          </div>
        </div>
      </div>
    );
  }

  const memberInterests = getMemberInterests(member.interests);
  const displayRank = currentMemberRank ? currentMemberRank.name : 'Member';
  const rankIcon = getRankIcon(displayRank);
  const avatarUrl = member.avatar_url || '/profielfoto.png';
  const memberBadges = badges.slice(0, Math.min(3, Math.floor((member.points || 0) / 100) + 1));

  return (
    <div className="px-4 md:px-12 py-8">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#8BAE5A] hover:text-[#B6C948] transition-colors"
        >
          ← Terug naar leden
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
        <div className="relative">
          <Image 
            src={avatarUrl} 
            alt={member.full_name} 
            width={120} 
            height={120} 
            className="w-32 h-32 rounded-full border-4 border-[#8BAE5A] object-cover" 
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{member.full_name}</h2>
            <span className="flex items-center gap-1 text-[#FFD700] font-semibold text-lg">
              {rankIcon} {currentMemberRank ? `Level ${currentMemberRank.rank_order} - ${currentMemberRank.name}` : displayRank}
            </span>
          </div>
          <div className="text-[#8BAE5A] text-sm">{member.location || 'Locatie onbekend'}</div>
          {memberInterests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {memberInterests.map(tag => (
                <span key={tag} className="bg-[#3A4D23]/60 text-[#8BAE5A] px-2 py-0.5 rounded-full text-xs font-semibold">#{tag}</span>
              ))}
            </div>
          )}
          {member.bio && (
            <div className="mt-3 text-white/80 text-base">{member.bio}</div>
          )}
          {member.points && (
            <div className="mt-2 text-[#FFD700] font-semibold">
              {member.points} punten • {member.missions_completed || 0} missies voltooid
            </div>
          )}
          {memberBadges.length > 0 && (
            <div className="flex gap-2 mt-3">
              {memberBadges.map(b => (
                <div key={b.name} className="flex flex-col items-center">
                  <Image src={b.img} alt={b.name} width={32} height={32} className="rounded-full" />
                  <span className="text-xs text-[#FFD700] mt-1">{b.name}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            {connectionStatus === 'verzoek' ? (
              <button className="px-5 py-2 rounded-xl bg-[#8BAE5A]/30 text-[#8BAE5A] font-bold shadow cursor-default" disabled>✓ Verzoek Verzonden</button>
            ) : connectionStatus === 'connectie' ? (
              <button className="px-5 py-2 rounded-xl bg-[#FFD700]/30 text-[#FFD700] font-bold shadow cursor-default" disabled>✓ Connectie</button>
            ) : (
              <button
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
                onClick={handleConnect}
              >
                + Maak Connectie
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lid sinds */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-2">Lidmaatschap</h3>
        <div className="bg-[#232D1A]/80 rounded-lg px-4 py-3 text-white border border-[#3A4D23]/40">
          <div className="text-[#8BAE5A] font-semibold">Lid sinds {formatDate(member.created_at)}</div>
          {member.last_login && (
            <div className="text-sm text-white/70 mt-1">
              Laatste login: {formatDate(member.last_login)}
            </div>
          )}
        </div>
      </div>

      {/* Prestaties */}
      {(member.points || member.missions_completed) && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-2">Prestaties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#232D1A]/80 rounded-lg px-4 py-3 text-white border border-[#3A4D23]/40">
              <div className="text-[#FFD700] font-bold text-xl">{member.points || 0}</div>
              <div className="text-[#8BAE5A] text-sm">Totaal punten</div>
            </div>
            <div className="bg-[#232D1A]/80 rounded-lg px-4 py-3 text-white border border-[#3A4D23]/40">
              <div className="text-[#FFD700] font-bold text-xl">{member.missions_completed || 0}</div>
              <div className="text-[#8BAE5A] text-sm">Missies voltooid</div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder voor toekomstige features */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-2">Recente activiteit</h3>
        <div className="bg-[#232D1A]/80 rounded-lg px-4 py-3 text-white border border-[#3A4D23]/40">
          <div className="text-[#8BAE5A] text-sm">Activiteit tracking komt binnenkort beschikbaar</div>
        </div>
      </div>

      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#232D1A] text-[#8BAE5A] px-6 py-3 rounded-xl shadow-lg border border-[#3A4D23]/40 z-50 animate-fade-in">
          {notification}
        </div>
      )}
    </div>
  );
} 