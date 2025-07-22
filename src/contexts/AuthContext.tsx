'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

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
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ success: true }),
  signUp: async () => ({ success: true }),
  signOut: async () => {},
  isAuthenticated: false,
  updateUser: async () => {},
  redirectAdminToDashboard: true,
  clearAllCache: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const mountedRef = useRef(true);

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('Fetching user profile for:', supabaseUser.email);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );
      
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (data) {
        const userProfile = {
          ...data,
          role: data.role || 'user',
        };
        console.log('User profile fetched successfully:', userProfile.email);
        return userProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []); // Empty dependency array - this function doesn't depend on any external values

  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 8000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted && mountedRef.current) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (session?.user && mounted && mountedRef.current) {
          console.log('Session found, fetching user profile...');
          const userProfile = await fetchUserProfile(session.user);
          if (userProfile && mounted && mountedRef.current) {
            setUser(userProfile);
          }
        } else {
          console.log('No session found');
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        if (mounted && mountedRef.current) {
          console.log('Initial session check completed');
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted || !mountedRef.current) return;

        console.log('Auth state change:', event, session?.user?.email);
        
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user);
          if (mounted && mountedRef.current) {
            setUser(userProfile);
          }
        } else {
          if (mounted && mountedRef.current) {
            setUser(null);
          }
        }
        
        if (mounted && mountedRef.current) {
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('Cleaning up auth effects...');
      mounted = false;
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    if (!initialized) {
      return { success: false, error: 'Authentication system is still initializing. Please try again.' };
    }

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
          return { success: true };
        } else {
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
      
      // Create user profile in database
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            rank: 'Beginner',
            points: 0,
            missions_completed: 0,
            role: 'user',
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return { success: false, error: 'Account created but failed to set up profile. Please contact support.' };
        }

        // Fetch the created profile
        const userProfile = await fetchUserProfile(data.user);
        if (userProfile && mountedRef.current) {
          setUser(userProfile);
        }
      }
      
      return { success: true };
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
      console.log('Starting sign out process...');
      
      // Clear local state first
      setUser(null);
      setLoading(true);
      
      // Sign out from Supabase with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign out timeout')), 5000)
      );
      
      const signOutPromise = supabase.auth.signOut();
      const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Supabase sign out error:', error);
        // Even if Supabase fails, we should still clear local state
        setUser(null);
        throw error;
      }
      
      console.log('Sign out successful');
      
      // Clear any local storage or session data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('welcomeVideoShown');
        localStorage.removeItem('onboardingCompleted');
        localStorage.removeItem('nutritionPlanCompleted');
        localStorage.removeItem('trainingSchemaCompleted');
        // Clear any other app-specific storage
        sessionStorage.clear();
      }
      
    } catch (error: any) {
      console.error('Error signing out:', error);
      // Ensure user is cleared even if there's an error
      setUser(null);
      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      if (mountedRef.current) {
        setUser(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const clearAllCache = () => {
    if (typeof window !== 'undefined') {
      console.log('🧹 Clearing all cache and localStorage...');
      
      // Clear all localStorage items
      localStorage.clear();
      
      // Clear all sessionStorage items
      sessionStorage.clear();
      
      // Clear any cached data in memory
      setUser(null);
      setLoading(false);
      
      // Force reload the page to clear any React state
      window.location.reload();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      isAuthenticated: !!user,
      updateUser,
      redirectAdminToDashboard: true,
      clearAllCache,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 