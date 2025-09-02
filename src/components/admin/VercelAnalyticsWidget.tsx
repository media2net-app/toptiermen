'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  EyeIcon, 
  GlobeAltIcon, 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeEuropeAfricaIcon,
  LinkIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { AdminCard } from '@/components/admin';

interface VercelAnalyticsData {
  visitors: number;
  pageViews: number;
  bounceRate: number;
  topPages: Array<{ path: string; visitors: number }>;
  topReferrers: Array<{ referrer: string; visitors: number }>;
  countries: Array<{ country: string; percentage: number }>;
  devices: Array<{ device: string; percentage: number }>;
  browsers: Array<{ browser: string; percentage: number }>;
  operatingSystems: Array<{ os: string; percentage: number }>;
  trendData: Array<{ date: string; visitors: number }>;
}

interface VercelSpeedInsightsData {
  realExperienceScore: number;
  coreWebVitals: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    interactionToNextPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    timeToFirstByte: number;
  };
  performanceByRoute: Array<{ route: string; cls: number; status: string }>;
  performanceByCountry: Array<{ country: string; cls: number; status: string; occurrences: number }>;
  performanceByDevice: Array<{ device: string; cls: number; status: string; percentage: number }>;
  trendData: Array<{ date: string; cls: number }>;
}

interface VercelAnalyticsWidgetProps {
  period: string;
  type?: 'analytics' | 'speed-insights';
}

