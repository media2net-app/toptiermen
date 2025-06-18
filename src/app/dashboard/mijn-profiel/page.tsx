'use client';
import ClientLayout from '../../components/ClientLayout';
import { useState, useEffect, useRef } from 'react';
import { CameraIcon, TrashIcon } from '@heroicons/react/24/solid';
import CropModal from '../../../components/CropModal';

const tabs = [
  { key: 'publiek', label: 'Mijn Publieke Profiel' },
  { key: 'voortgang', label: 'Mijn Voortgang' },
  { key: 'instellingen', label: 'Account & Instellingen' },
];

export default function MijnProfiel() {
  const [activeTab, setActiveTab] = useState('publiek');
  // Profiel state
  const [cover, setCover] = useState<string | null>(null);
  const [profile, setProfile] = useState<string | null>(null);
  const [bio, setBio] = useState('Mijn #1 Doel: Financiële vrijheid voor mijn 30e.');
  const [editBio, setEditBio] = useState(false);
  const coverInput = useRef<HTMLInputElement>(null);
  const profileInput = useRef<HTMLInputElement>(null);
  const [showCrop, setShowCrop] = useState<{ type: 'cover' | 'profile', src: string, aspect: number } | null>(null);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCover(localStorage.getItem('ttm_cover'));
      setProfile(localStorage.getItem('ttm_profile'));
      setBio(localStorage.getItem('ttm_bio') || 'Mijn #1 Doel: Financiële vrijheid voor mijn 30e.');
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (cover) localStorage.setItem('ttm_cover', cover);
    if (profile) localStorage.setItem('ttm_profile', profile);
    if (bio) localStorage.setItem('ttm_bio', bio);
  }, [cover, profile, bio]);

  // Handle uploads
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void, type: 'cover' | 'profile', aspect: number) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setShowCrop({ type, src: ev.target.result as string, aspect });
    };
    reader.readAsDataURL(file);
  }

  function handleCropDone(cropped: string) {
    if (showCrop?.type === 'cover') setCover(cropped);
    if (showCrop?.type === 'profile') setProfile(cropped);
    setShowCrop(null);
  }

  function handleRemove(type: 'cover' | 'profile') {
    if (type === 'cover') setCover(null);
    if (type === 'profile') setProfile(null);
  }

  return (
    <ClientLayout>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mijn Profiel</h1>
      <p className="text-[#8BAE5A] text-lg mb-8">Beheer je profiel, voortgang en instellingen</p>
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all text-sm md:text-base ${activeTab === tab.key ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] shadow' : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#2A341F]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 md:p-10">
        {activeTab === 'publiek' && (
          <div>
            {/* Cover + Profielfoto */}
            <div className="relative mb-8">
              <div className="h-32 md:h-48 w-full rounded-2xl bg-gradient-to-r from-[#8BAE5A]/30 to-[#FFD700]/20 flex items-end justify-center overflow-hidden cursor-pointer group" onClick={() => coverInput.current?.click()}>
                {cover ? (
                  <img src={cover} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#8BAE5A]/60 text-2xl md:text-3xl font-bold p-4 group-hover:underline">Klik om cover foto te uploaden</span>
                )}
                {/* Camera icon overlay */}
                <div className="absolute right-4 bottom-4 bg-black/60 rounded-full p-2 flex items-center justify-center group-hover:opacity-100 opacity-80 transition-all pointer-events-none">
                  <CameraIcon className="w-6 h-6 text-[#FFD700]" />
                </div>
                {/* Remove button */}
                {cover && (
                  <button className="absolute left-4 bottom-4 bg-black/70 rounded-full p-2 flex items-center justify-center hover:bg-red-700 transition-all" onClick={e => { e.stopPropagation(); handleRemove('cover'); }} title="Verwijder cover foto">
                    <TrashIcon className="w-6 h-6 text-white" />
                  </button>
                )}
                <input type="file" accept="image/*" ref={coverInput} className="hidden" onChange={e => handleImageUpload(e, setCover, 'cover', 3)} />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 md:-bottom-14 z-10 cursor-pointer group" onClick={() => profileInput.current?.click()}>
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-[#FFD700] bg-[#232D1A] flex items-center justify-center overflow-hidden shadow-lg relative">
                  {profile ? (
                    <img src={profile} alt="Profielfoto" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#8BAE5A]/60 text-3xl group-hover:underline">Klik om profielfoto te uploaden</span>
                  )}
                  {/* Camera icon overlay */}
                  <div className="absolute right-1 bottom-1 bg-black/60 rounded-full p-1 flex items-center justify-center group-hover:opacity-100 opacity-80 transition-all pointer-events-none">
                    <CameraIcon className="w-5 h-5 text-[#FFD700]" />
                  </div>
                  {/* Remove button */}
                  {profile && (
                    <button className="absolute left-1 bottom-1 bg-black/70 rounded-full p-1 flex items-center justify-center hover:bg-red-700 transition-all" onClick={e => { e.stopPropagation(); handleRemove('profile'); }} title="Verwijder profielfoto">
                      <TrashIcon className="w-5 h-5 text-white" />
                    </button>
                  )}
                  <input type="file" accept="image/*" ref={profileInput} className="hidden" onChange={e => handleImageUpload(e, setProfile, 'profile', 1)} />
                </div>
              </div>
            </div>
            <div className="mt-14 text-center">
              <span className="text-2xl font-bold text-white block mb-2">Jouw Naam</span>
              {editBio ? (
                <div className="flex flex-col items-center gap-2 mb-4">
                  <textarea value={bio} onChange={e => setBio(e.target.value)} className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] w-full max-w-md" rows={2} />
                  <button className="px-4 py-1 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow" onClick={() => setEditBio(false)}>Opslaan</button>
                </div>
              ) : (
                <span className="text-[#8BAE5A] italic block mb-4 cursor-pointer hover:underline" onClick={() => setEditBio(true)}>{bio}</span>
              )}
              {/* Pinned Badges */}
              <div className="flex justify-center gap-4 mb-6">
                {[1,2,3].map(i => (
                  <div key={i} className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8BAE5A]/30 to-[#FFD700]/20 flex items-center justify-center shadow border border-[#3A4D23]/40">
                    <span className="text-[#FFD700] text-2xl">🏅</span>
                  </div>
                ))}
                <button className="w-16 h-16 rounded-xl border-2 border-dashed border-[#8BAE5A] flex items-center justify-center text-[#8BAE5A] text-2xl">+</button>
              </div>
              {/* Activiteitenoverzicht */}
              <div className="bg-[#232D1A] rounded-xl p-4 shadow border border-[#3A4D23]/40 max-w-xl mx-auto mb-4">
                <div className="text-[#8BAE5A] font-semibold mb-2">Recente activiteit</div>
                <ul className="text-left text-white/90 text-sm space-y-1">
                  <li>• Recente forumpost: 'Hoe investeer je je eerste €1000?'</li>
                  <li>• Aangemeld voor het evenement: 'Online Workshop: Onderhandelen als een Pro'</li>
                  <li>• Lid van de Mastermind groep: 'Crypto & DeFi Pioniers'</li>
                </ul>
              </div>
              <button className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow hover:from-[#FFD700] hover:to-[#8BAE5A]">Bekijk als ander lid</button>
            </div>
          </div>
        )}
        {activeTab === 'voortgang' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Statistieken */}
              <div className="bg-[#232D1A] rounded-xl p-6 shadow border border-[#3A4D23]/40 flex flex-col gap-2">
                <span className="text-lg font-bold text-[#8BAE5A] mb-2">Statistieken</span>
                <span className="text-white">Totaal voltooide missies: <b>24</b></span>
                <span className="text-white">Langste streak: <b>17 dagen</b></span>
                <span className="text-white">Boeken gelezen: <b>8</b></span>
              </div>
              {/* Badge overzicht */}
              <div className="bg-[#232D1A] rounded-xl p-6 shadow border border-[#3A4D23]/40 flex flex-col gap-2">
                <span className="text-lg font-bold text-[#FFD700] mb-2">Badges & Rang</span>
                <span className="text-white">Huidige rang: <b>Warrior</b></span>
                <div className="flex gap-2 mt-2">
                  {[1,2,3,4].map(i => (
                    <span key={i} className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8BAE5A]/30 to-[#FFD700]/20 flex items-center justify-center shadow border border-[#3A4D23]/40 text-[#FFD700] text-xl">🏅</span>
                  ))}
                </div>
              </div>
            </div>
            {/* Grafieken (placeholders) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-[#232D1A] rounded-xl p-6 shadow border border-[#3A4D23]/40">
                <span className="text-lg font-bold text-[#8BAE5A] mb-2 block">Gewicht & Lichaam</span>
                <div className="h-32 flex items-center justify-center text-[#8BAE5A]/60">[Grafiek Gewicht]</div>
              </div>
              <div className="bg-[#232D1A] rounded-xl p-6 shadow border border-[#3A4D23]/40">
                <span className="text-lg font-bold text-[#8BAE5A] mb-2 block">Trainingsresultaten</span>
                <div className="h-32 flex items-center justify-center text-[#8BAE5A]/60">[Grafiek Training]</div>
              </div>
              <div className="bg-[#232D1A] rounded-xl p-6 shadow border border-[#3A4D23]/40">
                <span className="text-lg font-bold text-[#8BAE5A] mb-2 block">Financiën</span>
                <div className="h-32 flex items-center justify-center text-[#8BAE5A]/60">[Grafiek Netto Waarde]</div>
              </div>
              <div className="bg-[#232D1A] rounded-xl p-6 shadow border border-[#3A4D23]/40">
                <span className="text-lg font-bold text-[#8BAE5A] mb-2 block">Foto Gallerij</span>
                <div className="h-32 flex items-center justify-center text-[#8BAE5A]/60">[Voor/Na Foto's]</div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'instellingen' && (
          <div className="max-w-xl mx-auto">
            <span className="text-lg font-bold text-[#8BAE5A] mb-4 block">Accountgegevens</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]" placeholder="Naam" />
              <input className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]" placeholder="E-mailadres" />
              <input className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]" placeholder="Wachtwoord wijzigen" type="password" />
            </div>
            <span className="text-lg font-bold text-[#8BAE5A] mb-4 block">App-instellingen</span>
            <div className="mb-6">
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" className="accent-[#8BAE5A]" /> Donker thema
              </label>
              <input className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] mb-2" placeholder="Doelen & Beschikbaarheid" />
            </div>
            <span className="text-lg font-bold text-[#8BAE5A] mb-4 block">Notificatie Voorkeuren</span>
            <div className="flex flex-col gap-2 mb-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#8BAE5A]" /> Stuur me een e-mail over nieuwe forumreacties.
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#8BAE5A]" /> Stuur me een push-notificatie als herinnering voor mijn dagboek.
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-[#8BAE5A]" /> Houd me op de hoogte van nieuwe evenementen.
              </label>
            </div>
            <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow hover:from-[#FFD700] hover:to-[#8BAE5A] w-full">Wijzigingen opslaan</button>
          </div>
        )}
      </div>
      {showCrop && (
        <CropModal image={showCrop.src} aspect={showCrop.aspect} onClose={() => setShowCrop(null)} onCrop={handleCropDone} />
      )}
    </ClientLayout>
  );
} 