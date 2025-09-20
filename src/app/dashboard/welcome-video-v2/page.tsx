'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomeVideoV2Page() {
  const router = useRouter();

  // Always redirect to dashboard - the modal will handle the onboarding
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
        <p className="text-white">Doorverwijzen naar dashboard...</p>
      </div>
    </div>
  );
}
