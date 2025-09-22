'use client';

import { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XCircleIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
}

interface RetryStats {
  [operationId: string]: number;
}

export default function ErrorRecoveryDashboard() {
  const [circuitBreakers, setCircuitBreakers] = useState<{ [key: string]: CircuitBreakerState }>({});
  const [retryStats, setRetryStats] = useState<RetryStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchErrorRecoveryData();
    const interval = setInterval(fetchErrorRecoveryData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchErrorRecoveryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch circuit breaker states
      const circuitBreakerResponse = await fetch('/api/error-recovery/circuit-breakers');
      const circuitBreakerData = await circuitBreakerResponse.json();

      // Fetch retry statistics
      const retryResponse = await fetch('/api/error-recovery/retry-stats');
      const retryData = await retryResponse.json();

      if (circuitBreakerData.success) {
        setCircuitBreakers(circuitBreakerData.states);
      }

      if (retryData.success) {
        setRetryStats(retryData.stats);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetCircuitBreaker = async (key: string) => {
    try {
      const response = await fetch('/api/error-recovery/reset-circuit-breaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });

      if (response.ok) {
        await fetchErrorRecoveryData();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetAllCircuitBreakers = async () => {
    try {
      const response = await fetch('/api/error-recovery/reset-all-circuit-breakers', {
        method: 'POST'
      });

      if (response.ok) {
        await fetchErrorRecoveryData();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getCircuitBreakerColor = (state: string) => {
    switch (state) {
      case 'CLOSED': return 'text-green-600 bg-green-100';
      case 'OPEN': return 'text-red-600 bg-red-100';
      case 'HALF_OPEN': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCircuitBreakerIcon = (state: string) => {
    switch (state) {
      case 'CLOSED': return <CheckCircleIcon className="h-5 w-5" />;
      case 'OPEN': return <XCircleIcon className="h-5 w-5" />;
      case 'HALF_OPEN': return <ClockIcon className="h-5 w-5" />;
      default: return <ExclamationTriangleIcon className="h-5 w-5" />;
    }
  };

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Error Recovery Dashboard</h1>
          <p className="text-gray-600">Monitor circuit breakers and retry mechanisms</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Circuit Breakers</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(circuitBreakers).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Closed</p>
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(circuitBreakers).filter(cb => cb.state === 'CLOSED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-red-600">
                  {Object.values(circuitBreakers).filter(cb => cb.state === 'OPEN').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Half Open</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Object.values(circuitBreakers).filter(cb => cb.state === 'HALF_OPEN').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Circuit Breakers */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Circuit Breakers</h2>
            <div className="flex space-x-2">
              <button
                onClick={fetchErrorRecoveryData}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <ArrowPathIcon className="h-4 w-4 inline mr-2" />
                Refresh
              </button>
              <button
                onClick={resetAllCircuitBreakers}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Reset All
              </button>
            </div>
          </div>

          {Object.keys(circuitBreakers).length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No circuit breakers active</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(circuitBreakers).map(([key, state]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{key}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCircuitBreakerColor(state.state)}`}>
                      {getCircuitBreakerIcon(state.state)}
                      <span className="ml-1">{state.state}</span>
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Failures:</span>
                      <span className="font-medium">{state.failureCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Failure:</span>
                      <span className="font-medium">{formatTime(state.lastFailureTime)}</span>
                    </div>
                  </div>

                  {state.state === 'OPEN' && (
                    <button
                      onClick={() => resetCircuitBreaker(key)}
                      className="mt-3 w-full bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      Reset Circuit Breaker
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Retry Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Retry Statistics</h2>
          
          {Object.keys(retryStats).length === 0 ? (
            <div className="text-center py-8">
              <ArrowPathIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No retry operations in progress</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operation ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Retry Attempts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(retryStats).map(([operationId, attempts]) => (
                    <tr key={operationId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {operationId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attempts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attempts === 0 ? 'bg-green-100 text-green-800' :
                          attempts < 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {attempts === 0 ? 'Success' : attempts < 3 ? 'Retrying' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
