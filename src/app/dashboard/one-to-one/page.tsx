'use client';

import React from 'react';
import Link from 'next/link';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export default function OneToOneDashboardPage() {
  const { profile } = useSupabaseAuth();

  const name = profile?.full_name || profile?.display_name || profile?.email || 'Klant';

  return (
    <div className="p-4 sm:p-6">
      <div className="grid gap-6">
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Welkom, {name}</h1>
              <p className="text-gray-300 mt-1">Dit is jouw 1:1 dashboard. Hier vind je jouw persoonlijke omgeving en toegang tot de Academy.</p>
            </div>
            <Link href="/dashboard/academy" className="px-4 py-2 rounded-lg bg-[#8BAE5A] text-black font-semibold hover:bg-[#A1C06F] transition-colors">
              Ga naar Academy
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-white">Coaching Notities</h2>
            <p className="text-gray-400 text-sm mt-2">Komt binnenkort. Hier kun je notities en afspraken bijhouden.</p>
          </div>

          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-white">Volgende Sessie</h2>
            <p className="text-gray-400 text-sm mt-2">Komt binnenkort. Hier verschijnen je geplande sessies en doelen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
