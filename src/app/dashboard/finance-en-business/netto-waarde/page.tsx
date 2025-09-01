"use client";

import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import Breadcrumb, { createBreadcrumbs } from '@/components/Breadcrumb';
import PageLayout from '@/components/PageLayout';

function NettoWaardePageContent() {
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
      <div className="p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A] mx-auto"></div>
          <p className="text-white mt-4 text-lg">Netto Waarde laden...</p>
        </div>
      </div>
    );
  }

  const netWorth = financialProfile?.net_worth || 0;

  return (
    <PageLayout
      title="Netto Waarde Details"
      maxWidth="2xl"
    >
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb 
          items={createBreadcrumbs(
            'Netto Waarde',
            'Finance & Business',
            '/dashboard/finance-en-business'
          )} 
        />
      </div>
      <div className="bg-[#232D1A] rounded-2xl shadow-xl p-8 border border-[#3A4D23] mb-8">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-[#B6C948] mb-2">
            €{netWorth.toLocaleString('nl-NL')}
          </div>
          <div className="text-[#8BAE5A] text-lg">Jouw totale netto waarde</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-[#B6C948] mb-4">Financiële Overzicht</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-[#8BAE5A] py-2 border-b border-[#3A4D23]">
                <span>Maandelijkse Inkomsten</span>
                <span className="font-semibold">€{financialProfile?.monthly_income?.toLocaleString('nl-NL') || '0'}</span>
              </div>
              <div className="flex justify-between text-[#8BAE5A] py-2 border-b border-[#3A4D23]">
                <span>Maandelijkse Uitgaven</span>
                <span className="font-semibold">€{financialProfile?.monthly_expenses?.toLocaleString('nl-NL') || '0'}</span>
              </div>
              <div className="flex justify-between text-[#8BAE5A] py-2 border-b border-[#3A4D23]">
                <span>Maandelijkse Besparingen</span>
                <span className="font-semibold text-[#B6C948]">
                  €{((financialProfile?.monthly_income || 0) - (financialProfile?.monthly_expenses || 0)).toLocaleString('nl-NL')}
                </span>
              </div>
              <div className="flex justify-between text-[#8BAE5A] py-2">
                <span>Spaarquote</span>
                <span className="font-semibold text-[#B6C948]">
                  {financialProfile?.monthly_income > 0 
                    ? Math.round(((financialProfile.monthly_income - financialProfile.monthly_expenses) / financialProfile.monthly_income) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-[#B6C948] mb-4">Investeringsvoorkeuren</h2>
            <div className="space-y-2">
              {financialProfile?.investment_categories?.map((category: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                  <span className="text-[#8BAE5A]">{category}</span>
                </div>
              )) || (
                <div className="text-[#8BAE5A] opacity-75">Geen voorkeuren ingesteld</div>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-bold text-[#B6C948] mb-2">Risicotolerantie</h3>
              <div className="text-[#8BAE5A] capitalize">
                {financialProfile?.risk_tolerance || 'Niet ingesteld'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default function NettoWaardePage() {
  return <NettoWaardePageContent />;
} 