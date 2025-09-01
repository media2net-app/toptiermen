'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VoedingsplannenRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new location where voedingsplannen is now integrated
    router.replace('/dashboard/trainingscentrum');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
        <p className="text-[#8BAE5A]">Voedingsplannen is verplaatst naar het Trainingscentrum...</p>
        <p className="text-[#B6C948] text-sm mt-2">Je wordt automatisch doorgestuurd</p>
      </div>
    </div>
  );
}
