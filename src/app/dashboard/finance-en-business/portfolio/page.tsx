"use client";

import React from 'react';
import { useFinance, FinanceProvider } from '../FinanceContext';

function PortfolioPageContent() {
  const { finance } = useFinance();
  const totalAssets = finance.assets.reduce((sum, a) => sum + a.value, 0);
  const totalInvested = finance.assets.filter(a => a.name !== 'Spaarrekening').reduce((sum, a) => sum + a.value, 0);
  const monthlyPassiveIncome = (totalInvested * 0.04) / 12;
  const passiveGoal = 100;
  const passiveProgress = Math.min(100, Math.round((monthlyPassiveIncome / passiveGoal) * 100));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[#B6C948] mb-4">Investeringsportfolio</h1>
      <p className="text-[#8BAE5A] mb-8">Jouw investeringen en passief inkomen in één overzicht</p>
      
      {/* Portfolio Overzicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
          <h3 className="text-lg font-bold text-[#B6C948] mb-2">Totaal Portfolio</h3>
          <div className="text-2xl font-bold text-[#8BAE5A]">€{totalAssets.toLocaleString('nl-NL')}</div>
        </div>
        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
          <h3 className="text-lg font-bold text-[#B6C948] mb-2">Geïnvesteerd</h3>
          <div className="text-2xl font-bold text-[#8BAE5A]">€{totalInvested.toLocaleString('nl-NL')}</div>
        </div>
        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
          <h3 className="text-lg font-bold text-[#B6C948] mb-2">Liquide</h3>
          <div className="text-2xl font-bold text-[#8BAE5A]">€{(totalAssets - totalInvested).toLocaleString('nl-NL')}</div>
        </div>
        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
          <h3 className="text-lg font-bold text-[#B6C948] mb-2">Passief Inkomen</h3>
          <div className="text-2xl font-bold text-[#8BAE5A]">€{monthlyPassiveIncome.toLocaleString('nl-NL')}</div>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="bg-[#232D1A] rounded-2xl shadow-xl p-8 border border-[#3A4D23] mb-8">
        <h2 className="text-xl font-bold text-[#B6C948] mb-6">Asset Allocation</h2>
        <div className="space-y-4">
          {finance.assets.map((asset, index) => {
            const percentage = totalAssets > 0 ? Math.round((asset.value / totalAssets) * 100) : 0;
            return (
              <div key={asset.name} className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#B6C948] font-medium">{asset.name}</span>
                  <span className="text-[#8BAE5A] font-bold">€{asset.value.toLocaleString('nl-NL')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-[#232D1A] rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-[#8BAE5A] rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[#8BAE5A] text-sm font-medium">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Passief Inkomen Doel */}
      <div className="bg-[#232D1A] rounded-2xl shadow-xl p-8 border border-[#3A4D23]">
        <h2 className="text-xl font-bold text-[#B6C948] mb-6">Passief Inkomen Doel</h2>
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-[#B6C948] mb-2">€{monthlyPassiveIncome.toLocaleString('nl-NL')}</div>
          <div className="text-[#8BAE5A] text-sm">Huidig passief inkomen per maand</div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#8BAE5A] text-sm">Voortgang naar €{passiveGoal}/maand</span>
            <span className="text-[#B6C948] font-bold">{passiveProgress}%</span>
          </div>
          <div className="w-full bg-[#232D1A] rounded-full h-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] transition-all duration-1000"
              style={{ width: `${passiveProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <FinanceProvider>
      <PortfolioPageContent />
    </FinanceProvider>
  );
} 