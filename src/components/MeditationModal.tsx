'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlay, 
  FaPause, 
  FaStop, 
  FaVolumeUp, 
  FaVolumeMute,
  FaClock,
  FaHeart,
  FaTimes
} from 'react-icons/fa';

interface MeditationModalProps {
  isOpen: boolean;
  onClose: () => void;
  meditation: {
    id: number;
    title: string;
    speaker: string;
    duration: number;
    type: string;
    description: string;
    audioUrl: string;
  } | null;
}

export default function MeditationModal({ isOpen, onClose, meditation }: MeditationModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && meditation) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(meditation.duration * 60); // Convert minutes to seconds
      setIsFavorite(meditation.id === 1 || meditation.id === 3); // Sample favorites
    }
  }, [isOpen, meditation]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isOpen || !meditation) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#0A0F0A] bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-[#181F17] border border-[#3A4D23] rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#8BAE5A]/20 rounded-lg">
                  <FaHeart className="w-5 h-5 text-[#8BAE5A]" />
                </div>
                <div>
                  <h2 className="text-[#B6C948] text-xl font-bold">{meditation.title}</h2>
                  <p className="text-[#8BAE5A] text-sm">door {meditation.speaker}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#3A4D23] rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Meditation Info */}
            <div className="bg-[#1A1A1A] border border-[#3A4D23] rounded-xl p-4 mb-6">
              <p className="text-gray-300 text-sm mb-3">{meditation.description}</p>
              <div className="flex items-center gap-4 text-[#8BAE5A]/70 text-sm">
                <span className="flex items-center gap-1">
                  <FaClock /> {meditation.duration} min
                </span>
                <span className="px-2 py-1 bg-[#3A4D23]/40 rounded-full text-xs">
                  {meditation.type}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-[#8BAE5A]/70 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="w-full bg-[#3A4D23] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={handleStop}
                className="p-3 bg-[#3A4D23] text-[#8BAE5A] rounded-full hover:bg-[#4A5D33] transition-colors"
              >
                <FaStop className="w-4 h-4" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className="p-4 bg-[#8BAE5A] text-[#181F17] rounded-full hover:bg-[#B6C948] transition-colors"
              >
                {isPlaying ? <FaPause className="w-6 h-6" /> : <FaPlay className="w-6 h-6" />}
              </button>
              
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-full transition-colors ${
                  isFavorite 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#4A5D33]'
                }`}
              >
                <FaHeart className="w-4 h-4" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleMute}
                className="p-2 hover:bg-[#3A4D23] rounded-lg transition-colors"
              >
                {isMuted ? <FaVolumeMute className="w-4 h-4 text-[#8BAE5A]" /> : <FaVolumeUp className="w-4 h-4 text-[#8BAE5A]" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-[#3A4D23] rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[#8BAE5A] text-sm w-8">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            {/* Meditation Tips */}
            <div className="mt-6 p-4 bg-[#1A1A1A] border border-[#3A4D23] rounded-xl">
              <h4 className="text-[#B6C948] font-semibold mb-2">💡 Meditatie Tips</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Zoek een rustige plek zonder afleiding</li>
                <li>• Zit comfortabel met een rechte rug</li>
                <li>• Focus op je ademhaling</li>
                <li>• Laat gedachten komen en gaan zonder oordeel</li>
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
