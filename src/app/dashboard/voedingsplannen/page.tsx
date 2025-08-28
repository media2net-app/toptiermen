'use client';

import PageLayout from '@/components/PageLayout';

export default function VoedingsplannenPage() {
  return (
    <PageLayout
      title="Voedingsplannen"
      subtitle="Voedingsplan functionaliteit tijdelijk niet beschikbaar"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Voedingsplan Module</h2>
          <p className="text-[#8BAE5A] mb-6">
            De voedingsplan functionaliteit wordt momenteel onderhouden en is tijdelijk niet beschikbaar.
          </p>
          
          <div className="bg-[#181F17] rounded-lg p-4 mb-6">
            <p className="text-[#B6C948] text-sm">
              <strong>Status:</strong> Onderhoud
            </p>
            <p className="text-[#B6C948] text-sm">
              <strong>Beschikbaarheid:</strong> Binnenkort
            </p>
          </div>
          
          <p className="text-[#8BAE5A] text-sm">
            Probeer het later opnieuw of neem contact op met het support team.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
