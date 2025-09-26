'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface SessionTimeoutWarningProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export function SessionTimeoutWarning({ 
  timeoutMinutes = 30, 
  warningMinutes = 5 
}: SessionTimeoutWarningProps) {
  const { user } = useSupabaseAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!user) return;

    let inactivityTimer: NodeJS.Timeout | undefined;
    let warningTimer: NodeJS.Timeout | undefined;
    let countdownTimer: NodeJS.Timeout | undefined;

    const resetTimers = () => {
      // Clear existing timers
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownTimer) clearInterval(countdownTimer);
      setShowWarning(false);
      setIsActive(false);

      // Set new inactivity timer
      inactivityTimer = setTimeout(() => {
        setIsActive(true);
        setTimeLeft(warningMinutes * 60); // Convert to seconds
        setShowWarning(true);

        // Start countdown
        countdownTimer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              // Time's up - redirect to login
              window.location.href = '/login';
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

      }, (timeoutMinutes - warningMinutes) * 60 * 1000);
    };

    // Activity detection
    const handleActivity = () => {
      if (isActive) {
        // User is active during warning period - reset everything
        resetTimers();
      } else {
        // User is active during normal period - reset timer
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          setIsActive(true);
          setTimeLeft(warningMinutes * 60);
          setShowWarning(true);

          countdownTimer = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                window.location.href = '/login';
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

        }, (timeoutMinutes - warningMinutes) * 60 * 1000);
      }
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the initial timer
    resetTimers();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownTimer) clearInterval(countdownTimer);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, timeoutMinutes, warningMinutes, isActive]);

  const handleStayActive = () => {
    setShowWarning(false);
    setIsActive(false);
    // Reset timers
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.dispatchEvent(new Event(event));
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sessie Verloopt Binnenkort
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            Je sessie verloopt over <strong>{formatTime(timeLeft)}</strong>. 
            Klik op "Blijf Actief" om ingelogd te blijven.
          </p>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleStayActive}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Blijf Actief
            </button>
            
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Opnieuw Inloggen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
