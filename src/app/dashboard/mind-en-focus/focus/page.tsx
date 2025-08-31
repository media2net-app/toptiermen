'use client';
import ClientLayout from '../../../components/ClientLayout';
import { useState, useRef, useEffect } from 'react';
import { FaCog, FaPlay, FaPause, FaCheckCircle, FaMusic, FaBookOpen, FaVolumeUp } from 'react-icons/fa';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULTS = {
  focus: 25,
  short: 5,
  long: 15,
};

const ARTICLES = [
  {
    title: 'De Pomodoro Techniek: De complete gids',
    desc: 'Alles over de kracht van gefocust werken in blokken van 25 minuten.',
  },
  {
    title: 'Deep Work: Hoe je afleidingen verslaat',
    desc: 'Tips gebaseerd op het werk van Cal Newport voor diepe concentratie.',
  },
  {
    title: 'Time Blocking: Plan je dag als een pro',
    desc: 'Structuur en rust in je agenda met slimme tijdsblokken.',
  },
  {
    title: 'Digitale Minimalisme: Richt je digitale werkplek in',
    desc: 'Minimaliseer digitale ruis en maximaliseer je focus.',
  },
];

const PLAYLISTS = [
  {
    name: 'Lofi Beats for Deep Work',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX3Ogo9pFvBkY',
  },
  {
    name: 'Ambient Soundscapes',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWUzFXarNiofw',
  },
  {
    name: 'Classical for Concentration',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWEJlAGA9gs0',
  },
  {
    name: 'Binaural Beats (Alpha Waves)',
    url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX3b9pD8bJQ2l',
  },
];

const TABS = [
  { key: 'pomodoro', label: 'Pomodoro Timer', icon: <FaPlay /> },
  { key: 'kennisbank', label: 'Kennisbank', icon: <FaBookOpen /> },
  { key: 'muziek', label: 'Focus Muziek', icon: <FaMusic /> },
];

function pad(n: number) {
  return n < 10 ? `0${n}` : n;
}

