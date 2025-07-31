// Google Analytics 4 Implementation
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  
  if (!gaId) {
    console.warn('Google Analytics ID not configured');
    return;
  }

  // Add gtag script to head
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', gaId, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_path: url,
      page_title: title || document.title,
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

// Track user registration
export const trackRegistration = (method: string = 'email') => {
  trackEvent('sign_up', 'engagement', method);
};

// Track login
export const trackLogin = (method: string = 'email') => {
  trackEvent('login', 'engagement', method);
};

// Track subscription
export const trackSubscription = (plan: string, amount: number) => {
  trackEvent('purchase', 'ecommerce', plan, amount);
};

// Track academy progress
export const trackAcademyProgress = (module: string, lesson: string) => {
  trackEvent('lesson_complete', 'academy', `${module} - ${lesson}`);
};

// Track mission completion
export const trackMissionComplete = (mission: string) => {
  trackEvent('mission_complete', 'missions', mission);
};

// Track challenge participation
export const trackChallengeJoin = (challenge: string) => {
  trackEvent('challenge_join', 'challenges', challenge);
};

// Track book reading
export const trackBookRead = (book: string) => {
  trackEvent('book_read', 'books', book);
};

// Track brotherhood interaction
export const trackBrotherhoodInteraction = (action: string) => {
  trackEvent(action, 'brotherhood');
};

// Track search queries
export const trackSearch = (query: string) => {
  trackEvent('search', 'engagement', query);
};

// Track error events
export const trackError = (error: string, page: string) => {
  trackEvent('error', 'system', `${page}: ${error}`);
};

// Track performance metrics
export const trackPerformance = (metric: string, value: number) => {
  trackEvent('performance', 'system', metric, value);
}; 