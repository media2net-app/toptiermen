'use client';
import ClientLayout from '../../../components/ClientLayout';
import Link from 'next/link';

export default function FysiekeDominantiePage() {
  return (
    <ClientLayout>
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Module 2: Fysieke Dominantie</h1>
          <p className="text-[#8BAE5A] text-lg">Werk aan kracht, uithoudingsvermogen en fysieke gezondheid</p>
        </div>

        <div className="bg-[#232D1A] rounded-2xl shadow-xl p-8 border border-[#3A4D23] text-center">
          <div className="text-8xl mb-6">💪</div>
          <h2 className="text-2xl font-bold text-[#B6C948] mb-4">Module in Ontwikkeling</h2>
          <p className="text-[#8BAE5A] text-lg mb-6">
            Gefeliciteerd! Je hebt Module 1 succesvol afgerond en Module 2 ontgrendeld. 
            Deze module wordt momenteel ontwikkeld en zal binnenkort beschikbaar zijn.
          </p>
          
          <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#B6C948]/10 rounded-xl p-6 border border-[#8BAE5A]/30 mb-6">
            <h3 className="text-lg font-bold text-[#B6C948] mb-3">Wat kun je verwachten?</h3>
            <ul className="text-[#A6C97B] text-left space-y-2">
              <li>• Krachttraining fundamentals</li>
              <li>• Uithoudingsvermogen opbouwen</li>
              <li>• Voeding voor optimale prestaties</li>
              <li>• Herstel en blessurepreventie</li>
              <li>• Mentale kracht door fysieke uitdagingen</li>
            </ul>
          </div>

          <Link
            href="/dashboard/academy"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-bold hover:from-[#B6C948] hover:to-[#8BAE5A] transition"
          >
            ← Terug naar Academy Overzicht
          </Link>
        </div>
      </div>
    </ClientLayout>
  );
} 