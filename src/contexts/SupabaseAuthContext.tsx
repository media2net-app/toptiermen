'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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

// Session management utilities
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SESSION_WARNING_TIME = 10 * 60 * 1000; // 10 minutes before expiry

// Types
interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  logoutAndRedirect: (redirectUrl?: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionCheckInterval, setSessionCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Function to refresh session
  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }
      if (data.session) {
        console.log('Session refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  };

  // Function to check and maintain session
  const checkSessionHealth = async () => {
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
          console.log('Session expiring soon, attempting refresh...');
          const refreshed = await refreshSession();
          if (!refreshed) {
            console.warn('Failed to refresh session, user may need to re-authenticate');
          }
        }
      }
    } catch (error) {
      console.error('Session health check failed:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user) {
          // Get user profile from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error getting profile:', profileError);
          } else if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              role: normalizeRole(profile.role)
            });
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up session health check interval
    const interval = setInterval(checkSessionHealth, SESSION_CHECK_INTERVAL);
    setSessionCheckInterval(interval);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error getting profile on sign in:', profileError);
          } else if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              role: normalizeRole(profile.role)
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
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
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error getting profile:', profileError);
          return { success: false, error: 'Error getting user profile' };
        }

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: normalizeRole(profile.role)
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

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
          return { success: false, error: 'Error creating user profile' };
        }

        setUser({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: 'USER'
        });
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
        setUser(null);
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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Update user error:', error);
      } else {
        setUser(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    logoutAndRedirect,
    updateUser,
    refreshSession,
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