'use client';

import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// V2.0: Simplified Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ V2.0: Missing Supabase environment variables');
    throw new Error('Supabase configuration is missing');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'toptiermen-v2-auth'
    },
    global: {
      headers: {
        'X-Client-Info': 'toptiermen-v2'
      }
    }
  });
};

const supabase = getSupabaseClient();

// V2.0: Unified session management constants
const SESSION_CONFIG = {
  CHECK_INTERVAL: 5 * 60 * 1000,        // 5 minutes (was 60)
  WARNING_TIME: 2 * 60 * 1000,          // 2 minutes before expiry (was 30)
  AUTH_TIMEOUT: 2000,                   // 2 seconds (was 5)
  MAX_RETRIES: 2,                       // Reduced retries (was 3)
  RETRY_DELAY: 1000                     // 1 second base delay
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

// V2.0: Simplified reducer
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
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  logoutAndRedirect: (redirectUrl?: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// V2.0: Simplified retry mechanism
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
      console.log(`V2.0: Auth operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
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

  // V2.0: Simplified error clearing
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // V2.0: Simplified session refresh
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const result = await retryWithBackoff(async () => {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        return data;
      });

      if (result.session) {
        console.log('✅ V2.0: Session refreshed successfully');
        dispatch({ type: 'RESET_RETRY' });
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ V2.0: Session refresh failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Session refresh failed' });
      return false;
    }
  }, []);

  // V2.0: Simplified session health check
  const checkSessionHealth = useCallback(async () => {
    // V2.0: Completely disabled to prevent infinite loops
    return;
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('V2.0: Session check error:', error);
        return;
      }

      if (!session) {
        console.log('V2.0: No active session found');
        return;
      }

      // Check if session is about to expire
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        if (timeUntilExpiry < SESSION_CONFIG.WARNING_TIME && timeUntilExpiry > 0) {
          console.log('⚠️ V2.0: Session expiring soon, attempting refresh...');
          const refreshed = await refreshSession();
          if (!refreshed) {
            console.warn('V2.0: Failed to refresh session, user may need to re-authenticate');
          }
        }
      }
    } catch (error) {
      console.error('V2.0: Session health check failed:', error);
    }
  }, [refreshSession]);

  // V2.0: Simplified user profile fetching
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
      console.error('V2.0: Error fetching user profile:', error);
      return null;
    }
  }, []);

  // V2.0: Simplified initial session loading
  useEffect(() => {
    let isMounted = true;
    
    const getInitialSession = async () => {
      try {
        if (!isMounted) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // V2.0: Immediate timeout for development
        const timeoutId = setTimeout(() => {
          if (!isMounted) return;
          console.log('✅ V2.0: Auth timeout - allowing login form to show');
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_INITIALIZED', payload: true });
          dispatch({ type: 'SET_USER', payload: null });
        }, 1000); // 1 second timeout

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('V2.0: Error getting session:', error);
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
        console.error('V2.0: Error in getInitialSession:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    getInitialSession();

    // V2.0: Disabled session health check for now
    // const interval = setInterval(() => {
    //   if (isMounted) {
    //     checkSessionHealth();
    //   }
    // }, SESSION_CONFIG.CHECK_INTERVAL);

    // V2.0: Simplified auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        console.log('🔄 V2.0: Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          
          if (profile) {
            dispatch({ type: 'SET_USER', payload: profile });
          } else {
            // Fallback to auth user if profile cannot be fetched
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
          console.log('✅ V2.0: Token refreshed successfully');
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      // clearInterval(interval); // Disabled for now
    };
  }, [fetchUserProfile, checkSessionHealth]);

  // V2.0: Simplified sign in
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
      console.error('V2.0: Sign in error:', error);
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
        console.error('V2.0: Sign up error:', error);
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
          console.error('V2.0: Error creating profile:', profileError);
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
      console.error('V2.0: Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('V2.0: Sign out error:', error);
        throw error;
      } else {
        dispatch({ type: 'RESET_STATE' });
        console.log('V2.0: User signed out successfully');
      }
    } catch (error) {
      console.error('V2.0: Sign out error:', error);
      throw error;
    }
  };

  // V2.0: Simplified logout and redirect
  const logoutAndRedirect = async (redirectUrl: string = '/login') => {
    try {
      console.log('V2.0: Logout and redirect initiated...');
      await signOut();
      
      console.log(`V2.0: Redirecting to: ${redirectUrl}`);
      window.location.href = redirectUrl;
      
    } catch (error) {
      console.error('V2.0: Error during logout and redirect:', error);
      
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
        console.error('V2.0: Update user error:', error);
      } else {
        dispatch({ type: 'SET_USER', payload: { ...state.user, ...updates } });
      }
    } catch (error) {
      console.error('V2.0: Update user error:', error);
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