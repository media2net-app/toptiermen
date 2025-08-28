'use client';

import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// 2.0.1: Enhanced Supabase client with extended session support
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 2.0.1: Missing Supabase environment variables');
    throw new Error('Supabase configuration is missing');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'toptiermen-v2-auth',
      // Extended session configuration
      flowType: 'pkce',
      debug: false
    },
    global: {
      headers: {
        'X-Client-Info': 'toptiermen-v2'
      }
    }
  });
};

const supabase = getSupabaseClient();

// 2.0.1: Extended session management constants for better UX
const SESSION_CONFIG = {
  CHECK_INTERVAL: 2 * 60 * 1000,        // 2 minutes (veel frequenter)
  WARNING_TIME: 10 * 60 * 1000,         // 10 minutes before expiry (meer tijd)
  AUTH_TIMEOUT: 8000,                   // 8 seconds (meer tijd voor auth)
  MAX_RETRIES: 3,                       // Meer retries voor stabiliteit
  RETRY_DELAY: 1500,                    // Langere delay tussen retries
  REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days for remember me
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000       // 7 days for normal sessions
};

// Helper function to normalize role
const normalizeRole = (role?: string) => {
  if (!role) return 'USER';
  return role.toUpperCase();
};

// Types
interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  retryCount: number;
}

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'INCREMENT_RETRY' }
  | { type: 'RESET_RETRY' }
  | { type: 'RESET_STATE' };

