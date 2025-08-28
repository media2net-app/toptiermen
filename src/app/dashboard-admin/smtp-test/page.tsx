'use client';

import { useState } from 'react';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function SMTPTestPage() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testSMTP = async () => {
    setIsTesting(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: 'chiel@media2net.nl',
          subject: 'Top Tier Men - SMTP Test',
          message: 'Dit is een test email om de SMTP instellingen te controleren.'
        })
      });

      const result = await response.json();
      setTestResult(result);
    } catch (err) {
      setError('Fout bij het testen van SMTP instellingen');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <EnvelopeIcon className="h-8 w-8 text-[#8BAE5A]" />
            <h1 className="text-3xl font-bold text-white">SMTP Test</h1>
          </div>
          <p className="text-gray-400">
            Test de SMTP instellingen en stuur een test email
          </p>
        </div>

        {/* SMTP Configuration Display */}
        <div className="bg-black/50 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Huidige SMTP Instellingen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Host</p>
              <p className="text-white font-mono">toptiermen.eu</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Port</p>
              <p className="text-white font-mono">465 (SSL)</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Username</p>
              <p className="text-white font-mono">platform@toptiermen.eu</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Password</p>
              <p className="text-white font-mono">••••••••••••••••</p>
            </div>
          </div>
        </div>

        {/* Test Section */}
        <div className="bg-black/50 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Test Email Versturen</h2>
          
          <div className="mb-6">
            <p className="text-gray-400 mb-2">Test email wordt verzonden naar:</p>
            <p className="text-white font-mono">chiel@media2net.nl</p>
          </div>

          <button
            onClick={testSMTP}
            disabled={isTesting}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isTesting 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-[#8BAE5A] text-white hover:bg-[#7A9D4A]'
            }`}
          >
            <ArrowPathIcon className={`h-5 w-5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testen...' : 'Test SMTP Instellingen'}</span>
          </button>
        </div>

        {/* Results */}
        {testResult && (
          <div className={`border rounded-xl p-6 ${
            testResult.success 
              ? 'bg-green-900/20 border-green-600' 
              : 'bg-red-900/20 border-red-600'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              {testResult.success ? (
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              ) : (
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              )}
              <h3 className="text-lg font-semibold text-white">
                {testResult.success ? 'Test Succesvol!' : 'Test Mislukt'}
              </h3>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-300">{testResult.message}</p>
              {testResult.to && (
                <p className="text-gray-400 text-sm">
                  Verzonden naar: {testResult.to}
                </p>
              )}
              {testResult.template && (
                <p className="text-gray-400 text-sm">
                  Template: {testResult.template}
                </p>
              )}
            </div>

            {testResult.success && (
              <div className="mt-4 p-4 bg-green-900/30 rounded-lg">
                <p className="text-green-300 text-sm">
                  ✅ Controleer je email inbox voor de test email!
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-600 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-white">Fout Opgetreden</h3>
            </div>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-600 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Instructies</h3>
          <div className="space-y-2 text-gray-300">
            <p>• Klik op "Test SMTP Instellingen" om een test email te versturen</p>
            <p>• Controleer je email inbox (chiel@media2net.nl) voor de test email</p>
            <p>• Als de email aankomt, werken de SMTP instellingen correct</p>
            <p>• Als er een fout optreedt, controleer de instellingen</p>
          </div>
        </div>
      </div>
    </div>
  );
}
