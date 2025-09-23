'use client';

import React from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export default function MindFocusPage() {
  const { user, profile } = useSupabaseAuth();

  // Check if user is admin
  const isAdmin = user?.email === 'rick@toptiermen.eu' || user?.email === 'chiel@media2net.nl';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181F17]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Toegang Geweigerd
          </h2>
          <p className="text-[#8BAE5A]/70">
            Deze pagina is alleen toegankelijk voor administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17]">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Mind & Focus 🧠
              </h1>
              <p className="text-[#8BAE5A]/70 text-lg">
                Admin-only pagina voor Mind & Focus functionaliteit.
              </p>
            </div>
            
            <div className="mt-8 p-4 bg-[#3A4D23]/20 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Admin Toegang</h3>
              <p className="text-[#8BAE5A]/70">
                Welkom {user?.email}! Je hebt toegang tot deze admin-only pagina.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
