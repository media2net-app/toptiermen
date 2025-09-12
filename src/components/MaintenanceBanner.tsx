'use client';

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function MaintenanceBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#FF6B35] via-[#F7931E] to-[#FFD700] shadow-lg">
        <div className="px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[#FF6B35] text-sm font-bold">!</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  <span className="font-bold">Brothers,</span> helaas ondervinden we nog wat kleine problemen en loopt het onboarding proces nog niet exact zoals het hoort te lopen. Wij werken momenteel met man en macht om dit zo snel mogelijk op te lossen zodat jullie probleemloos gebruik kunnen maken van het platform. Wij waarderen jullie begrip en loyaliteit hierin.
                </p>
                <p className="text-xs text-white/90 mt-1 font-semibold">
                  - Top Tier Men Team
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setIsVisible(false)}
                className="bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
              >
                <XMarkIcon className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Add padding to body to account for fixed banner */}
      <style jsx global>{`
        body {
          padding-top: ${isVisible ? '80px' : '0px'};
          transition: padding-top 0.3s ease;
        }
      `}</style>
    </>
  );
}