export default function FocusToolkit() {
  // Tab state
  const [tab, setTab] = useState('pomodoro');

  // Pomodoro state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focus, setFocus] = useState(DEFAULTS.focus);
  const [short, setShort] = useState(DEFAULTS.short);
  const [long, setLong] = useState(DEFAULTS.long);
  const [timer, setTimer] = useState(focus * 60);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(1);
  const [status, setStatus] = useState<'focus'|'short'|'long'>('focus');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout|null>(null);
  const [showDone, setShowDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Muziek state
  const [playlist, setPlaylist] = useState(PLAYLISTS[0]);
  const [musicVol, setMusicVol] = useState(80);

  // Pomodoro timer logic
  useEffect(() => {
    if (running) {
      const id = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(id);
            setRunning(false);
            setShowDone(true);
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (intervalId) {
      clearInterval(intervalId);
    }
    // eslint-disable-next-line
  }, [running]);

  // Update timer on settings change
  useEffect(() => {
    if (status === 'focus') setTimer(focus * 60);
    if (status === 'short') setTimer(short * 60);
    if (status === 'long') setTimer(long * 60);
    // eslint-disable-next-line
  }, [focus, short, long, status]);

  // Update browser tab title
  useEffect(() => {
    if (tab === 'pomodoro') {
      const min = Math.floor(timer / 60);
      const sec = timer % 60;
      document.title = `[${pad(min)}:${pad(sec)}] ${status === 'focus' ? 'Focussen...' : status === 'short' ? 'Korte pauze' : 'Lange pauze'} - Top Tier Men`;
    } else {
      document.title = 'Top Tier Men';
    }
  }, [timer, status, tab]);

  // Pomodoro cyclus indicator
  const sessionText = status === 'focus' ? `Sessie ${cycle} van 4. Volgende: ${cycle < 4 ? 'Korte pauze' : 'Lange pauze'} (${cycle < 4 ? short : long} min).` : '';

  // Pomodoro acties
  const start = () => { setRunning(true); setShowDone(false); };
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setShowDone(false); setStatus('focus'); setCycle(1); setTimer(focus * 60); };
  const next = () => {
    if (status === 'focus') {
      if (cycle < 4) {
        setStatus('short');
        setTimer(short * 60);
      } else {
        setStatus('long');
        setTimer(long * 60);
      }
    } else {
      setStatus('focus');
      setTimer(focus * 60);
      setCycle(c => (status === 'long' ? 1 : c + 1));
    }
    setShowDone(false);
  };

  // Instellingen opslaan
  const saveSettings = () => {
    setSettingsOpen(false);
    reset();
  };

  // Muziek volume
  useEffect(() => {
    const iframe = document.getElementById('focus-music-iframe') as HTMLIFrameElement | null;
    if (iframe) {
      // Spotify volume kan niet direct via embed, dus alleen slider visueel
    }
  }, [musicVol, playlist]);

  // UI
  return (
    <ClientLayout>
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Focus & Productiviteit Toolkit</h1>
        <p className="text-[#8BAE5A] text-lg mb-8">Maximaliseer je concentratie en haal het beste uit je werktijd.</p>
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${tab === t.key ? 'bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17]' : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#2A341F]'}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {/* Pomodoro Timer */}
        {tab === 'pomodoro' && (
          <div className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-8 flex flex-col items-center">
            <div className="flex w-full justify-between items-center mb-4">
              <span className="text-[#8BAE5A] font-semibold">Pomodoro Cyclus</span>
              <button onClick={() => setSettingsOpen(true)} className="text-[#8BAE5A] hover:text-[#FFD700] text-xl"><FaCog /></button>
            </div>
            <div className="text-7xl font-mono font-bold text-white mb-2 tracking-widest select-none" style={{ letterSpacing: '0.1em' }}>
              {pad(Math.floor(timer / 60))}:{pad(timer % 60)}
            </div>
            <div className="text-[#8BAE5A] mb-4 text-lg min-h-[28px]">
              {showDone
                ? status === 'focus'
                  ? 'Goed werk! Tijd voor een korte pauze.'
                  : status === 'short'
                  ? 'Neem een korte pauze.'
                  : 'Neem een lange pauze.'
                : status === 'focus'
                ? 'Klaar voor je eerste focussessie.'
                : status === 'short'
                ? 'Korte pauze.'
                : 'Lange pauze.'}
            </div>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4].map(i => (
                <span key={i} className={`w-5 h-5 rounded-full border-2 ${cycle >= i && status === 'focus' ? 'bg-[#8BAE5A] border-[#8BAE5A]' : 'border-[#3A4D23]'}`}></span>
              ))}
            </div>
            <div className="text-[#8BAE5A] text-sm mb-6">{sessionText}</div>
            <div className="flex gap-4 mb-4">
              {!running && !showDone && (
                <button onClick={start} className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-bold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">START FOCUSSESSIE</button>
              )}
              {running && (
                <button onClick={pause} className="px-8 py-3 rounded-xl bg-[#FFD700] text-[#181F17] font-bold text-lg shadow hover:bg-[#8BAE5A] transition-all">PAUZEER</button>
              )}
              {showDone && (
                <button onClick={next} className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-bold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">{status === 'focus' ? 'START PAUZE' : 'VOLGENDE SESSIE'}</button>
              )}
              <button onClick={reset} className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] font-semibold shadow border border-[#3A4D23]/40 hover:bg-[#2A341F] text-sm">Reset</button>
            </div>
            {/* Geluid */}
            <audio ref={audioRef} src="/sounds/gong.mp3" preload="auto" />
            {/* Instellingen Modal */}
            {settingsOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                <div className="bg-[#232D1A] rounded-2xl shadow-2xl p-8 max-w-sm w-full relative">
                  <button className="absolute top-4 right-4 text-white text-2xl hover:text-[#8BAE5A]" onClick={() => setSettingsOpen(false)}>&times;</button>
                  <h2 className="text-xl font-bold text-white mb-4">Pomodoro Instellingen</h2>
                  <div className="flex flex-col gap-4">
                    <label className="flex flex-col text-[#8BAE5A]">Focus (min)
                      <input type="number" min={1} max={60} value={focus} onChange={e => setFocus(Number(e.target.value))} className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white mt-1" />
                    </label>
                    <label className="flex flex-col text-[#8BAE5A]">Korte pauze (min)
                      <input type="number" min={1} max={30} value={short} onChange={e => setShort(Number(e.target.value))} className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white mt-1" />
                    </label>
                    <label className="flex flex-col text-[#8BAE5A]">Lange pauze (min)
                      <input type="number" min={5} max={60} value={long} onChange={e => setLong(Number(e.target.value))} className="rounded-xl bg-[#232D1A] border border-[#3A4D23] py-2 px-3 text-white mt-1" />
                    </label>
                  </div>
                  <button onClick={saveSettings} className="mt-6 px-6 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-semibold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all w-full">Opslaan & Reset</button>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Kennisbank */}
        {tab === 'kennisbank' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ARTICLES.map((a, i) => (
              <div key={i} className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 flex flex-col gap-2">
                <div className="text-xl font-bold text-white mb-1">{a.title}</div>
                <div className="text-[#8BAE5A] text-sm mb-2">{a.desc}</div>
                <button className="mt-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-semibold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all w-max">Lees artikel</button>
              </div>
            ))}
          </div>
        )}
        {/* Focus Muziek */}
        {tab === 'muziek' && (
          <div className="flex flex-col gap-8">
            <div className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 flex flex-col items-center">
              <div className="flex items-center gap-4 mb-4">
                <FaMusic className="text-[#8BAE5A] text-2xl" />
                <span className="text-white font-bold text-lg">Focus Muziek</span>
              </div>
              <iframe
                id="focus-music-iframe"
                src={playlist.url}
                width="100%"
                height="80"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                className="rounded-xl border border-[#3A4D23]/40 mb-4"
                style={{ background: '#232D1A' }}
                title={playlist.name}
              ></iframe>
              <div className="flex gap-4 items-center w-full">
                <FaVolumeUp className="text-[#8BAE5A]" />
                <input type="range" min={0} max={100} value={musicVol} onChange={e => setMusicVol(Number(e.target.value))} className="accent-[#8BAE5A] w-full" />
                <span className="text-[#8BAE5A] text-xs">{musicVol}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PLAYLISTS.map(pl => (
                <button
                  key={pl.name}
                  onClick={() => setPlaylist(pl)}
                  className={`bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-4 flex flex-col gap-2 items-start transition-all hover:scale-105 ${playlist.name === pl.name ? 'ring-2 ring-[#8BAE5A]' : ''}`}
                >
                  <span className="text-white font-semibold">{pl.name}</span>
                  <span className="text-[#8BAE5A] text-xs">Klik om af te spelen</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 