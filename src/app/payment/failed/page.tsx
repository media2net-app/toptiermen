'use client';

import { FaExclamationTriangle, FaArrowLeft, FaCreditCard, FaShieldAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function PaymentFailedPage() {
  const router = useRouter();

  const handleRetryPayment = () => {
    // Redirect back to packages page
    router.push('/pakketten/maandelijks');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1A2313] to-[#232D1A] flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Betaling Niet Gelukt
          </h1>
          <p className="text-xl text-[#8BAE5A]">
            Er is iets misgegaan met je betaling. Geen zorgen, je bent nog niet gefactureerd.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-[#1A2313] rounded-2xl p-8 border border-[#3A4D23]/30 space-y-8">
          
          {/* What happened */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Wat is er gebeurd?</h2>
            <div className="text-[#B6C948] space-y-3">
              <p>Je betaling kon niet worden verwerkt. Dit kan verschillende oorzaken hebben:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-left">
                <li>Je hebt de betaling geannuleerd</li>
                <li>Er was een technisch probleem</li>
                <li>Je betaalgegevens zijn niet correct</li>
                <li>Je bank heeft de betaling geweigerd</li>
              </ul>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-[#232D1A] rounded-lg p-6 border border-[#3A4D23]/30">
            <div className="flex items-start space-x-4">
              <FaShieldAlt className="w-6 h-6 text-[#8BAE5A] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Geen zorgen over je gegevens</h3>
                <p className="text-[#B6C948] text-sm">
                  Je betalingsgegevens zijn veilig. Er is geen geld afgeschreven en je kunt opnieuw proberen te betalen.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-[#232D1A] rounded-lg p-6 border border-[#3A4D23]/30">
            <h3 className="text-lg font-semibold text-white mb-4">Wat kun je nu doen?</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#181F17] text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">Probeer opnieuw te betalen</p>
                  <p className="text-[#B6C948] text-sm">Klik op de knop hieronder om terug te gaan naar de pakketten</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#181F17] text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">Controleer je betaalgegevens</p>
                  <p className="text-[#B6C948] text-sm">Zorg ervoor dat je kaart geldig is en voldoende saldo heeft</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#181F17] text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">Neem contact op</p>
                  <p className="text-[#B6C948] text-sm">Als het probleem aanhoudt, neem dan contact met ons op</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleRetryPayment}
              className="flex-1 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-bold py-4 px-8 rounded-xl hover:from-[#9BBE6A] hover:to-[#C6D958] transition-all duration-300 flex items-center justify-center gap-3 text-lg hover:shadow-lg hover:scale-[1.02]"
            >
              <FaCreditCard className="w-5 h-5" />
              Opnieuw Proberen
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex-1 bg-[#232D1A] border border-[#3A4D23] text-white font-bold py-4 px-8 rounded-xl hover:bg-[#2A3320] hover:border-[#8BAE5A] transition-all duration-300 flex items-center justify-center gap-3 text-lg"
            >
              <FaArrowLeft className="w-5 h-5" />
              Terug naar Home
            </button>
          </div>

          {/* Contact Info */}
          <div className="text-center pt-6 border-t border-[#3A4D23]/30">
            <p className="text-[#8BAE5A] text-sm">
              Heb je vragen? Neem contact met ons op via{' '}
              <a href="mailto:info@toptiermen.eu" className="text-[#B6C948] hover:text-[#8BAE5A] underline">
                info@toptiermen.eu
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

