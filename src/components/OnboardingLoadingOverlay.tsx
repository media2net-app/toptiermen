'use client';

import React from 'react';

interface OnboardingLoadingOverlayProps {
  show: boolean;
  text: string;
  progress: number;
}

export default function OnboardingLoadingOverlay({ 
  show, 
  text, 
  progress 
}: OnboardingLoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-[#181F17] bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#181F17] border border-[#B6C948] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#B6C948] to-[#3A4D23] rounded-full flex items-center justify-center">
            <span className="text-[#181F17] font-bold text-2xl">TTM</span>
          </div>
          <h2 className="text-[#B6C948] text-xl font-semibold font-figtree">
            Onboarding
          </h2>
        </div>

        {/* Loading Content */}
        <div className="text-center">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B6C948] mx-auto"></div>
          </div>
          
          <p className="text-[#B6C948] text-lg font-medium font-figtree mb-4">
            {text}
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-[#3A4D23] rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-[#B6C948] to-[#3A4D23] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-[#8BAE5A] text-sm font-figtree">
            {progress}% voltooid
          </p>
        </div>

        {/* Loading Steps */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center text-[#B6C948] text-sm font-figtree">
            <div className="w-2 h-2 bg-[#B6C948] rounded-full mr-3"></div>
            <span>Stap verwerken...</span>
          </div>
          <div className="flex items-center text-[#8BAE5A] text-sm font-figtree">
            <div className="w-2 h-2 bg-[#3A4D23] rounded-full mr-3"></div>
            <span>Volgende stap voorbereiden...</span>
          </div>
          <div className="flex items-center text-[#8BAE5A] text-sm font-figtree">
            <div className="w-2 h-2 bg-[#3A4D23] rounded-full mr-3"></div>
            <span>Doorsturen...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
