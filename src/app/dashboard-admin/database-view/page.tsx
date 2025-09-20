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
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [syncingMollie, setSyncingMollie] = useState(false);
  const [updatingEmails, setUpdatingEmails] = useState(false);

  const supabase = createClientComponentClient();

  const fetchPackages = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching packages from API...');
      
      // First try the debug endpoint to see what's happening
      const debugResponse = await fetch('/api/admin/debug-packages');
      const debugResult = await debugResponse.json();
      
      console.log('🔍 Debug result:', debugResult);
      
      if (!debugResult.success) {
        console.error('❌ Debug API error:', debugResult.error);
        setError(`Debug error: ${debugResult.error} (Step: ${debugResult.step})`);
        setPackages([]);
        return;
      }
      
      console.log('✅ Debug successful:', {
        tableExists: debugResult.tableExists,
        count: debugResult.count,
        packagesLength: debugResult.packages?.length || 0
      });
      
      // Now try the regular endpoint
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
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(`Error fetching data: ${err.message}`);
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

  const syncMollieSales = async () => {
    try {
      setSyncingMollie(true);
      console.log('🔄 Syncing Mollie sales...');
      
      const response = await fetch('/api/admin/sync-mollie-sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Mollie sync successful:', result.summary);
        
        if (result.newPackages > 0) {
          alert(`✅ Mollie sync completed!\n\nNew packages found: ${result.newPackages}\nErrors: ${result.errors}\n\nRefreshing package list...`);
          // Refresh the packages list to show new sales
          await fetchPackages();
        } else {
          alert(`ℹ️ Mollie sync completed!\n\nNo new packages found.\n\nChecked ${result.summary.totalMolliePayments} recent payments from Mollie.`);
        }
      } else {
        console.error('❌ Mollie sync failed:', result.error);
        alert(`❌ Mollie sync failed: ${result.error}`);
      }
    } catch (err) {
      console.error('❌ Error syncing Mollie:', err);
      alert('❌ Error syncing Mollie sales');
    } finally {
      setSyncingMollie(false);
    }
  };

  const updateExistingEmails = async () => {
    try {
      setUpdatingEmails(true);
      console.log('🔄 Updating existing email addresses...');
      
      const response = await fetch('/api/admin/update-existing-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Email update successful:', result.summary);
        
        if (result.updated > 0) {
          alert(`✅ Email update completed!\n\nUpdated packages: ${result.updated}\nErrors: ${result.errors}\n\nRefreshing package list...`);
          // Refresh the packages list to show updated emails
          await fetchPackages();
        } else {
          alert(`ℹ️ Email update completed!\n\nNo packages needed updating.\n\nAll packages already have correct email addresses.`);
        }
      } else {
        console.error('❌ Email update failed:', result.error);
        alert(`❌ Email update failed: ${result.error}`);
      }
    } catch (err) {
      console.error('❌ Error updating emails:', err);
      alert('❌ Error updating email addresses');
    } finally {
      setUpdatingEmails(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      console.log('🔄 Auto-refreshing packages...');
      await fetchPackages();
      
      // Also sync Mollie sales every 2 minutes (4th refresh)
      const refreshCount = Math.floor(Date.now() / 30000) % 4;
      if (refreshCount === 0) {
        console.log('🔄 Auto-syncing Mollie sales...');
        try {
          const response = await fetch('/api/admin/sync-mollie-sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          const result = await response.json();
          if (result.success && result.newPackages > 0) {
            console.log(`✅ Auto-sync found ${result.newPackages} new packages`);
            await fetchPackages(); // Refresh again to show new packages
          }
        } catch (error) {
          console.error('Auto-sync error:', error);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatPrice = (price: number) => `€${price.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Database View - Prelaunch Pakketten
          </h1>
          <p className="text-gray-400">
            Weergave van betaalde entries + Ivo Hortulanus (test entries uitgefilterd)
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {packages.filter((pkg) => {
                const isIvoHortulanus = pkg.email === 'hortulanusglobalservices@gmail.com';
                const isPaid = pkg.payment_status === 'paid';
                return isPaid || isIvoHortulanus;
              }).length}
            </div>
            <div className="text-blue-300">Gefilterde Aankopen</div>
          </div>
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {packages.filter(p => p.payment_status === 'paid').length}
            </div>
            <div className="text-green-300">Betaald</div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {packages.filter((pkg) => {
                const isIvoHortulanus = pkg.email === 'hortulanusglobalservices@gmail.com';
                return isIvoHortulanus;
              }).length}
            </div>
            <div className="text-yellow-300">Speciale Entries</div>
          </div>
          <div className="bg-purple-900/20 border border-purple-500 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {packages.filter((pkg) => {
                const isIvoHortulanus = pkg.email === 'hortulanusglobalservices@gmail.com';
                const isPaid = pkg.payment_status === 'paid';
                return (isPaid || isIvoHortulanus) && pkg.is_test_payment;
              }).length}
            </div>
            <div className="text-purple-300">Test in Filter</div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-white">
            {loading ? 'Laden...' : `${packages.filter((pkg) => {
              const isIvoHortulanus = pkg.email === 'hortulanusglobalservices@gmail.com';
              const isPaid = pkg.payment_status === 'paid';
              return isPaid || isIvoHortulanus;
            }).length} gefilterde pakketten gevonden`}
            {autoRefresh && (
              <span className="ml-3 text-sm text-green-400">
                🔄 Auto-refresh actief (30s)
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={updateExistingEmails}
              disabled={updatingEmails}
              className={`px-4 py-2 rounded-lg transition-colors ${
                updatingEmails
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {updatingEmails ? '🔄 Updating...' : '📧 Fix Email Addresses'}
            </button>
            <button
              onClick={syncMollieSales}
              disabled={syncingMollie}
              className={`px-4 py-2 rounded-lg transition-colors ${
                syncingMollie
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {syncingMollie ? '🔄 Syncing...' : '🔄 Sync Mollie Sales'}
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {autoRefresh ? '⏸️ Pauzeer Auto-refresh' : '▶️ Start Auto-refresh'}
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/debug-packages');
                  const result = await response.json();
                  console.log('🔍 Debug result:', result);
                  alert(`Debug Info:\nTable exists: ${result.tableExists}\nCount: ${result.count}\nPackages: ${result.packages?.length || 0}\nError: ${result.error || 'None'}`);
                } catch (err) {
                  console.error('Debug error:', err);
                  alert(`Debug error: ${err.message}`);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔍 Debug Info
            </button>
            <button
              onClick={fetchPackages}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Handmatig Vernieuwen
            </button>
          </div>
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
                    Aanmaakdatum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Betalingstijd
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
                  packages
                    .filter((pkg) => {
                      // Show only paid entries, but always include Ivo Hortulanus
                      const isIvoHortulanus = pkg.email === 'hortulanusglobalservices@gmail.com';
                      const isPaid = pkg.payment_status === 'paid';
                      return isPaid || isIvoHortulanus;
                    })
                    .map((pkg) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {pkg.payment_status === 'paid' ? (
                          <span className="text-green-400">
                            {formatDate(pkg.updated_at)}
                          </span>
                        ) : pkg.payment_status === 'failed' ? (
                          <span className="text-red-400">
                            {formatDate(pkg.updated_at)}
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            Nog niet betaald
                          </span>
                        )}
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
            <div>Auto-refresh: {autoRefresh ? 'AAN (30s + Mollie sync every 2min)' : 'UIT'}</div>
            <div>Last fetch: {lastRefresh.toLocaleTimeString('nl-NL')}</div>
            <div>Next auto-refresh: {autoRefresh ? new Date(lastRefresh.getTime() + 30000).toLocaleTimeString('nl-NL') : 'Uitgeschakeld'}</div>
            <div>Mollie sync: {syncingMollie ? 'Bezig...' : 'Beschikbaar'}</div>
            <div>Email update: {updatingEmails ? 'Bezig...' : 'Beschikbaar'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
