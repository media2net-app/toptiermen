'use client';
import React from 'react';
import Link from 'next/link';

export default function AlgemeenForumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">💬 Algemeen</h1>
          <p className="text-[#8BAE5A] text-lg">Algemene discussies en vragen</p>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          <div className="bg-[#232D1A]/80 rounded-2xl p-8 text-center border border-[#3A4D23]/40">
            <div className="text-[#8BAE5A] text-lg mb-4">Welkom bij het Algemeen Forum</div>
            <p className="text-gray-400 mb-6">Hier kun je algemene discussies voeren en nieuwe leden ontmoeten.</p>
            <Link 
              href="/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
            >
              👋 Stel je voor aan nieuwe leden
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link 
            href="/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all"
          >
            👋 Stel je voor
          </Link>
          <Link 
            href="/dashboard/brotherhood/forum"
            className="px-6 py-3 rounded-xl bg-[#3A4D23]/60 text-[#8BAE5A] font-bold shadow hover:bg-[#3A4D23]/80 transition-all"
          >
            ← Terug naar Forum
          </Link>
        </div>
      </div>
    </div>
  );
}