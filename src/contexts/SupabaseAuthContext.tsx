'use client';

import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Simplified Supabase client
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    throw new Error('Supabase configuration is missing');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'toptiermen-v2-auth'
    }
  });
};

const supabase = getSupabaseClient();

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
}

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'RESET_STATE' };

// Simplified reducer
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
    case 'RESET_STATE':
      return {
        user: null,
        loading: false,
        error: null,
        isInitialized: false
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

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null,
    isInitialized: false
  });
  
  const router = useRouter();

  // Simplified error clearing
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Simplified session refresh
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return !!data.session;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  }, []);

  // Simplified user profile fetching
  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      
      if (profile) {
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role?.toUpperCase() || 'USER'
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Simplified initial session loading
  useEffect(() => {
    let isMounted = true;
    
    const getInitialSession = async () => {
      try {
        if (!isMounted) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
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
        
        if (isMounted) {
          dispatch({ type: 'SET_INITIALIZED', payload: true });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error in getInitialSession:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    getInitialSession();

    // CRITICAL FIX: Reset loading state more quickly - DISABLED TO FIX FLICKERING
    // const timeoutId = setTimeout(() => {
    //   if (isMounted && state.loading) {
    //     console.log('Auth loading timeout - resetting loading state');
    //     dispatch({ type: 'SET_LOADING', payload: false });
    //   }
    // }, 3000); // 3 second timeout

    // Simplified auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          
          if (profile) {
            dispatch({ type: 'SET_USER', payload: profile });
          } else {
            dispatch({ type: 'SET_USER', payload: {
              id: session.user.id,
              email: session.user.email || '',
              full_name: (session.user.user_metadata as any)?.full_name,
              role: 'USER'
            }});
          }
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'RESET_STATE' });
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    );

    return () => {
      isMounted = false;
      // clearTimeout(timeoutId); // Disabled timeout
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, state.loading]);

  // Enhanced sign in with remember me functionality
  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      console.log('Starting sign in process...', { rememberMe });
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

      // Direct sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('User signed in successfully, fetching profile...');
        
        // Fetch profile
        const profile = await fetchUserProfile(data.user.id);
        
        if (profile) {
          console.log('Profile fetched successfully');
          dispatch({ type: 'SET_USER', payload: profile });
        } else {
          console.log('Using fallback user data');
          // Fallback to auth user if profile not readable
          dispatch({ type: 'SET_USER', payload: {
            id: data.user.id,
            email: data.user.email!,
            full_name: (data.user.user_metadata as any)?.full_name,
            role: 'USER'
          }});
        }
        
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
      console.log('Starting sign out process...');
      
      // Clear all local storage and session storage
      if (typeof window !== 'undefined') {
        console.log('Clearing browser storage...');
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
        console.error('Supabase sign out error:', error);
        throw error;
      }
      
      // Reset state
      dispatch({ type: 'RESET_STATE' });
      console.log('User signed out successfully');
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if Supabase fails, clear local state
      dispatch({ type: 'RESET_STATE' });
      throw error;
    }
  };

  // Enhanced logout and redirect with better error handling
  const logoutAndRedirect = async (redirectUrl: string = '/login') => {
    try {
      console.log('Logout and redirect initiated...');
      
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
        console.log('Logout API call failed (non-critical):', apiError);
      }
      
      console.log(`Redirecting to: ${redirectUrl}`);
      
      // Force a hard redirect to clear any cached state
      if (typeof window !== 'undefined') {
        // Clear any remaining cached data
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          } catch (cacheError) {
            console.log('Cache clearing failed:', cacheError);
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
      console.error('Error during logout and redirect:', error);
      
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