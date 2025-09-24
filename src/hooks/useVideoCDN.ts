import { useState, useEffect, useCallback } from 'react';

interface VideoCDNOptimization {
  original: string;
  optimized: string;
  cdn: string;
  alternatives?: Array<{
    name: string;
    url: string;
    priority: number;
  }>;
  features?: {
    adaptiveBitrate: boolean;
    preload: string;
    compression: string;
    caching: string;
  };
}

interface UseVideoCDNReturn {
  optimizedUrl: string;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  getAlternativeUrl: (quality: 'high' | 'medium' | 'low') => string;
}

export function useVideoCDN(originalUrl: string): UseVideoCDNReturn {
  const [optimizedUrl, setOptimizedUrl] = useState(originalUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimization, setOptimization] = useState<VideoCDNOptimization | null>(null);

  const optimizeVideo = useCallback(async (url: string) => {
    if (!url) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/video-cdn?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setOptimization(data.data);
        setOptimizedUrl(data.data.optimized);
      } else {
        throw new Error(data.error || 'Failed to optimize video');
      }
    } catch (err) {
      console.error('Video CDN optimization failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback to original URL
      setOptimizedUrl(originalUrl);
    } finally {
      setIsLoading(false);
    }
  }, [originalUrl]);

  const retry = useCallback(() => {
    optimizeVideo(originalUrl);
  }, [optimizeVideo, originalUrl]);

  const getAlternativeUrl = useCallback((quality: 'high' | 'medium' | 'low') => {
    if (!optimization?.alternatives) return optimizedUrl;

    const qualityMap = {
      high: 'high',
      medium: 'medium', 
      low: 'low'
    };

    const alternative = optimization.alternatives.find(alt => 
      alt.name.toLowerCase().includes(qualityMap[quality])
    );

    return alternative?.url || optimizedUrl;
  }, [optimization, optimizedUrl]);

  useEffect(() => {
    if (originalUrl) {
      optimizeVideo(originalUrl);
    }
  }, [originalUrl, optimizeVideo]);

  return {
    optimizedUrl,
    isLoading,
    error,
    retry,
    getAlternativeUrl
  };
}
