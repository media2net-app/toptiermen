'use client';
import ClientLayout from '../../../components/ClientLayout';
import { useState, useEffect, Suspense } from 'react';
import { FaPlay, FaHeart, FaRegHeart, FaSearch, FaSpinner } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Meditation {
  id: string;
  title: string;
  type: string;
  duration: number;
  description: string;
  instructions: string;
  audio_url?: string;
  is_premium: boolean;
}

const types = ['all', 'focus', 'stress', 'recovery', 'performance', 'sleep'];
const durations = ['Alles', '1-5 min', '5-10 min', '10-20 min', '20+ min'];

function MeditatieBibliotheekContent() {
  const { user } = useSupabaseAuth();
  const searchParams = useSearchParams();
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState(searchParams?.get('type') || 'all');
  const [duration, setDuration] = useState('Alles');
  const [playing, setPlaying] = useState<null | Meditation>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [streak, setStreak] = useState(0);

  // Update type when URL parameter changes
  useEffect(() => {
    const urlType = searchParams?.get('type');
    if (urlType && urlType !== type) {
      setType(urlType);
    }
  }, [searchParams, type]);

  // Load meditations from database
  useEffect(() => {
    const fetchMeditations = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/mind-focus/meditation-library?type=${type === 'all' ? '' : type}`);
        const data = await response.json();
        
        if (data.success) {
          setMeditations(data.meditations || []);
        } else {
          toast.error('Kon meditaties niet laden');
        }
      } catch (error) {
        console.error('Error fetching meditations:', error);
        toast.error('Kon meditaties niet laden');
      } finally {
        setLoading(false);
      }
    };

    fetchMeditations();
  }, [user?.id, type]);

  // Filter logica
  const filtered = meditations.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
                       m.description.toLowerCase().includes(search.toLowerCase());
    const matchDuration =
      duration === 'Alles' ||
      (duration === '1-5 min' && m.duration <= 5) ||
      (duration === '5-10 min' && m.duration > 5 && m.duration <= 10) ||
      (duration === '10-20 min' && m.duration > 10 && m.duration <= 20) ||
      (duration === '20+ min' && m.duration > 20);
    return matchSearch && matchDuration;
  });

  // Start meditation session
  const startSession = async (meditation: Meditation) => {
    if (!user?.id) {
      toast.error('Je moet ingelogd zijn om te mediteren');
      return;
    }

    try {
      const sessionId = `session_${Date.now()}`;
      const response = await fetch('/api/mind-focus/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          sessionId,
          type: meditation.type,
          duration: meditation.duration,
          completed: false,
          moodBefore: null,
          moodAfter: null,
          stressBefore: null,
          stressAfter: null
        })
      });

      if (response.ok) {
        setPlaying(meditation);
        toast.success('Meditatie sessie gestart!');
      } else {
        toast.error('Kon sessie niet starten');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Kon sessie niet starten');
    }
  };

  // Complete meditation session
  const completeSession = async (meditation: Meditation) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/mind-focus/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          sessionId: `session_${Date.now()}`,
          type: meditation.type,
          duration: meditation.duration,
          completed: true,
          moodBefore: 5,
          moodAfter: 7,
          stressBefore: 6,
          stressAfter: 4
        })
      });

      if (response.ok) {
        toast.success('Meditatie voltooid! Goed gedaan!');
        setPlaying(null);
        setTotalTime(prev => prev + meditation.duration);
        setStreak(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  // Favoriet toggle
  const toggleFavorite = (id: string) => {
    setFavorites(favs => favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]);
  };

  return (
    <ClientLayout>
      <div className="w-full max-w-7xl mx-auto">
        <a href="/dashboard/mind-en-focus" className="text-[#8BAE5A] hover:underline mb-6 inline-block">← Terug naar Mind & Focus</a>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Meditatie Bibliotheek</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-6 text-[#8BAE5A] text-lg font-medium">
            <span>Totale meditatietijd: <span className="text-white font-bold">{Math.floor(totalTime / 60)}u {totalTime % 60}m</span></span>
            <span>Huidige streak: <span className="text-white font-bold">{streak} dagen</span></span>
          </div>
        </div>
        {/* Zoek & filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Zoek een meditatie op naam of thema..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 pl-10 pr-4 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8BAE5A]" />
          </div>
          <select value={type} onChange={e => setType(e.target.value)} className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]">
            <option value="all">Alles</option>
            <option value="focus">Focus</option>
            <option value="stress">Stress</option>
            <option value="recovery">Recovery</option>
            <option value="performance">Performance</option>
            <option value="sleep">Slaap</option>
          </select>
          <select value={duration} onChange={e => setDuration(e.target.value)} className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]">
            {durations.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        {/* Meditatielijst */}
        <div className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 divide-y divide-[#3A4D23]/40">
          {loading && (
            <div className="p-8 text-center text-[#8BAE5A] flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin" />
              Meditaties laden...
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="p-8 text-center text-[#8BAE5A]">Geen meditaties gevonden.</div>
          )}
          {!loading && filtered.map(m => (
            <div key={m.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#2A341F]/60 transition group">
              <div className="flex items-center gap-4">
                <button onClick={() => startSession(m)} className="w-10 h-10 rounded-full bg-[#8BAE5A] flex items-center justify-center text-[#232D1A] text-lg shadow-lg group-hover:scale-110 transition-transform">
                  <FaPlay />
                </button>
                <div>
                  <div className="text-lg font-semibold text-white group-hover:text-[#8BAE5A]">{m.title}</div>
                  <div className="text-xs text-[#8BAE5A]/80 capitalize">{m.type} • {m.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-white font-medium">{m.duration} min</span>
                {m.is_premium && <span className="text-[#FFD700] text-xs">Premium</span>}
                <button onClick={() => toggleFavorite(m.id)}>
                  {favorites.includes(m.id) ? <FaHeart className="text-[#FFD700]" /> : <FaRegHeart className="text-[#8BAE5A]" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Meditatie Speler Modal */}
        {playing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-[#232D1A] rounded-2xl shadow-2xl p-8 max-w-md w-full relative flex flex-col items-center">
              <button className="absolute top-4 right-4 text-white text-2xl hover:text-[#8BAE5A]" onClick={() => setPlaying(null)}><IoMdClose /></button>
              <div className="w-full h-48 bg-gradient-to-br from-[#8BAE5A]/30 to-[#232D1A] rounded-xl flex items-center justify-center mb-6">
                <FaPlay className="text-[#8BAE5A] text-5xl" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">{playing.title}</div>
              <div className="text-[#8BAE5A] mb-2 capitalize">{playing.type} • {playing.duration} min</div>
              <div className="text-[#8BAE5A]/80 text-sm text-center mb-6">{playing.description}</div>
              <button 
                onClick={() => completeSession(playing)}
                className="w-20 h-20 rounded-full bg-[#8BAE5A] flex items-center justify-center text-[#232D1A] text-3xl shadow-lg mb-4 hover:scale-110 transition-transform"
              >
                <FaPlay />
              </button>
              <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full mb-4">
                <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full" style={{ width: '30%' }}></div>
              </div>
              <div className="flex items-center justify-between w-full text-[#8BAE5A] text-xs">
                <span>0:00</span>
                <span>{playing.duration}:00</span>
              </div>
              <div className="mt-6 flex gap-4 items-center">
                <span className="text-[#8BAE5A]">Volume</span>
                <input type="range" min={0} max={100} defaultValue={80} className="accent-[#8BAE5A]" />
              </div>
              <button 
                onClick={() => completeSession(playing)}
                className="mt-4 px-6 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors"
              >
                Voltooien
              </button>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}

export default function MeditatieBibliotheek() {
  return (
    <Suspense fallback={
      <ClientLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] to-[#1A2A1A] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948]"></div>
        </div>
      </ClientLayout>
    }>
      <MeditatieBibliotheekContent />
    </Suspense>
  );
} 