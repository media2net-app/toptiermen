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
  ArrowTrendingDownIcon,
  PlayIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Advertisement {
  id: string;
  name: string;
  campaign: string;
  platform: string;
  status: 'active' | 'paused' | 'rejected' | 'draft' | 'pending_review';
  type: 'image' | 'video' | 'carousel' | 'story';
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spent: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  targetAudience: string;
  startDate: string;
  endDate: string;
  budget: number;
  dailyBudget: number;
  createdAt: string;
  lastUpdated: string;
}

interface AdModalProps {
  ad: Advertisement | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors = {
  active: 'text-green-400',
  paused: 'text-yellow-400',
  rejected: 'text-red-400',
  draft: 'text-gray-400',
  pending_review: 'text-blue-400'
};

const statusIcons = {
  active: CheckCircleIcon,
  paused: PauseIcon,
  rejected: ExclamationTriangleIcon,
  draft: ClockIcon,
  pending_review: ExclamationTriangleIcon
};

const performanceColors = {
  excellent: 'text-green-400',
  good: 'text-blue-400',
  average: 'text-yellow-400',
  poor: 'text-red-400'
};

export default function AdModal({ ad, isOpen, onClose }: AdModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'audience' | 'settings'>('overview');

  if (!ad) return null;

  const StatusIcon = statusIcons[ad.status];
  const remainingBudget = ad.budget - ad.spent;
  const budgetPercentage = (ad.spent / ad.budget) * 100;

  // Mock performance data
  const performanceData = [
    { date: '2025-07-01', impressions: 2800, clicks: 95, ctr: 3.4, spend: 31 },
    { date: '2025-07-02', impressions: 3100, clicks: 105, ctr: 3.4, spend: 35 },
    { date: '2025-07-03', impressions: 2900, clicks: 98, ctr: 3.4, spend: 32 },
    { date: '2025-07-04', impressions: 3200, clicks: 109, ctr: 3.4, spend: 36 },
    { date: '2025-07-05', impressions: 3000, clicks: 102, ctr: 3.4, spend: 34 },
    { date: '2025-07-06', impressions: 2850, clicks: 97, ctr: 3.4, spend: 32 },
    { date: '2025-07-07', impressions: 3150, clicks: 107, ctr: 3.4, spend: 35 }
  ];

  const audienceData = [
    { age: '18-24', percentage: 20, impressions: 17000 },
    { age: '25-34', percentage: 35, impressions: 29750 },
    { age: '35-44', percentage: 30, impressions: 25500 },
    { age: '45-54', percentage: 12, impressions: 10200 },
    { age: '55+', percentage: 3, impressions: 2550 }
  ];

  const deviceData = [
    { device: 'Mobile', percentage: 65, impressions: 55250 },
    { device: 'Desktop', percentage: 30, impressions: 25500 },
    { device: 'Tablet', percentage: 5, impressions: 4250 }
  ];

  const tabs = [
    { id: 'overview', name: 'Overzicht', icon: ChartBarIcon },
    { id: 'performance', name: 'Performance', icon: ArrowTrendingUpIcon },
    { id: 'audience', name: 'Audience', icon: UserGroupIcon },
    { id: 'settings', name: 'Instellingen', icon: PencilIcon },
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
            className="bg-[#1A1F2E] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-6 h-6 ${statusColors[ad.status]}`} />
                  <h2 className="text-2xl font-bold text-white">{ad.name}</h2>
                </div>
                <span className="px-3 py-1 text-sm font-medium bg-gray-800 text-gray-300 rounded-full">
                  {ad.platform}
                </span>
                <span className="px-3 py-1 text-sm font-medium bg-blue-900/20 text-blue-400 rounded-full">
                  {ad.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  <TrashIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
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
                        <EyeIcon className="w-5 h-5 text-blue-400" />
                        <span className="text-sm text-gray-400">Impressies</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{ad.impressions.toLocaleString()}</div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CursorArrowRaysIcon className="w-5 h-5 text-purple-400" />
                        <span className="text-sm text-gray-400">Clicks</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{ad.clicks.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">{ad.ctr}% CTR</div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                        <span className="text-sm text-gray-400">Uitgegeven</span>
                      </div>
                      <div className="text-2xl font-bold text-white">€{ad.spent.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">€{ad.cpc} CPC</div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <ChartBarIcon className="w-5 h-5 text-orange-400" />
                        <span className="text-sm text-gray-400">Performance</span>
                      </div>
                      <div className={`text-2xl font-bold ${performanceColors[ad.performance]}`}>
                        {ad.performance}
                      </div>
                    </motion.div>
                  </div>

                  {/* Budget Progress */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Budget Gebruik</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Uitgegeven</span>
                        <span className="text-white">€{ad.spent.toLocaleString()}</span>
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
                        <LineChart data={performanceData}>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">CTR Trend</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={performanceData}>
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
                            <Bar dataKey="ctr" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Spend vs Clicks</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={performanceData}>
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
                            <Bar dataKey="clicks" fill="#10B981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
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
                              data={audienceData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ age, percentage }) => `${age} (${percentage}%)`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="impressions"
                            >
                              {audienceData.map((entry, index) => (
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
                        {deviceData.map((device, index) => (
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
                    <p className="text-gray-300 mb-4">{ad.targetAudience}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Start Datum</h4>
                        <p className="text-white">{new Date(ad.startDate).toLocaleDateString('nl-NL')}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Eind Datum</h4>
                        <p className="text-white">{new Date(ad.endDate).toLocaleDateString('nl-NL')}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Advertentie Instellingen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]">
                          <option value="active">Actief</option>
                          <option value="paused">Gepauzeerd</option>
                          <option value="draft">Concept</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Dagelijks Budget</label>
                        <input 
                          type="number" 
                          defaultValue={ad.dailyBudget}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Totaal Budget</label>
                        <input 
                          type="number" 
                          defaultValue={ad.budget}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Campagne</label>
                        <input 
                          type="text" 
                          defaultValue={ad.campaign}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors">
                        Opslaan
                      </button>
                      <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                        Annuleren
                      </button>
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