// 2.0.1: Simplified reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, error: null, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    case 'INCREMENT_RETRY':
      return { ...state, retryCount: state.retryCount + 1 };
    case 'RESET_RETRY':
      return { ...state, retryCount: 0 };
    case 'RESET_STATE':
      return {
        user: null,
        loading: false,
        error: null,
        isInitialized: false,
        retryCount: 0
      };
    default:
      return state;
  }
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  logoutAndRedirect: (redirectUrl?: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2.0.1: Simplified retry mechanism
const retryWithBackoff = async <T,>(
  operation: () => Promise<T>,
  maxAttempts: number = SESSION_CONFIG.MAX_RETRIES
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = SESSION_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`2.0.1: Auth operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null,
    isInitialized: false,
    retryCount: 0
  });
  
  const router = useRouter();

  // 2.0.1: Simplified error clearing
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // 2.0.1: Enhanced session refresh with remember me support
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const result = await retryWithBackoff(async () => {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        return data;
      });

      if (result.session) {
        console.log('✅ 2.0.1: Session refreshed successfully');
        dispatch({ type: 'RESET_RETRY' });
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ 2.0.1: Session refresh failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Session refresh failed' });
      return false;
    }
  }, []);

  // 2.0.1: Check if remember me is enabled
  const isRememberMeEnabled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('toptiermen-remember-me') === 'true' || 
           sessionStorage.getItem('toptiermen-remember-me') === 'true';
  }, []);

  // 2.0.1: Extended session management for remember me
  const extendSession = useCallback(async () => {
    try {
      if (!isRememberMeEnabled()) {
        console.log('2.0.1: Remember me not enabled, skipping session extension');
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.log('2.0.1: No active session to extend');
        return;
      }

      // Check if session needs extension
      const expiresAt = session.expires_at;
      if (expiresAt && typeof expiresAt === 'number') {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        // Extend session if it expires within 24 hours
        if (timeUntilExpiry < 24 * 60 * 60) {
          console.log('🔄 2.0.1: Extending session for remember me user');
          await refreshSession();
        }
      }
    } catch (error) {
      console.error('2.0.1: Error extending session:', error);
    }
  }, [isRememberMeEnabled, refreshSession]);

  // 2.0.1: Enhanced session health check with remember me support
  const checkSessionHealth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('2.0.1: Session check error:', error);
        return;
      }

      if (!session) {
        console.log('2.0.1: No active session found');
        return;
      }

      // Check if session is about to expire
      const expiresAt = session?.expires_at;
      if (expiresAt && typeof expiresAt === 'number') {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        // For remember me users, extend session earlier
        if (isRememberMeEnabled()) {
          if (timeUntilExpiry < 24 * 60 * 60) { // 24 hours
            console.log('🔄 2.0.1: Remember me user - extending session');
            await extendSession();
          }
        } else {
          // For regular users, refresh when close to expiry
          if (timeUntilExpiry < SESSION_CONFIG.WARNING_TIME && timeUntilExpiry > 0) {
            console.log('⚠️ 2.0.1: Session expiring soon, attempting refresh...');
            const refreshed = await refreshSession();
            if (!refreshed) {
              console.warn('2.0.1: Failed to refresh session, user may need to re-authenticate');
            }
          }
        }
      }
    } catch (error) {
      console.error('2.0.1: Session health check failed:', error);
    }
  }, [refreshSession, isRememberMeEnabled, extendSession]);

  // 2.0.1: Simplified user profile fetching without retry
  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      console.log('2.0.1: Fetching user profile for:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('2.0.1: Profile fetch error:', error);
        throw error;
      }
      
      if (profile) {
        console.log('2.0.1: Profile fetched successfully');
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: normalizeRole(profile.role)
        };
      }
      return null;
    } catch (error) {
      console.error('2.0.1: Error fetching user profile:', error);
      return null;
    }
  }, []);

  // 2.0.1: Simplified initial session loading
  useEffect(() => {
    let isMounted = true;
    
    const getInitialSession = async () => {
      try {
        if (!isMounted) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // 2.0.1: Longer timeout to prevent premature logout
        const timeoutId = setTimeout(() => {
          if (!isMounted) return;
          console.log('⚠️ 2.0.1: Auth timeout - checking for existing session before logout');
          // Alleen uitloggen als er echt geen sessie is
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
              dispatch({ type: 'SET_LOADING', payload: false });
              dispatch({ type: 'SET_INITIALIZED', payload: true });
              dispatch({ type: 'SET_USER', payload: null });
            }
          });
        }, 3000); // 3 seconden timeout - meer tijd voor auth

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('2.0.1: Error getting session:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to get session' });
        } else if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          
          if (!isMounted) return;
          
          if (profile) {
            dispatch({ type: 'SET_USER', payload: profile });
          } else {
            // Fallback to auth user if profile not readable
            dispatch({ type: 'SET_USER', payload: {
              id: session.user.id,
              email: session.user.email || '',
              full_name: (session.user.user_metadata as any)?.full_name,
              role: 'USER'
            }});
          }
        }
        
        clearTimeout(timeoutId);
        if (isMounted) {
          dispatch({ type: 'SET_INITIALIZED', payload: true });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('2.0.1: Error in getInitialSession:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    getInitialSession();

    // 2.0.1: Re-enabled session health check with remember me support
    const interval = setInterval(() => {
      if (isMounted) {
        checkSessionHealth();
      }
    }, SESSION_CONFIG.CHECK_INTERVAL);

    // 2.0.1: Simplified auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        console.log('🔄 2.0.1: Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('2.0.1: User signed in, fetching profile...');
          const profile = await fetchUserProfile(session.user.id);
          
          if (profile) {
            console.log('2.0.1: Profile fetched in auth state change');
            dispatch({ type: 'SET_USER', payload: profile });
          } else {
            console.log('2.0.1: Using fallback user data in auth state change');
            // Fallback to auth user if profile cannot be fetched
            dispatch({ type: 'SET_USER', payload: {
              id: session.user.id,
              email: session.user.email || '',
              full_name: (session.user.user_metadata as any)?.full_name,
              role: 'USER'
            }});
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('2.0.1: User signed out');
          dispatch({ type: 'RESET_STATE' });
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('✅ 2.0.1: Token refreshed successfully');
        } else if (event === 'INITIAL_SESSION') {
          console.log('2.0.1: Initial session loaded');
          // Don't set loading to false here, let the main flow handle it
        }
        
        // Only set loading to false for actual auth changes, not initial session
        if (event !== 'INITIAL_SESSION') {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [fetchUserProfile, checkSessionHealth]);

  // 2.0.1: Enhanced sign in with remember me functionality
  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      console.log('2.0.1: Starting sign in process...', { rememberMe });
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('toptiermen-remember-me', 'true');
        sessionStorage.setItem('toptiermen-remember-me', 'true');
      } else {
        localStorage.removeItem('toptiermen-remember-me');
        sessionStorage.removeItem('toptiermen-remember-me');
      }

      // Direct sign in without retry
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('2.0.1: Sign in error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('2.0.1: User signed in successfully, fetching profile...');
        
        // Fetch profile with timeout
        const profilePromise = fetchUserProfile(data.user.id);
        const timeoutPromise = new Promise<User | null>((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        );
        
        try {
          const profile = await Promise.race([profilePromise, timeoutPromise]);
          
          if (profile) {
            console.log('2.0.1: Profile fetched successfully');
            dispatch({ type: 'SET_USER', payload: profile });
          } else {
            console.log('2.0.1: Using fallback user data');
            // Fallback to auth user if profile not readable
            dispatch({ type: 'SET_USER', payload: {
              id: data.user.id,
              email: data.user.email!,
              full_name: (data.user.user_metadata as any)?.full_name,
              role: 'USER'
            }});
          }
        } catch (profileError) {
          console.error('2.0.1: Profile fetch failed, using fallback:', profileError);
          // Fallback to auth user if profile fetch fails
          dispatch({ type: 'SET_USER', payload: {
            id: data.user.id,
            email: data.user.email!,
            full_name: (data.user.user_metadata as any)?.full_name,
            role: 'USER'
          }});
        }
        
        dispatch({ type: 'RESET_RETRY' });
        return { success: true };
      }
      
      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      console.error('2.0.1: Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [fetchUserProfile]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('2.0.1: Sign up error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
              role: 'USER'
            }
          ]);

        if (profileError) {
          console.error('2.0.1: Error creating profile:', profileError);
          // Fallback: still consider sign-up successful with auth user only
          dispatch({ type: 'SET_USER', payload: {
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            role: 'USER'
          }});
          return { success: true };
        }

        dispatch({ type: 'SET_USER', payload: {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: 'USER'
        }});
      }

      return { success: true };
    } catch (error) {
      console.error('2.0.1: Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      console.log('2.0.1: Starting sign out process...');
      
      // Clear all local storage and session storage
      if (typeof window !== 'undefined') {
        console.log('2.0.1: Clearing browser storage...');
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear specific auth storage
        localStorage.removeItem('toptiermen-v2-auth');
        localStorage.removeItem('supabase.auth.token');
        
        // Clear any other auth-related items
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('auth') || key.includes('supabase') || key.includes('session'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('2.0.1: Supabase sign out error:', error);
        throw error;
      }
      
      // Reset state
      dispatch({ type: 'RESET_STATE' });
      console.log('2.0.1: User signed out successfully');
      
    } catch (error) {
      console.error('2.0.1: Sign out error:', error);
      // Even if Supabase fails, clear local state
      dispatch({ type: 'RESET_STATE' });
      throw error;
    }
  };

  // 2.0.1: Enhanced logout and redirect with better error handling
  const logoutAndRedirect = async (redirectUrl: string = '/login') => {
    try {
      console.log('2.0.1: Logout and redirect initiated...');
      
      // First, try to sign out via Supabase
      await signOut();
      
      // Also call our logout API for additional cleanup
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (apiError) {
        console.log('2.0.1: Logout API call failed (non-critical):', apiError);
      }
      
      console.log(`2.0.1: Redirecting to: ${redirectUrl}`);
      
      // Force a hard redirect to clear any cached state
      if (typeof window !== 'undefined') {
        // Clear any remaining cached data
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          } catch (cacheError) {
            console.log('2.0.1: Cache clearing failed:', cacheError);
          }
        }
        
        // Force redirect with cache busting
        const timestamp = Date.now();
        const finalUrl = redirectUrl.includes('?') 
          ? `${redirectUrl}&t=${timestamp}` 
          : `${redirectUrl}?t=${timestamp}`;
        
        window.location.href = finalUrl;
      }
      
    } catch (error) {
      console.error('2.0.1: Error during logout and redirect:', error);
      
      // Show user feedback
      if (typeof window !== 'undefined') {
        alert('Er is een fout opgetreden bij het uitloggen. Je wordt doorgestuurd naar de login pagina.');
      }
      
      // Fallback: force redirect even if signOut fails
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          const timestamp = Date.now();
          const finalUrl = redirectUrl.includes('?') 
            ? `${redirectUrl}&t=${timestamp}` 
            : `${redirectUrl}?t=${timestamp}`;
          
          window.location.href = finalUrl;
        }
      }, 1000);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!state.user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) {
        console.error('2.0.1: Update user error:', error);
      } else {
        dispatch({ type: 'SET_USER', payload: { ...state.user, ...updates } });
      }
    } catch (error) {
      console.error('2.0.1: Update user error:', error);
    }
  };
  
  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    logoutAndRedirect,
    updateUser,
    refreshSession,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use Supabase auth context
export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
} 