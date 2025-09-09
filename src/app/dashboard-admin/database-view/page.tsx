'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

export default function DatabaseViewPage() {
  const [packages, setPackages] = useState<PrelaunchPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<number | null>(null);

  const supabase = createClientComponentClient();

  const fetchPackages = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching packages from API...');
      
      const response = await fetch('/api/admin/get-packages-for-frontend');
      const result = await response.json();

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

  const checkMollieStatus = async (packageId: number) => {
    try {
      setCheckingStatus(packageId);
      console.log(`🔍 Checking Mollie status for package ${packageId}...`);
      
      const response = await fetch('/api/admin/check-mollie-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Status check successful:', result);
        if (result.statusChanged) {
          // Refresh the packages list to show updated status
          await fetchPackages();
        }
        alert(`Status check completed!\nMollie Status: ${result.mollieStatus}\nOur Status: ${result.ourStatus}\nStatus Changed: ${result.statusChanged ? 'Yes' : 'No'}`);
      } else {
        console.error('❌ Status check failed:', result.error);
        alert(`Status check failed: ${result.error}`);
      }
    } catch (err) {
      console.error('❌ Error checking status:', err);
      alert('Error checking status');
    } finally {
      setCheckingStatus(null);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const formatPrice = (price: number) => `€${price.toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('nl-NL');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Database View - Prelaunch Pakketten
          </h1>
          <p className="text-gray-400">
            Directe weergave van alle database entries
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {packages.length}
            </div>
            <div className="text-blue-300">Totaal Aankopen</div>
          </div>
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {packages.filter(p => p.payment_status === 'paid').length}
            </div>
            <div className="text-green-300">Betaald</div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {packages.filter(p => p.payment_status === 'pending').length}
            </div>
            <div className="text-yellow-300">In Behandeling</div>
          </div>
          <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {packages.filter(p => p.is_test_payment).length}
            </div>
            <div className="text-purple-300">Test Betalingen</div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-white">
            {loading ? 'Laden...' : `${packages.length} pakketten gevonden`}
          </div>
          <button
            onClick={fetchPackages}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🔄 Vernieuwen
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {/* Packages Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Naam & Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Pakket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Betaling
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Prijs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-lg mb-2">
                        {loading ? 'Laden...' : 'Geen pakketten gevonden'}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {loading ? 'Data wordt opgehaald...' : 'Er zijn nog geen aankopen gedaan'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        #{pkg.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{pkg.full_name}</div>
                          <div className="text-sm text-gray-400">{pkg.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pkg.package_id === 'basic' ? 'text-blue-400 bg-blue-900/20' :
                          pkg.package_id === 'premium' ? 'text-purple-400 bg-purple-900/20' :
                          pkg.package_id === 'lifetime' ? 'text-yellow-400 bg-yellow-900/20' :
                          'text-gray-400 bg-gray-900/20'
                        }`}>
                          {pkg.package_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {pkg.payment_period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-white">
                            {formatPrice(pkg.discounted_price)}
                          </div>
                          {pkg.discount_percentage > 0 && (
                            <div className="text-xs text-green-400">
                              -{pkg.discount_percentage}% korting
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pkg.payment_status === 'paid' ? 'text-green-400 bg-green-900/20' :
                          pkg.payment_status === 'pending' ? 'text-yellow-400 bg-yellow-900/20' :
                          pkg.payment_status === 'failed' ? 'text-red-400 bg-red-900/20' :
                          'text-gray-400 bg-gray-900/20'
                        }`}>
                          {pkg.payment_status === 'paid' ? 'Betaald' :
                           pkg.payment_status === 'pending' ? 'In Behandeling' :
                           pkg.payment_status === 'failed' ? 'Mislukt' : pkg.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {pkg.is_test_payment ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-orange-400 bg-orange-900/20">
                            Test
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-400 bg-green-900/20">
                            Live
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(pkg.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => checkMollieStatus(pkg.id)}
                          disabled={checkingStatus === pkg.id}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            checkingStatus === pkg.id
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {checkingStatus === pkg.id ? 'Checking...' : 'Check Status'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-gray-800/30 border border-gray-600 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">🔧 Debug Info</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <div>Loading: {loading ? 'true' : 'false'}</div>
            <div>Error: {error || 'none'}</div>
            <div>Packages count: {packages.length}</div>
            <div>Last fetch: {new Date().toLocaleTimeString('nl-NL')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
