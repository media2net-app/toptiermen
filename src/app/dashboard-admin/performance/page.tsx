'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface PerformanceStats {
  totalRequests: number;
  averageQueryTime: number;
  maxQueryTime: number;
  minQueryTime: number;
  cacheHitRate: number;
  errorRate: number;
  slowQueries: number;
}

interface EndpointBreakdown {
  [endpoint: string]: {
    count: number;
    totalTime: number;
    avgTime: number;
    cacheHits: number;
  };
}

interface SlowQuery {
  timestamp: string;
  endpoint: string;
  queryTime: number;
  dataSize: number;
  cacheHit: boolean;
  userId?: string;
  error?: string;
}

export default function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [endpointBreakdown, setEndpointBreakdown] = useState<EndpointBreakdown>({});
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');
  const [endpoint, setEndpoint] = useState('');

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange, endpoint]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (timeRange) params.append('timeRange', timeRange);
      if (endpoint) params.append('endpoint', endpoint);

      const response = await fetch(`/api/performance-monitoring?${params}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setEndpointBreakdown(data.endpointBreakdown);
        setSlowQueries(data.recentSlowQueries);
        
        // Generate recommendations based on stats
        const recs: string[] = [];
        if (data.stats.averageQueryTime > 500) {
          recs.push('Consider optimizing database queries - average response time is high');
        }
        if (data.stats.cacheHitRate < 70) {
          recs.push('Cache hit rate is low - consider implementing more aggressive caching');
        }
        if (data.stats.errorRate > 5) {
          recs.push('Error rate is high - investigate and fix API errors');
        }
        if (data.stats.slowQueries > 10) {
          recs.push('Multiple slow queries detected - review and optimize slow endpoints');
        }
        if (recs.length === 0) {
          recs.push('Performance looks good! No immediate optimizations needed.');
        }
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
          <p className="text-gray-600">Monitor API performance and system health</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint Filter
              </label>
              <select
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Endpoints</option>
                <option value="dashboard">Dashboard</option>
                <option value="activity-log">Activity Log</option>
                <option value="members-data">Members Data</option>
                <option value="chat">Chat</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchPerformanceData}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(stats.averageQueryTime, { good: 200, warning: 500 })}`}>
                    {formatTime(stats.averageQueryTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(100 - stats.cacheHitRate, { good: 20, warning: 40 })}`}>
                    {stats.cacheHitRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(stats.errorRate, { good: 1, warning: 5 })}`}>
                    {stats.errorRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Recommendations</h2>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Endpoint Breakdown */}
        {Object.keys(endpointBreakdown).length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Endpoint Performance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Endpoint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cache Hits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(endpointBreakdown).map(([endpoint, data]) => (
                    <tr key={endpoint}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {endpoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {data.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(data.avgTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {data.cacheHits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          data.avgTime < 200 ? 'bg-green-100 text-green-800' :
                          data.avgTime < 500 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {data.avgTime < 200 ? 'Good' : data.avgTime < 500 ? 'Warning' : 'Slow'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Slow Queries */}
        {slowQueries.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Slow Queries</h2>
            <div className="space-y-4">
              {slowQueries.map((query, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{query.endpoint}</span>
                    <span className="text-sm text-red-600 font-semibold">{formatTime(query.queryTime)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Time: {new Date(query.timestamp).toLocaleString()}</p>
                    {query.userId && <p>User: {query.userId}</p>}
                    {query.error && <p className="text-red-600">Error: {query.error}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
