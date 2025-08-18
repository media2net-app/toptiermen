// Google Analytics utility functions

export const GA_TRACKING_ID = 'G-YT2NR1LKHX';

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track user engagement events
export const trackUserEngagement = (action: string, details?: any) => {
  trackEvent(action, 'user_engagement', details?.label, details?.value);
};

// Track workout events
export const trackWorkoutEvent = (action: string, details?: any) => {
  trackEvent(action, 'workout', details?.label, details?.value);
};

// Track nutrition events
export const trackNutritionEvent = (action: string, details?: any) => {
  trackEvent(action, 'nutrition', details?.label, details?.value);
};

// Track authentication events
export const trackAuthEvent = (action: string, details?: any) => {
  trackEvent(action, 'authentication', details?.label, details?.value);
};

// Track admin events
export const trackAdminEvent = (action: string, details?: any) => {
  trackEvent(action, 'admin', details?.label, details?.value);
}; 