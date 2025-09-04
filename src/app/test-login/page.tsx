'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export default function TestLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { signIn } = useSupabaseAuth();

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

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center p-4">
      <div className="bg-[#232D1A] p-8 rounded-lg border border-[#3A4D23] max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Login (Localhost)
        </h1>
        
        <div className="space-y-6">
          <p className="text-gray-300 text-sm text-center">
            Kies een login optie voor localhost development:
          </p>
          
          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-300 p-3 rounded">
              {error}
            </div>
          )}
          
          {/* Quick Test Login */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Snelle Test Login</h2>
            <button
              onClick={handleTestLogin}
              disabled={loading}
              className="w-full bg-[#8BAE5A] text-[#232D1A] font-semibold py-3 px-4 rounded-lg hover:bg-[#7A9D4A] transition-colors disabled:opacity-50"
            >
              {loading ? 'Inloggen...' : 'Inloggen als Chiel (Test Gebruiker)'}
            </button>
          </div>

          <div className="border-t border-[#3A4D23] pt-4">
            <h2 className="text-lg font-semibold text-white mb-3">Handmatige Login</h2>
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  placeholder="je@email.nl"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Wachtwoord
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  placeholder="••••••••"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-[#3A4D23] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#4A5D33] transition-colors disabled:opacity-50"
              >
                {loading ? 'Inloggen...' : 'Inloggen'}
              </button>
            </form>
          </div>
          
          <div className="text-center pt-4 border-t border-[#3A4D23]">
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
