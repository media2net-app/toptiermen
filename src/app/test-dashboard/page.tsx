'use client';

import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export default function TestDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const { user, profile } = useSupabaseAuth();

  useEffect(() => {
    const testDashboard = async () => {
      if (!user?.id) {
        setError('No user found');
        setLoading(false);
        return;
      }

      try {
        console.log('Testing dashboard for user:', user.id);
        
        const response = await fetch('/api/dashboard-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id
          })
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
          console.log('Dashboard data received:', result);
        } else {
          setError(`API failed: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    testDashboard();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Testing dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error</div>
          <div className="text-white mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-2xl font-bold mb-6">Dashboard Test Results</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-white text-lg font-semibold mb-4">User Info</h2>
          <div className="text-gray-300">
            <p>ID: {user?.id}</p>
            <p>Email: {user?.email}</p>
            <p>Name: {profile?.full_name}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-white text-lg font-semibold mb-4">Dashboard Stats</h2>
          <pre className="text-gray-300 text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-white text-lg font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Go to Real Dashboard
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
