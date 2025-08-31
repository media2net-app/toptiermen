// 🧠 SMART AUTH HOOK - Automatisch het juiste system kiezen
// Gebruikt environment variable om tussen legacy en optimal te switchen

'use client';

import { useEffect, useState } from 'react';

// Type definitie voor beide auth systems
type AuthSystem = 'legacy' | 'optimal';

interface AuthHookReturn {
  user: any;
  profile?: any;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  signUp?: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  isLid?: boolean;
}

// Detecteer welk auth system te gebruiken
function getAuthSystem(): AuthSystem {
  // Check environment variable
  const envSystem = process.env.NEXT_PUBLIC_AUTH_SYSTEM as AuthSystem;
  if (envSystem && ['legacy', 'optimal'].includes(envSystem)) {
    console.log(`🎯 Using auth system from env: ${envSystem}`);
    return envSystem;
  }
  
  // Check localStorage override (voor development)
  if (typeof window !== 'undefined') {
    const localOverride = localStorage.getItem('auth-system-override') as AuthSystem;
    if (localOverride && ['legacy', 'optimal'].includes(localOverride)) {
      console.log(`🔄 Using auth system from localStorage: ${localOverride}`);
      return localOverride;
    }
  }
  
  // Default naar legacy voor veiligheid
  console.log('🏗️ Using default auth system: legacy');
  return 'legacy';
}

export function useAuthSmart(): AuthHookReturn {
  const [authSystem] = useState<AuthSystem>(getAuthSystem());
  const [authHook, setAuthHook] = useState<AuthHookReturn | null>(null);

  useEffect(() => {
    async function loadAuthHook() {
      try {
        if (authSystem === 'optimal') {
          console.log('🎯 Loading optimal auth system...');
          const { useAuth } = await import('@/auth-systems/optimal/useAuth');
          const hook = useAuth();
          setAuthHook(hook);
        } else {
          console.log('🏗️ Loading legacy auth system...');
          const { useSupabaseAuth } = await import('@/contexts/SupabaseAuthContext');
          const hook = useSupabaseAuth();
          setAuthHook(hook);
        }
      } catch (error) {
        console.error(`❌ Failed to load ${authSystem} auth system:`, error);
        // Fallback naar legacy als optimal faalt
        if (authSystem === 'optimal') {
          console.log('🔄 Falling back to legacy auth system...');
          const { useSupabaseAuth } = await import('@/contexts/SupabaseAuthContext');
          const hook = useSupabaseAuth();
          setAuthHook(hook);
        }
      }
    }

    loadAuthHook();
  }, [authSystem]);

  // Return loading state terwijl auth hook laadt
  if (!authHook) {
    return {
      user: null,
      loading: true,
      error: null,
      signIn: async () => ({ success: false, error: 'Auth system loading...' }),
      signOut: async () => ({ success: false, error: 'Auth system loading...' }),
    };
  }

  return authHook;
}

// Export voor debugging
export function logCurrentAuthSystem() {
  const system = getAuthSystem();
  console.log('📊 Current Auth System:', {
    system,
    environment: process.env.NEXT_PUBLIC_AUTH_SYSTEM,
    localStorage: typeof window !== 'undefined' ? localStorage.getItem('auth-system-override') : null,
  });
  return system;
}
