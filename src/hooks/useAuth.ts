import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';

interface AuthState {
  user: any;
  profile: any;
  onboarding: any;
  isAdmin: boolean;
  hasTrainingAccess: boolean;
  hasNutritionAccess: boolean;
  isBasic: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string, onProgress?: (progress: number, text: string) => void) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  logoutAndRedirect: (redirectUrl?: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

interface AuthUtils {
  getRedirectPath: (redirectTo?: string) => string;
  isAuthenticated: boolean;
  canAccessFeature: (feature: 'training' | 'nutrition' | 'admin') => boolean;
}

export function useAuth(): AuthState & AuthActions & AuthUtils {
  const { 
    user, 
    profile, 
    loading: authLoading, 
    signIn, 
    signOut, 
    logoutAndRedirect: contextLogoutAndRedirect,
    isAdmin: contextIsAdmin 
  } = useSupabaseAuth();
  
  const { 
    isLoading: onboardingLoading,
    isCompleted,
    currentStep,
    hasTrainingAccess,
    hasNutritionAccess,
    isBasic
  } = useOnboardingV2();

  // ✅ PHASE 1.4: Unified auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    onboarding: null,
    isAdmin: false,
    hasTrainingAccess: false,
    hasNutritionAccess: false,
    isBasic: false,
    isLoading: true,
    error: null
  });

  // Update auth state when context values change
  useEffect(() => {
    setAuthState(prev => ({
      ...prev,
      user,
      profile,
      onboarding: {
        isCompleted,
        currentStep,
        hasTrainingAccess,
        hasNutritionAccess,
        isBasic
      },
      isAdmin: contextIsAdmin,
      hasTrainingAccess,
      hasNutritionAccess,
      isBasic,
      isLoading: authLoading || onboardingLoading,
      error: null
    }));
  }, [user, profile, isCompleted, currentStep, hasTrainingAccess, hasNutritionAccess, isBasic, contextIsAdmin, authLoading, onboardingLoading]);

  // ✅ PHASE 1.4: Unified login function
  const login = useCallback(async (email: string, password: string, onProgress?: (progress: number, text: string) => void) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await signIn(email, password, onProgress);
      
      if (!result.success) {
        setAuthState(prev => ({ ...prev, error: result.error || 'Login failed', isLoading: false }));
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  }, [signIn]);

  // ✅ PHASE 1.4: Unified logout function
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await signOut();
      
      setAuthState(prev => ({ 
        ...prev, 
        user: null, 
        profile: null, 
        onboarding: null,
        isAdmin: false,
        hasTrainingAccess: false,
        hasNutritionAccess: false,
        isBasic: false,
        isLoading: false 
      }));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setAuthState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  }, [signOut]);

  // ✅ PHASE 1.4: Unified logout and redirect function
  const logoutAndRedirect = useCallback(async (redirectUrl?: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await contextLogoutAndRedirect(redirectUrl);
      
      setAuthState(prev => ({ 
        ...prev, 
        user: null, 
        profile: null, 
        onboarding: null,
        isAdmin: false,
        hasTrainingAccess: false,
        hasNutritionAccess: false,
        isBasic: false,
        isLoading: false 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setAuthState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, [contextLogoutAndRedirect]);

  // ✅ PHASE 1.4: Refresh auth data
  const refreshAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // The context will automatically refresh when user changes
      // This is just a placeholder for future refresh logic
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Refresh failed';
      setAuthState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    }
  }, []);

  // ✅ PHASE 1.4: Get redirect path based on user state
  const getRedirectPath = useCallback((redirectTo?: string) => {
    if (redirectTo && redirectTo !== '/login') return redirectTo;
    
    // Admin users go to admin dashboard
    if (authState.isAdmin) return '/dashboard-admin';
    
    // If onboarding is not completed, redirect to current step
    if (!authState.onboarding?.isCompleted && authState.onboarding?.currentStep !== null) {
      const currentStep = authState.onboarding.currentStep;
      
      switch (currentStep) {
        case 0: return '/dashboard/welcome-video';
        case 1: return '/dashboard'; // Goal setting modal
        case 2: return '/dashboard/mijn-challenges';
        case 3: return '/dashboard/trainingsschemas';
        case 4: return '/dashboard/voedingsplannen-v2';
        case 5: return '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden';
        default: return '/dashboard';
      }
    }
    
    // Default to dashboard
    return '/dashboard';
  }, [authState.isAdmin, authState.onboarding]);

  // ✅ PHASE 1.4: Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!authState.user && !!authState.profile;
  }, [authState.user, authState.profile]);

  // ✅ PHASE 1.4: Check if user can access a feature
  const canAccessFeature = useCallback((feature: 'training' | 'nutrition' | 'admin') => {
    switch (feature) {
      case 'admin':
        return authState.isAdmin;
      case 'training':
        return authState.hasTrainingAccess;
      case 'nutrition':
        return authState.hasNutritionAccess;
      default:
        return false;
    }
  }, [authState.isAdmin, authState.hasTrainingAccess, authState.hasNutritionAccess]);

  return {
    // State
    ...authState,
    
    // Actions
    login,
    logout,
    logoutAndRedirect,
    refreshAuth,
    
    // Utils
    getRedirectPath,
    isAuthenticated: isAuthenticated(),
    canAccessFeature
  };
}
