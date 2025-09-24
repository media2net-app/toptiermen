class VideoPreloadService {
  private static instance: VideoPreloadService;
  private preloadedVideos: Map<string, HTMLVideoElement> = new Map();
  private preloadQueue: string[] = [];
  private isProcessing = false;

  static getInstance(): VideoPreloadService {
    if (!VideoPreloadService.instance) {
      VideoPreloadService.instance = new VideoPreloadService();
    }
    return VideoPreloadService.instance;
  }

  // Preload video with CDN optimization
  async preloadVideo(url: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<HTMLVideoElement> {
    if (this.preloadedVideos.has(url)) {
      return this.preloadedVideos.get(url)!;
    }

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.crossOrigin = 'anonymous';
      
      // Set priority based on connection speed
      if (priority === 'high') {
        video.preload = 'auto';
      } else if (priority === 'medium') {
        video.preload = 'metadata';
      } else {
        video.preload = 'none';
      }

      video.addEventListener('loadeddata', () => {
        this.preloadedVideos.set(url, video);
        resolve(video);
      });

      video.addEventListener('error', (e) => {
        console.error('Video preload error:', e);
        reject(e);
      });

      // Try CDN optimization
      this.optimizeVideoUrl(url).then(optimizedUrl => {
        video.src = optimizedUrl;
      }).catch(() => {
        // Fallback to original URL
        video.src = url;
      });
    });
  }

  // Optimize video URL for better performance
  private async optimizeVideoUrl(url: string): Promise<string> {
    try {
      const response = await fetch(`/api/video-cdn?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.success && data.data.optimized) {
        return data.data.optimized;
      }
    } catch (error) {
      console.warn('CDN optimization failed, using original URL:', error);
    }
    
    return url;
  }

  // Preload multiple videos in sequence
  async preloadVideos(urls: string[], priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    this.preloadQueue = [...urls];
    
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    for (const url of urls) {
      try {
        await this.preloadVideo(url, priority);
        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to preload video ${url}:`, error);
      }
    }
    
    this.isProcessing = false;
  }

  // Get preloaded video
  getPreloadedVideo(url: string): HTMLVideoElement | null {
    return this.preloadedVideos.get(url) || null;
  }

  // Clear preloaded videos to free memory
  clearPreloadedVideos(): void {
    this.preloadedVideos.forEach(video => {
      video.src = '';
      video.load();
    });
    this.preloadedVideos.clear();
  }

  // Get preload status
  getPreloadStatus(): { total: number; loaded: number; queue: number } {
    return {
      total: this.preloadedVideos.size,
      loaded: Array.from(this.preloadedVideos.values()).filter(v => v.readyState >= 2).length,
      queue: this.preloadQueue.length
    };
  }
}

export default VideoPreloadService.getInstance();
