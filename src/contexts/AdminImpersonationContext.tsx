'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { toast } from 'react-hot-toast';

interface ImpersonationData {
  sessionId: string;
  target_user_id: string;
  target_email: string;
  started_at: string;
  status: 'active' | 'ended';
}

interface AdminImpersonationContextType {
  isImpersonating: boolean;
  impersonationData: ImpersonationData | null;
  targetUser: any | null;
  startImpersonation: (targetUserId: string) => Promise<boolean>;
  endImpersonation: () => Promise<void>;
  loading: boolean;
}

const AdminImpersonationContext = createContext<AdminImpersonationContextType | undefined>(undefined);

export const useAdminImpersonation = () => {
  const context = useContext(AdminImpersonationContext);
  if (context === undefined) {
    throw new Error('useAdminImpersonation must be used within an AdminImpersonationProvider');
  }
  return context;
};

interface AdminImpersonationProviderProps {
  children: ReactNode;
}

export const AdminImpersonationProvider: React.FC<AdminImpersonationProviderProps> = ({ children }) => {
  const { user } = useSupabaseAuth();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonationData, setImpersonationData] = useState<ImpersonationData | null>(null);
  const [targetUser, setTargetUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for existing impersonation session on mount
  useEffect(() => {
    if (user) {
      checkImpersonationStatus();
    }
  }, [user]);

  const checkImpersonationStatus = async () => {
    if (!user) return;

    try {
      // Check if user has admin impersonation session
      const response = await fetch(`/api/admin/check-impersonation?userId=${user.id}`);
      const data = await response.json();

      if (data.success && data.impersonation) {
        setImpersonationData(data.impersonation);
        setTargetUser(data.targetUser);
        setIsImpersonating(true);
        console.log('🔄 Restored impersonation session:', data.impersonation);
      }
    } catch (error) {
      console.error('Error checking impersonation status:', error);
    }
  };

  const startImpersonation = async (targetUserId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Je moet ingelogd zijn om deze functie te gebruiken');
      return false;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/login-as-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          adminUserId: user.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setImpersonationData(data.impersonation);
        setTargetUser(data.targetUser);
        setIsImpersonating(true);
        
        toast.success(`Ingelogd als ${data.targetUser.email}`, {
          duration: 4000,
          icon: '🔐'
        });
        
        console.log('✅ Impersonation started:', data.impersonation);
        return true;
      } else {
        toast.error(data.error || 'Fout bij inloggen als gebruiker');
        return false;
      }
    } catch (error) {
      console.error('Error starting impersonation:', error);
      toast.error('Fout bij inloggen als gebruiker');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const endImpersonation = async (): Promise<void> => {
    if (!user || !impersonationData) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/login-as-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: impersonationData.sessionId,
          adminUserId: user.id
        })
      });

      const data = await response.json();

      if (data.success) {
        setImpersonationData(null);
        setTargetUser(null);
        setIsImpersonating(false);
        
        toast.success('Terug naar admin account', {
          duration: 3000,
          icon: '👑'
        });
        
        console.log('✅ Impersonation ended');
      } else {
        toast.error(data.error || 'Fout bij beëindigen van sessie');
      }
    } catch (error) {
      console.error('Error ending impersonation:', error);
      toast.error('Fout bij beëindigen van sessie');
    } finally {
      setLoading(false);
    }
  };

  const value: AdminImpersonationContextType = {
    isImpersonating,
    impersonationData,
    targetUser,
    startImpersonation,
    endImpersonation,
    loading
  };

  return (
    <AdminImpersonationContext.Provider value={value}>
      {children}
    </AdminImpersonationContext.Provider>
  );
};
