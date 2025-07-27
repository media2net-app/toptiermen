'use client';

import { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Types
interface BudgetData {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  dailyBudget: number;
  dailySpent: number;
  monthlyBudget: number;
  monthlySpent: number;
  budgetUtilization: number;
}

interface CampaignBudget {
  id: string;
  name: string;
  platform: string;
  budget: number;
  spent: number;
  remaining: number;
  dailyBudget: number;
  dailySpent: number;
  status: 'active' | 'paused' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
  utilization: number;
}

interface SpendingTrend {
  date: string;
  spent: number;
  budget: number;
  remaining: number;
}

export default function BudgetPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [campaignBudgets, setCampaignBudgets] = useState<CampaignBudget[]>([]);
  const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);

  // Mock data
  useEffect(() => {
    const mockBudgetData: BudgetData = {
      totalBudget: 15000,
      totalSpent: 10500,
      remainingBudget: 4500,
      dailyBudget: 500,
      dailySpent: 350,
      monthlyBudget: 15000,
      monthlySpent: 10500,
      budgetUtilization: 70
    };

    const mockCampaignBudgets: CampaignBudget[] = [
      {
        id: "1",
        name: "Summer Fitness Challenge",
        platform: "Facebook",
        budget: 5000,
        spent: 2800,
        remaining: 2200,
        dailyBudget: 100,
        dailySpent: 70,
        status: "active",
        startDate: "2025-07-01",
        endDate: "2025-08-31",
        utilization: 56
      },
      {
        id: "2",
        name: "Brotherhood Community",
        platform: "Instagram",
        budget: 4000,
        spent: 2400,
        remaining: 1600,
        dailyBudget: 80,
        dailySpent: 60,
        status: "active",
        startDate: "2025-07-15",
        endDate: "2025-09-15",
        utilization: 60
      },
      {
        id: "3",
        name: "Premium Membership",
        platform: "Google Ads",
        budget: 8000,
        spent: 4200,
        remaining: 3800,
        dailyBudget: 150,
        dailySpent: 120,
        status: "active",
        startDate: "2025-06-01",
        endDate: "2025-12-31",
        utilization: 52.5
      },
      {
        id: "4",
        name: "Mind & Focus",
        platform: "Facebook",
        budget: 2000,
        spent: 1200,
        remaining: 800,
        dailyBudget: 40,
        dailySpent: 0,
        status: "paused",
        startDate: "2025-07-10",
        endDate: "2025-08-10",
        utilization: 60
      },
      {
        id: "5",
        name: "Finance & Business",
        platform: "LinkedIn",
        budget: 3000,
        spent: 0,
        remaining: 3000,
        dailyBudget: 60,
        dailySpent: 0,
        status: "draft",
        startDate: "2025-08-01",
        endDate: "2025-09-30",
        utilization: 0
      }
    ];

    const mockSpendingTrends: SpendingTrend[] = [
      { date: '2025-07-21', spent: 350, budget: 500, remaining: 4650 },
      { date: '2025-07-22', spent: 365, budget: 500, remaining: 4285 },
      { date: '2025-07-23', spent: 380, budget: 500, remaining: 3905 },
      { date: '2025-07-24', spent: 395, budget: 500, remaining: 3510 },
      { date: '2025-07-25', spent: 410, budget: 500, remaining: 3100 },
      { date: '2025-07-26', spent: 425, budget: 500, remaining: 2675 },
      { date: '2025-07-27', spent: 440, budget: 500, remaining: 2235 }
    ];

    setBudgetData(mockBudgetData);
    setCampaignBudgets(mockCampaignBudgets);
    setSpendingTrends(mockSpendingTrends);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'paused': return 'text-yellow-400 bg-yellow-900/20';
      case 'completed': return 'text-blue-400 bg-blue-900/20';
      case 'draft': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'text-red-400';
    if (utilization >= 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading budget data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Budget</h1>
          <p className="text-gray-400 mt-1">Budget beheer en uitgaven tracking</p>
        </div>
        <button 
          onClick={() => setShowAddBudgetModal(true)}
          className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Budget Toevoegen</span>
        </button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Budget</p>
              <p className="text-2xl font-bold text-white">
                €{budgetData?.totalBudget.toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Uitgegeven</p>
              <p className="text-2xl font-bold text-white">
                €{budgetData?.totalSpent.toLocaleString()}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">+12.5%</span>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Resterend Budget</p>
              <p className="text-2xl font-bold text-white">
                €{budgetData?.remainingBudget.toLocaleString()}
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="flex items-center mt-4 text-green-400">
            <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">-8.3%</span>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Budget Gebruik</p>
              <p className="text-2xl font-bold text-white">
                {budgetData?.budgetUtilization}%
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
          <div className="w-full bg-[#2D3748] rounded-full h-2 mt-4">
            <div 
              className={`h-2 rounded-full ${budgetData && budgetData.budgetUtilization >= 80 ? 'bg-red-400' : budgetData && budgetData.budgetUtilization >= 60 ? 'bg-yellow-400' : 'bg-[#8BAE5A]'}`}
              style={{ width: `${budgetData?.budgetUtilization}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Daily Budget Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Dagelijks Budget</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Budget</span>
              <span className="text-white font-medium">€{budgetData?.dailyBudget}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Uitgegeven</span>
              <span className="text-white font-medium">€{budgetData?.dailySpent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Resterend</span>
              <span className="text-white font-medium">€{(budgetData?.dailyBudget || 0) - (budgetData?.dailySpent || 0)}</span>
            </div>
            <div className="w-full bg-[#2D3748] rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${budgetData && (budgetData.dailySpent / budgetData.dailyBudget) >= 0.8 ? 'bg-red-400' : budgetData && (budgetData.dailySpent / budgetData.dailyBudget) >= 0.6 ? 'bg-yellow-400' : 'bg-[#8BAE5A]'}`}
                style={{ width: `${budgetData ? (budgetData.dailySpent / budgetData.dailyBudget) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Maandelijks Budget</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Budget</span>
              <span className="text-white font-medium">€{budgetData?.monthlyBudget.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Uitgegeven</span>
              <span className="text-white font-medium">€{budgetData?.monthlySpent.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Resterend</span>
              <span className="text-white font-medium">€{(budgetData?.monthlyBudget || 0) - (budgetData?.monthlySpent || 0)}</span>
            </div>
            <div className="w-full bg-[#2D3748] rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${budgetData && (budgetData.monthlySpent / budgetData.monthlyBudget) >= 0.8 ? 'bg-red-400' : budgetData && (budgetData.monthlySpent / budgetData.monthlyBudget) >= 0.6 ? 'bg-yellow-400' : 'bg-[#8BAE5A]'}`}
                style={{ width: `${budgetData ? (budgetData.monthlySpent / budgetData.monthlyBudget) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Budgets */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Campagne Budgets</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2D3748]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Campagne</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Platform</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Budget</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Uitgegeven</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Resterend</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Dagelijks</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Gebruik</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3748]">
              {campaignBudgets.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-[#2D3748] transition-colors">
                  <td className="px-4 py-2 text-sm font-medium text-white">{campaign.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{campaign.platform}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">€{campaign.budget.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">€{campaign.spent.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">€{campaign.remaining.toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">€{campaign.dailyBudget}/€{campaign.dailySpent}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={getUtilizationColor(campaign.utilization)}>
                      {campaign.utilization}%
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spending Trends Chart */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Uitgaven Trends</h2>
          <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
        </div>
        <div className="h-64 bg-[#2D3748] rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400">Uitgaven trends chart hier</p>
            <p className="text-gray-500 text-sm">Data: {spendingTrends.length} datapunten</p>
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Budget Waarschuwingen</h2>
        <div className="space-y-4">
          {campaignBudgets.filter(c => c.utilization >= 80).map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg bg-red-900/10">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-white font-medium">{campaign.name}</p>
                  <p className="text-gray-400 text-sm">Budget bijna op: {campaign.utilization}% gebruikt</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">€{campaign.remaining} resterend</p>
                <p className="text-gray-400 text-sm">van €{campaign.budget}</p>
              </div>
            </div>
          ))}
          {campaignBudgets.filter(c => c.utilization >= 80).length === 0 && (
            <div className="flex items-center justify-center p-8 text-center">
              <CheckCircleIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-gray-400">Geen budget waarschuwingen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 