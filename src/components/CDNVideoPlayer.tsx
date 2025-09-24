"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { useVideoCDN } from '@/hooks/useVideoCDN';
import VideoPreloadService from '@/services/VideoPreloadService';

interface CDNVideoPlayerProps {
  src: string;
  poster?: string;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
}

export default function CDNVideoPlayer({
  src,
  poster,
  onEnded,
  onPlay,
  onPause,
  className = "w-full h-full rounded-lg bg-black",
  controls = true,
  autoPlay = false,
  muted = false,
  preload = 'metadata'
}: CDNVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [bufferingProgress, setBufferingProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use CDN optimization hook
  const { optimizedUrl, isLoading: cdnLoading, error: cdnError, retry: cdnRetry, getAlternativeUrl } = useVideoCDN(src);
  const [currentSrc, setCurrentSrc] = useState(optimizedUrl);
  const [cdnOptimized, setCdnOptimized] = useState(false);

  // Update current source when CDN optimization completes
  useEffect(() => {
    if (optimizedUrl && optimizedUrl !== currentSrc) {
      setCurrentSrc(optimizedUrl);
      setCdnOptimized(true);
      
      // Preload the optimized video
      VideoPreloadService.preloadVideo(optimizedUrl, 'high');
    }
  }, [optimizedUrl, currentSrc]);

  // Preload optimization
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    // Set up preload optimization
    video.preload = preload;
    
    // Add multiple source formats for better compatibility
    const sources = [
      { src: currentSrc, type: 'video/mp4' },
      { src: currentSrc.replace('.mp4', '.webm'), type: 'video/webm' },
      { src: currentSrc.replace('.mp4', '.ogg'), type: 'video/ogg' }
    ];

    // Clear existing sources
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }

    // Add optimized sources
    sources.forEach(source => {
      const sourceElement = document.createElement('source');
      sourceElement.src = source.src;
      sourceElement.type = source.type;
      video.appendChild(sourceElement);
    });

    // Set the main src as fallback
    video.src = currentSrc;

    // Add event listeners for better buffering
    const handleLoadStart = () => {
      setIsLoading(true);
      setIsBuffering(true);
      setHasError(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsBuffering(false);
      setBufferingProgress(100);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const progress = (bufferedEnd / duration) * 100;
          setBufferingProgress(progress);
          setIsBuffering(progress < 95);
        }
      }
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlayThrough = () => {
      setIsBuffering(false);
      setBufferingProgress(100);
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setHasError(true);
      setIsLoading(false);
      setIsBuffering(false);
      
      // Retry with CDN optimization
      if (retryCount < 3) {
        const alternativeUrl = getAlternativeUrl('medium');
        if (alternativeUrl !== currentSrc) {
          setCurrentSrc(alternativeUrl);
          setRetryCount(prev => prev + 1);
          setHasError(false);
        }
      } else {
        // Final fallback - try CDN retry
        cdnRetry();
        setRetryCount(0);
        setHasError(false);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    // Add all event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    // Cleanup
    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentSrc, preload, onPlay, onPause, onEnded, src, retryCount]);

  // Optimize for mobile
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    // Mobile optimizations
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('playsinline', 'true');
    
    // Preload optimization based on connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType) {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          video.preload = 'none';
        } else if (connection.effectiveType === '3g') {
          video.preload = 'metadata';
        } else {
          video.preload = 'auto';
        }
      }
    }
  }, []);

  if (hasError && retryCount >= 3) {
    return (
      <div className="aspect-video bg-[#232D1A] rounded-lg flex items-center justify-center border border-[#3A4D23]">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-sm">Video kon niet worden geladen</p>
          <button 
            onClick={() => {
              setRetryCount(0);
              setCurrentSrc(optimizedUrl);
              setHasError(false);
              cdnRetry();
            }}
            className="mt-2 px-4 py-2 bg-[#8BAE5A] text-white rounded-lg text-sm hover:bg-[#B6C948] transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-[#232D1A] rounded-lg overflow-hidden border border-[#3A4D23]">
      <video
        ref={videoRef}
        className={className}
        controls={controls}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        preload={preload}
      >
        Je browser ondersteunt geen video afspelen.
      </video>
      
      {/* Loading overlay */}
      {(isLoading || cdnLoading) && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-2"></div>
            <p className="text-sm">
              {cdnLoading ? 'CDN optimaliseren...' : 'Video laden...'}
            </p>
            {cdnError && (
              <p className="text-xs text-yellow-400 mt-1">
                CDN optimalisatie mislukt, originele URL gebruikt
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Buffering overlay */}
      {isBuffering && !isLoading && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-black/60 rounded-lg p-3 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
            <span className="text-white text-sm">Bufferen...</span>
          </div>
        </div>
      )}
      
      {/* Buffering progress bar */}
      {isBuffering && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div 
            className="h-full bg-[#8BAE5A] transition-all duration-300"
            style={{ width: `${bufferingProgress}%` }}
          />
        </div>
      )}
      
      {/* CDN optimization indicator */}
      {cdnOptimized && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
          CDN
        </div>
      )}
      
      {/* CDN error indicator */}
      {cdnError && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
          CDN Error
        </div>
      )}
    </div>
  );
}
