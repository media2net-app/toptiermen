'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  EyeIcon, 
  GlobeAltIcon, 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  LinkIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import { AdminCard } from '@/components/admin';

interface PageAnalytics {
  path: string;
  visitors: number;
  pageViews: number;
  bounceRate: number;
  avgTimeOnPage: number;
  conversionRate: number;
  revenue: number;
  topReferrers: Array<{ referrer: string; visitors: number }>;
  countries: Array<{ country: string; percentage: number }>;
  devices: Array<{ device: string; percentage: number }>;
  browsers: Array<{ browser: string; percentage: number }>;
  trendData: Array<{ date: string; visitors: number; conversions: number }>;
  hourlyData: Array<{ hour: string; visitors: number }>;
}

export default function PakkettenAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<PageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState<'visitors' | 'conversions' | 'revenue'>('visitors');

  const periods = [
    { id: '1d', name: 'Vandaag' },
    { id: '7d', name: '7 dagen' },
    { id: '30d', name: '30 dagen' },
    { id: '90d', name: '90 dagen' }
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/vercel-analytics?type=page&path=/pakketten/prelaunchkorting&period=${selectedPeriod}`);
      const result = await response.json();

      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        // Fallback naar mock data als Vercel niet beschikbaar is
        setAnalyticsData(getMockData());
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setAnalyticsData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (): PageAnalytics => {
    return {
      path: '/pakketten/prelaunchkorting',
      visitors: 127,
      pageViews: 189,
      bounceRate: 23,
      avgTimeOnPage: 145,
      conversionRate: 8.7,
      revenue: 1240,
      topReferrers: [
        { referrer: 'Direct', visitors: 45 },
        { referrer: 'Google', visitors: 32 },
        { referrer: 'Facebook', visitors: 28 },
        { referrer: 'Instagram', visitors: 15 },
        { referrer: 'LinkedIn', visitors: 7 }
      ],
      countries: [
        { country: 'Netherlands', percentage: 78 },
        { country: 'Belgium', percentage: 12 },
        { country: 'Germany', percentage: 6 },
        { country: 'Spain', percentage: 4 }
      ],
      devices: [
        { device: 'Mobile', percentage: 65 },
        { device: 'Desktop', percentage: 30 },
        { device: 'Tablet', percentage: 5 }
      ],
      browsers: [
        { browser: 'Chrome', percentage: 52 },
        { browser: 'Safari', percentage: 28 },
        { browser: 'Firefox', percentage: 12 },
        { browser: 'Edge', percentage: 8 }
      ],
      trendData: [
        { date: '2024-01-15', visitors: 12, conversions: 1 },
        { date: '2024-01-16', visitors: 18, conversions: 2 },
        { date: '2024-01-17', visitors: 15, conversions: 1 },
        { date: '2024-01-18', visitors: 22, conversions: 3 },
        { date: '2024-01-19', visitors: 19, conversions: 2 },
        { date: '2024-01-20', visitors: 25, conversions: 4 },
        { date: '2024-01-21', visitors: 16, conversions: 1 }
      ],
      hourlyData: [
        { hour: '00:00', visitors: 2 },
        { hour: '06:00', visitors: 5 },
        { hour: '09:00', visitors: 12 },
        { hour: '12:00', visitors: 18 },
        { hour: '15:00', visitors: 22 },
        { hour: '18:00', visitors: 28 },
        { hour: '21:00', visitors: 15 }
      ]
    };
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('nl-NL');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ Geen data beschikbaar</div>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#7A9D4A] transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Pakketten Analytics
              </h1>
              <p className="text-gray-400">
                Performance tracking voor <code className="bg-[#232D1A] px-2 py-1 rounded text-[#8BAE5A]">/pakketten/prelaunchkorting</code>
              </p>
            </div>
            
            {/* Period Selector */}
            <div className="flex gap-2">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period.id
                      ? 'bg-[#8BAE5A] text-white'
                      : 'bg-[#232D1A] text-gray-400 hover:text-white hover:bg-[#3A4D23]'
                  }`}
                >
                  {period.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminCard title="Bezoekers" icon={<UsersIcon className="w-6 h-6" />}>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8BAE5A] mb-1">
                {formatNumber(analyticsData.visitors)}
              </div>
              <div className="text-sm text-gray-400">Unieke bezoekers</div>
            </div>
          </AdminCard>

          <AdminCard title="Pagina Views" icon={<EyeIcon className="w-6 h-6" />}>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8BAE5A] mb-1">
                {formatNumber(analyticsData.pageViews)}
              </div>
              <div className="text-sm text-gray-400">Totaal views</div>
            </div>
          </AdminCard>

          <AdminCard title="Conversie Rate" icon={<ArrowTrendingUpIcon className="w-6 h-6" />}>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8BAE5A] mb-1">
                {analyticsData.conversionRate}%
              </div>
              <div className="text-sm text-gray-400">Bezoekers → Klanten</div>
            </div>
          </AdminCard>

          <AdminCard title="Omzet" icon={<CurrencyEuroIcon className="w-6 h-6" />}>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8BAE5A] mb-1">
                {formatCurrency(analyticsData.revenue)}
              </div>
              <div className="text-sm text-gray-400">Totale omzet</div>
            </div>
          </AdminCard>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AdminCard title="Bounce Rate" icon={<ChartBarIcon className="w-6 h-6" />}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8BAE5A] mb-1">
                {analyticsData.bounceRate}%
              </div>
              <div className="text-sm text-gray-400">Verlaat direct</div>
            </div>
          </AdminCard>

          <AdminCard title="Gem. Tijd" icon={<ClockIcon className="w-6 h-6" />}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8BAE5A] mb-1">
                {formatTime(analyticsData.avgTimeOnPage)}
              </div>
              <div className="text-sm text-gray-400">Op pagina</div>
            </div>
          </AdminCard>

          <AdminCard title="Views per Bezoeker" icon={<EyeIcon className="w-6 h-6" />}>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#8BAE5A] mb-1">
                {(analyticsData.pageViews / analyticsData.visitors).toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">Pagina's per sessie</div>
            </div>
          </AdminCard>
        </div>

        {/* Traffic Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AdminCard title="Top Referrers" icon={<LinkIcon className="w-6 h-6" />}>
            <div className="space-y-3">
              {analyticsData.topReferrers.map((referrer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-white">{referrer.referrer}</span>
                  <span className="text-sm font-semibold text-[#8BAE5A]">
                    {referrer.visitors} bezoekers
                  </span>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard title="Landen" icon={<GlobeAltIcon className="w-6 h-6" />}>
            <div className="space-y-3">
              {analyticsData.countries.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-white">{country.country}</span>
                  <span className="text-sm font-semibold text-[#8BAE5A]">
                    {country.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>

        {/* Device & Browser Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AdminCard title="Apparaten" icon={<DevicePhoneMobileIcon className="w-6 h-6" />}>
            <div className="space-y-3">
              {analyticsData.devices.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-white">{device.device}</span>
                  <span className="text-sm font-semibold text-[#8BAE5A]">
                    {device.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard title="Browsers" icon={<ComputerDesktopIcon className="w-6 h-6" />}>
            <div className="space-y-3">
              {analyticsData.browsers.map((browser, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-white">{browser.browser}</span>
                  <span className="text-sm font-semibold text-[#8BAE5A]">
                    {browser.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>

        {/* Trend Chart */}
        <AdminCard title="Trend (7 dagen)" icon={<ChartBarIcon className="w-6 h-6" />}>
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              {(['visitors', 'conversions', 'revenue'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedMetric === metric
                      ? 'bg-[#8BAE5A] text-white'
                      : 'bg-[#232D1A] text-gray-400 hover:text-white'
                  }`}
                >
                  {metric === 'visitors' ? 'Bezoekers' : 
                   metric === 'conversions' ? 'Conversies' : 'Omzet'}
                </button>
              ))}
            </div>
            
            <div className="space-y-2">
              {analyticsData.trendData.map((day, index) => {
                const value = selectedMetric === 'visitors' ? day.visitors :
                             selectedMetric === 'conversions' ? day.conversions :
                             Math.round(analyticsData.revenue * (day.conversions / analyticsData.visitors));
                
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 text-xs text-gray-400">
                      {new Date(day.date).toLocaleDateString('nl-NL', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex-1 bg-[#232D1A] rounded-full h-2">
                      <div 
                        className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(value / Math.max(...analyticsData.trendData.map(d => 
                            selectedMetric === 'visitors' ? d.visitors :
                            selectedMetric === 'conversions' ? d.conversions :
                            Math.round(analyticsData.revenue * (d.conversions / analyticsData.visitors))
                          ))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm font-semibold text-[#8BAE5A] text-right">
                      {selectedMetric === 'revenue' ? formatCurrency(value) : value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AdminCard>

        {/* Hourly Distribution */}
        <AdminCard title="Uurverdeling" icon={<ClockIcon className="w-6 h-6" />}>
          <div className="space-y-2">
            {analyticsData.hourlyData.map((hour, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-xs text-gray-400">{hour.hour}</div>
                <div className="flex-1 bg-[#232D1A] rounded-full h-2">
                  <div 
                    className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(hour.visitors / Math.max(...analyticsData.hourlyData.map(h => h.visitors))) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="w-8 text-sm font-semibold text-[#8BAE5A] text-right">
                  {hour.visitors}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        {/* Data Source Info */}
        <div className="mt-8 text-center">
          <div className="text-xs text-yellow-500 bg-[#232D1A] p-3 rounded-lg border border-[#3A4D23] inline-block">
            ⚠️ <strong>Mock Data</strong> - Voeg VERCEL_TOKEN en VERCEL_PROJECT_ID toe aan je .env.local voor live Vercel Analytics data
          </div>
        </div>
      </div>
    </div>
  );
}
