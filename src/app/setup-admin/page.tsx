'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const setupAdmin = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/setup-admin', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}
        
📧 Email: ${data.email}
🔑 Wachtwoord: ${data.password}

Je kunt nu inloggen op http://localhost:3000/login`);
      } else {
        setError(data.error || 'Er is een fout opgetreden');
      }
    } catch (err) {
      setError('Er is een fout opgetreden bij het aanmaken van het admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1F2937] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-[#1F2937] to-[#374151] rounded-xl p-8 border border-[#4B5563] shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Admin Account Setup
        </h1>
        
        <p className="text-gray-300 mb-6 text-center">
          Maak een admin account aan om toegang te krijgen tot het admin dashboard
        </p>

        <button
          onClick={setupAdmin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {loading ? 'Bezig met aanmaken...' : 'Admin Account Aanmaken'}
        </button>

        {message && (
          <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
            <pre className="text-green-300 text-sm whitespace-pre-wrap">{message}</pre>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Ga naar Login Pagina
          </button>
        </div>
      </div>
    </div>
  );
} 