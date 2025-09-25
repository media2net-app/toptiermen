'use client';
import ClientLayout from '../../../components/ClientLayout';
import { useState, useEffect } from 'react';
import { FaSearch, FaFire, FaEdit, FaCheck, FaSpinner } from 'react-icons/fa';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'react-hot-toast';

// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface JournalEntry {
  id?: string;
  date: string;
  gratitude?: string[];
  daily_review?: string;
  tomorrow_priorities?: string[];
  mood?: number;
  stress_level?: number;
  energy_level?: number;
  sleep_quality?: number;
  notes?: string;
}

const QUOTES = [
  'Dankbaarheid opent de volheid van het leven. – Melody Beattie',
  'Het is niet geluk dat ons dankbaar maakt, maar dankbaarheid die ons gelukkig maakt. – David Steindl-Rast',
  'Wees dankbaar voor wat je hebt; uiteindelijk zul je meer hebben. – Oprah Winfrey',
  'Geniet van de kleine dingen, want op een dag kijk je terug en besef je dat het de grote dingen waren. – Robert Brault',
];

const PROMPTS = [
  'Waar ben je vandaag, groot of klein, dankbaar voor?',
  'Welk klein moment bracht vandaag een glimlach op je gezicht?',
  'Welke persoon heeft vandaag een positieve invloed op je gehad?',
  'Wat maakte deze dag bijzonder?',
];

