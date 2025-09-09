'use client';

import { useState, useEffect } from 'react';

interface PrelaunchPackage {
  id: number;
  full_name: string;
  email: string;
  package_id: string;
  package_name: string;
  payment_period: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  payment_method: string;
  mollie_payment_id: string;
  payment_status: string;
  is_test_payment: boolean;
  created_at: string;
  updated_at: string;
}

export default function SimpleTestPage() {
  const [packages, setPackages] = useState<PrelaunchPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');

  const fetchPackages = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching packages...');
      
      const response = await fetch('/api/admin/get-packages-for-frontend');
      const responseText = await response.text();
      setRawResponse(responseText);
      
      const result = JSON.parse(responseText);

      if (!result.success) {
        console.error('❌ API error:', result.error);
        setError(`API error: ${result.error}`);
        setPackages([]);
      } else {
        console.log('✅ Successfully fetched packages:', result.count);
        setPackages(result.packages || []);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          🧪 Simple Test Page
        </h1>

        <div className="mb-6">
          <button
            onClick={fetchPackages}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🔄 Test API Call
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Raw Response */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Raw API Response</h2>
            <pre className="text-sm text-gray-300 bg-gray-900 p-4 rounded overflow-auto max-h-96">
              {rawResponse || 'No response yet...'}
            </pre>
          </div>

          {/* Right: Parsed Data */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Parsed Data</h2>
            
            {loading && <div className="text-yellow-400">Loading...</div>}
            {error && <div className="text-red-400">Error: {error}</div>}
            
            <div className="text-white">
              <div className="mb-4">
                <strong>Count:</strong> {packages.length}
              </div>
              
              {packages.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-300">First 3 packages:</div>
                  {packages.slice(0, 3).map((pkg) => (
                    <div key={pkg.id} className="bg-gray-700 p-3 rounded text-sm">
                      <div><strong>ID:</strong> {pkg.id}</div>
                      <div><strong>Name:</strong> {pkg.full_name}</div>
                      <div><strong>Email:</strong> {pkg.email}</div>
                      <div><strong>Package:</strong> {pkg.package_name}</div>
                      <div><strong>Price:</strong> €{pkg.discounted_price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
