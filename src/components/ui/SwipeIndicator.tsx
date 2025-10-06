'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SwipeIndicatorProps {
  children: React.ReactNode;
  className?: string;
  showFadeIndicators?: boolean;
  showSwipeHint?: boolean;
}

export default function SwipeIndicator({ 
  children, 
  className = '',
  showFadeIndicators = true,
  showSwipeHint = true
}: SwipeIndicatorProps) {
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(true);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkScrollPosition = () => {
    if (!containerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    const isAtStart = scrollLeft <= 0;
    const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 1;

    setShowLeftIndicator(!isAtStart);
    setShowRightIndicator(!isAtEnd);
    setShowLeftFade(!isAtStart);
    setShowRightFade(!isAtEnd);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  return (
    <div className={`swipe-container relative ${className}`} ref={containerRef}>
      {children}
      
      {/* Fade indicators */}
      {showFadeIndicators && (
        <>
          {showLeftFade && <div className="swipe-fade-left" />}
          {showRightFade && <div className="swipe-fade-right" />}
        </>
      )}
      
      {/* Swipe indicators */}
      {showSwipeHint && (
        <>
          {showLeftIndicator && (
            <div className="swipe-indicator left">
              <ChevronLeftIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
          )}
          {showRightIndicator && (
            <div className="swipe-indicator right">
              <ChevronRightIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
          )}
        </>
      )}
    </div>
  );
} 