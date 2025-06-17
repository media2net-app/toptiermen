'use client';
import ClientLayout from '../../../components/ClientLayout';
import { useState } from 'react';

const sources = [
  { name: 'Dividend aandelen', amount: 50 },
  { name: 'Affiliate marketing', amount: 75 },
  { name: 'Verhuur', amount: 25 },
];
const goal = 500;

export default function PassiefInkomen() {
  const total = sources.reduce((sum, s) => sum + s.amount, 0);
  const progress = Math.min(100, Math.round((total / goal) * 100));
  return (
    <ClientLayout>
      <div className="p-6 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Passief Inkomen</h1>
            <p className="text-[#8BAE5A] text-lg">Bouw aan je financiële vrijheid met meerdere inkomensbronnen</p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-bold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all border border-[#8BAE5A]">
            + Bron toevoegen
          </button>
        </div>
        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23] mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-[#8BAE5A] font-semibold">Doel: €{goal}</span>
            <span className="text-white font-semibold">Totaal: €{total}</span>
          </div>
          <div className="w-full h-4 bg-[#3A4D23]/40 rounded-full mb-4">
            <div className="h-4 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex flex-col gap-4">
            {sources.map((s) => (
              <div key={s.name} className="flex items-center justify-between bg-[#1B2214] rounded-xl px-4 py-3">
                <span className="text-white font-semibold">{s.name}</span>
                <span className="text-[#8BAE5A] font-bold">€{s.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 