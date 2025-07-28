'use client';

import React, { useState, useEffect } from 'react';
import { 
  FlagIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface TargetData {
  currentRevenue: number;
  targetRevenue: number;
  progress: number;
  daysRemaining: number;
  dailyTarget: number;
  monthlyTarget: number;
  weeklyTarget: number;
  channels: {
    name: string;
    currentRevenue: number;
    targetRevenue: number;
    progress: number;
    status: 'on-track' | 'behind' | 'ahead';
  }[];
  milestones: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    progress: number;
    dueDate: string;
    status: 'completed' | 'in-progress' | 'upcoming';
  }[];
}

export default function TargetPage() {
  const [targetData, setTargetData] = useState<TargetData>({
    currentRevenue: 0,
    targetRevenue: 100000,
    progress: 0,
    daysRemaining: 365,
    dailyTarget: 274,
    monthlyTarget: 8333,
    weeklyTarget: 1923,
    channels: [
      {
        name: 'Google Ads',
        currentRevenue: 0,
        targetRevenue: 40000,
        progress: 0,
        status: 'upcoming'
      },
      {
        name: 'Facebook/Instagram',
        currentRevenue: 0,
        targetRevenue: 30000,
        progress: 0,
        status: 'upcoming'
      },
      {
        name: 'LinkedIn',
        currentRevenue: 0,
        targetRevenue: 15000,
        progress: 0,
        status: 'upcoming'
      },
      {
        name: 'Direct Sales',
        currentRevenue: 0,
        targetRevenue: 15000,
        progress: 0,
        status: 'upcoming'
      }
    ],
    milestones: [
      {
        id: '1',
        name: 'Q1 Milestone',
        targetAmount: 25000,
        currentAmount: 0,
        progress: 0,
        dueDate: '2024-03-31',
        status: 'upcoming'
      },
      {
        id: '2',
        name: 'Q2 Milestone',
        targetAmount: 50000,
        currentAmount: 0,
        progress: 0,
        dueDate: '2024-06-30',
        status: 'upcoming'
      },
      {
        id: '3',
        name: 'Q3 Milestone',
        targetAmount: 75000,
        currentAmount: 0,
        progress: 0,
        dueDate: '2024-09-30',
        status: 'upcoming'
      },
      {
        id: '4',
        name: 'Year End Goal',
        targetAmount: 100000,
        currentAmount: 0,
        progress: 0,
        dueDate: '2024-12-31',
        status: 'upcoming'
      }
    ]
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    // Simulate loading target data
    const loadTargetData = async () => {
      // In a real app, this would fetch from API
      setTimeout(() => {
        setTargetData(prev => ({
          ...prev,
          currentRevenue: 15000, // Simulated current revenue
          progress: 15 // 15% of target
        }));
      }, 1000);
    };

    loadTargetData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-green-500 bg-green-100';
      case 'behind':
        return 'text-red-500 bg-red-100';
      case 'ahead':
        return 'text-blue-500 bg-blue-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-100';
      case 'in-progress':
        return 'text-blue-500 bg-blue-100';
      case 'upcoming':
        return 'text-gray-500 bg-gray-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FlagIcon className="w-8 h-8 text-[#3B82F6]" />
            <h1 className="text-3xl font-bold">Target Dashboard</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Volg je voortgang naar het doel van {formatCurrency(targetData.targetRevenue)}
          </p>
        </div>

        {/* Main Target Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Totaal Doel</h3>
              <FlagIcon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(targetData.targetRevenue)}
            </div>
            <div className="text-blue-200 text-sm">
              Jaarlijks omzetdoel
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#059669] to-[#10B981] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Huidige Omzet</h3>
              <CurrencyDollarIcon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(targetData.currentRevenue)}
            </div>
            <div className="text-green-200 text-sm">
              {targetData.progress}% van doel bereikt
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#DC2626] to-[#EF4444] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nog Te Behalen</h3>
              <ArrowTrendingUpIcon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(targetData.targetRevenue - targetData.currentRevenue)}
            </div>
            <div className="text-red-200 text-sm">
              {targetData.daysRemaining} dagen resterend
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#1F2937] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Voortgang</h3>
            <span className="text-2xl font-bold text-[#3B82F6]">
              {targetData.progress}%
            </span>
          </div>
          <div className="w-full bg-[#374151] rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-[#3B82F6] to-[#1E40AF] h-4 rounded-full transition-all duration-500"
              style={{ width: `${targetData.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatCurrency(targetData.currentRevenue)}</span>
            <span>{formatCurrency(targetData.targetRevenue)}</span>
          </div>
        </div>

        {/* Daily/Weekly/Monthly Targets */}
        <div className="bg-[#1F2937] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Doelen per Periode</h3>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTimeframe === timeframe
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-[#374151] text-gray-300 hover:bg-[#4B5563]'
                  }`}
                >
                  {timeframe === 'daily' ? 'Dagelijks' : 
                   timeframe === 'weekly' ? 'Wekelijks' : 'Maandelijks'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#3B82F6] mb-2">
                {formatCurrency(
                  selectedTimeframe === 'daily' ? targetData.dailyTarget :
                  selectedTimeframe === 'weekly' ? targetData.weeklyTarget :
                  targetData.monthlyTarget
                )}
              </div>
              <div className="text-gray-400">
                {selectedTimeframe === 'daily' ? 'Per dag' : 
                 selectedTimeframe === 'weekly' ? 'Per week' : 'Per maand'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {formatCurrency(
                  selectedTimeframe === 'daily' ? targetData.currentRevenue / 365 :
                  selectedTimeframe === 'weekly' ? targetData.currentRevenue / 52 :
                  targetData.currentRevenue / 12
                )}
              </div>
              <div className="text-gray-400">Huidige gemiddelde</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {formatCurrency(
                  selectedTimeframe === 'daily' ? 
                    (targetData.targetRevenue - targetData.currentRevenue) / targetData.daysRemaining :
                  selectedTimeframe === 'weekly' ? 
                    (targetData.targetRevenue - targetData.currentRevenue) / (targetData.daysRemaining / 7) :
                    (targetData.targetRevenue - targetData.currentRevenue) / (targetData.daysRemaining / 30)
                )}
              </div>
              <div className="text-gray-400">Nodig om doel te halen</div>
            </div>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#1F2937] rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6">Kanaal Prestaties</h3>
            <div className="space-y-4">
              {targetData.channels.map((channel, index) => (
                <div key={index} className="bg-[#374151] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{channel.name}</h4>
                    <span className="text-sm font-medium">
                      {formatCurrency(channel.currentRevenue)} / {formatCurrency(channel.targetRevenue)}
                    </span>
                  </div>
                  <div className="w-full bg-[#4B5563] rounded-full h-2 mb-2">
                    <div 
                      className="bg-[#3B82F6] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(channel.currentRevenue / channel.targetRevenue) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{Math.round((channel.currentRevenue / channel.targetRevenue) * 100)}%</span>
                    <span className={getStatusColor(channel.status)}>
                      {channel.status === 'on-track' ? 'Op schema' :
                       channel.status === 'behind' ? 'Achter' : 'Vooruit'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-[#1F2937] rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6">Mijlpalen</h3>
            <div className="space-y-4">
              {targetData.milestones.map((milestone) => (
                <div key={milestone.id} className="bg-[#374151] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{milestone.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                      {milestone.status === 'completed' ? 'Voltooid' :
                       milestone.status === 'in-progress' ? 'Bezig' : 'Aankomend'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      {formatCurrency(milestone.currentAmount)} / {formatCurrency(milestone.targetAmount)}
                    </span>
                    <span className="text-sm font-medium">{milestone.progress}%</span>
                  </div>
                  <div className="w-full bg-[#4B5563] rounded-full h-2 mb-2">
                    <div 
                      className="bg-[#3B82F6] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${milestone.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Vervaldatum: {formatDate(milestone.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-8 bg-[#1F2937] rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-6">Actiepunten</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#374151] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <RocketLaunchIcon className="w-5 h-5 text-[#3B82F6]" />
                <h4 className="font-semibold">Start Campagnes</h4>
              </div>
              <p className="text-sm text-gray-400">
                Begin met Google Ads en Facebook campagnes om de eerste omzet te genereren
              </p>
            </div>
            
            <div className="bg-[#374151] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <UserGroupIcon className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold">Lead Generation</h4>
              </div>
              <p className="text-sm text-gray-400">
                Focus op LinkedIn voor B2B leads en directe verkoop
              </p>
            </div>
            
            <div className="bg-[#374151] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <ChartBarIcon className="w-5 h-5 text-orange-500" />
                <h4 className="font-semibold">Analytics</h4>
              </div>
              <p className="text-sm text-gray-400">
                Monitor prestaties en optimaliseer campagnes voor betere ROI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 