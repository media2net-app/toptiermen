'use client';
import ClientLayout from '../../../components/ClientLayout';
import { useState } from 'react';
import { FaSearch, FaFire, FaEdit, FaCheck } from 'react-icons/fa';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

const DUMMY_ENTRIES = [
  { date: today, text: 'Vandaag was ik dankbaar voor de onverwachte hulp van een collega.' },
  { date: yesterday, text: 'Een goed gesprek gehad met een oude vriend.' },
  { date: new Date(today.getTime() - 2 * 86400000), text: 'De zonsondergang gezien tijdens een wandeling.' },
  { date: lastYear, text: 'Een mooie herinnering aan een familiedag.' },
];

export default function Dankbaarheidsdagboek() {
  const [entries, setEntries] = useState(DUMMY_ENTRIES);
  const [selected, setSelected] = useState(entries[0]);
  const [search, setSearch] = useState('');
  const [editMode, setEditMode] = useState(selected.date.getTime() === today.getTime());
  const [text, setText] = useState(selected.text);
  const [saved, setSaved] = useState(false);
  const [streak] = useState(14);
  const quote = QUOTES[today.getDate() % QUOTES.length];
  const prompt = PROMPTS[today.getDate() % PROMPTS.length];

  // Filter entries by search
  const filteredEntries = entries.filter(e =>
    e.text.toLowerCase().includes(search.toLowerCase()) ||
    shortDate(e.date).toLowerCase().includes(search.toLowerCase())
  );

  // Save entry
  const saveEntry = () => {
    const updated = entries.map(e =>
      e.date.getTime() === selected.date.getTime() ? { ...e, text } : e
    );
    setEntries(updated);
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 1200);
  };

  // Select entry
  const selectEntry = (entry: typeof entries[0]) => {
    setSelected(entry);
    setText(entry.text);
    setEditMode(entry.date.getTime() === today.getTime());
  };

  // Add new entry for today if not present
  const hasToday = entries.some(e => e.date.getTime() === today.getTime());

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
              {filteredEntries.length === 0 && (
                <div className="p-6 text-[#8BAE5A] text-center">Geen inzendingen gevonden.</div>
              )}
              {filteredEntries.map((entry, i) => (
                <button
                  key={entry.date.toISOString()}
                  onClick={() => selectEntry(entry)}
                  className={`w-full text-left px-4 py-3 hover:bg-[#2A341F]/40 transition flex flex-col ${selected.date.getTime() === entry.date.getTime() ? 'bg-[#8BAE5A]/10 border-l-4 border-[#8BAE5A]' : ''}`}
                >
                  <span className="text-xs text-[#8BAE5A] font-semibold">
                    {entry.date.getTime() === today.getTime()
                      ? 'Vandaag'
                      : entry.date.getTime() === yesterday.getTime()
                      ? 'Gisteren'
                      : entry.date.toLocaleDateString('nl-NL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="text-white truncate text-sm font-serif">{entry.text.slice(0, 60)}{entry.text.length > 60 ? '...' : ''}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Rechterkolom: pagina van vandaag of geselecteerd */}
          <div className="md:col-span-2 bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-8 flex flex-col min-h-[420px]">
            <div className="mb-2 text-[#8BAE5A] text-lg font-bold">
              {selected.date.toLocaleDateString('nl-NL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
            {/* Prompt */}
            <div className="mb-4 text-[#8BAE5A]/80 text-base italic">
              {selected.date.getTime() === today.getTime() ? prompt : ''}
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
                  className={`mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-semibold shadow transition-all ${saved ? 'bg-[#8BAE5A] cursor-default' : ''}`}
                  disabled={saved}
                >
                  {saved ? <span className="flex items-center gap-2"><FaCheck /> Bewaard</span> : 'Bewaar in mijn dagboek'}
                </button>
              </>
            ) : (
              <>
                <div className="text-white text-lg font-serif whitespace-pre-line mb-4" style={{ fontFamily: 'Lora, PT Serif, serif' }}>{text}</div>
                {selected.date.getTime() === today.getTime() && (
                  <button onClick={() => setEditMode(true)} className="flex items-center gap-2 text-[#8BAE5A] hover:underline text-sm mb-2"><FaEdit /> Bewerken</button>
                )}
              </>
            )}
            {/* On This Day */}
            {selected.date.getTime() === today.getTime() && entries.some(e => e.date.getDate() === lastYear.getDate() && e.date.getMonth() === lastYear.getMonth() && e.date.getFullYear() === lastYear.getFullYear()) && (
              <div className="mt-8 p-4 rounded-xl bg-[#3A4D23]/20 border border-[#3A4D23]/40">
                <div className="text-[#FFD700] font-bold mb-1">Herinnering van een jaar geleden: {shortDate(lastYear)}</div>
                <div className="text-white text-sm font-serif">{entries.find(e => e.date.getTime() === lastYear.getTime())?.text}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 