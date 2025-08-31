'use client';
import ClientLayout from '@/app/components/ClientLayout';
import { useState, useEffect } from 'react';
import { PlusIcon, TrophyIcon, FireIcon, UserGroupIcon, CheckCircleIcon, StarIcon, BookOpenIcon, HeartIcon, CurrencyDollarIcon, BoltIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Challenge types en categorieën
const challengeCategories = {
  'Fysieke Uitdagingen': [
    { id: 'pushup-challenge', title: '100 Push-ups per dag', icon: '💪', badge: 'Push-up Master', duration: '30 dagen', difficulty: 'Hard' },
    { id: 'plank-challenge', title: '5 minuten plank', icon: '🏋️‍♂️', badge: 'Core Warrior', duration: '21 dagen', difficulty: 'Medium' },
    { id: 'running-challenge', title: '10km hardlopen', icon: '🏃‍♂️', badge: 'Distance Runner', duration: '7 dagen', difficulty: 'Hard' },
    { id: 'cold-shower-challenge', title: '30 dagen koud douchen', icon: '❄️', badge: 'Ice Warrior', duration: '30 dagen', difficulty: 'Medium' },
  ],
  'Mentale Uitdagingen': [
    { id: 'meditation-challenge', title: '21 dagen mediteren', icon: '🧘‍♂️', badge: 'Mind Master', duration: '21 dagen', difficulty: 'Medium' },
    { id: 'no-social-challenge', title: '7 dagen geen social media', icon: '📱', badge: 'Digital Detox', duration: '7 dagen', difficulty: 'Hard' },
    { id: 'reading-challenge', title: '1 boek per week', icon: '📚', badge: 'Book Worm', duration: '4 weken', difficulty: 'Medium' },
    { id: 'gratitude-challenge', title: '30 dagen dankbaarheid', icon: '🙏', badge: 'Gratitude Guru', duration: '30 dagen', difficulty: 'Easy' },
  ],
  'Financiële Uitdagingen': [
    { id: 'savings-challenge', title: '€1000 sparen', icon: '💰', badge: 'Money Saver', duration: '3 maanden', difficulty: 'Medium' },
    { id: 'side-hustle-challenge', title: 'Side hustle opzetten', icon: '💼', badge: 'Entrepreneur', duration: '30 dagen', difficulty: 'Hard' },
    { id: 'investment-challenge', title: '€500 investeren', icon: '📈', badge: 'Investment Pro', duration: '2 maanden', difficulty: 'Medium' },
    { id: 'budget-challenge', title: 'Strikte budget houden', icon: '📊', badge: 'Budget Master', duration: '1 maand', difficulty: 'Hard' },
  ],
};

const initialChallenges = [
  { 
    id: 1, 
    title: '100 Push-ups per dag', 
    type: 'Fysieke Uitdagingen', 
    status: 'active',
    progress: 15,
    totalDays: 30,
    currentDay: 15,
    icon: '💪',
    badge: 'Push-up Master',
    difficulty: 'Hard',
    shared: true,
    accountabilityPartner: 'Mark V.',
    startDate: '2025-01-15',
    endDate: '2025-02-14',
    streak: 15,
    description: 'Dagelijks 100 push-ups doen om kracht en uithoudingsvermogen op te bouwen.'
  },
  { 
    id: 2, 
    title: '21 dagen mediteren', 
    type: 'Mentale Uitdagingen', 
    status: 'completed',
    progress: 100,
    totalDays: 21,
    currentDay: 21,
    icon: '🧘‍♂️',
    badge: 'Mind Master',
    difficulty: 'Medium',
    shared: false,
    accountabilityPartner: null,
    startDate: '2025-01-01',
    endDate: '2025-01-21',
    streak: 21,
    description: 'Dagelijks 10 minuten mediteren voor mentale helderheid en focus.'
  },
  { 
    id: 3, 
    title: '€1000 sparen', 
    type: 'Financiële Uitdagingen', 
    status: 'active',
    progress: 65,
    totalDays: 90,
    currentDay: 58,
    icon: '💰',
    badge: 'Money Saver',
    difficulty: 'Medium',
    shared: true,
    accountabilityPartner: 'Rick C.',
    startDate: '2024-12-01',
    endDate: '2025-03-01',
    streak: 58,
    description: 'In 3 maanden €1000 sparen door bewuste uitgaven en extra inkomsten.'
  },
  { 
    id: 4, 
    title: '7 dagen geen social media', 
    type: 'Mentale Uitdagingen', 
    status: 'failed',
    progress: 42,
    totalDays: 7,
    currentDay: 3,
    icon: '📱',
    badge: 'Digital Detox',
    difficulty: 'Hard',
    shared: false,
    accountabilityPartner: null,
    startDate: '2025-01-10',
    endDate: '2025-01-17',
    streak: 3,
    description: 'Een week volledig afkicken van social media voor mentale rust.'
  },
];

export default function MijnChallenges() {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [filter, setFilter] = useState('actief');
  const [showChallengeManager, setShowChallengeManager] = useState(false);
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [newChallenge, setNewChallenge] = useState({ 
    title: '', 
    type: 'Fysieke Uitdagingen', 
    difficulty: 'Medium',
    duration: '21 dagen',
    shared: false 
  });
  const [mainGoal, setMainGoal] = useState('Financiële Vrijheid');
  const [activeChallenges, setActiveChallenges] = useState(2);
  const [completedChallenges, setCompletedChallenges] = useState(1);
  const [totalChallenges, setTotalChallenges] = useState(4);

  // Load main goal from localStorage
  useEffect(() => {
    const savedGoal = localStorage.getItem('ttm_main_goal');
    if (savedGoal) setMainGoal(savedGoal);
  }, []);

  const startChallenge = (challengeId: number) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId) {
        return { 
          ...challenge, 
          status: 'active',
          startDate: new Date().toISOString().split('T')[0],
          currentDay: 1,
          progress: 0
        };
      }
      return challenge;
    }));
    toast.success('🎯 Challenge gestart! Succes met je uitdaging!');
  };

  const completeChallenge = (challengeId: number) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId) {
        return { 
          ...challenge, 
          status: 'completed',
          progress: 100,
          currentDay: challenge.totalDays
        };
      }
      return challenge;
    }));
    toast.success('🏆 Challenge voltooid! Je hebt jezelf overtroffen!');
  };

  const addChallenge = () => {
    if (!newChallenge.title.trim()) return;
    
    const challenge = {
      id: Date.now(),
      title: newChallenge.title,
      type: newChallenge.type,
      status: 'pending',
      progress: 0,
      totalDays: parseInt(newChallenge.duration.split(' ')[0]),
      currentDay: 0,
      icon: '🎯',
      badge: 'Custom Badge',
      difficulty: newChallenge.difficulty,
      shared: newChallenge.shared,
      accountabilityPartner: null,
      startDate: '',
      endDate: '',
      streak: 0,
      description: 'Een persoonlijke uitdaging om jezelf te verbeteren.'
    };
    
    setChallenges([...challenges, challenge]);
    setNewChallenge({ title: '', type: 'Fysieke Uitdagingen', difficulty: 'Medium', duration: '21 dagen', shared: false });
    setShowAddChallenge(false);
    
    if (newChallenge.shared) {
      toast('🔥 Je challenge is gedeeld met de Brotherhood!');
    }
  };

  const getGoalMessage = () => {
    const goalMessages = {
      'Financiële Vrijheid': 'Deze challenges bouwen de discipline op die je nodig hebt voor financiële vrijheid.',
      'Fysieke Kracht': 'Elke challenge versterkt je lichaam en geest.',
      'Mentale Focus': 'Deze uitdagingen scherpen je geest en versterken je focus.',
      'Persoonlijke Groei': 'Elke voltooide challenge brengt je dichter bij de beste versie van jezelf.'
    };
    return goalMessages[mainGoal as keyof typeof goalMessages] || 'Elke challenge brengt je dichter bij jouw doel.';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-[#B6C948]';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'completed': return 'text-[#8BAE5A]';
      case 'failed': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-[#B6C948]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'completed': return 'Voltooid';
      case 'failed': return 'Gefaald';
      case 'pending': return 'Wachtend';
      default: return status;
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'actief') return challenge.status === 'active';
    if (filter === 'voltooid') return challenge.status === 'completed';
    if (filter === 'gefaald') return challenge.status === 'failed';
    return true;
  });

  return (
    <ClientLayout>
      <div className="w-full max-w-7xl mx-auto">
        {/* Focus van Vandaag Header */}
        <div className="bg-gradient-to-r from-[#8BAE5A]/20 to-[#FFD700]/20 rounded-2xl p-6 mb-8 border border-[#8BAE5A]/30">
          <h2 className="text-2xl font-bold text-[#FFD700] mb-2 flex items-center gap-2">
            <StarIcon className="w-6 h-6" />
            Challenge Focus
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
              {activeChallenges} actieve challenges
            </span>
            <span className="text-[#8BAE5A]">
              {completedChallenges}/{totalChallenges} challenges voltooid
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mijn Challenges</h1>
            <p className="text-[#8BAE5A] text-lg">Overzicht van je actieve en voltooide uitdagingen</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowChallengeManager(true)}
              className="px-6 py-3 rounded-xl bg-[#232D1A] text-[#8BAE5A] font-bold text-lg shadow border border-[#3A4D23] hover:bg-[#2A341F] transition-all flex items-center gap-2"
            >
              <TrophyIcon className="w-5 h-5" />
              Beheer Challenges
            </button>
            <button 
              onClick={() => setShowAddChallenge(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-bold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all border border-[#8BAE5A] flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              + Nieuwe challenge
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setFilter('actief')} className={`px-4 py-2 rounded-full font-semibold transition ${filter === 'actief' ? 'bg-[#232D1A] text-[#8BAE5A]' : 'text-[#B6C948] hover:text-[#8BAE5A]'}`}>Actief</button>
          <button onClick={() => setFilter('voltooid')} className={`px-4 py-2 rounded-full font-semibold transition ${filter === 'voltooid' ? 'bg-[#232D1A] text-[#8BAE5A]' : 'text-[#B6C948] hover:text-[#8BAE5A]'}`}>Voltooid</button>
          <button onClick={() => setFilter('gefaald')} className={`px-4 py-2 rounded-full font-semibold transition ${filter === 'gefaald' ? 'bg-[#232D1A] text-[#8BAE5A]' : 'text-[#B6C948] hover:text-[#8BAE5A]'}`}>Gefaald</button>
          <button onClick={() => setFilter('alle')} className={`px-4 py-2 rounded-full font-semibold transition ${filter === 'alle' ? 'bg-[#232D1A] text-[#8BAE5A]' : 'text-[#B6C948] hover:text-[#8BAE5A]'}`}>Alle</button>
        </div>

        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
          {filteredChallenges.length === 0 ? (
            <div className="text-[#8BAE5A] text-center py-12">Geen challenges gevonden. Start een nieuwe uitdaging!</div>
          ) : (
            <div className="grid gap-6">
              {filteredChallenges.map(challenge => (
                <div key={challenge.id} className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{challenge.icon}</span>
                      <div>
                        <h3 className={`text-xl font-bold ${challenge.status === 'completed' ? 'text-[#8BAE5A]' : 'text-white'}`}>
                          {challenge.title}
                        </h3>
                        <p className="text-[#B6C948] text-sm">{challenge.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(challenge.difficulty)} bg-[#232D1A]`}>
                        {challenge.difficulty}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(challenge.status)} bg-[#232D1A]`}>
                        {getStatusText(challenge.status)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#B6C948]">Voortgang</span>
                      <span className="text-[#8BAE5A] font-semibold">{challenge.progress}%</span>
                    </div>
                    <div className="w-full bg-[#3A4D23] rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          challenge.status === 'completed' 
                            ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700]' 
                            : challenge.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f]'
                        }`}
                        style={{ width: `${challenge.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-[#B6C948] mt-1">
                      <span>Dag {challenge.currentDay} van {challenge.totalDays}</span>
                      <span>Streak: {challenge.streak} dagen</span>
                    </div>
                  </div>
                  
                  {/* Badge Progressie */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <TrophyIcon className="w-4 h-4 text-[#FFD700]" />
                      <span className="text-[#8BAE5A]">
                        {challenge.badge}: {challenge.progress}% voltooid
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {challenge.shared && (
                        <span className="text-[#FFD700] text-sm flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          Gedeeld
                        </span>
                      )}
                      {challenge.accountabilityPartner && (
                        <span className="text-[#8BAE5A] text-sm">
                          Partner: {challenge.accountabilityPartner}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {challenge.status === 'pending' && (
                        <button
                          onClick={() => startChallenge(challenge.id)}
                          className="px-4 py-2 rounded-lg bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-colors"
                        >
                          Start Challenge
                        </button>
                      )}
                      {challenge.status === 'active' && (
                        <button
                          onClick={() => completeChallenge(challenge.id)}
                          className="px-4 py-2 rounded-lg bg-[#FFD700] text-[#181F17] font-semibold hover:bg-yellow-400 transition-colors"
                        >
                          Voltooi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Challenge Management Modal */}
        {showChallengeManager && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#232D1A] rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Challenge Management</h2>
                <button 
                  onClick={() => setShowChallengeManager(false)}
                  className="text-[#8BAE5A] hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mijn Huidige Challenges */}
                <div>
                  <h3 className="text-lg font-bold text-[#8BAE5A] mb-4">Mijn Huidige Challenges</h3>
                  <div className="space-y-2">
                    {challenges.map(challenge => (
                      <div key={challenge.id} className="bg-[#181F17] rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{challenge.icon}</span>
                          <span className="text-white text-sm">{challenge.title}</span>
                        </div>
                        <button className="text-red-400 hover:text-red-300 text-sm">Verwijder</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Challenge Bibliotheek */}
                <div>
                  <h3 className="text-lg font-bold text-[#8BAE5A] mb-4">Challenge Bibliotheek</h3>
                  <div className="space-y-4">
                    {Object.entries(challengeCategories).map(([category, challenges]) => (
                      <div key={category}>
                        <h4 className="text-[#FFD700] font-semibold mb-2">{category}</h4>
                        <div className="space-y-2">
                          {challenges.map(challenge => (
                            <div key={challenge.id} className="bg-[#181F17] rounded-xl p-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{challenge.icon}</span>
                                <div>
                                  <span className="text-white text-sm">{challenge.title}</span>
                                  <div className="text-xs text-[#B6C948]">{challenge.duration} • {challenge.difficulty}</div>
                                </div>
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

        {/* Add Challenge Modal */}
        {showAddChallenge && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#232D1A] rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-6">Creëer Eigen Challenge</h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Challenge titel (bijv. '30 dagen koud douchen')"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                  className="w-full rounded-xl bg-[#181F17] border border-[#3A4D23] py-3 px-4 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
                
                <select
                  value={newChallenge.type}
                  onChange={(e) => setNewChallenge({...newChallenge, type: e.target.value})}
                  className="w-full rounded-xl bg-[#181F17] border border-[#3A4D23] py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="Fysieke Uitdagingen">Fysieke Uitdagingen</option>
                  <option value="Mentale Uitdagingen">Mentale Uitdagingen</option>
                  <option value="Financiële Uitdagingen">Financiële Uitdagingen</option>
                </select>
                
                <select
                  value={newChallenge.difficulty}
                  onChange={(e) => setNewChallenge({...newChallenge, difficulty: e.target.value})}
                  className="w-full rounded-xl bg-[#181F17] border border-[#3A4D23] py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="Easy">Makkelijk</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Moeilijk</option>
                </select>
                
                <select
                  value={newChallenge.duration}
                  onChange={(e) => setNewChallenge({...newChallenge, duration: e.target.value})}
                  className="w-full rounded-xl bg-[#181F17] border border-[#3A4D23] py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="7 dagen">7 dagen</option>
                  <option value="21 dagen">21 dagen</option>
                  <option value="30 dagen">30 dagen</option>
                  <option value="90 dagen">90 dagen</option>
                </select>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newChallenge.shared}
                    onChange={(e) => setNewChallenge({...newChallenge, shared: e.target.checked})}
                    className="accent-[#8BAE5A]"
                  />
                  <span className="text-white">Deel deze challenge met de Brotherhood</span>
                </label>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddChallenge(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23]"
                >
                  Annuleren
                </button>
                <button
                  onClick={addChallenge}
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