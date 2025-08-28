'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/navigation';

export default function PlanningLanceringPage() {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('timeline');

  // Check if user is logged in
  useEffect(() => {
    if (!loading && !user) {
      console.log('User not logged in, redirecting to login');
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-[#B6C948] text-xl">Laden...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-[#B6C948] text-xl">Log in om toegang te krijgen</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#B6C948] mb-2">
                🚀 Planning Lancering
              </h1>
              <p className="text-[#8BAE5A] text-lg">
                Countdown naar 10 september - Top Tier Men gaat live!
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#B6C948]">
                {Math.ceil((new Date('2024-09-10').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dagen
              </div>
              <div className="text-[#8BAE5A] text-sm">tot lancering</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-[#232D1A] rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#B6C948] font-semibold">Lancering Progress</span>
              <span className="text-[#8BAE5A] text-sm">1 / 6 voltooid</span>
            </div>
            <div className="w-full bg-[#181F17] rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-[#B6C948] to-[#3A4D23] h-3 rounded-full transition-all duration-500"
                style={{ width: '16.67%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-[#232D1A] rounded-xl p-1 mb-8">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'timeline'
                ? 'bg-[#B6C948] text-[#181F17]'
                : 'text-[#8BAE5A] hover:text-white'
            }`}
          >
            📅 Timeline
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'emails'
                ? 'bg-[#B6C948] text-[#181F17]'
                : 'text-[#8BAE5A] hover:text-white'
            }`}
          >
            📧 E-mail Campagnes
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'tasks'
                ? 'bg-[#B6C948] text-[#181F17]'
                : 'text-[#8BAE5A] hover:text-white'
            }`}
          >
            ✅ Taken Overzicht
          </button>
        </div>

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-[#232D1A] rounded-xl p-6">
              <h2 className="text-2xl font-bold text-[#B6C948] mb-6">Lancering Timeline</h2>
              
              <div className="space-y-6">
                <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">⚙️</span>
                      <div>
                        <h3 className="text-xl font-semibold text-[#B6C948]">E-mail Server Configuratie</h3>
                        <p className="text-[#8BAE5A] text-sm">2024-08-28</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-600">
                        VOLTOOID
                      </span>
                      <div className="text-sm font-semibold mt-1 text-red-400">
                        HIGH
                      </div>
                    </div>
                  </div>
                  <p className="text-[#8BAE5A] mb-3">SMTP server setup en e-mail templates voorbereiden</p>
                  <div className="text-sm text-[#8BAE5A] mb-2">
                    <strong>Toegewezen aan:</strong> Development Team
                  </div>
                  <div className="bg-[#232D1A] rounded-lg p-3">
                    <p className="text-sm text-[#8BAE5A]">✅ Voltooid - E-mail tracking systeem actief</p>
                  </div>
                </div>

                <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📧</span>
                      <div>
                        <h3 className="text-xl font-semibold text-[#B6C948]">Eerste E-mail Campagne</h3>
                        <p className="text-[#8BAE5A] text-sm">2024-08-29</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600">
                        IN PROGRESS
                      </span>
                      <div className="text-sm font-semibold mt-1 text-red-400">
                        HIGH
                      </div>
                    </div>
                  </div>
                  <p className="text-[#8BAE5A] mb-3">Welkomst e-mail naar bestaande leads met platform informatie</p>
                  <div className="text-sm text-[#8BAE5A] mb-2">
                    <strong>Toegewezen aan:</strong> Marketing Team
                  </div>
                  <div className="bg-[#232D1A] rounded-lg p-3">
                    <p className="text-sm text-[#8BAE5A]">📧 Template klaar, klaar voor verzending</p>
                  </div>
                </div>

                <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📧</span>
                      <div>
                        <h3 className="text-xl font-semibold text-[#B6C948]">Informatieve E-mail #1</h3>
                        <p className="text-[#8BAE5A] text-sm">2024-09-02</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-600">
                        PENDING
                      </span>
                      <div className="text-sm font-semibold mt-1 text-red-400">
                        HIGH
                      </div>
                    </div>
                  </div>
                  <p className="text-[#8BAE5A] mb-3">Platform features en functionaliteiten uitleg</p>
                  <div className="text-sm text-[#8BAE5A] mb-2">
                    <strong>Toegewezen aan:</strong> Marketing Team
                  </div>
                  <div className="bg-[#232D1A] rounded-lg p-3">
                    <p className="text-sm text-[#8BAE5A]">Content in ontwikkeling</p>
                  </div>
                </div>

                <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📝</span>
                      <div>
                        <h3 className="text-xl font-semibold text-[#B6C948]">Informatieve E-mail #2</h3>
                        <p className="text-[#8BAE5A] text-sm">2024-09-05</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-600">
                        PENDING
                      </span>
                      <div className="text-sm font-semibold mt-1 text-red-400">
                        HIGH
                      </div>
                    </div>
                  </div>
                  <p className="text-[#8BAE5A] mb-3">Rick's achtergrond en visie voor Top Tier Men</p>
                  <div className="text-sm text-[#8BAE5A] mb-2">
                    <strong>Toegewezen aan:</strong> Content Team
                  </div>
                  <div className="bg-[#232D1A] rounded-lg p-3">
                    <p className="text-sm text-[#8BAE5A]">Rick interview en content creatie</p>
                  </div>
                </div>

                <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📢</span>
                      <div>
                        <h3 className="text-xl font-semibold text-[#B6C948]">Prelaunch Pakket Aanbod</h3>
                        <p className="text-[#8BAE5A] text-sm">2024-09-09</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-600">
                        PENDING
                      </span>
                      <div className="text-sm font-semibold mt-1 text-red-600">
                        CRITICAL
                      </div>
                    </div>
                  </div>
                  <p className="text-[#8BAE5A] mb-3">50% early access korting aanbieding</p>
                  <div className="text-sm text-[#8BAE5A] mb-2">
                    <strong>Toegewezen aan:</strong> Marketing Team
                  </div>
                  <div className="bg-[#232D1A] rounded-lg p-3">
                    <p className="text-sm text-[#8BAE5A]">Pricing strategie en aanbieding details</p>
                  </div>
                </div>

                <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">⚙️</span>
                      <div>
                        <h3 className="text-xl font-semibold text-[#B6C948]">Platform Launch</h3>
                        <p className="text-[#8BAE5A] text-sm">2024-09-10</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-600">
                        PENDING
                      </span>
                      <div className="text-sm font-semibold mt-1 text-red-600">
                        CRITICAL
                      </div>
                    </div>
                  </div>
                  <p className="text-[#8BAE5A] mb-3">Live gaan met Top Tier Men platform</p>
                  <div className="text-sm text-[#8BAE5A] mb-2">
                    <strong>Toegewezen aan:</strong> Development Team
                  </div>
                  <div className="bg-[#232D1A] rounded-lg p-3">
                    <p className="text-sm text-[#8BAE5A]">Final testing en deployment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Campaigns Tab */}
        {activeTab === 'emails' && (
          <div className="space-y-6">
            <div className="bg-[#232D1A] rounded-xl p-6">
              <h2 className="text-2xl font-bold text-[#B6C948] mb-6">E-mail Funnel Planning</h2>
              
              <div className="grid gap-6">
                <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[#B6C948] mb-2">Welkom bij Top Tier Men - Jouw reis naar het volgende niveau begint hier</h3>
                      <p className="text-[#8BAE5A] mb-2">Welkomst e-mail met platform introductie en wat te verwachten</p>
                      <div className="flex items-center space-x-4 text-sm text-[#8BAE5A]">
                        <span>📅 2024-08-29</span>
                        <span>👥 Alle bestaande leads</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600">
                        SCHEDULED
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[#B6C948] mb-2">Ontdek de kracht van het Top Tier Men platform</h3>
                      <p className="text-[#8BAE5A] mb-2">Uitgebreide uitleg van platform features en voordelen</p>
                      <div className="flex items-center space-x-4 text-sm text-[#8BAE5A]">
                        <span>📅 2024-09-02</span>
                        <span>👥 Actieve leads</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-600">
                        DRAFT
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[#B6C948] mb-2">Ontmoet Rick - De visie achter Top Tier Men</h3>
                      <p className="text-[#8BAE5A] mb-2">Rick's achtergrond, ervaring en visie voor de community</p>
                      <div className="flex items-center space-x-4 text-sm text-[#8BAE5A]">
                        <span>📅 2024-09-05</span>
                        <span>👥 Engaged leads</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-600">
                        DRAFT
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[#B6C948] mb-2">🚀 EXCLUSIEF: 50% Early Access Korting - Beperkte tijd beschikbaar</h3>
                      <p className="text-[#8BAE5A] mb-2">Prelaunch aanbieding met 50% korting voor early access</p>
                      <div className="flex items-center space-x-4 text-sm text-[#8BAE5A]">
                        <span>📅 2024-09-09</span>
                        <span>👥 Alle leads</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-600">
                        DRAFT
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Overview Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="bg-[#232D1A] rounded-xl p-6">
              <h2 className="text-2xl font-bold text-[#B6C948] mb-6">Taken Overzicht</h2>
              
              <div className="grid gap-4">
                <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">⚙️</span>
                      <div>
                        <h3 className="font-semibold text-[#B6C948]">E-mail Server Configuratie</h3>
                        <p className="text-sm text-[#8BAE5A]">2024-08-28</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-600">VOLTOOID</span>
                      <span className="text-xs font-semibold text-red-400">HIGH</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📧</span>
                      <div>
                        <h3 className="font-semibold text-[#B6C948]">Eerste E-mail Campagne</h3>
                        <p className="text-sm text-[#8BAE5A]">2024-08-29</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-600">IN PROGRESS</span>
                      <span className="text-xs font-semibold text-red-400">HIGH</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📧</span>
                      <div>
                        <h3 className="font-semibold text-[#B6C948]">Informatieve E-mail #1</h3>
                        <p className="text-sm text-[#8BAE5A]">2024-09-02</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-600">PENDING</span>
                      <span className="text-xs font-semibold text-red-400">HIGH</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📝</span>
                      <div>
                        <h3 className="font-semibold text-[#B6C948]">Informatieve E-mail #2</h3>
                        <p className="text-sm text-[#8BAE5A]">2024-09-05</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-600">PENDING</span>
                      <span className="text-xs font-semibold text-red-400">HIGH</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📢</span>
                      <div>
                        <h3 className="font-semibold text-[#B6C948]">Prelaunch Pakket Aanbod</h3>
                        <p className="text-sm text-[#8BAE5A]">2024-09-09</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-600">PENDING</span>
                      <span className="text-xs font-semibold text-red-600">CRITICAL</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">⚙️</span>
                      <div>
                        <h3 className="font-semibold text-[#B6C948]">Platform Launch</h3>
                        <p className="text-sm text-[#8BAE5A]">2024-09-10</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-600">PENDING</span>
                      <span className="text-xs font-semibold text-red-600">CRITICAL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-[#232D1A] rounded-xl p-6 mt-8">
          <h2 className="text-xl font-bold text-[#B6C948] mb-4">Snelle Acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-[#B6C948] text-[#181F17] py-3 px-4 rounded-lg font-semibold hover:bg-[#3A4D23] transition-colors">
              📧 E-mail Template Bewerken
            </button>
            <button className="bg-[#B6C948] text-[#181F17] py-3 px-4 rounded-lg font-semibold hover:bg-[#3A4D23] transition-colors">
              📊 Analytics Bekijken
            </button>
            <button className="bg-[#B6C948] text-[#181F17] py-3 px-4 rounded-lg font-semibold hover:bg-[#3A4D23] transition-colors">
              ✅ Taak Status Updaten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
