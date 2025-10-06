export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SuggestedChallenge {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  xp_reward: number;
  difficulty: Difficulty;
  type?: string;
}

// Extracted heavy constant so it can be code-split and only loaded when needed
export const CHALLENGE_LIBRARY: SuggestedChallenge[] = [
  // FYSIEK - Physical Challenges
  { id: 'fysiek-1', title: 'Koude douche', category: 'Fysiek', icon: '❄️', description: 'Start je dag met een koude douche - bouw mentale weerbaarheid', xp_reward: 100, difficulty: 'hard' },
  { id: 'fysiek-2', title: 'Vroeg opstaan (5:00)', category: 'Fysiek', icon: '🌅', description: 'Sta op om 5:00 en begin je dag als een echte leider', xp_reward: 120, difficulty: 'hard' },
  { id: 'fysiek-3', title: '10.000 stappen', category: 'Fysiek', icon: '👟', description: 'Loop minimaal 10.000 stappen - beweging is discipline', xp_reward: 80, difficulty: 'medium' },
  { id: 'fysiek-4', title: '50 push-ups', category: 'Fysiek', icon: '💪', description: 'Doe 50 push-ups verdeeld over de dag - bouw kracht', xp_reward: 90, difficulty: 'medium' },
  { id: 'fysiek-5', title: '100 squats', category: 'Fysiek', icon: '🦵', description: 'Voer 100 squats uit - sterke benen, sterke geest', xp_reward: 85, difficulty: 'medium' },
  { id: 'fysiek-6', title: 'Plank 5 minuten', category: 'Fysiek', icon: '🏋️‍♂️', description: 'Houd een plank vast voor 5 minuten - test je uithoudingsvermogen', xp_reward: 110, difficulty: 'hard' },
  { id: 'fysiek-7', title: 'Geen suiker', category: 'Fysiek', icon: '🚫🍭', description: 'Eet vandaag geen toegevoegde suikers - discipline in voeding', xp_reward: 95, difficulty: 'hard' },
  { id: 'fysiek-8', title: '3 liter water', category: 'Fysiek', icon: '💧', description: 'Drink 3 liter water - hydratatie is essentieel', xp_reward: 60, difficulty: 'easy' },

  // MENTAAL - Mental Challenges
  { id: 'mentaal-1', title: 'Geen sociale media', category: 'Mentaal', icon: '📱❌', description: 'Geen sociale media voor 24 uur - focus op wat belangrijk is', xp_reward: 120, difficulty: 'hard' },
  { id: 'mentaal-2', title: 'Meditatie 20 min', category: 'Mentaal', icon: '🧘‍♂️', description: 'Mediteer 20 minuten - train je geest zoals je lichaam', xp_reward: 100, difficulty: 'medium' },
  { id: 'mentaal-3', title: '1 uur lezen', category: 'Mentaal', icon: '📚', description: 'Lees 1 uur uit een boek - kennis is macht', xp_reward: 90, difficulty: 'medium' },
  { id: 'mentaal-4', title: 'Journaling', category: 'Mentaal', icon: '✍️', description: 'Schrijf 500 woorden in je journal - reflecteer op je dag', xp_reward: 70, difficulty: 'easy' },
  { id: 'mentaal-5', title: 'Geen klagen', category: 'Mentaal', icon: '🤐', description: 'Klaag vandaag nergens over - focus op oplossingen', xp_reward: 110, difficulty: 'hard' },
  { id: 'mentaal-6', title: 'Gratitude lijst', category: 'Mentaal', icon: '🙏', description: 'Schrijf 10 dingen op waar je dankbaar voor bent', xp_reward: 65, difficulty: 'easy' },
  { id: 'mentaal-7', title: 'Nieuwe vaardigheid', category: 'Mentaal', icon: '🎓', description: 'Besteed 30 minuten aan het leren van een nieuwe vaardigheid', xp_reward: 85, difficulty: 'medium' },
  { id: 'mentaal-8', title: 'Doelen herzien', category: 'Mentaal', icon: '🎯', description: 'Herzie en update je doelen - weet waar je naartoe gaat', xp_reward: 75, difficulty: 'easy' },

  // FINANCIEEL - Financial Challenges
  { id: 'financieel-1', title: 'Budget bijhouden', category: 'Financieel', icon: '💰', description: 'Track alle uitgaven van vandaag - controle over je geld', xp_reward: 70, difficulty: 'easy' },
  { id: 'financieel-2', title: 'Geen onnodige uitgaven', category: 'Financieel', icon: '💳❌', description: 'Geen impulsieve aankopen vandaag - discipline in uitgaven', xp_reward: 90, difficulty: 'medium' },
  { id: 'financieel-3', title: 'Investeren leren', category: 'Financieel', icon: '📈', description: 'Besteed 30 minuten aan het leren over investeren', xp_reward: 80, difficulty: 'medium' },
  { id: 'financieel-4', title: 'Netwerken', category: 'Financieel', icon: '🤝', description: 'Maak contact met 3 nieuwe mensen - bouw je netwerk', xp_reward: 95, difficulty: 'hard' },
  { id: 'financieel-5', title: 'Side hustle werk', category: 'Financieel', icon: '💼', description: 'Besteed 1 uur aan je side project - bouw extra inkomen', xp_reward: 110, difficulty: 'hard' },
  { id: 'financieel-6', title: 'Financiële doelen', category: 'Financieel', icon: '🎯', description: 'Definieer 3 financiële doelen voor de komende maand', xp_reward: 75, difficulty: 'easy' },
  { id: 'financieel-7', title: 'Onderhandelen', category: 'Financieel', icon: '💬', description: 'Onderhandel over een rekening of service - assertiviteit', xp_reward: 100, difficulty: 'hard' },
  { id: 'financieel-8', title: 'Expense review', category: 'Financieel', icon: '📊', description: 'Analyseer je uitgaven van de afgelopen week', xp_reward: 65, difficulty: 'easy' },
];

export function getCategories(list: SuggestedChallenge[]) {
  const categories = [...new Set(list.map(challenge => challenge.category))];
  return categories.sort();
}

export function filterChallenges(list: SuggestedChallenge[], category: string, difficulty: string, search: string) {
  const s = search.toLowerCase();
  return list.filter(challenge => {
    const matchesCategory = category === 'all' || challenge.category === category;
    const matchesDifficulty = difficulty === 'all' || challenge.difficulty === difficulty;
    const matchesSearch = challenge.title.toLowerCase().includes(s) || challenge.description.toLowerCase().includes(s);
    return matchesCategory && matchesDifficulty && matchesSearch;
  });
}
