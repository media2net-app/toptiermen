"use client";

import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

function CashflowPageContent() {
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
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A] mx-auto"></div>
          <p className="text-white mt-4 text-lg">Cashflow laden...</p>
        </div>
      </div>
    );
  }

  const income = financialProfile?.monthly_income || 0;
  const expenses = financialProfile?.monthly_expenses || 0;
  const savings = income - expenses;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#B6C948] mb-4">Cashflow Overzicht</h1>
      <p className="text-[#8BAE5A] mb-8">Jouw maandelijkse inkomsten en uitgaven in één oogopslag</p>
      
      {/* Hoofdoverzicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Inkomen */}
        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#B6C948]">Maandinkomen</h3>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">€</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#8BAE5A] mb-2">
            €{income.toLocaleString('nl-NL')}
          </div>
          <p className="text-sm text-[#8BAE5A] opacity-75">Bruto maandinkomen</p>
        </div>

        {/* Uitgaven */}
        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#B6C948]">Maandelijkse Uitgaven</h3>
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">€</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#8BAE5A] mb-2">
            €{expenses.toLocaleString('nl-NL')}
          </div>
          <p className="text-sm text-[#8BAE5A] opacity-75">Totaal uitgaven</p>
        </div>

        {/* Spaargeld */}
        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#B6C948]">Spaargeld</h3>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">€</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-[#8BAE5A] mb-2">
            €{savings.toLocaleString('nl-NL')}
          </div>
          <p className="text-sm text-[#8BAE5A] opacity-75">{savingsRate}% van inkomen</p>
        </div>
      </div>

      {/* Cashflow Visualisatie */}
      <div className="bg-[#232D1A] rounded-2xl shadow-xl p-8 border border-[#3A4D23] mb-8">
        <h2 className="text-xl font-bold text-[#B6C948] mb-6">Cashflow Breakdown</h2>
        
        {/* Inkomsten vs Uitgaven Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#8BAE5A] font-medium">Inkomsten vs Uitgaven</span>
            <span className="text-[#8BAE5A] text-sm">€{income.toLocaleString('nl-NL')} totaal</span>
          </div>
          <div className="relative h-12 bg-[#181F17] rounded-lg overflow-hidden">
            {/* Inkomsten (groen) */}
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center"
              style={{ width: '100%' }}
            >
              <span className="text-white font-bold text-sm">€{income.toLocaleString('nl-NL')}</span>
            </div>
            {/* Uitgaven (rood overlay) */}
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center"
              style={{ width: `${(expenses / income) * 100}%` }}
            >
              <span className="text-white font-bold text-sm">€{expenses.toLocaleString('nl-NL')}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-[#8BAE5A] mt-2">
            <span>Uitgaven: €{expenses.toLocaleString('nl-NL')}</span>
            <span>Spaargeld: €{savings.toLocaleString('nl-NL')}</span>
          </div>
        </div>

        {/* Spaarquote Gauge */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#8BAE5A] font-medium">Spaarquote</span>
            <span className="text-[#B6C948] font-bold">{savingsRate}%</span>
          </div>
          <div className="relative h-4 bg-[#181F17] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] transition-all duration-1000"
              style={{ width: `${savingsRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#8BAE5A] mt-2">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Financiële Gezondheid Score */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#8BAE5A] font-medium">Financiële Gezondheid</span>
            <span className="text-[#B6C948] font-bold">
              {savingsRate >= 20 ? 'Uitstekend' : savingsRate >= 10 ? 'Goed' : savingsRate >= 5 ? 'Gemiddeld' : 'Kan Beter'}
            </span>
          </div>
          <div className="bg-[#181F17] rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${
                savingsRate >= 20 ? 'bg-green-500' : 
                savingsRate >= 10 ? 'bg-yellow-500' : 
                savingsRate >= 5 ? 'bg-orange-500' : 'bg-red-500'
              }`} />
              <div className="flex-1">
                <p className="text-[#8BAE5A] text-sm">
                  {savingsRate >= 20 ? 'Je spaart meer dan 20% van je inkomen. Uitstekende financiële discipline!' :
                   savingsRate >= 10 ? 'Je spaart 10-20% van je inkomen. Goede basis voor financiële vrijheid.' :
                   savingsRate >= 5 ? 'Je spaart 5-10% van je inkomen. Er is ruimte voor verbetering.' :
                   'Je spaart minder dan 5% van je inkomen. Overweeg je uitgaven te herzien.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Sectie */}
      <div className="bg-[#232D1A] rounded-2xl shadow-xl p-8 border border-[#3A4D23]">
        <h2 className="text-xl font-bold text-[#B6C948] mb-6">Tips voor Betere Cashflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
            <h3 className="text-[#B6C948] font-bold mb-2">50/30/20 Regel</h3>
            <p className="text-[#8BAE5A] text-sm">
              50% voor behoeften, 30% voor wensen, 20% voor sparen. 
              Probeer deze verhouding aan te houden.
            </p>
          </div>
          <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
            <h3 className="text-[#B6C948] font-bold mb-2">Automatisch Sparen</h3>
            <p className="text-[#8BAE5A] text-sm">
              Zet een automatische overboeking op voor je spaarrekening. 
              Dan spaar je zonder erover na te denken.
            </p>
          </div>
          <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
            <h3 className="text-[#B6C948] font-bold mb-2">Uitgaven Tracken</h3>
            <p className="text-[#8BAE5A] text-sm">
              Houd je uitgaven bij met een app of spreadsheet. 
              Bewustwording is de eerste stap naar verbetering.
            </p>
          </div>
          <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
            <h3 className="text-[#B6C948] font-bold mb-2">Noodfonds</h3>
            <p className="text-[#8BAE5A] text-sm">
              Bouw een noodfonds op van 3-6 maanden uitgaven. 
              Dit geeft je financiële rust en flexibiliteit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CashflowPage() {
  return <CashflowPageContent />;
} 