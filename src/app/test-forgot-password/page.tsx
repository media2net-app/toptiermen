'use client';

import { useState } from 'react';

export default function TestForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testForgotPassword = async () => {
    if (!email) {
      alert('Voer een e-mailadres in');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error',
        errorDetails: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testOriginalForgotPassword = async () => {
    if (!email) {
      alert('Voer een e-mailadres in');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error',
        errorDetails: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F0A] via-[#181F17] to-[#232D1A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#0F1419] rounded-lg p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-8 text-center">
            🧪 Wachtwoord Vergeten Test
          </h1>

          <div className="mb-8">
            <label className="block text-[#B6C948] font-semibold mb-2">
              E-mailadres:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full px-4 py-3 bg-[#1F2D17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
            />
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={testForgotPassword}
              disabled={loading}
              className="flex-1 bg-[#8BAE5A] hover:bg-[#B6C948] text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testen...' : 'Test Nieuwe API'}
            </button>
            
            <button
              onClick={testOriginalForgotPassword}
              disabled={loading}
              className="flex-1 bg-[#3A4D23] hover:bg-[#4A5D33] text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testen...' : 'Test Originele API'}
            </button>
          </div>

          {result && (
            <div className="bg-[#1F2D17] border border-[#3A4D23] rounded-lg p-6">
              <h2 className="text-xl font-bold text-[#8BAE5A] mb-4">
                Test Resultaat:
              </h2>
              
              <div className={`p-4 rounded-lg mb-4 ${
                result.success 
                  ? 'bg-green-900/20 border border-green-500' 
                  : 'bg-red-900/20 border border-red-500'
              }`}>
                <div className="flex items-center mb-2">
                  <span className={`text-2xl mr-2 ${
                    result.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.success ? '✅' : '❌'}
                  </span>
                  <span className={`font-bold ${
                    result.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.success ? 'SUCCESS' : 'FAILED'}
                  </span>
                </div>
                
                {result.message && (
                  <p className="text-white mb-2">{result.message}</p>
                )}
                
                {result.error && (
                  <p className="text-red-300 mb-2">{result.error}</p>
                )}
              </div>

              {result.steps && (
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#B6C948] mb-2">
                    Stappen:
                  </h3>
                  <div className="space-y-1">
                    {Object.entries(result.steps).map(([step, status]) => (
                      <div key={step} className="flex items-center">
                        <span className="text-sm text-gray-300 w-32">{step}:</span>
                        <span className="text-sm">{String(status)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.errorDetails && (
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#B6C948] mb-2">
                    Error Details:
                  </h3>
                  <pre className="bg-black p-3 rounded text-xs text-gray-300 overflow-auto">
                    {JSON.stringify(result.errorDetails, null, 2)}
                  </pre>
                </div>
              )}

              {result.generatedPassword && (
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#B6C948] mb-2">
                    Gegenereerd Wachtwoord:
                  </h3>
                  <div className="bg-black p-3 rounded text-sm text-white font-mono">
                    {result.generatedPassword}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h3 className="text-lg font-bold text-[#B6C948] mb-2">
                  Volledige Response:
                </h3>
                <pre className="bg-black p-3 rounded text-xs text-gray-300 overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-[#1F2D17] rounded-lg">
            <h3 className="text-lg font-bold text-[#8BAE5A] mb-2">
              Test Instructies:
            </h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Test met een bestaand e-mailadres uit de database</li>
              <li>• Controleer de console logs voor gedetailleerde informatie</li>
              <li>• Controleer of de e-mail daadwerkelijk wordt verzonden</li>
              <li>• Test of het gegenereerde wachtwoord werkt bij inloggen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
