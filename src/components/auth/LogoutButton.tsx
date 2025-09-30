// 🚪 UNIFIED LOGOUT BUTTON - Uses Optimal Auth System
// Consistent logout functionality across the platform

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';
import ModalBase from '@/components/ui/ModalBase';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  redirectTo?: string;
  showConfirm?: boolean;
}

export function LogoutButton({ 
  className = '', 
  children = 'Uitloggen',
  redirectTo = '/login',
  showConfirm = true
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logoutAndRedirect, user } = useSupabaseAuth();
  const { session, stopWorkout } = useWorkoutSession();
  const [showWorkoutConfirm, setShowWorkoutConfirm] = useState(false);

  const handleLogout = async () => {
    // If there's an active workout, show modal to warn and optionally finalize
    if (session?.isActive) {
      setShowWorkoutConfirm(true);
      return;
    }

    setIsLoggingOut(true);
    
    try {
      console.log('🚪 LogoutButton: Starting logout process...');
      // Use the enhanced logoutAndRedirect function
      await logoutAndRedirect(redirectTo);
    } catch (error) {
      console.error('❌ LogoutButton: Logout exception:', error);
      // Emergency fallback - force redirect
      if (typeof window !== 'undefined') {
        window.location.href = `${redirectTo}?logout=error&t=${Date.now()}`;
      }
    } finally {
      // Note: setIsLoggingOut(false) is not needed here since we're redirecting
      // The component will be unmounted during redirect
    }
  };

  const confirmAndFinalizeThenLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Try to finalize workout session in DB if we have a session id
      if (session?.id) {
        try {
          const duration_minutes = Math.max(1, Math.round((session.workoutTime || 0) / 60));
          await fetch('/api/workouts/sessions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: session.id,
              status: 'completed',
              duration_minutes
            })
          });

          // Also persist day completion for training progress
          try {
            await fetch('/api/workout-sessions/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: session.id,
                userId: user?.id,
                schemaId: session.schemaId,
                dayNumber: session.dayNumber,
                rating: 5,
                notes: 'Auto-complete on logout'
              })
            });
          } catch (e) {
            console.warn('⚠️ Failed to mark day completion before logout', e);
          }
        } catch (e) {
          console.warn('⚠️ Failed to finalize workout before logout', e);
        }
      }
      // Always clear local session to avoid stale state
      stopWorkout();
      await logoutAndRedirect(redirectTo);
    } catch (e) {
      console.error('❌ Error during finalize+logout', e);
      if (typeof window !== 'undefined') {
        window.location.href = `${redirectTo}?logout=error&t=${Date.now()}`;
      }
    }
  };

  return (
    <>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`${className} ${isLoggingOut ? 'opacity-75 cursor-wait' : 'cursor-pointer'}`}
      >
        {isLoggingOut ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            <span>Uitloggen...</span>
          </div>
        ) : (
          children
        )}
      </button>

      {/* Workout in progress confirm modal - standard ModalBase */}
      <ModalBase isOpen={showWorkoutConfirm} onClose={() => setShowWorkoutConfirm(false)} zIndexClassName="z-[9999]">
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 w-full" data-workout-logout-modal>
          <h3 className="text-lg font-bold text-white mb-2">Weet je zeker dat je wilt uitloggen?</h3>
          <p className="text-[#8BAE5A] text-sm mb-4">
            Je hebt nog een workout sessie lopen. Als je doorgaat, wordt de workout eerst gestopt en geregistreerd.
          </p>
          <div className="bg-[#181F17] rounded-lg p-3 text-sm text-gray-300 mb-4">
            <div className="flex justify-between"><span>Huidige oefening</span><span className="text-white font-medium">{session?.exerciseName || '-'}</span></div>
            <div className="flex justify-between"><span>Set</span><span className="text-white font-medium">{session?.currentSet}/{session?.totalSets}</span></div>
            <div className="flex justify-between"><span>Workout tijd</span><span className="text-white font-medium">{Math.floor((session?.workoutTime||0)/60)}m {((session?.workoutTime||0)%60).toString().padStart(2,'0')}s</span></div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowWorkoutConfirm(false)}
              className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors"
            >Nee, ga terug</button>
            <button
              onClick={confirmAndFinalizeThenLogout}
              className="flex-1 px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors"
            >Ja, stop en uitloggen</button>
          </div>
        </div>
      </ModalBase>
    </>
  );
}
