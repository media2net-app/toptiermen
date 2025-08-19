'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function TestPaymentSuccessPage() {
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');

  useEffect(() => {
    // Check URL parameters for payment status
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    if (status) {
      setPaymentStatus(status);
    }
  }, []);

  const getStatusInfo = () => {
    switch (paymentStatus) {
      case 'paid':
        return {
          title: 'Betaling Succesvol!',
          message: 'Je test betaling is succesvol verwerkt.',
          color: 'text-[#8BAE5A]',
          bgColor: 'bg-[#8BAE5A]/10',
          borderColor: 'border-[#8BAE5A]/30'
        };
      case 'failed':
        return {
          title: 'Betaling Mislukt',
          message: 'Je test betaling is mislukt. Probeer het opnieuw.',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30'
        };
      case 'expired':
        return {
          title: 'Betaling Verlopen',
          message: 'Je test betaling is verlopen.',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30'
        };
      default:
        return {
          title: 'Betaling Status Onbekend',
          message: 'De status van je betaling kon niet worden bepaald.',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-[#0F1419] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Status Icon */}
          <div className={`w-20 h-20 ${statusInfo.bgColor} ${statusInfo.borderColor} border-2 rounded-full flex items-center justify-center mx-auto mb-6`}>
            <CheckCircleIcon className={`w-10 h-10 ${statusInfo.color}`} />
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold ${statusInfo.color} mb-4`}>
            {statusInfo.title}
          </h1>

          {/* Message */}
          <p className="text-gray-300 mb-8">
            {statusInfo.message}
          </p>

          {/* Payment Details */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-8">
            <h3 className="text-white font-medium mb-3">Test Betaling Details</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Bedrag:</span>
                <span>€10.00</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={statusInfo.color}>{paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span>Test Betaling</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/test-mollie">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-center">
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Terug naar Test Dashboard
                </div>
              </motion.button>
            </Link>

            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                Ga naar Dashboard
              </motion.button>
            </Link>
          </div>

          {/* Info */}
          <div className="mt-8 text-xs text-gray-500">
            <p>Dit is een test betaling. Er zijn geen echte kosten in rekening gebracht.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
