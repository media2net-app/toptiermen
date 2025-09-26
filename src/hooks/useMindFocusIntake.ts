import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface MindFocusIntakeStatus {
  isIntakeCompleted: boolean;
  isLoading: boolean;
  profile: any;
}

export function useMindFocusIntake(): MindFocusIntakeStatus {
  const { user } = useSupabaseAuth();
  const [isIntakeCompleted, setIsIntakeCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const checkIntakeStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/mind-focus/intake-status?userId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          setIsIntakeCompleted(data.isIntakeCompleted);
          setProfile(data.profile);
        }
      } catch (error) {
        console.error('Error checking mind focus intake status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkIntakeStatus();
  }, [user]);

  return {
    isIntakeCompleted,
    isLoading,
    profile
  };
}
