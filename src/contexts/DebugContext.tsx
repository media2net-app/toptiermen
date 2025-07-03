'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface DebugContextType {
  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
  toggleDebug: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
  const [showDebug, setShowDebug] = useState(false);

  const toggleDebug = () => {
    setShowDebug(prev => !prev);
  };

  return (
    <DebugContext.Provider value={{ showDebug, setShowDebug, toggleDebug }}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
} 