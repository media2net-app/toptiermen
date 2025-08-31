'use client';

import { useState, useEffect } from 'react';

interface PlatformLoadingProps {
  message?: string;
  showReloadButton?: boolean;
  onReload?: () => void;
}

export default function PlatformLoading({ 
  message = "Platform laden...", 
  showReloadButton = true,
  onReload
}: PlatformLoadingProps) {
  // TEMPORARILY DISABLED TO FIX RICK'S DASHBOARD ACCESS
  return null;

  const [dots, setDots] = useState('');

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-6" style={{ backgroundColor: '#181F17' }}>
      {/* Green pattern background */}
      <img 
        src="/pattern.png" 
        alt="pattern" 
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0" 
      />
      
      {/* Loading content */}
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl bg-[#232D1A]/95 border border-[#3A4D23] backdrop-blur-lg relative z-10">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src="/logo_white-full.svg" 
              alt="Top Tier Men Logo" 
              className="h-16 sm:h-20 w-auto"
            />
          </div>
          
          {/* Loading spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
          
          {/* Loading message */}
          <p className="text-[#B6C948] text-lg font-semibold">
            {message}{dots}
          </p>
          
          {/* Subtitle */}
          <p className="text-[#8BAE5A] text-sm mt-2">
            Even geduld terwijl we alles voor je klaarzetten
          </p>
          
          {/* Reload button */}
          {showReloadButton && (
            <button
              onClick={handleReload}
              className="mt-6 text-[#8BAE5A] hover:text-[#B6C948] underline text-sm transition-colors"
            >
              Handmatig herladen als het te lang duurt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
