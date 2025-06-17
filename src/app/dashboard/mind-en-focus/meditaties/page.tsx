'use client';
import ClientLayout from '../../../components/ClientLayout';
import { useState } from 'react';
import { FaPlay, FaHeart, FaRegHeart, FaSearch } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const meditaties = [
  {
    id: 1,
    title: 'Ochtend Focus',
    speaker: 'Ruben',
    duration: 10,
    type: 'Focus',
    favorite: true,
  },
  {
    id: 2,
    title: 'Diepe Slaap',
    speaker: 'Sarah',
    duration: 20,
    type: 'Slaap',
    favorite: false,
  },
  {
    id: 3,
    title: 'Stress Loslaten',
    speaker: 'Ruben',
    duration: 8,
    type: 'Stressreductie',
    favorite: false,
  },
  {
    id: 4,
    title: 'Energie Boost',
    speaker: 'Sarah',
    duration: 5,
    type: 'Energie',
    favorite: false,
  },
  {
    id: 5,
    title: 'Avond Reflectie',
    speaker: 'Ruben',
    duration: 15,
    type: 'Focus',
    favorite: true,
  },
];

const types = ['Alles', 'Focus', 'Slaap', 'Stressreductie', 'Energie'];
const durations = ['Alles', '1-5 min', '5-10 min', '10-20 min', '20+ min'];
const speakers = ['Alles', 'Ruben', 'Sarah'];

export default function MeditatieBibliotheek() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('Alles');
  const [duration, setDuration] = useState('Alles');
  const [speaker, setSpeaker] = useState('Alles');
  const [playing, setPlaying] = useState<null | typeof meditaties[0]>(null);
  const [favorites, setFavorites] = useState(meditaties.filter(m => m.favorite).map(m => m.id));

  // Filter logica
  const filtered = meditaties.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchType = type === 'Alles' || m.type === type;
    const matchSpeaker = speaker === 'Alles' || m.speaker === speaker;
    const matchDuration =
      duration === 'Alles' ||
      (duration === '1-5 min' && m.duration <= 5) ||
      (duration === '5-10 min' && m.duration > 5 && m.duration <= 10) ||
      (duration === '10-20 min' && m.duration > 10 && m.duration <= 20) ||
      (duration === '20+ min' && m.duration > 20);
    return matchSearch && matchType && matchSpeaker && matchDuration;
  });

  // Favoriet toggle
  const toggleFavorite = (id: number) => {
    setFavorites(favs => favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]);
  };

  return (
    <ClientLayout>
      <div className="py-8 px-4 md:px-12 max-w-4xl mx-auto">
        <a href="/dashboard/mind-en-focus" className="text-[#8BAE5A] hover:underline mb-6 inline-block">← Terug naar Mind & Focus</a>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Meditatie Bibliotheek</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-6 text-[#8BAE5A] text-lg font-medium">
            <span>Totale meditatietijd: <span className="text-white font-bold">8 uur 24 min</span></span>
            <span>Huidige streak: <span className="text-white font-bold">9 dagen</span></span>
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
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={duration} onChange={e => setDuration(e.target.value)} className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]">
            {durations.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={speaker} onChange={e => setSpeaker(e.target.value)} className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]">
            {speakers.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        {/* Meditatielijst */}
        <div className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 divide-y divide-[#3A4D23]/40">
          {filtered.length === 0 && (
            <div className="p-8 text-center text-[#8BAE5A]">Geen meditaties gevonden.</div>
          )}
          {filtered.map(m => (
            <div key={m.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#2A341F]/60 transition group">
              <div className="flex items-center gap-4">
                <button onClick={() => setPlaying(m)} className="w-10 h-10 rounded-full bg-[#8BAE5A] flex items-center justify-center text-[#232D1A] text-lg shadow-lg group-hover:scale-110 transition-transform"><FaPlay /></button>
                <div>
                  <div className="text-lg font-semibold text-white group-hover:text-[#8BAE5A]">{m.title}</div>
                  <div className="text-xs text-[#8BAE5A]/80">{m.speaker}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-white font-medium">{m.duration} min</span>
                <button onClick={() => toggleFavorite(m.id)}>{favorites.includes(m.id) ? <FaHeart className="text-[#FFD700]" /> : <FaRegHeart className="text-[#8BAE5A]" />}</button>
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
                {/* Rustgevende afbeelding kan hier */}
                <FaPlay className="text-[#8BAE5A] text-5xl" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">{playing.title}</div>
              <div className="text-[#8BAE5A] mb-4">{playing.speaker} • {playing.duration} min</div>
              <button className="w-20 h-20 rounded-full bg-[#8BAE5A] flex items-center justify-center text-[#232D1A] text-3xl shadow-lg mb-4"><FaPlay /></button>
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
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 