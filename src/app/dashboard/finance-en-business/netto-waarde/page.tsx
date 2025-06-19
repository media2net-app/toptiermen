"use client";

import React from 'react';
import { useFinance, FinanceProvider } from '../FinanceContext';

function NettoWaardePageContent() {
  const { finance } = useFinance();
  const totalAssets = finance.assets.reduce((sum, a) => sum + a.value, 0);
  const totalDebts = finance.debts.reduce((sum, d) => sum + d.value, 0);
  const netWorth = totalAssets - totalDebts;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-[#B6C948] mb-4">Netto Waarde Details</h1>
      <div className="bg-[#232D1A] rounded-2xl shadow-xl p-8 border border-[#3A4D23] mb-8">
        <h2 className="text-xl font-bold text-[#B6C948] mb-2">Bezittingen</h2>
        <ul className="mb-4">
          {finance.assets.map(a => (
            <li key={a.name} className="flex justify-between text-[#8BAE5A] py-1">
              <span>{a.name}</span>
              <span>€{a.value.toLocaleString('nl-NL')}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold text-[#B6C948] mb-6">
          <span>Totaal Bezittingen</span>
          <span>€{totalAssets.toLocaleString('nl-NL')}</span>
        </div>
        <h2 className="text-xl font-bold text-[#B6C948] mb-2">Schulden</h2>
        <ul className="mb-4">
          {finance.debts.map(d => (
            <li key={d.name} className="flex justify-between text-[#8BAE5A] py-1">
              <span>{d.name}</span>
              <span>€{d.value.toLocaleString('nl-NL')}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-bold text-[#B6C948] mb-6">
          <span>Totaal Schulden</span>
          <span>€{totalDebts.toLocaleString('nl-NL')}</span>
        </div>
        <div className="flex justify-between font-bold text-2xl text-[#B6C948] border-t border-[#3A4D23] pt-4 mt-4">
          <span>Netto Waarde</span>
          <span>€{netWorth.toLocaleString('nl-NL')}</span>
        </div>
      </div>
    </div>
  );
}

export default function NettoWaardePage() {
  return (
    <FinanceProvider>
      <NettoWaardePageContent />
    </FinanceProvider>
  );
} 