'use client';

import React from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';

export default function WelcomeVideoPage() {
  const { user } = useSupabaseAuth();
  const { currentStep, isCompleted } = useOnboardingV2();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181F17]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Authenticatie Vereist
          </h2>
          <p className="text-[#8BAE5A]/70">
            Je moet ingelogd zijn om deze pagina te bekijken.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#181F17]">
      {/* Background content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Welkom bij Top Tier Men! 🎉
              </h1>
              <p className="text-[#8BAE5A]/70 text-lg">
                Bekijk deze welkomstvideo om te beginnen met je journey naar een betere versie van jezelf.
              </p>
            </div>
            
            <div className="mt-8 p-4 bg-[#3A4D23]/20 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Wat kun je verwachten?</h3>
              <ul className="text-[#8BAE5A]/70 space-y-1">
                <li>• Persoonlijke profiel setup</li>
                <li>• Uitdagingen selecteren die bij je passen</li>
                <li className="flex items-center gap-2">
                  <span>• Trainingsschema kiezen</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                    PREMIUM
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span>• Voedingsplan bepalen</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                    PREMIUM
                  </span>
                </li>
                <li>• Challenge selecteren</li>
                <li>• Introductie aan de Brotherhood community</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
