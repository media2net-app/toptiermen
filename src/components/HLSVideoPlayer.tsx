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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
    setIsMobile(checkMobile());

    let destroyed = false;

    const setup = async () => {
      setErrorMsg(null);
      setIsBuffering(true);

      // If native HLS is supported (Safari/iOS), use it directly
      const canPlayNative = video.canPlayType('application/vnd.apple.mpegurl');
      if (canPlayNative) {
        video.src = src;
        if (autoPlay && !checkMobile()) {
          await video.play().catch(() => {});
        }
        setIsBuffering(false);
        return;
      }

      // Otherwise, use hls.js
      try {
        const Hls = await loadHls();
        if (destroyed) return;

        if (Hls.isSupported()) {
          const isMobileViewport = checkMobile();
          
          // ✅ SIMPLE & RELIABLE CONFIG - Laat hls.js zijn werk doen!
          const hls = new Hls({
            // Basis configuratie
            enableWorker: true,
            lowLatencyMode: false,
            
            // ✅ GOEDE BUFFER INSTELLINGEN voor smooth playback EN seeking
            maxBufferLength: 30,        // 30 seconden buffer = smooth seeking!
            maxMaxBufferLength: 60,     // Maximum 60 seconden
            backBufferLength: 10,       // Keep 10 sec achter je voor terug spoelen
            
            // ✅ Adaptive bitrate - laat hls.js automatisch kiezen
            startLevel: -1,             // Auto kwaliteit
            capLevelToPlayerSize: true, // Schaal op basis van player grootte
            
            // ✅ Fragment loading - normale timeouts
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 4,
            fragLoadingRetryDelay: 1000,
            
            // ✅ Manifest loading
            manifestLoadingTimeOut: 10000,
            manifestLoadingMaxRetry: 3,
            
            // ✅ Progressive loading
            progressive: true,
            startFragPrefetch: true,
            
            // ✅ Stall handling
            maxBufferHole: 0.5,
            maxStarvationDelay: 4,
            nudgeMaxRetry: 3,
            
            // ✅ ABR tuning - laat het automatisch werken
            abrEwmaDefaultEstimate: 500000, // 500 kbps start estimate
            abrBandWidthFactor: 0.95,       // 95% van bandwidth gebruiken
            abrBandWidthUpFactor: 0.7,      // Voorzichtig omhoog
            
            // Debug uit in productie
            debug: false,
          });
          
          hlsRef.current = hls;

          // ✅ Error handling - simpel en effectief
          hls.on(Hls.Events.ERROR, (_e: any, data: any) => {
            if (!data || !data.fatal) return;
            
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, attempting recovery...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, attempting recovery...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal error:', data);
                setErrorMsg('Kan video niet afspelen');
                break;
            }
          });

          hls.loadSource(src);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, async () => {
            setIsBuffering(false);
            // Alleen autoplay op desktop
            if (autoPlay && !isMobileViewport) {
              try {
                await video.play();
              } catch (e) {
                console.log('Autoplay prevented');
              }
            }
          });

        } else {
          // Fallback
          video.src = src;
          if (autoPlay && !isMobileViewport) {
            await video.play().catch(() => {});
          }
          setIsBuffering(false);
        }
      } catch (err: any) {
        setErrorMsg(`Kan video niet laden: ${err?.message || String(err)}`);
        setIsBuffering(false);
      }
    };

    setup();

    // ✅ Eenvoudige event handlers - geen complexe interventies
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
          </div>
        </div>
      )}
    </div>
  );
}
