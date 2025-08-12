'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PlayIcon, 
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';
import { getCDNVideoUrl } from '@/lib/cdn-config';

interface WorkoutVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  videoUrl?: string;
  exerciseDetails?: {
    sets: number;
    reps: string;
    rest: string;
    notes?: string;
  };
}

export default function WorkoutVideoModal({ 
  isOpen, 
  onClose, 
  exerciseName, 
  videoUrl,
  exerciseDetails 
}: WorkoutVideoModalProps) {
  console.log('🎬 WorkoutVideoModal render:', { isOpen, exerciseName, videoUrl });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl bg-[#181F17] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-[#232D1A] border-b border-[#3A4D23]">
              <div>
                <h2 className="text-2xl font-bold text-white">{exerciseName}</h2>
                <p className="text-[#8BAE5A]">Workout Video Tutorial</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video bg-black">
              {videoUrl && videoUrl !== 'undefined' ? (
                <>
                  <video
                    ref={videoRef}
                    src={getCDNVideoUrl(videoUrl)}
                    className="w-full h-full object-cover"
                    preload="auto"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleVideoEnd}
                    onCanPlay={() => {
                      console.log('🎥 Workout video can start playing');
                    }}
                    muted={isMuted}
                  />
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <input
                          type="range"
                          min="0"
                          max={duration || 0}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #8BAE5A 0%, #8BAE5A ${(currentTime / (duration || 1)) * 100}%, #4A5568 ${(currentTime / (duration || 1)) * 100}%, #4A5568 100%)`
                          }}
                        />
                        <div className="flex justify-between text-sm text-white mt-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={togglePlay}
                            className="p-2 bg-[#8BAE5A] rounded-full hover:bg-[#7A9D4A] transition-colors"
                          >
                            {isPlaying ? (
                              <PauseIcon className="w-6 h-6 text-white" />
                            ) : (
                              <PlayIcon className="w-6 h-6 text-white" />
                            )}
                          </button>
                          
                          <button
                            onClick={toggleMute}
                            className="p-2 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors"
                          >
                            {isMuted ? (
                              <SpeakerXMarkIcon className="w-5 h-5 text-white" />
                            ) : (
                              <SpeakerWaveIcon className="w-5 h-5 text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-[#3A4D23] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Geen video beschikbaar</h3>
                    <p className="text-gray-400">Er is nog geen video tutorial voor deze oefening</p>
                    <p className="text-gray-500 text-sm mt-2">Bekijk de oefening details hieronder voor instructies</p>
                  </div>
                </div>
              )}
            </div>

            {/* Exercise Details */}
            {exerciseDetails && (
              <div className="p-6 bg-[#232D1A]">
                <h3 className="text-lg font-semibold text-white mb-4">Oefening Details</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-[#181F17] rounded-lg">
                    <div className="text-2xl font-bold text-[#8BAE5A]">{exerciseDetails.sets}</div>
                    <div className="text-sm text-gray-400">Sets</div>
                  </div>
                  <div className="text-center p-3 bg-[#181F17] rounded-lg">
                    <div className="text-2xl font-bold text-[#FFD700]">{exerciseDetails.reps}</div>
                    <div className="text-sm text-gray-400">Reps</div>
                  </div>
                  <div className="text-center p-3 bg-[#181F17] rounded-lg">
                    <div className="text-2xl font-bold text-[#f0a14f]">{exerciseDetails.rest}</div>
                    <div className="text-sm text-gray-400">Rust</div>
                  </div>
                </div>
                
                {exerciseDetails.notes && (
                  <div className="p-4 bg-[#181F17] rounded-lg">
                    <h4 className="font-semibold text-[#8BAE5A] mb-2">Notities</h4>
                    <p className="text-gray-300 text-sm">{exerciseDetails.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="p-6 bg-[#181F17] border-t border-[#3A4D23]">
              <div className="flex justify-between items-center">
                <p className="text-gray-400 text-sm">
                  Bekijk de video aandachtig voor de juiste uitvoering
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-[#8BAE5A] text-white font-semibold rounded-lg hover:bg-[#7A9D4A] transition-colors"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