function formatDate(date: Date) {
  return date.toLocaleDateString('nl-NL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}
function shortDate(date: Date) {
  return date.toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' });
}

const today = new Date();
const yesterday = new Date(Date.now() - 86400000);
const lastYear = new Date(today);
lastYear.setFullYear(today.getFullYear() - 1);

export default function Dankbaarheidsdagboek() {
  const { user } = useSupabaseAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [streak, setStreak] = useState(0);
  const [saving, setSaving] = useState(false);
  const quote = QUOTES[today.getDate() % QUOTES.length];
  const prompt = PROMPTS[today.getDate() % PROMPTS.length];

  // Format date for API
  const formatDateForAPI = (date: Date) => date.toISOString().split('T')[0];

  // Load journal entries from database
  useEffect(() => {
    const fetchEntries = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/mind-focus/journal?userId=${user.id}`);
        const data = await response.json();
        
        if (data.success) {
          const journalEntries = data.entries || [];
          setEntries(journalEntries);
          
          // Set today's entry as selected if it exists, otherwise create a new one
          const todayEntry = journalEntries.find((e: JournalEntry) => e.date === formatDateForAPI(today));
          if (todayEntry) {
            setSelected(todayEntry);
            setText(todayEntry.daily_review || '');
            setEditMode(false);
          } else {
            const newEntry: JournalEntry = {
              date: formatDateForAPI(today),
              daily_review: '',
              gratitude: [],
              tomorrow_priorities: [],
              mood: 5,
              stress_level: 5,
              energy_level: 5,
              sleep_quality: 5,
              notes: ''
            };
            setSelected(newEntry);
            setText('');
            setEditMode(true);
          }
          
          // Calculate streak
          setStreak(calculateStreak(journalEntries));
        } else {
          toast.error('Kon journal entries niet laden');
        }
      } catch (error) {
        console.error('Error fetching journal entries:', error);
        toast.error('Kon journal entries niet laden');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user?.id]);

  // Calculate streak
  const calculateStreak = (entries: JournalEntry[]) => {
    if (!entries.length) return 0;
    
    const sortedEntries = entries
      .map(e => new Date(e.date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i]);
      entryDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate = new Date(entryDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Filter entries by search
  const filteredEntries = entries.filter(e =>
    (e.daily_review || '').toLowerCase().includes(search.toLowerCase()) ||
    e.date.toLowerCase().includes(search.toLowerCase())
  );

  // Save entry
  const saveEntry = async () => {
    if (!selected || !user?.id) return;

    try {
      setSaving(true);
      const response = await fetch('/api/mind-focus/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          date: selected.date,
          dailyReview: text,
          gratitude: selected.gratitude || [],
          tomorrowPriorities: selected.tomorrow_priorities || [],
          mood: selected.mood || 5,
          stressLevel: selected.stress_level || 5,
          energyLevel: selected.energy_level || 5,
          sleepQuality: selected.sleep_quality || 5,
          notes: selected.notes || ''
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local entries
        const updatedEntries = entries.filter(e => e.date !== selected.date);
        updatedEntries.push(data.entry);
        setEntries(updatedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
        setSelected(data.entry);
        setSaved(true);
        setEditMode(false);
        setTimeout(() => setSaved(false), 1200);
        toast.success('Journal entry opgeslagen!');
        
        // Recalculate streak
        setStreak(calculateStreak(updatedEntries));
      } else {
        toast.error('Kon entry niet opslaan');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Kon entry niet opslaan');
    } finally {
      setSaving(false);
    }
  };

  // Select entry
  const selectEntry = (entry: JournalEntry) => {
    setSelected(entry);
    setText(entry.daily_review || '');
    setEditMode(entry.date === formatDateForAPI(today));
  };

  // Add new entry for today if not present
  const hasToday = entries.some(e => e.date === formatDateForAPI(today));

  return (
    <ClientLayout>
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mijn Dankbaarheidsdagboek</h1>
        <p className="text-[#8BAE5A] text-lg mb-6 italic">{quote}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Linkerkolom: archief */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#8BAE5A] mb-2">
              <FaFire className="text-[#FFD700]" />
              <span className="text-sm">Huidige schrijf-streak: <span className="font-bold">{streak} dagen</span></span>
            </div>
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Doorzoek je herinneringen..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 pl-10 pr-4 text-white placeholder-[#8BAE5A]/60 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8BAE5A]" />
            </div>
            <div className="overflow-y-auto max-h-[420px] custom-scrollbar divide-y divide-[#3A4D23]/40 bg-[#232D1A]/60 rounded-xl border border-[#3A4D23]/40">
              {loading && (
                <div className="p-6 text-[#8BAE5A] text-center flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Journal laden...
                </div>
              )}
              {!loading && filteredEntries.length === 0 && (
                <div className="p-6 text-[#8BAE5A] text-center">Geen inzendingen gevonden.</div>
              )}
              {!loading && filteredEntries.map((entry, i) => (
                <button
                  key={entry.date}
                  onClick={() => selectEntry(entry)}
                  className={`w-full text-left px-4 py-3 hover:bg-[#2A341F]/40 transition flex flex-col ${selected?.date === entry.date ? 'bg-[#8BAE5A]/10 border-l-4 border-[#8BAE5A]' : ''}`}
                >
                  <span className="text-xs text-[#8BAE5A] font-semibold">
                    {entry.date === formatDateForAPI(today)
                      ? 'Vandaag'
                      : entry.date === formatDateForAPI(yesterday)
                      ? 'Gisteren'
                      : new Date(entry.date).toLocaleDateString('nl-NL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="text-white truncate text-sm font-serif">
                    {(entry.daily_review || '').slice(0, 60)}{(entry.daily_review || '').length > 60 ? '...' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {/* Rechterkolom: pagina van vandaag of geselecteerd */}
          <div className="md:col-span-2 bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-8 flex flex-col min-h-[420px]">
            {selected && (
              <>
                <div className="mb-2 text-[#8BAE5A] text-lg font-bold">
                  {new Date(selected.date).toLocaleDateString('nl-NL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                {/* Prompt */}
                <div className="mb-4 text-[#8BAE5A]/80 text-base italic">
                  {selected.date === formatDateForAPI(today) ? prompt : ''}
                </div>
                {/* Tekstveld of leesmodus */}
                {editMode ? (
                  <>
                    <textarea
                      value={text}
                      onChange={e => setText(e.target.value)}
                      className="w-full min-h-[120px] bg-transparent border-none outline-none resize-none text-white text-lg font-serif focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#8BAE5A]/60"
                      style={{ fontFamily: 'Lora, PT Serif, serif' }}
                      placeholder="Schrijf hier je gedachten..."
                      autoFocus
                    />
                    <button
                      onClick={saveEntry}
                      disabled={saving || saved}
                      className={`mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-semibold shadow transition-all ${saved ? 'bg-[#8BAE5A] cursor-default' : ''}`}
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <FaSpinner className="animate-spin" />
                          Opslaan...
                        </span>
                      ) : saved ? (
                        <span className="flex items-center gap-2"><FaCheck /> Bewaard</span>
                      ) : (
                        'Bewaar in mijn dagboek'
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-white text-lg font-serif whitespace-pre-line mb-4" style={{ fontFamily: 'Lora, PT Serif, serif' }}>{text}</div>
                    {selected.date === formatDateForAPI(today) && (
                      <button onClick={() => setEditMode(true)} className="flex items-center gap-2 text-[#8BAE5A] hover:underline text-sm mb-2"><FaEdit /> Bewerken</button>
                    )}
                  </>
                )}
                {/* On This Day */}
                {selected.date === formatDateForAPI(today) && entries.some(e => {
                  const entryDate = new Date(e.date);
                  return entryDate.getDate() === lastYear.getDate() && entryDate.getMonth() === lastYear.getMonth() && entryDate.getFullYear() === lastYear.getFullYear();
                }) && (
                  <div className="mt-8 p-4 rounded-xl bg-[#3A4D23]/20 border border-[#3A4D23]/40">
                    <div className="text-[#FFD700] font-bold mb-1">Herinnering van een jaar geleden: {shortDate(lastYear)}</div>
                    <div className="text-white text-sm font-serif">
                      {entries.find(e => {
                        const entryDate = new Date(e.date);
                        return entryDate.getTime() === lastYear.getTime();
                      })?.daily_review}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 