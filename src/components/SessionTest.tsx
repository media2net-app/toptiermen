import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SessionTest() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSession = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing session...');
      
      // Check if supabase client is initialized
      if (!supabase) {
        setTestResult({ success: false, error: 'Supabase client niet geïnitialiseerd' });
        return;
      }
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 Session check:', { 
        session: !!session, 
        error: sessionError,
        accessToken: session?.access_token ? 'Present' : 'Missing',
        refreshToken: session?.refresh_token ? 'Present' : 'Missing'
      });
      
      if (sessionError) {
        setTestResult({ 
          success: false, 
          error: sessionError.message,
          details: 'Session error occurred'
        });
        return;
      }
      
      if (!session?.access_token) {
        setTestResult({ 
          success: false, 
          error: 'Geen access token gevonden',
          details: 'User is not authenticated or session expired'
        });
        return;
      }

      // Test API call
      const response = await fetch('/api/test-session', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();
      console.log('🧪 API test result:', result);
      
      setTestResult(result);
      
    } catch (error) {
      console.error('❌ Test error:', error);
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Session Test</h3>
      
      <button
        onClick={testSession}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Session'}
      </button>
      
      {testResult && (
        <div className="mt-4 p-3 bg-white rounded border">
          <h4 className="font-medium mb-2">Result:</h4>
          <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 