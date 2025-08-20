'use client';

import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Create Supabase client with better error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Check if environment variables are properly configured
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not configured properly');
    console.error('Please create a .env.local file with your Supabase credentials');
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'placeholder-key') {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured properly');
    console.error('Please create a .env.local file with your Supabase credentials');
  }

  // Use fallback values for development, but warn the user
  const finalSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
  const finalSupabaseAnonKey = supabaseAnonKey || 'placeholder-key';
  
  return createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'toptiermen-auth',
      storage: {
        getItem: (key: string) => {
          if (typeof window !== 'undefined') {
            try {
              return localStorage.getItem(key);
            } catch (error) {
              console.error('Error reading from localStorage:', error);
              return null;
            }
          }
          return null;
        },
        setItem: (key: string, value: string) => {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(key, value);
            } catch (error) {
              console.error('Error writing to localStorage:', error);
            }
          }
        },
        removeItem: (key: string) => {
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem(key);
            } catch (error) {
              console.error('Error removing from localStorage:', error);
            }
          }
        }
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'toptiermen-admin'
      }
    }
  });
};

const supabase = getSupabaseClient();

// Helper function to normalize role
const normalizeRole = (role?: string) => {
  if (!role) return 'USER';
  return role.toUpperCase();
};

// V1.1 OPTIMIZATIONS: Reduced timeouts and intervals
const SESSION_CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes (was 5 minutes)
const SESSION_WARNING_TIME = 10 * 60 * 1000; // 10 minutes before expiry
const AUTH_TIMEOUT = 5000; // 5 seconds (was 15 seconds)
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second base delay

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

// V1.1: useReducer for better state management
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, error: null };
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
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  logoutAndRedirect: (redirectUrl?: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// V1.1: Retry mechanism with exponential backoff
const retryWithBackoff = async <T,>(
  operation: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS
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
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`Auth operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
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

  // V1.1: Memoized functions to prevent unnecessary re-renders
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // V1.1: Optimized session refresh with retry mechanism
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const result = await retryWithBackoff(async () => {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        return data;
      });

      if (result.session) {
        console.log('✅ Session refreshed successfully');
        dispatch({ type: 'RESET_RETRY' });
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Session refresh failed after retries:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Session refresh failed' });
      return false;
    }
  }, []);

  // V1.1: Optimized session health check
  const checkSessionHealth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        return;
      }

      if (!session) {
        console.log('No active session found');
        return;
      }

      // Check if session is about to expire
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        if (timeUntilExpiry < SESSION_WARNING_TIME && timeUntilExpiry > 0) {
          console.log('⚠️ Session expiring soon, attempting refresh...');
          const refreshed = await refreshSession();
          if (!refreshed) {
            console.warn('Failed to refresh session, user may need to re-authenticate');
          }
        }
      }
    } catch (error) {
      console.error('Session health check failed:', error);
    }
  }, [refreshSession]);

  // V1.1: Optimized user profile fetching with retry
  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      const result = await retryWithBackoff(async () => {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        return profile;
      });

      if (result) {
        return {
          id: result.id,
          email: result.email,
          full_name: result.full_name,
          role: normalizeRole(result.role)
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    // V1.1: Optimized initial session loading with reduced timeout
    const getInitialSession = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // V1.1: Reduced timeout from 15s to 5s
        const timeoutId = setTimeout(() => {
          console.warn('⚠️ Auth initialization timeout (5s), forcing loading to false');
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_INITIALIZED', payload: true });
        }, AUTH_TIMEOUT);

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to get session' });
        } else if (session?.user) {
          // V1.1: Use optimized profile fetching
          const profile = await fetchUserProfile(session.user.id);
          
          if (profile) {
            dispatch({ type: 'SET_USER', payload: profile });
          } else {
            // Fallback: set minimal user info from auth session
            dispatch({ type: 'SET_USER', payload: {
              id: session.user.id,
              email: session.user.email || '',
              full_name: (session.user.user_metadata as any)?.full_name,
              role: 'USER'
            }});
          }
        }
        
        clearTimeout(timeoutId);
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    getInitialSession();

    // V1.1: Increased session check interval from 5min to 15min
    const interval = setInterval(checkSessionHealth, SESSION_CHECK_INTERVAL);
    console.log(`🔄 Session health check interval set to ${SESSION_CHECK_INTERVAL / 60000} minutes`);

    // V1.1: Optimized auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // V1.1: Use optimized profile fetching
          const profile = await fetchUserProfile(session.user.id);
          
          if (profile) {
            dispatch({ type: 'SET_USER', payload: profile });
          } else {
            // Fallback to auth session user if profile cannot be fetched
            dispatch({ type: 'SET_USER', payload: {
              id: session.user.id,
              email: session.user.email || '',
              full_name: (session.user.user_metadata as any)?.full_name,
              role: 'USER'
            }});
          }
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'RESET_STATE' });
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('✅ Token refreshed successfully');
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    );

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [fetchUserProfile, checkSessionHealth]);

  // V1.1: Optimized sign in with retry mechanism
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const result = await retryWithBackoff(async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return data;
      });

      if (result.user) {
        // V1.1: Use optimized profile fetching
        const profile = await fetchUserProfile(result.user.id);
        
        if (profile) {
          dispatch({ type: 'SET_USER', payload: profile });
        } else {
          // Fallback to auth user if profile not readable
          dispatch({ type: 'SET_USER', payload: {
            id: result.user.id,
            email: result.user.email!,
            full_name: (result.user.user_metadata as any)?.full_name,
            role: 'USER'
          }});
        }
        
        dispatch({ type: 'RESET_RETRY' });
        return { success: true };
      }
      
      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      console.error('Sign in error:', error);
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
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
              role: 'USER'
            }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
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
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      } else {
        dispatch({ type: 'RESET_STATE' });
        // Don't automatically redirect - let components handle their own redirect logic
        console.log('User signed out successfully');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Utility function for consistent logout handling across the app
  const logoutAndRedirect = async (redirectUrl: string = '/login') => {
    try {
      console.log('Logout and redirect initiated...');
      await signOut();
      
      // Use window.location.href for consistent redirect behavior
      console.log(`Redirecting to: ${redirectUrl}`);
      window.location.href = redirectUrl;
      
    } catch (error) {
      console.error('Error during logout and redirect:', error);
      
      // Show user feedback
      alert('Er is een fout opgetreden bij het uitloggen. Probeer het opnieuw.');
      
      // Fallback: force redirect even if signOut fails
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!state.user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', state.user.id);

      if (error) {
        console.error('Update user error:', error);
      } else {
        dispatch({ type: 'SET_USER', payload: { ...state.user, ...updates } });
      }
    } catch (error) {
      console.error('Update user error:', error);
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