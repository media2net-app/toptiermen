'use client';

import React, { useEffect, useRef, useState } from 'react';

// We import hls.js dynamically to avoid SSR issues
let HlsCtor: any = null as any;
const loadHls = async () => {
  if (HlsCtor) return HlsCtor;
  const mod = await import('hls.js');
  HlsCtor = (mod as any).default || (mod as any);
  return HlsCtor;
};

export interface HLSVideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  className?: string;
}

export default function HLSVideoPlayer({
  src,
  poster,
  autoPlay = false,
  controls = true,
  muted = false,
  className = 'w-full h-full object-contain rounded-lg',
}: HLSVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
    const checkAndroid = () => typeof window !== 'undefined' && /Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile());
    setIsAndroid(checkAndroid());

    let destroyed = false;

    const setup = async () => {
      setErrorMsg(null);
      setIsBuffering(true);

      // ✅ iOS: Use native HLS support (Safari) - PERFECT!
      const canPlayNative = video.canPlayType('application/vnd.apple.mpegurl');
      if (canPlayNative && !checkAndroid()) {
        video.src = src;
        if (autoPlay && !checkMobile()) {
          await video.play().catch(() => {});
        }
        setIsBuffering(false);
        return;
      }

      // ✅ Android/Other: Use hls.js with MSE (Media Source Extensions)
      try {
        const Hls = await loadHls();
        if (destroyed) return;

        if (Hls.isSupported()) {
          const isMobileViewport = checkMobile();
          const isAndroidDevice = checkAndroid();
          
          // 🔥 ANDROID PERFECT CONFIG - Based on web research findings:
          // 1. Progressive streaming for better buffering
          // 2. Higher timeouts for mobile networks
          // 3. Optimized buffer settings for smooth seeking
          // 4. Cap quality to device size for performance
          
          const hls = new Hls({
            // ✅ Core settings
            enableWorker: true,
            lowLatencyMode: false,
            
            // 🔥 BUFFER OPTIMIZATION (Key for Android!)
            // Research shows: 30-60sec buffer = smooth seeking on mobile
            maxBufferLength: 30,        // 30 sec forward buffer
            maxMaxBufferLength: 60,     // Max 60 sec
            backBufferLength: 10,       // 10 sec backward for seeking
            maxBufferSize: 60 * 1000 * 1000, // 60MB buffer size
            maxBufferHole: 0.5,         // Skip small gaps without stalling
            
            // 🔥 PROGRESSIVE STREAMING (Critical for Android Chrome!)
            progressive: true,          // Enable progressive download
            startFragPrefetch: true,    // Prefetch next fragment
            testBandwidth: true,        // Test bandwidth for ABR
            
            // 🔥 ADAPTIVE BITRATE - Optimized for mobile
            startLevel: -1,             // Auto quality selection
            capLevelToPlayerSize: true, // Match quality to player size
            capLevelOnFPSDrop: true,    // Drop quality if FPS drops
            abrEwmaDefaultEstimate: isAndroidDevice ? 1000000 : 500000, // 1Mbps start for Android
            abrBandWidthFactor: 0.95,   // Use 95% of bandwidth
            abrBandWidthUpFactor: 0.7,  // Conservative upgrade
            abrMaxWithRealBitrate: true, // Use real bitrate for ABR
            
            // 🔥 NETWORK OPTIMIZATION (Longer timeouts for mobile networks)
            fragLoadingTimeOut: isMobileViewport ? 30000 : 20000, // 30s for mobile
            fragLoadingMaxRetry: 6,     // More retries for flaky networks
            fragLoadingRetryDelay: 1000,
            fragLoadingMaxRetryTimeout: 64000,
            manifestLoadingTimeOut: 15000,
            manifestLoadingMaxRetry: 4,
            manifestLoadingRetryDelay: 1000,
            
            // 🔥 STALL RECOVERY
            maxStarvationDelay: 4,      // Wait 4s before declaring stall
            maxLoadingDelay: 4,         // Max delay before switching
            nudgeMaxRetry: 5,           // More nudge attempts
            nudgeOffset: 0.1,           // Small nudge offset
            
            // 🔥 LIVE STREAMING SETTINGS
            liveSyncDurationCount: 3,   // Sync buffer
            liveMaxLatencyDurationCount: 10,
            
            // ✅ QUALITY SETTINGS
            startPosition: -1,          // Start from beginning
            initialLiveManifestSize: 1, // Fast manifest load
            
            // Debug
            debug: false,
            enableSoftwareAES: true,    // Software decryption if needed
          });
          
          hlsRef.current = hls;

          // ✅ Error handling with automatic recovery
          hls.on(Hls.Events.ERROR, (_e: any, data: any) => {
            if (!data || !data.fatal) return;
            
            console.log('[HLS Error]', data.type, data.details);
            
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, recovering...');
                setTimeout(() => hls.startLoad(), 1000);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, recovering...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal error:', data);
                setErrorMsg('Kan video niet afspelen');
                // Try to reload after fatal error
                setTimeout(() => {
                  hls.destroy();
                  setup();
                }, 3000);
                break;
            }
          });

          // Quality level events
          hls.on(Hls.Events.LEVEL_SWITCHED, (_: any, data: any) => {
            console.log('[HLS] Quality switched to:', data.level);
          });

          hls.loadSource(src);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, async () => {
            setIsBuffering(false);
            console.log('[HLS] Manifest parsed, levels:', hls.levels?.length);
            
            // Only autoplay on desktop
            if (autoPlay && !checkMobile()) {
              try {
                await video.play();
              } catch (e) {
                console.log('Autoplay prevented');
              }
            }
          });

        } else {
          // Fallback for browsers without MSE support
          video.src = src;
          if (autoPlay && !checkMobile()) {
            await video.play().catch(() => {});
          }
          setIsBuffering(false);
        }
      } catch (err: any) {
        console.error('[HLS] Setup error:', err);
        setErrorMsg(`Kan video niet laden: ${err?.message || String(err)}`);
        setIsBuffering(false);
      }
    };

    setup();

    // ✅ Simple event handlers
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onPlaying = () => setIsBuffering(false);
    const onSeeking = () => setIsBuffering(true);
    const onSeeked = () => setIsBuffering(false);

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('seeking', onSeeking);
    video.addEventListener('seeked', onSeeked);

    return () => {
      destroyed = true;
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('seeked', onSeeked);
      try {
        hlsRef.current?.destroy?.();
      } catch {}
    };
  }, [src, autoPlay]);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-[#3A4D23]">
      <video
        ref={videoRef}
        className={className}
        controls={controls}
        poster={poster}
        autoPlay={false}
        muted={muted}
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
        webkit-playsinline="true"
        // 🔥 Android optimization attributes
        {...(isAndroid ? {
          'x5-video-player-type': 'h5',
          'x5-video-orientation': 'portrait'
        } : {})}
      />

      {isBuffering && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
          <div className="bg-black/70 rounded-lg p-3 flex items-center gap-2 text-white text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#8BAE5A]"></div>
            <span>Bufferen…</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
          <div className="text-center text-red-300 text-sm p-3">
            <div className="mb-2">Fout bij afspelen</div>
            <div className="opacity-80">{errorMsg}</div>
            <div className="text-xs mt-2 opacity-60">De video wordt automatisch opnieuw geprobeerd...</div>
          </div>
        </div>
      )}
    </div>
  );
}
