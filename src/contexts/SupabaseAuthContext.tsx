'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, User, Session } from '@supabase/supabase-js';

// Simple Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

interface Profile {
  id: string;
  full_name?: string;
  display_name?: string;
  email: string;
  role: 'admin' | 'lid' | 'user';
  bio?: string;
  location?: string;
  website?: string;
  interests?: string[];
  main_goal?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  logoutAndRedirect: (redirectUrl?: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLid: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile - IMPROVED WITH EMAIL FALLBACK
  const fetchProfile = async (userId: string, email?: string): Promise<Profile | null> => {
    try {
      // First try to fetch by ID
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // If not found by ID and we have email, try by email
      if (error && email) {
        console.log('Profile not found by ID, trying by email:', email);
        const emailResult = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();
        
        if (!emailResult.error) {
          data = emailResult.data;
          error = null;
        }
      }

      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Profile fetch exception:', err);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Initializing auth session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError(error.message);
        } else if (session?.user) {
          console.log('✅ Found existing session for user:', session.user.email);
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id, session.user.email);
          setProfile(userProfile);
        } else {
          console.log('ℹ️ No existing session found');
          // Important: Clear user state when no session exists
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Initial session error:', err);
        setError('Failed to initialize auth');
        // Still clear user state on error
        setUser(null);
        setProfile(null);
      } finally {
        console.log('🔄 Auth initialization complete');
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const initTimeout = setTimeout(() => {
      console.log('⚠️ Auth initialization timeout - forcing completion');
      setLoading(false);
    }, 5000);

    getInitialSession().then(() => {
      clearTimeout(initTimeout);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id, session.user.email);
          setProfile(userProfile);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setError(null);
        }
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to log login attempts
  const logLoginAttempt = async (email: string, success: boolean, errorMessage?: string, userId?: string) => {
    try {
      const logData = {
        user_id: userId || null,
        email,
        success,
        error_message: errorMessage || null,
        ip_address: null, // Will be handled by server-side
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        session_id: null,
        login_method: 'email_password'
      };

      // Log to API endpoint
      await fetch('/api/admin/login-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });
    } catch (logError) {
      console.error('Failed to log login attempt:', logError);
      // Don't fail login if logging fails
    }
  };

  // Sign in method - IMPROVED WITH BETTER ERROR HANDLING AND LOGGING
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        setError(error.message);
        
        // Log failed login attempt
        await logLoginAttempt(email, false, error.message);
        
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Login successful for:', data.user.email);
        setUser(data.user);
        
        // Log successful login attempt
        await logLoginAttempt(email, true, undefined, data.user.id);
        
        // Fetch profile with email fallback
        const userProfile = await fetchProfile(data.user.id, data.user.email);
        if (userProfile) {
          console.log('✅ Profile loaded:', userProfile.role);
          setProfile(userProfile);
        } else {
          console.warn('⚠️ Profile not found, but login successful');
          // Don't fail login if profile is missing - let admin check handle it
        }
      }

      return { success: true };
    } catch (err) {
      console.error('❌ Login exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      
      // Log failed login attempt
      await logLoginAttempt(email, false, errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sign up method
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sign out method with complete cleanup
  const signOut = async () => {
    try {
      console.log('🚪 Starting enhanced logout process...');
      setLoading(true);
      
      // 1. Clear all browser storage first
      if (typeof window !== 'undefined') {
        console.log('🧹 Clearing browser storage...');
        localStorage.clear();
        sessionStorage.clear();
        
        // Remove specific auth-related items
        localStorage.removeItem('toptiermen-v2-auth');
        localStorage.removeItem('sb-wkjvstuttbeyqzyjayxj-auth-token');
        sessionStorage.removeItem('sb-wkjvstuttbeyqzyjayxj-auth-token');
        
        // Clear any other potential auth storage
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('auth') || key.includes('toptiermen'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        console.log('✅ Browser storage cleared');
      }
      
      // 2. Sign out from Supabase
      console.log('🔐 Signing out from Supabase...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Supabase signOut error:', error);
        // Continue with cleanup even if Supabase signOut fails
      } else {
        console.log('✅ Supabase signOut successful');
      }

      // 3. Reset React state
      console.log('🔄 Resetting React state...');
      setUser(null);
      setProfile(null);
      setError(null);
      
      // 4. Clear browser cache if possible
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          console.log('🗑️ Clearing browser cache...');
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          console.log('✅ Browser cache cleared');
        } catch (cacheError) {
          console.warn('⚠️ Could not clear browser cache:', cacheError);
        }
      }
      
      console.log('✅ Enhanced logout completed successfully');
      return { success: true };
    } catch (err) {
      console.error('❌ Enhanced logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      
      // Force state reset even on error
      setUser(null);
      setProfile(null);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced logout with redirect function
  const logoutAndRedirect = async (redirectUrl: string = '/login') => {
    try {
      console.log('🚪 Starting logout and redirect process...');
      
      // Perform enhanced logout
      const result = await signOut();
      
      if (result.success) {
        console.log('✅ Logout successful, preparing redirect...');
        
        // Use window.location.href for hard redirect to prevent any React state issues
        if (typeof window !== 'undefined') {
          // Add a small delay to ensure cleanup is complete
          setTimeout(() => {
            const finalUrl = redirectUrl.includes('?') 
              ? `${redirectUrl}&logout=success&t=${Date.now()}` 
              : `${redirectUrl}?logout=success&t=${Date.now()}`;
            
            console.log(`🔄 Redirecting to: ${finalUrl}`);
            window.location.href = finalUrl;
          }, 100);
        }
      } else {
        console.error('❌ Logout failed, forcing redirect anyway...');
        
        // Force redirect even on logout failure to prevent stuck state
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            const finalUrl = redirectUrl.includes('?') 
              ? `${redirectUrl}&logout=error&t=${Date.now()}` 
              : `${redirectUrl}?logout=error&t=${Date.now()}`;
            
            console.log(`🔄 Emergency redirect to: ${finalUrl}`);
            window.location.href = finalUrl;
          }, 100);
        }
      }
    } catch (error) {
      console.error('❌ Logout and redirect error:', error);
      
      // Emergency fallback - force redirect
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const finalUrl = redirectUrl.includes('?') 
            ? `${redirectUrl}&logout=error&t=${Date.now()}` 
            : `${redirectUrl}?logout=error&t=${Date.now()}`;
          
          console.log(`🔄 Emergency fallback redirect to: ${finalUrl}`);
          window.location.href = finalUrl;
        }, 100);
      }
    }
  };

  // Computed properties
  const isAuthenticated = !!user;
  
  // Enhanced admin check that works even when profile is missing
  const knownAdminEmails = ['chiel@media2net.nl', 'rick@toptiermen.eu', 'admin@toptiermen.com'];
  const isAdmin = !!(profile?.role === 'admin' || 
    (user?.email && knownAdminEmails.includes(user.email)));
  
  const isLid = profile?.role === 'lid';

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    logoutAndRedirect,
    isAuthenticated,
    isAdmin,
    isLid,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}

// Export supabase client for use in other components
// (already exported above)
