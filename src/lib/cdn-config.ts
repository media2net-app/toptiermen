/**
 * CDN Configuration for Top Tier Men
 * Provides multiple CDN options for optimal video delivery
 */

export interface CDNConfig {
  provider: 'vercel' | 'cloudflare' | 'supabase' | 'custom';
  baseUrl: string;
  cacheControl: string;
  transformUrl?: (url: string) => string;
}

// Vercel Edge Network CDN (Recommended - already integrated)
export const vercelCDN: CDNConfig = {
  provider: 'vercel',
  baseUrl: 'https://wkjvstuttbeyqzyjayxj.supabase.co',
  cacheControl: 'public, max-age=3600, s-maxage=86400', // 1 hour browser, 24 hours CDN
  transformUrl: (url: string) => {
    // Vercel automatically serves Supabase files through their edge network
    // Add optimization parameters for better performance
    if (url.includes('workout-videos')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}optimize=medium&format=auto`;
    }
    return url;
  }
};

// Cloudflare CDN (Alternative option)
export const cloudflareCDN: CDNConfig = {
  provider: 'cloudflare',
  baseUrl: 'https://cdn.toptiermen.com', // Custom domain
  cacheControl: 'public, max-age=3600, s-maxage=86400',
  transformUrl: (url: string) => {
    // Transform Supabase URL to Cloudflare URL
    if (url.includes('wkjvstuttbeyqzyjayxj.supabase.co')) {
      return url.replace(
        'https://wkjvstuttbeyqzyjayxj.supabase.co',
        'https://cdn.toptiermen.com'
      );
    }
    return url;
  }
};

// Supabase CDN (Current setup)
export const supabaseCDN: CDNConfig = {
  provider: 'supabase',
  baseUrl: 'https://wkjvstuttbeyqzyjayxj.supabase.co',
  cacheControl: 'public, max-age=3600',
  transformUrl: (url: string) => url
};

// Active CDN configuration
export const activeCDN: CDNConfig = vercelCDN;

/**
 * Get optimized video URL with CDN
 */
export function getCDNVideoUrl(supabaseUrl: string): string {
  if (!supabaseUrl) return '';
  
  // Apply CDN transformation
  const cdnUrl = activeCDN.transformUrl?.(supabaseUrl) || supabaseUrl;
  
  console.log('🌐 CDN URL transformation:', {
    original: supabaseUrl,
    cdn: cdnUrl,
    provider: activeCDN.provider
  });
  
  return cdnUrl;
}

/**
 * Get video URL with quality parameters
 */
export function getVideoUrlWithQuality(supabaseUrl: string, quality: 'auto' | '720p' | '1080p' = 'auto'): string {
  const cdnUrl = getCDNVideoUrl(supabaseUrl);
  
  if (quality === 'auto') {
    return cdnUrl;
  }
  
  // Add quality parameter for adaptive streaming
  const separator = cdnUrl.includes('?') ? '&' : '?';
  return `${cdnUrl}${separator}quality=${quality}`;
}

/**
 * Get video thumbnail URL
 */
export function getVideoThumbnailUrl(videoUrl: string, time: number = 1): string {
  const cdnUrl = getCDNVideoUrl(videoUrl);
  
  // Add thumbnail parameter for faster loading
  const separator = cdnUrl.includes('?') ? '&' : '?';
  return `${cdnUrl}${separator}thumb=${time}&width=400&height=225&quality=80`;
}

/**
 * Get optimized video URL for thumbnails
 */
export function getOptimizedVideoUrl(videoUrl: string, quality: 'low' | 'medium' | 'high' = 'medium'): string {
  const cdnUrl = getCDNVideoUrl(videoUrl);
  
  // Add optimization parameters
  const separator = cdnUrl.includes('?') ? '&' : '?';
  const qualityParams = {
    low: 'width=320&height=180&quality=60',
    medium: 'width=640&height=360&quality=80',
    high: 'width=1280&height=720&quality=90'
  };
  
  return `${cdnUrl}${separator}${qualityParams[quality]}&format=auto`;
}

/**
 * Preload video for better performance
 */
export function preloadVideo(videoUrl: string): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'video';
  link.href = getCDNVideoUrl(videoUrl);
  link.type = 'video/mp4';
  
  document.head.appendChild(link);
  
  console.log('📦 Preloading video:', link.href);
}

/**
 * Get CDN performance metrics
 */
export async function getCDNPerformance(url: string): Promise<{
  provider: string;
  responseTime: number;
  cacheHit: boolean;
}> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const responseTime = performance.now() - startTime;
    
    return {
      provider: activeCDN.provider,
      responseTime,
      cacheHit: response.headers.get('cf-cache-status') === 'HIT' || 
                response.headers.get('x-vercel-cache') === 'HIT'
    };
  } catch (error) {
    return {
      provider: activeCDN.provider,
      responseTime: -1,
      cacheHit: false
    };
  }
} 