'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PrelaunchKortingRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to maandelijks page immediately
    router.replace('/pakketten/maandelijks');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1A2313] to-[#232D1A] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Doorverwijzen...</h2>
        <p className="text-[#D1D5DB]">Je wordt doorgestuurd naar de maandelijkse pakketten pagina.</p>
      </div>
    </div>
  );
}