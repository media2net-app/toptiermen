"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleStart = () => {
      console.log('🚀 Navigation started...');
      setLoading(true);
    };

    const handleComplete = () => {
      console.log('✅ Navigation completed');
      setLoading(false);
    };

    // Listen for pathname changes
    handleComplete();

    // Add global navigation listeners
    window.addEventListener('beforeunload', handleStart);
    
    return () => {
      window.removeEventListener('beforeunload', handleStart);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#181F17]">
      <div className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
