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
  const { signOut } = useSupabaseAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (showConfirm) {
      const confirmed = window.confirm('Weet je zeker dat je wilt uitloggen?');
      if (!confirmed) return;
    }

    setIsLoggingOut(true);
    
    try {
      console.log('🚪 Starting logout process...');
      const result = await signOut();
      
      if (result.success) {
        console.log('✅ Logout successful, redirecting...');
        // Simple redirect without cache busting timestamp to prevent login issues
        const finalUrl = redirectTo.includes('?') 
          ? `${redirectTo}&logout=success` 
          : `${redirectTo}?logout=success`;
        
        router.push(finalUrl);
      } else {
        console.error('❌ Logout failed:', result.error);
        // Still redirect on failure to prevent stuck state
        router.push(`${redirectTo}?logout=error`);
      }
    } catch (error) {
      console.error('❌ Logout exception:', error);
      // Emergency redirect
      router.push(`${redirectTo}?logout=error`);
    } finally {
      setIsLoggingOut(false);
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
