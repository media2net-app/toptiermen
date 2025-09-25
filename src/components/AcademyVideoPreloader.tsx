"use client";

import { useEffect, useState, useCallback } from 'react';
import { useVideoPreload } from '@/hooks/useVideoPreload';

interface Lesson {
  id: string;
  title: string;
  video_url?: string;
  order_index: number;
}

interface AcademyVideoPreloaderProps {
  lessons: Lesson[];
  currentLessonId: string;
  preloadNext?: number;
  aggressivePreload?: boolean;
  onPreloadProgress?: (progress: number) => void;
  onPreloadComplete?: (loadedVideos: number) => void;
}

export default function AcademyVideoPreloader({
  lessons,
  currentLessonId,
  preloadNext = 5,
  aggressivePreload = true,
  onPreloadProgress,
  onPreloadComplete
}: AcademyVideoPreloaderProps) {
  const {
    preloadMultipleVideos,
    getPreloadStatus,
    isPreloading,
    preloadProgress,
    totalVideos,
    loadedVideos
  } = useVideoPreload();

  const [currentPreloadBatch, setCurrentPreloadBatch] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get lessons to preload
  const getLessonsToPreload = useCallback(() => {
    if (!lessons.length || !currentLessonId) return [];

    const currentIndex = lessons.findIndex(lesson => lesson.id === currentLessonId);
    if (currentIndex === -1) return [];

    // Get next lessons with videos
    const nextLessons = lessons
      .slice(currentIndex + 1, currentIndex + 1 + preloadNext)
      .filter(lesson => lesson.video_url)
      .map(lesson => lesson.video_url!);

    // Also preload previous lessons for better UX
    const prevLessons = lessons
      .slice(Math.max(0, currentIndex - 2), currentIndex)
      .filter(lesson => lesson.video_url)
      .map(lesson => lesson.video_url!);

    // Combine and prioritize (current area first, then next)
    return [...prevLessons, ...nextLessons];
  }, [lessons, currentLessonId, preloadNext]);

  // Start preloading
  const startPreloading = useCallback(async () => {
    const urlsToPreload = getLessonsToPreload();
    
    if (urlsToPreload.length === 0) {
      onPreloadComplete?.(0);
      return;
    }

    setCurrentPreloadBatch(urlsToPreload);

    try {
      await preloadMultipleVideos(urlsToPreload, {
        priority: aggressivePreload ? 'high' : 'medium',
        preloadAmount: aggressivePreload ? 'auto' : 'metadata',
        aggressivePreload,
        maxConcurrent: aggressivePreload ? 2 : 3 // Limit concurrent for aggressive mode
      });

      onPreloadComplete?.(loadedVideos);
    } catch (error) {
      console.error('Academy video preloading failed:', error);
    }
  }, [getLessonsToPreload, preloadMultipleVideos, aggressivePreload, onPreloadComplete, loadedVideos]);

  // Handle progress updates
  useEffect(() => {
    onPreloadProgress?.(preloadProgress);
  }, [preloadProgress, onPreloadProgress]);

  // Initialize preloading when lessons change
  useEffect(() => {
    if (!isInitialized && lessons.length > 0 && currentLessonId) {
      setIsInitialized(true);
      startPreloading();
    }
  }, [lessons, currentLessonId, isInitialized, startPreloading]);

  // Restart preloading when current lesson changes
  useEffect(() => {
    if (isInitialized) {
      startPreloading();
    }
  }, [currentLessonId, isInitialized, startPreloading]);

  // Get detailed preload status for debugging
  const getDetailedStatus = useCallback(() => {
    const statuses = currentPreloadBatch.map(url => ({
      url,
      status: getPreloadStatus(url)
    }));

    return {
      isPreloading,
      preloadProgress,
      totalVideos,
      loadedVideos,
      detailedStatuses: statuses,
      currentBatch: currentPreloadBatch
    };
  }, [currentPreloadBatch, getPreloadStatus, isPreloading, preloadProgress, totalVideos, loadedVideos]);

  return {
    isPreloading,
    preloadProgress,
    totalVideos,
    loadedVideos,
    getDetailedStatus
  };
}
