'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth-systems/optimal/useAuth';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function OnboardingDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect to dashboard which will show the forced onboarding modal
      router.replace('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
        <p className="text-[#8BAE5A]">Doorsturen naar geforceerde onboarding...</p>
      </div>
    </div>
  );
} 