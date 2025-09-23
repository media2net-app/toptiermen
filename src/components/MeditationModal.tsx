'use client';

import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaVolumeUp, FaVolumeMute, FaTimes } from 'react-icons/fa';

interface MeditationModalProps {
  isOpen: boolean;
  onClose: () => void;
  meditation?: {
    id: string;
    title: string;
    type: string;
    duration: number;
    description: string;
    audioUrl?: string;
  } | null;
  session?: {
    id: string;
    title: string;
    type: string;
    duration: number;
    description: string;
    audioUrl?: string;
  } | null;
}

export default function MeditationModal({ isOpen, onClose, session, meditation }: MeditationModalProps) {
  const currentSession = session || meditation;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentSession) {
      setDuration(currentSession.duration * 60); // Convert minutes to seconds
      setCurrentTime(0);
      setProgress(0);
    }
  }, [currentSession]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          setProgress((newTime / duration) * 100);
          
          if (newTime >= duration) {
            setIsPlaying(false);
            // Session completed
            onClose();
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTime, duration, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isOpen || !currentSession) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{currentSession.title}</h2>
            <p className="text-sm text-gray-600">{currentSession.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Meditation Content */}
        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Meditation Visualization */}
          <div className="mb-6">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <div className={`w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ${
                isPlaying ? 'animate-pulse' : ''
              }`}></div>
            </div>
            <p className="text-center text-gray-600">
              {isPlaying ? 'Focus op je ademhaling...' : 'Klaar om te beginnen?'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={handleStop}
              className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              <FaStop />
            </button>
            
            <button
              onClick={handlePlayPause}
              className={`p-4 rounded-full text-white transition-colors ${
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleMute}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600 w-8">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Session Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Type: {currentSession.type}</span>
              <span>Duur: {currentSession.duration} min</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Sluiten
            </button>
            <button
              onClick={() => {
                // Mark session as completed
                onClose();
              }}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Voltooi Sessie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}