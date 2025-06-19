'use client';
import ClientLayout from '../../components/ClientLayout';
import { useState, useEffect, useRef } from 'react';
import { CameraIcon, TrashIcon, PlusIcon, UserGroupIcon, TrophyIcon, FireIcon, BookOpenIcon, ArrowDownTrayIcon, ShieldCheckIcon, BellIcon } from '@heroicons/react/24/solid';
import CropModal from '../../../components/CropModal';
import { toast } from 'react-toastify';

const tabs = [
  { key: 'publiek', label: 'Mijn Publieke Profiel' },
  { key: 'voortgang', label: 'Mijn Voortgang' },
  { key: 'instellingen', label: 'Account & Instellingen' },
  { key: 'notificaties', label: 'Notificaties' },
];

export default function MijnProfiel() {
  const [activeTab, setActiveTab] = useState('publiek');
  // Profiel state
  const [cover, setCover] = useState<string | null>(null);
  const [profile, setProfile] = useState<string | null>(null);
  const [bio, setBio] = useState('Mijn #1 Doel: Financiële vrijheid voor mijn 30e.');
  const [editBio, setEditBio] = useState(false);
  const [name, setName] = useState('Rick Cuijpers');
  const [location, setLocation] = useState('Amsterdam, NL');
  const [interests, setInterests] = useState(['Fitness', 'Investing', 'Mindset']);
  const [editInterests, setEditInterests] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState('everyone'); // 'everyone' | 'connections'
  const [activityVisibility, setActivityVisibility] = useState(true);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState({
    forumReplies: true,
    connectionRequests: true,
    eventReminders: true,
    weeklyProgress: true,
  });
  
  const coverInput = useRef<HTMLInputElement>(null);
  const profileInput = useRef<HTMLInputElement>(null);
  const [showCrop, setShowCrop] = useState<{ type: 'cover' | 'profile', src: string, aspect: number } | null>(null);

  // Mock data voor cross-module integratie
  const personalBests = [
    { icon: '🏋️‍♂️', label: 'Squat', value: '120kg' },
    { icon: '🏃‍♂️', label: 'Snelste 5km', value: '24:15' },
    { icon: '📚', label: 'Gelezen boeken', value: '12' },
    { icon: '💰', label: 'Netto waarde', value: '€12.500' },
  ];

  const recentActivity = [
    { type: 'forum', content: 'Hoe investeer je je eerste €1000?', time: '2 uur geleden' },
    { type: 'event', content: 'Aangemeld voor: Online Workshop: Onderhandelen als een Pro', time: '1 dag geleden' },
    { type: 'group', content: 'Lid van: Crypto & DeFi Pioniers', time: '3 dagen geleden' },
    { type: 'pr', content: 'Nieuw PR: Deadlift 140kg!', time: '1 week geleden' },
  ];

  const mutualConnections = ['Mark V.', 'Jeroen D.', 'Sven'];

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCover(localStorage.getItem('ttm_cover'));
      setProfile(localStorage.getItem('ttm_profile'));
      setBio(localStorage.getItem('ttm_bio') || 'Mijn #1 Doel: Financiële vrijheid voor mijn 30e.');
      setName(localStorage.getItem('ttm_name') || 'Rick Cuijpers');
      setLocation(localStorage.getItem('ttm_location') || 'Amsterdam, NL');
      const savedInterests = localStorage.getItem('ttm_interests');
      if (savedInterests) setInterests(JSON.parse(savedInterests));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (cover) localStorage.setItem('ttm_cover', cover);
    if (profile) localStorage.setItem('ttm_profile', profile);
    if (bio) localStorage.setItem('ttm_bio', bio);
    if (name) localStorage.setItem('ttm_name', name);
    if (location) localStorage.setItem('ttm_location', location);
    localStorage.setItem('ttm_interests', JSON.stringify(interests));
  }, [cover, profile, bio, name, location, interests]);

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

  function addInterest() {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  }

  function removeInterest(interest: string) {
    setInterests(interests.filter(i => i !== interest));
  }

  function exportData() {
    const data = {
      name,
      location,
      interests,
      personalBests,
      stats: {
        completedMissions: 24,
        longestStreak: '17 dagen',
        booksRead: 8,
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toptiermen-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Data geëxporteerd!');
  }

  return (
    <ClientLayout>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mijn Profiel</h1>
      <p className="text-[#8BAE5A] text-lg mb-8">Beheer je profiel, voortgang en instellingen</p>
      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all text-sm md:text-base whitespace-nowrap ${activeTab === tab.key ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] shadow' : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#2A341F]'}`}
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
              <span className="text-2xl font-bold text-white block mb-2">{name}</span>
              <span className="text-[#8BAE5A] text-sm block mb-4">{location}</span>
              {editBio ? (
                <div className="flex flex-col items-center gap-2 mb-4">
                  <textarea value={bio} onChange={e => setBio(e.target.value)} className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] w-full max-w-md" rows={2} />
                  <button className="px-4 py-1 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow" onClick={() => setEditBio(false)}>Opslaan</button>
                </div>
              ) : (
                <span className="text-[#8BAE5A] italic block mb-4 cursor-pointer hover:underline" onClick={() => setEditBio(true)}>{bio}</span>
              )}
              
              {/* Gezamenlijke Connecties */}
              <div className="bg-[#181F17] rounded-xl p-4 shadow border border-[#3A4D23]/40 max-w-xl mx-auto mb-4">
                <div className="text-[#8BAE5A] font-semibold mb-2 flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5" />
                  Jullie hebben {mutualConnections.length} gezamenlijke connecties
                </div>
                <div className="flex flex-wrap gap-2">
                  {mutualConnections.map((connection, index) => (
                    <span key={index} className="px-3 py-1 rounded-full bg-[#8BAE5A]/20 text-[#8BAE5A] text-sm font-medium">
                      {connection}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connectie knop */}
              <button className="mb-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all flex items-center gap-2 mx-auto">
                <PlusIcon className="w-5 h-5" />
                Maak Connectie
              </button>

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
                <ul className="text-left text-white/90 text-sm space-y-2">
                  {recentActivity.map((activity, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#8BAE5A]">•</span>
                      <div>
                        <span className="text-white">{activity.content}</span>
                        <span className="text-[#8BAE5A]/60 text-xs block">{activity.time}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <button className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow hover:from-[#FFD700] hover:to-[#8BAE5A]">Bekijk als ander lid</button>
            </div>
          </div>
        )}
        {activeTab === 'voortgang' && (
          <div>
            {/* Personal Bests - Prominent bovenaan */}
            <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#8BAE5A]/20 rounded-2xl p-6 shadow border border-[#FFD700]/30 mb-8">
              <h3 className="text-xl font-bold text-[#FFD700] mb-4 flex items-center gap-2">
                <TrophyIcon className="w-6 h-6" />
                Jouw Records
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {personalBests.map((best, index) => (
                  <div key={index} className="bg-[#232D1A] rounded-xl p-4 text-center shadow border border-[#3A4D23]/40">
                    <div className="text-2xl mb-2">{best.icon}</div>
                    <div className="text-white font-semibold">{best.value}</div>
                    <div className="text-[#8BAE5A] text-sm">{best.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Statistieken */}
              <div className="bg-[#232D1A] rounded-xl p-6 shadow border border-[#3A4D23]/40 flex flex-col gap-2">
                <span className="text-lg font-bold text-[#8BAE5A] mb-2 flex items-center gap-2">
                  <FireIcon className="w-5 h-5" />
                  Statistieken
                </span>
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
            
            {/* Export Data knop */}
            <div className="mb-8">
              <button 
                onClick={exportData}
                className="px-6 py-3 rounded-xl bg-[#232D1A] text-[#8BAE5A] font-semibold shadow border border-[#3A4D23] hover:bg-[#2A341F] transition-all flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Exporteer Mijn Data
              </button>
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
          <div className="max-w-2xl mx-auto">
            <span className="text-lg font-bold text-[#8BAE5A] mb-4 block">Accountgegevens</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]" 
                placeholder="Naam" 
              />
              <input 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]" 
                placeholder="Locatie" 
              />
              <input className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]" placeholder="E-mailadres" />
              <input className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]" placeholder="Wachtwoord wijzigen" type="password" />
            </div>
            
            {/* Interesses */}
            <span className="text-lg font-bold text-[#8BAE5A] mb-4 block">Interesses & Locatie</span>
            <div className="mb-6">
              <p className="text-[#8BAE5A]/80 text-sm mb-3">
                Vul je interesses en locatie in om makkelijker gevonden te worden door gelijkgestemde broeders en lokale groepen.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {interests.map((interest, index) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-[#8BAE5A]/20 text-[#8BAE5A] text-sm font-medium flex items-center gap-1">
                    {interest}
                    <button 
                      onClick={() => removeInterest(interest)}
                      className="text-[#8BAE5A]/60 hover:text-[#8BAE5A]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {editInterests ? (
                <div className="flex gap-2">
                  <input 
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    className="flex-1 rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]" 
                    placeholder="Voeg interesse toe" 
                  />
                  <button 
                    onClick={addInterest}
                    className="px-4 py-2 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold"
                  >
                    Toevoegen
                  </button>
                  <button 
                    onClick={() => setEditInterests(false)}
                    className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] font-semibold border border-[#3A4D23]"
                  >
                    Klaar
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setEditInterests(true)}
                  className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#2A341F]"
                >
                  + Interesse toevoegen
                </button>
              )}
            </div>

            {/* Privacy Instellingen */}
            <span className="text-lg font-bold text-[#8BAE5A] mb-4 block flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5" />
              Privacy
            </span>
            <div className="mb-6 space-y-4">
              <div>
                <label className="text-white font-medium block mb-2">Mijn profiel is zichtbaar voor:</label>
                <select 
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                  className="w-full rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="everyone">Iedereen in de Brotherhood</option>
                  <option value="connections">Alleen mijn connecties</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={activityVisibility}
                  onChange={(e) => setActivityVisibility(e.target.checked)}
                  className="accent-[#8BAE5A]" 
                /> 
                Mijn activiteit (posts, prestaties) tonen op de algemene Social Feed
              </label>
            </div>

            <span className="text-lg font-bold text-[#8BAE5A] mb-4 block">App-instellingen</span>
            <div className="mb-6">
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" className="accent-[#8BAE5A]" defaultChecked /> Donker thema
              </label>
              <input className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] mb-2 w-full" placeholder="Doelen & Beschikbaarheid" />
            </div>
            <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow hover:from-[#FFD700] hover:to-[#8BAE5A] w-full">Wijzigingen opslaan</button>
          </div>
        )}
        {activeTab === 'notificaties' && (
          <div className="max-w-2xl mx-auto">
            <span className="text-lg font-bold text-[#8BAE5A] mb-4 block flex items-center gap-2">
              <BellIcon className="w-5 h-5" />
              Notificatie Voorkeuren
            </span>
            <p className="text-[#8BAE5A]/80 text-sm mb-6">
              Beheer hier welke notificaties je wilt ontvangen. Deze instellingen bepalen wat je ziet in het 🔔-icoon in de hoofdnavigatie.
            </p>
            <div className="space-y-4 mb-6">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={emailNotifications.forumReplies}
                  onChange={(e) => setEmailNotifications({...emailNotifications, forumReplies: e.target.checked})}
                  className="accent-[#8BAE5A]" 
                /> 
                Stuur me een e-mail over nieuwe forumreacties
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={emailNotifications.connectionRequests}
                  onChange={(e) => setEmailNotifications({...emailNotifications, connectionRequests: e.target.checked})}
                  className="accent-[#8BAE5A]" 
                /> 
                Stuur me een push-notificatie bij nieuwe connectieverzoeken
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={emailNotifications.eventReminders}
                  onChange={(e) => setEmailNotifications({...emailNotifications, eventReminders: e.target.checked})}
                  className="accent-[#8BAE5A]" 
                /> 
                Houd me op de hoogte van nieuwe evenementen
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={emailNotifications.weeklyProgress}
                  onChange={(e) => setEmailNotifications({...emailNotifications, weeklyProgress: e.target.checked})}
                  className="accent-[#8BAE5A]" 
                /> 
                Stuur me een wekelijkse voortgangsrapport
              </label>
            </div>
            <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow hover:from-[#FFD700] hover:to-[#8BAE5A] w-full">Notificatie-instellingen opslaan</button>
          </div>
        )}
      </div>
      {showCrop && (
        <CropModal image={showCrop.src} aspect={showCrop.aspect} onClose={() => setShowCrop(null)} onCrop={handleCropDone} />
      )}
    </ClientLayout>
  );
} 