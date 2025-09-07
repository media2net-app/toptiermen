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

interface PublicVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  videoUrl: string;
  description?: string;
}

export default function PublicVideoModal({ 
  isOpen, 
  onClose, 
  videoTitle, 
  videoUrl,
  description 
}: PublicVideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setShowVideoOverlay(true);
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

  const handlePlay = () => {
    setShowVideoOverlay(false);
    setIsPlaying(true);
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
                <h2 className="text-2xl font-bold text-white">{videoTitle}</h2>
                {description && (
                  <p className="text-[#8BAE5A]">{description}</p>
                )}
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
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover"
                preload="auto"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnd}
                onPlay={handlePlay}
                onCanPlay={() => {
                  console.log('🎥 Public video can start playing:', videoUrl);
                }}
                muted={isMuted}
              />
              
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
                    <p className="text-white text-sm font-medium">Klik om video af te spelen</p>
                  </div>
                </div>
              )}
              
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
            </div>

            {/* Footer */}
            <div className="p-6 bg-[#181F17] border-t border-[#3A4D23]">
              <div className="flex justify-between items-center">
                <p className="text-gray-400 text-sm">
                  Deze video is beschikbaar voor alle bezoekers
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
