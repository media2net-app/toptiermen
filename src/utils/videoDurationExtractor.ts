/**
 * Utility functions for extracting and formatting video durations
 */

export interface VideoDurationInfo {
  duration: number; // Duration in seconds
  formatted: string; // Formatted string like "5m", "1u 30m"
}

/**
 * Get video duration from a video URL by creating a temporary video element
 */
export async function getVideoDuration(videoUrl: string): Promise<VideoDurationInfo | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    
    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration);
      const formatted = formatDuration(duration);
      
      // Clean up
      video.remove();
      
      resolve({
        duration,
        formatted
      });
    };
    
    video.onerror = () => {
      console.error('Error loading video for duration extraction:', videoUrl);
      video.remove();
      resolve(null);
    };
    
    // Set a timeout to avoid hanging
    setTimeout(() => {
      video.remove();
      resolve(null);
    }, 10000); // 10 second timeout
    
    video.preload = 'metadata';
    video.src = videoUrl;
    video.muted = true; // Prevent audio from playing
  });
}

/**
 * Format duration from seconds to human readable format
 * @param seconds Duration in seconds
 * @returns Formatted string like "5m", "1u 30m", "2u"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    if (remainingSeconds > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${minutes}m`;
    }
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes > 0) {
    return `${hours}u ${remainingMinutes}m`;
  } else {
    return `${hours}u`;
  }
}

/**
 * Parse duration string to seconds
 * Supports formats like "5m", "1u 30m", "45 minuten", etc.
 */
export function parseDurationToSeconds(durationStr: string): number {
  const duration = durationStr.toLowerCase().trim();
  
  // Handle "1u 30m" format
  const hoursMinutesMatch = duration.match(/(\d+)u\s*(\d+)?m?/);
  if (hoursMinutesMatch) {
    const hours = parseInt(hoursMinutesMatch[1]);
    const minutes = parseInt(hoursMinutesMatch[2] || '0');
    return hours * 3600 + minutes * 60;
  }
  
  // Handle "30m" format
  const minutesMatch = duration.match(/(\d+)m/);
  if (minutesMatch) {
    return parseInt(minutesMatch[1]) * 60;
  }
  
  // Handle "45s" format
  const secondsMatch = duration.match(/(\d+)s/);
  if (secondsMatch) {
    return parseInt(secondsMatch[1]);
  }
  
  // Handle "20 minuten" format
  const minutesLongMatch = duration.match(/(\d+)\s*minut/);
  if (minutesLongMatch) {
    return parseInt(minutesLongMatch[1]) * 60;
  }
  
  // Handle plain numbers (assume minutes)
  const numberMatch = duration.match(/^(\d+)$/);
  if (numberMatch) {
    return parseInt(numberMatch[1]) * 60;
  }
  
  // Default fallback
  return 600; // 10 minutes default
}

/**
 * Batch process video durations for multiple URLs
 */
export async function batchProcessVideoDurations(
  videoUrls: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<(VideoDurationInfo | null)[]> {
  const results: (VideoDurationInfo | null)[] = [];
  
  for (let i = 0; i < videoUrls.length; i++) {
    const url = videoUrls[i];
    const duration = await getVideoDuration(url);
    results.push(duration);
    
    if (onProgress) {
      onProgress(i + 1, videoUrls.length);
    }
    
    // Small delay to prevent overwhelming the browser
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}