export default function VercelAnalyticsWidget({ period, type = 'analytics' }: VercelAnalyticsWidgetProps) {
  const [data, setData] = useState<VercelAnalyticsData | VercelSpeedInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVercelData();
  }, [period, type]);

  const fetchVercelData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/vercel-analytics?type=${type}&period=${period}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch Vercel data');
      }
    } catch (err) {
      setError('Failed to fetch Vercel data');
      console.error('Error fetching Vercel data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'needs-improvement': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'needs-improvement': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock data voor development/testing
  const getMockDataView = () => {
    if (type === 'speed-insights') {
      return (
        <AdminCard title="Vercel Speed Insights (Mock Data)" icon={<ChartBarIcon className="w-6 h-6" />}>
          <div className="space-y-6">
            {/* Real Experience Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-[#8BAE5A] mb-2">90</div>
              <div className="text-sm text-gray-400">Real Experience Score</div>
              <div className="text-xs text-yellow-500 mt-1">⚠️ Mock data - voeg Vercel credentials toe voor live data</div>
            </div>

            {/* Core Web Vitals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#181F17] p-3 rounded-lg border border-[#3A4D23]">
                <div className="text-sm text-gray-400">First Contentful Paint</div>
                <div className="text-lg font-semibold text-white">0.45s</div>
              </div>
              <div className="bg-[#181F17] p-3 rounded-lg border border-[#3A4D23]">
                <div className="text-sm text-gray-400">Largest Contentful Paint</div>
                <div className="text-lg font-semibold text-white">1.66s</div>
              </div>
              <div className="bg-[#181F17] p-3 rounded-lg border border-[#3A4D23]">
                <div className="text-sm text-gray-400">Cumulative Layout Shift</div>
                <div className="text-lg font-semibold text-white">0.22</div>
              </div>
              <div className="bg-[#181F17] p-3 rounded-lg border border-[#3A4D23]">
                <div className="text-sm text-gray-400">First Input Delay</div>
                <div className="text-lg font-semibold text-white">12ms</div>
              </div>
            </div>

            {/* Performance by Route */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                <LinkIcon className="w-4 h-4" />
                Performance by Route
              </h4>
              <div className="space-y-2">
                {[
                  { route: '/dashboard', cls: 0.18, status: 'needs-improvement' },
                  { route: '/dashboard/academy', cls: 0.22, status: 'needs-improvement' },
                  { route: '/login', cls: 0, status: 'good' },
                  { route: '/dashboard-admin/bug-meldingen', cls: 0.07, status: 'good' }
                ].map((route, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-[#181F17] rounded border border-[#3A4D23]">
                    <span className="text-sm font-mono text-white">{route.route}</span>
                    <span className={`text-sm px-2 py-1 rounded ${getStatusBadge(route.status)}`}>
                      CLS: {route.cls}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AdminCard>
      );
    }

    // Analytics mock data
    return (
      <AdminCard title="Vercel Analytics (Mock Data)" icon={<ChartBarIcon className="w-6 h-6" />}>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8BAE5A] mb-1">58</div>
              <div className="text-sm text-gray-400">Bezoekers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8BAE5A] mb-1">239</div>
              <div className="text-sm text-gray-400">Pagina Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8BAE5A] mb-1">79%</div>
              <div className="text-sm text-gray-400">Bounce Rate</div>
            </div>
          </div>

          {/* Top Pages */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
              <EyeIcon className="w-4 h-4" />
              Top Pagina's
            </h4>
            <div className="space-y-2">
              {[
                { path: '/prelaunch', visitors: 50 },
                { path: '/login', visitors: 7 },
                { path: '/', visitors: 6 },
                { path: '/dashboard', visitors: 6 },
                { path: '/dashboard-admin', visitors: 6 }
              ].map((page, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#181F17] rounded border border-[#3A4D23]">
                  <span className="text-sm font-mono text-white">{page.path}</span>
                  <span className="text-sm font-semibold text-[#8BAE5A]">{page.visitors}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
              <GlobeAltIcon className="w-4 h-4" />
              Landen
            </h4>
            <div className="space-y-2">
              {[
                { country: 'Netherlands', percentage: 84 },
                { country: 'Spain', percentage: 7 },
                { country: 'Romania', percentage: 5 },
                { country: 'Belgium', percentage: 3 }
              ].map((country, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#181F17] rounded border border-[#3A4D23]">
                  <span className="text-sm text-white">{country.country}</span>
                  <span className="text-sm font-semibold text-[#8BAE5A]">{country.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center py-4">
            <div className="text-xs text-yellow-500 bg-[#181F17] p-3 rounded-lg border border-[#3A4D23]">
              ⚠️ <strong>Mock Data</strong> - Voeg VERCEL_TOKEN en VERCEL_PROJECT_ID toe aan je .env.local voor live data
            </div>
          </div>
        </div>
      </AdminCard>
    );
  };

  if (loading) {
    return (
      <AdminCard title="Vercel Analytics" icon={<ChartBarIcon className="w-6 h-6" />}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </AdminCard>
    );
  }

  if (error) {
    // Als het een Vercel credentials error is, toon mock data
    if (error.includes('Vercel credentials not configured')) {
      return getMockDataView();
    }
    
    return (
      <AdminCard title="Vercel Analytics" icon={<ChartBarIcon className="w-6 h-6" />}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️ {error}</div>
          <button
            onClick={fetchVercelData}
            className="px-4 py-2 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#7A9D4A] transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </AdminCard>
    );
  }

  if (type === 'speed-insights') {
    const speedData = data as VercelSpeedInsightsData;
    return (
      <AdminCard title="Vercel Speed Insights" icon={<ChartBarIcon className="w-6 h-6" />}>
        <div className="space-y-6">
          {/* Real Experience Score */}
          <div className="text-center">
            <div className="text-4xl font-bold text-[#8BAE5A] mb-2">
              {speedData.realExperienceScore}
            </div>
            <div className="text-sm text-gray-400">Real Experience Score</div>
          </div>

          {/* Core Web Vitals */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#181F17] p-3 rounded-lg border border-[#3A4D23]">
              <div className="text-sm text-gray-400">First Contentful Paint</div>
              <div className="text-lg font-semibold text-white">{speedData.coreWebVitals.firstContentfulPaint}s</div>
            </div>
            <div className="bg-[#181F17] p-3 rounded-lg border border-[#3A4D23]">
              <div className="text-sm text-gray-400">Largest Contentful Paint</div>
              <div className="text-lg font-semibold text-white">{speedData.coreWebVitals.largestContentfulPaint}s</div>
            </div>
            <div className="bg-[#181F17] p-3 rounded-lg border border-[#3A4D23]">
              <div className="text-sm text-gray-400">Cumulative Layout Shift</div>
              <div className="text-lg font-semibold text-white">{speedData.coreWebVitals.cumulativeLayoutShift}</div>
            </div>
            <div className="bg-[#181F17] p-3 rounded-lg border border-[#3A4D23]">
              <div className="text-sm text-gray-400">First Input Delay</div>
              <div className="text-lg font-semibold text-white">{speedData.coreWebVitals.firstInputDelay}ms</div>
            </div>
          </div>

          {/* Performance by Route */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
              <LinkIcon className="w-4 h-4" />
              Performance by Route
            </h4>
            <div className="space-y-2">
              {speedData.performanceByRoute.slice(0, 5).map((route, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#181F17] rounded border border-[#3A4D23]">
                  <span className="text-sm font-mono text-white">{route.route}</span>
                  <span className={`text-sm px-2 py-1 rounded ${getStatusBadge(route.status)}`}>
                    CLS: {route.cls}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance by Country */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
              <GlobeEuropeAfricaIcon className="w-4 h-4" />
              Performance by Country
            </h4>
            <div className="space-y-2">
              {speedData.performanceByCountry.slice(0, 5).map((country, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#181F17] rounded border border-[#3A4D23]">
                  <span className="text-sm text-white">{country.country}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">CLS: {country.cls}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(country.status)}`}>
                      {country.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminCard>
    );
  }

    // Analytics view
  const analyticsData = data as VercelAnalyticsData;
  return (
    <AdminCard title="Vercel Analytics" icon={<ChartBarIcon className="w-6 h-6" />}>
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#8BAE5A] mb-1">
              {analyticsData.visitors.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Bezoekers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#8BAE5A] mb-1">
              {analyticsData.pageViews.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Pagina Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#8BAE5A] mb-1">
              {analyticsData.bounceRate}%
            </div>
            <div className="text-sm text-gray-400">Bounce Rate</div>
          </div>
        </div>

        {/* Top Pages */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
            <EyeIcon className="w-4 h-4" />
            Top Pagina's
          </h4>
          <div className="space-y-2">
            {analyticsData.topPages.slice(0, 5).map((page, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-[#181F17] rounded border border-[#3A4D23]">
                <span className="text-sm font-mono text-white">{page.path}</span>
                <span className="text-sm font-semibold text-[#8BAE5A]">{page.visitors}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Referrers */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
            <LinkIcon className="w-4 h-4" />
            Top Referrers
          </h4>
          <div className="space-y-2">
            {analyticsData.topReferrers.slice(0, 5).map((referrer, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-[#181F17] rounded border border-[#3A4D23]">
                <span className="text-sm text-white">{referrer.referrer}</span>
                <span className="text-sm font-semibold text-[#8BAE5A]">{referrer.visitors}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
            <GlobeAltIcon className="w-4 h-4" />
            Landen
          </h4>
          <div className="space-y-2">
            {analyticsData.countries.slice(0, 5).map((country, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-[#181F17] rounded border border-[#3A4D23]">
                <span className="text-sm text-white">{country.country}</span>
                <span className="text-sm font-semibold text-[#8BAE5A]">{country.percentage}%</span>
              </div>
              ))}
          </div>
        </div>

        {/* Devices */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
            <DevicePhoneMobileIcon className="w-4 h-4" />
            Apparaten
          </h4>
          <div className="space-y-2">
            {analyticsData.devices.slice(0, 5).map((device, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-[#181F17] rounded border border-[#3A4D23]">
                <span className="text-sm text-white">{device.device}</span>
                <span className="text-sm font-semibold text-[#8BAE5A]">{device.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminCard>
  );
}
