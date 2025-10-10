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
  src: string; // master .m3u8
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
  const [levels, setLevels] = useState<Array<{ index: number; height?: number; bitrate?: number }>>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 = Auto
  const stallTimerRef = useRef<NodeJS.Timeout | null>(null);
  const seekTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stallCountRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);
  const restoreAutoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [qoe, setQoe] = useState<{effective?: string; bitrateKbps?: number; height?: number}>({});
  const [isMobile, setIsMobile] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Detect mobile viewport and Android
    const checkMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
    const checkAndroid = () => typeof window !== 'undefined' && /Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile());
    setIsAndroid(checkAndroid());

    let destroyed = false;

    const setup = async () => {
      setErrorMsg(null);
      setIsBuffering(true);

      // If native HLS is supported (Safari/iOS), use it directly
      const canPlayNative = video.canPlayType('application/vnd.apple.mpegurl');
      if (canPlayNative) {
        video.src = src;
        // Only autoplay if explicitly requested AND not on mobile
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
          // Connection-aware tuning
          const effectiveType = (navigator as any)?.connection?.effectiveType as string | undefined;
          const isMobileViewport = typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false;
          
          // 🚀 MOBILE OPTIMALISATIE: Balans tussen snelle start en smooth playback
          // 🤖 ANDROID FIX: Conservatievere buffer strategie om video freeze te voorkomen
          const isAndroidDevice = /Android/i.test(navigator.userAgent);
          const maxBufferLength = isAndroidDevice ? 15 : (isMobileViewport ? 20 : 30);
          const maxMaxBufferLength = isAndroidDevice ? 30 : (isMobileViewport ? 40 : 60);
          const backBufferLength = isAndroidDevice ? 5 : (isMobileViewport ? 10 : 20);
          
          // Progressieve buffer strategy: start met weinig, bouw op tijdens playback
          const initialMaxBufferLength = isAndroidDevice ? 3 : (isMobileViewport ? 5 : 10);

          const hls = new Hls({
            // VOD tuning for responsive seeks
            lowLatencyMode: false,
            enableWorker: true,
            capLevelToPlayerSize: true,
            backBufferLength,
            maxBufferLength: initialMaxBufferLength, // Start met lage buffer voor snelle start
            maxMaxBufferLength,
            maxBufferHole: 0.5, // Accepteer kleine gaten zonder stall
            maxStarvationDelay: 4, // Geef meer tijd voor buffering voordat stalling wordt gerapporteerd
            nudgeMaxRetry: 5, // Meer retries voor betere recovery
            startPosition: -1,
            startLevel: -1, // Auto kwaliteit vanaf start
            // ABR smoothing - agressiever op mobiel voor snelle aanpassing
            abrEwmaFastVoD: isMobileViewport ? 3.0 : 2.0, // Snellere response op bandwidth changes
            abrEwmaSlowVoD: isMobileViewport ? 7.0 : 9.0, // Snellere averaging
            abrBandWidthFactor: 0.8, // Conservatief: 80% van gemeten bandwidth
            abrBandWidthUpFactor: 0.7, // Voorzichtiger omhoog schalen
            // Retry/timeout tuning - langere timeouts voor mobiel netwerk
            fragLoadingTimeOut: isMobileViewport ? 12000 : 8000, // Meer tijd voor mobiele netwerken
            fragLoadingMaxRetry: 6, // Meer retries
            fragLoadingRetryDelay: 1000,
            manifestLoadingMaxRetry: 4,
            appendErrorMaxRetry: 3,
            // Progressief laden met prefetch
            progressive: true,
            startFragPrefetch: true,
            testBandwidth: true,
            // Debug logging (production-safe)
            debug: false,
            // Bandwidth estimation
            enableSoftwareAES: true, // Voor encrypted content
          });
          hlsRef.current = hls;

          hls.on(Hls.Events.ERROR, (_e: any, data: any) => {
            if (!data) return;
            if (data.details === 'bufferStalledError') {
              setIsBuffering(true);
            }
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  setErrorMsg('Netwerkfout, opnieuw proberen...');
                  try { hls.startLoad(); } catch {}
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  setErrorMsg('Mediafout, herstellen...');
                  try { hls.recoverMediaError(); } catch {}
                  break;
                default:
                  setErrorMsg('Onherstelbare fout, speler reset...');
                  try { hls.destroy(); } catch {}
                  break;
              }
            }
          });

          hls.on(Hls.Events.BUFFER_STALLED_ERROR, () => setIsBuffering(true));
          hls.on(Hls.Events.BUFFER_APPENDED, () => setIsBuffering(false));

          hls.on(Hls.Events.FRAG_LOADED, (_: any, data: any) => {
            // Update QoE bitrate/height if available
            try {
              const lvl = hls.levels?.[hls.currentLevel] || null;
              setQoe({
                effective: (navigator as any)?.connection?.effectiveType,
                bitrateKbps: lvl?.bitrate ? Math.round(lvl.bitrate / 1000) : undefined,
                height: lvl?.height,
              });
            } catch {}
          });

          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, async () => {
            try {
              const ls = (hls.levels || []).map((l: any, idx: number) => ({ index: idx, height: l.height, bitrate: l.bitrate }));
              setLevels(ls);
              setCurrentLevel(hls.currentLevel ?? -1);
              
              // Smart start level selection gebaseerd op netwerk en device
              if (effectiveType && ['slow-2g','2g'].includes(effectiveType)) {
                // Zeer trage netwerken: start met 360p of lager
                const idx = ls.findIndex(l => (l.height || 0) >= 360);
                const target = idx !== -1 ? idx : 0;
                hls.autoLevelEnabled = false;
                hls.currentLevel = target;
                setCurrentLevel(target);
              } else if (isMobileViewport && effectiveType === '3g') {
                // 3G mobiel: start met 480p of lager voor snelle start
                const idx = ls.findIndex(l => (l.height || 0) <= 480 && (l.height || 0) >= 360);
                if (idx !== -1) {
                  hls.autoLevelEnabled = false;
                  hls.currentLevel = idx;
                  setCurrentLevel(idx);
                  // Na 10 seconden auto mode aanzetten voor upgrade
                  setTimeout(() => {
                    if (hlsRef.current) hlsRef.current.autoLevelEnabled = true;
                  }, 10000);
                }
              } else if (isMobileViewport) {
                // 4G/5G mobiel: start met 720p of lager voor balans
                const idx = ls.findIndex(l => (l.height || 0) <= 720 && (l.height || 0) >= 480);
                if (idx !== -1) {
                  hls.currentLevel = idx;
                  setCurrentLevel(idx);
                }
              }
              // Anders: laat HLS.js auto kwaliteit kiezen
            } catch {}
            
            // 🚀 PROGRESSIEVE BUFFER STRATEGY
            // Na 5 seconden playback: verhoog max buffer voor smooth ervaring
            setTimeout(() => {
              if (hlsRef.current && !video.paused) {
                try {
                  hlsRef.current.config.maxBufferLength = maxBufferLength;
                } catch {}
              }
            }, 5000);
            
            // Direct starten bij autoPlay (maar niet op mobiel)
            if (autoPlay && !isMobile) {
              try { 
                await video.play(); 
                setIsBuffering(false);
              } catch (e) {
                console.log('Autoplay prevented:', e);
                setIsBuffering(false);
              }
            } else {
              setIsBuffering(false);
            }
          });

          hls.on(Hls.Events.LEVEL_SWITCHED, (_: any, data: any) => {
            setCurrentLevel(typeof data?.level === 'number' ? data.level : -1);
            try {
              const lvl = hls.levels?.[data.level] || null;
              setQoe(prev => ({ ...prev, bitrateKbps: lvl?.bitrate ? Math.round(lvl.bitrate/1000) : prev.bitrateKbps, height: lvl?.height ?? prev.height }));
            } catch {}
          });
        } else {
          // Fallback: try setting src directly
          video.src = src;
          // Only autoplay if explicitly requested AND not on mobile
          if (autoPlay && !isMobile) {
            await video.play().catch(() => {});
          }
          setIsBuffering(false);
        }
      } catch (err: any) {
        setErrorMsg(`hls.js init failed: ${err?.message || String(err)}`);
      }
    };

    setup();

    const onWaiting = () => {
      setIsBuffering(true);
      // Stall watchdog: geef meer tijd op mobiel voor network variabiliteit
      const stallDelay = isMobile ? 2000 : 2500;
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      stallTimerRef.current = setTimeout(() => {
        const hls = hlsRef.current;
        try {
          stallCountRef.current += 1;
          // Alleen kwaliteit verlagen na meerdere stalls (niet bij eerste)
          if (hls && typeof hls.currentLevel === 'number' && stallCountRef.current > 1) {
            if (hls.autoLevelEnabled) hls.autoLevelEnabled = false;
            const next = Math.max(0, (hls.currentLevel ?? 0) - 1);
            hls.currentLevel = next;
            setCurrentLevel(next);
          }
          // Nudge decoder om kleine buffer holes over te slaan
          if (video && !video.paused) {
            const t = video.currentTime;
            video.currentTime = t + 0.1; // Iets grotere skip
          }
          // Herstart loading als het gepauzeerd was
          hls?.startLoad?.();
        } catch {}
      }, stallDelay);
    };
    const onCanPlay = () => {
      setIsBuffering(false);
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      // After resume, restore auto-level if we previously forced a cap (sneller op mobiel)
      const restoreDelay = isMobile ? 1000 : 2000;
      if (restoreAutoTimerRef.current) clearTimeout(restoreAutoTimerRef.current);
      restoreAutoTimerRef.current = setTimeout(() => {
        try {
          if (hlsRef.current && hlsRef.current.autoLevelEnabled === false) {
            hlsRef.current.autoLevelEnabled = true;
          }
        } catch {}
      }, restoreDelay);
    };
    const onPlaying = () => {
      setIsBuffering(false);
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      // Reset stall counter na 10 seconden smooth playback
      setTimeout(() => {
        stallCountRef.current = 0;
      }, 10000);
      
      // 🤖 ANDROID FIX: Watchdog om frozen frames te detecteren
      // Android kan soms audio blijven afspelen terwijl video frames bevriezen
      if (isAndroid && video && !video.paused) {
        let lastTime = video.currentTime;
        const frameCheckInterval = setInterval(() => {
          if (video.paused) {
            clearInterval(frameCheckInterval);
            return;
          }
          const currentTime = video.currentTime;
          // Als tijd niet vooruit gaat maar video niet gepauzeerd is = frozen frames
          if (Math.abs(currentTime - lastTime) < 0.01) {
            console.log('[Android Fix] Frozen frames detected, restarting playback...');
            // Force refresh door tiny seek
            video.currentTime = currentTime + 0.01;
            try { hlsRef.current?.startLoad?.(); } catch {}
          }
          lastTime = currentTime;
        }, 2000); // Check elke 2 seconden
        
        // Cleanup na 30 seconden (als video smooth loopt)
        setTimeout(() => clearInterval(frameCheckInterval), 30000);
      }
    };
    const onSeeking = () => {
      setIsBuffering(true);
      // Pause fragment loading during seek to jump faster
      try { hlsRef.current?.stopLoad?.(); } catch {}
      // Detect backward seeks and temporarily cap quality low for fast resume
      const newT = video.currentTime;
      const oldT = prevTimeRef.current || 0;
      const delta = newT - oldT;
      if (delta < -8) {
        const hls = hlsRef.current;
        try {
          if (hls) {
            hls.autoLevelEnabled = false;
            // pick a conservative level (360p or lowest)
            const ls = hls.levels || [];
            const targetIdx = ls.findIndex((l: any) => (l?.height || 0) >= 360);
            const idx = targetIdx !== -1 ? targetIdx : 0;
            hls.currentLevel = idx;
            setCurrentLevel(idx);
            // Restore auto a few seconds after playback resumes (done in onCanPlay)
          }
        } catch {}
      }
      prevTimeRef.current = newT;
      if (seekTimerRef.current) clearTimeout(seekTimerRef.current);
      seekTimerRef.current = setTimeout(() => {
        try { hlsRef.current?.startLoad?.(); } catch {}
      }, 250);
    };
    const onSeeked = () => {
      // Resume loading after seek position is committed
      try { hlsRef.current?.startLoad?.(); } catch {}
      setIsBuffering(false);
    };

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('seeking', onSeeking);
    video.addEventListener('seeked', onSeeked);

    return () => {
      destroyed = true;
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      if (seekTimerRef.current) clearTimeout(seekTimerRef.current);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('seeked', onSeeked);
      try { hlsRef.current?.destroy?.(); } catch {}
      if (restoreAutoTimerRef.current) clearTimeout(restoreAutoTimerRef.current);
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
        preload={isAndroid ? "none" : (isMobile ? "metadata" : "auto")}
        crossOrigin="anonymous"
        webkit-playsinline="true"
        // 🤖 ANDROID FIX: Force software decoding hint om hardware decoder freeze te voorkomen
        {...(isAndroid ? {
          'x5-video-player-type': 'h5',
          'x5-video-player-fullscreen': 'true',
          'x5-video-orientation': 'portraint',
          'controlsList': 'nodownload'
        } : {})}
      />

      {/* QoE overlay (debug) removed */}

      {/* Quality selector removed */}

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
            <div className="mb-2">Kan video niet afspelen</div>
            <div className="opacity-80">{errorMsg}</div>
          </div>
        </div>
      )}
    </div>
  );
}
