'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  PlayIcon, 
  CheckIcon,
  ArrowRightIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/auth-systems/optimal/useAuth';
import { toast } from 'react-hot-toast';

interface TestUserVideoModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function TestUserVideoModal({ isOpen, onComplete }: TestUserVideoModalProps) {
  const { user } = useAuth();
  const [videoWatched, setVideoWatched] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setVideoWatched(false);
      setShowVideoOverlay(true);
      setLoading(false);
    }
  }, [isOpen]);

  const handleVideoComplete = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Mark test video as watched by setting current_step to 1
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'watch_welcome_video',
          step: 0
        }),
      });

      if (response.ok) {
        toast.success('Test video bekeken! Je kunt nu beginnen met onboarding.');
        onComplete();
      } else {
        throw new Error('Failed to update test video status');
      }
    } catch (error) {
      console.error('Error updating test video status:', error);
      toast.error('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181F17] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Welkom Test Gebruiker!</h1>
                <p className="text-[#8BAE5A] text-sm">Bekijk eerst deze speciale video</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-4">
                🧪 Test Gebruiker Welkomstvideo
              </h3>
              <p className="text-[#8BAE5A]">
                Als test gebruiker krijg je eerst deze speciale video te zien voordat je begint met het onboarding proces.
              </p>
            </div>

            <div className="bg-[#232D1A] rounded-xl p-4 mb-6 border border-[#3A4D23] relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                controls
                preload="metadata"
                onEnded={() => setVideoWatched(true)}
                onPlay={() => setShowVideoOverlay(false)}
              >
                <source src="/testgebruikers-v2.mp4" type="video/mp4" />
                Je browser ondersteunt geen video afspelen.
              </video>
              
              {/* Video Play Overlay */}
              {showVideoOverlay && (
                <div 
                  className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer group rounded-lg"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.play();
                    }
                  }}
                >
                  <div className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#181F17] rounded-full p-4 transition-all duration-200 group-hover:scale-110 shadow-lg">
                    <PlayIcon className="w-12 h-12" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-white text-sm font-medium">Klik om test video af te spelen</p>
                  </div>
                </div>
              )}
            </div>

            {videoWatched && (
              <div className="mb-6 p-4 bg-[#8BAE5A]/10 border border-[#8BAE5A] rounded-lg">
                <p className="text-[#8BAE5A] flex items-center gap-2 justify-center">
                  <CheckIcon className="w-5 h-5" />
                  Test video bekeken - Klik op "Start Onboarding" om door te gaan
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleVideoComplete}
                disabled={loading || !videoWatched}
                className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] px-8 py-3 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] disabled:opacity-50 font-semibold transition-all duration-200 flex items-center gap-2"
              >
                {loading ? 'Bezig...' : 'Start Onboarding'}
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Test User Notice */}
            <div className="mt-8 p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                    <span className="text-[#FFD700] text-sm font-bold">🧪</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-[#FFD700] font-semibold mb-1">Test Gebruiker Modus</h4>
                  <p className="text-[#B6C948] text-sm">
                    Je bent ingelogd als test gebruiker. Na deze video ga je door het normale onboarding proces 
                    zoals elke nieuwe gebruiker. Alle functionaliteiten zijn beschikbaar voor testing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
