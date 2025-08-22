'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon,
  PauseIcon,
  EyeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface CampaignOverviewProps {
  onClose: () => void;
}

interface CampaignData {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED';
  objective: string;
  daily_budget: number;
  ad_sets: AdSetData[];
}

interface AdSetData {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED';
  daily_budget: number;
  targeting: {
    age_min: number;
    age_max: number;
    genders: string[];
    locations: string[];
  };
  video_name: string;
  ad_creative: {
    title: string;
    body: string;
  };
  insights?: {
    impressions: number;
    clicks: number;
    spend: number;
    reach: number;
    ctr: number;
    cpc: number;
  };
}

export default function CampaignOverview({ onClose }: CampaignOverviewProps) {
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock campaign data for demonstration
  const mockCampaign: CampaignData = {
    id: 'campaign_123',
    name: 'TTM - Algemene Prelaunch Campagne',
    status: 'PAUSED',
    objective: 'TRAFFIC',
    daily_budget: 150,
    ad_sets: [
      {
        id: 'adset_1',
        name: 'TTM - Algemeen - Prelaunch Awareness',
        status: 'PAUSED',
        daily_budget: 25,
        targeting: {
          age_min: 18,
          age_max: 65,
          genders: ['all'],
          locations: ['NL', 'BE']
        },
        video_name: 'algemeen_01',
        ad_creative: {
          title: 'Word Lid van Top Tier Men',
          body: 'Sluit je aan bij een community van mannen die streven naar excellentie. Meld je aan voor de wachtrij en krijg exclusieve toegang tot onze prelaunch.'
        }
      },
      {
        id: 'adset_2',
        name: 'TTM - Algemeen - Fitness Community',
        status: 'PAUSED',
        daily_budget: 30,
        targeting: {
          age_min: 25,
          age_max: 55,
          genders: ['men'],
          locations: ['NL']
        },
        video_name: 'algemeen_02',
        ad_creative: {
          title: 'Fitness Community voor Mannen',
          body: 'Ontdek een nieuwe manier van trainen en leven. Top Tier Men - waar fitness, mindset en community samenkomen. Meld je aan voor exclusieve toegang.'
        }
      },
      {
        id: 'adset_3',
        name: 'TTM - Algemeen - Lifestyle Upgrade',
        status: 'PAUSED',
        daily_budget: 35,
        targeting: {
          age_min: 30,
          age_max: 50,
          genders: ['all'],
          locations: ['NL', 'BE', 'DE']
        },
        video_name: 'algemeen_03',
        ad_creative: {
          title: 'Upgrade Je Lifestyle',
          body: 'Klaar voor de volgende stap? Top Tier Men helpt je je leven naar het volgende niveau te tillen. Fitness, mindset, community. Meld je aan voor de wachtrij.'
        }
      },
      {
        id: 'adset_4',
        name: 'TTM - Algemeen - Business Professionals',
        status: 'PAUSED',
        daily_budget: 40,
        targeting: {
          age_min: 28,
          age_max: 45,
          genders: ['all'],
          locations: ['NL']
        },
        video_name: 'algemeen_04',
        ad_creative: {
          title: 'Voor Business Professionals',
          body: 'Balans tussen werk en gezondheid. Top Tier Men biedt een community waar ambitieuze professionals hun fitness en mindset kunnen ontwikkelen.'
        }
      },
      {
        id: 'adset_5',
        name: 'TTM - Algemeen - Community Building',
        status: 'PAUSED',
        daily_budget: 20,
        targeting: {
          age_min: 22,
          age_max: 40,
          genders: ['all'],
          locations: ['NL', 'BE']
        },
        video_name: 'algemeen_05',
        ad_creative: {
          title: 'Word Onderdeel van Onze Community',
          body: 'Zoek je een community van gelijkgestemden? Top Tier Men brengt mannen samen die streven naar excellentie. Meld je aan voor exclusieve toegang.'
        }
      }
    ]
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCampaign(mockCampaign);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleCampaignStatus = () => {
    if (campaign) {
      setCampaign({
        ...campaign,
        status: campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
      });
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'text-green-400' : 'text-yellow-400';
  };

  const getStatusBg = (status: string) => {
    return status === 'ACTIVE' ? 'bg-green-600' : 'bg-yellow-600';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl p-8 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white">No campaign data available</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Facebook Campaign Overview</h2>
              <p className="text-blue-100">1 Campaign • 5 Ad Sets • 5 Ads</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Campaign Summary */}
        <div className="p-6 border-b border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Campaign Status</p>
                  <p className={`text-lg font-semibold ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </p>
                </div>
                <button
                  onClick={toggleCampaignStatus}
                  className={`p-2 rounded-lg ${getStatusBg(campaign.status)} hover:opacity-80`}
                >
                  {campaign.status === 'ACTIVE' ? (
                    <PauseIcon className="w-5 h-5 text-white" />
                  ) : (
                    <PlayIcon className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-6 h-6 text-green-400 mr-2" />
                <div>
                  <p className="text-gray-400 text-sm">Daily Budget</p>
                  <p className="text-lg font-semibold text-white">€{campaign.daily_budget}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center">
                <ChartBarIcon className="w-6 h-6 text-blue-400 mr-2" />
                <div>
                  <p className="text-gray-400 text-sm">Objective</p>
                  <p className="text-lg font-semibold text-white">{campaign.objective}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center">
                <VideoCameraIcon className="w-6 h-6 text-purple-400 mr-2" />
                <div>
                  <p className="text-gray-400 text-sm">Ad Sets</p>
                  <p className="text-lg font-semibold text-white">{campaign.ad_sets.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Sets List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <h3 className="text-xl font-bold text-white mb-4">Ad Sets</h3>
          
          <div className="space-y-4">
            {campaign.ad_sets.map((adSet, index) => (
              <motion.div
                key={adSet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded-full mr-3">
                        {index + 1}
                      </span>
                      <h4 className="text-lg font-semibold text-white">{adSet.name}</h4>
                      <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(adSet.status)} text-white`}>
                        {adSet.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-gray-300">€{adSet.daily_budget}/day</span>
                      </div>
                      <div className="flex items-center">
                        <UserGroupIcon className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-gray-300">
                          {adSet.targeting.age_min}-{adSet.targeting.age_max} jaar, 
                          {adSet.targeting.genders[0] === 'all' ? ' Alle geslachten' : adSet.targeting.genders[0] === 'men' ? ' Mannen' : ' Vrouwen'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <GlobeAltIcon className="w-4 h-4 text-purple-400 mr-2" />
                        <span className="text-gray-300">{adSet.targeting.locations.join(', ')}</span>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <VideoCameraIcon className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-gray-300 font-medium">Video: {adSet.video_name}</span>
                      </div>
                      <div className="text-sm">
                        <p className="text-white font-medium mb-1">{adSet.ad_creative.title}</p>
                        <p className="text-gray-400">{adSet.ad_creative.body}</p>
                      </div>
                    </div>

                    {/* Mock Insights */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Impressions</p>
                        <p className="text-white font-semibold">0</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Clicks</p>
                        <p className="text-white font-semibold">0</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">CTR</p>
                        <p className="text-white font-semibold">0%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Spend</p>
                        <p className="text-white font-semibold">€0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Campaign ID: {campaign.id}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.open('https://www.facebook.com/adsmanager', '_blank')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Open in Facebook Ads Manager
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
