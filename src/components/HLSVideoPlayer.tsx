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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Detect mobile viewport
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
        await video.play().catch(() => {});
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
          
          // 🔧 MOBIEL OPTIMALISATIE: KLEINERE buffer voor directe start (net zoals PC)
          const maxBufferLength = isMobileViewport ? 8 : 15; // Minder vooruit bufferen op mobiel
          const maxMaxBufferLength = isMobileViewport ? 30 : 60; // Beperkte buffer capaciteit

          const hls = new Hls({
            // VOD tuning for responsive seeks
            lowLatencyMode: false,
            enableWorker: true,
            capLevelToPlayerSize: true,
            backBufferLength: 20,
            maxBufferLength,
            maxMaxBufferLength,
            maxBufferHole: 0.5,
            maxStarvationDelay: 2,
            nudgeMaxRetry: 3,
            startPosition: -1,
            startLevel: -1, // Auto kwaliteit vanaf start
            // ABR smoothing - zelfde als PC voor snelle keuze
            abrEwmaFastVoD: 2.0,
            abrEwmaSlowVoD: 9.0,
            // Retry/timeout tuning
            fragLoadingTimeOut: 8000,
            fragLoadingRetryDelay: 500,
            appendErrorMaxRetry: 2,
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
              // Choose conservative start level ONLY on very slow networks
              if (effectiveType && ['slow-2g','2g'].includes(effectiveType)) {
                // pick lowest available level >= 360p
                const idx = ls.findIndex(l => (l.height || 0) >= 360);
                const target = idx !== -1 ? idx : 0;
                hls.autoLevelEnabled = false;
                hls.currentLevel = target;
                setCurrentLevel(target);
              }
              // 🔧 MOBIEL: Laat HLS.js auto kwaliteit kiezen, geen forcering
            } catch {}
            
            // 🔧 DIRECT STARTEN: Geen wachten op buffer, net zoals PC
            if (autoPlay) {
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
          await video.play().catch(() => {});
          setIsBuffering(false);
        }
      } catch (err: any) {
        setErrorMsg(`hls.js init failed: ${err?.message || String(err)}`);
      }
    };

    setup();

    const onWaiting = () => {
      setIsBuffering(true);
      // Stall watchdog: after 2500ms (meer geduld), auto downshift and nudge
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      stallTimerRef.current = setTimeout(() => {
        const hls = hlsRef.current;
        try {
          stallCountRef.current += 1;
          // Prefer lowering one level; if auto enabled, disable to force stability
          if (hls && typeof hls.currentLevel === 'number') {
            if (hls.autoLevelEnabled) hls.autoLevelEnabled = false;
            const next = Math.max(0, (hls.currentLevel ?? 0) - 1);
            hls.currentLevel = next;
            setCurrentLevel(next);
          }
          // Nudge decoder to skip small buffer holes
          if (video && !video.paused) {
            const t = video.currentTime;
            video.currentTime = t + 0.05;
          }
          // Restart loading if it was paused
          hls?.startLoad?.();
        } catch {}
      }, 2500);
    };
    const onCanPlay = () => {
      setIsBuffering(false);
      // After resume, restore auto-level if we previously forced a cap
      if (restoreAutoTimerRef.current) clearTimeout(restoreAutoTimerRef.current);
      restoreAutoTimerRef.current = setTimeout(() => {
        try {
          if (hlsRef.current && hlsRef.current.autoLevelEnabled === false) {
            hlsRef.current.autoLevelEnabled = true;
          }
        } catch {}
      }, 2000);
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
    video.addEventListener('seeking', onSeeking);
    video.addEventListener('seeked', onSeeked);

    return () => {
      destroyed = true;
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      if (seekTimerRef.current) clearTimeout(seekTimerRef.current);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
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
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
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
