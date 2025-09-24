import { useEffect, useState } from 'react';
import VideoPreloadService from '@/services/VideoPreloadService';

interface Lesson {
  id: string;
  video_url?: string;
  order_index: number;
}

interface UseAcademyVideoPreloadReturn {
  preloadStatus: {
    total: number;
    loaded: number;
    queue: number;
  };
  isPreloading: boolean;
  preloadProgress: number;
}

export function useAcademyVideoPreload(
  lessons: Lesson[], 
  currentLessonId: string,
  preloadNext: number = 3
): UseAcademyVideoPreloadReturn {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);

  useEffect(() => {
    if (!lessons.length) return;

    const preloadVideos = async () => {
      setIsPreloading(true);
      setPreloadProgress(0);

      // Find current lesson index
      const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId);
      if (currentIndex === -1) return;

      // Get next lessons to preload
      const nextLessons = lessons
        .slice(currentIndex + 1, currentIndex + 1 + preloadNext)
        .filter(lesson => lesson.video_url)
        .map(lesson => lesson.video_url!);

      if (nextLessons.length === 0) {
        setIsPreloading(false);
        return;
      }

      try {
        // Preload videos with progress tracking
        const totalVideos = nextLessons.length;
        let loadedCount = 0;

        for (const videoUrl of nextLessons) {
          try {
            await VideoPreloadService.preloadVideo(videoUrl, 'medium');
            loadedCount++;
            setPreloadProgress((loadedCount / totalVideos) * 100);
          } catch (error) {
            console.error(`Failed to preload video ${videoUrl}:`, error);
          }
        }
      } catch (error) {
        console.error('Video preloading failed:', error);
      } finally {
        setIsPreloading(false);
      }
    };

    preloadVideos();
  }, [lessons, currentLessonId, preloadNext]);

  const preloadStatus = VideoPreloadService.getPreloadStatus();

  return {
    preloadStatus,
    isPreloading,
    preloadProgress
  };
}
