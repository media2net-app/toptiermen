'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckCircleIcon, 
  ArrowRightIcon,
  HomeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  const packageId = searchParams?.get('package');
  const period = searchParams?.get('period');

  useEffect(() => {
    // Simulate loading payment data
    setTimeout(() => {
      setPaymentData({
        packageId,
        period,
        amount: period === 'yearly' ? 508 : 282,
        status: 'success'
      });
      setLoading(false);
    }, 2000);
  }, [packageId, period]);

  const getPackageName = (id: string) => {
    switch (id) {
      case 'monthly': return 'Maandelijks Pakket';
      case 'yearly': return 'Jaarlijks Pakket';
      case 'lifetime': return 'Lifetime Pakket';
      default: return 'Top Tier Men Pakket';
    }
  };

  const getPackageDescription = (id: string, period: string) => {
    if (id === 'lifetime') {
      return 'Levenslang toegang tot alle content en features';
    }
    return period === 'yearly' 
      ? 'Jaarlijkse toegang met 10% korting'
      : '6 maanden toegang tot alle content';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1411] via-[#181F17] to-[#232D1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948] mx-auto mb-4"></div>
          <p className="text-[#B6C948] text-lg">Betaling wordt geverifieerd...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1411] via-[#181F17] to-[#232D1A] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-[#232D1A] rounded-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-400" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Betaling Succesvol!
          </h1>
          <p className="text-[#8BAE5A] text-lg mb-8">
            Welkom bij de Top Tier Men Brotherhood! Je betaling is bevestigd en je account is geactiveerd.
          </p>

          {/* Package Details */}
          {paymentData && (
            <div className="bg-[#1A2313] rounded-lg p-6 mb-8 text-left">
              <h2 className="text-xl font-semibold text-white mb-4">Je Pakket Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#8BAE5A]">Pakket:</span>
                  <span className="text-white font-medium">{getPackageName(packageId || '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8BAE5A]">Periode:</span>
                  <span className="text-white font-medium">
                    {period === 'yearly' ? '1 jaar' : '6 maanden'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8BAE5A]">Bedrag:</span>
                  <span className="text-[#B6C948] font-semibold">€{paymentData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8BAE5A]">Status:</span>
                  <span className="text-green-400 font-medium">Actief</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-[#3A4D23]/20 rounded-lg">
                <p className="text-[#8BAE5A] text-sm">
                  {getPackageDescription(packageId || '', period || '')}
                </p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-[#1A2313] rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Wat nu?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center text-[#181F17] text-sm font-bold">1</div>
                <span className="text-[#8BAE5A]">Je ontvangt een bevestigingsmail met je inloggegevens</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center text-[#181F17] text-sm font-bold">2</div>
                <span className="text-[#8BAE5A]">Log in op het platform en voltooi je profiel</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center text-[#181F17] text-sm font-bold">3</div>
                <span className="text-[#8BAE5A]">Start met je eerste training en voedingsplan</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center text-[#181F17] text-sm font-bold">4</div>
                <span className="text-[#8BAE5A]">Word onderdeel van de Brotherhood community</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-semibold py-3 px-6 rounded-lg hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <HomeIcon className="w-5 h-5" />
              Ga naar Dashboard
            </button>
            <button
              onClick={() => router.push('/dashboard/brotherhood')}
              className="flex-1 bg-[#3A4D23] text-[#8BAE5A] font-semibold py-3 px-6 rounded-lg hover:bg-[#4A5D33] transition-colors flex items-center justify-center gap-2"
            >
              <UserGroupIcon className="w-5 h-5" />
              Bekijk Brotherhood
            </button>
          </div>

          {/* Support */}
          <div className="mt-8 p-4 bg-[#3A4D23]/20 rounded-lg">
            <p className="text-[#8BAE5A] text-sm">
              Heb je vragen? Neem contact op met ons support team via de hulp knop rechts onder in het dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
