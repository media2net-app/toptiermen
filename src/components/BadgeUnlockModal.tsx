'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BadgeUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: {
    name?: string;
    title?: string;
    icon?: string;
    icon_name?: string;
    image?: string;
    image_url?: string;
    description?: string;
  };
  hasUnlockedBadge?: boolean;
}

export default function BadgeUnlockModal({ 
  isOpen, 
  onClose, 
  badge, 
  hasUnlockedBadge = false 
}: BadgeUnlockModalProps) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Initialize audio with a simple beep sound
  useEffect(() => {
    try {
      // Create a simple beep sound using a data URL
      const audioElement = new Audio();
      
      // Create an unlock sound using the whoosh audio file
      const createUnlockSound = async () => {
        try {
          // Create audio element with the whoosh sound
          const whooshAudio = new Audio('/whoosh-cinematic-sound-effect-376889.mp3');
          whooshAudio.volume = 0.4; // Set volume to 40%
          
          // Play the whoosh sound
          await whooshAudio.play();
          console.log('🌪️ Whoosh unlock sound played successfully');
        } catch (error) {
          console.log('Could not play whoosh sound:', error);
          // Fallback: Try to create a simple beep if whoosh fails
          try {
            const fallbackAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            fallbackAudio.volume = 0.3;
            await fallbackAudio.play();
            console.log('🔓 Fallback unlock sound played');
          } catch (fallbackError) {
            console.log('🔇 Audio playback failed, continuing without sound');
          }
        }
      };
      
      // Override the play method to create unlock sound on demand
      audioElement.play = createUnlockSound;
      
      setAudio(audioElement);
    } catch (error) {
      console.log('Audio not available, continuing without sound');
    }
  }, []);

  // Auto-close after 4 seconds
  useEffect(() => {
    if (isOpen && !hasUnlockedBadge) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, hasUnlockedBadge, onClose]);

  // Play sound and animation on open
  useEffect(() => {
    if (isOpen && audio && !hasPlayed) {
      const playAudio = async () => {
        try {
          console.log('🔊 Attempting to play audio...');
          await audio.play();
          setHasPlayed(true);
          console.log('✅ Audio play called successfully');
        } catch (error) {
          console.log('❌ Could not play audio:', error);
        }
      };
      playAudio();
    }
  }, [isOpen, audio, hasPlayed]);

  // Reset hasPlayed when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasPlayed(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-[#181F17] border border-[#3A4D23] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Badge Icon with Animation */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0.3, rotate: 0 }}
                animate={{ 
                  scale: [0.3, 1.5, 1],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 1.5,
                  ease: "easeOut",
                  times: [0, 0.7, 1]
                }}
                className="relative"
              >
                {/* Glow effect */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.8, 2, 3] }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-full blur-xl"
                />
                
                {/* Badge icon/image */}
                <div className="relative z-10 flex items-center justify-center shadow-lg">
                  {(badge.image || badge.image_url) ? (
                    <img 
                      src={badge.image || badge.image_url} 
                      alt={badge.name || badge.title || 'Badge'}
                      className="max-w-[200px] max-h-[200px] w-auto h-auto object-contain drop-shadow-lg"
                      style={{ 
                        width: 'auto', 
                        height: 'auto',
                        maxWidth: '200px',
                        maxHeight: '200px'
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-full flex items-center justify-center border-4 border-white/20">
                      <span className="text-4xl">{badge.icon || badge.icon_name || '🏆'}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-[#8BAE5A] mb-2">
                Gefeliciteerd!
              </h2>
              <p className="text-white text-lg mb-2">
                Je hebt de badge <span className="font-semibold text-[#B6C948]">'{badge.name || badge.title || 'Onbekende Badge'}'</span> verdiend!
              </p>
              {badge.description && (
                <p className="text-gray-400 text-sm">
                  {badge.description}
                </p>
              )}
            </motion.div>

            {/* Sparkle effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.random() * 400 - 200,
                    y: Math.random() * 400 - 200
                  }}
                  transition={{ 
                    delay: 0.8 + i * 0.1,
                    duration: 1.5,
                    ease: "easeOut"
                  }}
                  className="absolute w-2 h-2 bg-[#B6C948] rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + i * 10}%`
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 