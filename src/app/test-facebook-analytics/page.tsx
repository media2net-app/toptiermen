'use client';

import { useState, useEffect } from 'react';

export default function TestFacebookAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('🧪 Testing comprehensive Facebook analytics API...');
        
        const response = await fetch('/api/facebook/comprehensive-analytics?dateRange=last_30d');
        const result = await response.json();
        
        console.log('🧪 API Response:', result);
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Unknown error');
        }
      } catch (err) {
        console.error('🧪 API Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Testing Facebook Analytics API</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Testing Facebook Analytics API</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Facebook Analytics API Test Results</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold">{data?.summary?.totalCampaigns || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold">{data?.summary?.activeCampaigns || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spend</p>
              <p className="text-2xl font-bold">€{(data?.summary?.totalSpend || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold">{(data?.summary?.totalClicks || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Campaigns ({data?.campaigns?.length || 0})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spend</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CTR</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.campaigns?.map((campaign: any) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€{campaign.spend?.toFixed(2) || '0.00'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.clicks?.toLocaleString() || '0'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(campaign.ctr || 0).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Raw Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
