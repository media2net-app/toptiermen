import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useState, useEffect } from 'react';

export function useTestUser() {
  const { user } = useSupabaseAuth();
  const [isTestUser, setIsTestUser] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if user has test role, is admin, or has specific test email
      const isTest = user.role?.toLowerCase() === 'test';
      const isAdmin = user.role?.toLowerCase() === 'admin';
      const isTestEmail = user.email?.toLowerCase().includes('test');
      setIsTestUser(isTest || isAdmin || isTestEmail);
    } else {
      setIsTestUser(false);
    }
  }, [user]);

  return isTestUser;
} 