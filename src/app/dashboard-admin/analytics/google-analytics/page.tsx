'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function GoogleAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-8 h-8 text-[#B6C948]" />
          <h1 className="text-3xl font-bold text-white">Google Analytics</h1>
        </div>
        
        <div className="bg-[#232D1A] p-6 rounded-lg border border-[#3A4D23]">
          <div className="animate-pulse">
            <div className="h-4 bg-[#3A4D23] rounded mb-2 w-1/4"></div>
            <div className="h-8 bg-[#3A4D23] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ChartBarIcon className="w-8 h-8 text-[#B6C948]" />
        <h1 className="text-3xl font-bold text-white">Google Analytics</h1>
      </div>
      
      <div className="bg-[#232D1A] p-6 rounded-lg border border-[#3A4D23]">
        <h2 className="text-xl font-semibold text-white mb-4">Google Analytics Dashboard</h2>
        <p className="text-[#8BAE5A] mb-4">
          Deze pagina wordt momenteel ontwikkeld. Hier komt de volledige Google Analytics integratie.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
            <h3 className="text-[#B6C948] font-semibold">Actieve Gebruikers</h3>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-[#8BAE5A] text-sm">● Live</p>
          </div>
          
          <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
            <h3 className="text-[#B6C948] font-semibold">Totaal Gebruikers</h3>
            <p className="text-2xl font-bold text-white">1,247</p>
            <p className="text-[#8BAE5A] text-sm">Laatste 7 dagen</p>
          </div>
          
          <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
            <h3 className="text-[#B6C948] font-semibold">Page Views</h3>
            <p className="text-2xl font-bold text-white">8,923</p>
            <p className="text-[#8BAE5A] text-sm">Laatste 7 dagen</p>
          </div>
          
          <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
            <h3 className="text-[#B6C948] font-semibold">Bounce Rate</h3>
            <p className="text-2xl font-bold text-white">34.2%</p>
            <p className="text-[#8BAE5A] text-sm">Gemiddelde</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-[#181F17] rounded-lg border border-[#3A4D23]">
          <h3 className="text-[#B6C948] font-semibold mb-2">Komende Features:</h3>
          <ul className="text-[#8BAE5A] text-sm space-y-1">
            <li>• Live wereldkaart met gebruikers locaties</li>
            <li>• Real-time analytics data</li>
            <li>• Gebruikers flow tracking</li>
            <li>• Device en browser analytics</li>
            <li>• Custom event tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
