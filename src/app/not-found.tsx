'use client';

import Link from 'next/link';

export default function NotFound() {
  const handleGoBack = () => {
    window.history.back();
  };
  return (
    <div className="min-h-screen bg-[#181F17] flex items-center justify-center p-4">
      <div className="bg-[#232D1A] p-8 rounded-lg border border-[#3A4D23] max-w-md w-full text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-4">Pagina niet gevonden</h1>
        <p className="text-[#8BAE5A] mb-6">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-[#B6C948] text-[#181F17] font-semibold rounded-lg hover:bg-[#8BAE5A] transition-colors text-center"
          >
            Ga naar home
          </Link>
          
          <button
            onClick={handleGoBack}
            className="w-full px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] font-semibold rounded-lg hover:bg-[#4A5D33] transition-colors"
          >
            Ga terug
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-[#181F17] rounded-lg border border-[#3A4D23]">
          <h3 className="text-[#B6C948] font-semibold mb-2">Populaire pagina's:</h3>
          <div className="space-y-2 text-sm">
            <Link href="/dashboard" className="block text-[#8BAE5A] hover:text-[#B6C948] transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/trainingsschemas" className="block text-[#8BAE5A] hover:text-[#B6C948] transition-colors">
              Trainingsschemas
            </Link>
            <Link href="/dashboard/voedingsplannen" className="block text-[#8BAE5A] hover:text-[#B6C948] transition-colors">
              Voedingsplannen
            </Link>
            <Link href="/brotherhood" className="block text-[#8BAE5A] hover:text-[#B6C948] transition-colors">
              Brotherhood
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 