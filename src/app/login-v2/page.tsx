'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginV2Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login with:', email);
      
      // Direct Supabase login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        console.error('❌ Login error:', signInError);
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.email);
        console.log('📋 Session data:', data.session);
        
        // Wait for session to be properly set
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if user has admin role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        console.log('👤 User profile:', profile);

        // Force page reload to ensure session is properly loaded by middleware
        const redirectUrl = profile?.role === 'admin' ? '/dashboard-admin' : '/dashboard';
        console.log('🔄 Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      }

    } catch (err) {
      console.error('❌ Login exception:', err);
      setError('Er is een onverwachte fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181F17] px-4">
      <div className="w-full max-w-md p-6 bg-[#232D1A] rounded-3xl shadow-2xl border border-[#3A4D23]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Login V2</h1>
          <p className="text-gray-300">Eenvoudige login voor testing</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="chiel@media2net.nl"
              className="w-full px-3 py-2 bg-[#3A4D23] border border-[#8BAE5A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Wachtwoord
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Je wachtwoord"
              className="w-full px-3 py-2 bg-[#3A4D23] border border-[#8BAE5A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Inloggen...' : 'Inloggen'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Test account: chiel@media2net.nl
          </p>
        </div>
      </div>
    </div>
  );
}
