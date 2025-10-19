'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'success' | 'failed' | 'unknown'>('checking');

  const paymentId = searchParams?.get('id') || searchParams?.get('payment_id');

  useEffect(() => {
    // Get payment ID from URL params or try to extract from referrer
    let actualPaymentId = paymentId;
    
    if (!actualPaymentId) {
      // Try to get from session storage (set when payment is created)
      actualPaymentId = sessionStorage.getItem('lastPaymentId');
    }

    if (!actualPaymentId) {
      setPaymentStatus('unknown');
      setLoading(false);
      return;
    }

    // Check payment status with Mollie
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/check-status?id=${actualPaymentId}`);
        const data = await response.json();

        if (data.success && data.payment) {
          const status = data.payment.status;
          if (status === 'paid' || status === 'authorized') {
            setPaymentStatus('success');
          } else if (status === 'failed' || status === 'canceled' || status === 'expired') {
            setPaymentStatus('failed');
          } else {
            setPaymentStatus('unknown');
          }
        } else {
          setPaymentStatus('unknown');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setPaymentStatus('unknown');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [paymentId]);

  useEffect(() => {
    if (!loading && paymentStatus !== 'checking') {
      // Redirect based on status
      if (paymentStatus === 'success') {
        router.replace('/payment/success');
      } else if (paymentStatus === 'failed') {
        router.replace('/payment/failed');
      } else {
        // Unknown status - redirect to failed page as fallback
        router.replace('/payment/failed');
      }
    }
  }, [loading, paymentStatus, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1A2313] to-[#232D1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A] text-lg">Betaling wordt geverifieerd...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1A2313] to-[#232D1A] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
        <p className="text-[#8BAE5A] text-lg">Doorverwijzen...</p>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1A2313] to-[#232D1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Loading...</p>
        </div>
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}
