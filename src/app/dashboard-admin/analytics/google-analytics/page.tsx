'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, UsersIcon, EyeIcon, ArrowTrendingUpIcon, ClockIcon } from '@heroicons/react/24/outline';

interface GoogleAnalyticsData {
  activeUsers: number;
  totalUsers: number;
  pageViews: number;
  bounceRate: number;
  sessionDuration: number;
  newUsers: number;
  returningUsers: number;
  topPages: Array<{ page: string; views: number }>;
  topSources: Array<{ source: string; sessions: number }>;
  deviceBreakdown: Array<{ device: string; percentage: number }>;
  lastUpdated: string;
}

interface GoogleAnalyticsResponse {
  success: boolean;
  data: GoogleAnalyticsData;
  timestamp: string;
  range: string;
  source: string;
  error?: string;
}

export default function GoogleAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<GoogleAnalyticsData | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoogleAnalyticsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/admin/google-analytics');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: GoogleAnalyticsResponse = await response.json();
        
        if (data.success) {
          setAnalyticsData(data.data);
          setDataSource(data.source);
        } else {
          throw new Error(data.error || 'Failed to fetch Google Analytics data');
        }
      } catch (err) {
        console.error('Error fetching Google Analytics data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoogleAnalyticsData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchGoogleAnalyticsData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-8 h-8 text-[#B6C948]" />
          <h1 className="text-3xl font-bold text-white">Google Analytics</h1>
        </div>
        
        <div className="bg-[#232D1A] p-6 rounded-lg border border-[#3A4D23]">
          <div className="animate-pulse">
            <div className="h-4 bg-[#3A4D23] rounded mb-2 w-1/4"></div>
            <div className="h-8 bg-[#3A4D23] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-8 h-8 text-[#B6C948]" />
          <h1 className="text-3xl font-bold text-white">Google Analytics</h1>
        </div>
        
        <div className="bg-[#232D1A] p-6 rounded-lg border border-[#3A4D23]">
          <div className="text-center">
            <div className="text-red-400 text-lg mb-2">⚠️ Error Loading Google Analytics</div>
            <p className="text-[#8BAE5A] mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#B6C948] text-[#181F17] px-4 py-2 rounded-lg hover:bg-[#8BAE5A] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-8 h-8 text-[#B6C948]" />
          <h1 className="text-3xl font-bold text-white">Google Analytics</h1>
        </div>
        <div className="flex items-center gap-4">
          {analyticsData && (
            <div className="text-[#8BAE5A] text-sm">
              Laatste update: {analyticsData.lastUpdated}
            </div>
          )}
          {dataSource && (
            <div className={`text-xs px-2 py-1 rounded ${
              dataSource.includes('API') 
                ? 'bg-green-900 text-green-300' 
                : 'bg-yellow-900 text-yellow-300'
            }`}>
              {dataSource}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-[#232D1A] p-6 rounded-lg border border-[#3A4D23]">
        <h2 className="text-xl font-semibold text-white mb-6">Real-time Analytics Dashboard</h2>
        
        {analyticsData ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
                <div className="flex items-center gap-2 mb-2">
                  <UsersIcon className="w-5 h-5 text-[#B6C948]" />
                  <h3 className="text-[#B6C948] font-semibold">Actieve Gebruikers</h3>
                </div>
                <p className="text-2xl font-bold text-white">{analyticsData.activeUsers.toLocaleString()}</p>
                <p className="text-[#8BAE5A] text-sm">● Live</p>
              </div>
              
              <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
                <div className="flex items-center gap-2 mb-2">
                  <ChartBarIcon className="w-5 h-5 text-[#B6C948]" />
                  <h3 className="text-[#B6C948] font-semibold">Totaal Gebruikers</h3>
                </div>
                <p className="text-2xl font-bold text-white">{analyticsData.totalUsers.toLocaleString()}</p>
                <p className="text-[#8BAE5A] text-sm">Laatste 7 dagen</p>
              </div>
              
              <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
                <div className="flex items-center gap-2 mb-2">
                  <EyeIcon className="w-5 h-5 text-[#B6C948]" />
                  <h3 className="text-[#B6C948] font-semibold">Page Views</h3>
                </div>
                <p className="text-2xl font-bold text-white">{analyticsData.pageViews.toLocaleString()}</p>
                <p className="text-[#8BAE5A] text-sm">Laatste 7 dagen</p>
              </div>
              
              <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-[#B6C948]" />
                  <h3 className="text-[#B6C948] font-semibold">Bounce Rate</h3>
                </div>
                <p className="text-2xl font-bold text-white">{analyticsData.bounceRate.toFixed(1)}%</p>
                <p className="text-[#8BAE5A] text-sm">Gemiddelde</p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
                <h3 className="text-[#B6C948] font-semibold mb-2">Sessie Duur</h3>
                <p className="text-xl font-bold text-white">{Math.round(analyticsData.sessionDuration / 60)}m {analyticsData.sessionDuration % 60}s</p>
                <p className="text-[#8BAE5A] text-sm">Gemiddelde</p>
              </div>
              
              <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
                <h3 className="text-[#B6C948] font-semibold mb-2">Nieuwe Gebruikers</h3>
                <p className="text-xl font-bold text-white">{analyticsData.newUsers.toLocaleString()}</p>
                <p className="text-[#8BAE5A] text-sm">Laatste 7 dagen</p>
              </div>
              
              <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
                <h3 className="text-[#B6C948] font-semibold mb-2">Terugkerende Gebruikers</h3>
                <p className="text-xl font-bold text-white">{analyticsData.returningUsers.toLocaleString()}</p>
                <p className="text-[#8BAE5A] text-sm">Laatste 7 dagen</p>
              </div>
            </div>

            {/* Top Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
                <h3 className="text-[#B6C948] font-semibold mb-4">Top Pagina's</h3>
                <div className="space-y-2">
                  {analyticsData.topPages.map((page, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-[#8BAE5A] text-sm truncate">{page.page}</span>
                      <span className="text-white font-semibold">{page.views.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
                <h3 className="text-[#B6C948] font-semibold mb-4">Top Traffic Sources</h3>
                <div className="space-y-2">
                  {analyticsData.topSources.map((source, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-[#8BAE5A] text-sm truncate">{source.source}</span>
                      <span className="text-white font-semibold">{source.sessions.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="mt-6 bg-[#181F17] p-4 rounded-lg border border-[#3A4D23]">
              <h3 className="text-[#B6C948] font-semibold mb-4">Device Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analyticsData.deviceBreakdown.map((device, index) => (
                  <div key={index} className="text-center">
                    <div className="text-white font-semibold">{device.device}</div>
                    <div className="text-[#8BAE5A] text-sm">{device.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-[#8BAE5A]">Geen data beschikbaar</p>
          </div>
        )}
      </div>
    </div>
  );
}
