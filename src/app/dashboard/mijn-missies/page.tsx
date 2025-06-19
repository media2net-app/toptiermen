'use client';
import ClientLayout from '../../components/ClientLayout';
import { useState, useEffect } from 'react';
import { PlusIcon, TrophyIcon, FireIcon, UserGroupIcon, CheckCircleIcon, StarIcon, BookOpenIcon, HeartIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

// Missie types en categorieën
const missionCategories = {
  'Gezondheid & Fitness': [
    { id: 'water', title: 'Drink 3L water', icon: '💧', badge: 'Hydration Master', progress: 0 },
    { id: 'stretch', title: '30 min stretchen', icon: '🧘‍♂️', badge: 'Flexibility King', progress: 0 },
    { id: 'steps', title: '10.000 stappen', icon: '👟', badge: 'Step Master', progress: 0 },
    { id: 'cold-shower', title: 'Koud douchen', icon: '❄️', badge: 'Ice Warrior', progress: 0 },
  ],
  'Mindset & Focus': [
    { id: 'meditate', title: '10 min mediteren', icon: '🧘‍♂️', badge: 'Mind Master', progress: 0 },
    { id: 'no-social', title: 'Geen social media voor 9:00', icon: '📱', badge: 'Digital Minimalist', progress: 0 },
    { id: 'gratitude', title: 'Dankbaarheidsdagboek', icon: '🙏', badge: 'Gratitude Guru', progress: 0 },
    { id: 'reading', title: '30 min lezen', icon: '📚', badge: 'Leesworm', progress: 0 },
  ],
  'Financiën & Werk': [
    { id: 'side-hustle', title: '30 min werken aan side-hustle', icon: '💼', badge: 'Entrepreneur', progress: 0 },
    { id: 'network', title: 'Netwerkbericht sturen', icon: '🤝', badge: 'Networker', progress: 0 },
    { id: 'budget', title: 'Budget bijwerken', icon: '💰', badge: 'Money Master', progress: 0 },
    { id: 'invest', title: 'Investeringsonderzoek', icon: '📈', badge: 'Investment Pro', progress: 0 },
  ],
};

const initialMissions = [
  { 
    id: 1, 
    title: '10.000 stappen per dag', 
    type: 'Dagelijks', 
    done: true, 
    category: 'Gezondheid & Fitness',
    icon: '👟',
    badge: 'Step Master',
    progress: 75,
    shared: false,
    accountabilityPartner: null
  },
  { 
    id: 2, 
    title: '30 min lezen', 
    type: 'Dagelijks', 
    done: true, 
    category: 'Mindset & Focus',
    icon: '📚',
    badge: 'Leesworm',
    progress: 65,
    shared: false,
    accountabilityPartner: null
  },
  { 
    id: 3, 
    title: '3x sporten', 
    type: 'Wekelijks', 
    done: false, 
    category: 'Gezondheid & Fitness',
    icon: '🏋️‍♂️',
    badge: 'Fitness Warrior',
    progress: 33,
    shared: true,
    accountabilityPartner: 'Mark V.'
  },
  { 
    id: 4, 
    title: '2x mediteren', 
    type: 'Wekelijks', 
    done: false, 
    category: 'Mindset & Focus',
    icon: '🧘‍♂️',
    badge: 'Mind Master',
    progress: 50,
    shared: false,
    accountabilityPartner: null
  },
];

export default function MijnMissies() {
  const [missions, setMissions] = useState(initialMissions);
  const [filter, setFilter] = useState('deze week');
  const [showMissionManager, setShowMissionManager] = useState(false);
  const [showAddMission, setShowAddMission] = useState(false);
  const [newMission, setNewMission] = useState({ title: '', type: 'Dagelijks', category: 'Gezondheid & Fitness', shared: false });
  const [mainGoal, setMainGoal] = useState('Financiële Vrijheid');
  const [dailyStreak, setDailyStreak] = useState(12);
  const [completedToday, setCompletedToday] = useState(2);
  const [totalToday, setTotalToday] = useState(4);

  // Load main goal from localStorage
  useEffect(() => {
    const savedGoal = localStorage.getItem('ttm_main_goal');
    if (savedGoal) setMainGoal(savedGoal);
  }, []);

  const toggleMission = (id: number) => {
    setMissions(missions.map(mission => {
      if (mission.id === id) {
        const newDone = !mission.done;
        
        // Check if this completes all daily missions
        if (newDone && mission.type === 'Dagelijks') {
          const dailyMissions = missions.filter(m => m.type === 'Dagelijks');
          const allDailyCompleted = dailyMissions.every(m => m.id === id ? newDone : m.done);
          
          if (allDailyCompleted) {
            // Show completion celebration
            toast.success(`🎉 Alle missies voltooid! Je hebt je discipline voor vandaag getoond. Je dagelijkse streak is nu ${dailyStreak + 1} dagen. 🔥`);
            setDailyStreak(prev => prev + 1);
          }
        }
        
        return { ...mission, done: newDone };
      }
      return mission;
    }));
  };

  const addMission = () => {
    if (!newMission.title.trim()) return;
    
    const mission = {
      id: Date.now(),
      title: newMission.title,
      type: newMission.type,
      done: false,
      category: newMission.category,
      icon: '🎯',
      badge: 'Custom Badge',
      progress: 0,
      shared: newMission.shared,
      accountabilityPartner: null
    };
    
    setMissions([...missions, mission]);
    setNewMission({ title: '', type: 'Dagelijks', category: 'Gezondheid & Fitness', shared: false });
    setShowAddMission(false);
    
    if (newMission.shared) {
      toast.info('🔥 Je commitment is gedeeld met de Brotherhood!');
    }
  };

  const getGoalMessage = () => {
    const goalMessages = {
      'Financiële Vrijheid': 'De discipline die je vandaag traint met deze missies, is de brandstof voor jouw succes op de lange termijn.',
      'Fysieke Kracht': 'Elke afgevinkte missie bouwt aan jouw fysieke en mentale kracht.',
      'Mentale Focus': 'Deze dagelijkse gewoontes scherpen jouw geest en versterken jouw focus.',
      'Persoonlijke Groei': 'Elke voltooide missie brengt je dichter bij de beste versie van jezelf.'
    };
    return goalMessages[mainGoal as keyof typeof goalMessages] || 'Elke voltooide missie brengt je dichter bij jouw doel.';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-[#8BAE5A]';
    if (progress >= 60) return 'text-[#FFD700]';
    if (progress >= 40) return 'text-[#f0a14f]';
    return 'text-[#B6C948]';
  };

  return (
    <ClientLayout>
      <div className="p-6 md:p-12">
        {/* Focus van Vandaag Header */}
        <div className="bg-gradient-to-r from-[#8BAE5A]/20 to-[#FFD700]/20 rounded-2xl p-6 mb-8 border border-[#8BAE5A]/30">
          <h2 className="text-2xl font-bold text-[#FFD700] mb-2 flex items-center gap-2">
            <StarIcon className="w-6 h-6" />
            Focus van Vandaag
          </h2>
          <p className="text-white text-lg mb-2">
            Jouw hoofddoel is <span className="text-[#8BAE5A] font-bold">{mainGoal}</span>.
          </p>
          <p className="text-[#8BAE5A]/80">
            {getGoalMessage()}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-white">
              <FireIcon className="w-4 h-4 inline mr-1" />
              Streak: {dailyStreak} dagen
            </span>
            <span className="text-[#8BAE5A]">
              {completedToday}/{totalToday} missies voltooid vandaag
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mijn Missies</h1>
            <p className="text-[#8BAE5A] text-lg">Overzicht van je actieve en voltooide missies deze week</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowMissionManager(true)}
              className="px-6 py-3 rounded-xl bg-[#232D1A] text-[#8BAE5A] font-bold text-lg shadow border border-[#3A4D23] hover:bg-[#2A341F] transition-all flex items-center gap-2"
            >
              <TrophyIcon className="w-5 h-5" />
              Beheer Missies
            </button>
            <button 
              onClick={() => setShowAddMission(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-bold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all border border-[#8BAE5A] flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              + Nieuwe missie
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setFilter('deze week')} className={`px-4 py-2 rounded-full font-semibold transition ${filter === 'deze week' ? 'bg-[#232D1A] text-[#8BAE5A]' : 'text-[#B6C948] hover:text-[#8BAE5A]'}`}>Deze week</button>
          <button onClick={() => setFilter('alle')} className={`px-4 py-2 rounded-full font-semibold transition ${filter === 'alle' ? 'bg-[#232D1A] text-[#8BAE5A]' : 'text-[#B6C948] hover:text-[#8BAE5A]'}`}>Alle missies</button>
        </div>

        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
          {missions.length === 0 ? (
            <div className="text-[#8BAE5A] text-center py-12">Geen missies gevonden. Voeg een nieuwe missie toe!</div>
          ) : (
            <ul className="divide-y divide-[#3A4D23]">
              {missions.map(m => (
                <li key={m.id} className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleMission(m.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${m.done ? 'bg-[#8BAE5A] border-[#8BAE5A] text-[#181F17]' : 'bg-[#232D1A] border-[#3A4D23] text-[#8BAE5A] hover:border-[#8BAE5A]'}`}
                      >
                        {m.done && <CheckCircleIcon className="w-4 h-4" />}
                      </button>
                      <span className="text-2xl">{m.icon}</span>
                      <span className={`text-lg ${m.done ? 'line-through text-[#B6C948]' : 'text-white'}`}>{m.title}</span>
                      <span className="ml-2 px-2 py-0.5 rounded bg-[#3A4D23] text-[#8BAE5A] text-xs font-semibold">{m.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.shared && (
                        <span className="text-[#FFD700] text-sm flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          Gedeeld
                        </span>
                      )}
                      {m.accountabilityPartner && (
                        <span className="text-[#8BAE5A] text-sm">
                          Partner: {m.accountabilityPartner}
                        </span>
                      )}
                      {m.done && <span className="text-[#8BAE5A] text-sm">Voltooid</span>}
                    </div>
                  </div>
                  
                  {/* Badge Progressie */}
                  <div className="ml-11 mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <TrophyIcon className="w-4 h-4 text-[#FFD700]" />
                      <span className={`${getProgressColor(m.progress)}`}>
                        {m.badge}: {m.progress}% voltooid
                      </span>
                    </div>
                    <div className="w-full bg-[#3A4D23] rounded-full h-2 mt-1">
                      <div 
                        className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${m.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Missie Management Modal */}
        {showMissionManager && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#232D1A] rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Missie Management</h2>
                <button 
                  onClick={() => setShowMissionManager(false)}
                  className="text-[#8BAE5A] hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mijn Huidige Missies */}
                <div>
                  <h3 className="text-lg font-bold text-[#8BAE5A] mb-4">Mijn Huidige Missies</h3>
                  <div className="space-y-2">
                    {missions.map(mission => (
                      <div key={mission.id} className="bg-[#181F17] rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{mission.icon}</span>
                          <span className="text-white text-sm">{mission.title}</span>
                        </div>
                        <button className="text-red-400 hover:text-red-300 text-sm">Verwijder</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missie Bibliotheek */}
                <div>
                  <h3 className="text-lg font-bold text-[#8BAE5A] mb-4">Missie Bibliotheek</h3>
                  <div className="space-y-4">
                    {Object.entries(missionCategories).map(([category, missions]) => (
                      <div key={category}>
                        <h4 className="text-[#FFD700] font-semibold mb-2">{category}</h4>
                        <div className="space-y-2">
                          {missions.map(mission => (
                            <div key={mission.id} className="bg-[#181F17] rounded-xl p-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{mission.icon}</span>
                                <span className="text-white text-sm">{mission.title}</span>
                              </div>
                              <button className="text-[#8BAE5A] hover:text-[#FFD700] text-sm">Toevoegen</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Mission Modal */}
        {showAddMission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#232D1A] rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-6">Creëer Eigen Missie</h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Missie titel (bijv. 'Oefen 15 minuten gitaar')"
                  value={newMission.title}
                  onChange={(e) => setNewMission({...newMission, title: e.target.value})}
                  className="w-full rounded-xl bg-[#181F17] border border-[#3A4D23] py-3 px-4 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
                
                <select
                  value={newMission.type}
                  onChange={(e) => setNewMission({...newMission, type: e.target.value})}
                  className="w-full rounded-xl bg-[#181F17] border border-[#3A4D23] py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="Dagelijks">Dagelijks</option>
                  <option value="Wekelijks">Wekelijks</option>
                </select>
                
                <select
                  value={newMission.category}
                  onChange={(e) => setNewMission({...newMission, category: e.target.value})}
                  className="w-full rounded-xl bg-[#181F17] border border-[#3A4D23] py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="Gezondheid & Fitness">Gezondheid & Fitness</option>
                  <option value="Mindset & Focus">Mindset & Focus</option>
                  <option value="Financiën & Werk">Financiën & Werk</option>
                </select>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newMission.shared}
                    onChange={(e) => setNewMission({...newMission, shared: e.target.checked})}
                    className="accent-[#8BAE5A]"
                  />
                  <span className="text-white">Deel deze commitment met de Brotherhood</span>
                </label>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddMission(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23]"
                >
                  Annuleren
                </button>
                <button
                  onClick={addMission}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold"
                >
                  Toevoegen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 