import { useState, useEffect } from 'react';

export function useTimeoutProtection(timeoutMs: number = 10000) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.warn(`⚠️ Timeout protection triggered after ${timeoutMs}ms`);
      setHasTimedOut(true);
      setIsLoading(false);
    }, timeoutMs);

    return () => window.clearTimeout(timeoutId);
  }, [timeoutMs]);

  const clearTimeoutState = () => {
    setIsLoading(false);
    setHasTimedOut(false);
  };

  const resetTimeout = () => {
    setHasTimedOut(false);
    setIsLoading(true);
  };

  return { 
    hasTimedOut, 
    isLoading, 
    clearTimeout: clearTimeoutState, 
    resetTimeout 
  };
}
