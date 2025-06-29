'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface DebugContextType {
  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({ children }: { children: ReactNode }) {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <DebugContext.Provider value={{ showDebug, setShowDebug }}>
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