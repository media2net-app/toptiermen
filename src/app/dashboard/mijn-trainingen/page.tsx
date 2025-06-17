'use client';
import ClientLayout from '../../components/ClientLayout';

const trainingenDezeWeek = [
  { id: 1, dag: 'Maandag 27 mei', type: 'Krachttraining', gedaan: true },
  { id: 2, dag: 'Woensdag 29 mei', type: 'Cardio', gedaan: true },
  { id: 3, dag: 'Vrijdag 31 mei', type: 'Full body', gedaan: false },
];

const komendeWeek = [
  { id: 4, dag: 'Maandag 3 juni', type: 'Krachttraining' },
  { id: 5, dag: 'Donderdag 6 juni', type: 'Cardio' },
];

export default function MijnTrainingen() {
  return (
    <ClientLayout>
      <div className="p-6 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mijn Trainingen</h1>
            <p className="text-[#8BAE5A] text-lg">Overzicht van je trainingen deze week</p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-bold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all border border-[#8BAE5A]">
            + Nieuwe training starten
          </button>
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#8BAE5A] font-semibold">Deze week</span>
            <span className="text-[#8BAE5A] font-bold">2/3 trainingen gedaan</span>
          </div>
          <div className="w-full h-2 bg-[#3A4D23]/40 rounded-full mb-4">
            <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all duration-500" style={{ width: '66%' }}></div>
          </div>
          <ul className="divide-y divide-[#3A4D23]">
            {trainingenDezeWeek.map(t => (
              <li key={t.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${t.gedaan ? 'bg-[#8BAE5A] border-[#8BAE5A] text-[#181F17]' : 'bg-[#232D1A] border-[#3A4D23] text-[#8BAE5A]'}`}>{t.gedaan ? '✓' : ''}</span>
                  <span className={`text-lg ${t.gedaan ? 'line-through text-[#B6C948]' : 'text-white'}`}>{t.dag}</span>
                  <span className="ml-2 px-2 py-0.5 rounded bg-[#3A4D23] text-[#8BAE5A] text-xs font-semibold">{t.type}</span>
                </div>
                {t.gedaan && <span className="text-[#8BAE5A] text-sm">Voltooid</span>}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="text-[#8BAE5A] font-semibold mb-2 block">Komende week</span>
          <ul className="divide-y divide-[#3A4D23]">
            {komendeWeek.map(t => (
              <li key={t.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center border-2 bg-[#232D1A] border-[#3A4D23] text-[#8BAE5A]">•</span>
                  <span className="text-lg text-white">{t.dag}</span>
                  <span className="ml-2 px-2 py-0.5 rounded bg-[#3A4D23] text-[#8BAE5A] text-xs font-semibold">{t.type}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ClientLayout>
  );
} 