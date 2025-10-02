'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { useRouter } from 'next/navigation';

interface SessionRecoveryProps {
  children: React.ReactNode;
}

export function SessionRecovery({ children }: SessionRecoveryProps) {
  const { user, error, loading } = useSupabaseAuth();
  const { sessionStatus, checkSessionHealth } = useSessionMonitor();
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const router = useRouter();

  // Monitor for session errors
  useEffect(() => {
    if (error && error.includes('Session expired')) {
      setSessionError(error);
      setShowRecoveryModal(true);
    } else if (error && error.includes('Session validation failed')) {
      setSessionError('Je sessie is verlopen. Klik op "Opnieuw laden" om in te loggen.');
      setShowRecoveryModal(true);
    }
  }, [error]);

  // Monitor session health status
  useEffect(() => {
    if (!sessionStatus.isHealthy && sessionStatus.error) {
      setSessionError(sessionStatus.error);
      setShowRecoveryModal(true);
    }
  }, [sessionStatus]);

  // Note: intentionally no visibilitychange listener here
  // to avoid any refresh side-effects when returning to the tab.

  const handleRecovery = async () => {
    setIsRecovering(true);
    
    try {
      // Try to refresh the page first
      window.location.reload();
    } catch (error) {
      console.error('Recovery failed:', error);
      setSessionError('Herstel mislukt. Probeer de pagina te vernieuwen.');
    } finally {
      setIsRecovering(false);
    }
  };

  const handleRedirectToLogin = () => {
    setShowRecoveryModal(false);
    setSessionError(null);
    router.push('/login');
  };

  if (showRecoveryModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sessie Verlopen
            </h3>
            
            <p className="text-sm text-gray-500 mb-6">
              {sessionError || 'Je sessie is verlopen. Klik op een van de onderstaande opties om door te gaan.'}
            </p>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleRecovery}
                disabled={isRecovering}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRecovering ? 'Bezig...' : 'Opnieuw Laden'}
              </button>
              
              <button
                onClick={handleRedirectToLogin}
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

  return <>{children}</>;
}
