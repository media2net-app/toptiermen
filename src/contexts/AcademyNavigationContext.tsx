"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AcademyNavigationContextType {
  isNavigating: boolean;
  setNavigating: (loading: boolean) => void;
  currentPage: string | null;
  setCurrentPage: (page: string | null) => void;
  navigationError: string | null;
  setNavigationError: (error: string | null) => void;
}

const AcademyNavigationContext = createContext<AcademyNavigationContextType>({
  isNavigating: false,
  setNavigating: () => {},
  currentPage: null,
  setCurrentPage: () => {},
  navigationError: null,
  setNavigationError: () => {},
});

export const useAcademyNavigation = () => {
  const context = useContext(AcademyNavigationContext);
  if (!context) {
    throw new Error('useAcademyNavigation must be used within an AcademyNavigationProvider');
  }
  return context;
};

interface AcademyNavigationProviderProps {
  children: ReactNode;
}

export const AcademyNavigationProvider: React.FC<AcademyNavigationProviderProps> = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [navigationError, setNavigationError] = useState<string | null>(null);

  const setNavigating = (loading: boolean) => {
    setIsNavigating(loading);
    if (loading) {
      setNavigationError(null); // Clear errors when starting navigation
    }
  };

  const value: AcademyNavigationContextType = {
    isNavigating,
    setNavigating,
    currentPage,
    setCurrentPage,
    navigationError,
    setNavigationError,
  };

  return (
    <AcademyNavigationContext.Provider value={value}>
      {children}
      
      {/* Global Navigation Loading Indicator */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-gradient-to-r from-[#8BAE5A] via-[#B6C948] to-[#8BAE5A] animate-pulse"></div>
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-[#181F17]/90 backdrop-blur-sm px-3 py-1 rounded-full border border-[#3A4D23]">
            <div className="flex items-center gap-2 text-xs text-[#8BAE5A]">
              <div className="animate-spin rounded-full h-3 w-3 border border-[#8BAE5A] border-t-transparent"></div>
              <span>Navigeren...</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Error Toast */}
      {navigationError && (
        <div className="fixed top-4 right-4 z-50 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-red-400">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Navigatie fout:</span>
            <span className="text-sm">{navigationError}</span>
            <button
              onClick={() => setNavigationError(null)}
              className="ml-2 text-red-200 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </AcademyNavigationContext.Provider>
  );
};
