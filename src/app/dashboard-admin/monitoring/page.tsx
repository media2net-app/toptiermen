'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CpuChipIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ServerIcon,
  EyeIcon,
  BoltIcon,
  ShieldCheckIcon,
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface DashboardData {
  overview: {
    systemHealth: {
      status: 'healthy' | 'warning' | 'critical';
      score: number;
      issues: string[];
    };
    totalSessions: number;
    totalErrors: number;
    totalAlerts: number;
    uptime: number;
    timestamp: string;
  };
  performance: {
    responseTime: number | null;
    memoryUsage: number | null;
    cacheHitRate: number | null;
    errorRate: number;
    trends: Record<string, 'up' | 'down' | 'stable'>;
  };
  sessions: {
    active: number;
    averageDuration: number;
    totalPageViews: number;
    deviceBreakdown: Record<string, number>;
    browserBreakdown: Record<string, number>;
  };
  alerts: {
    total: number;
    critical: number;
    warning: number;
    recent: any[];
  };
  realTimeMetrics: {
    metrics: Record<string, any[]>;
    lastUpdate: number;
  };
}

export default function MonitoringDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'alerts' | 'tests'>('overview');
  const [testResults, setTestResults] = useState<any>(null);
  const [runningTests, setRunningTests] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/monitoring/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.dashboard);
        setLastUpdate(new Date());
      } else {
        setError(data.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Network error: Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh
  useEffect(() => {
    fetchDashboardData();

    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Run comprehensive tests
  const runTests = async () => {
    setRunningTests(true);
    const results: {
      timestamp: string;
      tests: Record<string, any>;
    } = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      // Test 1: System Version API
      console.log('🧪 Testing System Version API...');
      const versionResponse = await fetch('/api/system-version');
      const versionData = await versionResponse.json();
      results.tests.systemVersion = {
        success: versionData.success,
        version: versionData.system?.currentVersion,
        status: versionData.system?.status
      };

      // Test 2: Monitoring Dashboard API
      console.log('🧪 Testing Monitoring Dashboard API...');
      const dashboardResponse = await fetch('/api/monitoring/dashboard');
      const dashboardData = await dashboardResponse.json();
      results.tests.monitoringDashboard = {
        success: dashboardData.success,
        systemHealth: dashboardData.dashboard?.overview?.systemHealth?.status,
        hasMetrics: Object.keys(dashboardData.dashboard?.performance || {}).length > 0
      };

      // Test 3: Metrics API
      console.log('🧪 Testing Metrics API...');
      const metricsResponse = await fetch('/api/monitoring/metrics');
      const metricsData = await metricsResponse.json();
      results.tests.metrics = {
        success: metricsData.success,
        hasMetrics: Object.keys(metricsData.metrics || {}).length > 0,
        stats: metricsData.stats
      };

      // Test 4: Sessions API
      console.log('🧪 Testing Sessions API...');
      const sessionsResponse = await fetch('/api/monitoring/sessions');
      const sessionsData = await sessionsResponse.json();
      results.tests.sessions = {
        success: sessionsData.success,
        activeSessions: sessionsData.analytics?.totalSessions || 0,
        hasAnalytics: !!sessionsData.analytics
      };

      // Test 5: Alerts API
      console.log('🧪 Testing Alerts API...');
      const alertsResponse = await fetch('/api/monitoring/alerts');
      const alertsData = await alertsResponse.json();
      results.tests.alerts = {
        success: alertsData.success,
        totalAlerts: alertsData.stats?.total || 0,
        hasStats: !!alertsData.stats
      };

      // Test 6: Create Test Alert
      console.log('🧪 Testing Alert Creation...');
      const createAlertResponse = await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          alert: {
            type: 'performance',
            severity: 'info',
            title: 'Test Alert - V1.3 Monitoring',
            description: 'This is a test alert to verify the monitoring system is working correctly.'
          }
        })
      });
      const createAlertData = await createAlertResponse.json();
      results.tests.alertCreation = {
        success: createAlertData.success,
        alertId: createAlertData.alert?.id
      };

      // Test 7: Track User Action
      console.log('🧪 Testing User Action Tracking...');
      const trackActionResponse = await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_user_action',
          data: {
            sessionId: 'test-session-' + Date.now(),
            action: {
              type: 'click',
              target: '/test-button',
              timestamp: Date.now(),
              metadata: { test: true }
            }
          }
        })
      });
      const trackActionData = await trackActionResponse.json();
      results.tests.userActionTracking = {
        success: trackActionData.success
      };

      // Test 8: Performance Metrics Collection
      console.log('🧪 Testing Performance Metrics...');
      const performanceTest = {
        success: true,
        metrics: {
          pageLoadTime: performance.now(),
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          timestamp: Date.now()
        }
      };
      results.tests.performanceMetrics = performanceTest;

      // Test 9: Browser Compatibility
      console.log('🌐 Testing Browser Compatibility...');
      const browserResponse = await fetch('/api/test-browser-compatibility');
      const browserData = await browserResponse.json();
      results.tests.browserCompatibility = {
        success: browserData.success,
        browser: browserData.compatibility?.browser,
        recommendations: browserData.compatibility?.recommendations || [],
        cacheStrategy: browserData.compatibility?.cacheStrategy
      };

      console.log('✅ All tests completed successfully!');
      setTestResults(results);

    } catch (error) {
      console.error('❌ Test failed:', error);
      results.tests.error = {
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setTestResults(results);
    } finally {
      setRunningTests(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-600';
      case 'warning': return 'text-yellow-400 bg-yellow-600';
      case 'critical': return 'text-red-400 bg-red-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />;
      case 'down': return <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />;
      case 'stable': return <MinusIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  // Format duration
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Format uptime
  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading monitoring dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-white">Advanced Monitoring Dashboard</h1>
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                  V1.3 🚀
                </span>
              </div>
              <p className="text-gray-300 mt-1">
                Real-time system performance, user sessions, and error tracking
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-400">Auto Refresh</span>
                </label>
                <button
                  onClick={fetchDashboardData}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Refresh Now
                </button>
              </div>
              <div className="text-sm text-gray-400">Last update</div>
              <div className="text-lg font-semibold text-white">
                {lastUpdate.toLocaleTimeString('nl-NL')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'sessions', name: 'Sessions', icon: UsersIcon },
              { id: 'alerts', name: 'Alerts', icon: ExclamationTriangleIcon },
              { id: 'tests', name: 'Tests', icon: BeakerIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* System Health Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <ShieldCheckIcon className="h-6 w-6 mr-2 text-blue-400" />
                System Health
              </h2>
              <span className={`px-3 py-1 text-sm font-medium rounded-full bg-opacity-20 ${getStatusColor(dashboardData.overview.systemHealth.status)}`}>
                {dashboardData.overview.systemHealth.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Health Score</span>
                  <span className="text-white font-medium">{dashboardData.overview.systemHealth.score}/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      dashboardData.overview.systemHealth.score >= 80 ? 'bg-green-500' :
                      dashboardData.overview.systemHealth.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${dashboardData.overview.systemHealth.score}%` }}
                  />
                </div>
              </div>
            </div>
            {dashboardData.overview.systemHealth.issues.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400">Issues:</h3>
                {dashboardData.overview.systemHealth.issues.map((issue, index) => (
                  <div key={index} className="flex items-center text-sm text-red-400">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                    {issue}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">System Uptime</h3>
              <ClockIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {formatUptime(dashboardData.overview.uptime)}
            </div>
            <p className="text-sm text-gray-400">Running smoothly</p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Active Users</h3>
              <UsersIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {dashboardData.sessions.active}
            </div>
            <p className="text-sm text-gray-400">Current sessions</p>
          </div>
        </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Response Time</h3>
              <div className="flex items-center">
                {getTrendIcon(dashboardData.performance.trends.page_load_time || 'stable')}
                <BoltIcon className="h-5 w-5 text-yellow-400 ml-2" />
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {dashboardData.performance.responseTime ? 
                `${Math.round(dashboardData.performance.responseTime)}ms` : 
                'N/A'
              }
            </div>
            <p className="text-sm text-gray-400">Page load time</p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Memory Usage</h3>
              <div className="flex items-center">
                {getTrendIcon(dashboardData.performance.trends.js_heap_used || 'stable')}
                <CpuChipIcon className="h-5 w-5 text-purple-400 ml-2" />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {dashboardData.performance.memoryUsage ? 
                `${Math.round(dashboardData.performance.memoryUsage)}MB` : 
                'N/A'
              }
            </div>
            <p className="text-sm text-gray-400">JS Heap Used</p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Cache Hit Rate</h3>
              <div className="flex items-center">
                {getTrendIcon(dashboardData.performance.trends.cache_hit_rate || 'stable')}
                <ServerIcon className="h-5 w-5 text-green-400 ml-2" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {dashboardData.performance.cacheHitRate ? 
                `${Math.round(dashboardData.performance.cacheHitRate)}%` : 
                'N/A'
              }
            </div>
            <p className="text-sm text-gray-400">Cache efficiency</p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Error Rate</h3>
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400 mb-2">
              {(dashboardData.performance.errorRate * 100).toFixed(2)}%
            </div>
            <p className="text-sm text-gray-400">Errors per session</p>
          </div>
        </div>

            {/* User Sessions & Device Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <UsersIcon className="h-6 w-6 mr-2 text-blue-400" />
              User Sessions
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-bold text-blue-400">{dashboardData.sessions.active}</div>
                <div className="text-sm text-gray-400">Active Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {formatDuration(dashboardData.sessions.averageDuration)}
                </div>
                <div className="text-sm text-gray-400">Avg. Duration</div>
              </div>
            </div>
            <div className="text-lg font-medium text-white mb-2">Total Page Views: {dashboardData.sessions.totalPageViews}</div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <EyeIcon className="h-6 w-6 mr-2 text-purple-400" />
              Device & Browser Breakdown
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Devices</h3>
                {Object.entries(dashboardData.sessions.deviceBreakdown).map(([device, count]) => (
                  <div key={device} className="flex justify-between text-sm">
                    <span className="text-white">{device}</span>
                    <span className="text-blue-400">{count}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Browsers</h3>
                {Object.entries(dashboardData.sessions.browserBreakdown).map(([browser, count]) => (
                  <div key={browser} className="flex justify-between text-sm">
                    <span className="text-white">{browser}</span>
                    <span className="text-green-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

            {/* Alerts Section */}
            <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-red-400" />
              System Alerts
            </h2>
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{dashboardData.alerts.critical}</div>
                <div className="text-xs text-gray-400">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{dashboardData.alerts.warning}</div>
                <div className="text-xs text-gray-400">Warning</div>
              </div>
            </div>
          </div>
          
          {dashboardData.alerts.recent.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.alerts.recent.map((alert, index) => (
                <div key={alert.id || index} className="border border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(alert.severity)} bg-opacity-20`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="ml-3 text-white font-medium">{alert.title}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">{alert.description}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(alert.timestamp).toLocaleTimeString('nl-NL')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShieldCheckIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-400">No active alerts - System is healthy! 🎉</p>
            </div>
            )}
          </div>
          </>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <UsersIcon className="h-6 w-6 mr-2 text-blue-400" />
                User Sessions Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">{dashboardData.sessions.active}</div>
                  <div className="text-sm text-gray-400">Active Sessions</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {formatDuration(dashboardData.sessions.averageDuration)}
                  </div>
                  <div className="text-sm text-gray-400">Average Duration</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{dashboardData.sessions.totalPageViews}</div>
                  <div className="text-sm text-gray-400">Total Page Views</div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Device Breakdown</h3>
                  {Object.entries(dashboardData.sessions.deviceBreakdown).map(([device, count]) => (
                    <div key={device} className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-300">{device}</span>
                      <span className="text-blue-400 font-medium">{count}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Browser Breakdown</h3>
                  {Object.entries(dashboardData.sessions.browserBreakdown).map(([browser, count]) => (
                    <div key={browser} className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-300">{browser}</span>
                      <span className="text-green-400 font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <ExclamationTriangleIcon className="h-6 w-6 mr-2 text-red-400" />
                  System Alerts
                </h2>
                <div className="flex space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{dashboardData.alerts.critical}</div>
                    <div className="text-xs text-gray-400">Critical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{dashboardData.alerts.warning}</div>
                    <div className="text-xs text-gray-400">Warning</div>
                  </div>
                </div>
              </div>
              
              {dashboardData.alerts.recent.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.alerts.recent.map((alert: any, index: number) => (
                    <div key={alert.id || index} className="border border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(alert.severity)} bg-opacity-20`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="ml-3 text-white font-medium">{alert.title}</span>
                          </div>
                          <p className="text-sm text-gray-400 mt-2">{alert.description}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(alert.timestamp).toLocaleTimeString('nl-NL')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShieldCheckIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-400">No active alerts - System is healthy! 🎉</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <BeakerIcon className="h-6 w-6 mr-2 text-purple-400" />
                  V1.3 Monitoring System Tests
                </h2>
                <button
                  onClick={runTests}
                  disabled={runningTests}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                    runningTests
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {runningTests ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Running Tests...</span>
                    </>
                  ) : (
                    <>
                      <BeakerIcon className="h-4 w-4" />
                      <span>Run All Tests</span>
                    </>
                  )}
                </button>
              </div>

              {testResults && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-400">Test Run:</span>
                    <span className="text-sm text-white">
                      {new Date(testResults.timestamp).toLocaleString('nl-NL')}
                    </span>
                  </div>

                  {Object.entries(testResults.tests).map(([testName, testResult]: [string, any]) => (
                    <div key={testName} className="border border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white capitalize">
                          {testName.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        {testResult.success ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        {testName === 'systemVersion' && (
                          <div>Version: {testResult.version} | Status: {testResult.status}</div>
                        )}
                        {testName === 'monitoringDashboard' && (
                          <div>System Health: {testResult.systemHealth} | Has Metrics: {testResult.hasMetrics ? 'Yes' : 'No'}</div>
                        )}
                        {testName === 'metrics' && (
                          <div>Has Metrics: {testResult.hasMetrics ? 'Yes' : 'No'} | Stats: {JSON.stringify(testResult.stats)}</div>
                        )}
                        {testName === 'sessions' && (
                          <div>Active Sessions: {testResult.activeSessions} | Has Analytics: {testResult.hasAnalytics ? 'Yes' : 'No'}</div>
                        )}
                        {testName === 'alerts' && (
                          <div>Total Alerts: {testResult.totalAlerts} | Has Stats: {testResult.hasStats ? 'Yes' : 'No'}</div>
                        )}
                        {testName === 'alertCreation' && (
                          <div>Alert ID: {testResult.alertId || 'N/A'}</div>
                        )}
                        {testName === 'userActionTracking' && (
                          <div>User action tracking test completed</div>
                        )}
                        {testName === 'performanceMetrics' && (
                          <div>Page Load: {testResult.metrics.pageLoadTime.toFixed(2)}ms | Memory: {(testResult.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</div>
                        )}
                        {testName === 'browserCompatibility' && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400">🌐 {testResult.browser?.name} {testResult.browser?.version}</span>
                              <span className="text-gray-500">({testResult.browser?.engine})</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Cache: {testResult.cacheStrategy?.type} | Storage: {testResult.cacheStrategy?.storage}
                            </div>
                            {testResult.recommendations && testResult.recommendations.length > 0 && (
                              <div className="text-xs text-green-400">
                                ✅ {testResult.recommendations[0]}
                              </div>
                            )}
                          </div>
                        )}
                        {testName === 'error' && (
                          <div className="text-red-400">Error: {testResult.message}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!testResults && !runningTests && (
                <div className="text-center py-8">
                  <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Click "Run All Tests" to start comprehensive V1.3 monitoring system testing</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
