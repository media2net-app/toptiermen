// 🔄 AUTH SYSTEM SWITCH - Toggle tussen Legacy en Optimal
// Veilig switchen tussen auth systems voor testing en migratie

'use client';

import { useEffect, useState } from 'react';

// Auth system configuratie
type AuthSystem = 'legacy' | 'optimal';

interface AuthSwitchConfig {
  current: AuthSystem;
  available: AuthSystem[];
  canSwitch: boolean;
}

// Check welk auth systeem actief is
function getAuthSystem(): AuthSystem {
  // Check environment variable eerst
  if (typeof window !== 'undefined') {
    const envSystem = process.env.NEXT_PUBLIC_AUTH_SYSTEM as AuthSystem;
    if (envSystem && ['legacy', 'optimal'].includes(envSystem)) {
      return envSystem;
    }
    
    // Check localStorage override voor development
    const localOverride = localStorage.getItem('auth-system-override') as AuthSystem;
    if (localOverride && ['legacy', 'optimal'].includes(localOverride)) {
      return localOverride;
    }
  }
  
  // Default naar legacy voor veiligheid
  return 'legacy';
}

// Set auth system
function setAuthSystem(system: AuthSystem): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-system-override', system);
    
    // Reload om nieuwe auth systeem te laden
    window.location.reload();
  }
}

export function AuthSwitch() {
  const [config, setConfig] = useState<AuthSwitchConfig>({
    current: 'legacy',
    available: ['legacy', 'optimal'],
    canSwitch: true
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const current = getAuthSystem();
    setConfig(prev => ({ ...prev, current }));
    
    // Show switch in development
    const isDev = process.env.NODE_ENV === 'development';
    setIsVisible(isDev);
  }, []);

  if (!isVisible) {
    return null;
  }

  const handleSwitch = (system: AuthSystem) => {
    if (system === config.current) return;
    
    const confirm = window.confirm(
      `Wil je switchen naar ${system === 'optimal' ? 'Optimal' : 'Legacy'} auth systeem?\n\n` +
      `Dit zal de pagina herladen en je huidige sessie kan verloren gaan.`
    );
    
    if (confirm) {
      console.log(`🔄 Switching auth system: ${config.current} → ${system}`);
      setAuthSystem(system);
    }
  };

  return (
    <div className="fixed top-4 left-4 bg-gray-900 text-white p-3 rounded-lg shadow-xl z-50 max-w-xs">
      <div className="text-sm font-semibold mb-2 text-center">
        🔄 Auth System Switch
      </div>
      
      <div className="text-xs text-gray-300 mb-3 text-center">
        Current: <span className="font-mono text-blue-400">{config.current}</span>
      </div>
      
      <div className="space-y-2">
        {config.available.map(system => (
          <button
            key={system}
            onClick={() => handleSwitch(system)}
            disabled={system === config.current}
            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
              system === config.current
                ? 'bg-blue-600 text-white cursor-default'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            {system === 'legacy' ? '🏗️ Legacy' : '🎯 Optimal'} System
            {system === config.current && ' (Active)'}
          </button>
        ))}
      </div>
      
      <div className="text-xs text-gray-400 mt-3 text-center">
        Development Only
      </div>
    </div>
  );
}

// Hook om huidige auth systeem te detecteren
export function useAuthSystem(): AuthSystem {
  const [system, setSystem] = useState<AuthSystem>('legacy');
  
  useEffect(() => {
    setSystem(getAuthSystem());
  }, []);
  
  return system;
}

// Dynamic auth hook selector
export function useAuthDynamic() {
  const system = useAuthSystem();
  
  if (system === 'optimal') {
    // Dynamic import zou hier kunnen, maar voor nu return we een placeholder
    console.log('🎯 Using optimal auth system');
    // const { useAuth } = await import('@/auth-systems/optimal/useAuth');
    // return useAuth();
  }
  
  console.log('🏗️ Using legacy auth system');
  // const { useSupabaseAuth } = await import('@/contexts/SupabaseAuthContext');
  // return useSupabaseAuth();
  
  return {
    user: null,
    loading: false,
    error: null,
    signIn: async () => ({ success: false, error: 'Not implemented' }),
    signOut: async () => ({ success: false, error: 'Not implemented' }),
  };
}
