'use client';
import ClientLayout from '../../../components/ClientLayout';
import { useState } from 'react';
import { FaWind, FaRegPauseCircle, FaRegStopCircle, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const oefeningen = [
  {
    id: 'box',
    title: 'Box Breathing',
    tag: 'Voor Focus & Kalmte',
    duration: '5 min',
    icon: <FaWind className="w-6 h-6 text-[#8BAE5A]" />,
    uitleg: [
      'Adem 4 seconden in',
      'Houd 4 seconden vast',
      'Adem 4 seconden uit',
      'Houd 4 seconden vast',
    ],
    beschrijving:
      "De Box Breathing techniek, ook wel 'vierkante ademhaling' genoemd, wordt gebruikt door Navy SEALs en atleten om het zenuwstelsel te kalmeren, stress te verminderen en concentratie te verbeteren in hoge-druk situaties.",
    patroon: [4, 4, 4, 4],
  },
  {
    id: '478',
    title: '4-7-8 Ademhaling',
    tag: 'Voor Ontspanning & Slaap',
    duration: '5 min',
    icon: <FaWind className="w-6 h-6 text-[#FFD700]" />,
    uitleg: [
      'Adem 4 seconden in',
      'Houd 7 seconden vast',
      'Adem 8 seconden uit',
    ],
    beschrijving:
      'Deze oefening helpt je om direct meer rust te ervaren en je focus te verbeteren. Ideaal voor stressvolle momenten of als start van je dag.',
    patroon: [4, 7, 8],
  },
  {
    id: 'wimhof',
    title: 'Wim Hof Methode',
    tag: 'Voor Energie & Veerkracht',
    duration: '3 rondes',
    icon: <FaWind className="w-6 h-6 text-[#8BAE5A]" />,
    uitleg: [
      '30x krachtig inademen',
      'Adem uit, houd zo lang mogelijk vast',
      'Diep inademen, 15 sec vasthouden',
    ],
    beschrijving:
      'De beroemde ademtechniek van Wim Hof voor meer energie, focus en een sterker immuunsysteem.',
    patroon: [30, 60, 15],
  },
];

const WELKOM = 'welkom';
const UITLEG = 'uitleg';
const SESSIE = 'sessie';
const REFLECTIE = 'reflectie';

export default function Ademhaling() {
  const [selected, setSelected] = useState<null | typeof oefeningen[0]>(null);
  const [fase, setFase] = useState(WELKOM);
  const [sessieStap, setSessieStap] = useState(0);
  const [sessieRunning, setSessieRunning] = useState(false);
  const [volume, setVolume] = useState(80);
  const [voiceOn, setVoiceOn] = useState(true);
  const [reflectie, setReflectie] = useState<string | null>(null);

  // Dummy animatie logica (geen echte timing/voice)
  const startSessie = () => {
    setFase(SESSIE);
    setSessieStap(0);
    setSessieRunning(true);
    // Hier zou een echte timer/animatie komen
  };
  const stopSessie = () => {
    setSessieRunning(false);
    setFase(REFLECTIE);
  };

  return (
    <ClientLayout>
      <div className="py-8 px-4 md:px-12 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Geleide Ademhaling</h1>
        <p className="text-[#8BAE5A] text-lg mb-8">Vind rust, focus of energie met je ademhaling als gids.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Linkerkolom: oefeningen */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white mb-2">Kies je oefening</h2>
            {oefeningen.map((oef) => (
              <button
                key={oef.id}
                onClick={() => { setSelected(oef); setFase(UITLEG); }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all shadow bg-[#232D1A]/80 border-[#3A4D23]/40 hover:border-[#8BAE5A] ${selected?.id === oef.id && fase !== WELKOM ? 'ring-2 ring-[#8BAE5A]' : ''}`}
              >
                {oef.icon}
                <div className="flex flex-col text-left">
                  <span className="text-white font-semibold">{oef.title}</span>
                  <span className="text-[#8BAE5A] text-xs">{oef.tag}</span>
                  <span className="text-[#8BAE5A]/70 text-xs">{oef.duration}</span>
                </div>
              </button>
            ))}
          </div>
          {/* Rechterkolom: gids */}
          <div className="md:col-span-2">
            <div className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 min-h-[340px] flex flex-col items-center justify-center p-8 relative">
              {/* Welkom */}
              {fase === WELKOM && (
                <div className="flex flex-col items-center justify-center h-full">
                  <img src="/images/mind/breathing-welcome.jpg" alt="Rust" className="w-40 h-40 object-cover rounded-full mb-6 opacity-60" />
                  <div className="text-xl text-white mb-2 font-bold">Welkom bij Geleide Ademhaling</div>
                  <div className="text-[#8BAE5A] text-center max-w-md">Selecteer een oefening aan de linkerkant om te beginnen. Elke ademhaling is een nieuwe start.</div>
                </div>
              )}
              {/* Uitleg */}
              {fase === UITLEG && selected && (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-2xl text-white font-bold mb-2">{selected.title}</div>
                  <div className="text-[#8BAE5A] mb-4 text-center max-w-lg">{selected.beschrijving}</div>
                  <ul className="mb-4 text-[#8BAE5A]/80 text-sm list-disc list-inside">
                    {selected.uitleg.map((u, i) => <li key={i}>{u}</li>)}
                  </ul>
                  <button onClick={startSessie} className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-semibold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">START SESSIE</button>
                </div>
              )}
              {/* Sessie */}
              {fase === SESSIE && selected && (
                <div className="flex flex-col items-center justify-center h-full w-full">
                  {/* Dummy animatie: grote cirkel met tekst */}
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#8BAE5A]/30 to-[#232D1A] flex items-center justify-center mb-6 animate-pulse-slow">
                    <span className="text-2xl text-white font-bold">{selected.uitleg[sessieStap % selected.uitleg.length]}</span>
                  </div>
                  <div className="flex gap-4 mb-4">
                    <button className="w-12 h-12 rounded-full bg-[#8BAE5A] flex items-center justify-center text-[#232D1A] text-2xl shadow-lg" onClick={() => setSessieRunning(false)}><FaRegPauseCircle /></button>
                    <button className="w-12 h-12 rounded-full bg-[#FFD700] flex items-center justify-center text-[#232D1A] text-2xl shadow-lg" onClick={stopSessie}><FaRegStopCircle /></button>
                  </div>
                  <div className="flex gap-4 items-center mb-2">
                    <FaVolumeUp className={`text-[#8BAE5A] text-xl ${volume === 0 ? 'opacity-30' : ''}`} onClick={() => setVolume(volume === 0 ? 80 : 0)} />
                    <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(Number(e.target.value))} className="accent-[#8BAE5A]" />
                    <button onClick={() => setVoiceOn(v => !v)}>{voiceOn ? <FaVolumeUp className="text-[#FFD700] text-xl" /> : <FaVolumeMute className="text-[#FFD700] text-xl opacity-40" />}</button>
                  </div>
                  <div className="text-[#8BAE5A] text-xs">Achtergrondmuziek & stem</div>
                </div>
              )}
              {/* Reflectie */}
              {fase === REFLECTIE && selected && (
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <div className="text-2xl text-white font-bold mb-2">Sessie Voltooid. Goed gedaan, Rick.</div>
                  <div className="text-[#8BAE5A] mb-4">Je hebt {selected.duration} de '{selected.title}' techniek voltooid.</div>
                  <div className="mb-4">Hoe voel je je nu?</div>
                  <div className="flex gap-4 mb-6">
                    {['😊','😌','🧘‍♂️','😴','💪'].map(e => (
                      <button key={e} onClick={() => setReflectie(e)} className={`text-3xl ${reflectie === e ? 'ring-2 ring-[#8BAE5A]' : ''}`}>{e}</button>
                    ))}
                  </div>
                  <button className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-semibold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all mb-2" onClick={() => { setFase(WELKOM); setSelected(null); setReflectie(null); }}>Terug naar het overzicht</button>
                  <button className="underline text-[#8BAE5A] text-sm" onClick={() => alert('Toegevoegd aan dagelijkse missies!')}>Voeg ademhaling toe aan mijn dagelijkse missies</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 