'use client';
import ClientLayout from '../../components/ClientLayout';
import { useState } from 'react';

const initialMissions = [
  { id: 1, title: '10.000 stappen per dag', type: 'Dagelijks', done: true },
  { id: 2, title: '30 min lezen', type: 'Dagelijks', done: true },
  { id: 3, title: '3x sporten', type: 'Wekelijks', done: false },
  { id: 4, title: '2x mediteren', type: 'Wekelijks', done: false },
];

export default function MijnMissies() {
  const [missions, setMissions] = useState(initialMissions);
  const [filter, setFilter] = useState('deze week');

  return (
    <ClientLayout>
      <div className="p-6 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mijn Missies</h1>
            <p className="text-[#8BAE5A] text-lg">Overzicht van je actieve en voltooide missies deze week</p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-bold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all border border-[#8BAE5A]">
            + Nieuwe missie toevoegen
          </button>
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
                <li key={m.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${m.done ? 'bg-[#8BAE5A] border-[#8BAE5A] text-[#181F17]' : 'bg-[#232D1A] border-[#3A4D23] text-[#8BAE5A]'}`}>{m.done ? '✓' : ''}</span>
                    <span className={`text-lg ${m.done ? 'line-through text-[#B6C948]' : 'text-white'}`}>{m.title}</span>
                    <span className="ml-2 px-2 py-0.5 rounded bg-[#3A4D23] text-[#8BAE5A] text-xs font-semibold">{m.type}</span>
                  </div>
                  {m.done && <span className="text-[#8BAE5A] text-sm">Voltooid</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ClientLayout>
  );
} 