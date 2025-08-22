// Facebook Pixel utility functions
declare global {
  interface Window {
    fbq: any;
  }
}

export const META_PIXEL_ID = '1333919368069015';

// Initialize Facebook Pixel
export const initFacebookPixel = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

// Track page views
export const trackPageView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

// Track conversions
export const trackConversion = (value?: number, currency: string = 'EUR') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: currency,
    });
  }
};

// Track lead generation
export const trackLead = (value?: number, currency: string = 'EUR') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      value: value,
      currency: currency,
    });
  }
};

// Track email signups
export const trackEmailSignup = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration');
  }
};

// Track video views
export const trackVideoView = (videoName: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: videoName,
      content_type: 'video',
    });
  }
};

// Track button clicks
export const trackButtonClick = (buttonName: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CustomEvent', {
      event_name: 'button_click',
      button_name: buttonName,
    });
  }
};
