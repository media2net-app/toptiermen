'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleTestLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
      <div className="bg-[#232D1A] p-8 rounded-lg border border-[#3A4D23] max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Test Login (Localhost)
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            Deze pagina is alleen voor localhost development. 
            Klik op de knop hieronder om in te loggen als test gebruiker.
          </p>
          
          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-300 p-3 rounded">
              {error}
            </div>
          )}
          
          <button
            onClick={handleTestLogin}
            disabled={loading}
            className="w-full bg-[#8BAE5A] text-[#232D1A] font-semibold py-3 px-4 rounded-lg hover:bg-[#7A9D4A] transition-colors disabled:opacity-50"
          >
            {loading ? 'Inloggen...' : 'Inloggen als Test Gebruiker'}
          </button>
          
          <div className="text-center">
            <a 
              href="/dashboard" 
              className="text-[#8BAE5A] hover:underline text-sm"
            >
              Ga naar Dashboard (zonder inloggen)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
