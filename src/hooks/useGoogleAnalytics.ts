import { useCallback } from 'react';
import {
  trackEvent,
  trackUserEngagement,
  trackWorkoutEvent,
  trackNutritionEvent,
  trackAuthEvent,
  trackAdminEvent,
} from '@/lib/google-analytics';

export const useGoogleAnalytics = () => {
  // Generic event tracking
  const trackCustomEvent = useCallback((
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    trackEvent(action, category, label, value);
  }, []);

  // User engagement tracking
  const trackEngagement = useCallback((action: string, details?: any) => {
    trackUserEngagement(action, details);
  }, []);

  // Workout tracking
  const trackWorkout = useCallback((action: string, details?: any) => {
    trackWorkoutEvent(action, details);
  }, []);

  // Nutrition tracking
  const trackNutrition = useCallback((action: string, details?: any) => {
    trackNutritionEvent(action, details);
  }, []);

  // Authentication tracking
  const trackAuth = useCallback((action: string, details?: any) => {
    trackAuthEvent(action, details);
  }, []);

  // Admin tracking
  const trackAdmin = useCallback((action: string, details?: any) => {
    trackAdminEvent(action, details);
  }, []);

  return {
    trackCustomEvent,
    trackEngagement,
    trackWorkout,
    trackNutrition,
    trackAuth,
    trackAdmin,
  };
};
