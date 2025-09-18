'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { useRouter } from 'next/navigation';

export default function WelcomeVideoPage() {
  const { user } = useSupabaseAuth();
  const { completeStep } = useOnboardingV2();
  const router = useRouter();
  const [videoWatched, setVideoWatched] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = async () => {
    setVideoWatched(true);
  };

  const handleNext = async () => {
    if (!videoWatched) return;
    
    setLoading(true);
    try {
      await completeStep(0);
      router.push('/dashboard/profiel');
    } catch (error) {
      console.error('Error completing welcome video step:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181F17]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Authenticatie Vereist
          </h2>
          <p className="text-[#8BAE5A]/70">
            Je moet ingelogd zijn om deze pagina te bekijken.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">
              Welkom bij Top Tier Men! 🎉
            </h1>
            <p className="text-[#8BAE5A]/70 text-lg">
              Bekijk deze welkomstvideo om te beginnen met je journey naar een betere versie van jezelf.
            </p>
          </div>

          {/* Video Instruction - Moved above video */}
          <div className="mb-6 p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-[#FFD700] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-[#FFD700] font-semibold text-sm mb-1">Belangrijke instructie</h4>
                <p className="text-[#FFD700]/80 text-sm">
                  Je moet eerst de welkomstvideo volledig bekijken voordat je naar de volgende stap kunt gaan. 
                  De knop wordt pas beschikbaar nadat de video is afgespeeld.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black rounded-lg overflow-hidden mb-6">
            <video
              ref={videoRef}
              className="w-full h-auto"
              controls
              preload="auto"
              playsInline
              onEnded={handleVideoEnd}
              poster="/welkom-v2-poster.jpg"
              onLoadedData={() => {
                console.log('📺 Welcome video data loaded, ready for smooth playback');
              }}
              onProgress={() => {
                // Log buffering progress for debugging
                if (videoRef.current) {
                  const buffered = videoRef.current.buffered;
                  if (buffered.length > 0) {
                    const bufferedEnd = buffered.end(buffered.length - 1);
                    const duration = videoRef.current.duration;
                    const bufferedPercent = (bufferedEnd / duration) * 100;
                    console.log(`📺 Video buffered: ${bufferedPercent.toFixed(1)}%`);
                  }
                }
              }}
              onSeeking={() => {
                console.log('📺 User seeking video, ensuring smooth playback');
              }}
              onSeeked={() => {
                console.log('📺 Seek completed, video ready to play');
              }}
            >
              <source src="/welkom-v2.mp4" type="video/mp4" />
              <source src="/welkom.mp4" type="video/mp4" />
              <p className="text-white p-4">
                Je browser ondersteunt geen video element. 
                <a href="/welkom-v2.mp4" className="text-[#8BAE5A] underline">
                  Download de video hier
                </a>
              </p>
            </video>
          </div>

          <div className="text-center">
            {videoWatched ? (
              <button
                onClick={handleNext}
                disabled={loading}
                className="w-full px-8 py-4 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#181F17]"></div>
                    Bezig...
                  </div>
                ) : (
                  'Volgende Stap'
                )}
              </button>
            ) : (
              <p className="text-[#8BAE5A]/70">
                Bekijk de video volledig om door te gaan naar de volgende stap.
              </p>
            )}
          </div>

          <div className="mt-8 p-4 bg-[#3A4D23]/20 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Wat kun je verwachten?</h3>
            <ul className="text-[#8BAE5A]/70 space-y-1">
              <li>• Persoonlijke profiel setup</li>
              <li>• Uitdagingen selecteren die bij je passen</li>
              <li>• Trainingsschema kiezen</li>
              <li>• Voedingsplan bepalen</li>
              <li>• Challenge selecteren</li>
              <li>• Introductie aan de Brotherhood community</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
