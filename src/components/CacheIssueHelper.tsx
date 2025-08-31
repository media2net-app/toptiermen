'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface CacheIssueHelperProps {
  onResolve?: () => void;
}

export default function CacheIssueHelper({ onResolve }: CacheIssueHelperProps) {
  const [showHelper, setShowHelper] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Check for potential cache issues - DISABLED TO PREVENT INFINITE MODAL
    const checkForCacheIssues = () => {
      // DISABLED: This was causing infinite modal loops
      // Cache issues are now handled by the CacheBuster component
      return;
      
      // const lastVersion = localStorage.getItem('ttm-app-version');
      // const currentVersion = '2.0.3';
      // 
      // // Show helper if version mismatch or no version stored
      // if (!lastVersion || lastVersion !== currentVersion) {
      //   setShowHelper(true);
      // }
      // 
      // // Check for other cache-related issues
      // const hasOldCache = localStorage.getItem('ttm-cache-bust') === null;
      // if (hasOldCache) {
      //   setShowHelper(true);
      // }
    };

    // Delay check to avoid showing immediately on page load
    const timer = setTimeout(checkForCacheIssues, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAutoResolve = async () => {
    setIsResolving(true);
    setStep(2);
    
    try {
      // Clear all cached data
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear service worker cache
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      
      // Clear fetch cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }
      
      // Set new version
      localStorage.setItem('ttm-app-version', '2.0.3');
      localStorage.setItem('ttm-cache-bust', Date.now().toString());
      
      setStep(3);
      
      // Force page reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error resolving cache issues:', error);
      setStep(4);
    }
  };

  const handleManualResolve = () => {
    setStep(5);
  };

  const handleDismiss = () => {
    setShowHelper(false);
    if (onResolve) onResolve();
  };

  if (!showHelper) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Platform Update Gedetecteerd
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div>
            <p className="text-gray-600 mb-4">
              We hebben een belangrijke update gedaan aan het platform. 
              Om ervoor te zorgen dat alles soepel werkt, moeten we de cache opschonen.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleAutoResolve}
                className="w-full bg-[#8BAE5A] text-white py-2 px-4 rounded-lg hover:bg-[#7A9D4A] transition-colors flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Automatisch Oplossen
              </button>
              
              <button
                onClick={handleManualResolve}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Handmatige Instructies
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A]"></div>
            </div>
            <p className="text-gray-600 text-center">
              Cache wordt opgeschoond...
            </p>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">
                Cache succesvol opgeschoond! Pagina wordt vernieuwd...
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="text-red-600 mb-4">
              Er is een fout opgetreden bij het automatisch oplossen.
            </p>
            <button
              onClick={handleManualResolve}
              className="w-full bg-[#8BAE5A] text-white py-2 px-4 rounded-lg hover:bg-[#7A9D4A] transition-colors"
            >
              Handmatige Instructies
            </button>
          </div>
        )}

        {step === 5 && (
          <div>
            <p className="text-gray-600 mb-4">
              Volg deze stappen om het probleem handmatig op te lossen:
            </p>
            
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-semibold text-gray-800">Stap 1:</p>
                <p className="text-gray-600">Druk op <kbd className="bg-white px-1 rounded border">Ctrl+F5</kbd> (Windows) of <kbd className="bg-white px-1 rounded border">Cmd+Shift+R</kbd> (Mac)</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-semibold text-gray-800">Stap 2:</p>
                <p className="text-gray-600">Log opnieuw in op het platform</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-semibold text-gray-800">Als dat niet werkt:</p>
                <p className="text-gray-600">Open een incognito/privé venster en log daar in</p>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Begrepen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
