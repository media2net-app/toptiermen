// 🧪 AUTH SYSTEM TEST PAGE - Test beide auth systems side-by-side

'use client';

import { useState } from 'react';
import { useAuth as useOptimalAuth } from '../optimal/useAuth';
import { ProtectedRoute } from '../optimal/ProtectedRoute';

export function AuthTestPage() {
  const [testEmail, setTestEmail] = useState('test@toptiermen.com');
  const [testPassword, setTestPassword] = useState('TestPassword123!');
  const [testResults, setTestResults] = useState<any[]>([]);

  // Test optimal system
  const optimalAuth = useOptimalAuth();

  const addTestResult = (test: string, system: string, result: any, time: number) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      system,
      result: result.success ? '✅ Success' : '❌ Failed',
      error: result.error || null,
      time: `${time}ms`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testOptimalLogin = async () => {
    const startTime = performance.now();
    const result = await optimalAuth.signIn(testEmail, testPassword);
    const endTime = performance.now();
    addTestResult('Login', 'Optimal', result, Math.round(endTime - startTime));
  };

  const testOptimalLogout = async () => {
    const startTime = performance.now();
    const result = await optimalAuth.signOut();
    const endTime = performance.now();
    addTestResult('Logout', 'Optimal', result, Math.round(endTime - startTime));
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">🧪 Auth System Testing</h1>
          <p className="text-gray-600 text-center">
            Test en vergelijk beide auth systems side-by-side
          </p>
        </div>

        {/* Test Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Test Credentials */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🔑 Test Credentials</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📊 System Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Optimal System:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  optimalAuth.loading 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : optimalAuth.user 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {optimalAuth.loading ? 'Loading' : optimalAuth.user ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
              
              {optimalAuth.user && (
                <div className="text-sm text-gray-600">
                  <p>User: {optimalAuth.user.email}</p>
                  <p>Role: {optimalAuth.profile?.role || 'Loading...'}</p>
                </div>
              )}
              
              {optimalAuth.error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  Error: {optimalAuth.error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🎮 Test Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={testOptimalLogin}
              disabled={optimalAuth.loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎯 Test Optimal Login
            </button>
            
            <button
              onClick={testOptimalLogout}
              disabled={optimalAuth.loading || !optimalAuth.user}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎯 Test Optimal Logout
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              🔄 Reload Page
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              🧹 Clear Results
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Test Results</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Geen test resultaten nog. Start met testen!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Test</th>
                    <th className="text-left py-2">System</th>
                    <th className="text-left py-2">Result</th>
                    <th className="text-left py-2">Duration</th>
                    <th className="text-left py-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result) => (
                    <tr key={result.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-600">{result.timestamp}</td>
                      <td className="py-2 font-medium">{result.test}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.system === 'Optimal' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {result.system}
                        </span>
                      </td>
                      <td className="py-2">{result.result}</td>
                      <td className="py-2 text-gray-600">{result.time}</td>
                      <td className="py-2 text-red-600 text-xs">{result.error || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Protected Route Test */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🛡️ Protected Route Test</h2>
          
          <ProtectedRoute
            loadingComponent={
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Checking authentication...</p>
              </div>
            }
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-semibold mb-2">✅ Protected Content Loaded</h3>
              <p className="text-green-700 text-sm">
                Je ziet dit omdat je bent ingelogd met het optimal auth system.
              </p>
              <div className="mt-2 text-xs text-green-600">
                <p>User: {optimalAuth.user?.email}</p>
                <p>Role: {optimalAuth.profile?.role}</p>
                <p>Admin: {optimalAuth.isAdmin ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </ProtectedRoute>
        </div>
      </div>
    </div>
  );
}

export default AuthTestPage;
