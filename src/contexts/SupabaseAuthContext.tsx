'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string, onProgress?: (progress: number, text: string) => void) => Promise<{ success: boolean; error?: string }>;
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
  const [loading, setLoading] = useState(false); // Start with false to show login form immediately
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Track if auth has been initialized

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
        // Don't return null immediately - this might cause logout
        // Instead, create a minimal profile if we have user data
        if (email) {
          console.log('Creating fallback profile for email:', email);
          return {
            id: userId,
            email: email,
            role: 'lid', // Default role
            full_name: email.split('@')[0],
            display_name: email.split('@')[0],
            avatar_url: undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Profile;
        }
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
    // Get initial session - RESTORE SESSIONS AFTER REFRESH
    const getInitialSession = async () => {
      try {
        console.log('🔍 Initializing auth session...');
        // Don't set loading to true during initialization to prevent login form blocking
        
        // Restore session after refresh - this is normal behavior
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError(error.message);
          setUser(null);
          setProfile(null);
        } else if (session?.user) {
          console.log('✅ Restored session for user:', session.user.email);
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id, session.user.email);
          setProfile(userProfile);
        } else {
          console.log('ℹ️ No existing session found - user will need to login');
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Initial session error:', err);
        setError('Failed to initialize auth');
        setUser(null);
        setProfile(null);
      } finally {
        console.log('🔄 Auth initialization complete');
        setLoading(false);
        setIsInitialized(true); // Mark as initialized
      }
    };

    // Add a timeout to prevent infinite loading - reduced timeout for faster loading
    const initTimeout = setTimeout(() => {
      console.log('⚠️ Auth initialization timeout - forcing completion');
      setLoading(false);
      setIsInitialized(true); // Mark as initialized even on timeout
      // Don't clear user state on timeout - this might cause unwanted redirects
    }, 500); // 0.5 second timeout for auth initialization

    getInitialSession().then(() => {
      clearTimeout(initTimeout);
    });

    // Listen for auth changes - ONLY for explicit login/logout actions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event, session?.user?.email);
        
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ User explicitly signed in');
            setUser(session.user);
            const userProfile = await fetchProfile(session.user.id, session.user.email);
            setProfile(userProfile);
            setError(null);
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 User signed out - clearing state');
            setUser(null);
            setProfile(null);
            setError(null);
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 Token refreshed successfully');
            // Don't clear user state on token refresh
          } else if (event === 'INITIAL_SESSION') {
            console.log('🔄 Initial session event received');
            if (session?.user) {
              console.log('✅ Initial session has user:', session.user.email);
              setUser(session.user);
              const userProfile = await fetchProfile(session.user.id, session.user.email);
              setProfile(userProfile);
            } else {
              console.log('⚠️ Initial session has no user - user needs to login');
              // Don't clear state immediately - let the component handle this
            }
          }
        } catch (error) {
          console.error('❌ Auth state change error:', error);
          // Don't clear user state on error - this might be temporary
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Session timeout handler - prevents users from getting stuck
  useEffect(() => {
    if (!user) return;

    const checkSessionValidity = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('❌ Session validation error:', error.message);
          setError('Session expired. Please log in again.');
          setUser(null);
          setProfile(null);
          return;
        }
        
        if (!session) {
          console.log('❌ No valid session found');
          setError('Session expired. Please log in again.');
          setUser(null);
          setProfile(null);
          return;
        }
        
        // Check if session is expired
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at || 0;
        
        if (now >= expiresAt) {
          console.log('❌ Session expired');
          setError('Session expired. Please log in again.');
          setUser(null);
          setProfile(null);
          // Clear the expired session
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('❌ Session check error:', error);
        setError('Session validation failed. Please refresh the page.');
      }
    };

    // Check session validity every 5 minutes
    const sessionCheckInterval = setInterval(checkSessionValidity, 5 * 60 * 1000);
    
    // Also check on page visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSessionValidity();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(sessionCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

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

      console.log('📝 Attempting to log login attempt:', { email, success, errorMessage });

      // Log to API endpoint
      const response = await fetch('/api/admin/login-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Login logging API error:', response.status, errorData);
        throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('✅ Login attempt logged successfully:', result);
    } catch (logError) {
      console.error('❌ Failed to log login attempt:', logError);
      // Don't fail login if logging fails
    }
  };


  // Sign in method - IMPROVED WITH BETTER ERROR HANDLING AND LOGGING
  const signIn = async (email: string, password: string, onProgress?: (progress: number, text: string) => void) => {
    try {
      console.log('🔐 SupabaseAuthContext: Starting login process');
      console.log('📧 Email:', email);
      console.log('🔑 Password length:', password.length);
      console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
      console.log('🔑 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
      
      setLoading(true);
      setError(null);

      // Progress: 10% - Starting login
      onProgress?.(10, "Inloggegevens controleren...");

      // Clear any local sessions before login
      try {
        await supabase.auth.signOut();
        console.log('✅ Local sessions cleared');
      } catch (signOutError) {
        console.log('⚠️ Error clearing local sessions (continuing anyway):', signOutError);
      }

      // Progress: 30% - Authenticating
      onProgress?.(30, "Authenticeren...");

      console.log('🔐 Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📋 Supabase response received');
      console.log('📊 Data:', data ? 'Present' : 'Null');
      console.log('❌ Error:', error ? error.message : 'None');

      if (error) {
        console.error('❌ Login error:', error.message);
        console.error('❌ Error details:', error);
        setError(error.message);
        
        // Log failed login attempt
        await logLoginAttempt(email, false, error.message);
        
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ Login successful for:', data.user.email);
        console.log('👤 User ID:', data.user.id);
        setUser(data.user);
        
        // Progress: 60% - Authentication successful
        onProgress?.(60, "Profiel laden...");
        
        // Log successful login attempt
        await logLoginAttempt(email, true, undefined, data.user.id);
        
        // ✅ PHASE 1.3: Fetch all login data in parallel
        console.log('🔍 Fetching login data in parallel...');
        try {
          const response = await fetch(`/api/auth/login-data?userId=${data.user.id}`);
          const result = await response.json();
          
          if (result.success) {
            console.log('✅ Login data loaded:', result.data.profile.email);
            setProfile(result.data.profile);
            
            // Progress: 90% - All data loaded
            onProgress?.(90, "Sessie voorbereiden...");
          } else {
            console.warn('⚠️ Login data API failed, falling back to individual fetch');
            // Fallback to individual profile fetch
            const userProfile = await fetchProfile(data.user.id, data.user.email);
            if (userProfile) {
              setProfile(userProfile);
            }
          }
        } catch (apiError) {
          console.warn('⚠️ Login data API error, falling back to individual fetch:', apiError);
          // Fallback to individual profile fetch
          const userProfile = await fetchProfile(data.user.id, data.user.email);
          if (userProfile) {
            setProfile(userProfile);
          }
        }
      }

      // Progress: 100% - Complete
      onProgress?.(100, "Welkom terug!");
      
      console.log('✅ SignIn process completed successfully');
      return { success: true };
    } catch (err) {
      console.error('❌ Login exception:', err);
      console.error('❌ Exception details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      
      // Log failed login attempt
      await logLoginAttempt(email, false, errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      console.log('🏁 SignIn process finished, setting loading to false');
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
      
      // 1. Reset React state immediately to prevent UI blocking
      console.log('🔄 Resetting React state...');
      setUser(null);
      setProfile(null);
      setError(null);
      
      // 2. Clear all browser storage
      if (typeof window !== 'undefined') {
        console.log('🧹 Clearing browser storage...');
        localStorage.clear();
        sessionStorage.clear();
        
        // Remove specific auth-related items
        localStorage.removeItem('toptiermen-v2-auth');
        localStorage.removeItem('sb-wkjvstuttbeyqzyjayxj-auth-token');
        sessionStorage.removeItem('sb-wkjvstuttbeyqzyjayxj-auth-token');
        
        console.log('✅ Browser storage cleared');
      }
      
      // 3. Sign out from Supabase with timeout
      console.log('🔐 Signing out from Supabase...');
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase signOut timeout')), 2000)
      );
      
      try {
        const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any;
        if (error) {
          console.error('❌ Supabase signOut error:', error);
        } else {
          console.log('✅ Supabase signOut successful');
        }
      } catch (timeoutError) {
        console.warn('⚠️ Supabase signOut timeout, continuing with logout');
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

  // Enhanced logout with redirect function - IMPROVED WITH TIMEOUT
  const logoutAndRedirect = async (redirectUrl: string = '/login') => {
    try {
      console.log('🚪 Starting logout and redirect process...');
      
      // Set a maximum timeout for the entire logout process
      const logoutTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timeout')), 5000)
      );
      
      // Perform enhanced logout with timeout
      const logoutPromise = signOut();
      const result = await Promise.race([logoutPromise, logoutTimeout]) as { success: boolean; error?: string };
      
      if (result.success) {
        console.log('✅ Logout successful, preparing redirect...');
      } else {
        console.error('❌ Logout failed, forcing redirect anyway...');
      }
      
      // Always redirect regardless of logout success/failure to prevent stuck state
      if (typeof window !== 'undefined') {
        // Immediate redirect without delay to prevent hanging
        const finalUrl = redirectUrl.includes('?') 
          ? `${redirectUrl}&logout=success&t=${Date.now()}` 
          : `${redirectUrl}?logout=success&t=${Date.now()}`;
        
        console.log(`🔄 Redirecting to: ${finalUrl}`);
        window.location.href = finalUrl;
      }
      
    } catch (error) {
      console.error('❌ Logout and redirect error:', error);
      
      // Emergency fallback - force redirect immediately
      if (typeof window !== 'undefined') {
        const finalUrl = redirectUrl.includes('?') 
          ? `${redirectUrl}&logout=error&t=${Date.now()}` 
          : `${redirectUrl}?logout=error&t=${Date.now()}`;
        
        console.log(`🔄 Emergency fallback redirect to: ${finalUrl}`);
        window.location.href = finalUrl;
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
    loading: loading || !isInitialized, // Keep loading true until initialized
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
