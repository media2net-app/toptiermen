'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CursorArrowRaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
  FireIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Types
interface ConversionData {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  cost: number;
  roas: number;
  cpa: number;
}

interface FunnelStep {
  step: string;
  count: number;
  percentage: number;
  dropoff: number;
}

interface ConversionSource {
  source: string;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  cost: number;
  roas: number;
  cpa: number;
}

export default function ConversionsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [conversionData, setConversionData] = useState<ConversionData[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [conversionSources, setConversionSources] = useState<ConversionSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showROICalculator, setShowROICalculator] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('conversions');

  // Mock data
  useEffect(() => {
    const mockConversionData: ConversionData[] = [
      { date: '2025-07-21', impressions: 42000, clicks: 1512, conversions: 76, conversionRate: 5.0, revenue: 342, cost: 499, roas: 4.5, cpa: 6.57 },
      { date: '2025-07-22', impressions: 43500, clicks: 1566, conversions: 78, conversionRate: 5.0, revenue: 351, cost: 517, roas: 4.5, cpa: 6.63 },
      { date: '2025-07-23', impressions: 44800, clicks: 1613, conversions: 81, conversionRate: 5.0, revenue: 365, cost: 532, roas: 4.5, cpa: 6.57 },
      { date: '2025-07-24', impressions: 46200, clicks: 1663, conversions: 83, conversionRate: 5.0, revenue: 374, cost: 549, roas: 4.5, cpa: 6.61 },
      { date: '2025-07-25', impressions: 47600, clicks: 1714, conversions: 86, conversionRate: 5.0, revenue: 387, cost: 565, roas: 4.5, cpa: 6.57 },
      { date: '2025-07-26', impressions: 49000, clicks: 1764, conversions: 88, conversionRate: 5.0, revenue: 396, cost: 582, roas: 4.5, cpa: 6.61 },
      { date: '2025-07-27', impressions: 50400, clicks: 1814, conversions: 91, conversionRate: 5.0, revenue: 410, cost: 599, roas: 4.5, cpa: 6.58 }
    ];

    const mockFunnelData: FunnelStep[] = [
      { step: "Impressies", count: 1250000, percentage: 100, dropoff: 0 },
      { step: "Klikken", count: 45000, percentage: 3.6, dropoff: 96.4 },
      { step: "Landing Page", count: 40500, percentage: 3.24, dropoff: 10 },
      { step: "Registratie", count: 2250, percentage: 0.18, dropoff: 94.4 },
      { step: "Onboarding", count: 2025, percentage: 0.162, dropoff: 10 },
      { step: "Betaling", count: 1800, percentage: 0.144, dropoff: 11.1 }
    ];

    const mockConversionSources: ConversionSource[] = [
      {
        source: "Facebook",
        impressions: 450000,
        clicks: 15300,
        conversions: 765,
        conversionRate: 5.0,
        revenue: 3443,
        cost: 5049,
        roas: 4.8,
        cpa: 6.60
      },
      {
        source: "Instagram",
        impressions: 320000,
        clicks: 12800,
        conversions: 640,
        conversionRate: 5.0,
        revenue: 2880,
        cost: 4224,
        roas: 4.2,
        cpa: 6.60
      },
      {
        source: "Google Ads",
        impressions: 480000,
        clicks: 16900,
        conversions: 845,
        conversionRate: 5.0,
        revenue: 3803,
        cost: 5727,
        roas: 4.1,
        cpa: 6.78
      }
    ];

    setConversionData(mockConversionData);
    setFunnelData(mockFunnelData);
    setConversionSources(mockConversionSources);
    setLoading(false);
  }, []);

  const handleROICalculator = () => {
    setShowROICalculator(!showROICalculator);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading conversions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Conversies</h1>
          <p className="text-gray-400 mt-1">Conversie tracking en funnel analyse</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-[#2D3748] border border-[#4A5568] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
          >
            <option value="7d">Laatste 7 dagen</option>
            <option value="30d">Laatste 30 dagen</option>
            <option value="90d">Laatste 90 dagen</option>
            <option value="1y">Laatste jaar</option>
          </select>
        </div>
      </div>

      {/* Conversion Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Conversies</p>
              <p className="text-2xl font-bold text-white">
                {conversionData.reduce((sum, d) => sum + d.conversions, 0).toLocaleString()}
              </p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+15.2%</span>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gemiddelde Conv. Rate</p>
              <p className="text-2xl font-bold text-white">
                {(conversionData.reduce((sum, d) => sum + d.conversionRate, 0) / conversionData.length).toFixed(1)}%
              </p>
            </div>
            <CursorArrowRaysIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+2.1%</span>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gemiddelde CPA</p>
              <p className="text-2xl font-bold text-white">
                €{(conversionData.reduce((sum, d) => sum + d.cpa, 0) / conversionData.length).toFixed(2)}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">-5.3%</span>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gemiddelde ROAS</p>
              <p className="text-2xl font-bold text-white">
                {(conversionData.reduce((sum, d) => sum + d.roas, 0) / conversionData.length).toFixed(1)}x
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+8.7%</span>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Conversie Funnel</h2>
          <FunnelIcon className="w-6 h-6 text-[#8BAE5A]" />
        </div>
        <div className="space-y-4">
          {funnelData.map((step, index) => (
            <div key={step.step} className="relative">
              <div className="flex items-center justify-between p-4 border border-[#2D3748] rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-[#3A4D23] rounded-full flex items-center justify-center">
                    <span className="text-[#8BAE5A] font-medium text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{step.step}</h3>
                    <p className="text-gray-400 text-sm">{step.count.toLocaleString()} gebruikers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{step.percentage}%</p>
                  {index > 0 && (
                    <p className="text-red-400 text-sm">-{step.dropoff}%</p>
                  )}
                </div>
              </div>
              {index < funnelData.length - 1 && (
                <div className="absolute left-4 top-full w-0.5 h-4 bg-[#2D3748]"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Sources */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Conversies per Bron</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2D3748]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Bron</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Impressies</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Klikken</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Conversies</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Conv. Rate</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Omzet</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Kosten</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">ROAS</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">CPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3748]">
              {conversionSources.map((source) => (
                <tr key={source.source} className="hover:bg-[#2D3748] transition-colors">
                  <td className="px-4 py-2 text-sm font-medium text-white">{source.source}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{source.impressions.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{source.clicks.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{source.conversions.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{source.conversionRate}%</td>
                  <td className="px-4 py-2 text-sm text-gray-300">€{source.revenue.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">€{source.cost.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{source.roas}x</td>
                  <td className="px-4 py-2 text-sm text-gray-300">€{source.cpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Trends Chart */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Conversie Trends</h2>
          <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
        </div>
        <div className="h-64 bg-[#2D3748] rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400">Conversie trends chart hier</p>
            <p className="text-gray-500 text-sm">Data: {conversionData.length} datapunten</p>
          </div>
        </div>
      </div>

      {/* Recent Conversions */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recente Conversies</h2>
        <div className="space-y-4">
          {conversionData.slice(-5).reverse().map((data, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-[#2D3748] rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#3A4D23] rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-[#8BAE5A]" />
                </div>
                <div>
                  <p className="text-white font-medium">{data.conversions} conversies</p>
                  <p className="text-gray-400 text-sm">{data.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{data.conversionRate}%</p>
                <p className="text-gray-400 text-sm">€{data.revenue} omzet</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 