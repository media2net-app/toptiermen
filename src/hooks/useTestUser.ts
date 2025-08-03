import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useState, useEffect } from 'react';

export function useTestUser() {
  const { user } = useSupabaseAuth();
  const [isTestUser, setIsTestUser] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if user has test role or is admin
      const isTest = user.role?.toLowerCase() === 'test';
      const isAdmin = user.role?.toLowerCase() === 'admin';
      setIsTestUser(isTest || isAdmin);
    } else {
      setIsTestUser(false);
    }
  }, [user]);

  return isTestUser;
} 