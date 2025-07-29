"use client";
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { trackAuthPerformance } from '@/lib/performance-monitor';

type User = Database['public']['Tables']['users']['Row'] & {
  role: 'user' | 'admin';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
  redirectAdminToDashboard?: boolean;
  clearAllCache: () => void;
  initialized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [redirectAdminToDashboard, setRedirectAdminToDashboard] = useState(false);
  const mountedRef = useRef(true);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('🔍 Fetching user profile for:', supabaseUser.email);
      
      // Add timeout to profile fetch
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );
      
      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching user profile:', error);
        // Return null if profile fetch fails - let the auth system handle it
        return null;
      }

      console.log('✅ User profile fetched successfully');
      return {
        ...profile,
        role: profile.role || 'user'
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Return null on error - let the auth system handle it
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let subscription: any;

    const initializeAuth = async () => {
      try {
        console.log('🔧 Initializing authentication...');
        
        // Set a timeout for initialization - optimized for performance
        initializationTimeoutRef.current = setTimeout(() => {
          if (mounted && mountedRef.current) {
            console.log('⚠️ Auth initialization timeout, proceeding anyway');
            setLoading(false);
            setInitialized(true);
          }
        }, 5000); // Reduced to 5 seconds for better UX

        // Get initial session with optimized timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 8000)
        );
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('Error getting session:', error);
        }

        if (session?.user) {
          console.log('✅ Session found, fetching user profile...');
          const userProfile = await fetchUserProfile(session.user);
          if (mounted && mountedRef.current) {
            setUser(userProfile);
            setLoading(false);
            setInitialized(true);
            
            // Verleng sessie automatisch bij elke auth state change
            try {
              await supabase.auth.refreshSession();
              console.log('✅ Session refreshed automatically');
            } catch (error) {
              console.log('⚠️ Session refresh failed:', error);
            }
          }
        } else {
          console.log('ℹ️ No session found, user not authenticated');
          if (mounted && mountedRef.current) {
            setUser(null);
            setLoading(false);
            setInitialized(true);
          }
        }

        // Clear timeout if successful
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current);
          initializationTimeoutRef.current = null;
        }

      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted && mountedRef.current) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user);
          if (mounted && mountedRef.current) {
            setUser(userProfile);
            setLoading(false);
            
            // Verleng sessie automatisch bij elke auth state change
            try {
              await supabase.auth.refreshSession();
              console.log('✅ Session refreshed automatically');
            } catch (error) {
              console.log('⚠️ Session refresh failed:', error);
            }
          }
        } else {
          if (mounted && mountedRef.current) {
            setUser(null);
            setLoading(false);
          }
        }
      }
    );
    
    subscription = authSubscription;

    // Initialize auth
    initializeAuth();

    // Cleanup function
    return () => {
      console.log('Cleaning up auth effects...');
      mounted = false;
      mountedRef.current = false;
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Global loading timeout to prevent infinite loading
  useEffect(() => {
    const globalTimeout = setTimeout(() => {
      if (loading && mountedRef.current) {
        console.warn('⚠️ Global auth loading timeout reached, forcing completion');
        setLoading(false);
        setInitialized(true);
      }
    }, 10000); // 10 second global timeout for better performance

    return () => clearTimeout(globalTimeout);
  }, [loading]);

  // Sessie verlenging elke 30 minuten
  useEffect(() => {
    if (!user) return;

    const sessionRefreshInterval = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          await supabase.auth.refreshSession();
          console.log('🔄 Session refreshed via interval');
        }
      } catch (error) {
        console.log('⚠️ Interval session refresh failed:', error);
      }
    }, 30 * 60 * 1000); // 30 minuten

    return () => clearInterval(sessionRefreshInterval);
  }, [user]);

  const signIn = async (email: string, password: string) => {
    // Don't block signIn if not initialized, just proceed
    if (!initialized) {
      console.log('⚠️ Auth not initialized, proceeding anyway...');
      // Force initialization if not already initialized
      setInitialized(true);
    }

    trackAuthPerformance.signIn();
    setLoading(true);
    try {
      console.log('Signing in:', email);
      
      // Add timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign in timeout')), 15000)
      );
      
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const { data, error } = await Promise.race([signInPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        const userProfile = await fetchUserProfile(data.user);
        if (userProfile) {
          setUser(userProfile);
          setLoading(false); // Explicitly reset loading state
          trackAuthPerformance.signInComplete();
          return { success: true };
        } else {
          trackAuthPerformance.signInComplete();
          return { success: false, error: 'Failed to load user profile' };
        }
      }
      
      return { success: false, error: 'No user data received' };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!initialized) {
      return { success: false, error: 'Authentication system is still initializing. Please try again.' };
    }

    setLoading(true);
    try {
      console.log('Signing up:', email);
      
      // Add timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign up timeout')), 15000)
      );
      
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      const { data, error } = await Promise.race([signUpPromise, timeoutPromise]) as any;
      
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
              email: data.user.email,
              full_name: fullName,
              role: 'user',
            },
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return { success: false, error: 'Failed to create user profile' };
        }

        const userProfile = await fetchUserProfile(data.user);
        if (userProfile) {
          setUser(userProfile);
          return { success: true };
        } else {
          return { success: false, error: 'Failed to load user profile' };
        }
      }
      
      return { success: false, error: 'No user data received' };
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await supabase.auth.signOut();
      setUser(null);
      setRedirectAdminToDashboard(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Update user error:', error);
        return;
      }

      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const clearAllCache = () => {
    // Clear any cached data
    setUser(null);
    setLoading(true);
    setInitialized(false);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    updateUser,
    redirectAdminToDashboard,
    clearAllCache,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 