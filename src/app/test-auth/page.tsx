'use client';
import { useState } from 'react';

export default function TestAuthPage() {
  const [loginResult, setLoginResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('chiel@media2net.nl');
  const [password, setPassword] = useState('W4t3rk0k3r^');

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      setLoginResult(result);
    } catch (error) {
      setLoginResult({ success: false, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironment = () => {
    const envInfo = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      awsAccessKey: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing',
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
      s3Bucket: process.env.S3_BUCKET_NAME ? 'Set' : 'Missing',
    };
    
    setLoginResult({ 
      success: true, 
      message: 'Environment check',
      environment: envInfo 
    });
  };

  const checkChiel = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/check-chiel');
      const result = await response.json();
      setLoginResult(result);
    } catch (error) {
      setLoginResult({ success: false, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Authentication Test</h1>
        
        {/* Environment Check */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <button
            onClick={checkEnvironment}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Check Environment
          </button>
        </div>

        {/* Chiel Check */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Check Chiel Account</h2>
          <button
            onClick={checkChiel}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check/Create Chiel'}
          </button>
        </div>

        {/* Login Test */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Login Test</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              onClick={testLogin}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
          </div>
        </div>

        {/* Results */}
        {loginResult && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className={`p-4 rounded ${loginResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(loginResult, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <a href="/login" className="block text-blue-600 hover:underline">→ Login Page</a>
            <a href="/dashboard-admin/trainingscentrum" className="block text-blue-600 hover:underline">→ Admin Dashboard</a>
            <a href="/dashboard" className="block text-blue-600 hover:underline">→ User Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
} 