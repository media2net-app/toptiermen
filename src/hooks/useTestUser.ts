import { useAuth } from '@/auth-systems/optimal/useAuth';
import { useState, useEffect } from 'react';

export function useTestUser() {
  const { user, profile } = useAuth();
  const [isTestUser, setIsTestUser] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if user has test role, is admin, or has specific test email
      const isTest = profile?.role?.toLowerCase() === 'test';
      const isAdmin = profile?.role?.toLowerCase() === 'admin';
      const isTestEmail = user.email?.toLowerCase().includes('test');
      setIsTestUser(Boolean(isTest || isAdmin || isTestEmail));
    } else {
      setIsTestUser(false);
    }
  }, [user, profile]);

  return isTestUser;
} 