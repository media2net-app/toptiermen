'use client';
import ClientLayout from '../../components/ClientLayout';
import PageLayout from '../../../components/PageLayout';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LockClosedIcon } from '@heroicons/react/24/solid';

const modules = [
  {
    title: 'Discipline & Identiteit',
    description: 'Ontwikkel een onwankelbare identiteit en dagelijkse discipline.',
    progress: 100,
    href: '/dashboard/academy/discipline-identiteit',
    unlocked: true,
    completed: true,
  },
  {
    title: 'Fysieke Dominantie',
    description: 'Werk aan kracht, uithoudingsvermogen en fysieke gezondheid.',
    progress: 0,
    href: '/dashboard/academy/fysieke-dominantie',
    unlocked: false,
    completed: false,
  },
  {
    title: 'Mentale Weerbaarheid',
    description: 'Vergroot je mentale kracht en veerkracht.',
    progress: 0,
    unlocked: false,
    completed: false,
  },
  {
    title: 'Financiële Groei',
    description: 'Leer alles over geld, investeren en financiële vrijheid.',
    progress: 0,
    unlocked: false,
    completed: false,
  },
  {
    title: 'High Performance Lifestyle',
    description: 'Optimaliseer je routines voor maximale prestaties.',
    progress: 0,
    unlocked: false,
    completed: false,
  },
  {
    title: 'Broederschap',
    description: 'Bouw aan een sterk netwerk en accountability.',
    progress: 0,
    unlocked: false,
    completed: false,
  },
];

export default function MijnMissies() {
  const [animated, setAnimated] = useState(Array(modules.length).fill(0));
  const [unlockAnimation, setUnlockAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [moduleStates, setModuleStates] = useState(modules);

  useEffect(() => {
    // Check if we need to unlock Module 2
    const shouldUnlock = localStorage.getItem('unlockModule2');
    if (shouldUnlock === 'true') {
      // Clear the flag
      localStorage.removeItem('unlockModule2');
      
      // Start unlock animation
      setUnlockAnimation(true);
      setShowConfetti(true);
      
      // Update module states
      setModuleStates(prev => prev.map((mod, i) => 
        i === 1 ? { ...mod, unlocked: true, progress: 0 } : mod
      ));
      
      // Stop confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, []);

  useEffect(() => {
    moduleStates.forEach((mod, i) => {
      const end = mod.progress;
      const duration = 900;
      const step = () => {
        setAnimated((prev) => {
          const next = [...prev];
          if (next[i] < end) {
            next[i] = Math.min(next[i] + 2, end);
          }
          return next;
        });
      };
      if (animated[i] < end) {
        const interval = setInterval(step, duration / end);
        return () => clearInterval(interval);
      }
    });
  }, [animated, moduleStates]);

  return (
    <ClientLayout>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                fontSize: `${Math.max(16, Math.min(24, window.innerWidth / 20))}px`,
              }}
            >
              {['🎉', '🏆', '⭐', '🎊', '💎', '🔓'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      <PageLayout 
        title="Academy"
        subtitle="Overzicht van alle modules en jouw voortgang"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {moduleStates.map((mod, i) =>
            mod.unlocked ? (
              <Link
                key={mod.title}
                href={mod.href || '#'}
                className={`bg-[#181F17]/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-[#3A4D23] hover:border-[#8BAE5A]/40 flex flex-col gap-2 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] relative ${
                  unlockAnimation && i === 1 ? 'animate-pulse border-[#FFD700] shadow-[#FFD700]/50' : ''
                } active:scale-[0.98] touch-manipulation`}
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span className="flex items-center gap-1 sm:gap-2 text-lg sm:text-xl font-semibold text-[#8BAE5A]">
                    <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center font-bold text-base sm:text-lg mr-2 ${
                      mod.completed 
                        ? 'bg-[#8BAE5A] text-[#181F17] border-[#8BAE5A]' 
                        : 'bg-[#232D1A] border-[#8BAE5A]'
                    }`}>
                      {mod.completed ? '✓' : i+1}
                    </span>
                    {mod.title}
                  </span>
                  <span className="text-[#8BAE5A] font-mono text-xs sm:text-sm">{animated[i]}%</span>
                </div>
                <p className="text-[#A6C97B] mb-1 sm:mb-2 text-xs sm:text-sm line-clamp-2">{mod.description}</p>
                <div className="w-full h-1.5 sm:h-2 bg-[#8BAE5A]/20 rounded-full">
                  <div className="h-1.5 sm:h-2 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] rounded-full transition-all duration-500" style={{ width: `${animated[i]}%` }}></div>
                </div>
                {mod.completed && (
                  <div className="absolute top-2 right-2 text-xl sm:text-2xl">🏆</div>
                )}
              </Link>
            ) : (
              <div key={mod.title} className="bg-[#181F17]/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-[#3A4D23] flex flex-col gap-2 relative opacity-60 select-none">
                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#232D1A] border border-[#8BAE5A] flex items-center justify-center font-bold text-base sm:text-lg mr-2">{i+1}</span>
                  <span className="text-lg sm:text-xl font-semibold text-[#8BAE5A]">{mod.title}</span>
                </div>
                <p className="text-[#A6C97B] mb-1 sm:mb-2 text-xs sm:text-sm line-clamp-2">{mod.description}</p>
                <div className="absolute inset-0 bg-black/60 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                  <LockClosedIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#8BAE5A] mb-2" />
                  <span className="text-[#8BAE5A] font-semibold text-xs sm:text-sm text-center px-4">Ontgrendel na afronden vorige module</span>
                </div>
              </div>
            )
          )}
        </div>
      </PageLayout>
    </ClientLayout>
  );
} 