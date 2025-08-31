"use client";

import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import Breadcrumb, { createBreadcrumbs } from '@/components/Breadcrumb';

function PortfolioPageContent() {
  const { user } = useSupabaseAuth();
  const [financialProfile, setFinancialProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialProfile = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/finance/profile?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setFinancialProfile(data.profile);
        }
      } catch (error) {
        console.error('Error fetching financial profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A] mx-auto"></div>
          <p className="text-white mt-4 text-lg">Portfolio laden...</p>
        </div>
      </div>
    );
  }

  const netWorth = financialProfile?.net_worth || 0;
  const monthlyIncome = financialProfile?.monthly_income || 0;
  const monthlyExpenses = financialProfile?.monthly_expenses || 0;
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const passiveIncomeGoal = financialProfile?.passive_income_goal || 0;
  const currentPassiveIncome = monthlySavings; // Simplified calculation
  const passiveProgress = passiveIncomeGoal > 0 ? Math.min(100, Math.round((currentPassiveIncome / passiveIncomeGoal) * 100)) : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb 
          items={createBreadcrumbs(
            'Investeringsportfolio',
            'Finance & Business',
            '/dashboard/finance-en-business'
          )} 
        />
      </div>
      
      <h1 className="text-3xl font-bold text-[#B6C948] mb-4">Investeringsportfolio</h1>
      <p className="text-[#8BAE5A] mb-8">Jouw investeringen en passief inkomen in één overzicht</p>
      
      {/* Portfolio Overzicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
          <h3 className="text-lg font-bold text-[#B6C948] mb-2">Netto Waarde</h3>
          <div className="text-2xl font-bold text-[#8BAE5A]">€{netWorth.toLocaleString('nl-NL')}</div>
        </div>
        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
          <h3 className="text-lg font-bold text-[#B6C948] mb-2">Maandinkomen</h3>
          <div className="text-2xl font-bold text-[#8BAE5A]">€{monthlyIncome.toLocaleString('nl-NL')}</div>
        </div>
        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
          <h3 className="text-lg font-bold text-[#B6C948] mb-2">Maandelijkse Besparingen</h3>
          <div className="text-2xl font-bold text-[#8BAE5A]">€{monthlySavings.toLocaleString('nl-NL')}</div>
        </div>
        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
          <h3 className="text-lg font-bold text-[#B6C948] mb-2">Passief Inkomen Doel</h3>
          <div className="text-2xl font-bold text-[#8BAE5A]">€{passiveIncomeGoal.toLocaleString('nl-NL')}</div>
        </div>
      </div>

      {/* Investeringsvoorkeuren */}
      <div className="bg-[#232D1A] rounded-2xl shadow-xl p-8 border border-[#3A4D23] mb-8">
        <h2 className="text-xl font-bold text-[#B6C948] mb-6">Investeringsvoorkeuren</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {financialProfile?.investment_categories?.map((category: string, index: number) => (
            <div key={index} className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23] text-center">
              <div className="w-8 h-8 bg-[#8BAE5A] rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-[#232D1A] text-sm font-bold">✓</span>
              </div>
              <span className="text-[#8BAE5A] text-sm">{category}</span>
            </div>
          )) || (
            <div className="col-span-full text-center text-[#8BAE5A] opacity-75">
              Geen investeringsvoorkeuren ingesteld
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-[#181F17] rounded-lg border border-[#3A4D23]">
          <h3 className="text-lg font-bold text-[#B6C948] mb-2">Risicotolerantie</h3>
          <div className="text-[#8BAE5A] capitalize">
            {financialProfile?.risk_tolerance || 'Niet ingesteld'}
          </div>
        </div>
      </div>

      {/* Passief Inkomen Doel */}
      <div className="bg-[#232D1A] rounded-2xl shadow-xl p-8 border border-[#3A4D23]">
        <h2 className="text-xl font-bold text-[#B6C948] mb-6">Passief Inkomen Doel</h2>
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-[#B6C948] mb-2">€{currentPassiveIncome.toLocaleString('nl-NL')}</div>
          <div className="text-[#8BAE5A] text-sm">Huidig passief inkomen per maand</div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#8BAE5A] text-sm">Voortgang naar €{passiveIncomeGoal.toLocaleString('nl-NL')}/maand</span>
            <span className="text-[#B6C948] font-bold">{passiveProgress}%</span>
          </div>
          <div className="w-full bg-[#232D1A] rounded-full h-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] transition-all duration-1000"
              style={{ width: `${passiveProgress}%` }}
            />
          </div>
        </div>
        <div className="text-center text-[#8BAE5A] text-sm">
          Nog €{(passiveIncomeGoal - currentPassiveIncome).toLocaleString('nl-NL')} te gaan naar je doel
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  return <PortfolioPageContent />;
} 