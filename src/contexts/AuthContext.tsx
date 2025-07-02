'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (data) {
        return {
          ...data,
          role: data.role || 'user',
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (session?.user && mounted) {
          const userProfile = await fetchUserProfile(session.user);
          if (userProfile && mounted) {
            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.email);
        
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user);
          if (mounted) {
            setUser(userProfile);
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    if (!initialized) {
      return { success: false, error: 'Authentication system is still initializing. Please try again.' };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
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
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!initialized) {
      return { success: false, error: 'Authentication system is still initializing. Please try again.' };
    }

    setLoading(true);
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
        if (userProfile) {
          setUser(userProfile);
        }
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      setUser(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error;
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
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

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