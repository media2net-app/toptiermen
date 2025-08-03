'use client';
import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  EyeIcon, 
  CursorArrowRaysIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { AdminCard, AdminStatsCard, AdminButton } from '@/components/admin';

interface ABTestEvent {
  variant: string;
  event: string;
  page: string;
  element: string;
  count: number;
  percentage: string;
}

interface ABTestAnalytics {
  variants: {
    variant: string;
    totalEvents: number;
    uniqueUsers: number;
    events: {
      event: string;
      count: number;
    }[];
  }[];
  events: {
    event: string;
    total: number;
    variants: {
      variant: string;
      count: number;
      percentage: string;
    }[];
  }[];
}

export default function ABTestingPage() {
  const [analytics, setAnalytics] = useState<ABTestAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState('product');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [days, setDays] = useState('7');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: selectedPage,
        days: days
      });
      
      if (selectedEvent !== 'all') {
        params.append('event', selectedEvent);
      }

      const response = await fetch(`/api/ab-testing?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        console.error('Error fetching A/B test analytics:', data.error);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPage, selectedEvent, days]);

  const getConversionRate = (variant: string, event: string): string => {
    if (!analytics) return '0.0';
    
    const variantData = analytics.variants.find(v => v.variant === variant);
    const eventData = analytics.events.find(e => e.event === event);
    
    if (!variantData || !eventData) return '0.0';
    
    const eventCount = variantData.events.find(e => e.event === event)?.count || 0;
    const totalUsers = variantData.uniqueUsers;
    
    return totalUsers > 0 ? (eventCount / totalUsers * 100).toFixed(1) : '0.0';
  };

  const getStatisticalSignificance = (variantA: string, variantB: string, event: string) => {
    // Simple statistical significance calculation
    const rateA = parseFloat(getConversionRate(variantA, event));
    const rateB = parseFloat(getConversionRate(variantB, event));
    
    if (rateA === 0 || rateB === 0) return 'Insufficient data';
    
    const difference = Math.abs(rateA - rateB);
    const avgRate = (rateA + rateB) / 2;
    
    if (difference < 1) return 'No significant difference';
    if (difference < 5) return 'Slight difference';
    if (difference < 10) return 'Moderate difference';
    return 'Significant difference';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#8BAE5A] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F0A] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">A/B Testing Dashboard</h1>
          <p className="text-[#8BAE5A]">Track en analyseer A/B test resultaten</p>
        </div>

        {/* Filters */}
        <AdminCard title="Filters" icon={<FunnelIcon className="w-6 h-6" />}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pagina</label>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              >
                <option value="product">Product Pagina</option>
                <option value="landing">Landing Page</option>
                <option value="pricing">Pricing Page</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              >
                <option value="all">Alle Events</option>
                <option value="cta_click">CTA Clicks</option>
                <option value="feature_click">Feature Clicks</option>
                <option value="page_view">Page Views</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Periode</label>
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              >
                <option value="1">Laatste 24 uur</option>
                <option value="7">Laatste 7 dagen</option>
                <option value="30">Laatste 30 dagen</option>
                <option value="90">Laatste 90 dagen</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <AdminButton
                onClick={fetchAnalytics}
                variant="secondary"
                icon={<ArrowPathIcon className="w-4 h-4" />}
              >
                Verversen
              </AdminButton>
            </div>
          </div>
        </AdminCard>

        {/* Stats Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AdminStatsCard
              title="Totaal Events"
              value={analytics.variants.reduce((sum, v) => sum + v.totalEvents, 0)}
              icon={<ChartBarIcon className="w-8 h-8" />}
              color="blue"
            />
            <AdminStatsCard
              title="Unieke Gebruikers"
              value={analytics.variants.reduce((sum, v) => sum + v.uniqueUsers, 0)}
              icon={<UserGroupIcon className="w-8 h-8" />}
              color="green"
            />
            <AdminStatsCard
              title="Variant A Events"
              value={analytics.variants.find(v => v.variant === 'A')?.totalEvents || 0}
              icon={<EyeIcon className="w-8 h-8" />}
              color="purple"
            />
            <AdminStatsCard
              title="Variant B Events"
              value={analytics.variants.find(v => v.variant === 'B')?.totalEvents || 0}
              icon={<CursorArrowRaysIcon className="w-8 h-8" />}
              color="orange"
            />
          </div>
        )}

        {/* Variant Comparison */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Variant A */}
            <AdminCard title="Variant A" icon={<EyeIcon className="w-6 h-6" />}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Totaal Events:</span>
                  <span className="text-white font-semibold">
                    {analytics.variants.find(v => v.variant === 'A')?.totalEvents || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Unieke Gebruikers:</span>
                  <span className="text-white font-semibold">
                    {analytics.variants.find(v => v.variant === 'A')?.uniqueUsers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">CTA Conversion Rate:</span>
                  <span className="text-[#8BAE5A] font-semibold">
                    {getConversionRate('A', 'cta_click')}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Feature Click Rate:</span>
                  <span className="text-[#8BAE5A] font-semibold">
                    {getConversionRate('A', 'feature_click')}%
                  </span>
                </div>
              </div>
            </AdminCard>

            {/* Variant B */}
            <AdminCard title="Variant B" icon={<CursorArrowRaysIcon className="w-6 h-6" />}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Totaal Events:</span>
                  <span className="text-white font-semibold">
                    {analytics.variants.find(v => v.variant === 'B')?.totalEvents || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Unieke Gebruikers:</span>
                  <span className="text-white font-semibold">
                    {analytics.variants.find(v => v.variant === 'B')?.uniqueUsers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">CTA Conversion Rate:</span>
                  <span className="text-[#8BAE5A] font-semibold">
                    {getConversionRate('B', 'cta_click')}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Feature Click Rate:</span>
                  <span className="text-[#8BAE5A] font-semibold">
                    {getConversionRate('B', 'feature_click')}%
                  </span>
                </div>
              </div>
            </AdminCard>
          </div>
        )}

        {/* Statistical Significance */}
        {analytics && (
          <AdminCard title="Statistische Significatie" icon={<ArrowTrendingUpIcon className="w-6 h-6" />}>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#181F17] rounded-lg">
                <span className="text-gray-300">CTA Clicks:</span>
                <span className="text-white font-semibold">
                  {getStatisticalSignificance('A', 'B', 'cta_click')}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#181F17] rounded-lg">
                <span className="text-gray-300">Feature Clicks:</span>
                <span className="text-white font-semibold">
                  {getStatisticalSignificance('A', 'B', 'feature_click')}
                </span>
              </div>
            </div>
          </AdminCard>
        )}

        {/* Event Breakdown */}
        {analytics && analytics.events.length > 0 && (
          <AdminCard title="Event Breakdown" icon={<ChartBarIcon className="w-6 h-6" />}>
            <div className="space-y-4">
              {analytics.events.map((event) => (
                <div key={event.event} className="border border-[#3A4D23] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 capitalize">
                    {event.event.replace('_', ' ')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.variants.map((variant) => (
                      <div key={variant.variant} className="flex justify-between items-center">
                        <span className="text-gray-300">Variant {variant.variant}:</span>
                        <div className="text-right">
                          <div className="text-white font-semibold">{variant.count}</div>
                          <div className="text-[#8BAE5A] text-sm">{variant.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        )}

        {/* No Data Message */}
        {(!analytics || analytics.variants.length === 0) && (
          <AdminCard title="Geen Data" icon={<ChartBarIcon className="w-6 h-6" />}>
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Nog geen A/B test data beschikbaar</p>
              <p className="text-gray-500 text-sm">
                Start A/B tests op de product pagina om data te verzamelen
              </p>
            </div>
          </AdminCard>
        )}
      </div>
    </div>
  );
} 