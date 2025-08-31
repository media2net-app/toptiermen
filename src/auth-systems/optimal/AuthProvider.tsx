// 🎯 OPTIMAL AUTH PROVIDER - Optional Context Wrapper
// Only use if you need to share auth state across many components
// For most cases, direct useAuth() hook is sufficient

'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from './useAuth';

// Re-export types from useAuth
type AuthContextType = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Note: This provider is OPTIONAL
// You can use useAuth() directly in most cases
// Only use this provider if you need to share auth state across many components
