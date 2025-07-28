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
  initialized: boolean;
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
  initialized: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const mountedRef = useRef(true);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
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
  };

  // Initialize authentication state
  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        setIsInitializing(true);
        
        // Set a timeout for the entire initialization process
        initializationTimeoutRef.current = setTimeout(() => {
          if (mounted && mountedRef.current) {
            console.log('Auth initialization timeout, setting loading to false');
            setLoading(false);
            setInitialized(true);
            setIsInitializing(false);
          }
        }, 15000); // 15 second timeout

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted && mountedRef.current) {
            setLoading(false);
            setInitialized(true);
            setIsInitializing(false);
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

        // Clear timeout and set initialized
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current);
          initializationTimeoutRef.current = null;
        }

        if (mounted && mountedRef.current) {
          console.log('Authentication initialized successfully');
          setLoading(false);
          setInitialized(true);
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        if (mounted && mountedRef.current) {
          setLoading(false);
          setInitialized(true);
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted || !mountedRef.current) return;

        console.log('Auth state change:', event, session?.user?.email);
        
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user);
          if (mounted && mountedRef.current) {
            setUser(userProfile);
            setLoading(false);
          }
        } else {
          if (mounted && mountedRef.current) {
            setUser(null);
            setLoading(false);
          }
        }
      }
    );

    return () => {
      console.log('Cleaning up auth effects...');
      mounted = false;
      mountedRef.current = false;
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, []);

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
        // Create user profile in database
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
              role: 'user',
              points: 0,
              missions_completed: 0,
            },
          ]);
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
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
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      setUser(null);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
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
        console.error('Error updating user:', error);
        throw error;
      }
      
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const clearAllCache = () => {
    // Clear any cached data if needed
    console.log('Clearing all cache...');
  };

  const isAuthenticated = !!user && initialized;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || isInitializing,
        signIn,
        signUp,
        signOut,
        isAuthenticated,
        updateUser,
        redirectAdminToDashboard: true,
        clearAllCache,
        initialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 