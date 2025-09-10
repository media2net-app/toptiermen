'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LifetimeRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct lifetime-tier route
    router.replace('/pakketten/lifetime-tier');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1411] via-[#181F17] to-[#232D1A] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
        <p className="text-[#B6C948] text-lg">Doorverwijzen naar Lifetime Tier...</p>
      </div>
    </div>
  );
}
