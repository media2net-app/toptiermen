'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useRouter } from 'next/navigation';

export default function WelcomeVideoPage() {
  const { user } = useSupabaseAuth();
  const { completeCurrentStep } = useOnboarding();
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
      await completeCurrentStep();
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
                className="px-8 py-4 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
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
