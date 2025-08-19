'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCardIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function TestMolliePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');

  const testMollieConnection = async () => {
    setIsLoading(true);
    setError('');
    setTestResult(null);

    try {
      const response = await fetch('/api/test-mollie');
      const result = await response.json();

      if (result.success) {
        setTestResult(result);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Er is iets misgegaan bij het testen van de Mollie verbinding');
    } finally {
      setIsLoading(false);
    }
  };

  const createTestPayment = async () => {
    setIsLoading(true);
    setError('');
    setCheckoutUrl('');

    try {
      const response = await fetch('/api/test-mollie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testPayment: true })
      });

      const result = await response.json();

      if (result.success) {
        setCheckoutUrl(result.checkoutUrl);
        setTestResult(result);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Er is iets misgegaan bij het aanmaken van de test betaling');
    } finally {
      setIsLoading(false);
    }
  };

  const openCheckout = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCardIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Mollie Test Dashboard</h1>
          <p className="text-gray-400">Test de Mollie betalingsintegratie</p>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={testMollieConnection}
            disabled={isLoading}
            className="p-4 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Testen...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Test Mollie Verbinding
              </div>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createTestPayment}
            disabled={isLoading}
            className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Aanmaken...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Maak Test Betaling
              </div>
            )}
          </motion.button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-center">
              <XMarkIcon className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-400">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Test Results */}
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Test Resultaten</h3>
            
            {testResult.message && (
              <div className="mb-4">
                <p className="text-[#8BAE5A] font-medium">{testResult.message}</p>
              </div>
            )}

            {testResult.availableMethods && (
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">Beschikbare Betaalmethoden:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {testResult.availableMethods.map((method: any) => (
                    <div key={method.id} className="flex items-center space-x-2 p-2 bg-white/5 rounded">
                      {method.image && (
                        <img src={method.image} alt={method.name} className="w-6 h-6" />
                      )}
                      <span className="text-sm text-gray-300">{method.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {testResult.paymentId && (
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">Test Betaling:</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-300">
                    <span className="text-white">Payment ID:</span> {testResult.paymentId}
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="text-white">Status:</span> {testResult.status}
                  </p>
                </div>
              </div>
            )}

            {/* Checkout Button */}
            {checkoutUrl && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCheckout}
                className="w-full py-3 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Open Mollie Checkout
                </div>
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Test Instructies</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start space-x-2">
              <span className="text-[#8BAE5A] font-medium">1.</span>
              <p>Klik op "Test Mollie Verbinding" om te controleren of de API key werkt</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-[#8BAE5A] font-medium">2.</span>
              <p>Klik op "Maak Test Betaling" om een test betaling van €10 aan te maken</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-[#8BAE5A] font-medium">3.</span>
              <p>Klik op "Open Mollie Checkout" om naar de Mollie test omgeving te gaan</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-[#8BAE5A] font-medium">4.</span>
              <p>Gebruik test gegevens: iDEAL bank "Test Bank" of creditcard nummer "4111111111111111"</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-[#8BAE5A] font-medium">5.</span>
              <p>Controleer de webhook logs in je terminal voor betalingsstatus updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
