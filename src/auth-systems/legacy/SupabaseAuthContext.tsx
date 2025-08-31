'use client';

import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { cachePrefetchManager } from '@/lib/cache-prefetch';
import { sessionPoolManager } from '@/lib/session-pool';
import { trackLoginPerformance, trackLogoutPerformance } from '@/components/PerformanceMonitor';

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
    loading: false, // START MET FALSE OM LOADING SCREEN TE VOORKOMEN
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
    const startTime = performance.now(); // PERFORMANCE: Track login start time
    
    try {
      console.log('🔐 Starting sign in process...', { email, rememberMe });
      console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('🔑 Supabase Key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
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
      console.log('🔄 Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📋 Supabase response:', { data: !!data, error: !!error });

      if (error) {
        console.error('❌ Sign in error:', error);
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
          
          // PERFORMANCE OPTIMIZATION: Start cache prefetching and session pooling
          console.log('🚀 Starting performance optimizations...');
          
          // Store in session pool for ultra-fast future access
          sessionPoolManager.preloadSessionData(data.user.id, profile).catch(error => {
            console.warn('Session pooling failed (non-blocking):', error);
          });
          
          // Start cache prefetching
          cachePrefetchManager.prefetchUserData(data.user.id).catch(error => {
            console.warn('Cache prefetching failed (non-blocking):', error);
          });
        } else {
          console.log('Using fallback user data');
          // Fallback to auth user if profile not readable
          const fallbackUser = {
            id: data.user.id,
            email: data.user.email!,
            full_name: (data.user.user_metadata as any)?.full_name,
            role: 'USER'
          };
          dispatch({ type: 'SET_USER', payload: fallbackUser });
          
          // PERFORMANCE OPTIMIZATION: Still prefetch and pool with fallback data
          sessionPoolManager.preloadSessionData(data.user.id, fallbackUser).catch(error => {
            console.warn('Session pooling failed (non-blocking):', error);
          });
          
          cachePrefetchManager.prefetchUserData(data.user.id).catch(error => {
            console.warn('Cache prefetching failed (non-blocking):', error);
          });
        }
        
        // PERFORMANCE: Track successful login time
        trackLoginPerformance(startTime);
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

  // OPTIMIZED: Fast selective auth storage clearing
  const clearAuthStorage = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    // Specific auth keys to remove (faster than iteration)
    const authKeys = [
      'toptiermen-v2-auth',
      'supabase.auth.token',
      'toptiermen-remember-me',
      'sb-auth-token',
      'sb-refresh-token'
    ];
    
    // Parallel storage clearing
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  };

  // OPTIMIZED: Selective cache clearing (only auth-related)
  const clearAuthCache = async (): Promise<void> => {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    
    try {
      const cacheNames = await caches.keys();
      const authCaches = cacheNames.filter(name => 
        name.includes('auth') || name.includes('session') || name.includes('toptiermen')
      );
      
      // Only clear auth-related caches (much faster)
      await Promise.all(authCaches.map(name => caches.delete(name)));
    } catch (error) {
      console.warn('Cache clearing failed:', error);
      // Don't throw - cache clearing is optional
    }
  };

  const signOut = async () => {
    try {
      console.log('🚀 Starting optimized sign out process...');
      const startTime = performance.now();
      
      // Get current user ID before clearing
      const userId = state.user?.id;
      
      // PARALLEL EXECUTION: All logout operations simultaneously
      const logoutTasks = [
        // Task 1: Clear auth storage
        clearAuthStorage(),
        // Task 2: Supabase auth logout
        supabase.auth.signOut(),
        // Task 3: Clear auth-specific cache
        clearAuthCache(),
        // Task 4: Clear session pool
        userId ? sessionPoolManager.removeSession(userId) : Promise.resolve()
      ];
      
      // Wait for all tasks to complete (or fail)
      const results = await Promise.allSettled(logoutTasks);
      
      // Log any failures but don't block logout
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Logout task ${index + 1} failed:`, result.reason);
        }
      });
      
      // Reset state regardless of failures
      dispatch({ type: 'RESET_STATE' });
      
      const endTime = performance.now();
      console.log(`✅ Optimized logout completed in ${Math.round(endTime - startTime)}ms`);
      
      // PERFORMANCE: Track logout time
      trackLogoutPerformance(startTime);
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if everything fails, clear local state
      dispatch({ type: 'RESET_STATE' });
      throw error;
    }
  };

  // OPTIMIZED: Enhanced logout and redirect with parallel processing
  const logoutAndRedirect = async (redirectUrl: string = '/login') => {
    console.log('🚀 Starting optimized logout and redirect...');
    const startTime = performance.now();
    
    try {
      // Use our optimized signOut function
      await signOut();
      
      const endTime = performance.now();
      console.log(`✅ Optimized logout completed in ${Math.round(endTime - startTime)}ms`);
      
      // Force redirect with cache busting
      if (typeof window !== 'undefined') {
        const timestamp = Date.now();
        const finalUrl = redirectUrl.includes('?') 
          ? `${redirectUrl}&t=${timestamp}` 
          : `${redirectUrl}?t=${timestamp}`;
        
        console.log(`Redirecting to: ${finalUrl}`);
        window.location.href = finalUrl;
      }
      
    } catch (error) {
      console.error('Logout and redirect error:', error);
      
      // Emergency fallback - always redirect to login
      if (typeof window !== 'undefined') {
        const timestamp = Date.now();
        const finalUrl = redirectUrl.includes('?') 
          ? `${redirectUrl}&t=${timestamp}` 
          : `${redirectUrl}?t=${timestamp}`;
        
        console.log(`Error occurred, but redirecting to: ${finalUrl}`);
        window.location.href = finalUrl;
      }
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