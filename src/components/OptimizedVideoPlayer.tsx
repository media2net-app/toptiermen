'use client';

import React, { useRef, useEffect, useState } from 'react';

interface OptimizedVideoPlayerProps {
  src: string;
  poster?: string;
  onEnded?: () => void;
  onPlay?: () => void;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
}

export default function OptimizedVideoPlayer({
  src,
  poster,
  onEnded,
  onPlay,
  className = "w-full rounded-lg",
  controls = true,
  autoPlay = false,
  muted = false
}: OptimizedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [bufferingProgress, setBufferingProgress] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Enhanced buffering strategy
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const progress = (bufferedEnd / duration) * 100;
          setBufferingProgress(progress);
          
          // Log buffering progress
          console.log(`📺 Video buffered: ${progress.toFixed(1)}%`);
          
          // If we have enough buffer, we're not buffering
          if (progress > 10) {
            setIsBuffering(false);
          }
        }
      }
    };

    const handleWaiting = () => {
      console.log('📺 Video waiting for data, buffering...');
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      console.log('📺 Video can play, buffering complete');
      setIsBuffering(false);
    };

    const handleSeeking = () => {
      console.log('📺 User seeking, checking buffer...');
      setIsBuffering(true);
    };

    const handleSeeked = () => {
      console.log('📺 Seek completed, video ready');
      setIsBuffering(false);
    };

    const handleLoadStart = () => {
      console.log('📺 Video loading started');
      setIsBuffering(true);
    };

    const handleLoadedData = () => {
      console.log('📺 Video data loaded, ready for smooth playback');
      setIsBuffering(false);
    };

    // Add event listeners
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);

    // Preload strategy: start loading immediately
    video.load();

    return () => {
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [src]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className={className}
        controls={controls}
        preload="auto"
        playsInline
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        onEnded={onEnded}
        onPlay={onPlay}
      >
        <source src={src} type="video/mp4" />
        Je browser ondersteunt geen video afspelen.
      </video>
      
      {/* Buffering indicator */}
      {isBuffering && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
          <div className="bg-black/60 rounded-lg p-3 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-white text-sm">Bufferen...</span>
          </div>
        </div>
      )}
      
      {/* Buffering progress bar (optional, for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-[#8BAE5A] transition-all duration-300"
            style={{ width: `${bufferingProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
