import { useState, useEffect, useCallback, useRef } from 'react';

interface VideoPreloadOptions {
  priority: 'high' | 'medium' | 'low';
  preloadAmount: 'none' | 'metadata' | 'auto';
  aggressivePreload?: boolean;
  maxConcurrent?: number;
}

interface VideoPreloadStatus {
  url: string;
  status: 'pending' | 'loading' | 'loaded' | 'error';
  progress: number;
  error?: string;
}

interface UseVideoPreloadReturn {
  preloadVideo: (url: string, options?: VideoPreloadOptions) => Promise<HTMLVideoElement>;
  preloadMultipleVideos: (urls: string[], options?: VideoPreloadOptions) => Promise<HTMLVideoElement[]>;
  getPreloadStatus: (url: string) => VideoPreloadStatus | null;
  clearPreloadedVideo: (url: string) => void;
  clearAllPreloadedVideos: () => void;
  isPreloading: boolean;
  preloadProgress: number;
  totalVideos: number;
  loadedVideos: number;
}

export function useVideoPreload(): UseVideoPreloadReturn {
  const [preloadStatuses, setPreloadStatuses] = useState<Map<string, VideoPreloadStatus>>(new Map());
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [loadedVideos, setLoadedVideos] = useState(0);
  
  const preloadedVideos = useRef<Map<string, HTMLVideoElement>>(new Map());
  const activePreloads = useRef<Set<string>>(new Set());
  const maxConcurrent = useRef(3);
  const currentConcurrent = useRef(0);

  // Update progress calculation
  useEffect(() => {
    const statuses = Array.from(preloadStatuses.values());
    const loaded = statuses.filter(s => s.status === 'loaded').length;
    const total = statuses.length;
    
    setLoadedVideos(loaded);
    setTotalVideos(total);
    setPreloadProgress(total > 0 ? (loaded / total) * 100 : 0);
    setIsPreloading(statuses.some(s => s.status === 'loading'));
  }, [preloadStatuses]);

  const createVideoElement = useCallback((url: string, options: VideoPreloadOptions): HTMLVideoElement => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true; // Muted for autoplay compatibility
    video.playsInline = true;
    
    // Set preload based on options
    if (options.aggressivePreload) {
      video.preload = 'auto';
    } else {
      video.preload = options.preloadAmount;
    }

    // Set priority-based loading
    if (options.priority === 'high') {
      video.preload = 'auto';
      video.load();
    }

    return video;
  }, []);

  const preloadVideo = useCallback(async (url: string, options: VideoPreloadOptions = {
    priority: 'medium',
    preloadAmount: 'metadata',
    aggressivePreload: false,
    maxConcurrent: 3
  }): Promise<HTMLVideoElement> => {
    // Check if already preloaded
    if (preloadedVideos.current.has(url)) {
      return preloadedVideos.current.get(url)!;
    }

    // Check if already preloading
    if (activePreloads.current.has(url)) {
      return new Promise((resolve, reject) => {
        const checkStatus = () => {
          if (preloadedVideos.current.has(url)) {
            resolve(preloadedVideos.current.get(url)!);
          } else if (preloadStatuses.get(url)?.status === 'error') {
            reject(new Error('Video preload failed'));
          } else {
            setTimeout(checkStatus, 100);
          }
        };
        checkStatus();
      });
    }

    // Wait for available slot if max concurrent reached
    while (currentConcurrent.current >= maxConcurrent.current) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    activePreloads.current.add(url);
    currentConcurrent.current++;

    // Set initial status
    setPreloadStatuses(prev => new Map(prev.set(url, {
      url,
      status: 'loading',
      progress: 0
    })));

    return new Promise((resolve, reject) => {
      const video = createVideoElement(url, options);
      
      const handleLoadStart = () => {
        setPreloadStatuses(prev => new Map(prev.set(url, {
          url,
          status: 'loading',
          progress: 10
        })));
      };

      const handleProgress = () => {
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const duration = video.duration;
          if (duration > 0) {
            const progress = Math.min((bufferedEnd / duration) * 100, 95);
            setPreloadStatuses(prev => new Map(prev.set(url, {
              url,
              status: 'loading',
              progress
            })));
          }
        }
      };

      const handleCanPlay = () => {
        setPreloadStatuses(prev => new Map(prev.set(url, {
          url,
          status: 'loaded',
          progress: 100
        })));
        
        preloadedVideos.current.set(url, video);
        activePreloads.current.delete(url);
        currentConcurrent.current--;
        resolve(video);
      };

      const handleError = (e: Event) => {
        console.error('Video preload error:', e);
        setPreloadStatuses(prev => new Map(prev.set(url, {
          url,
          status: 'error',
          progress: 0,
          error: 'Failed to load video'
        })));
        
        activePreloads.current.delete(url);
        currentConcurrent.current--;
        reject(e);
      };

      // Add event listeners
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('progress', handleProgress);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      // Start loading
      video.src = url;
      video.load();

      // Cleanup function
      const cleanup = () => {
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('progress', handleProgress);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };

      // Auto cleanup after 30 seconds if not loaded
      setTimeout(() => {
        if (activePreloads.current.has(url)) {
          cleanup();
          activePreloads.current.delete(url);
          currentConcurrent.current--;
          reject(new Error('Video preload timeout'));
        }
      }, 30000);
    });
  }, [createVideoElement]);

  const preloadMultipleVideos = useCallback(async (
    urls: string[], 
    options: VideoPreloadOptions = {
      priority: 'medium',
      preloadAmount: 'metadata',
      aggressivePreload: false,
      maxConcurrent: 3
    }
  ): Promise<HTMLVideoElement[]> => {
    maxConcurrent.current = options.maxConcurrent || 3;
    
    // Sort by priority (high priority first)
    const sortedUrls = [...urls];
    
    const results: HTMLVideoElement[] = [];
    const errors: string[] = [];

    // Process in batches to respect maxConcurrent
    for (let i = 0; i < sortedUrls.length; i += maxConcurrent.current) {
      const batch = sortedUrls.slice(i, i + maxConcurrent.current);
      
      const batchPromises = batch.map(async (url) => {
        try {
          const video = await preloadVideo(url, options);
          return video;
        } catch (error) {
          errors.push(url);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(Boolean) as HTMLVideoElement[]);
    }

    if (errors.length > 0) {
      console.warn('Some videos failed to preload:', errors);
    }

    return results;
  }, [preloadVideo]);

  const getPreloadStatus = useCallback((url: string): VideoPreloadStatus | null => {
    return preloadStatuses.get(url) || null;
  }, [preloadStatuses]);

  const clearPreloadedVideo = useCallback((url: string) => {
    const video = preloadedVideos.current.get(url);
    if (video) {
      video.src = '';
      video.load();
      preloadedVideos.current.delete(url);
    }
    setPreloadStatuses(prev => {
      const newMap = new Map(prev);
      newMap.delete(url);
      return newMap;
    });
  }, []);

  const clearAllPreloadedVideos = useCallback(() => {
    preloadedVideos.current.forEach(video => {
      video.src = '';
      video.load();
    });
    preloadedVideos.current.clear();
    setPreloadStatuses(new Map());
    activePreloads.current.clear();
    currentConcurrent.current = 0;
  }, []);

  return {
    preloadVideo,
    preloadMultipleVideos,
    getPreloadStatus,
    clearPreloadedVideo,
    clearAllPreloadedVideos,
    isPreloading,
    preloadProgress,
    totalVideos,
    loadedVideos
  };
}
