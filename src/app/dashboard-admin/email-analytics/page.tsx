'use client';
import { useState, useEffect } from 'react';
import { 
  EnvelopeIcon,
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { AdminCard, AdminStatsCard, AdminTable } from '@/components/admin';
import { toast } from 'react-hot-toast';

interface EmailAnalytics {
  campaign_id: string;
  campaign_name: string;
  subject: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  bounce_count: number;
  unsubscribe_count: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  unsubscribe_rate: number;
  created_at: string;
  sent_at?: string;
  completed_at?: string;
}

interface EmailTracking {
  tracking_id: string;
  campaign_id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  status: string;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  unsubscribed_at?: string;
}

export default function EmailAnalytics() {
  const [analytics, setAnalytics] = useState<EmailAnalytics[]>([]);
  const [tracking, setTracking] = useState<EmailTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchEmailAnalytics();
  }, [timeRange]);

  useEffect(() => {
    if (selectedCampaign) {
      fetchCampaignTracking(selectedCampaign);
    }
  }, [selectedCampaign]);

  const fetchEmailAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/email/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics || []);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching email analytics:', error);
      toast.error('Fout bij ophalen email analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignTracking = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/email/analytics/${campaignId}`);
      if (response.ok) {
        const data = await response.json();
        setTracking(data.tracking || []);
      } else {
        throw new Error('Failed to fetch campaign tracking');
      }
    } catch (error) {
      console.error('Error fetching campaign tracking:', error);
      toast.error('Fout bij ophalen campagne tracking');
    }
  };

  const totalStats = analytics.reduce((acc, campaign) => ({
    totalEmails: acc.totalEmails + campaign.sent_count,
    totalOpens: acc.totalOpens + campaign.open_count,
    totalClicks: acc.totalClicks + campaign.click_count,
    totalBounces: acc.totalBounces + campaign.bounce_count,
    totalUnsubscribes: acc.totalUnsubscribes + campaign.unsubscribe_count
  }), { totalEmails: 0, totalOpens: 0, totalClicks: 0, totalBounces: 0, totalUnsubscribes: 0 });

  const avgOpenRate = analytics.length > 0 ? 
    analytics.reduce((acc, c) => acc + c.open_rate, 0) / analytics.length : 0;
  const avgClickRate = analytics.length > 0 ? 
    analytics.reduce((acc, c) => acc + c.click_rate, 0) / analytics.length : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-400';
      case 'delivered': return 'text-blue-400';
      case 'opened': return 'text-purple-400';
      case 'clicked': return 'text-yellow-400';
      case 'bounced': return 'text-red-400';
      case 'unsubscribed': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <EnvelopeIcon className="w-4 h-4" />;
      case 'delivered': return <EnvelopeIcon className="w-4 h-4" />;
      case 'opened': return <EyeIcon className="w-4 h-4" />;
      case 'clicked': return <CursorArrowRaysIcon className="w-4 h-4" />;
      case 'bounced': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'unsubscribed': return <UserGroupIcon className="w-4 h-4" />;
      default: return <EnvelopeIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto"></div>
            <p className="text-[#8BAE5A] mt-4">Email analytics laden...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Email Analytics
            </h1>
            <p className="text-gray-300 text-lg">
              Volg de prestaties van je email campagnes
            </p>
          </div>
          
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-[#8BAE5A] text-[#181F17]'
                    : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#3A4D23]'
                }`}
              >
                {range === '7d' ? '7 dagen' : range === '30d' ? '30 dagen' : '90 dagen'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatsCard
            title="Emails Verzonden"
            value={totalStats.totalEmails.toLocaleString()}
            icon={<EnvelopeIcon className="w-6 h-6" />}
            trend={totalStats.totalEmails > 0 ? 'up' : 'neutral'}
            trendValue=""
          />
          
          <AdminStatsCard
            title="Gemiddelde Open Rate"
            value={`${avgOpenRate.toFixed(1)}%`}
            icon={<EyeIcon className="w-6 h-6" />}
            trend={avgOpenRate > 20 ? 'up' : avgOpenRate > 10 ? 'neutral' : 'down'}
            trendValue=""
          />
          
          <AdminStatsCard
            title="Gemiddelde Click Rate"
            value={`${avgClickRate.toFixed(1)}%`}
            icon={<CursorArrowRaysIcon className="w-6 h-6" />}
            trend={avgClickRate > 3 ? 'up' : avgClickRate > 1 ? 'neutral' : 'down'}
            trendValue=""
          />
          
          <AdminStatsCard
            title="Totaal Clicks"
            value={totalStats.totalClicks.toLocaleString()}
            icon={<ChartBarIcon className="w-6 h-6" />}
            trend={totalStats.totalClicks > 0 ? 'up' : 'neutral'}
            trendValue=""
          />
        </div>

        {/* Campaign Analytics Table */}
        <AdminCard title="Campagne Overzicht" icon={<ChartBarIcon className="w-6 h-6" />}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#3A4D23]">
                  <th className="text-left py-3 px-4 font-semibold text-[#8BAE5A]">Campagne</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#8BAE5A]">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-[#8BAE5A]">Verzonden</th>
                  <th className="text-right py-3 px-4 font-semibold text-[#8BAE5A]">Opens</th>
                  <th className="text-right py-3 px-4 font-semibold text-[#8BAE5A]">Clicks</th>
                  <th className="text-right py-3 px-4 font-semibold text-[#8BAE5A]">Open Rate</th>
                  <th className="text-right py-3 px-4 font-semibold text-[#8BAE5A]">Click Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#8BAE5A]">Datum</th>
                  <th className="text-center py-3 px-4 font-semibold text-[#8BAE5A]">Acties</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((campaign) => (
                  <tr key={campaign.campaign_id} className="border-b border-[#232D1A] hover:bg-[#232D1A]/50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-white">{campaign.campaign_name}</div>
                        <div className="text-sm text-gray-400">{campaign.subject}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'completed' ? 'bg-green-900/20 text-green-400' :
                        campaign.status === 'active' ? 'bg-blue-900/20 text-blue-400' :
                        'bg-gray-900/20 text-gray-400'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-white">{campaign.sent_count}</td>
                    <td className="py-3 px-4 text-right text-white">{campaign.open_count}</td>
                    <td className="py-3 px-4 text-right text-white">{campaign.click_count}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${
                        campaign.open_rate > 25 ? 'text-green-400' :
                        campaign.open_rate > 15 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {campaign.open_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${
                        campaign.click_rate > 5 ? 'text-green-400' :
                        campaign.click_rate > 2 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {campaign.click_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {formatDate(campaign.created_at)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedCampaign(campaign.campaign_id)}
                        className="text-[#8BAE5A] hover:text-white transition-colors"
                        title="Bekijk details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {analytics.length === 0 && (
              <div className="text-center py-8">
                <EnvelopeIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nog geen email campagnes gevonden</p>
              </div>
            )}
          </div>
        </AdminCard>

        {/* Detailed Tracking */}
        {selectedCampaign && (
          <AdminCard 
            title="Gedetailleerde Tracking" 
            icon={<UserGroupIcon className="w-6 h-6" />}
            onClose={() => setSelectedCampaign(null)}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#3A4D23]">
                    <th className="text-left py-3 px-4 font-semibold text-[#8BAE5A]">Ontvanger</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#8BAE5A]">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#8BAE5A]">Verzonden</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#8BAE5A]">Geopend</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#8BAE5A]">Geklikt</th>
                  </tr>
                </thead>
                <tbody>
                  {tracking.map((track) => (
                    <tr key={track.tracking_id} className="border-b border-[#232D1A] hover:bg-[#232D1A]/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">{track.recipient_name}</div>
                          <div className="text-sm text-gray-400">{track.recipient_email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center gap-2 ${getStatusColor(track.status)}`}>
                          {getStatusIcon(track.status)}
                          <span className="capitalize">{track.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {track.sent_at ? formatDate(track.sent_at) : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {track.opened_at ? formatDate(track.opened_at) : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {track.clicked_at ? formatDate(track.clicked_at) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {tracking.length === 0 && (
                <div className="text-center py-8">
                  <UserGroupIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Geen tracking data beschikbaar</p>
                </div>
              )}
            </div>
          </AdminCard>
        )}
      </div>
    </div>
  );
}
