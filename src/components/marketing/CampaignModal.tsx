'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface CampaignData {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  startDate: string;
  endDate: string;
  targetAudience: {
    ageRange: string;
    interests: string[];
    locations: string[];
    gender: string;
  };
  adSets: Array<{
    id: string;
    name: string;
    status: string;
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
  performanceData: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    revenue: number;
  }>;
  demographics: Array<{
    age: string;
    percentage: number;
    impressions: number;
  }>;
  devices: Array<{
    device: string;
    percentage: number;
    impressions: number;
  }>;
}

interface CampaignModalProps {
  campaign: CampaignData | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors = {
  active: 'text-green-400',
  paused: 'text-yellow-400',
  completed: 'text-blue-400',
  draft: 'text-gray-400'
};

const statusIcons = {
  active: CheckCircleIcon,
  paused: ExclamationTriangleIcon,
  completed: CheckCircleIcon,
  draft: ClockIcon
};

export default function CampaignModal({ campaign, isOpen, onClose }: CampaignModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'audience' | 'adsets'>('overview');

  if (!campaign) return null;

  const StatusIcon = statusIcons[campaign.status];
  const remainingBudget = campaign.budget - campaign.spent;
  const budgetPercentage = (campaign.spent / campaign.budget) * 100;

  const tabs = [
    { id: 'overview', name: 'Overzicht', icon: ChartBarIcon },
    { id: 'performance', name: 'Performance', icon: ArrowTrendingUpIcon },
    { id: 'audience', name: 'Audience', icon: UserGroupIcon },
    { id: 'adsets', name: 'Ad Sets', icon: EyeIcon },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#1A1F2E] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-6 h-6 ${statusColors[campaign.status]}`} />
                  <h2 className="text-2xl font-bold text-white">{campaign.name}</h2>
                </div>
                <span className="px-3 py-1 text-sm font-medium bg-gray-800 text-gray-300 rounded-full">
                  {campaign.platform}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-white border-b-2 border-[#3B82F6] bg-gray-800/50'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                        <span className="text-sm text-gray-400">Budget</span>
                      </div>
                      <div className="text-2xl font-bold text-white">€{campaign.budget.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">
                        €{campaign.spent.toLocaleString()} uitgegeven
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <EyeIcon className="w-5 h-5 text-blue-400" />
                        <span className="text-sm text-gray-400">Impressions</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{campaign.impressions.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">
                        €{campaign.cpm.toFixed(2)} CPM
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CursorArrowRaysIcon className="w-5 h-5 text-purple-400" />
                        <span className="text-sm text-gray-400">Clicks</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{campaign.clicks.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">
                        {campaign.ctr.toFixed(2)}% CTR
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <UserGroupIcon className="w-5 h-5 text-orange-400" />
                        <span className="text-sm text-gray-400">Conversions</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{campaign.conversions.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">
                        {campaign.roas.toFixed(2)}x ROAS
                      </div>
                    </motion.div>
                  </div>

                  {/* Budget Progress */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Budget Gebruik</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Uitgegeven</span>
                        <span className="text-white">€{campaign.spent.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-3 rounded-full ${
                            budgetPercentage > 90 ? 'bg-red-500' : 
                            budgetPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Resterend</span>
                        <span className="text-white">€{remainingBudget.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Chart */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Performance Over Tijd</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={campaign.performanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1F2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="impressions" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="clicks" 
                            stroke="#10B981" 
                            strokeWidth={2}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'performance' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Revenue vs Spend</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={campaign.performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="spend" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Conversie Funnel</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Impressions</span>
                          <span className="text-white font-semibold">{campaign.impressions.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Clicks</span>
                          <span className="text-white font-semibold">{campaign.clicks.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(campaign.clicks / campaign.impressions) * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Conversions</span>
                          <span className="text-white font-semibold">{campaign.conversions.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(campaign.conversions / campaign.clicks) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'audience' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Leeftijdsgroepen</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={campaign.demographics}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ age, percentage }) => `${age} (${percentage}%)`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="impressions"
                            >
                              {campaign.demographics.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Apparaten</h3>
                      <div className="space-y-4">
                        {campaign.devices.map((device, index) => (
                          <div key={device.device} className="flex items-center justify-between">
                            <span className="text-gray-400">{device.device}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${device.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-white text-sm w-12 text-right">{device.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Target Audience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Leeftijd</h4>
                        <p className="text-white">{campaign.targetAudience.ageRange}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Geslacht</h4>
                        <p className="text-white">{campaign.targetAudience.gender}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Locaties</h4>
                        <div className="flex flex-wrap gap-1">
                          {campaign.targetAudience.locations.map((location, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                              {location}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Interesses</h4>
                      <div className="flex flex-wrap gap-2">
                        {campaign.targetAudience.interests.map((interest, index) => (
                          <span key={index} className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'adsets' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-700">
                      <h3 className="text-lg font-semibold text-white">Ad Sets</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-900">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Naam
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Budget
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Uitgegeven
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Impressions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Clicks
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Conversions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {campaign.adSets.map((adSet, index) => (
                            <motion.tr
                              key={adSet.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="hover:bg-gray-700/50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                {adSet.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  adSet.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                  adSet.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {adSet.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                €{adSet.budget.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                €{adSet.spent.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                {adSet.impressions.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                {adSet.clicks.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                {adSet.conversions.toLocaleString()}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 