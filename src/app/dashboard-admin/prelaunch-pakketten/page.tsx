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
  mollie_payment_id: string | null;
  payment_status: string;
  is_test_payment: boolean;
  created_at: string;
  updated_at: string;
}

export default function PrelaunchPakkettenPage() {
  const [packages, setPackages] = useState<PrelaunchPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const supabase = createClientComponentClient();

  const fetchPackages = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching prelaunch packages...');
      
      const { data, error } = await supabase
        .from('prelaunch_packages')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) {
        console.error('❌ Error fetching prelaunch packages:', error);
        setError(`Fout bij ophalen van data: ${error.message}`);
        setPackages([]);
      } else {
        console.log('✅ Successfully fetched packages:', data?.length || 0);
        setPackages(data || []);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Error fetching prelaunch packages:', err);
      setError('Fout bij ophalen van prelaunch pakketten');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [sortBy, sortOrder]);

  const filteredPackages = packages.filter(pkg => {
    if (filter === 'all') return true;
    if (filter === 'test') return pkg.is_test_payment;
    if (filter === 'paid') return pkg.payment_status === 'paid';
    if (filter === 'pending') return pkg.payment_status === 'pending';
    if (filter === 'failed') return pkg.payment_status === 'failed';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-900/20';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'failed': return 'text-red-400 bg-red-900/20';
      case 'cancelled': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPackageColor = (packageId: string) => {
    switch (packageId) {
      case 'basic': return 'text-blue-400 bg-blue-900/20';
      case 'premium': return 'text-purple-400 bg-purple-900/20';
      case 'lifetime': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">Laden...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Prelaunch Pakketten</h1>
          <p className="text-gray-300">Overzicht van alle prelaunch pakket aankopen</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="text-2xl font-bold text-white">{packages.length}</div>
            <div className="text-gray-400">Totaal Aankopen</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="text-2xl font-bold text-green-400">
              {packages.filter(p => p.payment_status === 'paid').length}
            </div>
            <div className="text-gray-400">Betaald</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="text-2xl font-bold text-yellow-400">
              {packages.filter(p => p.payment_status === 'pending').length}
            </div>
            <div className="text-gray-400">In Behandeling</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="text-2xl font-bold text-blue-400">
              {packages.filter(p => p.is_test_payment).length}
            </div>
            <div className="text-gray-400">Test Betalingen</div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
              >
                <option value="all">Alle</option>
                <option value="paid">Betaald</option>
                <option value="pending">In Behandeling</option>
                <option value="failed">Mislukt</option>
                <option value="test">Test Betalingen</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sorteer op:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
              >
                <option value="created_at">Datum</option>
                <option value="full_name">Naam</option>
                <option value="package_name">Pakket</option>
                <option value="payment_status">Status</option>
                <option value="discounted_price">Prijs</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Volgorde:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
              >
                <option value="desc">Nieuwste eerst</option>
                <option value="asc">Oudste eerst</option>
              </select>
            </div>
            <button
              onClick={fetchPackages}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Vernieuwen
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Packages Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredPackages.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-lg mb-2">Geen prelaunch pakketten gevonden</div>
                      <div className="text-gray-500 text-sm">Er zijn nog geen aankopen gedaan</div>
                      <div className="mt-4">
                        <button
                          onClick={fetchPackages}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Opnieuw laden
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{pkg.full_name}</div>
                        <div className="text-sm text-gray-400">{pkg.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPackageColor(pkg.package_id)}`}>
                        {pkg.package_name}
                      </span>
                      <div className="text-sm text-gray-400 mt-1">
                        {pkg.payment_period.includes('monthly') ? 'Maandelijks' : 
                         pkg.payment_period.includes('once') ? 'Eenmalig' : 
                         pkg.payment_period === 'lifetime' ? 'Levenslang' : pkg.payment_period}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {pkg.payment_method === 'monthly' ? 'Maandelijks' : 'Eenmalig'}
                      </div>
                      {pkg.mollie_payment_id && (
                        <div className="text-xs text-gray-400">
                          ID: {pkg.mollie_payment_id.substring(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {formatPrice(pkg.discounted_price)}
                      </div>
                      {pkg.discount_percentage > 0 && (
                        <div className="text-xs text-green-400">
                          -{pkg.discount_percentage}% korting
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.payment_status)}`}>
                        {pkg.payment_status === 'paid' ? 'Betaald' :
                         pkg.payment_status === 'pending' ? 'In Behandeling' :
                         pkg.payment_status === 'failed' ? 'Mislukt' :
                         pkg.payment_status === 'cancelled' ? 'Geannuleerd' : pkg.payment_status}
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
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">Geen prelaunch pakketten gevonden</div>
            <div className="text-gray-500 text-sm mt-2">
              {filter === 'all' ? 'Er zijn nog geen aankopen gedaan' : `Geen resultaten voor filter: ${filter}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
