"use client";
import ClientLayout from '../../../components/ClientLayout';
import Link from 'next/link';
import { useState } from 'react';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const chapters = [
  {
    title: 'Introductie tot Geldmanagement',
    completed: true,
    content: 'Leer waarom goed geldmanagement de basis is voor financiële vrijheid en rust. Ontdek de belangrijkste principes van geldbeheer.'
  },
  {
    title: 'Budgetteren & Overzicht',
    completed: true,
    content: 'Praktische tips om je inkomsten en uitgaven inzichtelijk te maken. Werk met een simpel budget en houd grip op je geld.'
  },
  {
    title: 'Sparen & Noodfonds',
    completed: false,
    content: 'Waarom sparen essentieel is en hoe je een noodfonds opbouwt voor onverwachte situaties.'
  },
  {
    title: 'Investeren voor Beginners',
    completed: false,
    content: 'De basis van investeren: hoe begin je, wat zijn de risico\'s en hoe laat je je geld voor je werken.'
  },
  {
    title: 'Mindset & Geld',
    completed: false,
    content: 'Hoe je overtuigingen over geld je financiële succes bepalen. Werk aan een gezonde money mindset.'
  },
];

export default function GeldmanagementELearning() {
  const [selected, setSelected] = useState(0);
  const progress = Math.round((chapters.filter(c => c.completed).length / chapters.length) * 100);

  return (
    <ClientLayout>
      <div className="py-8 px-4 md:px-12">
        <Link href="/dashboard/finance-en-business" className="text-[#A3AED6] hover:underline mb-6 inline-block">← Terug naar Finance & Business</Link>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Geldmanagement & Investeren</h1>
        <p className="text-[#A3AED6] text-lg mb-6 max-w-2xl">Jouw e-learning: leer stap voor stap hoe je grip krijgt op je geld, spaart, investeert en financieel groeit.</p>
        {/* Voortgangsbalk */}
        <div className="mb-8 max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#A3AED6] font-semibold">Voortgang</span>
            <span className="text-white font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#393053]/40 rounded-full">
            <div className="h-2 bg-gradient-to-r from-[#635985] to-[#443C68] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        {/* Hoofdstukken */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-4xl">
          {chapters.map((ch, i) => (
            <button
              key={ch.title}
              onClick={() => setSelected(i)}
              className={`flex items-center gap-4 p-4 rounded-2xl border border-[#393053]/40 shadow-xl bg-[#232042]/80 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#635985] ${selected === i ? 'ring-2 ring-[#635985]' : ''}`}
            >
              <span className={`w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold ${ch.completed ? 'bg-gradient-to-br from-[#635985] to-[#443C68] text-white' : 'bg-[#393053]/40 text-[#A3AED6]'}`}>
                {ch.completed ? '✓' : i + 1}
              </span>
              <span className={`text-left ${ch.completed ? 'text-white' : 'text-[#A3AED6]'}`}>{ch.title}</span>
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 max-w-2xl">
          <h2 className="text-2xl font-semibold text-white mb-2">{chapters[selected].title}</h2>
          <p className="text-[#A3AED6] text-sm">{chapters[selected].content}</p>
        </div>
      </div>
    </ClientLayout>
  );
} 