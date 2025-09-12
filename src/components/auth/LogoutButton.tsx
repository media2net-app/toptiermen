// 🚪 UNIFIED LOGOUT BUTTON - Uses Optimal Auth System
// Consistent logout functionality across the platform

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

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
  const { logoutAndRedirect } = useSupabaseAuth();

  const handleLogout = async () => {
    if (showConfirm) {
      const confirmed = window.confirm('Weet je zeker dat je wilt uitloggen?');
      if (!confirmed) return;
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

  return (
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
  );
}
