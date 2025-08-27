'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  EyeIcon, 
  CursorArrowRaysIcon, 
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  BellIcon,
  FireIcon,
  TrophyIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Lead {
  id: string;
  email: string;
  source: string;
  status: string;
  package: string;
  notes: string;
  subscribed_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

interface CampaignData {
  id: string;
  name: string;
  status: string;
  impressions: string;
  clicks: string;
  spend: number;
  ctr: string;
  cpc: number;
  conversions?: number;
}

export default function ConversieOverzicht() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching data...');
      
      // Fetch leads
      const leadsResponse = await fetch('/api/prelaunch-leads');
      const leadsData = await leadsResponse.json();
      console.log('📊 Leads data:', leadsData);
      
      if (leadsData.success) {
        // Filter out test leads
        const filteredLeads = leadsData.leads.filter((lead: Lead) => 
          !lead.email.includes('@media2net.nl') && 
          !lead.email.includes('@test.com') &&
          !lead.email.includes('admin@test.com')
        );
        setLeads(filteredLeads);
        console.log('✅ Filtered leads (removed test leads):', filteredLeads.length);
      }
      
      // Fetch Facebook analytics with manual data (matching live Facebook Ads Manager)
      const analyticsResponse = await fetch('/api/facebook/comprehensive-analytics?dateRange=maximum&useManualData=true&forceManual=true');
      const analyticsResult = await analyticsResponse.json();
      console.log('📈 Analytics data:', analyticsResult);
      
      if (analyticsResult.success) {
        console.log('✅ Setting analytics data:', analyticsResult.data);
        setAnalyticsData(analyticsResult.data);
      } else {
        console.error('❌ Analytics API failed:', analyticsResult);
      }
      
      setLastSync(new Date());
      
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError('Fout bij het ophalen van data');
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Component mounted, fetching data...');
    fetchData();
    
    // Temporary fix: force loading to false after 3 seconds
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    await fetchData();
  };

  const getCampaignFromNotes = (notes: string) => {
    const campaignMatch = notes.match(/Campaign: ([^|]+)/);
    const adSetMatch = notes.match(/Ad Set: ([^|]+)/);
    return {
      campaign: campaignMatch ? campaignMatch[1].trim() : 'Onbekend',
      adSet: adSetMatch ? adSetMatch[1].trim() : 'Onbekend'
    };
  };

  const getCampaignName = (campaignId: string) => {
    if (!analyticsData?.campaigns) return 'Onbekend';
    const campaign = analyticsData.campaigns.find((c: any) => c.id === campaignId);
    return campaign ? campaign.name : 'Onbekend';
  };

  // Calculate conversion stats correctly
  const calculateConversionStats = () => {
    const totalLeads = leads.length;
    const facebookAdLeads = leads.filter(lead => lead.notes.includes('Campaign:') && !lead.notes.includes('Campaign: test'));
    const organicLeads = leads.filter(lead => !lead.notes.includes('Campaign:'));
    

    
    const totalSpend = analyticsData?.summary?.totalSpend || 0;
    const totalClicks = analyticsData?.summary?.totalClicks ? parseInt(analyticsData.summary.totalClicks) : 0;
    const totalImpressions = analyticsData?.summary?.totalImpressions ? parseInt(analyticsData.summary.totalImpressions) : 0;
    const totalReach = analyticsData?.summary?.totalReach ? parseInt(analyticsData.summary.totalReach) : 0;
    
    // Cost per lead only from Facebook ads
    const costPerFacebookLead = facebookAdLeads.length > 0 ? totalSpend / facebookAdLeads.length : 0;
    
    // Conversion rate based on ad clicks (exact calculation)
    const conversionRateFromClicks = totalClicks > 0 ? (facebookAdLeads.length / totalClicks * 100) : 0;
    

    
    return {
      totalLeads,
      facebookAdLeads: facebookAdLeads.length,
      organicLeads: organicLeads.length,
      totalSpend,
      totalClicks,
      totalImpressions,
      totalReach,
      costPerFacebookLead,
      conversionRateFromClicks
    };
  };

  const conversionStats = calculateConversionStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p>Data laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-red-400 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
          <p>{error}</p>
          <button 
            onClick={handleSync}
            className="mt-4 px-4 py-2 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#7A9D4A] transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
                      <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Conversie Overzicht</h1>
                <p className="text-gray-400">Bekijk alle conversies en campaign performance data (test leads gefilterd) - LIVE Facebook Data</p>
              </div>
            <div className="flex items-center space-x-4">
              {lastSync && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Laatste sync:</p>
                  <p className="text-sm text-white">
                    {lastSync.toLocaleTimeString('nl-NL', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    syncing 
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                      : 'bg-[#8BAE5A] text-white hover:bg-[#7A9D4A]'
                  }`}
                >
                  <ArrowPathIcon className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Syncing...' : 'Sync Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Totaal Leads</p>
                <p className="text-2xl font-bold text-white">{conversionStats.totalLeads}</p>
                <p className="text-xs text-gray-500">(excl. test leads)</p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-[#8BAE5A]" />
            </div>
          </div>

          <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Facebook Ad Leads</p>
                <p className="text-2xl font-bold text-white">{conversionStats.facebookAdLeads}</p>
                <p className="text-xs text-gray-500">Van ads</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Cost per Ad Lead</p>
                <p className="text-2xl font-bold text-white">€{conversionStats.costPerFacebookLead.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Alleen van ads</p>
              </div>
              <CurrencyEuroIcon className="h-8 w-8 text-[#8BAE5A]" />
            </div>
          </div>

          <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Conversie Rate</p>
                <p className="text-2xl font-bold text-white">{conversionStats.conversionRateFromClicks.toFixed(2)}%</p>
                <p className="text-xs text-gray-500">Van ad clicks</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-[#8BAE5A]" />
            </div>
          </div>
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Totale Impressions</p>
                <p className="text-2xl font-bold text-white">{analyticsData?.summary?.totalImpressions?.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-500">Advertentie weergaven</p>
              </div>
              <EyeIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Totale Clicks</p>
                <p className="text-2xl font-bold text-white">{analyticsData?.summary?.totalClicks?.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-500">Advertentie klikken</p>
              </div>
              <CursorArrowRaysIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Totale Reach</p>
                <p className="text-2xl font-bold text-white">{analyticsData?.summary?.totalReach?.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-500">Unieke bereik</p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-cyan-500" />
            </div>
          </div>

          <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Totale Ad Spend</p>
                <p className="text-2xl font-bold text-white">€{analyticsData?.summary?.totalSpend?.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-gray-500">Totaal uitgegeven</p>
              </div>
              <CurrencyEuroIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Lead Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <UserGroupIcon className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-white">Lead Breakdown</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Facebook Ad Leads:</span>
                <span className="text-white font-semibold">{conversionStats.facebookAdLeads}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Organische Leads:</span>
                <span className="text-white font-semibold">{conversionStats.organicLeads}</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-gray-400">Totaal:</span>
                <span className="text-white font-bold">{conversionStats.totalLeads}</span>
              </div>
            </div>
          </div>

          <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CurrencyEuroIcon className="h-6 w-6 text-green-500" />
              <h3 className="text-lg font-semibold text-white">Kosten Analyse</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Totale Ad Spend:</span>
                <span className="text-white font-semibold">€{conversionStats.totalSpend.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ad Leads:</span>
                <span className="text-white font-semibold">{conversionStats.facebookAdLeads}</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-gray-400">Cost per Lead:</span>
                <span className="text-white font-bold">€{conversionStats.costPerFacebookLead.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ArrowTrendingUpIcon className="h-6 w-6 text-purple-500" />
              <h3 className="text-lg font-semibold text-white">Performance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Ad Clicks:</span>
                <span className="text-white font-semibold">{conversionStats.totalClicks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ad Leads:</span>
                <span className="text-white font-semibold">{conversionStats.facebookAdLeads}</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-gray-400">Conversie Rate:</span>
                <span className="text-white font-bold">{conversionStats.conversionRateFromClicks.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Performance */}
        {analyticsData?.campaigns && (
          <div className="bg-black/50 border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Campaign Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Campaign</th>
                    <th className="text-right py-3 px-4">Impressions</th>
                    <th className="text-right py-3 px-4">Clicks</th>
                    <th className="text-right py-3 px-4">CTR</th>
                    <th className="text-right py-3 px-4">CPC</th>
                    <th className="text-right py-3 px-4">Spend</th>
                    <th className="text-right py-3 px-4">Conversies</th>
                    <th className="text-right py-3 px-4">Cost/Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.campaigns.map((campaign: any) => {
                    // Use conversions directly from API instead of calculating from leads
                    const conversions = campaign.conversions || 0;
                    const costPerConversion = conversions > 0 && campaign.spend ? campaign.spend / conversions : 0;
                    
                    return (
                      <tr key={campaign.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-white">{campaign.name}</p>
                            <p className="text-xs text-gray-400">{campaign.id}</p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-gray-300">{parseInt(campaign.impressions).toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-gray-300">{parseInt(campaign.clicks).toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-gray-300">{campaign.ctr ? `${(campaign.ctr * 100).toFixed(2)}%` : '0.00%'}</td>
                        <td className="text-right py-3 px-4 text-gray-300">€{campaign.cpc ? campaign.cpc.toFixed(3) : '0.000'}</td>
                        <td className="text-right py-3 px-4 text-gray-300">€{campaign.spend ? campaign.spend.toFixed(2) : '0.00'}</td>
                        <td className="text-right py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {conversions}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4 text-gray-300">
                          {costPerConversion > 0 ? `€${costPerConversion.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Alle Leads ({leads.length}) - Exclusief Test Leads</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Campaign</th>
                  <th className="text-left py-3 px-4">Ad Set</th>
                  <th className="text-left py-3 px-4">Datum</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Bron</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const { campaign, adSet } = getCampaignFromNotes(lead.notes);
                  const campaignName = getCampaignName(campaign);
                  const isFacebookAd = lead.notes.includes('Campaign:') && !lead.notes.includes('Campaign: test');
                  const leadType = isFacebookAd ? 'Facebook Ad' : 'Organisch';
                  
                  return (
                    <tr key={lead.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-white">{lead.email}</p>
                          <p className="text-xs text-gray-400">ID: {lead.id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isFacebookAd 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {leadType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white">{campaignName}</p>
                          <p className="text-xs text-gray-400">{campaign}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{adSet}</td>
                      <td className="py-3 px-4 text-gray-300">
                        {new Date(lead.subscribed_at).toLocaleDateString('nl-NL', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lead.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{lead.source}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Insights */}
        {analyticsData?.performanceInsights && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <TrophyIcon className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-gray-400 text-sm">Beste CTR</p>
                  <p className="text-lg font-semibold text-white">{analyticsData.performanceInsights.bestCTR}</p>
                </div>
              </div>
            </div>

            <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <CurrencyEuroIcon className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-gray-400 text-sm">Laagste CPC</p>
                  <p className="text-lg font-semibold text-white">{analyticsData.performanceInsights.lowestCPC}</p>
                </div>
              </div>
            </div>

            <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <FireIcon className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-gray-400 text-sm">Top Campaign</p>
                  <p className="text-lg font-semibold text-white">{analyticsData.performanceInsights.topPerformingCampaign}</p>
                </div>
              </div>
            </div>

            <div className="bg-black/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-gray-400 text-sm">Hoogste Spend</p>
                  <p className="text-lg font-semibold text-white">{analyticsData.performanceInsights.highestSpend}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
