import React, { useState } from 'react';
import { ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface CDNPerformanceMetrics {
  provider: string;
  responseTime: number;
  cacheHit: boolean;
  timestamp: string;
  region?: string;
  isVercel?: boolean;
}

interface CDNPerformanceTestProps {
  className?: string;
}

export default function CDNPerformanceTest({ className = "" }: CDNPerformanceTestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<CDNPerformanceMetrics | null>(null);
  const [testUrl, setTestUrl] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const testCDNPerformance = async () => {
    if (!testUrl) {
      alert('Voer een video URL in om te testen');
      return;
    }

    setIsLoading(true);
    setMetrics(null);
    setRecommendations([]);

    try {
      const response = await fetch(`/api/cdn-performance?url=${encodeURIComponent(testUrl)}`);
      const data = await response.json();

      if (data.success) {
        setMetrics(data.metrics);
        setRecommendations(data.recommendations || []);
      } else {
        alert('CDN test mislukt: ' + data.error);
      }
    } catch (error) {
      console.error('CDN test error:', error);
      alert('CDN test mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = (responseTime: number) => {
    if (responseTime < 100) return 'text-green-500';
    if (responseTime < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPerformanceStatus = (responseTime: number) => {
    if (responseTime < 100) return 'Uitstekend';
    if (responseTime < 500) return 'Goed';
    if (responseTime < 1000) return 'Gemiddeld';
    return 'Slecht';
  };

  return (
    <div className={`bg-[#181F17] rounded-xl p-6 border border-[#3A4D23] ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
        <h3 className="text-lg font-semibold text-[#8BAE5A]">CDN Performance Test</h3>
      </div>

      {/* Test Input */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#B6C948] mb-2">
            Video URL om te testen
          </label>
          <input
            type="url"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/workout-videos/..."
            className="w-full px-4 py-2 bg-[#0A0F0A] border border-[#3A4D23] rounded-lg text-[#8BAE5A] placeholder-[#B6C948]/50 focus:border-[#8BAE5A] focus:outline-none"
          />
        </div>

        <button
          onClick={testCDNPerformance}
          disabled={isLoading || !testUrl}
          className="flex items-center gap-2 bg-[#8BAE5A] hover:bg-[#B6C948] disabled:bg-[#3A4D23] disabled:cursor-not-allowed text-[#0A0F0A] font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? (
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
          ) : (
            <ChartBarIcon className="w-4 h-4" />
          )}
          {isLoading ? 'Testen...' : 'Test CDN Performance'}
        </button>
      </div>

      {/* Results */}
      {metrics && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-[#8BAE5A]">Test Resultaten</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0A0F0A] rounded-lg p-4 border border-[#3A4D23]">
              <div className="text-sm text-[#B6C948] mb-1">Provider</div>
              <div className="text-[#8BAE5A] font-semibold capitalize">{metrics.provider}</div>
            </div>

            <div className="bg-[#0A0F0A] rounded-lg p-4 border border-[#3A4D23]">
              <div className="text-sm text-[#B6C948] mb-1">Response Tijd</div>
              <div className={`font-semibold ${getPerformanceColor(metrics.responseTime)}`}>
                {metrics.responseTime > 0 ? `${metrics.responseTime.toFixed(0)}ms` : 'N/A'}
              </div>
              <div className="text-xs text-[#B6C948]">
                {getPerformanceStatus(metrics.responseTime)}
              </div>
            </div>

            <div className="bg-[#0A0F0A] rounded-lg p-4 border border-[#3A4D23]">
              <div className="text-sm text-[#B6C948] mb-1">Cache Hit</div>
              <div className={`font-semibold ${metrics.cacheHit ? 'text-green-500' : 'text-yellow-500'}`}>
                {metrics.cacheHit ? 'Ja' : 'Nee'}
              </div>
            </div>

            <div className="bg-[#0A0F0A] rounded-lg p-4 border border-[#3A4D23]">
              <div className="text-sm text-[#B6C948] mb-1">Regio</div>
              <div className="text-[#8BAE5A] font-semibold">
                {metrics.region || 'Onbekend'}
              </div>
            </div>
          </div>

          <div className="bg-[#0A0F0A] rounded-lg p-4 border border-[#3A4D23]">
            <div className="text-sm text-[#B6C948] mb-1">Test Tijd</div>
            <div className="text-[#8BAE5A] font-semibold">
              {new Date(metrics.timestamp).toLocaleString('nl-NL')}
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-[#0A0F0A] rounded-lg p-4 border border-[#3A4D23]">
              <div className="text-sm text-[#B6C948] mb-2">Aanbevelingen</div>
              <ul className="space-y-1">
                {recommendations.map((rec, index) => (
                  <li key={index} className="text-[#8BAE5A] text-sm flex items-start gap-2">
                    <span className="text-[#B6C948]">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quick Test Buttons */}
      <div className="mt-6 pt-6 border-t border-[#3A4D23]">
        <h4 className="text-sm font-medium text-[#B6C948] mb-3">Snelle Tests</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTestUrl('https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/workout-videos/exercises/2025-08-03-wx4awfu7j.mp4')}
            className="text-xs bg-[#232D1A] hover:bg-[#3A4D23] text-[#8BAE5A] px-3 py-1 rounded transition-colors"
          >
            Test Workout Video
          </button>
          <button
            onClick={() => setTestUrl('https://wkjvstuttbeyqzyjayxj.supabase.co/storage/v1/object/public/academy-videos/test.mp4')}
            className="text-xs bg-[#232D1A] hover:bg-[#3A4D23] text-[#8BAE5A] px-3 py-1 rounded transition-colors"
          >
            Test Academy Video
          </button>
        </div>
      </div>
    </div>
  );
} 