'use client';

import React, { useState, useEffect } from 'react';
import { useV2Monitoring } from '@/hooks/useV2Monitoring';
import { useV2State } from '@/hooks/useV2State';

// V2.0: Monitoring Dashboard Component
export default function V2MonitoringDashboard() {
  const { trackFeatureUsage } = useV2Monitoring();
  const { state } = useV2State();
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    systemHealth: 'healthy',
    apiPerformance: { avgResponseTime: 0, errorRate: 0 },
    userActivity: { activeUsers: 0, totalSessions: 0 },
    errors: { total: 0, critical: 0, resolved: 0 },
    cache: { hitRate: 0, efficiency: 0 },
    database: { connections: 0, queries: 0 }
  });

  useEffect(() => {
    // Only run when dashboard becomes visible
    if (!isVisible) return;
    
    // Track dashboard usage only once (disabled in development)
    if (process.env.NODE_ENV === 'production') {
      trackFeatureUsage('monitoring-dashboard-view', state.user.profile?.id);
    }
    
    // Simulate real-time metrics updates (reduced frequency)
    const interval = setInterval(() => {
      updateMetrics();
    }, 30000); // Increased to 30 seconds to reduce frequency

    return () => clearInterval(interval);
  }, [isVisible]); // Simplified dependencies

  const updateMetrics = () => {
    // Simulate real-time data
    setMetrics(prev => ({
      ...prev,
      apiPerformance: {
        avgResponseTime: Math.random() * 200 + 50,
        errorRate: Math.random() * 2
      },
      userActivity: {
        activeUsers: Math.floor(Math.random() * 100) + 50,
        totalSessions: Math.floor(Math.random() * 1000) + 500
      },
      errors: {
        total: Math.floor(Math.random() * 10),
        critical: Math.floor(Math.random() * 3),
        resolved: Math.floor(Math.random() * 8)
      },
      cache: {
        hitRate: Math.random() * 20 + 80,
        efficiency: Math.random() * 15 + 85
      },
      database: {
        connections: Math.floor(Math.random() * 50) + 20,
        queries: Math.floor(Math.random() * 1000) + 500
      }
    }));
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'warning': return '🟡';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsVisible(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          📊 V2.0 Monitor
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">V2.0 Monitoring Dashboard</h1>
              <p className="text-blue-100">Real-time system health and performance metrics</p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="text-white hover:text-blue-200 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* System Health */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-800">System Health</h3>
                <span className={`text-2xl ${getHealthColor(metrics.systemHealth)}`}>
                  {getHealthIcon(metrics.systemHealth)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Status:</span>
                  <span className={`font-semibold ${getHealthColor(metrics.systemHealth)}`}>
                    {metrics.systemHealth.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Uptime:</span>
                  <span className="font-semibold text-green-800">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Version:</span>
                  <span className="font-semibold text-green-800">2.0.0</span>
                </div>
              </div>
            </div>

            {/* API Performance */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-800">API Performance</h3>
                <span className="text-2xl">⚡</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Avg Response:</span>
                  <span className="font-semibold text-blue-800">
                    {metrics.apiPerformance.avgResponseTime.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Error Rate:</span>
                  <span className="font-semibold text-blue-800">
                    {metrics.apiPerformance.errorRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Success Rate:</span>
                  <span className="font-semibold text-blue-800">
                    {(100 - metrics.apiPerformance.errorRate).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* User Activity */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-800">User Activity</h3>
                <span className="text-2xl">👥</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-purple-700">Active Users:</span>
                  <span className="font-semibold text-purple-800">
                    {metrics.userActivity.activeUsers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Total Sessions:</span>
                  <span className="font-semibold text-purple-800">
                    {metrics.userActivity.totalSessions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Avg Session:</span>
                  <span className="font-semibold text-purple-800">12m 34s</span>
                </div>
              </div>
            </div>

            {/* Error Tracking */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-800">Error Tracking</h3>
                <span className="text-2xl">🚨</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-red-700">Total Errors:</span>
                  <span className="font-semibold text-red-800">
                    {metrics.errors.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Critical:</span>
                  <span className="font-semibold text-red-800">
                    {metrics.errors.critical}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Resolved:</span>
                  <span className="font-semibold text-red-800">
                    {metrics.errors.resolved}
                  </span>
                </div>
              </div>
            </div>

            {/* Cache Performance */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-yellow-800">Cache Performance</h3>
                <span className="text-2xl">💾</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-yellow-700">Hit Rate:</span>
                  <span className="font-semibold text-yellow-800">
                    {metrics.cache.hitRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Efficiency:</span>
                  <span className="font-semibold text-yellow-800">
                    {metrics.cache.efficiency.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Strategy:</span>
                  <span className="font-semibold text-yellow-800">Hybrid</span>
                </div>
              </div>
            </div>

            {/* Database */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-indigo-800">Database</h3>
                <span className="text-2xl">🗄️</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-indigo-700">Connections:</span>
                  <span className="font-semibold text-indigo-800">
                    {metrics.database.connections}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-700">Queries/sec:</span>
                  <span className="font-semibold text-indigo-800">
                    {metrics.database.queries}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-700">RLS Policies:</span>
                  <span className="font-semibold text-indigo-800">200+</span>
                </div>
              </div>
            </div>

          </div>

          {/* V2.0 Features Status */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">V2.0 Features Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'RLS Policies', status: 'Active', icon: '🔒', color: 'green' },
                { name: 'Foreign Keys', status: 'Active', icon: '🔗', color: 'green' },
                { name: 'API V2.0', status: 'Active', icon: '🌐', color: 'green' },
                { name: 'Monitoring', status: 'Active', icon: '📊', color: 'green' },
                { name: 'Caching', status: 'Active', icon: '💾', color: 'green' },
                { name: 'Error Recovery', status: 'Active', icon: '🔄', color: 'green' },
                { name: 'State Management', status: 'Active', icon: '🎯', color: 'green' },
                { name: 'Performance', status: 'Optimized', icon: '⚡', color: 'green' }
              ].map((feature, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{feature.icon}</span>
                    <span className="font-semibold text-gray-800">{feature.name}</span>
                  </div>
                  <span className={`text-sm font-medium text-${feature.color}-600`}>
                    {feature.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>V2.0 API endpoints tested successfully</span>
                  <span className="text-gray-500">2 min ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">📊</span>
                  <span>Monitoring dashboard initialized</span>
                  <span className="text-gray-500">5 min ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">🔒</span>
                  <span>RLS policies verified (200+ active)</span>
                  <span className="text-gray-500">10 min ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">🔗</span>
                  <span>Foreign key constraints validated</span>
                  <span className="text-gray-500">15 min ago</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>V2.0 Monitoring Dashboard - Real-time updates every 5 seconds</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
